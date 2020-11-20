from numpy import array, uint8, uint16, warnings
from functools import partial

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

class Tid(object):
    def __init__(self, p, x, y, c, i=None):
        self.p = p
        self.x = x
        self.y = y
        self.c = c
        self.a = 0
        self.i = (lambda: 0) if i is None else i
        self.d = partial(d, n=pmmi[self.p])
    def __call__(self):
        self.y = self.d(self.d(self.d(self.d(self.d(self.i())^self.c)^self.a)^self.x)^self.y)
        self.a += 1
        return self.y

import numpy as np

# Tid(p=8, x=123, y=3, c=54) => produces primes within 835 numbers.

def find(x0=0,xN=256,y0=0,yN=256,p=0,T=100):
    b = 0
    bx = None
    by = None
    for x in range(x0,xN):
        print(x)
        for y in range(y0,yN):
            t = Tid(p, x, y, len(primes))
            o = array([t() for _ in range(T)], dtype=uint8)
            c = np.count_nonzero(np.isin(primes, o))
            if b < c:
                b = c
                bx = x
                by = y
                print(b, bx, by)
                if c == t.c:
                    return b, bx, by
    return b, bx, by
