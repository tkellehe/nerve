if (!window.increasingByteSequence) window.increasingByteSequence = {}

window.increasingByteSequence.data = [
  { input: [1, 2], output: [3, 4] },
  { input: [3, 4], output: [5, 6] },
  { input: [2, 3], output: [5, 7] },
  { input: [5, 7], output: [7, 11] },
  { input: [2, 4], output: [6, 8] },
  { input: [6, 8], output: [10, 12] },
  { input: [3, 6], output: [9, 12] },
  { input: [9, 12], output: [15, 18] },
  { input: [2, 4], output: [8, 16] },
  { input: [5, 10], output: [15, 20] },
  { input: [1, 1], output: [2, 3] },
  { input: [2, 3], output: [5, 8] }
]
