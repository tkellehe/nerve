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
# Pointer Type
##############################################################################################################

#*************************************************************************************************************
class Ptr(object):
    """Takes an object or value and presents it as a pointer."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, obj=None, attr=None):
        self.point(obj, attr)
    #---------------------------------------------------------------------------------------------------------
    def point(self, obj, attr=None):
        self._obj = obj
        self._attr = attr
    #---------------------------------------------------------------------------------------------------------
    def __getattr__(self, value):
        obj = getattr(self, "_obj")
        attr = getattr(self, "_attr")
        return getattr(obj, value) if attr is None else getattr(getattr(obj, attr), value)
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
        
        self.instream = Ptr()
        self.outstream = Ptr()
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
class NerveError(Exception):
    """Base class for Exceptions in nerve."""
    pass
#*************************************************************************************************************
class NoInstanceError(NerveError):
    """Error for detecting if an instance was created for an object."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, class_name=None):
        self.message = "Cannot create an instance of this class." if class_name is None else\
            "Cannot create an instance of this class: %s"%str(class_name)
        super(NoInstanceError, self).__init__(self.message)
#*************************************************************************************************************
class BadParseError(NerveError):
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
class InputError(NerveError):
    """Error for detecting if the input is bad."""
    pass
#*************************************************************************************************************
class ProcessingError(NerveError):
    """An error occurred while processing the network."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, exception):
        super(ProcessingError, self).__init__("Encountered error on processing: %s"%(str(exception)))
#*************************************************************************************************************
class TrainingError(NerveError):
    """An error occurred while training the network."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, exception):
        super(TrainingError, self).__init__("Encountered error on training: %s"%(str(exception)))
#*************************************************************************************************************
class LearningError(NerveError):
    """Base class error for detecting when learning."""
#*************************************************************************************************************
class LearningPassedError(LearningError):
    """An error used to detect if the output was correct."""
#*************************************************************************************************************
class LearningFailedError(LearningError):
    """An error used to detect if the output was incorrect."""
#*************************************************************************************************************

##############################################################################################################
# Constants
##############################################################################################################

#*************************************************************************************************************
ENDIAN = '<'
ENDIAN_UINT16 = numpy.dtype(numpy.uint16).newbyteorder(ENDIAN).type
ENDIAN_FLOAT16 = numpy.dtype(numpy.float16).newbyteorder(ENDIAN).type
ENDIAN_FLOAT32 = numpy.dtype(numpy.float32).newbyteorder(ENDIAN).type
ENDIAN_FLOAT64 = numpy.dtype(numpy.float64).newbyteorder(ENDIAN).type
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
# Encodables
##############################################################################################################

#*************************************************************************************************************
class Encodable(object):
    """Base class for handling encodable objects."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        pass
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        return ""
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        return "", content
#*************************************************************************************************************
class EncodableFloat16(Encodable):
    """The floating point number used in arithmetic that can be compressed."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, value=0.0):
        self._value = numpy.float16(float(value))
        super(EncodableFloat16, self).__init__()
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return str(self._value)
    #---------------------------------------------------------------------------------------------------------
    @property
    def value(self):
        return self._value
    #---------------------------------------------------------------------------------------------------------
    @value.setter
    def value(self, value):
        self._value = numpy.float16(float(value))
    #---------------------------------------------------------------------------------------------------------
    def __float__(self):
        return float(self._value)
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        try:
            buffer = ENDIAN_FLOAT16(self.value).tobytes()
            return "%s%s"%(encoding.int_to_char(buffer[0]), encoding.int_to_char(buffer[1]))
        except BadEncodingError:
            raise
        except Exception as e:
            raise BadEncodingError("Failed to compress float16 to string: %s"%str(e))
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        try:
            sub_content = content[0:2]
            content = content[2:]
            buffer = numpy.array([
                encoding.char_to_int(sub_content[0]), encoding.char_to_int(sub_content[1])
            ], dtype=numpy.uint8)
            value = numpy.frombuffer(buffer, dtype=ENDIAN_FLOAT16)
            self._value = value.newbyteorder('=')
            return sub_content, content
        except BadDecodingError:
            raise
        except Exception as e:
            raise BadDecodingError("Failed to convert float16 from string: %s"%str(e))
#*************************************************************************************************************

##############################################################################################################
# Streams
##############################################################################################################

#*************************************************************************************************************
class BaseStream(object):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self._content = numpy.array([], dtype=bool)
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return str(self._content)
    #---------------------------------------------------------------------------------------------------------
    def __len__(self):
        return len(self._content)
    #---------------------------------------------------------------------------------------------------------
    def read(self, count=8, keep=False):
        return numpy.array([False]*count, dtype=bool)
    #---------------------------------------------------------------------------------------------------------
    def read_str(self, count=1, keep=False):
        bools = self.read(count << 3, keep)
        return "".join([chr(bools_to_ord(bools[i:i+8])) for i in range(0, len(bools), 8)])
    #---------------------------------------------------------------------------------------------------------
    def write(self, value):
        pass
    #---------------------------------------------------------------------------------------------------------
    def tostring(self, keep=True):
        bools = self.read(len(self) + bool(len(self)&7), keep)
        return "".join([chr(bools_to_ord(bools[i:i+8])) for i in range(0, len(bools), 8)])
#*************************************************************************************************************
class Stream(BaseStream):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        super(Stream, self).__init__()
    #---------------------------------------------------------------------------------------------------------
    def read(self, count=8, keep=False):
        grab = min(count, len(self._content))
        result = self._content[:grab]
        if not keep:
            self._content = self._content[grab:]
        if len(result) < count:
            return numpy.append(result, [False]*(count - len(result))) \
                if settings.pad_back else numpy.append([False]*(count - len(result)), result)
        return result
    #---------------------------------------------------------------------------------------------------------
    def write(self, value):
        t = type(value)
        if t is bool or t is numpy.bool_:
            self._content = numpy.append(self._content, value)
        elif t is int or t is numpy.uint8:
            # Assume only the first byte.
            self._content = numpy.append(
                self._content,
                numpy.array([
                    value&128, value&64, value&32, value&16,
                    value&8, value&4, value&2, value&1
                ], dtype=bool)
            )
        elif t is str:
            self._content = numpy.append(
                self._content,
                [
                    numpy.array([
                        v&128, v&64, v&32, v&16,
                        v&8, v&4, v&2, v&1
                    ], dtype=bool) for x in value for v in (ord(x),)
                ]
            )
        else:
            try:
                for v in value:
                    self.write(v)
            except NerveError:
                raise
            except Exception:
                raise InputError("The input provided cannot be placed into the stream: %s"%repr(value))
#*************************************************************************************************************
class TrainingStream(Stream):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        super(TrainingStream, self).__init__()
        self._expected = Stream()
    #---------------------------------------------------------------------------------------------------------
    def write(self, value):
        end = len(self)
        super(TrainingStream, self).write(value)
        try:
            result = numpy.all(self._content[end:] == self._expected._content[end:len(self)])
        except Exception as e:
            raise LearningFailedError("Output failed due to exception: %s"%str(e))
        if result:
            raise LearningPassedError("Output matched as expected.")
        else:
            raise LearningFailedError("Output did not match what was expected.")
    #---------------------------------------------------------------------------------------------------------
    def write_expected(self, value):
        self._expected.write(value)

##############################################################################################################
# KC
##############################################################################################################

#*************************************************************************************************************
class KC(object):
    """This class implements the fourier series that is trainable."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, N, L, K, ns=None):
        # Need to add super call to all encodables.
        self.N = N
        self.L = L
        self.K = K
        if ns is None:
            self.ns = numpy.array([i+1 for i in range(self.N)])
        else:
            self.ns = numpy.array(ns)
        self.a = numpy.zeros(N, dtype=numpy.float16)
        self.b = numpy.zeros(N, dtype=numpy.float16)
        self.omega = 2.0 * numpy.pi / self.L
        self.alpha_n = numpy.array([self.omega * self.ns[i] for i in range(self.N)])
        W = self.L / (2.0 * self.K)
        S = self.L / self.K
        self.r_k = numpy.array([(k-1)*S for k in range(self.K + 1)])
        self.R_k = self.r_k + W
        self.a_L = self.alpha_n * self.L
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return ""
    #---------------------------------------------------------------------------------------------------------
    def process(self, input):
        try:
            input -= 1
            input = (self.r_k[input] + self.R_k[input])/2.0
        except:
            raise InputError("Failed to provide a valid input into this KC: %s"%(repr(input)))
        try:
            alpha_n = self.alpha_n * input
            return numpy.sum(numpy.multiply(self.a, numpy.cos(alpha_n)) + numpy.multiply(self.b, numpy.sin(alpha_n)))
        except Exception as e:
            raise ProcessingError(e)
    #---------------------------------------------------------------------------------------------------------
    def add(self, input, value):
        try:
            input -= 1
            r_k = self.r_k[input]
            R_k = self.R_k[input]
        except:
            raise InputError("Failed to provide a valid input into this KC: %s"%(repr(input)))
        try:
            a_r = self.alpha_n * r_k
            a_R = self.alpha_n * R_k
            self.a += numpy.multiply((value/self.a_L), numpy.sin(a_R) - numpy.sin(a_r))
            self.b += numpy.multiply((value/self.a_L), numpy.cos(a_r) - numpy.cos(a_R))
        except Exception as e:
            raise TrainingError(e)
#*************************************************************************************************************

##############################################################################################################
# Kneuron
##############################################################################################################

kc2_mapping = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 9, 11, 12, 13, 14, 15, 16, 17, 32, 34, 20, 21, 22, 23, 24, 40, 26, 42, 28, 29, 30, 31, 18, 44, 19, 46, 47, 48, 52, 56, 25, 58, 27, 60, 33, 61, 35, 36, 37, 62, 63, 64, 38, 65, 67, 69, 39, 71, 41, 79, 43, 45, 49, 50, 51, 53, 80, 54, 81, 55, 84, 57, 85, 87, 88, 92, 93, 94, 95, 59, 66, 68, 96, 97, 70, 72, 104, 73, 74, 112, 113, 116, 75, 76, 77, 78, 82, 83, 117, 120, 121, 122, 124, 125, 86, 126, 106, 107, 108, 109, 110, 111, 89, 90, 114, 115, 91, 98, 118, 119, 99, 100, 101, 123, 102, 103, 105, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255]
kc3_mapping = [48, 49, 51, 56, 57, 60, 99, 103, 113, 115, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 0, 1, 50, 2, 52, 53, 54, 55, 3, 4, 58, 59, 5, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 6, 100, 101, 102, 7, 104, 105, 106, 107, 108, 109, 110, 111, 112, 8, 114, 9, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255]
_bit_shifts_8 = numpy.array([7, 6, 5, 4, 3, 2, 1, 0]) if settings.has_numpy else None
def bools_to_ord(bools):
    return numpy.sum(bools << _bit_shifts_8)
def ord_to_bools(value):
    return numpy.array([
        value&128, value&64, value&32, value&16, value&8, value&4, value&2, value&1
    ], dtype=bool)

#*************************************************************************************************************
class Kneuron2(Encodable):
    """The main class for learning and computing that uses a KC2."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        # Input for KC is going to be: [1-8]
        self.kc = KC(N=2, L=1.0, K=40, ns=[5, 10])
        self._a = [EncodableFloat16(0.0), EncodableFloat16(0.0)]
        self._b = [EncodableFloat16(0.0), EncodableFloat16(0.0)]
        self.instream = Ptr(BaseStream())
        self.outstream = Ptr(BaseStream())
        self.true_chr = None
        self.false_chr = None
        super(Kneuron2, self).__init__()
    #---------------------------------------------------------------------------------------------------------
    @property
    def a(self):
        self._a[0].value = self.kc.a[0]
        self._a[1].value = self.kc.a[1]
        return self._a
    #---------------------------------------------------------------------------------------------------------
    @property
    def b(self):
        self._b[0].value = self.kc.b[0]
        self._b[1].value = self.kc.b[1]
        return self._b
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return "{%s, %s}"%(str(self.a), str(self.b))
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        return "%s%s%s%s"%(
            self.a[0].tostring(), self.a[1].tostring(), self.b[0].tostring(), self.b[1].tostring()
        )
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        a0, content = self._a[0].fromstring(content)
        a1, content = self._a[1].fromstring(content)
        b0, content = self._b[0].fromstring(content)
        b1, content = self._b[1].fromstring(content)
        self.kc.a[0] = self._a[0].value
        self.kc.a[1] = self._a[1].value
        self.kc.b[0] = self._b[0].value
        self.kc.b[1] = self._b[1].value
        return "%s%s%s%s"%(a0, a1, b0, b1), content
    #---------------------------------------------------------------------------------------------------------
    def process(self, input=None):
        try:
            input = ord_to_bools(kc2_mapping[bools_to_ord(self.instream.read(8) if input is None else input)])
            sum = 0.0
            if input[0]:
                sum += self.kc.process(6) # (1 * 5) + 1
            else:
                sum -= self.kc.process(6) # (1 * 5) + 1
            if input[1]:
                sum += self.kc.process(11) # (2 * 5) + 1
            else:
                sum -= self.kc.process(11) # (2 * 5) + 1
            if input[2]:
                sum += self.kc.process(16) # (3 * 5) + 1
            else:
                sum -= self.kc.process(16) # (3 * 5) + 1
            if input[3]:
                sum += self.kc.process(21) # (4 * 5) + 1
            else:
                sum -= self.kc.process(21) # (4 * 5) + 1
            if input[4]:
                sum += self.kc.process(26) # (5 * 5) + 1
            else:
                sum -= self.kc.process(26) # (5 * 5) + 1
            if input[5]:
                sum += self.kc.process(31) # (6 * 5) + 1
            else:
                sum -= self.kc.process(31) # (6 * 5) + 1
            if input[6]:
                sum += self.kc.process(36) # (7 * 5) + 1
            else:
                sum -= self.kc.process(36) # (7 * 5) + 1
            if input[7]:
                sum += self.kc.process(41) # (8 * 5) + 1
            else:
                sum -= self.kc.process(41) # (8 * 5) + 1
            result = sum > 0.0
            output = result
            if result:
                if self.true_chr is not None:
                    output = self.true_chr
            else:
                if self.false_chr is not None:
                    output = self.false_chr
            try:
                self.outstream.write(output)
            except LearningError as e:
                delta = 1
                if type(e) is LearningPassedError:
                    delta = 1 if result else -1
                else:
                    delta = -1 if result else 1
                if input[0]:
                    self.kc.add(6, delta) # (1 * 5) + 1
                if input[1]:
                    self.kc.add(11, delta) # (2 * 5) + 1
                if input[2]:
                    self.kc.add(16, delta) # (3 * 5) + 1
                if input[3]:
                    self.kc.add(21, delta) # (4 * 5) + 1
                if input[4]:
                    self.kc.add(26, delta) # (5 * 5) + 1
                if input[5]:
                    self.kc.add(31, delta) # (6 * 5) + 1
                if input[6]:
                    self.kc.add(36, delta) # (7 * 5) + 1
                if input[7]:
                    self.kc.add(41, delta) # (8 * 5) + 1
        except NerveError:
            raise
        except Exception as e:
            raise ProcessingError(e)
#*************************************************************************************************************
class Knetwork2(Encodable):
    """A collection Kneurons that can be trained and compute inputs."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, count=8):
        self.kneurons = [Kneuron2() for i in range(count)]
        self.instream = Ptr(BaseStream)
        self.outstream = Ptr(BaseStream)
        for i in range(count):
            self.kneurons[i].instream = self.instream
            self.kneurons[i].outstream = self.outstream
        super(Knetwork2, self).__init__()
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return repr(self.kneurons)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return str(self.kneurons)
    #---------------------------------------------------------------------------------------------------------
    def __len__(self):
        return len(self.kneurons)
    #---------------------------------------------------------------------------------------------------------
    def __iter__(self):
        return iter(self.kneurons)
    #---------------------------------------------------------------------------------------------------------
    def __getitem__(self, index):
        return self.kneurons[index]
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        pass
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        pass
    #---------------------------------------------------------------------------------------------------------
    def process(self, input=None):
        for n in self.kneurons:
            n.process(input)

#*************************************************************************************************************
class NerveParser(Encodable):
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        super(NerveParser, self).__init__()
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return self.tostring()
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return self.tostring()
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        return ""
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        return "", content
    #---------------------------------------------------------------------------------------------------------
    def process(self):
        pass

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
        raise NerveError("The module 'numpy' is needed for nerve to work.")
    if code is not None:
        settings.code += code
    if settings.byte_mode:
        settings.code = settings.code.encode('latin1').decode('unicode-escape').encode('latin1')
        settings.code = encoding.frombytes(settings.code)
    settings.parser = NerveParser()
    settings.parser.fromstring(settings.code)
    settings.parser.process()

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
