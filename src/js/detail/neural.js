//************************************************************************************************************
const Layer = function(weights, biases, input_layer) {
    let self = this;
    self.weights = weights;
    self.biases = biases;
    self.input_layer = input_layer;
    if (input_layer !== undefined) {
        input_layer.output_layer = self;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return self.weights.num_rows;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return self.weights.num_columns;
    }
}

//************************************************************************************************************
// No values => once number of neurons is known as input layer it will construct properly.
// One value => number of weights (all initialized to one and bias is set to zero)
// Two or more => Last value is the bias all others are the weights.
const NeuronExpression = function() {
    let self = this;
    if(arguments.length === 1) {
        self.num_inputs = arguments[0];
        self.weights = undefined;
        self.bias = 0;
    } else if(arguments.length === 0) {
        self.num_inputs = undefined;
        self.weights = undefined;
        self.bias = 0;
    } else {
        self.num_inputs = --arguments.length;
        self.weights = [...arguments];
        self.bias = arguments[arguments.length];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(num_inputs) {
        if(self.num_inputs === undefined) {
            self.num_inputs = num_inputs;
        } else if(num_inputs !== undefined) {
            throw Error("Number of inputs does not match how this node was created.");
        }
        if(self.weights === undefined) {
            self.weights = [...makeArrayAllOnesHelper(self.num_inputs)];
        }
        return this;
    }
}

//************************************************************************************************************
const LayerExpression = function() {
    let self = this;
    if(arguments.length === 1 && typeof arguments[0] === 'number') {
        let count = arguments[0];
        const generate = function*() { while(count--) yield new NeuronExpression() }
        self.neuronexprs = [...generate()];
    } else {
        self.neuronexprs = [...arguments];
    }

    //--------------------------------------------------------------------------------------------------------
    self.add_neuron = function() {
        self.neuronexprs.push(new (Function.prototype.bind.apply(NeuronExpression,
                                                                 [NeuronExpression, ...arguments])));
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(input_layer) {
        if(typeof input_layer === 'number') {
            self.num_inputs = input_layer;
            input_layer = undefined;
        } else {
            self.num_inputs = input_layer.get_num_outputs();
        }
        let neuron_weights_buffer = [];
        let neuron_biases_buffer = [];
        for(let i = 0, l = self.neuronexprs.length; i < l; ++i) {
            let neuron = self.neuronexprs[i];
            neuron.finalize(self.num_inputs);
            extendArray(neuron_weights_buffer, neuron.weights);
            neuron_biases_buffer.push(neuron.bias);
        }
        let weights = new Matrix(new Float64Array(neuron_weights_buffer),
                                 self.num_inputs,
                                 self.neuronexprs.length);
        let biases = new Matrix(new Float64Array(neuron_biases_buffer),
                                1,
                                self.neuronexprs.length);
        return new Layer(weights, biases, input_layer);
    }
}

//************************************************************************************************************
const Layers = function() {
    let self = this;
    let __layers = [...arguments];
    self.layers = __layers;

    //--------------------------------------------------------------------------------------------------------
    self.get_num_inputs = function() {
        return __layers[0].get_num_inputs();
    }

    //--------------------------------------------------------------------------------------------------------
    self.get_num_outputs = function() {
        return __layers[__layers.length-1].get_num_outputs();
    }

    //--------------------------------------------------------------------------------------------------------
    self.feedforward = function(matrix) {
        let layers = __layers;
        for(let i = 0, l = layers.length; i < l; ++i) {
            let layer = layers[i];
            matrix = matrix.multiply(layer.weights).opt_iadd(layer.biases).ReLU();
        }
        return matrix;
    }

    //--------------------------------------------------------------------------------------------------------
    self.backpropagation = function() {

    }
}

//************************************************************************************************************
const LayersExpression = function() {
    let self = this;
    let __layerexps = [...arguments];
    self.layerexps = __layerexps;

    //--------------------------------------------------------------------------------------------------------
    self.add_layerexpr = function(layerexp) {
        __layerexps.push(layerexp);
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.finalize = function(max_input_length) {
        let unwrap = function*() {
            let layerexps = __layerexps;
            let layer = layerexps[0].finalize(max_input_length);
            yield layer;
            for(let i = 1, l = layerexps.length; i < l; ++i) {
                layer = layerexps[i].finalize(layer);
                yield layer;
            }
        }
        let layers = new Layers();
        layers.layers.push(...unwrap());
        return layers;
    }
}

//************************************************************************************************************
const default_collector_mapping = [
    '\u0000', '\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007',
    '\u0008', '\u0009', '\u000a', '\u000b', '\u000c', '\u000d', '\u000e', '\u000f',
    '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017',
    '\u0018', '\u0019', '\u001a', '\u001b', '\u001c', '\u001d', '\u001e', '\u001f',
    '\u0020', '\u0021', '\u0022', '\u0023', '\u0024', '\u0025', '\u0026', '\u0027',
    '\u0028', '\u0029', '\u002a', '\u002b', '\u002c', '\u002d', '\u002e', '\u002f',
    '\u0030', '\u0031', '\u0032', '\u0033', '\u0034', '\u0035', '\u0036', '\u0037',
    '\u0038', '\u0039', '\u003a', '\u003b', '\u003c', '\u003d', '\u003e', '\u003f',
    '\u0040', '\u0041', '\u0042', '\u0043', '\u0044', '\u0045', '\u0046', '\u0047',
    '\u0048', '\u0049', '\u004a', '\u004b', '\u004c', '\u004d', '\u004e', '\u004f',
    '\u0050', '\u0051', '\u0052', '\u0053', '\u0054', '\u0055', '\u0056', '\u0057',
    '\u0058', '\u0059', '\u005a', '\u005b', '\u005c', '\u005d', '\u005e', '\u005f',
    '\u0060', '\u0061', '\u0062', '\u0063', '\u0064', '\u0065', '\u0066', '\u0067',
    '\u0068', '\u0069', '\u006a', '\u006b', '\u006c', '\u006d', '\u006e', '\u006f',
    '\u0070', '\u0071', '\u0072', '\u0073', '\u0074', '\u0075', '\u0076', '\u0077',
    '\u0078', '\u0079', '\u007a', '\u007b', '\u007c', '\u007d', '\u007e', '\u007f',
    '\u0080', '\u0081', '\u0082', '\u0083', '\u0084', '\u0085', '\u0086', '\u0087',
    '\u0088', '\u0089', '\u008a', '\u008b', '\u008c', '\u008d', '\u008e', '\u008f',
    '\u0090', '\u0091', '\u0092', '\u0093', '\u0094', '\u0095', '\u0096', '\u0097',
    '\u0098', '\u0099', '\u009a', '\u009b', '\u009c', '\u009d', '\u009e', '\u009f',
    '\u00a0', '\u00a1', '\u00a2', '\u00a3', '\u00a4', '\u00a5', '\u00a6', '\u00a7',
    '\u00a8', '\u00a9', '\u00aa', '\u00ab', '\u00ac', '\u00ad', '\u00ae', '\u00af',
    '\u00b0', '\u00b1', '\u00b2', '\u00b3', '\u00b4', '\u00b5', '\u00b6', '\u00b7',
    '\u00b8', '\u00b9', '\u00ba', '\u00bb', '\u00bc', '\u00bd', '\u00be', '\u00bf',
    '\u00c0', '\u00c1', '\u00c2', '\u00c3', '\u00c4', '\u00c5', '\u00c6', '\u00c7',
    '\u00c8', '\u00c9', '\u00ca', '\u00cb', '\u00cc', '\u00cd', '\u00ce', '\u00cf',
    '\u00d0', '\u00d1', '\u00d2', '\u00d3', '\u00d4', '\u00d5', '\u00d6', '\u00d7',
    '\u00d8', '\u00d9', '\u00da', '\u00db', '\u00dc', '\u00dd', '\u00de', '\u00df',
    '\u00e0', '\u00e1', '\u00e2', '\u00e3', '\u00e4', '\u00e5', '\u00e6', '\u00e7',
    '\u00e8', '\u00e9', '\u00ea', '\u00eb', '\u00ec', '\u00ed', '\u00ee', '\u00ef',
    '\u00f0', '\u00f1', '\u00f2', '\u00f3', '\u00f4', '\u00f5', '\u00f6', '\u00f7',
    '\u00f8', '\u00f9', '\u00fa', '\u00fb', '\u00fc', '\u00fd', '\u00fe', '\u00ff'
];
const Collector = function(begin, end, mapping) {
    if(mapping === undefined) {
        mapping = default_collector_mapping;
    }
    if(typeof mapping === 'string') {
        mapping = [...mapping];
    }
    let self = this;
    self.mapping = mapping;
    let index = 0;
    self.unmapping =  mapping.reduce((o, key) => Object.assign(o, {[key]: index++}), {});
    self.begin = begin;
    self.end = end;
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        let begin = self.begin;
        let end = self.end;
        let highest_index = begin;
        let highest = array[highest_index];
        for(let i = begin+1; i <= end; ++i) {
            let v = array[i];
            if(v > highest) {
                highest_index = i;
            }
        }
        return self.mapping[i-begin];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string) {
        let index = self.unmapping[string];
        return self.begin + index;
    }
}

//************************************************************************************************************
const Collectors = function() {
    let self = this;
    let __collectors = [...arguments];
    self.collectors = __collectors;
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        return self.collectors.reduce(function(string, collector) { return string+collector.collect(array) }, "");
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(array) {
        let r = new Array(__collectors.length);
        let index = 0;
        return __collectors.reduce(function(indexes, collector) { indexes[index++] = collector.collect(array); return indexes }, r);
    }
}

//************************************************************************************************************
const Network = function(layers, collectors) {
    let self = this;
    self.layers = layers;
    self.collectors = collectors;
    
    //--------------------------------------------------------------------------------------------------------
    self.feedforward = function(string) {
        let matrix = stringAlreadyArrayToMatrix(stringToArrayFrontPadding(string, self.layers.get_num_inputs(), 0));
        matrix = layers.feedforward(matrix);
        return collectors.collect(matrix.array);
    }

    //--------------------------------------------------------------------------------------------------------
    self.backpropagation = function() {

    }
}

//************************************************************************************************************
const CollectorExpression = function(begin, end, mapping) {
    let self = this;
    self.begin = begin;
    self.end = end;
    self.mapping = mapping;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        return new Collector(self.begin, self.end, self.mapping);
    }
}

//************************************************************************************************************
const CollectorsExpression = function() {
    let self = this;
    self.collectors = [...arguments];
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        let r = new Array(self.collectors.length+1);
        r[0] = Collectors;
        let index = 1;
        return new (
            Function.prototype.bind.apply(
               Collectors, 
               self.collectors.reduce(function(collectors, expr) { r[index++] = expr.finalize(); return collectors }, r)));
    }
}

//************************************************************************************************************
const NetworkExpression = function(max_input_length, layersexpr, collectorsexpr) {
    let self = this;
    self.layersexpr = layersexpr;
    self.collectorsexpr = collectorsexpr;
    
    //--------------------------------------------------------------------------------------------------------
    self.finalize = function() {
        return new Network(layersexpr.finalize(max_input_length), collectorsexpr.finalize());
    }
}
