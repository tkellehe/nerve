//------------------------------------------------------------------------------------------------------------
const false_maker = function*(N) { for(let i = N; i--;) yield 0; }
const array_false_maker = function*(n, m) { for(let i = n; i--;)yield ([...false_maker(m)]); }
function isSubsetSum(set, sum) {
    if (set.includes(sum)) return 1
    n = set.length;
    min = Math.abs(Math.min.apply(null, set)) + 1;
    set = set.map(item => (item+min));
    sum += n*min;
    sum_1 = sum + 1;
    n_1 = n + 1;
    subset = [...array_false_maker(n_1, sum_1)]
    for (let o = 0; o < n_1; ++o) {
        subset[o][0] = 1
        for (let k = 1; k < sum_1; ++k) {
            subset[0][k]= 0
        }
        for (let i = 1; i < n_1; ++i) {
            for (let j = 1; j < sum_1; ++j) {
                subset[i][j] = subset[i-1][j]
                if (j >= set[i-1]) {
                    subset[i][j] |= subset[i-1][j-set[i-1]]
                }
            }
        }
        return subset[n][sum]
    }
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
const signify = (x, b) => (x & (1 << (b-1)) ? (x | ~((1<<b) - 1)) : x);

//------------------------------------------------------------------------------------------------------------
const iter_signify = (a, b) => a.map(item => signify(item, b));

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
    for (let set = iterator.next().value; set != undefined; set = iterator.next().value) {
        let signified = [...iter_signify(set, bits)].sort()
        let solvable = isSubsetSum(signified, 0);
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
    return "network(mapping("+mapping+"),layers(),mapping(\"0\",\"1\")).input("+r[0]+").expected("+r[1]+")";
}
