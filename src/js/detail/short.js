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
        return self.contexts[self.contexts.length - 1 - offset];
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
        let output = "layer.data(" + this.info.num_inputs + "," + this.info.num_neurons + ")";
        if(this.info.activation !== undefined) {
            output += ".activation(\"" + this.info.activation + "\")";
        }
        return output;
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
        let output = "layers(";
        if(this.info.layers.length) {
            output += this.info.layers[0].to_expression();
        }
        for(let i = 1, l = this.info.layers.length; i < l; ++i) {
            output += "," + this.info.layers[i].to_expression();
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
        let output = "mapping(";
        if(this.info.collectors.length) {
            output += this.info.collectors[0].to_expression();
        }
        for(let i = 1, l = this.info.collectors.length; i < l; ++i) {
            output += "," + this.info.collectors[i].to_expression();
        }
        output += ")";
        
        if(this.info.padding !== undefined) {
            output += ".padding(string(\"" + escape(this.info.padding) + "\"))";
        }
        if(this.info.null_string !== undefined) {
            output += ".null(string(\"" + escape(this.info.null_string) + "\"))";
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
        return "bitchar()";
    }
}

//************************************************************************************************************
const ShortExactCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "exactchar()";
    }
}

//************************************************************************************************************
const ShortSwitchCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        if(this.info.shortcut !== undefined) {
            return "switchchar(string." + this.info.shortcut + ")";
        }
        if(this.info.mapping === escape(this.info.mapping)) {
            return "switchchar(\"" + this.info.mapping + "\")";
        }
        if(this.info.mapping !== undefined) {
            return "switchchar(string(\"" + escape(this.info.mapping) + "\"))";
        }
        if(this.info.length !== undefined) {
            return "switchchar.data(" + this.info.length + ")";
        }
    }
}

//************************************************************************************************************
const ShortValueCharContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        if(this.info.shortcut !== undefined) {
            return "valuechar(string." + this.info.shortcut + ")";
        }
        if(this.info.mapping === escape(this.info.mapping)) {
            return "valuechar(\"" + this.info.mapping + "\")";
        }
        if(this.info.mapping !== undefined) {
            return "valuechar(string(\"" + escape(this.info.mapping) + "\"))";
        }
        if(this.info.length !== undefined) {
            return "valuechar.data(" + this.info.length + ")";
        }
    }
}

//************************************************************************************************************
const ShortScaleCharContext = function() {
    let self = this;
    self.info = {
        high : scale_collector_default_high,
        low : scale_collector_default_low
    };
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        if(this.info.high !== scale_collector_default_high && this.info.low !== scale_collector_default_low) {
            return "scalechar(" + encode_element_expression(this.high) + ","
                    + encode_element_expression(this.low) + ")";
        }
        return "scalechar()";
    }
}

//************************************************************************************************************
const ShortNetworkContext = function() {
    let self = this;
    self.info = {};
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let output = "network(" +
            this.info.input.to_expression() + "," +
            this.info.layers.to_expression() + "," +
            this.info.output.to_expression() + ")";
        if(!this.info.is_trainable) {
            output += ".untrainable()"
        }
        if(this.info.memory.length) {
            output += ".memory(string(\"" + escape(this.info.memory) + "\"))";
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

//***********************************************************************************************************
const collector_shortcuts_to_shorts_mapping = {
    any : 'y',
    yna : 'Y',
    digits : 'd',
    alphabet : 'a',
    ALPHABET : 'A',
    printable : 'p',
    letters : 'l'
}
const collector_shortcuts_to_shorts = Object.entries(collector_shortcuts_to_shorts_mapping);

//************************************************************************************************************
const short_cloud = new ShortCloud();


// Notes : These are symbols that can conflict
//                (in use (future))                   (used by next (future))
// mapping input  (z,Z,q,b,e,s,t,S,v,u,V,T,U,p,P,d,D) (j,J,k,K,l,L,m,M,n,N,o,O,_)
// layers         (j,J,k,K,l,L,m,M,n,N,o,O,_)         (z,Z,q,b,e,s,t,S,v,u,V,T,U,p,P,d,D)
// mapping output (z,Z,q,b,e,s,t,S,v,u,V,T,U,p,P,d,D) (_,(n,N))

//************************************************************************************************************
const short_mapping_output = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties._ = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        return function(value) {
            context.info.memory = unescape(value);
            return short_scope;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.z = function() {
        let context = short_cloud.context();
        return function(value) {
            context.info.zero = number_decode(value);
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.Z = function() {
        let context = short_cloud.context();
        return function(value) {
            context.info.one = number_decode(value);
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.q = function() {
        let context = short_cloud.context();
        return function(value) {
            context.info.offset = value;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["p" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            context.info.padding = String.fromCharCode(charCode);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["P" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            context.info.null_string = String.fromCharCode(charCode);
            return short_mapping_output;
        }})(i);
    }
    
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
    properties.t = function() {
        let context = short_cloud.context();
        let char = new ShortSwitchCharContext();
        context.info.collectors.push(char);
        return function(mapping) {
            char.info.mapping = mapping;
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
    for(let i = 0, l = collector_shortcuts_to_shorts.length; i < l; ++i) {
        properties["T" + collector_shortcuts_to_shorts[i][1]] = (function(shortcut) { return function() {
            let context = short_cloud.context();
            let char = new ShortSwitchCharContext();
            char.info.shortcut = shortcut[0];
            context.info.collectors.push(char);
            return short_mapping_output;
        }})(collector_shortcuts_to_shorts[i]);
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
    properties.u = function() {
        let context = short_cloud.context();
        let char = new ShortValueCharContext();
        context.info.collectors.push(char);
        return function(mapping) {
            char.info.mapping = unescape(mapping);
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
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 0, l = collector_shortcuts_to_shorts.length; i < l; ++i) {
        properties["U" + collector_shortcuts_to_shorts[i][1]] = (function(shortcut) { return function() {
            let context = short_cloud.context();
            let char = new ShortValueCharContext();
            char.info.shortcut = shortcut[0];
            context.info.collectors.push(char);
            return short_mapping_output;
        }})(collector_shortcuts_to_shorts[i]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.d = function() {
        let context = short_cloud.context();
        context.info.collectors.push(new ShortScaleCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.D = function() {
        let context = short_cloud.context();
        let char = new ShortScaleCharContext();
        context.info.collectors.push(char);
        return function(high=scale_collector_default_high, low=scale_collector_default_low) {
            char.info.high = number_decode(high);
            char.info.low = number_decode(low);
            return short_mapping_output;
        }
    }
    
    return new ShortChain(properties);
})();

//************************************************************************************************************
const short_layers = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties._ = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.l = function() {
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
    properties.z = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        return function(value) {
            context.info.output.info.zero = number_decode(value);
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.Z = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        return function(value) {
            context.info.output.info.one = number_decode(value);
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.q = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        return function(value) {
            context.info.output.info.offset = value;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["p" + i] = (function(charCode) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            short_cloud.push(context.info.output);
            context.info.output.info.padding = String.fromCharCode(charCode);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["P" + i] = (function(charCode) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            short_cloud.push(context.info.output);
            context.info.output.info.null_string = String.fromCharCode(charCode);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.b = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        context.info.output.info.collectors.push(new ShortBitCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.e = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        context.info.output.info.collectors.push(new ShortExactCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.s = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        let char = new ShortSwitchCharContext();
        context.info.output.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.t = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        let char = new ShortSwitchCharContext();
        context.info.output.info.collectors.push(char);
        return function(mapping) {
            char.info.mapping = unescape(mapping);
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["S" + i] = (function(charCode) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            short_cloud.push(context.info.output);
            let char = new ShortSwitchCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.output.info.collectors.push(char);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 0, l = collector_shortcuts_to_shorts.length; i < l; ++i) {
        properties["T" + collector_shortcuts_to_shorts[i][1]] = (function(shortcut) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            short_cloud.push(context.info.output);
            let char = new ShortSwitchCharContext();
            char.info.shortcut = shortcut[0];
            context.info.output.info.collectors.push(char);
            return short_mapping_output;
        }})(collector_shortcuts_to_shorts[i]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.v = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        let char = new ShortValueCharContext();
        context.info.output.info.collectors.push(char);
        return function(length) {
            char.info.length = length;
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.u = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        let char = new ShortValueCharContext();
        context.info.output.info.collectors.push(char);
        return function(mapping) {
            char.info.mapping = unescape(mapping);
            return short_mapping_output;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["V" + i] = (function(charCode) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            short_cloud.push(context.info.output);
            let char = new ShortValueCharContext();
            char.info.mapping = String.fromCharCode(charCode);
            context.info.output.info.collectors.push(char);
            return short_mapping_output;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 0, l = collector_shortcuts_to_shorts.length; i < l; ++i) {
        properties["U" + collector_shortcuts_to_shorts[i][1]] = (function(shortcut) { return function() {
            short_cloud.pop();
            let context = short_cloud.context();
            context.info.output = new ShortMappingContext();
            short_cloud.push(context.info.output);
            let char = new ShortValueCharContext();
            char.info.shortcut = shortcut[0];
            context.info.output.info.collectors.push(char);
            return short_mapping_output;
        }})(collector_shortcuts_to_shorts[i]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.d = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        context.info.output.info.collectors.push(new ShortScaleCharContext());
        return short_mapping_output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.D = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        let char = new ShortScaleCharContext();
        context.info.output.info.collectors.push(char);
        return function(high=scale_collector_default_high, low=scale_collector_default_low) {
            char.info.high = number_decode(high);
            char.info.low = number_decode(low);
            return short_mapping_output;
        }
    }
    
    return new ShortChain(properties);
})();

//************************************************************************************************************
const short_mapping_input = (function(){
    let properties = {};
    
    //--------------------------------------------------------------------------------------------------------
    properties.z = function() {
        let context = short_cloud.context();
        return function(value) {
            context.info.zero = number_decode(value);
            return short_mapping_input;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.Z = function() {
        let context = short_cloud.context();
        return function(value) {
            context.info.one = number_decode(value);
            return short_mapping_input;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.q = function() {
        let context = short_cloud.context();
        return function(value) {
            context.info.offset = value;
            return short_mapping_input;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["p" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            context.info.padding = String.fromCharCode(charCode);
            return short_mapping_input;
        }})(i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    for(let i = 256; i--;) {
        properties["P" + i] = (function(charCode) { return function() {
            let context = short_cloud.context();
            context.info.null_string = String.fromCharCode(charCode);
            return short_mapping_input;
        }})(i);
    }
    
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
    properties.t = function() {
        let context = short_cloud.context();
        let char = new ShortSwitchCharContext();
        context.info.collectors.push(char);
        return function(mapping) {
            char.info.mapping = unescape(mapping);
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
    for(let i = 0, l = collector_shortcuts_to_shorts.length; i < l; ++i) {
        properties["T" + collector_shortcuts_to_shorts[i][1]] = (function(shortcut) { return function() {
            let context = short_cloud.context();
            let char = new ShortSwitchCharContext();
            char.info.shortcut = shortcut[0];
            context.info.collectors.push(char);
            return short_mapping_input;
        }})(collector_shortcuts_to_shorts[i]);
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
    properties.u = function() {
        let context = short_cloud.context();
        let char = new ShortValueCharContext();
        context.info.collectors.push(char);
        return function(mapping) {
            char.info.mapping = unescape(mapping);
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
    for(let i = 0, l = collector_shortcuts_to_shorts.length; i < l; ++i) {
        properties["U" + collector_shortcuts_to_shorts[i][1]] = (function(shortcut) { return function() {
            let context = short_cloud.context();
            let char = new ShortValueCharContext();
            char.info.shortcut = shortcut[0];
            context.info.collectors.push(char);
            return short_mapping_input;
        }})(collector_shortcuts_to_shorts[i]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.d = function() {
        let context = short_cloud.context();
        context.info.collectors.push(new ShortScaleCharContext());
        return short_mapping_input;
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties.D = function() {
        let context = short_cloud.context();
        let char = new ShortScaleCharContext();
        context.info.collectors.push(char);
        return function(high=scale_collector_default_high, low=scale_collector_default_low) {
            char.info.high = number_decode(high);
            char.info.low = number_decode(low);
            return short_mapping_input;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    properties._ = function() {
        short_cloud.pop();
        let context = short_cloud.context();
        context.info.layers = new ShortLayersContext();
        context.info.output = new ShortMappingContext();
        short_cloud.push(context.info.output);
        return short_mapping_output;
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
        short_cloud.pop();
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
        short_cloud.pop();
        let context = new ShortNetworkContext();
        context.info.type = "normal";
        context.info.optimizer = {};
        context.info.loss = {};
        context.info.is_training = false;
        context.info.is_trainable = false;
        context.info.memory = "";
        context.info.input = new ShortMappingContext();
        context.info.output = undefined;
        context.info.layers = undefined;
        short_cloud.push(context);
        short_cloud.push(context.info.input);
        return short_mapping_input;
    }
    
    return new ShortChain(properties);
})();
