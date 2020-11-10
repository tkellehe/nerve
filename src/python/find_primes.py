#! /bin/env python

from tad import *
settings.output_mode = OUTPUT_MODE_ARRAY
search(RuleSetPrimes54(), 100000)