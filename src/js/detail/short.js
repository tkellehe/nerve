//************************************************************************************************************
const ShortCloud = function() {
    let self = this;
    self.contexts = [];
    
    //--------------------------------------------------------------------------------------------------------
    self.push = function(context) {
        self.contexts.push(context);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.pop = function() {
        // The final context is the closing of the whole chain.
        if(self.contexts.length !== 1) self.contexts.pop();
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.context = function(offset=0) {
        return self.contexts[self.length - 1 - offset];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.output = function() {
        return self.contexts[0];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.clear = function() {
        self.contexts = [];
    }
}

//************************************************************************************************************
const ShortLayerContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        
    }
}

//************************************************************************************************************
const ShortLayersContext = function() {
    let self = this;
    self.info = {
        layers : []
    };
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let output = "expression.layers(";
        if(this.info.layers.length) {
            output += this.info.layers[0].to_expression();
        }
        for(let i = 1, l = this.info.layers.length; i < l; ++i) {
            output += this.info.layers[i].to_expression();
        }
        return output + ")";
    }
}

//************************************************************************************************************
const ShortMappingContext = function() {
    let self = this;
    self.info = {
        collectors : [],
        padding : undefined,
        null_string : undefined,
        one : undefined,
        zero : undefined,
        offset : undefined
    };
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let output = "expression.mapping(";
        if(this.info.collectors.length) {
            output += this.info.collectors[0].to_expression();
        }
        for(let i = 1, l = this.info.collectors.length; i < l; ++i) {
            output += this.info.collectors[i].to_expression();
        }
        output += ")";
        
        if(this.info.padding !== undefined) {
            output += ".padding(expression.string(\"" + escape(this.info.padding) + "\"))";
        }
        if(this.info.null_string !== undefined) {
            output += ".null(expression.string(\"" + escape(this.info.null_string) + "\"))";
        }
        if(this.info.one !== undefined) {
            output += ".one(" + number_encode_for_output(this.info.one) + ")";
        }
        if(this.info.zero !== undefined) {
            output += ".zero(" + number_encode_for_output(this.info.zero) + ")";
        }
        if(this.info.offset !== undefined) {
            output += ".offset(" + this.info.offset + ")";
        }
        
        return output;
    }
}

//************************************************************************************************************
const ShortBitCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.bitchar()";
    }
}

//************************************************************************************************************
const ShortExactCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "expression.exactchar()";
    }
}

//************************************************************************************************************
const ShortSwitchCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        if(this.info.mapping !== undefined) {
            return "expression.switchchar(expression.string(\"" + this.info.mapping + "\"))";
        }
        if(this.info.length !== undefined) {
            return "expression.switchchar.data(" + this.info.length + ")";
        }
    }
}

//************************************************************************************************************
const ShortValueCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        if(this.info.mapping !== undefined) {
            return "expression.valuechar(expression.string(\"" + this.info.mapping + "\"))";
        }
        if(this.info.length !== undefined) {
            return "expression.valuechar.data(" + this.info.length + ")";
        }
    }
}

//************************************************************************************************************
const ShortNetworkContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let output = "expression.network(" +
            this.info.input.to_expression() + "," +
            this.info.layers.to_expression() + "," +
            this.info.output.to_expression() + ")";
        if(this.info.memory.length) {
            output += ".memory(expression.string(\"" + this.info.memory + "\")";
        }
        return output;
    }
}

//************************************************************************************************************
const ShortChain = function(properties) {
    let self = this;
    
    let entries = Object.entries(properties);
    for(let i = 0, l = entries.length; i < l; ++i) {
        let entry = entries[i];
        Object.defineProperty(self, entry[0], { get : entry[1] });
    }
}

//************************************************************************************************************
const short_cloud = new ShortCloud();

//************************************************************************************************************
const short_mapping_output = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties.b = function() {
        let context = short_cloud.context();
        context.info.collectors.push(new ShortBitCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.e = function() {
        let context = short_cloud.context();
        context.info.collectors.push(new ShortExactCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.s = function() {
        let context = short_cloud.context();
        let char = new ShortSwitchCharContext();
        context.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["S" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            let char = new ShortSwitchCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.collectors.push(char);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.v = function() {
        let context = short_cloud.context();
        let char = new ShortValueCharContext();
        context.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["V" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            let char = new ShortValueCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.collectors.push(char);
            return short_mapping_output;
        }})(i);
    }
    
    return new ShortChain(properties);
})();

//************************************************************************************************************
const short_layers = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties.l = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = undefined;
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.L = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'elu';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.k = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'hardSigmoid';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.K = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'linear';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.m = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'relu';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.M = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'relu6';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.j = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'selu';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.J = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'sigmoid';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.n = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'softmax';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.N = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'softplus';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.o = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'softsign';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.O = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        let layer = new ShortLayerContext();
        layer.info.activation = 'tanh';
        context.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.b = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        context.info.output.info.collectors.push(new ShortBitCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.e = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        context.info.output.info.collectors.push(new ShortExactCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.s = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        let char = new ShortSwitchCharContext();
        context.info.output.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["S" + i] = (function(charCode) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            let char = new ShortSwitchCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.output.info.collectors.push(char);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.v = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        let char = new ShortValueCharContext();
        context.info.output.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["V" + i] = (function(charCode) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            let char = new ShortValueCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.output.info.collectors.push(char);
            return short_mapping_output;
        }})(i);
    }
    
    return new ShortChain(properties);
})();

//************************************************************************************************************
const short_mapping_input = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties.b = function() {
        let context = short_cloud.context();
        context.info.collectors.push(new ShortBitCharContext());
        return short_mapping_input;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.e = function() {
        let context = short_cloud.context();
        context.info.collectors.push(new ShortExactCharContext());
        return short_mapping_input;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.s = function() {
        let context = short_cloud.context();
        let char = new ShortSwitchCharContext();
        context.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_input;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["S" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            let char = new ShortSwitchCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.collectors.push(char);
            return short_mapping_input;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.v = function() {
        let context = short_cloud.context();
        let char = new ShortValueCharContext();
        context.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_input;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["V" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            let char = new ShortValueCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.collectors.push(char);
            return short_mapping_input;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.l = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = undefined;
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.L = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'elu';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.k = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'hardSigmoid';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.K = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'linear';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.m = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'relu';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.M = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'relu6';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.j = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'selu';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.J = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'sigmoid';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.n = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'softmax';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.N = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'softplus';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.o = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'softsign';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.O = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        short_cloud.push(context.info.layers);
        let layer = new ShortLayerContext();
        layer.info.activation = 'tanh';
        context.info.layers.info.layers.push(layer);
        return function(num_inputs, num_neurons) {
            layer.info.num_inputs = num_inputs;
            layer.info.num_neurons = num_neurons;
            return short_layers;
        }
    }
    
    return new ShortChain(properties);
})();

//************************************************************************************************************
const short_scope = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties.n = function() {
        let context = new ShortNetworkContext();
        context.info.type = "normal";
        context.info.optimizer = {};
        context.info.loss = {};
        context.info.is_training = false;
        context.info.is_trainable = true;
        context.info.memory = "";
        context.info.input = new ShortMappingContext();
        context.info.output = undefined;
        context.info.layers = undefined;
        short_cloud.push(context);
        short_cloud.push(context.info.input);
        return short_mapping_input;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.N = function() {
        let context = new ShortNetworkContext();
        context.info.type = "normal";
        context.info.optimizer = {};
        context.info.loss = {};
        context.info.is_training = false;
        context.info.is_trainable = true;
        context.info.memory = "";
        context.info.input = new ShortMappingContext();
        context.info.output = undefined;
        context.info.layers = undefined;
        short_cloud.push(context);
        short_cloud.push(context.info.input);
        return function(string) {
            context.info.memory = unescape(string);
            return short_mapping_input;
        }
    }
    
    return new ShortChain(properties);
})();
