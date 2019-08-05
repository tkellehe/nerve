//************************************************************************************************************
const Layer = function(weights, biases, input_layer) {
    let self = this;
    self.weights = weights;
    self.biases = biases;
    self.input_layer = input_layer;
    if (input_layer !== undefined) {
        input_layer.output_layer = self;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return self.weights.num_rows;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return self.weights.num_columns;
    }
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
        if(self.num_inputs === undefined) {
            self.num_inputs = num_inputs;
        } else if(num_inputs !== undefined) {
            throw Error("Number of inputs does not match how this node was created.");
        }
        if(self.weights === undefined) {
            self.weights = [...makeArrayAllOnesHelper(self.num_inputs)];
        }
        return this;
    }
}

//************************************************************************************************************
const LayerExpression = function() {
    let self = this;
    if(arguments.length === 1 && typeof arguments[0] === 'number') {
        function*generate() { for(let i = arguments[0]; i--;) yield new NeuronExpression() }
        self.neuronexprs = [...generate()];
    } else {
        self.neuronexprs = [...arguments];
    }

    //--------------------------------------------------------------------------------------------------------
    self.add_neuron = function() {
        self.neuronexprs.push(new (Function.prototype.bind.apply(NeuronExpression,
                                                                 [NeuronExpression, ...arguments])));
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(input_layer) {
        if(typeof input_layer === 'number') {
            self.num_inputs = input_layer;
            input_layer = undefined;
        } else {
            self.num_inputs = input_layer.get_num_outputs();
        }
        let neuron_weights_buffer = [];
        let neuron_biases_buffer = [];
        for(let i = 0, l = self.neuronexprs.length; i < l; ++i) {
            let neuron = self.neuronexprs[i];
            neuron.finalize(self.num_inputs);
            extendArray(neuron_weights_buffer, neuron.weights);
            neuron_biases_buffer.push(neuron.bias);
        }
        let weights = new Matrix(new Float64Array(neuron_weights_buffer),
                                 self.num_inputs,
                                 self.neuronexprs.length);
        let biases = new Matrix(new Float64Array(neuron_biases_buffer),
                                1,
                                self.neuronexprs.length);
        return new Layer(weights, biases, input_layer);
    }
}

//************************************************************************************************************
const Layers = function() {
    let self = this;
    let __layers = [...arguments];
    self.layers = __layers;

    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return __layers[0].get_num_inputs();
    }

    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return __layers[__layers.length-1].get_num_outputs();
    }

    //--------------------------------------------------------------------------------------------------------
    self.feedforward = function(matrix) {
        let layers = __layers;
        for(let i = 0, l = layers.length; i < l; ++i) {
            let layer = layers[i];
            matrix = layer.weights.multiply(matrix).opt_iadd(layer.biases).ReLU();
        }
        return matrix;
    }

    //--------------------------------------------------------------------------------------------------------
    self.backpropagation = function() {

    }
}

//************************************************************************************************************
const LayersExpression = function() {
    let self = this;
    let __layerexps = [...arguments];
    self.layerexps = __layerexps;

    //--------------------------------------------------------------------------------------------------------
    self.add_layerexpr = function(layerexp) {
        __layerexps.push(layerexp);
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(max_input_length) {
        let unwrap = function*() {
            let layerexps = __layerexps;
            let layer = layerexps[0].finalize(max_input_length);
            yield layer;
            for(let i = 1, l = layerexps.length; i < l; ++i) {
                layer = layerexps[i].finalize(layer);
                yield layer;
            }
        }
        let layers = new Layers();
        layers.layers.push(...unwrap());
        return layers;
    }
}
