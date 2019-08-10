# [Nerve](https://tkellehe.github.io/nerve) (Alpha)

_Nerve_ is a programming language built around simple neural networks.
The language is a code golfing language that instead of providing a set
of instructions or commands to golf down code, you teach a neural network
to complete the challenge. It takes a string of characters and returns 
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

The following is an example of a _Nerve Verbose_ neural network that can learn to map `a` to `A` and `A` to `a`.

```javascript
expression.network(
    expression.mapping("Aa"), // single character input that can either be 'a' or 'A'
    expression.layers(),      // create single layer to map input to output
    expression.mapping("Aa")  // single character output that can either be 'a' or 'A'
)
```

After teaching only once to map `['a', 'A']` to `['A', 'a']` we can end up with the following
neural network that properly does the operation. The learning process utilized the `meanSquaredError`
and `sgd` with learning rate of `0.001`. Note that the first expression is utilizing the 
`expression` API to be less verbose. Once the code is ran, it is converted to its most verbose
setting in order to ensure it is properly prepared to be converted to either _Nerve Short_ or
_Nerve Golfed_.

```javascript
expression.network(
    expression.mapping(expression.switchchar(expression.string("Aa"))),
    expression.layers(
        expression.layer(2,2,                   // 2 inputs with 2 neurons
            expression.number("w%BE%7F%3F"),    // weight (neuron 0)
            expression.number("%08%00%80%3F"),  // weight (neuron 0)
            expression.number("%00%00%80%3F"),  // weight (neuron 1)
            expression.number("w%BE%7F%3F"),    // weight (neuron 1)
            expression.number("o%12%83%BA"),    // bias   (neuron 0)
            expression.number("%E1%F0%82%BA")   // bias   (neuron 1)
        )
    ),
    expression.mapping(expression.switchchar(expression.string("Aa")))
)
```

There currently is a [test page](https://tkellehe.github.io/nerve/test/test_aA.html) available to see it in action.
