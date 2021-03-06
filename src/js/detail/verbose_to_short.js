//************************************************************************************************************
let expression_to_context = {};

//************************************************************************************************************
expression_to_context.layer = function() {
    return expression_to_context.layer.data();
};
expression_to_context.layer.data = function(num_inputs, num_neurons) {
    let self = {
        handle_to_short : function(num_inputs, num_neurons) {
            if(num_inputs === undefined) {
                return "()";
            }
            if(num_inputs === num_neurons) {
                return "(" + num_inputs + ")";
            }
            return "(" + num_inputs + "," + num_neurons + ")";
        },
        info : { num_inputs : num_inputs, num_neurons : num_neurons },
        //----------------------------------------------------------------------------------------------------
        activation : function(activation) {
            self.info.activation = activation;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            let output;
            if(self.info.activation === undefined) {
                output = "l";
            }
            if(self.info.activation === "elu") {
                output = "L";
            }
            if(self.info.activation === "hardSigmoid") {
                output = "k";
            }
            if(self.info.activation === "linear") {
                output = "K";
            }
            if(self.info.activation === "relu") {
                output = "m";
            }
            if(self.info.activation === "relu6") {
                output = "M";
            }
            if(self.info.activation === "selu") {
                output = "j";
            }
            if(self.info.activation === "sigmoid") {
                output = "J";
            }
            if(self.info.activation === "softmax") {
                output = "n";
            }
            if(self.info.activation === "softplus") {
                output = "N";
            }
            if(self.info.activation === "softsign") {
                output = "o";
            }
            if(self.info.activation === "tanh") {
                output = "O";
            }
            return output + self.handle_to_short(self.info.num_inputs, self.info.num_neurons);
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.layers = function() {
    let self = {
        info : { layers : [...arguments] },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            if(self.info.layers.length === 0) {
                return "_";
            }
            let output = "";
            let layers = self.info.layers;
            // We know that we will have to have at least one.
            output += layers[0].to_short();
            for(let i = 1, l = layers.length; i < l; ++i) {
                output += "." + layers[i].to_short();
            }
            return output;
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.bitchar = function() {
    let self = {
        info : { type : "bit" },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            return "b";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.exactchar = function() {
    let self = {
        info : { type : "exact" },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            return "e";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.switchchar = function(mapping) {
    let self = {
        info : { type : "switch", mapping : mapping },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            let shortcut = to_collector_shortcut(self.info.mapping);
            if(shortcut !== undefined) {
                return "T" + collector_shortcuts_to_shorts_mapping[shortcut];
            }
            if(self.info.mapping.length === 1) {
                return "S" + self.info.mapping.charCodeAt(0);
            }
            return "t(\"" + self.info.mapping + "\")";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.switchchar.data = function(length) {
    let self = {
        info : { type : "switch", length : length },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            return "s(" + self.info.length + ")";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.valuechar = function(mapping) {
    let self = {
        info : { type : "value", mapping : mapping },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            let shortcut = to_collector_shortcut(self.info.mapping);
            if(shortcut !== undefined) {
                return "U" + collector_shortcuts_to_shorts_mapping[shortcut];
            }
            if(self.info.mapping.length === 1) {
                return "V" + self.info.mapping.charCodeAt(0);
            }
            return "u(\"" + self.info.mapping + "\")";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.valuechar.data = function(length) {
    let self = {
        info : { type : "value", length : length },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            return "v(" + self.info.length + ")";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.scalechar = function(high, low) {
    let self = {
        info : { type : "scale", high : high, low : low },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            if(self.info.high === undefined || self.info.low === undefined) {
                return "d";
            }
            if(self.info.high !== scale_collector_default_high || self.info.low !== scale_collector_default_low) {
                return "D(\"" + number_encode(self.info.high) + "\",\"" + number_encode(self.info.low) + "\")";
            }
            return "d";
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.mapping = function() {
    let self = {
        info : { collectors : [...arguments] },
        //----------------------------------------------------------------------------------------------------
        padding : function(value) {
            self.info.padding = value;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        null : function(value) {
            self.info.null_string = value;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        one : function(value) {
            self.info.one = value;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        zero : function(value) {
            self.info.zero = value;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        offset : function(value) {
            self.info.offset = value;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            let output = "";
            let collectors = self.info.collectors;
            if(collectors.length === 0) {
                collectors.push(expression_to_context.exactchar());
            }
            // We know that we will have to have at least one.
            output += collectors[0].to_short();
            for(let i = 1, l = collectors.length; i < l; ++i) {
                output += "." + collectors[i].to_short();
            }
            let settings = "";
            if(self.info.padding !== undefined && self.info.padding.length) {
                settings += ".p" + self.info.padding.charCodeAt(0);
            }
            if(self.info.null_string !== undefined && self.info.null_string.length) {
                settings += ".P" + self.info.null_string.charCodeAt(0);
            }
            if(self.info.zero !== undefined) {
                settings += ".z(\"" + number_encode(self.info.zero) + "\")";
            }
            if(self.info.one !== undefined) {
                settings += ".Z(\"" + number_encode(self.info.one) + "\")";
            }
            if(self.info.offset !== undefined) {
                settings += ".q(" + self.info.offset + ")";
            }
            if(collectors[0].info.type === "exact" && collectors.length === 1 && settings.length) {
                settings = settings.substr(1);
                output = "";
            }
            return output + settings;
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.network = function(inputexpr, layersexpr, outputexpr) {
    let self = {
        info : {
            inputexpr : inputexpr,
            layersexpr : layersexpr,
            outputexpr : outputexpr,
            is_trainable : true,
            memory : ""
        },
        //--------------------------------------------------------------------------------------------------------
        loss : {
            absoluteDifference : function() { return self; },
            cosineDistance : function(axis=0) { return self; },
            hingeLoss : function() { return self; },
            huberLoss : function() { return self; },
            logLoss : function() { return self; },
            meanSquaredError : function() { return self; }
        },
        //--------------------------------------------------------------------------------------------------------
        optimizer : {
            sgd : function(learning_rate=0.001) {
                return self;
            },
            momentum : function(learning_rate=0.001, momentum=0.01, use_nesterov=false) {
                return self;
            },
            adagrad : function(learning_rate=0.001, initial_accumulator_value=0) {
                return self;
            },
            adadelta : function(learning_rate=0.001, rho=0, espilon=0) {
                return self;
            },
            adam : function(learning_rate=0.001, beta1=0, beta2=0, epsilon=0) {
                return self;
            },
            adamax : function(learning_rate=0.001, beta1=0, beta2=0, epsilon=0, decay=0) {
                return self;
            },
            rmsprop : function(learning_rate=0.001, decay=0, momentum=0.01, epsilon=0, centered=false) {
                return self;
            }
        },
        //--------------------------------------------------------------------------------------------------------
        input : function() {
            return self;
        },
        //--------------------------------------------------------------------------------------------------------
        expected : function() {
            return self;
        },
        //--------------------------------------------------------------------------------------------------------
        train : function(is_training=true) {
            return self;
        },
        //--------------------------------------------------------------------------------------------------------
        epochs : function(num_epochs=1) {
            return self;
        },
        //--------------------------------------------------------------------------------------------------------
        shuffle : function(is_shuffling_data=true) {
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        untrainable : function(is_untrainable=true) {
            self.info.is_trainable = !is_untrainable;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        join : function(network) {
            self.info.subnetwork = network;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        merge : function(network) {
            if(!self.info.networks) {
                self.info.networks = [];
            }
            self.info.networks.push(network);
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        memory : function(string) {
            self.info.memory += string;
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        compress : function() {
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        nocompress : function() {
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        offset : function() {
            self.info.inputexpr.offset(...arguments);
            return self;
        },
        //----------------------------------------------------------------------------------------------------
        to_short : function() {
            let output = "";
            if(self.info.subnetwork) {
                output += self.info.networks ? "i." : "j.";
            } else {
                output += self.info.networks ? "m." : "n.";
            }
            let inputshort = self.info.inputexpr.to_short();
            if(inputshort !== "e") {
                output += inputshort + ".";
            }
            output += self.info.layersexpr.to_short();
            output += ".";
            output += self.info.outputexpr.to_short();
            if(self.info.memory.length) {
                output += "._(\"" + escape(self.info.memory) + "\")";
            }
            if(self.info.subnetwork) {
                output += "." + self.info.subnetwork.to_short();
            }
            if(self.info.networks) {
                for(let i = 0, l = self.info.networks.length; i < l; ++i) {
                    output += "." + self.info.networks[i].to_short();
                }
                output += ".M";
            }
            return output;
        }
    }
    return self;
}

//************************************************************************************************************
expression_to_context.number = expression.number;

//************************************************************************************************************
expression_to_context.string = expression.string;

expression_to_context.string.any = expression.string.any;
expression_to_context.string.digits = expression.string.digits;
expression_to_context.string.alphabet = expression.string.alphabet;
expression_to_context.string.ALPHABET = expression.string.ALPHABET;
expression_to_context.string.printable = expression.string.printable;

//************************************************************************************************************
const expression_to_context_scope_prefix = (function(){
    let output = "let expression = expression_to_context;";
    let keys = Object.keys(expression_to_context);
    for(let i = 0, l = keys.length; i < l; ++i) {
        output += "let " + keys[i] + " = expression." + keys[i] + ";";
    }
    return output;
})();
