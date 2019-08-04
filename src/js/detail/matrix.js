//------------------------------------------------------------------------------------------------------------
const makeArray = function makeArray_arglist() {
    return new Float64Array(arguments);
}

//------------------------------------------------------------------------------------------------------------
const Matrix = function MatrixRxC(array, num_rows, num_columns) {
    let self = this;
    self.array = array;
    self.num_rows = num_rows;
    self.num_columns = num_columns;

    self.access = function access_rc(r, c) {
        return array[r*num_rows + c]
    }

    self.multiply = function multiply(other) {
        let onum_columns = other.num_columns;
        let onum_rows = other.num_rows;
        let result = new MatrixRxC(new Float64Array());
        for(let i = 0; i < num_rows; ++i) {
            for(let j = 0; j < onum_columns; ++j) {
                let off
            }
        }
    }
}