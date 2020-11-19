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

Is = [0, 0, 0, 0]
As = [0, 1, 2, 3]
Xs = [23, 147, None, 98]
Ys = [None, None, None, None]
for Y1 in range(256):
    Ys[0] = y0(Is[0], As[0], Xs[0], Xs[1], Y1)
    if Ys[0] is not None:
        Ys[1] = Y1
        break
print(Ys)

# need: hx(Is[1], As[1], Xs[1], Ys[1]) = 