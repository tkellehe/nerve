//************************************************************************************************************
const Network = function(inputs, layers, outputs, info) {
    let self = this;
    self.layers = layers;
    self.inputs = inputs;
    self.outputs = outputs;
    self.info = info;
    self.is_alive = true;
    self.subnetwork = info.subnetwork;
    if(self.subnetwork) {
        self.subnetwork.parent = self;
    }
    self.networks = info.networks;
    if(self.networks.length) {
        info.is_trainable = false;
        info.is_training = false;
        for(let i = 0, l = self.networks.length; i < l; ++i) {
            self.networks[i].distributer = self;
        }
    }
    self.layers.trainable(info.is_trainable);
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
    if(this.subnetwork) {
        self.output_to_tf = function(output) {
            return this.subnetwork.output_to_tf(output);
        }
    } else {
        self.output_to_tf = function(output) {
            return this.outputs.uncollect(output, 0, 1);
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    if(this.subnetwork) {
        self.tf_to_output = function(output) {
            return this.subnetwork.tf_to_output(output);
        }
    } else {
        self.tf_to_output = function(output) {
            return this.outputs.collect(output.dataSync());
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    if(this.subnetwork) {
        self._predict = function(input_tf) {
            let output;
            try {
                output = this.outputs.collect(this.layers.predict(input_tf));
                output = this.subnetwork._predict(this.subnetwork.input_to_tf(output));
            } catch(e) {
                this.destroy();
                throw e;
            }
            return output;
        }
    } else {
        self._predict = function(input_tf) {
            let output;
            try {
                output = this.layers.predict(input_tf);
            } catch(e) {
                this.destroy();
                throw e;
            }
            return output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    if(this.subnetwork) {
        self._predict.forEach = function(callback) {
            return function(input_tf) {
                let output;
                try {
                    output = self.outputs.collect(self.layers.predict.forEach(callback)(input_tf));
                    output = self.subnetwork._predict.forEach(callback)(self.subnetwork.input_to_tf(output));
                } catch(e) {
                    self.destroy();
                    throw e;
                }
                return output;
            };
        }
    } else {
        self._predict.forEach = function(callback) {
            return function(input_tf) {
                let output;
                try {
                    output = self.layers.predict.forEach(callback)(input_tf);
                } catch(e) {
                    self.destroy();
                    throw e;
                }
                return output;
            };
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.predict = function(input) {
        let output;
        let error;
        tf.tidy(() => {
            try {
                output = self.tf_to_output(self._predict(self.input_to_tf(input)));
                for(let i = 0, l = self.networks.length; i < l; ++i) {
                    output += self.networks[i].predict(input);
                }
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
    self.predict.forEach = function(callback) {
        return function(input) {
            let output;
            let error;
            tf.tidy(() => {
                try {
                    output = self.tf_to_output(self._predict.forEach(callback)(self.input_to_tf(input)));
                    for(let i = 0, l = self.networks.length; i < l; ++i) {
                        output += self.networks[i].predict.forEach(callback)(input);
                    }
                } catch(e) {
                    error = e;
                }
            });
            if(error !== undefined) {
                self.destroy();
                throw error;
            }
            return output;
        };
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
                            return self.loss.apply(tf.losses, [data.expected, self._predict(data.input), ...self.loss_args]);
                        });
                    }).catch((e) => {}).then(() => {
                        count += 1;
                        if(count === num_batches) {
                            resolve();
                        }
                    });
                }
            } catch(e) {
                reject(e);
            }
        }).then(() => {
            for(let i = 0, l = _tf_inputs.length; i < l; ++i) {
                tf.dispose(_tf_inputs[i]);
                tf.dispose(_tf_expecteds[i]);
            }
        }).catch(() => {
            for(let i = 0, l = _tf_inputs.length; i < l; ++i) {
                tf.dispose(_tf_inputs[i]);
                tf.dispose(_tf_expecteds[i]);
            }
        });
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let subnetwork = "";
        if(this.subnetwork) {
            subnetwork = ".join(" + this.subnetwork.to_expression() + ")";
        }
        let merging = "";
        for(let i = 0, l = this.networks.length; i < l; ++i) {
            merging += ".merge(" + this.networks[i].to_expression() + ")";
        }

        let inputs = this.inputs.to_expression();
        let outputs = this.outputs.to_expression();
        let layers = this.layers.to_expression();
        let output = "network("+inputs+","+layers+","+outputs+")";
        output += subnetwork;
        output += merging;
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
        if(this.is_alive) {
            this.is_alive = false;
            tf.tidy(() => {});
            tf.disposeVariables();
            if(this.optimizer) tf.dispose(this.optimizer);
            this.layers.destroy();
            if(this.subnetwork) {
                this.subnetwork.destroy();
            }
            for(let i = 0, l = this.networks.length; i < l; ++i) {
                this.networks[i].destroy();
            }
        }
    }
}
