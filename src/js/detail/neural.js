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
const Network = function(inputs, layers, outputs, info) {
    let self = this;
    self.layers = layers;
    self.inputs = inputs;
    self.outputs = outputs;
    self.info = info;
    self.loss = tf.losses[info.loss.name];
    switch(info.optimizer.name) {
        case 'sgd':
            self.optimizer = tf.train.sgd(info.optimizer.sgd_learning_rate);
        break;
    };
    
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
        input = this.input_to_tf(input);
        expected = this.output_to_tf(expected);
        
        this.optimizer.minimize(() => {
            const prediction = this.layers.predict(input);
            const loss = this.loss(expected, prediction);
            return loss;
        });
    }

    //--------------------------------------------------------------------------------------------------------
    self.batch = function(inputs, expecteds, num_batches) {
        let tf_inputs = new Array(inputs.length);
        let tf_expecteds = new Array(expecteds.length);
        for(let i = 0, l = inputs.length; i < l; ++i) {
            tf_inputs[i] = this.input_to_tf(inputs[i]);
            tf_expecteds[i] = this.output_to_tf(expecteds[i]);
        }
        tf_inputs = tf.data.array(tf_inputs);
        tf_expecteds = tf.data.array(tf_expecteds);
        let tf_data = tf.data.zip({input:tf_inputs, expected:tf_expecteds});
        
        return new Promise(function(resolve, reject) {
            var count = 0;
            for(let n = num_batches; n--;) {
                let promise = tf_data.forEachAsync((data) => {
                    this.optimizer.minimize(() => {
                        return this.loss(data.expected, this.layers.predict(data.input));
                    });
                });
                promise.then(() => {
                    count += 1;
                    if(count === num_batches) {
                        resolve();
                    }
                });
            }
        });
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function(no_learning) {
        let output = "expression.network("+this.inputs+","+this.layers+","+this.outputs+")";
        
        if(!no_learning) {
            output += ".loss." + this.info.loss.name + "()";

            switch(this.info.optimizer.name) {
                case 'sgd':
                    output += ".optimizer.sgd(" + this.info.optimizer.sgd_learning_rate + ")"
                break;
            };
        }
        
        return output;
    }
    self.toString = self.to_expression;
    
    //--------------------------------------------------------------------------------------------------------
    self.destroy = function() {
        tf.tidy(() => {}); // Clean up all of the tensors that are not returned by this function.
        tf.disposeVariables(); // Variables do not get cleaned up in the tidy function.
    }
}
