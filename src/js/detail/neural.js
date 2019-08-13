//************************************************************************************************************
const Network = function(inputs, layers, outputs, info) {
    let self = this;
    self.layers = layers;
    self.inputs = inputs;
    self.outputs = outputs;
    self.info = info;
    self.layers.trainable(self.info.is_trainable);
    if(info.is_training) {
        self.loss = tf.losses[info.loss.name];
        self.loss_args = info.loss.args;
        self.optimizer = tf.train[info.optimizer.name].apply(tf.train, info.optimizer.args);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.input_to_tf = function(input) {
        return this.inputs.uncollect(input, 0, 1);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.output_to_tf = function(output) {;
        return this.outputs.uncollect(output, 0, 1);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.predict = function(input) {
        let output;
        let error;
        tf.tidy(() => {
            try {
                output = layers.predict(this.input_to_tf(input));
                output = this.outputs.collect(output.dataSync());
            } catch(e) {
                error = e;
            }
        });
        if(error !== undefined) {
            this.destroy();
            throw error;
        }
        return output;
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
            try {
                var count = 0;
                for(let n = num_batches; n--;) {
                    tf_data.forEachAsync((data) => {
                        self.optimizer.minimize(() => {
                            return self.loss.apply(tf.losses, [data.expected, self.layers.predict(data.input), ...self.loss_args]);
                        });
                    }).catch((e) => {}).then(() => {
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
            } catch(e) {
                for(let i = 0, l = _tf_inputs.length; i < l; ++i) {
                    tf.dispose(_tf_inputs[i]);
                    tf.dispose(_tf_expecteds[i]);
                }
                reject(e);
            }
        });
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let inputs = this.inputs.to_expression();
        let outputs = this.outputs.to_expression();
        let layers = this.layers.to_expression();
        let output = "expression.network("+inputs+","+layers+","+outputs+")";
        if(!this.info.is_trainable) {
            output += ".untrainable()";
        } else {
            if(this.info.is_training) {
                if(this.info.num_batches !== 1) {
                    output += ".batches(" + this.info.num_batches + ")";
                }
                if(this.info.optimizer.name !== 'sgd' || this.info.optimizer.args[0] !== 0.001) {
                    output += ".optimizer." + this.info.optimizer.name + "(" + encode_array_expression(this.info.optimizer.args) + ")";
                }
                if(this.info.loss.name !== 'meanSquaredError') {
                    output += ".loss." + this.info.loss.name + "(" + encode_array_expression(this.info.loss.args) + ")";
                }
                output += ".train()";
            }
        }
        if(this.info.inputs !== undefined && this.info.inputs.length) {
            output += ".input(" + encode_array_expression(this.info.inputs) + ")";
            
            if(this.info.expecteds !== undefined && this.info.expecteds.length) {
                output += ".expected(" + encode_array_expression(this.info.expecteds) + ")";
            }
            
            if(this.info.is_shuffling_data) {
                output += ".shuffle()";
            }
        }
        return output;
    }
    self.toString = self.to_expression;
    
    //--------------------------------------------------------------------------------------------------------
    self.destroy = function() {
        tf.tidy(() => {});
        tf.disposeVariables();
        if(this.optimizer) tf.dispose(this.optimizer);
        this.layers.destroy();
    }
}
