nerve = {};
nerve.execute_verbose = async function(code) {
    global_network_memory_reset();
    let compiled = eval("(function() { return " + code + "})()");
    let result = await compiled.finalize();
    
    // Must reset the memory so that network can properly rebuild the memory expression.
    global_network_memory_reset();
    result.expression = result.network.to_expression();
    
    let memory = global_network_memory_to_expression();
    if(memory.length) {
        result.expression = "memory(" + memory + ")." + result.expression;
    }
    
    result.network.destroy();
    return result;
}
