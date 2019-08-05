//************************************************************************************************************
var expression = {}

//************************************************************************************************************
expression.neuron = function() { return new (Function.prototype.bind.apply(NeuronExpression,
                                                                           [NeuronExpression, ...arguments])) }

//************************************************************************************************************
expression.layer = function() { return new (Function.prototype.bind.apply(LayerExpression,
                                                                          [LayerExpression, ...arguments])) }

//************************************************************************************************************
expression.layers = function() { return new (Function.prototype.bind.apply(LayersExpression,
                                                                           [LayersExpression, ...arguments])) }
