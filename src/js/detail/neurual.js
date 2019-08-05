//************************************************************************************************************
const Layer = function(weights, biases, input_layer) {
    let self = this;
    self.weights = weights;
    self.biases = biases;
    self.input_layer = input_layer;
    if (input_layer !== undefined) {
        input_layer.output_layer = self;
    }
}

//************************************************************************************************************
const LayerExpression = function() {
    let self = this;
    self.num_inputs = 0;
    self.neuron_weights_buffer = neuron_weights_buffer = [];
    // Length of biases is the number of neurons.
    self.neuron_biases_buffer = neuron_biases_buffer = [];

    //--------------------------------------------------------------------------------------------------------
    self.add_neuron = function(weights, bias) {
        if(self.num_inputs === 0) {
            self.num_inputs = weights.length;
        } else if(self.num_inputs !== weights.length) {
            throw new Error("New Neuron takes in more inputs than other neurons in this layer.");
        }
        extendArray(neuron_weights_buffer, weights);
        neuron_biases_buffer.push(bias);
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(input_layer) {
        let weights = new Matrix(new Float64Array(neuron_weights_buffer),
                                 self.num_inputs,
                                 neuron_biases_buffer.length);
        let biases = new Matrix(new Float64Array(neuron_biases_buffer),
                                1,
                                neuron_biases_buffer.length);
        return new Layer(weights, biases, input_layer);
    }
}

//************************************************************************************************************
const Layers = function() {
    let self = this;
    self.layers = __layers = [...arguments];

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
    self.layerexps = __layerexps = [...arguments];

    //--------------------------------------------------------------------------------------------------------
    self.add_layerexpr = function(layerexp) {
        __layerexps.push(layerexp);
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        let unwrap = function*() {
            let layerexps = __layerexps;
            let layer = layerexps[0].finalize();
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