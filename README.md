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

## Nerve Verbose

_Nerve Verbose_ is built out of these lower level components called `expression`s.
The `expression`s combine together collecting information about the neural network
to be created. This way everything is known at the very end and can be optimized down
such that it is just the _TensorFlow_ objects. [Learn more...](https://github.com/tkellehe/nerve/wiki)
