# [Nerve](https://tkellehe.github.io/nerve) (Alpha)

_Nerve_ is a programming language built around simple neural networks.
The language is a code golfing language that instead of providing a set
of instructions or commands to golf down code, you teach a neural network
to complete the challenge. It takes a string of characters and returns a 
a string of characters. This is all powered by [TensorFlow.js](https://www.tensorflow.org/js/).

## Alpha

The language is currently under construction. I was building it from the ground
up and writing my own forward/back propagation. Then I learned enough about neural networks
to understand there is no way that I can get the same speed as _TensorFlow_.
So, currently the [testing page](https://tkellehe.github.io/nerve/test/) is provided to play around with
the underlying components.

## Expressions

_Nerve verbose_ is built out of these lower level components called `expression`s.
The `expression`s combine together collecting information about the neural network
to be created. This way everything is known at the very end and can be optimized down
such that it is just the _TensorFlow_ objects.

### `expression.network`

The main expression to create is `network`. This creates a neural network of nodes based
off of the layers provided. The neural network specifically learns to map strings to each
other. Therein, there must be a `mapping` expression for the possible inputs and one for
the possible outputs. Between these two mappings, a `layer` expression is required which
creates the actual neural network. The current design is for the last optional parameter
to be the learning rate. This will most likely change in the future such that different
loss functions and optimizers can be used.

```javascript
expression.network(
    /* expression.mapping */,
    /* expression.layers */,
    /* expression.mapping */,
    /* learning rate (optional = 0.001) */
)
```

### `expression.mapping`

The expression that handles the input-to-tensor and tensor-to-output is the `mapping` expression.
This expression takes a list of strings where each string represents the different possible characters
that can be used for a specific character.

```javascript
expression.mapping(
    /* string */, ...
)
```

#### Short Cuts

 * `expression.any` : `\u0000` to `\u00ff`
 * `expression.digits` : `0123456789`
 * `expression.alphabet` : `abcdefghijklmnopqrstuvwxyz`
 * `expression.ALPHABET` : `ABCDEFGHIJKLMNOPQRSTUVWXYZ`
