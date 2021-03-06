(function()
{

kc_sine = Math.sin;
kc_cosine = Math.cos;

KC_PI = Math.PI;

function kc_t(N, L) {
    this.N = N;
    this.harmonic_offset = 0;
    this.a0 = 0.0;
    this.a = new Array(this.N).fill(0.0);
    //this.a[0] = 1.0;

    this.b = new Array(this.N).fill(0.0);
    this.L = L;
    this.omega0 = (2.0 * KC_PI) / this.L;

    // Override learning values.
    this.DELTA = undefined;
    this.I = undefined;
    this.E = undefined;
    this.k = undefined;
    this.alphak = undefined;
};

function __kc_series(kc, t)
{
    let sum = kc.a0 / 2.0;
    for(let i = 0; i < kc.N; ++i)
    {
        let alphan = (i+1+kc.harmonic_offset) * kc.omega0;
        sum += kc.a[i] * kc_cosine(alphan * t) + kc.b[i] * kc_sine(alphan * t);
    }
    return sum;
}

function __kc_series_integral(kc, t)
{
    let sum = (kc.a0 / 2.0) * t;
    for(let i = 0; i < kc.N; ++i)
    {
        let alphan = (i+1+kc.harmonic_offset) * kc.omega0;
        sum += (kc.a[i] * kc_sine(alphan * t) - kc.b[i] * kc_cosine(alphan * t))/alphan;
    }
    return sum;
}

function __kc_series_derivative(kc, t)
{
    let sum = 0.0;
    for(let i = 0; i < kc.N; ++i)
    {
        let alphan = (i+1+kc.harmonic_offset) * kc.omega0;
        sum += (-kc.a[i] * kc_sine(alphan * t) + kc.b[i] * kc_cosine(alphan * t))*alphan;
    }
    return sum;
}

function __kc_alpha_n(kc, n)
{
    return kc.omega0 * (n+kc.harmonic_offset);
}

function __kc_a_prime_0(kc)
{
    let S = 0.0;
    
    for(let i = 0; i < kc.N; ++i)
    {
        let n = i+1;
        let alphan = __kc_alpha_n(kc, n);
        S -= (2.0 * kc_sine(alphan * kc.DELTA) * ((kc.a[n-1] * kc_cosine(alphan * kc.I)) + (kc.b[n-1] * kc_sine(alphan * kc.I))))/(alphan);
    }
    
    return (1.0/kc.L) * ((2 * kc.E * kc.DELTA) + (kc.a0 * (kc.L - kc.DELTA)) + S);
}

function __kc_C_k(kc)
{
    //return 2 * kc.E * kc.DELTA;
    return 2.0 * kc.E * kc_cosine(kc.alphak * kc.I) * kc_sine(kc.alphak * kc.DELTA) / kc.alphak;
}

function __kc_S_k(kc)
{
    //return 2 * kc.E * kc.DELTA;
    return 2.0 * kc.E * kc_sine(kc.alphak * kc.I) * kc_sine(kc.alphak * kc.DELTA) / kc.alphak;
}

function __kc_A_n_k(kc, n)
{
    if(n === kc.k)
    {
        return (kc.a[n-1] * kc.L) - 
            ((
                kc.a[n-1] * (- kc_sine(2.0 * kc.alphak * (kc.I - kc.DELTA)) + kc_sine(2.0 * kc.alphak * (kc.I + kc.DELTA)) + 4.0 * kc.alphak * kc.DELTA) +
                kc.b[n-1] * (2.0 * kc_sine(2.0 * kc.alphak * kc.DELTA) * kc_sine(2.0 * kc.alphak * kc.I))
            ) / (4.0 * kc.alphak));
    }
    else
    {
        let alphan = __kc_alpha_n(kc, n);
        let sinenImD = kc_sine(alphan * (kc.I - kc.DELTA));
        let sinenIpD = kc_sine(alphan * (kc.I + kc.DELTA));
        let sinekImD = kc_sine(kc.alphak * (kc.I - kc.DELTA));
        let sinekIpD = kc_sine(kc.alphak * (kc.I + kc.DELTA));
        let cosinenImD = kc_cosine(alphan * (kc.I - kc.DELTA));
        let cosinenIpD = kc_cosine(alphan * (kc.I + kc.DELTA));
        let cosinekImD = kc_cosine(kc.alphak * (kc.I - kc.DELTA));
        let cosinekIpD = kc_cosine(kc.alphak * (kc.I + kc.DELTA));

        let result =
            (kc.a[n-1] * (alphan * sinenImD * cosinekImD - kc.alphak * cosinenImD * sinekImD - alphan * sinenIpD * cosinekIpD + kc.alphak * cosinenIpD * sinekIpD) +
            kc.b[n-1] * (- kc.alphak * sinenImD * sinekImD - alphan * cosinenImD * cosinekImD + kc.alphak * sinenIpD * sinekIpD + alphan * cosinenIpD * cosinekIpD))
            / (alphan * alphan - kc.alphak * kc.alphak);
        return result;
    }
}

function __kc_B_n_k(kc, n)
{
    if(n === kc.k)
    {
        return (kc.b[n-1] * kc.L) -
            ((kc.a[n-1] * (2.0 * kc_sine(2.0 * kc.alphak * kc.I) * kc_sine(2.0 * kc.alphak * kc.DELTA)) + 
            kc.b[n-1] * (kc_sine(2.0 * kc.alphak * (kc.I - kc.DELTA)) - kc_sine(2.0 * kc.alphak * (kc.I + kc.DELTA)) + 4.0 * kc.alphak * kc.DELTA)
            ) / (4.0 * kc.alphak));
    }
    else
    {
        let alphan = __kc_alpha_n(kc, n);
        let sinenImD = kc_sine(alphan * (kc.I - kc.DELTA));
        let sinenIpD = kc_sine(alphan * (kc.I + kc.DELTA));
        let sinekImD = kc_sine(kc.alphak * (kc.I - kc.DELTA));
        let sinekIpD = kc_sine(kc.alphak * (kc.I + kc.DELTA));
        let cosinenImD = kc_cosine(alphan * (kc.I - kc.DELTA));
        let cosinenIpD = kc_cosine(alphan * (kc.I + kc.DELTA));
        let cosinekImD = kc_cosine(kc.alphak * (kc.I - kc.DELTA));
        let cosinekIpD = kc_cosine(kc.alphak * (kc.I + kc.DELTA));

        let result =
            (kc.a[n-1] * (alphan * sinenImD * sinekImD - kc.alphak * cosinenImD * cosinekImD - alphan * sinenIpD * sinekIpD - kc.alphak * cosinenIpD * cosinekIpD) +
            kc.b[n-1] * (kc.alphak * sinenImD * cosinekImD - alphan * cosinenImD * sinekImD - kc.alphak * sinenIpD * cosinekIpD + alphan * cosinenIpD * sinekIpD))
            / (alphan * alphan - kc.alphak * kc.alphak);
        return result;
    }
}

function __kc_a_prime_k(kc)
{
    let S = 0.0;
    for(let i = 0; i < kc.N; ++i)
    {
        let n = i+1;
        S += __kc_A_n_k(kc, n);
    }

    return (1.0/kc.L) * (__kc_C_k(kc) - ((kc.a0 * kc_cosine(kc.alphak * kc.I) * kc_sine(kc.alphak * kc.DELTA))/kc.alphak) + S);
}

function __kc_b_prime_k(kc)
{
    let S = 0.0;
    for(let i = 0; i < kc.N; ++i)
    {
        let n = i+1;
        S += __kc_B_n_k(kc, n);
    }

    return (1.0/kc.L) * (__kc_S_k(kc) - ((kc.a0 * kc_sine(kc.alphak * kc.I) * kc_sine(kc.alphak * kc.DELTA))/kc.alphak) + S);
}

//------------------------------------------------------------------------------------------------------------
//============================================================================================================
this.kc_t = kc_t;

//============================================================================================================
this.kc_predict = __kc_series;
this.kc_predict_integral = __kc_series_integral;

this.kc_predict_derivative = __kc_series_derivative;

//============================================================================================================
this.kc_transfer = function(L, R) {
    L.a0 = R.a0;
    for(let i = 0, l = R.N < L.N ? R.N : L.N; i < l; ++i) {
        L.a[i] = R.a[i];
        L.b[i] = R.b[i];
    }
    L.harmonic_offset = R.harmonic_offset;
}

//============================================================================================================
this.kc_train = function kc_train(kc, I, E, DELTA)
{
    kc.I = I;
    kc.E = E;
    kc.DELTA = DELTA;

    let a = new Array(kc.N);
    let b = new Array(kc.N);

    let a0 = __kc_a_prime_0(kc);

    // Compute all of the new coefficients where f is a piecewise function.
    for(let i = 0; i < kc.N; ++i)
    {
        kc.k = i+1;
        kc.alphak = __kc_alpha_n(kc, kc.k);
        a[i] = __kc_a_prime_k(kc);
        b[i] = __kc_b_prime_k(kc);
    }

    // Move all of the newly computed values.
    kc.a0 = a0;
    kc.a = a;
    kc.b = b;
}

//============================================================================================================
this.kc_train_a = function kc_train(kc, I, E, DELTA)
{
    kc.I = I;
    kc.E = E;
    kc.DELTA = DELTA;

    let a = new Array(kc.N);
    
    let a0 = __kc_a_prime_0(kc);

    // Compute all of the new coefficients where f is a piecewise function.
    for(let i = 0; i < kc.N; ++i)
    {
        kc.k = i+1;
        kc.alphak = __kc_alpha_n(kc, kc.k);
        a[i] = __kc_a_prime_k(kc);
    }

    // Move all of the newly computed values.
    kc.a0 = a0;
    kc.a = a;
}

//============================================================================================================
this.kc_train_b = function kc_train(kc, I, E, DELTA)
{
    kc.I = I;
    kc.E = E;
    kc.DELTA = DELTA;

    let b = new Array(kc.N);

    // Compute all of the new coefficients where f is a piecewise function.
    for(let i = 0; i < kc.N; ++i)
    {
        kc.k = i+1;
        kc.alphak = __kc_alpha_n(kc, kc.k);
        b[i] = __kc_b_prime_k(kc);
    }

    // Move all of the newly computed values.
    kc.b = b;
}

    

//============================================================================================================
//============================================================================================================
//============================================================================================================
this.kc_additive_t = function(N, L, K)
{
    this.N = N;
    this.L = L;
    this.a = new Array(this.N).fill(0.0);
    this.b = new Array(this.N).fill(0.0);
    this.n = function(n) { return n; }
    let W = L / (2.0 * K);
    let S = 2.0 * W;
    this.r_k = function(k) { return (k-1) * S; }
    this.R_k = function(k) { return (k-1) * S + W; }
    let omega0 = (2.0 * KC_PI) / this.L;
    this.alpha_n = function(n) { return omega0 * this.n(n); }
    this.train = function(k, H) {
        let r_k = this.r_k(k);
        let R_k = this.R_k(k)
        for(let i = 0, l = this.N; i < l; ++i) {
            let alpha_n = this.alpha_n(i+1);
            this.a[i] += (H/(alpha_n*this.L)) * (kc_sine(alpha_n * R_k) - kc_sine(alpha_n * r_k));
            this.b[i] += (H/(alpha_n*this.L)) * (kc_cosine(alpha_n * r_k) - kc_cosine(alpha_n * R_k));
        }
    }
    this.predict = function(I) {
        let sum = 0.0;
        for(let i = 0, l = this.N; i < l; ++i) {
            let alpha_n = this.alpha_n(i+1);
            sum += this.a[i] * kc_cosine(alpha_n * I) + this.b[i] * kc_sine(alpha_n * I);
        }
        return sum;
    }
    this.predict_k = function(k) {
        return this.predict((this.r_k(k) + this.R_k(k))/2.0);
    }
}

})();
