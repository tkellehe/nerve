# [Nerve](https://tkellehe.github.io/nerve) (Tad)

The _Nerve_ project is an attempt to produce the optimally compressed and output guaranteed neural network programming language.

## Tad

The current version that is being explored is _Tad_. Short for tadpole, this design is based around more of the idea of genetic algorithms.
This may result in breaking off into its own project, but for now is the first edition of what _Nerve_ could be.

The idea is that we have some instance describing its current state as a series of bytes.
This state is then ran through a function to produce the goal for this tadpole.
The tadpole then attempts to move to that goal by using the shortest distance.
The tadpole either reaches its goal or runs out of steam and either way must produce a new goal.
The other way to produce a new goal is if the tadpole intersects its evaluation point.
This is where a particular byte of the state is equal to another well defined byte of the same state.
For when the new goal is computed, it will grow itself making its current position permanent to its state except for the evaluation byte.
The output is the position excluding the evaluation byte and the tadpole continues to move.

Currently the only way to find a proper program written in _Nerve-Tad_, is to exhaustively search.
I am attempting to see if the current implementation or variant can be reversed such that to find the proper starting tadpole state to find the desired end tadpole state.
That math is quite out of my league at the moment. Therein, it might be a while before I find such a thing.

### Hash

The reason for utilizing a hash function is quite simply that they are designed to condense a large amount of bytes into a well described single identifier.
Essentially, evaluate the entirety of the tadpole to produce its goal.
The variant of hash functions will need to be non-cryptographic to make it easier to reverse.
Therein, currently a simple variant of [_SeaHash_](http://ticki.github.io/blog/seahash-explained/) was chosen since it is easy to understand.

### Primes

I am currently searching for a simple _Nerve-Tad_ program to produce all of the first 54 primes (all primes under 256). The current best solutions are the following:

```python
from tad import *
parser = TadParser()
parser.fromstring(encoding.frombytes([6, 253, 139, 223]))
parser.run()
print(parser.output) # [41, 7, 23, 89, 163, 83, 11]
```

```python
from tad import *
parser = TadParser()
parser.fromstring(encoding.frombytes([6, 13, 205, 5]))
parser.run()
print(parser.output) # [197, 59, 131, 101, 73, 71, 13]
```

The first byte indicates one less than the number of values to be produced.
The second byte is the initial evaluation byte used to check the last byte.
The third byte is the position used to produce the values.
The last byte is the evaluation byte that when reaches the second byte will grow and produce an output.

The program can be ran from the command like with the following:
```bash
python3 tad.py -b -t "a" -c "\x06\x0D\xCD\x05"
```