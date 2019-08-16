//------------------------------------------------------------------------------------------------------------
function _isSubsetSum(set, n, sum) { 
   if (sum == 0) return true;
   if (n == 0 && sum != 0) return false;
   if (set[n-1] > sum) return _isSubsetSum(set, n-1, sum);
   return _isSubsetSum(set, n-1, sum) || _isSubsetSum(set, n-1, sum-set[n-1]);
}
function isSubsetSum(set, sum) {
    return _isSubsetSum(set, set.length, sum);
}

//------------------------------------------------------------------------------------------------------------
function* k_combinations(set, k) {
    const n = set.length;
    if (k > n) {
        return
    }

    let indices = [...Array(k).keys()];
    function ret() {
        let ret = [];
        for (let i=0; i < indices.length; i++) {
            ret.push(set[indices[i]])
        }
        return ret;
    }
    yield (ret());
    while (true) {
        let broken = false;
        let i = k-1;
        for (; i >= 0; i--) {
            if (indices[i] != i + n - k) {
                broken = true;
                break;
            }
        }
        if (!broken) {
            return;
        }
        indices[i]++;
        for (let j=i+1; j < k; j++) {
            indices[j] = indices[j-1] + 1;
        }
        yield ret();
    }
}

//------------------------------------------------------------------------------------------------------------
const signify = (x, m) => (~x & m) ;

//------------------------------------------------------------------------------------------------------------
const iter_signify = (a, m) => a.map(item => signify(item, b));

//------------------------------------------------------------------------------------------------------------
const range = n => Array.from(Array(n).keys());

//------------------------------------------------------------------------------------------------------------
const iter_bitify = function*(ns, b) {
    for(let i = 0; i < ns.length; ++i) {
        let n = ns[i];
        for(let j = 0; j < b; ++j) {
            yield (n & (1 << j)) ? 49 : 48;
        }
    }
} 
const bitify = (ns, b) => String.fromCharCode(...iter_bitify(ns, b))

//------------------------------------------------------------------------------------------------------------
function gen_input_expected(bits, N) {
    const iterator = k_combinations(range(1 << bits), N)
    let input = [];
    let expected = [];
    let count = 0;
    let mask = (1<<bits) - 1;
    for (let set = iterator.next().value; set != undefined; set = iterator.next().value) {
        let signified = [...iter_signify(set, mask)].sort()
        let solvable = isSubsetSum(signified, mask);
        let bitified = bitify(set, bits);
        input.push(bitified);
        expected.push(solvable ? "1" : "0");
    }
    return [input, expected];
}
function gen_input_expected_string(bits, N) {
    let r = gen_input_expected(bits, N);
    return "let input = " + JSON.stringify(r[0]) + "; let expected = " + JSON.stringify(r[1]) + ";";
}

//------------------------------------------------------------------------------------------------------------
function gen_network(bits, N) {
    let r = gen_input_expected(bits, N);
    let mapping = new Array(bits*N).fill('1');
    return "network(mapping(\""+mapping.join('","')+"\"),layers(),mapping(\"01\")).input(\""+r[0].join('","')+"\").expected(\""+r[1].join('","')+"\")";
}
