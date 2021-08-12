# [Nerve](https://tkellehe.github.io/nerve) (Beta)

The _Nerve_ project is an attempt to produce the optimally compressed and output guaranteed neural network programming language.

_Nerve_ is a programming language built around simple neural networks.
The language is a code golfing language that instead of providing a set of instructions or commands to golf down code, you teach a neural network to complete the challenge.
It takes a string of characters and returns a string of characters.

## Current Implementation

The current implementation of _Nerve_ is built around a variation of [Self-Organizing Maps](https://en.wikipedia.org/wiki/Self-organizing_map).
Normally, self organizing maps utilize floating point numbers with large number of bytes (well _8_ bytes, but a lot for code golfing).
In order to get around this, the weight vectors within each node/neuron is a single byte.
The input vectors are also in bytes.

Moving towards a byte _SOM_, does have its issues.
Although it does not use as many bytes, it is harder to have the nodes spread across the input space.
To get around this during its training phase, nodes are grouped by _clans_.
Then competition is only within a given clan.
To make the competition functions simpler, the nodes are then arranged into a ring.
Where the dispersion moves around the entire ring and the opposite neuron does not move at all.

## Training

When training it can take a lot of clans and neurons to fill the space.
The current implementation utilizes labeling only.
This means that if a neuron cannot be labeled during training, it is useless during a code golfing challenge.
So, we just prune these and provide each neuron with its own label.

The byte _SOM_ implementation also lends itself well to self optimizing.
The idea is based around building another network like the first one trained but smaller.
This network is then trained instead with the winning neurons from the larger network.
Now, the smaller network will hopefully provide the same level of classification as the larger.
If it does, then we take the smaller.

## Under Construction

Still building the parser for the compressed language.
This version of _Nerve_ appears to have the most promise for compressed neural networks.
The prototype library for training has been created under `src/cpp/nrv.hpp`.

