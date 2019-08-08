//************************************************************************************************************
const isLittleEndian = ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201)
const isBigEndian = !isLittleEndian;

const number_encode = function(number) {
    if(Number.isNaN(number)) return NaN;
    let float32 = new Float32Array([number]);
    let uint8 = new Uint8Array(float32.buffer, 0, 4);
    if(isBigEndian) {
        uint8.reverse();
    }
    return escape(String.fromCharCode.apply(null, uint8));
}
const number_decode = function(string) {
    let uint8 = new Uint8Array(network_string_unfold(unescape(string)));
    if(isBigEndian) {
        uint8.reverse();
    }
    return (new Float32Array(uint8.buffer, 0, 1))[0];
}
const number_encode_for_output = function(number) {
    if(Number.isNaN(number)) return "NaN";
    return "expression.number(\"" + number_encode(number) + "\")"
}
const number_encode_array_for_output = function(array) {
    let output = number_encode_for_output(array[0]);
    for(let i = 1, l = array.length; i < l; ++i) {
        output += "," + number_encode_for_output(array[i]);
    }
    return output;
}

//************************************************************************************************************
const extendArray = function(a, b) {
    for(let i = 0, l = b.length; i < l; ++i) {
        a.push(b[i]);
    }
}

//************************************************************************************************************
const Layer = function(weights, biases, activation, input_layer) {
    let self = this;
    self.weights = weights;
    self.biases = biases;
    self.activation = activation;
    self.input_layer = input_layer;
    if (input_layer !== undefined) {
        input_layer.output_layer = self;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return this.weights.shape[0];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return this.weights.shape[1];
    }
    
    //--------------------------------------------------------------------------------------------------------
    if(activation === undefined) {
        self.activate = function(input) {
            return input.matMul(this.weights).add(this.biases);
        }
    } else {
        self.activate = function(input) {
            return input.matMul(this.weights)[this.activation]().add(this.biases);
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.layer(" +
            this.get_num_outputs() + "," +
            this.get_num_inputs() + "," +
            number_encode_array_for_output(weights.dataSync()) + "," +
            number_encode_array_for_output(biases.dataSync()) + ")";
    }
    self.toString = self.to_expression;
}

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
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(num_inputs) {
        if(this.num_inputs === undefined) {
            this.num_inputs = num_inputs;
        } else if(num_inputs !== undefined && num_inputs !== self.num_inputs) {
            throw new Error("Number of inputs does not match how this node was created.");
        }
        if(this.weights === undefined) {
            this.weights = tf.ones([num_inputs]).dataSync();
        }
        return this;
    }
}

//************************************************************************************************************
const LayerExpression = function() {
    let self = this;
    if(typeof arguments[arguments.length-1] === 'string') {
        self.activation = arguments[--arguments.length];
    }
    if(arguments.length === 1 && typeof arguments[0] === 'number') {
        let count = arguments[0];
        const generate = function*() { while(count--) yield new NeuronExpression() }
        self.neuronexprs = [...generate()];
    } else if(arguments.length > 1 && typeof arguments[0] === 'number') {
        let num_neurons = arguments[0];
        self.num_inputs = arguments[1];
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
        if(this.activation === undefined) {
            this.activation = activation;
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.neurons = function(count) {
        if(this.neuronexprs === undefined) {
            const generate = function*() { while(count--) yield new NeuronExpression() }
            self.neuronexprs = [...generate()];
        }
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
            neuron.finalize(this.num_inputs);
            extendArray(neuron_weights_buffer, neuron.weights);
            neuron_biases_buffer.push(neuron.bias);
        }
        let weights = tf.variable(tf.tensor(neuron_weights_buffer, [this.num_inputs, neuron_biases_buffer.length]));
        let biases = tf.variable(tf.tensor(neuron_biases_buffer,[neuron_biases_buffer.length]));
        return new Layer(weights, biases, this.activation, input_layer);
    }
}

//************************************************************************************************************
const Layers = function() {
    let self = this;
    let __layers = [...arguments];
    self.layers = __layers;
    self.optimizer = undefined;
    self.loss = undefined;

    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return __layers[0].get_num_inputs();
    }

    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return __layers[__layers.length-1].get_num_outputs();
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.layers(" + __layers.join() + ")";
    }
    self.toString = self.to_expression;

    //--------------------------------------------------------------------------------------------------------
    self.predict = function(input) {
        let layers = __layers;
        for(let i = 0, l = layers.length; i < l; ++i) {
            input = layers[i].activate(input);
        }
        return input;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.learn = function(input, expected) {
        this.optimizer.minimize(() => {
            const prediction = this.predict(input);
            const loss = this.loss(expected, prediction);
            return loss;
        });
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
            let layer = layerexps[0].activation(self.default_activation).neurons(last_num_outputs).finalize(max_input_length);
            yield layer;
            for(let i = 1, l = layerexps.length; i < l; ++i) {
                layer = layerexps[i].activation(self.default_activation).neurons(last_num_outputs).finalize(layer);
                yield layer;
            }
        }
        let layers = new Layers();
        layers.layers.push(...unwrap());
        if(layers.layers.length === 0) {
            layers.layers.push((new LayerExpression(last_num_outputs, self.default_activation)).finalize(max_input_length));
        } else {
            let last = layers.layers[layers.layers.length-1];
            if(last.get_num_outputs() !== last_num_outputs) {
                layers.layers.push((new LayerExpression(last_num_outputs, self.default_activation)).finalize(last));
            }
        }
        return layers;
    }
}

//************************************************************************************************************
const default_collector_mapping = [
    '\u0000', '\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007',
    '\u0008', '\u0009', '\u000a', '\u000b', '\u000c', '\u000d', '\u000e', '\u000f',
    '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017',
    '\u0018', '\u0019', '\u001a', '\u001b', '\u001c', '\u001d', '\u001e', '\u001f',
    '\u0020', '\u0021', '\u0022', '\u0023', '\u0024', '\u0025', '\u0026', '\u0027',
    '\u0028', '\u0029', '\u002a', '\u002b', '\u002c', '\u002d', '\u002e', '\u002f',
    '\u0030', '\u0031', '\u0032', '\u0033', '\u0034', '\u0035', '\u0036', '\u0037',
    '\u0038', '\u0039', '\u003a', '\u003b', '\u003c', '\u003d', '\u003e', '\u003f',
    '\u0040', '\u0041', '\u0042', '\u0043', '\u0044', '\u0045', '\u0046', '\u0047',
    '\u0048', '\u0049', '\u004a', '\u004b', '\u004c', '\u004d', '\u004e', '\u004f',
    '\u0050', '\u0051', '\u0052', '\u0053', '\u0054', '\u0055', '\u0056', '\u0057',
    '\u0058', '\u0059', '\u005a', '\u005b', '\u005c', '\u005d', '\u005e', '\u005f',
    '\u0060', '\u0061', '\u0062', '\u0063', '\u0064', '\u0065', '\u0066', '\u0067',
    '\u0068', '\u0069', '\u006a', '\u006b', '\u006c', '\u006d', '\u006e', '\u006f',
    '\u0070', '\u0071', '\u0072', '\u0073', '\u0074', '\u0075', '\u0076', '\u0077',
    '\u0078', '\u0079', '\u007a', '\u007b', '\u007c', '\u007d', '\u007e', '\u007f',
    '\u0080', '\u0081', '\u0082', '\u0083', '\u0084', '\u0085', '\u0086', '\u0087',
    '\u0088', '\u0089', '\u008a', '\u008b', '\u008c', '\u008d', '\u008e', '\u008f',
    '\u0090', '\u0091', '\u0092', '\u0093', '\u0094', '\u0095', '\u0096', '\u0097',
    '\u0098', '\u0099', '\u009a', '\u009b', '\u009c', '\u009d', '\u009e', '\u009f',
    '\u00a0', '\u00a1', '\u00a2', '\u00a3', '\u00a4', '\u00a5', '\u00a6', '\u00a7',
    '\u00a8', '\u00a9', '\u00aa', '\u00ab', '\u00ac', '\u00ad', '\u00ae', '\u00af',
    '\u00b0', '\u00b1', '\u00b2', '\u00b3', '\u00b4', '\u00b5', '\u00b6', '\u00b7',
    '\u00b8', '\u00b9', '\u00ba', '\u00bb', '\u00bc', '\u00bd', '\u00be', '\u00bf',
    '\u00c0', '\u00c1', '\u00c2', '\u00c3', '\u00c4', '\u00c5', '\u00c6', '\u00c7',
    '\u00c8', '\u00c9', '\u00ca', '\u00cb', '\u00cc', '\u00cd', '\u00ce', '\u00cf',
    '\u00d0', '\u00d1', '\u00d2', '\u00d3', '\u00d4', '\u00d5', '\u00d6', '\u00d7',
    '\u00d8', '\u00d9', '\u00da', '\u00db', '\u00dc', '\u00dd', '\u00de', '\u00df',
    '\u00e0', '\u00e1', '\u00e2', '\u00e3', '\u00e4', '\u00e5', '\u00e6', '\u00e7',
    '\u00e8', '\u00e9', '\u00ea', '\u00eb', '\u00ec', '\u00ed', '\u00ee', '\u00ef',
    '\u00f0', '\u00f1', '\u00f2', '\u00f3', '\u00f4', '\u00f5', '\u00f6', '\u00f7',
    '\u00f8', '\u00f9', '\u00fa', '\u00fb', '\u00fc', '\u00fd', '\u00fe', '\u00ff'
];
const Collector = function(begin, end, mapping) {
    if(mapping === undefined) {
        mapping = default_collector_mapping;
    }
    if(typeof mapping === 'string') {
        mapping = [...mapping];
    }
    let self = this;
    self.mapping = mapping;
    let index = 0;
    self.unmapping =  mapping.reduce((o, key) => Object.assign(o, {[key]: index++}), {});
    self.begin = begin;
    self.end = end;
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return end - begin + 1;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        let begin = self.begin;
        let end = self.end;
        let highest_index = begin;
        let highest = array[highest_index];
        for(let i = begin+1; i <= end; ++i) {
            let v = array[i];
            if(v > highest) {
                highest_index = i;
            }
        }
        return self.mapping[highest_index-begin];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string) {
        let index = self.unmapping[string];
        return self.begin + index;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.collector(\"" + self.mapping.reduce((s,v) => s+v, "") + "\")";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const Collectors = function() {
    let self = this;
    let __collectors = [...arguments];
    self.collectors = __collectors;
    self.__size = 0;
    for(let i = 0, l = __collectors.length; i < l; ++i) {
        self.__size += __collectors[i].size();
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function(array) {
        return this.__size;
    }

    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        return this.collectors.reduce(function(string, collector) { return string+collector.collect(array) }, "");
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string, no, yes) {
        let r = new Array(__collectors.length);
        let size = this.__size;
        for(let i = 0, l = __collectors.length; i < l; ++i) {
            r[i] = __collectors[i].uncollect(string.substr(i, 1));
        }
        let zeros;
        if(no === 0) {
            zeros = tf.zeros([size]).dataSync();
        } else {
            zeros = tf.fill([size], no).dataSync();
        }
        for(let i = 0, l = r.length; i < l; ++i) {
            zeros[r[i]] = yes;
        }
        return zeros;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.collectors(" + __collectors.join() + ")";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const network_string_clense = function(string, max) {
    if(string.length > max) {
        string = string.substr(0, max);
    }
    return string.padEnd(max, ' ');
}
const network_string_unfold = function*(string) {
    for(let i = 0, l = string.length; i < l; ++i) yield string.charCodeAt(i);
}
const network_string_to_tf_array = function(string) {
    return tf.tensor([[...network_string_unfold(string)]]);
}
const Network = function(layers, collectors) {
    let self = this;
    self.layers = layers;
    self.collectors = collectors;
    
    //--------------------------------------------------------------------------------------------------------
    self.predict = function(input) {
        const ins = self.layers.get_num_inputs();
        input = network_string_to_tf_array(network_string_clense(input, ins));
        let output = layers.predict(input);
        return collectors.collect(output.dataSync());
    }

    //--------------------------------------------------------------------------------------------------------
    self.learn = function(input, expected) {
        const outs = self.collectors.size();
        const ins = self.layers.get_num_inputs();
        input = network_string_to_tf_array(network_string_clense(input, ins));
        expected = tf.tensor([this.collectors.uncollect(network_string_clense(expected, outs), 0, 1)]);
        this.layers.learn(input, expected);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.network("+self.layers.get_num_inputs()+","+self.layers+","+self.collectors+","+self.layers.learning_rate+")";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const CollectorExpression = function(mapping) {
    let self = this;
    self.mapping = mapping;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(offset) {
        return new Collector(offset, offset+self.mapping.length-1, self.mapping);
    }
}

//************************************************************************************************************
const CollectorsExpression = function() {
    let self = this;
    self.collectors = [...arguments];
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        let r = new Array(self.collectors.length+1);
        r[0] = Collectors;
        let index = 1;
        let offset = 0;
        return new (
            Function.prototype.bind.apply(
               Collectors, 
               self.collectors.reduce(function(a, expr) {
                   if(typeof expr === 'string') expr = new CollectorExpression(expr);
                   r[index] = expr.finalize(offset);
                   offset += r[index++].size();
                   return a }, r)));
    }
}

//************************************************************************************************************
const NetworkExpression = function(max_input_length, layersexpr, collectorsexpr, learning_rate=0.001) {
    let self = this;
    self.layersexpr = layersexpr;
    self.collectorsexpr = collectorsexpr;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        let collectors = collectorsexpr.finalize();
        let layers = layersexpr.finalize(max_input_length, collectors.size());
        layers.optimizer = tf.train.sgd(learning_rate);
        layers.learning_rate = learning_rate; // temp code until have better control.
        layers.loss = tf.losses['meanSquaredError'];
        return new Network(layers, collectors);
    }
}

//************************************************************************************************************
var expression = {}

//************************************************************************************************************
expression.neuron = function() { return new (Function.prototype.bind.apply(NeuronExpression,
                                                                           [NeuronExpression, ...arguments])) }

//************************************************************************************************************
expression.layer = function() { return new (Function.prototype.bind.apply(LayerExpression,
                                                                          [LayerExpression, ...arguments])) }

//************************************************************************************************************
expression.layers = function() { return new (Function.prototype.bind.apply(LayersExpression,
                                                                           [LayersExpression, ...arguments])) }

//************************************************************************************************************
expression.collector = function() { return new (Function.prototype.bind.apply(CollectorExpression,
                                                                              [CollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.collectors = function() { return new (Function.prototype.bind.apply(CollectorsExpression,
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
// concepts utilize tfjs

async function create(max_input_length, max_output_length) {
    let model = tf.sequential({
        layers: [
            tf.layers.dense(
                {units: 2/*num neurons*/, inputShape:[1],
                 weights:[ tf.variable(tf.tensor([[1, 1]]))/*weights/kernel*/, tf.variable(tf.tensor([0, 0]))/*bias*/ ],
                 activation:'relu' /*'elu'|'hardSigmoid'|'linear'|'relu'|'relu6'|'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'*/
                }),
            tf.layers.dense(
                {units: 2/*num neurons*/,
                 weights:[ tf.variable(tf.tensor([[1, 1], [1, 1]]))/*weights/kernel*/, tf.variable(tf.tensor([0, 0]))/*bias*/ ],
                 activation:'relu' /*'elu'|'hardSigmoid'|'linear'|'relu'|'relu6'|'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'*/
                }),
            tf.layers.dense(
                {units: 4/*num neurons*/,
                 weights:[ tf.variable(tf.tensor([[1, 1, 1, 1], [1, 1, 1, 1]]))/*weights/kernel*/, tf.variable(tf.tensor([0, 0, 0, 0]))/*bias*/ ],
                 activation:'relu' /*'elu'|'hardSigmoid'|'linear'|'relu'|'relu6'|'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'*/
                }),
            tf.layers.dense(
                {units: 1/*num neurons*/,
                 weights:[ tf.variable(tf.tensor([[1], [1], [1], [1]]))/*weights/kernel*/, tf.variable(tf.tensor([0]))/*bias*/ ],
                 activation:'relu' /*'elu'|'hardSigmoid'|'linear'|'relu'|'relu6'|'selu'|'sigmoid'|'softmax'|'softplus'|'softsign'|'tanh'*/
                }),
        ]
    });
    model.predict(tf.tensor1d([1,2,3,4])).print();
    model.compile({optimizer: 'sgd', loss: 'meanSquaredError'});
    for (let i = 1; i < 5 ; ++i) {
      const h = await model.fit(tf.tensor1d([1,2,3,4]), tf.tensor1d([1,2,3,4]), {
          batchSize: 4,
          epochs: 3
      });
      console.log("Loss after Epoch " + i + " : " + h.history.loss[0]);
    }
    return model;
}

// Every time after it is taught, for both of these, it keeps producing NaN...
function create_other(max_input_length, max_output_length) {
    w1 = tf.variable(tf.randomNormal([max_input_length, max_input_length]));
    b1 = tf.variable(tf.randomNormal([max_input_length]));
    w2 = tf.variable(tf.randomNormal([max_input_length, 10]));
    b2 = tf.variable(tf.randomNormal([10]));
    w3 = tf.variable(tf.randomNormal([10, max_output_length]));
    b3 = tf.variable(tf.randomNormal([max_output_length]));

    function model(x) {
      return x.matMul(w1).add(b1).relu().matMul(w2).add(b2).matMul(w3).add(b3).softmax();
    }

    // predict
    model(tf.randomNormal([1, max_input_length])).print(); // tf.tensor([[...]])
    // learn
    optimizer = tf.train.sgd(0.1 /* learning rate */);
    optimizer.minimize(() => {
        const predYs = model(tf.ones([1, max_input_length]));
        // const loss = tf.losses.softmaxCrossEntropy(tf.ones([1, max_output_length]), predYs);
        const loss = tf.losses.meanSquaredError(tf.ones([1, max_output_length]), predYs);
        loss.data().then(l => console.log("Loss", l));
        return loss;
    });
    model(tf.randomNormal([1, max_input_length])).print(); // tf.tensor([[...]])
    return model
}
