//************************************************************************************************************
const makeArray = function makeArray_arglist() {
    return new Float64Array(arguments);
}

//************************************************************************************************************
const makeArrayAllZeros = function(size) {
    return new Float64Array(size);
}

//************************************************************************************************************
const makeArrayAllOnesHelper = function*(size) { while(size--) yield 1.0 }
const makeArrayAllOnes = function(size) {
    return new Float64Array(makeArrayAllOnesHelper(size));
}

//************************************************************************************************************
const extendArray = function(a, b) {
    b.unshift(b.length);
    b.unshift(a.length);
    Array.prototype.splice.apply(a, b);
    b.shift();
    b.shift();
}

//************************************************************************************************************
const __exp = Math.exp;
const __log = Math.log2;

//************************************************************************************************************
const Matrix = function MatrixRxC(array, num_rows, num_columns) {
    let self = this;
    self.array = array;
    self.num_rows = num_rows;
    self.num_columns = num_columns;

    //--------------------------------------------------------------------------------------------------------
    self.access = function(r, c) {
        return array[r*num_columns + c]
    }

    //--------------------------------------------------------------------------------------------------------
    self.multiply = function(other) {
        let nrs = num_rows;
        let ncs = num_columns;
        let onum_columns = other.num_columns;
        let onum_rows = other.num_rows;
        let a = array;
        let oarray = other.array;
        let result = new Float64Array(nrs*onum_columns);
        for(let i = 0; i < nrs; ++i) {
            let off = i*onum_columns;
            let toff = i*ncs;
            for(let j = 0; j < onum_columns; ++j) {
                let pos = off + j;
                for(let k = 0; k < onum_rows; ++k) {
                    result[pos] += a[toff + k] * oarray[k*onum_columns + j];
                }
            }
        }
        return new Matrix(result, nrs, onum_columns);
    }

    //--------------------------------------------------------------------------------------------------------
    self.iadd = function(other) {
        let nrs = num_rows;
        let ncs = num_columns;
        let oarray = other.array;
        let a = array;
        for(let i = 0; i < nrs; ++i) {
            let off = i*ncs;
            for(let j = 0; j < ncs; ++j) {
                a[off + j] += oarray[off + j];
            }
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.optimized_multiply = function(other) {
        let ncs = num_columns;
        let onum_columns = other.num_columns;
        let onum_rows = other.num_rows;
        let a = array;
        let oarray = other.array;
        let result = new Float64Array(onum_columns);
        for(let j = 0; j < onum_columns; ++j) {
            for(let k = 0; k < onum_rows; ++k) {
                result[j] += a[k] * oarray[k*onum_columns + j];
            }
        }
        return new Matrix(result, 1, onum_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.optimized_iadd = function(other) {
        let a = array;
        let oarray = other.array;
        a.forEach(function(v, index) {
            a[index] += oarray[index];
        }, a)
        return this;
    }

    //--------------------------------------------------------------------------------------------------------
    self.iReLU = function() {
        let a = array;
        for(let i = 0, l = a.length; i < l; ++i) {
            a[i] = a[i] > 0 ? a[i] : 0;
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.isoftmax = function() {
        let exp = __exp;
        let a = array;
        let total = 0;
        let l = a.length;
        for(let i = 0; i < l; ++i) {
            let v = exp(a[i]);
            total += v;
            a[i] = v;
        }
        for(let i = 0; i < l; ++i) {
            a[i] /= total;
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.crossentropy_error = function(expected) {
        let log = __log;
        let a = array;
        let n = a.length;
        let sum = 0;
        for(let i = 0; i < n; ++i) {
            sum += (expected[i]*log(a[i])) + ((1-expected[i])*log(1-a[i]));
        }
        return -sum / n;
    }
}

//------------------------------------------------------------------------------------------------------------
Matrix.prototype.toString = function() {
    let output = "[\n";
    let nrs = this.num_rows;
    let ncs = this.num_columns;
    for(let i = 0; i < nrs; ++i) {
        output += " ";
        for(let j = 0; j < ncs; ++j) {
            output += this.access(i, j) + ", ";
        }
        output += "\n";
    }
    return output+"]";
};

//************************************************************************************************************
const makeMatrix = function makeMatrix_arglist_nr_nc() {
    arguments.length -= 2;
    return new Matrix(new Float64Array(arguments), arguments[arguments.length], arguments[arguments.length+1]);
}

//************************************************************************************************************
const stringToArrayHelper = function*(s) { for(let c = 0, l = s.length; c < l; ++c) yield s.charCodeAt(c) }
const stringToArray = function(s) { return new Float64Array(stringToArrayHelper(s)) }

//************************************************************************************************************
const stringToArrayFrontPaddingHelper = function*(s, m, p) { for(let i = m-s.length; i--;) yield p; for(let c = 0, l = s.length; c < l; ++c) yield s.charCodeAt(c) }
const stringToArrayFrontPadding = function(s, m, p=0) { return new Float64Array(stringToArrayFrontPaddingHelper(s, m, p)) }

//************************************************************************************************************
const stringToArrayBackPaddingHelper = function*(s, m, p) { for(let c = 0, l = s.length; c < l; ++c) yield s.charCodeAt(c); for(let i = m-s.length; i--;) yield p }
const stringToArrayBackPadding = function(s, m, p=0) { return new Float64Array(stringToArrayBackPaddingHelper(s, m, p)) }

//************************************************************************************************************
const stringAlreadyArrayToMatrix = function(s) {
    return new Matrix(s, 1, s.length);
}
