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
    if(global_network_expression_compression)
        return "number(\"" + number_encode(number) + "\")"
    return "" + number
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
        if(object === escape(object)) {
            return "\"" + object + "\"";
        }
        return "string(\"" + escape(object) + "\")";
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
        return "string(\"" + escape(global_network_memory) + "\")";
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

//************************************************************************************************************
global_network_expression_compression = true;


characters = {};
characters.correct = function(s) { return s[s.length-1] };
(function() {
let int_to_char = [
  '\u00f0','\u00ac','\u00b6','\u00a4','\u0041','\u0042','\u0043','\u0044','\u0045','\u0046','\u0047','\u0048','\u0049','\u004a','\u004b','\u004c',
  '\u004d','\u004e','\u004f','\u0050','\u0051','\u0052','\u0053','\u0054','\u0055','\u0056','\u0057','\u0058','\u0059','\u005a','\u0061','\u0062',
  '\u0063','\u0064','\u0065','\u0066','\u0067','\u0068','\u0069','\u006a','\u006b','\u006c','\u006d','\u006e','\u006f','\u0070','\u0071','\u0072',
  '\u0073','\u0074','\u0075','\u0076','\u0077','\u0078','\u0079','\u007a','\u002e','\u0021','\u003f','\u002c','\u0030','\u0031','\u0032','\u0033',
  '\u0034','\u0035','\u0036','\u0037','\u0038','\u0039','\u003a','\u003b','\u0022','\u0027','\u005f','\u003c','\u003d','\u003e','\u002a','\u002b',
  '\u002d','\u002f','\u005c','\u0040','\u0023','\u0024','\u0025','\u0026','\u005e','\u007c','\u0028','\u0029','\u005b','\u005d','\u007b','\u007d',
  '\u0060','\u007e','\u1ea0','\u1e04','\u1e0c','\u1eb8','\u1e24','\u1eca','\u1e32','\u1e36','\u1e42','\u1e46','\u1ecc','\u1e5a','\u1e62','\u1e6c',
  '\u1ee4','\u1e7e','\u1e88','\u1ef4','\u1e92','\u0226','\u1e02','\u010a','\u1e0a','\u0116','\u1e1e','\u0120','\u1e22','\u0130','\u013f','\u1e40',
  '\u1e44','\u022e','\u1e56','\u1e58','\u1e60','\u1e6a','\u1e86','\u1e8a','\u1e8e','\u017b','\u1ea1','\u1e05','\u1e0d','\u1eb9','\u1e25','\u1ecb',
  '\u1e33','\u1e37','\u1e43','\u1e47','\u1ecd','\u1e5b','\u1e63','\u1e6d','\u1ee5','\u1e7f','\u1e89','\u1ef5','\u1e93','\u0227','\u1e03','\u010b',
  '\u1e0b','\u0117','\u1e1f','\u0121','\u1e23','\u0140','\u1e41','\u1e45','\u022f','\u1e57','\u1e59','\u1e61','\u1e6b','\u1e87','\u1e8b','\u1e8f',
  '\u017c','\u0181','\u0187','\u018a','\u0191','\u0193','\u0198','\u019d','\u01a4','\u01ac','\u01b2','\u0224','\u0253','\u0188','\u0257','\u0192',
  '\u0260','\u0266','\u0199','\u0271','\u0272','\u01a5','\u02a0','\u027c','\u0282','\u01ad','\u028b','\u0225','\u00c6','\u00c7','\u00d0','\u00d1',
  '\u00d8','\u0152','\u00de','\u00df','\u00e6','\u00e7','\u0131','\u0237','\u00f1','\u00f8','\u0153','\u00fe','\u20ac','\u00a2','\u00a3','\u00a5',
  '\u2026','\u00b5','\u00a1','\u00bf','\u00d7','\u00f7','\u00a6','\u00a9','\u00ae','\u00ab','\u00bb','\u2018','\u2019','\u201c','\u201d','\u00b0',
  '\u00b9','\u00b2','\u00b3','\u2074','\u2075','\u2076','\u2077','\u2078','\u2079','\u207a','\u207b','\u207c','\u207d','\u207e','\u0020','\u000a'
];

let char_to_int = {};
(function(){
  for(let i = 0; i < 256; ++i) {
    char_to_int[characters.correct(int_to_char[i])] = i;
  }
})()

characters.int_to_char = function(i) { return int_to_char[i]; };
characters.char_to_int = function(i) { return char_to_int[i]; };
})()
