from numpy import array, uint8, uint16, warnings
from functools import partial
import numpy as np

# Turn of numpy warnings because we know we will overflow.
warnings.filterwarnings('ignore')
def d(v, n):
    x = uint8(n * v)
    a = x >> 4
    b = x >> 6
    x ^= a >> b
    x *= n
    return uint8(x)

# prime_modmult_inverses
pmmip = [(11, 163), (13, 197), (17, 241), (23, 167), (29, 53), (31, 223), (37, 173), (43, 131), (53, 29), (67, 107), (89, 233), (101, 109), (107, 67), (109, 101), (127, 127), (131, 43), (157, 181), (163, 11), (167, 23), (173, 37), (181, 157), (197, 13), (223, 31), (233, 89), (241, 17)]
pmmi = [x for x,_ in pmmip]

bpmmi = [29, 101, 131, 173, 241, 181, 107, 233]

mmi = []
for x in range(256):
    for y in range(256):
        if uint8(x*y) == 1:
            mmi.append((x,y))

def hh(d, I, A, X, Y):
    return d(d(d(d(I)^A)^X)^Y)
def uhh(u, h, I, A, X, Y):
    return u(u(u(u(h)^Y)^X)^A)^I

def y0(I0, A0, X0, X, Y):
    for Y0 in range(256):
        if hh(partial(d, n=pmmi[0]), I0, A0, X0, Y0) == X and hh(partial(d, n=pmmi[1]), I0, A0, X0, Y0) == Y:
            return Y0

def xy0(I0, A0, X, Y):
    for X0 in range(256):
        Y0 = y0(I0, A0, X0, X, Y)
        if Y0 is not None:
            return X0, Y0

# Is = [0, 0, 0, 0]
# As = [0, 1, 2, 3]
# Xs = [23, 147, None, 98]
# Ys = [None, None, None, None]
# for Y1 in range(256):
#     Ys[0] = y0(Is[0], As[0], Xs[0], Xs[1], Y1)
#     if Ys[0] is not None:
#         Ys[1] = Y1
#         break
# print(Ys)


primes = array([\
      2,   3,   5,   7,  11,  13,  17,  19,  23,  29,\
     31,  37,  41,  43,  47,  53,  59,  61,  67,  71,\
     73,  79,  83,  89,  97, 101, 103, 107, 109, 113,\
    127, 131, 137, 139, 149, 151, 157, 163, 167, 173,\
    179, 181, 191, 193, 197, 199, 211, 223, 227, 229,\
    233, 239, 241, 251\
], dtype=uint8)

class Constant(object):
    def __init__(self, c):
        self.c = c
    def __call__(self):
        return self.c

def remove_last_occurance(l, v):
    for i in range(len(l)-1, -1, -1):
        if v == l[i]:
            del l[i]
            break

class Pickah(object):
    def __init__(self, p, c, k, H=1, i=None):
        self.p = p
        self.i = Constant(0) if i is None else i
        self.c = c
        self.k = k
        self.a = 0
        self.H = H
        self._h = 0
        self.h = np.zeros(H, dtype=uint8)
        self.d = partial(d, n=bpmmi[self.p])
    def __repr__(self):
        return repr((self.p, self.c, self.k, self.H))
    def __str__(self):
        return repr(self)
    def __call__(self):
        r = self.d(self.d(self.d(self.d(self.i())^self.c)^self.k)^self.a)
        for h in self.h:
            r = self.d(r^h)
        self.a = uint8(self.a + 1)
        if self.H:
            self.h[self._h] = r
            self._h = (self._h + 1) % self.H
        return r

class Tid(object):
    def __init__(self, k, pro, con, n=1):
        self.k = k
        self.pro = pro
        self.pro.k = self.k
        self.con = con
        self.con.k = self.k
        self.n = n
        self.results = []
    def __call__(self):
        p = self.pro()
        self.results.append(p)
        for _ in range(self.n):
            c = self.con()
            remove_last_occurance(self.results, c)
        if len(self.results) == self.k+1:
            return self.results[0:self.k]
    def r(self):
        return self.results[0:self.k]
    def run(self, T=None):
        if T is None:
            while self() is None:
                pass
        else:
            for _ in range(T):
                self()
        return self.r()

def find_primes(p0=0, pN=256, c0=0, cN=256, pp=0, pH=1, cp=0, cH=1, T=100, n=1):
    b = 0
    bpc = None
    bcc = None
    search = primes[0:10]
    for pc in range(p0, p0+pN):
        print(pc)
        pro = Pickah(p=pp, c=pc, k=len(search), H=pH)
        for cc in range(c0, c0+cN):
            con = Pickah(p=cp, c=cc, k=len(search), H=cH)
            t = Tid(len(search), pro, con, n=n)
            r = None
            for _ in range(T):
                r = t()
                if r is not None:
                    break
            r = t()
            z = np.count_nonzero(np.isin(search, r))
            if b < z:
                b = z
                bpc = pc
                bcc = cc
                print(b, bpc, bcc)
                if b == len(search):
                    return b, bpc, bcc
    return b, bpc, bcc

# Maybe new concept is to produce neural networks from DNA like things...

def find_pickah_with_most(l, is_ordered=False, k=None, debug=True):
    b = 0
    bP = None
    l = array(l)
    k = len(l) if k is None else k
    # Created a current best range of pmmis.
    # That way can determine between a sub vs add.
    for p in range(8):
        for H in range(16):
            if debug:
                print("    %i %i"%(p, H))
            for c in range(256):
                P = Pickah(p=p, c=c, H=H, k=k)
                r = [P() for _ in range(k)]
                z = np.count_nonzero((l == r) if is_ordered else np.isin(l, r))
                if b < z:
                    b = z
                    bP = P
                    print(b, bP)
                    if k == b:
                        return b, bP
    return b, bP