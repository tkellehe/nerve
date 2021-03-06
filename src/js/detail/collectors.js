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
].join('');

collector_shortcuts_any = default_collector_mapping;
collector_shortcuts_yna = default_collector_mapping.split('').reverse().join('');
collector_shortcuts_digits = "0123456789";
collector_shortcuts_alphabet = "abcdefghijklmnopqrstuvwxyz";
collector_shortcuts_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
collector_shortcuts_printable = "\n !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
collector_shortcuts_letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const to_collector_shortcut = (string) => {
    switch(string) {
        case collector_shortcuts_any:
            return 'any';
        case collector_shortcuts_yna:
            return 'yna';
        case collector_shortcuts_digits:
            return 'digits';
        case collector_shortcuts_alphabet:
            return 'alphabet';
        case collector_shortcuts_ALPHABET:
            return 'ALPHABET';
        case collector_shortcuts_printable:
            return 'printable';
        case collector_shortcuts_letters:
            return 'letters';
        default:
            return undefined;
    }
}

//************************************************************************************************************
const collector_default_padding = '\0';
const collector_default_one = 1;
const collector_default_zero = 0;
const collector_default_offset = 0;

//************************************************************************************************************
const BitCollector = function(begin, end) {
    let self = this;
    self.begin = begin;
    self.end = end;
    self.bits = new Uint8Array(1);
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return 8;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        let begin = this.begin;
        let end = this.end;
        let highest = array[begin];
        let lowest = array[begin];
        let bits = this.bits;
        for(let i = begin+1; i <= end; ++i) {
            let v = array[i];
            if(v > highest) {
                highest = v;
            } else if(v < lowest) {
                lowest = v;
            }
        }
        bits[0] = 0;
        if (highest !== lowest) {
            let diff = highest - lowest;
            bits[0] |= Math.round((array[begin  ] - lowest) / diff);
            bits[0] |= Math.round((array[begin+1] - lowest) / diff) << 1;
            bits[0] |= Math.round((array[begin+2] - lowest) / diff) << 2;
            bits[0] |= Math.round((array[begin+3] - lowest) / diff) << 3;
            bits[0] |= Math.round((array[begin+4] - lowest) / diff) << 4;
            bits[0] |= Math.round((array[begin+5] - lowest) / diff) << 5;
            bits[0] |= Math.round((array[begin+6] - lowest) / diff) << 6;
            bits[0] |= Math.round((array[begin+7] - lowest) / diff) << 7;
        }
        return String.fromCharCode(bits[0]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string, buffer, location, yes) {
        let begin = this.begin;
        let bits = this.bits;
        bits[0] = string.charCodeAt(0);
        if(bits[0] & 1) buffer[begin] = yes;
        if(bits[0] & 2) buffer[begin+1] = yes;
        if(bits[0] & 4) buffer[begin+2] = yes;
        if(bits[0] & 8) buffer[begin+3] = yes;
        if(bits[0] & 16) buffer[begin+4] = yes;
        if(bits[0] & 32) buffer[begin+5] = yes;
        if(bits[0] & 64) buffer[begin+6] = yes;
        if(bits[0] & 128) buffer[begin+7] = yes;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "bitchar()";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const ExactCollector = function(begin, end) {
    let self = this;
    self.begin = begin;
    self.end = end;
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return 1;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        let value = Math.round(array[this.begin]);
        return String.fromCharCode(value < 0 ? 0 : (value > 255 ? 255 : value));
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string, buffer, location, yes) {
        buffer[this.begin] = string.charCodeAt(0);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        return "exactchar()";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const SwitchCollector = function(begin, end, mapping) {
    if(mapping === undefined) {
        mapping = default_collector_mapping;
    }
    let self = this;
    self.mapping = mapping;
    self.unmapping = {};
    for(let i = 0, l = mapping.length; i < l; ++i) {
        self.unmapping[mapping[i]] = i;
    }
    self.begin = begin;
    self.end = end;
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return end - begin + 1;
    }
    
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
                highest = v;
            }
        }
        return self.mapping[highest_index-begin];
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string, buffer, location, yes) {
        let index = self.unmapping[string];
        if(index !== undefined) {
            buffer[self.begin + index] = yes;
        }
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let shortcut = to_collector_shortcut(self.mapping);
        let header = global_network_expression_compression ? "switchchar(" : "";
        let footer = global_network_expression_compression ? ")" : "";
        
        if(shortcut) {
            return header + "string." + shortcut + footer;
        }
        if(self.mapping.length === 1 || !global_network_expression_compression) {
            return header + encode_element_expression(self.mapping) + footer;
        }
        if(self.mapping === escape(self.mapping)) {
            return header + "\"" + self.mapping + "\"" + footer;
        }
        global_network_memory_add(self.mapping);
        return "switchchar.data(" + self.mapping.length + ")";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const collector_find_closest_character = function(mapping, value) {
    // Floor the value to the closest character in the mapping.
    for(let i = mapping.length; i--;) {
        let c = mapping.charCodeAt(i);
        if(value >= c) return mapping[i];
    }
    return mapping[0];
}
const ValueCollector = function(begin, end, mapping) {
    if(mapping === undefined) {
        mapping = default_collector_mapping;
    }
    let self = this;
    self.mapping = mapping.split('').sort((a,b) => { return (a < b ? -1 : (a > b ? 1 : 0)) }).join('');
    self.unmapping = {};
    for(let i = 0, l = mapping.length; i < l; ++i) {
        self.unmapping[mapping[i]] = i;
    }
    self.begin = begin;
    self.end = end;
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return 1;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        return collector_find_closest_character(this.mapping, array[this.begin]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string, buffer, location, yes) {
        let index = this.unmapping[string];
        buffer[this.begin] = (index === undefined) ? collector_find_closest_character(this.mapping, string.charCodeAt(0)) : string.charCodeAt(0);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let shortcut = to_collector_shortcut(self.mapping);
        if(shortcut) {
            return "valuechar(string." + shortcut + ")";
        }
        if(self.mapping.length === 1 || !global_network_expression_compression) {
            return "valuechar(" + encode_element_expression(self.mapping) + ")";
        }
        if(self.mapping === escape(self.mapping)) {
            return "valuechar(\"" + self.mapping + "\")";
        }
        global_network_memory_add(self.mapping);
        return "valuechar.data(" + self.mapping.length + ")";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const scale_collector_default_high = 1.0;
const scale_collector_default_low = -1.0;
const ScaleCollector = function(begin, end, high, low) {
    if(high === undefined) {
        high = scale_collector_default_high;
    }
    if(low === undefined) {
        low = scale_collector_default_low;
    }
    let self = this;
    self.begin = begin;
    self.end = end;
    self.high = high;
    self.low = low;
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return 1;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        let charCode = ((array[this.begin]-this.low)/(this.high-this.low))*255;
        return String.fromCharCode(charCode > 255 ? 255 : (charCode < 0 ? 0 : Math.floor(charCode)));
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string, buffer, location, yes) {
        buffer[this.begin] = ((string.charCodeAt(0)/255)*(this.high-this.low)) + this.low;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        if(this.high !== scale_collector_default_high || this.low !== scale_collector_default_low) {
            return "scalechar(" + encode_element_expression(this.high) + ","
                                + encode_element_expression(this.low) + ")";
        }
        return "scalechar()";
    }
    self.toString = self.to_expression;
}

//************************************************************************************************************
const collectors_string_clense = function(string, offset, max, padding) {
    if(string.length > max) {
        string = string.substr(offset, max);
    }
    return string.padEnd(max, padding);
}

const Collectors = function() {
    let self = this;
    let __collectors = [...arguments];
    self.collectors = __collectors;
    self.__size = 0;
    for(let i = 0, l = __collectors.length; i < l; ++i) {
        self.__size += __collectors[i].size();
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.size = function() {
        return this.__size;
    }

    //--------------------------------------------------------------------------------------------------------
    self.collect = function(array) {
        let output = this.collectors.reduce(function(string, collector) { return string+collector.collect(array) }, "");
        if(this.null) {
            output = output.replace(this.null, '');
        }
        return output;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.uncollect = function(string) {
        string = collectors_string_clense(string, this.offset, this.collectors.length, this.padding);
        let size = this.__size;
        let zeros;
        tf.tidy(() => {
            if(this.zero === 0) {
                zeros = tf.zeros([size]).dataSync();
            } else {
                zeros = tf.fill([size], this.zero).dataSync();
            }
            for(let i = 0, l = __collectors.length; i < l; ++i) {
                __collectors[i].uncollect(string.substr(i, 1), zeros, i, this.one);
            }
        });

        return tf.tensor([zeros]);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.to_expression = function() {
        let result = "mapping(" + __collectors.join() + ")";
        if(this.padding !== collector_default_padding) {
            result += ".padding(" + encode_element_expression(this.padding) + ")";
        }
        if(this.one !== collector_default_one) {
            result += ".one(" + encode_element_expression(this.one) + ")";
        }
        if(this.zero !== collector_default_zero) {
            result += ".zero(" + encode_element_expression(this.zero) + ")";
        }
        if(this.offset !== collector_default_offset) {
            result += ".offset(" + this.offset + ")";
        }
        if(this.null) {
            result += ".null(" + encode_element_expression(this.null_string) + ")";
        }
        return result;
    }
    self.toString = self.to_expression;
}
