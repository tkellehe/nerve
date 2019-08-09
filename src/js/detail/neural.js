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
const Network = function(inputs, layers, outputs) {
    let self = this;
    self.layers = layers;
    self.inputs = inputs;
    self.outputs = outputs;
    
    //--------------------------------------------------------------------------------------------------------
    self.input_to_tf = function(input) {
        const ins = this.inputs.collectors.length;
        return tf.tensor([this.inputs.uncollect(network_string_clense(input, ins), 0, 1)]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.output_to_tf = function(output) {
        const outs = this.outputs.collectors.length;
        return tf.tensor([this.outputs.uncollect(network_string_clense(output, outs), 0, 1)]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.predict = function(input) {
        let output = layers.predict(this.input_to_tf(input));
        return this.outputs.collect(output.dataSync());
    }

    //--------------------------------------------------------------------------------------------------------
    self.learn = function(input, expected) {
        const outs = this.outputs.collectors.length;
        expected = tf.tensor([this.outputs.uncollect(network_string_clense(expected, outs), 0, 1)]);
        this.layers.learn(this.input_to_tf(input), this.output_to_tf(expected));
    }

    //--------------------------------------------------------------------------------------------------------
    self.batch = function(inputs, expecteds, num_batches=1) {
        let tf_inputs = new Array(inputs.length);
        let tf_expecteds = new Array(expecteds.length);
        for(let i = 0, l = inputs.length; i < l; ++i) {
            tf_inputs[i] = this.input_to_tf(inputs[i]);
            tf_expecteds[i] = this.output_to_tf(expecteds[i]);
        }
        
        for(let n = num_batches; n--;) {
            for(let i = 0, l = inputs.length; i < l; ++i) {
                this.layers.learn(tf_inputs[i], tf_expecteds[i]);
            }
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.network("+self.inputs+","+self.layers+","+self.outputs+","+self.layers.learning_rate+")";
    }
    self.toString = self.to_expression;
}
