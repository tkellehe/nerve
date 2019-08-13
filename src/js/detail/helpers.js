//************************************************************************************************************
const isLittleEndian = ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201)
const isBigEndian = !isLittleEndian;

const string_unfold = function*(string) {
    for(let i = 0, l = string.length; i < l; ++i) yield string.charCodeAt(i);
}
const number_encode_unescaped = function(number) {
    if(Number.isNaN(number)) throw new Error('NaN was attempted to be encoded...');
    let float32 = new Float32Array([number]);
    let uint8 = new Uint8Array(float32.buffer, 0, 4);
    if(isBigEndian) {
        uint8.reverse();
    }
    return String.fromCharCode.apply(null, uint8);
}
const number_encode = function(number) {
    return escape(number_encode_unescaped(number));
}
const number_decode_escaped = function(string) {
    let uint8 = new Uint8Array(string_unfold(string));
    if(isBigEndian) {
        uint8.reverse();
    }
    return (new Float32Array(uint8.buffer, 0, 1))[0];
}
const number_decode = function(string) {
    return number_decode_escaped(unescape(string));
}
const number_encode_for_output = function(number) {
    if(Number.isNaN(number)) return "NaN";
    return "expression.number(\"" + number_encode(number) + "\")"
}
const number_encode_array_for_output = function(array) {
    if(array.length === 0) return "";
    let output = number_encode_for_output(array[0]);
    for(let i = 1, l = array.length; i < l; ++i) {
        output += "," + number_encode_for_output(array[i]);
    }
    return output;
}

const encode_element_expression = function(object) {
    if(typeof object === 'number') {
        return number_encode_for_output(object);
    }
    if(typeof object === 'string') {
        return "expression.string(\"" + escape(object) + "\")";
    }
    if(typeof object === 'boolean') {
        return "" + object;
    }
    if(object instanceof Array) {
        return "[" + encode_array_expression(object) + "]"
    }
}
const encode_array_expression = function(array) {
    if(array.length === 0) return "";
    let output = encode_element_expression(array[0]);
    for(let i = 1, l = array.length; i < l; ++i) {
        output += "," + encode_element_expression(array[i]);
    }
    return output;
}

//************************************************************************************************************
const extendArray = function(a, b) {
    for(let i = 0, l = b.length; i < l; ++i) {
        a.push(b[i]);
    }
}

//************************************************************************************************************
global_network_memory = "";
global_network_memory_consume_offset = 0;
const global_network_memory_reset = () => {
    global_network_memory = "";
    global_network_consume_offset = 0;
}
const global_network_memory_add = function() {
    for(let i = 0, l = arguments.length; i < l; ++i) {
        global_network_memory += arguments[i];
    }
}
const global_network_memory_add_number = function(number) {
    global_network_memory_add(number_encode_unescaped(number));
}
const global_network_memory_to_expression = () => {
    if(global_network_memory.length) {
        return "expression.string(\"" + escape(global_network_memory) + "\")";
    }
    return "";
}
const global_network_memory_get_string = (num_characters) => {
    if((global_network_consume_offset+num_characters) > global_network_memory.length)
        throw new Error("Not enought memory!");
    const result = global_network_memory.substr(global_network_consume_offset, num_characters);
    global_network_consume_offset += num_characters;
    return result;
}
const global_network_memory_get_number = () => {
    if((global_network_consume_offset+4) > global_network_memory.length)
        throw new Error("Not enought memory!");
    const result = global_network_memory.substr(global_network_consume_offset, 4);
    global_network_consume_offset += 4;
    return number_decode_escaped(result);
}

//************************************************************************************************************
// https://stackoverflow.com/a/6969486/5407843
const escapeRegExp = function (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
