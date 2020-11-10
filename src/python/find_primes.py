#!/usr/bin/env python3

from tad import *
settings.output_mode = OUTPUT_MODE_ARRAY
search(RuleSetPrimes54(), 100910, step_to_output_limit=1000)