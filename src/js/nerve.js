nerve = {};

nerve.compile_expression = function(code) {
    return eval("(function() { " + expression_scope_prefix + "; return " + code + "})()");
}

nerve.execute_verbose = async function(code) {
    global_network_memory_reset();
    global_network_expression_compression = true;
    let compiled = nerve.compile_expression(code);
    let result = await compiled.finalize();
    
    try {
        // Must reset the memory so that network can properly rebuild the memory expression.
        global_network_memory_reset();
        result.expression = result.network.to_expression();
    
        let memory = global_network_memory_to_expression();
        if(memory.length) {
            result.expression += ".memory(" + memory + ")";
        }

        if(!global_network_expression_compression) {
            result.expression += ".nocompress()";
        }
    } catch(e) {
        result.network.destroy();
        throw e;
    }
    
    result.network.destroy();
    return result;
}

nerve.short_to_verbose = function(code) {
    short_cloud.clear();
    eval("(function(){ return short_scope." + code + "})()");
    return short_cloud.contexts[0].to_expression();
}

nerve.verbose_to_short = function(code) {
    let result = eval("(function() { " + expression_to_context_scope_prefix + "; return " + code + "})()").to_short();

    // Do not need merge context end character if at the very end.
    if(result.endsWith(".M")) {
        result = result.substr(0, result.length-2);
    }

    return result;
}
