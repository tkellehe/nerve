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

//************************************************************************************************************
expression.collector = function() { return new (Function.prototype.bind.apply(CollectorExpression,
                                                                              [CollectorExpression, ...arguments])) }

//************************************************************************************************************
expression.collectors = function() { return new (Function.prototype.bind.apply(CollectorsExpression,
                                                                               [CollectorsExpression, ...arguments])) }

//************************************************************************************************************
expression.network = function() { return new (Function.prototype.bind.apply(NetworkExpression,
                                                                            [NetworkExpression, ...arguments])) }

//************************************************************************************************************
expression.number = function(input) {
    if(typeof input === 'number') return input;
    if(typeof input === 'string') return number_decode(input);
    return input;
}
