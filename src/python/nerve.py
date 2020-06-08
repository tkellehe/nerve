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
# External library imports
##############################################################################################################

#*************************************************************************************************************
try:
    import numpy
except ModuleNotFoundError:
    raise Exception("The python module 'numpy' is needed for nerve.")
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
class InputCountError(InputError):
    """The number of inputs provided did not match what was desired."""
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
            buffer = [encoding.char_to_int(sub_content[0]), encoding.char_to_int(sub_content[1])]
            value = numpy.frombuffer(buffer, dtype=ENDIAN_FLOAT16)
            self._value = value.newbyteorder('=')
            return sub_content, content
        except BadDecodingError:
            raise
        except Exception as e:
            raise BadDecodingError("Failed to convert float16 from string: %s"%str(e))
#*************************************************************************************************************
class EncodableUint16(Encodable):
    """The uint16 number used in arithmetic that can be compressed."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, value=0):
        self._value = numpy.uint16(int(value))
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
        self._value = numpy.uint16(int(value))
    #---------------------------------------------------------------------------------------------------------
    def __int__(self):
        return int(self._value)
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        try:
            buffer = ENDIAN_UINT16(self.value).tobytes()
            return "%s%s"%(encoding.int_to_char(buffer[0]), encoding.int_to_char(buffer[1]))
        except BadEncodingError:
            raise
        except Exception as e:
            raise BadEncodingError("Failed to compress uint16 to string: %s"%str(e))
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        try:
            sub_content = content[0:2]
            content = content[2:]
            buffer = [encoding.char_to_int(sub_content[0]), encoding.char_to_int(sub_content[1])]
            value = numpy.frombuffer(buffer, dtype=ENDIAN_UINT16)
            self._value = value.newbyteorder('=')
            return sub_content, content
        except BadDecodingError:
            raise
        except Exception as e:
            raise BadDecodingError("Failed to convert uint16 from string: %s"%str(e))
#*************************************************************************************************************
class EncodableFloat32(Encodable):
    """The floating point number used in arithmetic that can be compressed."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, value=0.0):
        self._value = numpy.float32(float(value))
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
        self._value = numpy.float32(float(value))
    #---------------------------------------------------------------------------------------------------------
    def __float__(self):
        return float(self._value)
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        try:
            buffer = ENDIAN_FLOAT32(self.value).tobytes()
            return "%s%s%s%s"%(
                encoding.int_to_char(buffer[0]), encoding.int_to_char(buffer[1]),
                encoding.int_to_char(buffer[2]), encoding.int_to_char(buffer[3])
            )
        except BadEncodingError:
            raise
        except Exception as e:
            raise BadEncodingError("Failed to compress float32 to string: %s"%str(e))
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        try:
            sub_content = content[0:4]
            content = content[4:]
            buffer = [
                encoding.char_to_int(sub_content[0]), encoding.char_to_int(sub_content[1]),
                encoding.char_to_int(sub_content[2]), encoding.char_to_int(sub_content[3])
            ]
            value = numpy.frombuffer(buffer, dtype=ENDIAN_FLOAT32)
            self._value = value.newbyteorder('=')
            return sub_content, content
        except BadDecodingError:
            raise
        except Exception as e:
            raise BadDecodingError("Failed to convert float32 from string: %s"%str(e))
#*************************************************************************************************************
class EncodableFloat64(Encodable):
    """The floating point number used in arithmetic that can be compressed."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, value=0.0):
        self._value = numpy.float64(float(value))
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
        self._value = numpy.float64(float(value))
    #---------------------------------------------------------------------------------------------------------
    def __float__(self):
        return float(self._value)
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        try:
            buffer = ENDIAN_FLOAT64(self.value).tobytes()
            return "%s%s%s%s"%(
                encoding.int_to_char(buffer[0]), encoding.int_to_char(buffer[1]),
                encoding.int_to_char(buffer[2]), encoding.int_to_char(buffer[3])
            )
        except BadEncodingError:
            raise
        except Exception as e:
            raise BadEncodingError("Failed to compress float64 to string: %s"%str(e))
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        try:
            sub_content = content[0:4]
            content = content[4:]
            buffer = [
                encoding.char_to_int(sub_content[0]), encoding.char_to_int(sub_content[1]),
                encoding.char_to_int(sub_content[2]), encoding.char_to_int(sub_content[3])
            ]
            value = numpy.frombuffer(buffer, dtype=ENDIAN_FLOAT64)
            self._value = value.newbyteorder('=')
            return sub_content, content
        except BadDecodingError:
            raise
        except Exception as e:
            raise BadDecodingError("Failed to convert float64 from string: %s"%str(e))
#*************************************************************************************************************

##############################################################################################################
# Kneuron
##############################################################################################################

#*************************************************************************************************************
class KneuronLearner(Encodable):
    """The class that contains the learning information for a Kneuron."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
       # Need to add super call to all encodables.
       pass
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return ""
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        pass
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        pass
    #---------------------------------------------------------------------------------------------------------
    def train(self, input, expected, kneuron):
        trues = input[numpy.where(expected == True)]
        false = input[numpy.where(expected == False)]
        rk = trues
        Rk = trues + 0.5
        
#*************************************************************************************************************
class Kneuron(Encodable):
    """The main class for learning and computing."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.learner = KneuronLearner()
        self.a = EncodableFloat16(0.0)
        self.b = EncodableFloat16(0.0)
        self.harmonic = EncodableUint16(1)
    #---------------------------------------------------------------------------------------------------------
    def set_harmonic(self, harmonic):
        self.harmonic.value = harmonic
        self.alpha_n = (self.harmonic.value * numpy.pi / 128.0)
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return "{%s, %s}"%(str(self.a), str(self.b))
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        return "ɲ%s%s"%(
            self.a.tostring(), self.b.tostring()
        )
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        sub_content = content[0]
        if sub_content != 'ɲ':
            raise BadDecodingError("Kneuron failed to parse string because of bad "
                                   "first character: %s"%(sub_content))
        content = content[1:]
        a, content = self.a.fromstring(content)
        b, content = self.b.fromstring(content)
        return "%s%s%s"%(sub_content, a, b), content
    #---------------------------------------------------------------------------------------------------------
    def eval(self, input):
        return self.a.value * numpy.cos(self.alpha_n * input) + \
                self.b.value * numpy.sine(self.alpha_n * input)
    def process(self, input):
        return self.eval(input + 0.25)
    #---------------------------------------------------------------------------------------------------------
    def train(self, input, expected):
        self.learner.train(numpy.array(input), numpy.array(expected), self)
#*************************************************************************************************************
class Knetwork(Encodable):
    """A collection Kneurons that can be trained and compute inputs."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, count=None):
        if count is None:
            self.kneurons = []
        else:
            self.kneurons = [Kneuron() for i in range(count)]
            for i in range(count):
                # Might be good to only use prime harmonics.
                self.kneurons[i].set_harmonic(i+1)
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
    def process(self, input):
        try:
            if 0 <= input <= 255:
                return 0 < numpy.sum([n.process(int(input)) for n in self])
            else:
                raise InputError("Must be a byte: %s"%repr(input))
        except NerveError:
            raise
        except Exception as e:
            raise ProcessingError(e)
    #---------------------------------------------------------------------------------------------------------
    def train(self, inputs, expected):
        # Instead of trues and falses, have two points per input (K=512) where the left point pair 
        # represents the smallest possible value for that input and the double of the input represents
        # the right point which is the largest possible value for that input.
        # Note: The best type of training needs to be based on comparing the output to the expected
        #       in order for the learning to happen. This way it can have multiple layers feed up through
        #       each other. So, this method is till not optimal even though it does a good job at compressing
        #       a large number of inputs. (Essentially draws a shape if you connect the two ends of the curve)
        try:
            inputs = numpy.array(inputs)
            expected = numpy.array(expected)
            for i in range(len(self)):
                self.kneurons[i].train(inputs, expected)
        except NerveError:
            raise
        except Exception as e:
            raise TrainingError(e)
#*************************************************************************************************************
