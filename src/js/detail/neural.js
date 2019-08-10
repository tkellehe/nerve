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
    self.loss_args = info.loss.args;
    self.optimizer = tf.train[info.optimizer.name].apply(tf.train, info.optimizer.args);
    
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
        let output;
        tf.tidy(() => {
            output = layers.predict(this.input_to_tf(input));
            output = this.outputs.collect(output.dataSync());
        });
        return output;
    }

    //--------------------------------------------------------------------------------------------------------
    self.learn = function(input, expected) {
        tf.tidy(() => {
            input = this.input_to_tf(input);
            expected = this.output_to_tf(expected);

            this.optimizer.minimize(() => {
                const prediction = this.layers.predict(input);
                const loss = this.loss.apply(tf.losses, [expected, prediction, ...this.loss_args]);
                return loss;
            });
        });
    }

    //--------------------------------------------------------------------------------------------------------
    self.batch = function(inputs, expecteds, num_batches, is_shuffling_data=false) {
        let _tf_inputs = new Array(inputs.length);
        let _tf_expecteds = new Array(expecteds.length);
        for(let i = 0, l = inputs.length; i < l; ++i) {
            _tf_inputs[i] = this.input_to_tf(inputs[i]);
            _tf_expecteds[i] = this.output_to_tf(expecteds[i]);
        }
        let tf_inputs = tf.data.array(_tf_inputs);
        let tf_expecteds = tf.data.array(_tf_expecteds);
        let tf_data = tf.data.zip({input:tf_inputs, expected:tf_expecteds});
        if(is_shuffling_data) {
            tf_data = tf_data.shuffle(tf_data.size);
        }
        
        return new Promise(function(resolve, reject) {
            var count = 0;
            for(let n = num_batches; n--;) {
                let promise = tf_data.forEachAsync((data) => {
                    self.optimizer.minimize(() => {
                        return self.loss.apply(tf.losses, [data.expected, self.layers.predict(data.input), ...self.loss_args]);
                    });
                });
                promise.then(() => {
                    count += 1;
                    if(count === num_batches) {
                        for(let i = 0, l = _tf_inputs.length; i < l; ++i) {
                            tf.dispose(_tf_inputs[i]);
                            tf.dispose(_tf_expecteds[i]);
                        }
                        resolve();
                    }
                });
            }
        });
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let inputs = this.inputs.to_expression();
        let outputs = this.outputs.to_expression();
        let layers = this.layers.to_expression();
        return "expression.network("+inputs+","+layers+","+outputs+")";
    }
    self.toString = self.to_expression;
    
    //--------------------------------------------------------------------------------------------------------
    self.destroy = function() {
        tf.tidy(() => {});
        tf.disposeVariables();
        tf.dispose(this.optimizer);
        this.layers.destroy();
    }
}
