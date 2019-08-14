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
    self.trainable = function(is_trainable=true) {
        this.weights.trainable = is_trainable;
        this.biases.trainable = is_trainable;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let ws = this.weights.dataSync();
        let bs = this.biases.dataSync();
        
        for(let i = 0, l = ws.length; i < l; ++i) {
            global_network_memory_add_number(ws[i]);
        }
        for(let i = 0, l = bs.length; i < l; ++i) {
            global_network_memory_add_number(bs[i]);
        }
        
        return "layer.data(" +
            this.get_num_inputs() + "," +
            this.get_num_outputs() + ")" +
            (this.activation === undefined ? "" : ".activation(\"" + this.activation + "\")");
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
    self.trainable = function(is_trainable=true) {
        let layers = this.layers;
        for(let i = 0, l = layers.length; i < l; ++i) {
            layers[i].trainable(is_trainable);
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "layers(" + layers_to_string(this.layers) + ")";
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
