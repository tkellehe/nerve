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
            number_encode_array_for_output(biases.dataSync()) +
            (this.activation === undefined ? "" : ",\"" + this.activation + "\"")
            + ")";
    }
    self.toString = self.to_expression;
    
    //--------------------------------------------------------------------------------------------------------
    self.destroy = function() {
        tf.dispose(this.weights);
        tf.dispose(this.biases);
    }
}

//************************************************************************************************************
// [].join() for some reason does not always work for layers.
const layers_to_string = function(layers) {
    let output = layers[0].toString();
    for(let i = 1, l = layers.length; i < l; ++i) {
        output += "," + layers[i].toString();
    }
    return output;
}
const Layers = function() {
    let self = this;
    self.layers = [...arguments];

    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return this.layers[0].get_num_inputs();
    }

    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return this.layers[this.layers.length-1].get_num_outputs();
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.layers(" + layers_to_string(this.layers) + ")";
    }
    self.toString = self.to_expression;

    //--------------------------------------------------------------------------------------------------------
    self.predict = function(input) {
        let layers = this.layers;
        for(let i = 0, l = layers.length; i < l; ++i) {
            input = layers[i].activate(input);
        }
        return input;
    }

    //--------------------------------------------------------------------------------------------------------
    self.destroy = function() {
        let layers = this.layers;
        for(let i = 0, l = layers.length; i < l; ++i) {
            layers[i].destroy();
        }
    }
}
