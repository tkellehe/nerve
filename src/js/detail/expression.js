//************************************************************************************************************
// No values => once number of neurons is known as input layer it will construct properly.
// One value => number of weights (all initialized to one and bias is set to zero)
// Two or more => Last value is the bias all others are the weights.
const NeuronExpression = function() {
    let self = this;
    if(arguments.length === 1) {
        self.num_inputs = arguments[0];
        self.weights = undefined;
        self.bias = 0;
    } else if(arguments.length === 0) {
        self.num_inputs = undefined;
        self.weights = undefined;
        self.bias = 0;
    } else {
        self.num_inputs = --arguments.length;
        self.weights = [...arguments];
        self.bias = arguments[arguments.length];
        self.is_randomized = false;
    }

    //--------------------------------------------------------------------------------------------------------
    self.randomize = function(is_randomized) {
        if(this.is_randomized === undefined) {
            this.is_randomized = is_randomized || (arguments.length === 0);
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(num_inputs) {
        if(this.num_inputs === undefined) {
            this.num_inputs = num_inputs;
        } else if(num_inputs !== undefined && num_inputs !== self.num_inputs) {
            throw new Error("Number of inputs does not match how this node was created.");
        }
        num_inputs = this.num_inputs;
        if(num_inputs === undefined) {
            throw new Error("Number of inputs must be provided for a neuron to create the correct number of weights.");
        }
        if(this.weights === undefined) {
            tf.tidy(() => {
                if(self.is_randomized) {
                    self.weights = tf.randomUniform([num_inputs]).dataSync();
                    self.bias = tf.randomUniform([1]).dataSync()[0];
                } else {
                    self.weights = tf.ones([num_inputs]).dataSync();
                }
            });
        }
        return this;
    }
}

//************************************************************************************************************
const LayerExpression = function() {
    let self = this;
    self.is_randomized = false;
    if(typeof arguments[arguments.length-1] === 'string') {
        self.__activation = arguments[--arguments.length];
    }
    if(arguments.length === 1 && typeof arguments[0] === 'number') {
        let count = arguments[0];
        const generate = function*() { while(count--) yield new NeuronExpression() }
        self.neuronexprs = [...generate()];
    } else if(arguments.length > 1 && typeof arguments[0] === 'number') {
        let num_neurons = arguments[1];
        self.num_inputs = arguments[0];
        const args = arguments;
        let offset = 2;
        const max_w = offset + self.num_inputs*num_neurons;
        const max_b = max_w + num_neurons;
        const fetchWeights = function*() { while(offset < max_w) { yield args[offset]; ++offset; } }
        const fetchBiases = function*() { while(offset < max_b) { yield args[offset]; ++offset; } }
        self.neuron_weights_buffer = [...fetchWeights()];
        self.neuron_biases_buffer = [...fetchBiases()];
        self.neuronexprs = [];
    } else {
        self.neuronexprs = [...arguments];
    }

    //--------------------------------------------------------------------------------------------------------
    self.add_neuron = function() {
        this.neuronexprs.push(new (Function.prototype.bind.apply(NeuronExpression,
                                                                 [NeuronExpression, ...arguments])));
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.activation = function(activation) {
        // 'elu'|'hardSigmoid'|'linear'|'relu'|'relu6'| 'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'
        if(this.__activation === undefined) {
            this.__activation = activation;
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.neurons = function(count) {
        if(this.neuronexprs.length === 0 && self.neuron_weights_buffer === undefined && self.neuron_biases_buffer === undefined) {
            while(count--) self.neuronexprs.push(new NeuronExpression());
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.randomize = function(count) {
        if(typeof count === 'number') {
            if(this.neuronexprs.length === 0 && self.neuron_weights_buffer === undefined && self.neuron_biases_buffer === undefined) {
                while(count--) self.neuronexprs.push((new NeuronExpression()).randomize());
            } else if(this.neuronexprs.length > 0) {
                for(let i = 0, l = this.neuronexprs.length; i < l; ++i) {
                    self.neuronexprs[i].randomize();
                }
            }
        }
        this.is_randomized = true;
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(input_layer) {
        let num_inputs;
        if(typeof input_layer === 'number') {
            num_inputs = input_layer;
            input_layer = undefined;
        } else {
            num_inputs = input_layer.get_num_outputs();
        }
        if(this.num_inputs === undefined) {
            this.num_inputs = num_inputs;
        } else if(this.num_inputs !== num_inputs) {
            throw new Error("Number of inputs does not match how this layer was created.");
        }
        let neuron_weights_buffer;
        let neuron_biases_buffer;
        if(this.neuron_weights_buffer !== undefined) {
            neuron_weights_buffer = this.neuron_weights_buffer;
            neuron_biases_buffer = this.neuron_biases_buffer;
        } else {
            neuron_weights_buffer = [];
            neuron_biases_buffer = [];
        }
        for(let i = 0, l = this.neuronexprs.length; i < l; ++i) {
            let neuron = this.neuronexprs[i];
            neuron.randomize(this.is_randomized).finalize(this.num_inputs);
            extendArray(neuron_weights_buffer, neuron.weights);
            neuron_biases_buffer.push(neuron.bias);
        }
        let weights;
        let biases;
        tf.tidy(() => {
            weights = tf.variable(tf.tensor(neuron_weights_buffer, [this.num_inputs, neuron_biases_buffer.length]));
            biases = tf.variable(tf.tensor(neuron_biases_buffer, [neuron_biases_buffer.length]));
        });
        return new Layer(weights, biases, this.__activation, input_layer);
    }
}

//************************************************************************************************************
const DataLayerExpression = function(num_inputs, num_neurons, activation) {
    let self = this;
    self.num_inputs = num_inputs;
    self.num_neurons = num_neurons;
    self.__activation = activation;

    //--------------------------------------------------------------------------------------------------------
    self.add_neuron = function() {
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.activation = function(activation) {
        if(this.__activation === undefined) {
            this.__activation = activation;
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.neurons = function(count) {
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.randomize = function(count) {
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(input_layer) {
        let total = (this.num_inputs * this.num_neurons) + this.num_neurons;
        function*unpack() { while(total--) yield global_network_memory_get_number() }
        return (new LayerExpression(this.num_inputs, this.num_neurons, ...unpack())).activation(this.__activation).finalize(input_layer);
    }
}

//************************************************************************************************************
const LayersExpression = function() {
    let self = this;
    if(typeof arguments[arguments.length-1] === 'string') {
        self.default_activation = arguments[--arguments.length];
    }
    let __layerexps = [...arguments];
    self.layerexps = __layerexps;

    //--------------------------------------------------------------------------------------------------------
    self.add_layerexpr = function(layerexp) {
        __layerexps.push(layerexp);
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(max_input_length, last_num_outputs) {
        let unwrap = function*() {
            let layerexps = __layerexps;
            if(layerexps.length === 0) return;
            let layer = layerexps[0].activation(self.default_activation).neurons(max_input_length).finalize(max_input_length);
            yield layer;
            for(let i = 1, l = layerexps.length; i < l; ++i) {
                layer = layerexps[i].activation(self.default_activation).neurons(last_num_outputs).finalize(layer);
                yield layer;
            }
        }
        let layers = new Layers();
        layers.layers.push(...unwrap());
        if(layers.layers.length === 0) {
            layers.layers.push((new LayerExpression(last_num_outputs)).activation(self.default_activation).finalize(max_input_length));
        } else {
            let last = layers.layers[layers.layers.length-1];
            if(last.get_num_outputs() !== last_num_outputs) {
                layers.layers.push((new LayerExpression(last_num_outputs)).activation(self.default_activation).finalize(last));
            }
        }
        return layers;
    }
}

//************************************************************************************************************
const BitCollectorExpression = function() {
    let self = this;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        return new BitCollector(offset, offset+7);
    }
}

//************************************************************************************************************
const ExactCollectorExpression = function() {
    let self = this;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        return new ExactCollector(offset, offset);
    }
}

//************************************************************************************************************
const SwitchCollectorExpression = function(mapping) {
    let self = this;
    self.mapping = mapping;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        return new SwitchCollector(offset, offset+this.mapping.length-1, this.mapping);
    }
}

//************************************************************************************************************
const ValueCollectorExpression = function(mapping) {
    let self = this;
    self.mapping = mapping;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        return new ValueCollector(offset, offset, this.mapping);
    }
}

//************************************************************************************************************
const ScaleCollectorExpression = function(high, low) {
    let self = this;
    if(high === undefined || low === undefined) {
        self.high = scale_collector_default_high;
        self.low = scale_collector_default_low;
    } else {
        self.high = high;
        self.low = low;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        return new ScaleCollector(offset, offset, self.high, self.low);
    }
}

//************************************************************************************************************
const DataSwitchCollectorExpression = function(length) {
    let self = this;
    self.length = length;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        let mapping = global_network_memory_get_string(this.length);
        return new SwitchCollector(offset, offset+mapping.length-1, mapping);
    }
}

//************************************************************************************************************
const DataValueCollectorExpression = function(length) {
    let self = this;
    self.length = length;
    
    //--------------------------------------------------------------------------------------------------------
    self.expression = expression;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        let mapping = global_network_memory_get_string(this.length);
        return new ValueCollector(offset, offset, mapping);
    }
}

//************************************************************************************************************
const CollectorsExpression = function() {
    let self = this;
    self.collectors = [...arguments];
    self.default_collector_type = SwitchCollectorExpression;
    self.__padding = collector_default_padding;
    self.__null_string = "";
    self.__one = collector_default_one;
    self.__zero = collector_default_zero;
    self.__offset = collector_default_offset;

    //--------------------------------------------------------------------------------------------------------
    self.bit_type = function() {
        this.default_collector_type = BitCollectorExpression;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.switch_type = function() {
        this.default_collector_type = SwitchCollectorExpression;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.value_type = function() {
        this.default_collector_type = ValueCollectorExpression;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.exact_type = function() {
        this.default_collector_type = ExactCollectorExpression;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.scale_type = function() {
        this.default_collector_type = ScaleCollectorExpression;
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.padding = function(padding=collector_default_padding) {
        this.__padding = padding;
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.null = function(value='') {
        this.__null_string = value;
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.one = function(value=collector_default_one) {
        this.__one = value;
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.zero = function(value=collector_default_zero) {
        this.__zero = value;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.offset = function(value=collector_default_offset) {
        this.__offset = value;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        let r = new Array(this.collectors.length+1);
        r[0] = Collectors;
        let index = 1;
        let offset = 0;
        let CollectorType = this.default_collector_type;
        if(self.collectors.length === 0) {
            self.collectors.push(new ExactCollectorExpression());
        }
        let result = new (
            Function.prototype.bind.apply(
               Collectors, 
               self.collectors.reduce(function(a, expr) {
                   if(typeof expr === 'string') expr = new CollectorType(expr);
                   r[index] = expr.finalize(offset);
                   offset += r[index++].size();
                   return a }, r)));
        result.padding = self.__padding;
        result.one = self.__one;
        result.zero = self.__zero;
        result.offset = self.__offset;
        if(self.__null_string.length) {
            result.null_string = self.__null_string;
            result.null = new RegExp(escapeRegExp(self.__null_string), "g");
        }
        return result;
    }
}

//************************************************************************************************************
const NetworkExpression = function(inputexpr, layersexpr, outputexpr) {
    let self = this;
    self.layersexpr = layersexpr;
    self.inputexpr = inputexpr;
    self.outputexpr = outputexpr;
    self.info = {
        optimizer : { },
        loss : { },
        num_batches : 1,
        is_training : false,
        is_trainable : true,
        memory : "",
        networks : []
    };
    
    //--------------------------------------------------------------------------------------------------------
    self.loss = {
        absoluteDifference : function() { self.info.loss.name = 'absoluteDifference'; self.info.loss.args = []; return self; },
        cosineDistance : function(axis=0) { self.info.loss.name = 'cosineDistance'; self.info.loss.args = [axis]; return self; },
        hingeLoss : function() { self.info.loss.name = 'hingeLoss'; self.info.loss.args = []; return self; },
        huberLoss : function() { self.info.loss.name = 'huberLoss'; self.info.loss.args = []; return self; },
        logLoss : function() { self.info.loss.name = 'logLoss'; self.info.loss.args = []; return self; },
        meanSquaredError : function() { self.info.loss.name = 'meanSquaredError'; self.info.loss.args = []; return self; }
    };
    
    //--------------------------------------------------------------------------------------------------------
    self.optimizer = {
        sgd : function(learning_rate=0.001) {
            self.info.optimizer.name = 'sgd';
            self.info.optimizer.args = [learning_rate];
            return self;
        },
        momentum : function(learning_rate=0.001, momentum=0.01, use_nesterov=false) {
            self.info.optimizer.name = 'momentum';
            self.info.optimizer.args = [learning_rate, momentum, use_nesterov]
            return self;
        },
        adagrad : function(learning_rate=0.001, initial_accumulator_value=0) {
            self.info.optimizer.name = 'adagrad';
            self.info.optimizer.args = [learning_rate, initial_accumulator_value]
            return self;
        },
        adadelta : function(learning_rate=0.001, rho=0, espilon=0) {
            self.info.optimizer.name = 'adadelta';
            self.info.optimizer.args = [learning_rate, rho, espilon]
            return self;
        },
        adam : function(learning_rate=0.001, beta1=0, beta2=0, epsilon=0) {
            self.info.optimizer.name = 'adam';
            self.info.optimizer.args = [learning_rate, beta1, beta2, epsilon]
            return self;
        },
        adamax : function(learning_rate=0.001, beta1=0, beta2=0, epsilon=0, decay=0) {
            self.info.optimizer.name = 'adamax';
            self.info.optimizer.args = [learning_rate, beta1, beta2, epsilon, decay]
            return self;
        },
        rmsprop : function(learning_rate=0.001, decay=0, momentum=0.01, epsilon=0, centered=false) {
            self.info.optimizer.name = 'rmsprop';
            self.info.optimizer.args = [learning_rate, decay, momentum, epsilon, centered]
            return self;
        }
    };

    //--------------------------------------------------------------------------------------------------------
    self.input = function() {
        let inputs = [...arguments];
        if(this.info.inputs === undefined) {
            this.info.inputs = [];
        }
        extendArray(this.info.inputs, inputs);
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.expected = function() {
        let expecteds = [...arguments];
        if(this.info.expecteds === undefined) {
            this.info.expecteds = [];
        }
        extendArray(this.info.expecteds, expecteds);
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.train = function(is_training=true) {
        this.info.is_training = is_training;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.batches = function(num_batches=1) {
        this.info.num_batches = num_batches;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.shuffle = function(is_shuffling_data=true) {
        this.info.is_shuffling_data = is_shuffling_data;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.untrainable = function(is_untrainable=true) {
        this.info.is_trainable = !is_untrainable;
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.compress = function(is_compressed=true) {
        expression.compress(is_compressed);
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.nocompress = function(is_not_compressed=true) {
        expression.nocompress(is_not_compressed);
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.offset = function() {
        this.inputexpr.offset(...arguments);
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.memory = function(string) {
        this.info.memory += string;
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = async () => {
        expression.memory(self.info.memory);
        
        let inputs = self.inputexpr.finalize();
        let outputs = self.outputexpr.finalize();
        let layers = self.layersexpr.finalize(inputs.size(), outputs.size());
        
        if(self.info.is_training) {
            if(self.info.optimizer.name === undefined) {
                self.optimizer.sgd();
            }
            if(self.info.loss.name === undefined) {
                self.loss.meanSquaredError();
            }
        }
        
        let network = new Network(inputs, layers, outputs, self.info);
        if(self.info.inputs !== undefined) {
            if(!(self.info.inputs instanceof tf.data.Dataset)) {
                self.info.tf_inputs = tf.data.array(self.info.inputs);
            } else {
                self.info.tf_inputs = self.info.inputs;
                if(self.info.expecteds !== undefined) {
                    self.info.inputs = await self.info.tf_inputs.toArray();
                }
            }
        }
        let output = self.info.tf_inputs === undefined ? [] : new Array(self.info.tf_inputs.size);
        let num_passed = 0;
        let is_learning = false;
        let is_checking = false;
        
        if(this.info.expecteds !== undefined && self.info.inputs !== undefined && self.info.is_training) {
            is_learning = true;
            if(this.info.expecteds.length !== self.info.inputs.length) {
                throw new Error("The inputs provided cannot be mapped to the expected results provided.");
            }
            let error = undefined;
            await network.batch(
                self.info.inputs,
                self.info.expecteds,
                self.info.num_batches,
                self.info.is_shuffling_data
            ).catch((e) => { error = e });
            if (error !== undefined) {
                throw error;
            }
        }
        
        if(self.info.inputs !== undefined) {
            let index = 0;
            if(self.info.expecteds === undefined || self.info.expecteds.length !== self.info.inputs.length) {
                await self.info.tf_inputs.forEachAsync((input) => {
                    output[index++] = network.predict(input);
                });
            } else {
                is_checking = true;
                await self.info.tf_inputs.forEachAsync((input) => {
                    let prediction = network.predict(input);
                    if(prediction === self.info.expecteds[index]) ++num_passed;
                    output[index++] = prediction;
                });
            }
        }
        return {
            network:network,
            output:output,
            is_checking:is_checking,
            is_learning:is_learning,
            num_passed:num_passed,
            total:output.length
        };
    }
}

//************************************************************************************************************
var expression = {}

//************************************************************************************************************
expression.memory = function() {
    global_network_memory_add(...arguments);
    return expression;
}

//************************************************************************************************************
expression.compress = function(is_compressed=true) {
    global_network_expression_compression = is_compressed;
    return expression;
}

//************************************************************************************************************
expression.nocompress = function(is_not_compressed=true) {
    global_network_expression_compression = !is_not_compressed;
    return expression;
}

//************************************************************************************************************
expression.neuron = function() { return new (Function.prototype.bind.apply(NeuronExpression,
                                                                           [NeuronExpression, ...arguments])) }

//************************************************************************************************************
expression.layer = function() { return new (Function.prototype.bind.apply(LayerExpression,
                                                                          [LayerExpression, ...arguments])) }

//************************************************************************************************************
expression.layer.data = function() { return new (Function.prototype.bind.apply(DataLayerExpression,
                                                                               [DataLayerExpression, ...arguments])) }

//************************************************************************************************************
expression.layer.random = function(count, activation) {
    if(typeof count === 'number') {
        return (new LayerExpression()).randomize(count).activation(activation);
    } else if(typeof count === 'string') {
        return (new LayerExpression()).randomize().activation(count);
    } else {
        return (new LayerExpression()).randomize();
    }
}

//************************************************************************************************************
expression.layers = function() { return new (Function.prototype.bind.apply(LayersExpression,
                                                                           [LayersExpression, ...arguments])) }

//************************************************************************************************************
expression.bitchar = function() { return new (Function.prototype.bind.apply(BitCollectorExpression,
                                                                            [BitCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.exactchar = function() { return new (Function.prototype.bind.apply(ExactCollectorExpression,
                                                                              [ExactCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.switchchar = function() { return new (Function.prototype.bind.apply(SwitchCollectorExpression,
                                                                               [SwitchCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.switchchar.data = function() { return new (Function.prototype.bind.apply(DataSwitchCollectorExpression,
                                                                                   [DataSwitchCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.valuechar = function() { return new (Function.prototype.bind.apply(ValueCollectorExpression,
                                                                              [ValueCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.valuechar.data = function() { return new (Function.prototype.bind.apply(DataValueCollectorExpression,
                                                                                   [DataValueCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.scalechar = function() { return new (Function.prototype.bind.apply(ScaleCollectorExpression,
                                                                              [ScaleCollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.mapping = function() { return new (Function.prototype.bind.apply(CollectorsExpression,
                                                                            [CollectorsExpression, ...arguments])) }

//************************************************************************************************************
expression.network = function() { return new (Function.prototype.bind.apply(NetworkExpression,
                                                                            [NetworkExpression, ...arguments])) }

//************************************************************************************************************
expression.number = function(input) {
    if(typeof input === 'number') return input;
    if(typeof input === 'string') return number_decode(input);
    return input;
}

//************************************************************************************************************
expression.string = function(input) {
    return unescape(input);
}

expression.string.any = collector_shortcuts_any;
expression.string.digits = collector_shortcuts_digits;
expression.string.alphabet = collector_shortcuts_alphabet;
expression.string.ALPHABET = collector_shortcuts_ALPHABET;
expression.string.printable = collector_shortcuts_printable;

//************************************************************************************************************
const expression_scope_prefix = (function(){
    let output = "";
    let keys = Object.keys(expression);
    for(let i = 0, l = keys.length; i < l; ++i) {
        output += "let " + keys[i] + " = expression." + keys[i] + ";";
    }
    return output;
})();
