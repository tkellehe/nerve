#!/usr/bin/env python3

# python3 -u find_primes.py | tee primes.txt

# parser = TadParser()
# parser.fromstring(encoding.frombytes([5, 162, 5, 2]))
# parser.run()
# print(parser.output) # => [97, 157, 43, 211, 109, 167]
# # index @ 132514

from tad import *
settings.output_mode = OUTPUT_MODE_ARRAY
# search(RuleSetPrimes54(), 100910, step_to_output_limit=1000)
search(RuleSetPrimes54(), 132510, step_to_output_limit=1500)