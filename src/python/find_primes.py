#! /bin/env python

import tad
tad.settings.output_mode = tad.OUTPUT_MODE_ARRAY
tad.search(tad.RuleSetPrimes54(), 100000)