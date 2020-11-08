#! /bin/env python
##############################################################################################################
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
class Settings(object):
    """Provides the global settings used throughout the classes."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.has_numpy = False
        
        self.is_training = False
        self.pad_back = False
        self.byte_mode = False
        
        self.input = ""
        self.code = ""
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
    return numpy.frombuffer(bytes, dtype=ENDIAN_INT)
def bytes_to_uint64(bytes):
    return numpy.frombuffer(bytes, dtype=ENDIAN_UINT64)
def uint64_to_bytes(value):
    # this needs to be corrected
    return ENDIAN_UINT64(value).tobytes()

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
n0xffffffffffffffff = numpy.uint64(0xffffffffffffffff)
n32 = numpy.uint64(32)
n60 = numpy.uint64(60)
def diffuse(u32):
    x = numpy.uint64(n0x6eed0e9da4d94a4f * u32) & n0xffffffffffffffff;
    a = x >> n32;
    b = x >> n60;
    x ^= a >> b;
    x *= n0x6eed0e9da4d94a4f;
    x &= n0xffffffffffffffff;
    return numpy.uint32(x);

#*************************************************************************************************************
class Tad(object):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, array, dim=2):
        self.dim = dim
        self.nb = len(array) - self.dim - 1
        self.st = numpy.zeros(len(array) + 8, dtype=numpy.uint8)
        self.st[0:self.nb+1] = array[0:self.nb+1]
        self.st[self.nb+9:] = array[self.nb+1:]
        self.gv = numpy.zeros(self.dim)
        self.lf = numpy.uint8(0)
        self.a0 = self.nb + 1
        self.a1 = self.nb + 9
        self.a = numpy.uint32(0)
        self.b = numpy.uint32(0)
    #---------------------------------------------------------------------------------------------------------
    def goal(self):
        # 2d algorithm
        l = len(self.st)
        t = l & 1
        i = 0
        while i < l:
            self.a ^= self.st[i]
            self.b ^= self.st[i]
            self.a = diffuse(self.a)
            self.b = diffuse(self.b)
            i += 2
        if t:
            self.a ^= self.st[-1]
            self.a = diffuse(self.a)
            self.b = diffuse(self.b)
        r = numpy.uint32(self.a)
        r ^= self.b
        r ^= l
        self.gv[0] = numpy.uint8(r >> 16)
        self.gv[1] = numpy.uint8(r >> 8)
        self.lf = numpy.uint8(r)
    #---------------------------------------------------------------------------------------------------------
    def grow(self):
        st = numpy.zeros(len(self.st) + self.dim - 1, dtype=numpy.uint8)
        st[0:len(self.st)] = self.st
        st[-self.dim:] = self.st[-self.dim]
        del self.st
        self.st = st
    #---------------------------------------------------------------------------------------------------------
    def move(self):
        v = self.st[-self.dim:]
        for i in range(self.dim):
            x = v[i]
            gx = self.gv[i]
            dx0 = x - gx
            dx1 = gx - x
            if dx0 < dx1:
                self.st[-(i + 1)] -= 1;
            elif dx0 > dx1:
                self.st[-(i + 1)] += 1;
    #---------------------------------------------------------------------------------------------------------
    def tick(self):
        age = bytes_to_uint64(self.st[self.a0:self.a1])
        self.st[self.a0:self.a1] = uint64_to_bytes(age + numpy.uint64(1))
    #---------------------------------------------------------------------------------------------------------
    def update(self):
        pt = None
        if self.st[-1] == self.st[self.nb]:
            pt = self.st[-self.dim:-1]
            self.grow()
            self.goal()
        self.tick()
        if (self.lf == 0) or (self.st[-self.dim:] == self.gv):
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
    def fromstring(self, string):
    #---------------------------------------------------------------------------------------------------------
        bytes = encoding.tobytes(string)
        # The smallest tad program is just the tad to run and the number of points allowed until death.
        if len(bytes) == 4:
            self.ptlimit = int(bytes[0]) + 1
            self.tads.append(Tad(bytes[1:]))
    #---------------------------------------------------------------------------------------------------------
    def run(self, string):
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

##############################################################################################################
# Executable Controls.
##############################################################################################################

#*************************************************************************************************************
try:
    __force_main = FORCE_MAIN
except:
    __force_main = False

#*************************************************************************************************************
def parse_argv(argv, input):
    # Process all of the different settings.
    settings.input = input
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == '-i' or arg == '--input':
            i += 1
            try:
                settings.input += argv[i]
            except:
                raise InputError("Not enough arguments provided for '-i' option: %s"%repr(argv))
        elif arg == '-c' or arg == '--code':
            i += 1
            try:
                settings.code += argv[i]
            except:
                raise InputError("Not enough arguments provided for '-c' option: %s"%repr(argv))
        elif arg == '-b' or arg == '--byte-mode':
            settings.byte_mode = True
        elif arg == '-e' or arg == '--encoding-mode':
            settings.byte_mode = False
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
    print(settings.parser.tostring())

#*************************************************************************************************************
try:
    if __name__ == "main" or __force_main:
        import sys
        parse_argv(sys.argv, sys.stdin.read())
        main()
except Exception as e:
    if __force_main:
        print(e)
    else:
        raise