//************************************************************************************************************
const isLittleEndian = ((new Uint32Array((new Uint8Array([1,2,3,4])).buffer))[0] === 0x04030201)
const isBigEndian = !isLittleEndian;

const number_encode = function(number) {
    if(Number.isNaN(number)) return NaN;
    let float32 = new Float32Array([number]);
    let uint8 = new Uint8Array(float32.buffer, 0, 4);
    if(isBigEndian) {
        uint8.reverse();
    }
    return escape(String.fromCharCode.apply(null, uint8));
}
const number_decode = function(string) {
    let uint8 = new Uint8Array(network_string_unfold(unescape(string)));
    if(isBigEndian) {
        uint8.reverse();
    }
    return (new Float32Array(uint8.buffer, 0, 1))[0];
}
const number_encode_for_output = function(number) {
    if(Number.isNaN(number)) return "NaN";
    return "expression.number(\"" + number_encode(number) + "\")"
}
const number_encode_array_for_output = function(array) {
    let output = number_encode_for_output(array[0]);
    for(let i = 1, l = array.length; i < l; ++i) {
        output += "," + number_encode_for_output(array[i]);
    }
    return output;
}

//************************************************************************************************************
const extendArray = function(a, b) {
    for(let i = 0, l = b.length; i < l; ++i) {
        a.push(b[i]);
    }
}
