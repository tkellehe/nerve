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
    self.copy = function() {
        return new Matrix(new Float64Array(array), num_rows, num_columns);
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
    self.same_multiply = function(other) {
        let a = array;
        let o = other.array;
        let r = new Float64Array(a.length);
        for(let i = 0, l = a.length; i < l; ++i) {
            r[i] = a[i] * o[i];
        }
        return new Matrix(r, num_rows, num_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.flip_same_multiply = function(other) {
        let a = array;
        let o = other.array;
        let r = new Float64Array(a.length);
        for(let i = 0, l = a.length; i < l; ++i) {
            r[i] = a[i] * o[i];
        }
        return new Matrix(r, num_columns, num_rows);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.optimized_iadd = function(other) {
        let a = array;
        let oarray = other.array;
        for(let i = 0, l = a.length; i < l; ++i) {
            a[i] += oarray[i];
        }
        return this;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.optimized_isub = function(other) {
        let a = array;
        let oarray = other.array;
        for(let i = 0, l = a.length; i < l; ++i) {
            a[i] -= oarray[i];
        }
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
    self.ReLU = function() {
        let a = array;
        let o = new Float64Array(a.length);
        for(let i = 0, l = a.length; i < l; ++i) {
            o[i] = a[i] > 0 ? a[i] : 0;
        }
        return new Matrix(o, num_rows, num_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.softmax = function() {
        let exp = __exp;
        let a = array;
        let total = 0;
        let l = a.length;
        let o = new Float64Array(l);
        for(let i = 0; i < l; ++i) {
            let v = exp(a[i]);
            total += v;
            o[i] = v;
        }
        for(let i = 0; i < l; ++i) {
            o[i] /= total;
        }
        return new Matrix(o, num_rows, num_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.crossentropy_error = function(expected) {
        let log = __log;
        let a = array;
        let sum = 0;
        for(let i = 0, l = a.length; i < l; ++i) {
            sum += (expected[i]*log(a[i])) + ((1-expected[i])*log(1-a[i]));
            if(Number.isNaN(sum)) throw "NaN " + a[i];
        }
        return -sum;
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.crossentropy_error_derivative_at = function(y_i, i) {
        let o_i = array[i];
        return ((y_i - 1)/(1 - o_i)) - (y_i / o_i);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.crossentropy_error_derivative = function(expected) {
        let a = array;
        let l = a.length;
        let e = expected.array;
        let o = new Float64Array(l);
        for(let i = 0; i < l; ++i) {
            let y_i = e[i];
            let o_i = a[i];
            o[i] = ((y_i - 1)/(1 - o_i)) - (y_i / o_i);
        }
        return new Matrix(o, num_rows, num_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.softmax_derivative = function() {
        let exp = __exp;
        let a = array;
        let l = a.length;
        let o = new Float64Array(l);
        let total = 0;
        for(let i = 0; i < l; ++i) {
            total += a[i];
        }
        let total_2 = total*total;
        for(let i = 0; i < l; ++i) {
            o[i] = (a[i] * (total - a[i])) / total_2;
        }
        return new Matrix(o, num_rows, num_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.ReLU_derivative = function() {
        let a = array;
        let l = a.length;
        let o = new Float64Array(l);
        for(let i = 0; i < l; ++i) {
            o[i] = a[i] > 0 ? 1 : 0;
        }
        return new Matrix(o, num_rows, num_columns);
    }
    
    //--------------------------------------------------------------------------------------------------------
    self.learn = function(learning_rate, error_derivative, output_derivative, fed_derivative) {
        let nrs = num_rows;
        let ncs = num_columns;
        let o = new Float64Array(array.length);
        let a = array;
        let derror = error_derivative.array;
        let doutput = output_derivative.array;
        let dfed = fed_derivative.array;
        
        // this -> NxM
        // derror -> 1xM
        // doutput -> 1xM
        // dfed -> 1xN
        
        for(let r = 0; r < nrs; ++r) {
            let off = r*ncs;
            let h_i = dfed[r];
            for(let c = 0; c < ncs; ++c) {
                o[off+c] = a[off+c] + (learning_rate * derror[c] * doutput[c] * h_i);
            }
        }
        return new Matrix(o, nrs, ncs);
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
