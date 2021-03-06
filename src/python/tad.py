#!/usr/bin/env python3
#############################################################################################################
# Python 2 & 3 helpers
##############################################################################################################

#*************************************************************************************************************
# Import detection helpers.
__ModuleNotFoundError = None
try:
    __ModuleNotFoundError = ModuleNotFoundError
except:
    pass
if __ModuleNotFoundError is None:
    ModuleNotFoundError = ImportError
#*************************************************************************************************************

##############################################################################################################
# Settings
##############################################################################################################

#*************************************************************************************************************
OUTPUT_MODE_STRING = 's'
OUTPUT_MODE_ARRAY = 'a'

#*************************************************************************************************************
class Settings(object):
    """Provides the global settings used throughout the classes."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.has_numpy = False
        
        self.is_training = False
        self.pad_back = False
        self.byte_mode = False
        self.output_mode = OUTPUT_MODE_STRING
        
        self.input = ""
        self.code = ""
    #---------------------------------------------------------------------------------------------------------
    def validate_output_mode(self, value):
        if type(value) != str:
            return False
        value = value.lower()
        if value == 'string' or value == 'str' or value == 's':
            return 's'
        if value == 'array' or value == 'a':
            return 'a'
        return False

settings = Settings()
#*************************************************************************************************************

##############################################################################################################
# External library imports
##############################################################################################################

#*************************************************************************************************************
try:
    import numpy
    settings.has_numpy = True
except ModuleNotFoundError:
    pass
#*************************************************************************************************************

##############################################################################################################
# Nerve Errors
##############################################################################################################

#*************************************************************************************************************
class TadError(Exception):
    """Base class for Exceptions in tad."""
    pass
#*************************************************************************************************************
class NoInstanceError(TadError):
    """Error for detecting if an instance was created for an object."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, class_name=None):
        self.message = "Cannot create an instance of this class." if class_name is None else\
            "Cannot create an instance of this class: %s"%str(class_name)
        super(NoInstanceError, self).__init__(self.message)
#*************************************************************************************************************
class BadParseError(TadError):
    """Error for detecting if someone found an error on decompressing."""
    pass
#*************************************************************************************************************
class BadEncodingError(BadParseError):
    """Error for detecting if encoding an int was out-of-bounds."""
    pass
#*************************************************************************************************************
class BadDecodingError(BadParseError):
    """Error for detecting if decoding a char was out-of-bounds."""
    pass
#*************************************************************************************************************
class InputError(TadError):
    """Error for detecting if the input is bad."""
    pass
#*************************************************************************************************************

##############################################################################################################
# Constants
##############################################################################################################

#*************************************************************************************************************
ENDIAN = '<'
ENDIAN_INT = numpy.dtype(int).newbyteorder(ENDIAN).type
ENDIAN_UINT64 = numpy.dtype(numpy.uint64).newbyteorder(ENDIAN).type
def bytes_to_int(bytes):
    # return int(numpy.frombuffer(bytes, dtype=ENDIAN_UINT64))
    # python 3.2 only...
    return int.from_bytes(bytes, 'little')
def bytes_to_uint64(bytes):
    return numpy.frombuffer(bytes, dtype=ENDIAN_UINT64)
def uint64_to_bytes(value):
    # this needs to be corrected
    return numpy.frombuffer(ENDIAN_UINT64(value).tobytes(), dtype=numpy.uint8)

#*************************************************************************************************************
class NoInstance(object):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        raise NoInstanceError()
#*************************************************************************************************************
class encoding(NoInstance):
    chars = '\u00b0\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079\u00b6\u00d7\u00f7\u207a\u207b\u207c\u2260\u2264\u2265\u2261\u2248\u207d\u207e\u221e\u00bf\u00a1\u203c\u2026\u20ac\u00a2\u00a3\u00a5\u00a4\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029\u002a\u002b\u002c\u002d\u002e\u002f\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039\u003a\u003b\u003c\u003d\u003e\u003f\u0040\u0041\u0042\u0043\u0044\u0045\u0046\u0047\u0048\u0049\u004a\u004b\u004c\u004d\u004e\u004f\u0050\u0051\u0052\u0053\u0054\u0055\u0056\u0057\u0058\u0059\u005a\u005b\u005c\u005d\u005e\u005f\u0060\u0061\u0062\u0063\u0064\u0065\u0066\u0067\u0068\u0069\u006a\u006b\u006c\u006d\u006e\u006f\u0070\u0071\u0072\u0073\u0074\u0075\u0076\u0077\u0078\u0079\u007a\u007b\u007c\u007d\u007e\u1ea0\u1e04\u1e0c\u1eb8\u1e24\u1eca\u1e32\u1e36\u1e42\u1e46\u1ecc\u1e5a\u1e62\u1e6c\u1ee4\u1e7e\u1e88\u1ef4\u1e92\u1ea1\u1e05\u1e0d\u1eb9\u1e25\u1ecb\u1e33\u1e37\u1e43\u1e47\u1ecd\u1e5b\u1e63\u1e6d\u1ee5\u1e7f\u1e89\u1ef5\u1e93\u0226\u1e02\u010a\u1e0a\u0116\u1e1e\u0120\u1e22\u0130\u013f\u1e40\u1e44\u022e\u1e56\u1e58\u1e60\u1e6a\u1e86\u1e8a\u1e8e\u017b\u0227\u1e03\u010b\u1e0b\u0117\u1e1f\u0121\u1e23\u0140\u1e41\u1e45\u022f\u1e57\u1e59\u1e61\u1e6b\u1e87\u1e8b\u1e8f\u017c\u0181\u0187\u018a\u0191\u0193\u0198\u019d\u01a4\u01ac\u01b2\u0224\u0253\u0188\u0257\u0192\u0260\u0199\u0272\u01a5\u01ad\u028b\u0225\u00ab\u00bb\u2018\u2019\u201c\u201d\u0266\u0271\u02a0\u027c\u0282\u00a6\u00a9\u00ae\u00c6\u00c7\u00d1\u00d8\u00de\u00e6\u00e7\u00f1\u00f8\u00fe\u0131\u0237\u0020\u000a'
    __char_to_int = None
    #---------------------------------------------------------------------------------------------------------
    def int_to_char(value):
        try:
            return encoding.chars[int(value)]
        except:
            raise BadEncodingError("The int provided could not be turned into a char: %s"%repr(value))
    #---------------------------------------------------------------------------------------------------------
    def char_to_int(value):
        if encoding.__char_to_int is None:
            encoding.__char_to_int = {}
            for i in range(len(encoding.chars)):
                encoding.__char_to_int[encoding.int_to_char(i)] = i
        try:
            return encoding.__char_to_int[str(value)]
        except:
            raise BadDecodingError("The char provided could not be turned into an int: %s"%repr(value))
    #---------------------------------------------------------------------------------------------------------
    def tobytes(string):
        return bytearray([encoding.char_to_int(c) for c in string])
    #---------------------------------------------------------------------------------------------------------
    def frombytes(bytes):
        return ''.join([encoding.int_to_char(b) for b in bytes])
#*************************************************************************************************************

##############################################################################################################
# Tad Classes
##############################################################################################################

#*************************************************************************************************************
n0x6eed0e9da4d94a4f = numpy.uint64(0x6eed0e9da4d94a4f)
n0x2f72b4215a3d8caf = numpy.uint64(0x2f72b4215a3d8caf)
n0xffffffffffffffff = numpy.uint64(0xffffffffffffffff)
n32 = numpy.uint64(32)
n60 = numpy.uint64(60)
# Turn of numpy warnings because we know we will overflow.
numpy.warnings.filterwarnings('ignore')
def diffuse(u32):
    x = numpy.uint64(n0x6eed0e9da4d94a4f * u32) & n0xffffffffffffffff;
    a = x >> n32;
    b = x >> n60;
    x ^= a >> b;
    x *= n0x6eed0e9da4d94a4f;
    x &= n0xffffffffffffffff;
    return numpy.uint32(x);

def undiffuse(u32):
    x = numpy.uint64(n0x2f72b4215a3d8caf * u32) & n0xffffffffffffffff;
    a = x >> n32;
    b = x >> n60;
    x ^= a >> b;
    x *= n0x2f72b4215a3d8caf;
    x &= n0xffffffffffffffff;
    return numpy.uint32(x);

class Hash32(object):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.a = numpy.uint32(0)
        self.b = numpy.uint32(0)
    #---------------------------------------------------------------------------------------------------------
    def hash(self, st):
        l = len(st)
        t = l & 1
        i = 0
        while i < l:
            self.a ^= numpy.uint32(st[i])
            self.b ^= numpy.uint32(st[i])
            self.a = diffuse(self.a)
            self.b = diffuse(self.b)
            i += 2
        if t:
            self.a ^= numpy.uint32(st[-1])
            self.a = diffuse(self.a)
            self.b = diffuse(self.b)
        h = numpy.uint32(self.a)
        h ^= self.b
        return numpy.uint32(h ^ l)
    #---------------------------------------------------------------------------------------------------------
    def unhash(self, st):
        l = len(st)
        t = l & 1
        i = 0
        while i < l:
            self.a ^= numpy.uint32(st[i])
            self.b ^= numpy.uint32(st[i])
            self.a = undiffuse(self.a)
            self.b = undiffuse(self.b)
            i += 2
        if t:
            self.a ^= numpy.uint32(st[-1])
            self.a = undiffuse(self.a)
            self.b = undiffuse(self.b)
        h = numpy.uint32(self.a)
        h ^= self.b
        return numpy.uint32(h ^ l)

#*************************************************************************************************************
class Tad(object):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, array, dim=2,
                 growable=True, ageable=True, livable=False, zeroable=True, reevaluateable=False,
                 cmp_reversed=True, hashable=True):
        self.dim = dim
        self.nb = len(array) - self.dim - 1
        self.st = numpy.zeros(len(array) + 8, dtype=numpy.uint8)
        self.st[0:self.nb+1] = array[0:self.nb+1]
        self.st[self.nb+9:] = array[self.nb+1:]
        self.gv = numpy.zeros(self.dim)
        self.lf = numpy.uint8(0)
        self.a0 = self.nb + 1
        self.a1 = self.nb + 9
        self.h = Hash32()
        self.growable = growable
        self.ageable = ageable
        self.livable = livable
        self.zeroable = zeroable
        self.reevaluateable = reevaluateable
        self.cmp_reversed = cmp_reversed
        self.hashable = hashable
    #---------------------------------------------------------------------------------------------------------
    def goal(self):
        # 2d algorithm
        if self.hashable:
            h = self.h.hash()
        else:
            h = numpy.uint32(0)
            for b in self.st:
                h = diffuse(h ^ numpy.uint32(b))
        if self.reevaluateable:
            self.st[self.nb] = numpy.uint8(h >> 24)
        self.gv[0] = numpy.uint8(h >> 16)
        self.gv[1] = numpy.uint8(h >> 8)
        self.lf = numpy.uint8(h)
    #---------------------------------------------------------------------------------------------------------
    def grow(self):
        st = numpy.append(self.st, numpy.zeros(self.dim - 1, dtype=numpy.uint8))
        st[-self.dim:] = self.st[-self.dim:]
        del self.st
        self.st = st
    #---------------------------------------------------------------------------------------------------------
    def move(self):
        if self.livable:
            self.lf = numpy.uint8(self.lf - 1)
        v = self.st[-self.dim:]
        for i in range(self.dim):
            x = v[i]
            gx = self.gv[i]
            dx0 = x - gx
            dx1 = gx - x
            if self.cmp_reversed:
                # This is wrong per the theorem and JS version... but already computed a lot.
                self.st[-(i + 1)] += -1 if dx0 < dx1 else 1;
            else:
                self.st[-(self.dim - i)] += -1 if dx0 < dx1 else 1;
    #---------------------------------------------------------------------------------------------------------
    def age(self):
        return bytes_to_uint64(self.st[self.a0:self.a1])
    #---------------------------------------------------------------------------------------------------------
    def tick(self):
        self.st[self.a0:self.a1] = uint64_to_bytes(self.age() + numpy.uint64(1))
    #---------------------------------------------------------------------------------------------------------
    def update(self):
        pt = None
        if self.st[-1] == self.st[self.nb]:
            pt = self.st[-self.dim:-1]
            if self.growable:
                self.grow()
            self.goal()
        self.tick()
        # Since there are passes when the life can be zero, it will make it very
        # difficult to reverse this process.
        if (self.lf == 0 and self.zeroable) or (self.st[-self.dim:] == self.gv).all():
            self.goal()
        else:
            self.move()
        return pt

##############################################################################################################
# Tad Parser
##############################################################################################################

#*************************************************************************************************************
class TadParser(object):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.output = []
        self.tads = []
        self.ptlimit = 0
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, string):
        bytes = encoding.tobytes(string)
        # The smallest tad program is just the tad to run and the number of points allowed until death.
        if len(bytes) == 4:
            self.ptlimit = int(bytes[0]) + 1
            self.tads.append(Tad(bytes[1:]))
    #---------------------------------------------------------------------------------------------------------
    def age(self):
        return self.tads[0].age()
    #---------------------------------------------------------------------------------------------------------
    def __len__():
        return len(self.tostring())
    #---------------------------------------------------------------------------------------------------------
    def step(self):
        for tad in self.tads:
            pt = tad.update()
            if pt is not None:
                self.output.append(bytes_to_int(pt))
    #---------------------------------------------------------------------------------------------------------
    def run(self):
        while self.ptlimit:
            for tad in self.tads:
                pt = tad.update()
                if pt is not None:
                    self.output.append(bytes_to_int(pt))
                    self.ptlimit -= 1
                    if self.ptlimit == 0:
                        break
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        return encoding.frombytes(self.output)
    #---------------------------------------------------------------------------------------------------------
    def display(self):
        if settings.output_mode == OUTPUT_MODE_STRING:
            return self.tostring()
        elif settings.output_mode == OUTPUT_MODE_ARRAY:
            return repr(self.output)

##############################################################################################################
# Executable Controls.
##############################################################################################################

#*************************************************************************************************************
try:
    __force_main = FORCE_MAIN
except:
    __force_main = False

#*************************************************************************************************************
class RuleSet(object):
    def __init__(self):
        pass
    def check(self, parser):
        # None => keep going
        # False => Kill
        # True => Found
        return None

#*************************************************************************************************************
class RuleSetPrimes54(RuleSet):
    def __init__(self):
        super(RuleSetPrimes54, self).__init__()
        self.primes = [\
              2,   3,   5,   7,  11,  13,  17,  19,  23,  29,\
             31,  37,  41,  43,  47,  53,  59,  61,  67,  71,\
             73,  79,  83,  89,  97, 101, 103, 107, 109, 113,\
            127, 131, 137, 139, 149, 151, 157, 163, 167, 173,\
            179, 181, 191, 193, 197, 199, 211, 223, 227, 229,\
            233, 239, 241, 251\
        ]
    def check(self, parser):
        if len(parser.output) == 0:
            return None
        o = numpy.unique(parser.output)
        if len(o) != len(parser.output):
            return False
        if numpy.all(numpy.isin(o, self.primes)):
            return True if len(o) == len(self.primes) else None
        return False

#*************************************************************************************************************
def search(ruleset, start=0, end=None, dim=2, step_to_output_limit=10000):
    if end is None:
        end = 1 << ((dim + 1) << 3)
    best = None
    best_st = None
    best_i = None
    for i in range(start, end):
        if i % 1000 == 0:
            print(i)
        step_count = 0
        last_output_len = 0
        val = uint64_to_bytes(numpy.uint64(i))
        st = val[0:dim+1]
        # print('working:', st)
        parser = TadParser()
        parser.tads.append(Tad(st))
        l = 0
        check = None
        while check is None:
            if last_output_len != len(parser.output):
                step_count = 0
                last_output_len = len(parser.output)
                if parser is best:
                    print(best_i, best_st, best.display())
            elif step_to_output_limit is not None:
                step_count += 1
                if step_count >= step_to_output_limit:
                    # print('reached max steps...', i, st, parser.display())
                    check = False
                    break
            parser.step()
            check = ruleset.check(parser)
            if (check is None or check) and \
                (best is None or (len(best.output) < len(parser.output)) or \
                    (len(best.output) == len(parser.output) and best.age() > parser.age())):
                best = parser
                best_st = st
                best_i = i
                print(best_i, best_st, best.display())
        # We found the golden ticket.
        if check:
            break
    print('done', best_i, best_st, best.display())

#*************************************************************************************************************
def parse_argv(argv, input):
    # Process all of the different settings.
    settings.input = input
    settings.code = ""
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == '-i' or arg == '--input':
            i += 1
            try:
                settings.input += argv[i]
            except IndexError:
                raise InputError("Not enough arguments provided for '%s' option: %s"%(arg, repr(argv)))
        elif arg == '-c' or arg == '--code':
            i += 1
            try:
                settings.code += argv[i]
            except IndexError:
                raise InputError("Not enough arguments provided for '%s' option: %s"%(arg, repr(argv)))
        elif arg == '-b' or arg == '--byte-mode':
            settings.byte_mode = True
        elif arg == '-e' or arg == '--encoding-mode':
            settings.byte_mode = False
        elif arg == '-t' or arg == '--output-mode':
            i += 1
            try:
                output_mode = settings.validate_output_mode(argv[i])
                if output_mode:
                    settings.output_mode = output_mode
                else:
                    raise InputError("Invalid output mode provided with '%s' option: %s"%(arg, repr(argv)))
            except IndexError:
                raise InputError("Not enough arguments provided for '%s' option: %s"%(arg, repr(argv)))
        i += 1

#*************************************************************************************************************
def main(code=None):
    if not settings.has_numpy:
        raise TadError("The module 'numpy' is needed for tad to work.")
    if code is not None:
        settings.code += code
    if settings.byte_mode:
        settings.code = settings.code.encode('latin1').decode('unicode-escape').encode('latin1')
        settings.code = encoding.frombytes(settings.code)
    settings.parser = TadParser()
    settings.parser.fromstring(settings.code)
    settings.parser.run()
    print(settings.parser.display())

#*************************************************************************************************************
try:
    if __name__ == "__main__" or __force_main:
        import sys
        # parse_argv(sys.argv, sys.stdin.read())
        parse_argv(sys.argv, "")
        main()
except Exception as e:
    if __force_main:
        print(e)
    else:
        raise
