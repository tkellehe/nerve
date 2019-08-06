# [Nerve](https://tkellehe.github.io/nerve) (Alpha)

_Nerve_ is a programming language built around simple neural networks.
The language is a code golfing language that instead of providing a set
of instructions or commands to golf down code, you teach a neural network
to complete the challenge. It takes a string of characters and returns a 
a string of characters.

## Alpha

The language is currently under construction. I am building it from the ground
up and writing my own forward/back propagation. So, currently the
[testing page](https://tkellehe.github.io/nerve/test/) is provided to play around with
the underlying components.

### Expressions

_Nerve verbose_ is built out of these lower level components called `expressions`.
The `expressions` combine together collecting information about the neural network
to be created. This way everything is known at the very end and can be optimized down
such that it is just operations on matrices.

#### `expressions.network`

The first expression to create is `network`. It takes in the max string length allowed
for this neural network, a `layers` expression, and followed by a `collectors` expression.
This is the main class provided that constructs the neural network to map string input
to neurons then neurons back to some string input.

```javascript
expressions.network(
    /* max input length */
    /* expressions.layers */
    /* expressions.collectors */
)
```
