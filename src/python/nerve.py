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
# Compressables
##############################################################################################################

#*************************************************************************************************************
class Compressable(object):
    """Base class for handling compressable objects."""
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
class CompressableFloat16(Compressable):
    """The floating point number used in arithmatic that can be compressed."""
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
class CompressableUint16(Compressable):
    """The uint16 number used in arithmatic that can be compressed."""
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
class CompressableFloat32(Compressable):
    """The floating point number used in arithmatic that can be compressed."""
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
class CompressableFloat64(Compressable):
    """The floating point number used in arithmatic that can be compressed."""
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
class KneuronLearner(Compressable):
    """The class that contains the learning information for a Kneuron."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.init_bias = CompressableFloat64(100.0)
        self.init_weight = CompressableFloat64(100.0)
        self.init_randn = CompressableFloat64(1.0)
        self.clear()
    #---------------------------------------------------------------------------------------------------------
    def save_initial(self):
        self.init_bias = CompressableFloat64(self.bias.value)
        self.init_weight = CompressableFloat64(self.weight.value)
        self.init_randn = CompressableFloat64(self.randn.value)
    #---------------------------------------------------------------------------------------------------------
    def clear(self):
        self.bias = CompressableFloat64(self.init_bias.value)
        self.weight = CompressableFloat64(self.init_weight.value)
        self.randn = CompressableFloat64(self.init_randn.value)
        self.best_error = None
        self.is_sub = False
        self.is_bias_weight_randn = 0
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return "{%s, %s, %s, %s, %s, %s}"%(
            str(self.bias), str(self.weight), str(self.randn),
            str(self.best_error), str(self.is_sub), str(self.is_bias_weight_randn)
        )
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        try:
            front = 'ɱ'
            if self.best_error is not None:
                if self.is_bias_weight_randn == 0:
                    front = 'Ɓ' if self.is_sub else 'ɓ'
                elif self.is_bias_weight_randn == 1:
                    front = 'Ƈ' if self.is_sub else 'ƈ'
                elif self.is_bias_weight_randn == 1:
                    front = 'Ɗ' if self.is_sub else 'ɗ'
            return "%s%s%s%s%s"%(
                front,
                self.bias.tostring(), self.weight.tostring(), self.randn.tostring(),
                '' if self.best_error is None else self.best_error.tostring()
            )
        except BadEncodingError:
            raise
        except Exception as e:
            raise BadEncodingError("KneuronLearner failed to compress to a string: %s"%(str(e)))
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        try:
            sub_content = content[0]
            if sub_content == 'ɱ':
                self.is_sub = False
                self.is_bias_weight_randn = 0
            else:
                self.is_sub = sub_content == 'Ɓ' or sub_content == 'Ƈ' or sub_content == 'Ɗ'
                if self.is_sub:
                    if sub_content == 'Ɓ':
                        self.is_bias_weight_randn = 0
                    elif sub_content == 'Ƈ':
                        self.is_bias_weight_randn = 1
                    elif sub_content == 'Ɗ':
                        self.is_bias_weight_randn = 2
                    else:
                        raise BadDecodingError("KneuronLearner failed to parse string because of bad "
                                               "first character: %s"%(sub_content))
                else:
                    if sub_content == 'ɓ':
                        self.is_bias_weight_randn = 0
                    elif sub_content == 'ƈ':
                        self.is_bias_weight_randn = 1
                    elif sub_content == 'ɗ':
                        self.is_bias_weight_randn = 2
                    else:
                        raise BadDecodingError("KneuronLearner failed to parse string because of bad "
                                               "first character: %s"%(sub_content))
            content = content[1:]
            bias, content = self.bias.fromstring(content)
            weight, content = self.weight.fromstring(content)
            randn, content = self.randn.fromstring(content)
            best_error = ''
            if sub_content == 'ɱ':
                self.best_error = None
            else:
                self.best_error = CompressableFloat64()
                best_error, content = self.best_error.fromstring(content)
            return "%s%s%s%s"%(sub_content, bias, weight, randn, best_error), content
        except BadDecodingError:
            raise
        except Exception as e:
            raise BadDecodingError("KneuronLearner failed to decode string: %s"%(str(e)))
        self.save_initial()
    #---------------------------------------------------------------------------------------------------------
    def train(self, output, expected, kneuron):
        if len(output) == 0:
            return
        # Compute the error from the output to the expected.
        error = numpy.sum(numpy.abs(numpy.array(output) - numpy.array(expected)))
        # Make sure this is not the first iteration.
        is_first = self.best_error is None
        if is_first:
            if error > 0.001:
                self.best_error = CompressableFloat64(error)
                kneuron.bias.value += self.bias.value
        else:
            # Pick what parameters should be controlled.
            dp = None
            p = None
            if self.is_bias_weight_randn == 0:
                dp = self.bias
                p = kneuron.bias
                if self.is_sub:
                    self.is_bias_weight_randn = 1
            elif self.is_bias_weight_randn == 1:
                dp = self.weight
                p = kneuron.weight
                if self.is_sub:
                    self.is_bias_weight_randn = 2
            elif self.is_bias_weight_randn == 2:
                dp = self.randn
                p = kneuron.randn
                if self.is_sub:
                    self.is_bias_weight_randn = 0
            # If the error is better,
            if error < float(self.best_error):
                self.best_error.value = error
                dp.value *= 1.05 if self.is_sub else 1.1
            # If the error is worse,
            else:
                if self.is_sub:
                    p.value += dp.value
                    dp.value *= 0.95
                    # Increment the next to set up the loop.
                    if self.is_bias_weight_randn == 0:
                        # Check to see if we need to clear.
                        if self.bias.value + self.weight.value + self.randn.value\
                            < 0.001:
                            self.clear()
                        else:
                            kneuron.bias.value += self.bias.value
                    elif self.is_bias_weight_randn == 1:
                        kneuron.weight.value += self.weight.value
                    elif self.is_bias_weight_randn == 2:
                        kneuron.randn.value += self.randn.value
                else:
                    p.value -= dp.value * 2
            # Flip the operation for the next iteration.
            self.is_sub = not self.is_sub
#*************************************************************************************************************
class Kneuron(Compressable):
    """The main class for learning and computing."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self):
        self.learner = KneuronLearner()
        self.bias = CompressableFloat16(0.0)
        self.weight = CompressableFloat16(1.0)
        self.randn = CompressableUint16(1)
    #---------------------------------------------------------------------------------------------------------
    def __repr__(self):
        return str(self)
    #---------------------------------------------------------------------------------------------------------
    def __str__(self):
        return "{%s, %s, %s}"%(str(self.bias), str(self.weight), str(self.randn))
    #---------------------------------------------------------------------------------------------------------
    def tostring(self):
        return "ɲ%s%s%s"%(
            self.bias.tostring(), self.weight.tostring(), self.randn.tostring()
        )
    #---------------------------------------------------------------------------------------------------------
    def fromstring(self, content):
        sub_content = content[0]
        content = content[1:]
        bias, content = self.bias.fromstring(content)
        weight, content = self.weight.fromstring(content)
        randn, content = self.randn.fromstring(content)
        return "%s%s%s%s"%(sub_content, bias, weight, randn), content
    #---------------------------------------------------------------------------------------------------------
    def process(self, input):
        return ((input * self.weight.value) + self.bias.value)
    #---------------------------------------------------------------------------------------------------------
    def unprocess(self, output):
        if self.weight.value == 0.0:
            return output * 0.0
        return ((output - self.bias.value) / self.weight.value)
    #---------------------------------------------------------------------------------------------------------
    def train(self, output, expected):
        expected = numpy.array(expected)
        self.learner.train(output, expected, self)
        return self.unprocess(expected)
#*************************************************************************************************************
class Knetwork(Compressable):
    """A collection Kneurons that can be trained and compute inputs."""
    #---------------------------------------------------------------------------------------------------------
    def __init__(self, count=None):
        if count is None:
            self.kneurons = []
        else:
            self.kneurons = [Kneuron() for i in range(count)]
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
    def index(self):
        randn = numpy.sum([n.randn.value for n in self.kneurons])
        if randn == 0:
            index = numpy.random.choice(len(self))
        else:
            extra = randn * 0.2
            randn += extra
            extra /= len(self)
            index = numpy.random.choice(len(self), p=[(n.randn.value + extra)/randn for n in self.kneurons])
        return index
    #---------------------------------------------------------------------------------------------------------
    def process(self, inputs):
        return self.kneurons[self.index()].process(numpy.sum(inputs))
    #---------------------------------------------------------------------------------------------------------
    def train(self, output, expected):
        output = numpy.array(output)
        expected = numpy.array(expected)
        projected = None
        self.kneurons[self.index()].train(output, expected)
        return projected
#*************************************************************************************************************
