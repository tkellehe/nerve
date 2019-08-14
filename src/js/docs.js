(function(){
//************************************************************************************************************
function logger(s) {
    let textarea_debug = document.getElementById("debug");
    if(textarea_debug.value === undefined) textarea_debug.value = "";
    textarea_debug.value += s + "\n";
}

//************************************************************************************************************
is_running = false;
async function execute(is_code_short=false) {
    let a_message = document.getElementById("message");
    try {
        if(is_running) return;
        let textarea_header = document.getElementById("header");
        let textarea_code = document.getElementById("code");
        let textarea_footer = document.getElementById("footer");
        let textarea_output = document.getElementById("output");
        let textarea_expression = document.getElementById("expression");
        a_message.innerHTML = "running...";
        is_running = true;
        let main = textarea_code.value;
        if(is_code_short) main = nerve.short_to_verbose(main);
        let code = textarea_header.value + main + textarea_footer.value;
        let result = await nerve.execute_verbose(code)
        if(result.is_learning) {
            a_message.innerHTML = "(" + result.num_passed + "/" + result.total + " successes) " + (result.num_passed === result.total ? "passed" : "failed");
            textarea_output.value = JSON.stringify(result.output);
        } else {
            a_message.innerHTML = 'done';
            if(result.output.length === 1) {
                textarea_output.value = result.output[0];
            } else if(result.output.length) {
                if(result.is_checking) {
                    a_message.innerHTML =  "(" + result.num_passed + "/" + result.total + " successes) " + (result.num_passed === result.total ? "passed" : "failed");
                }
                textarea_output.value = JSON.stringify(result.output);
            } else {
                textarea_output.value = '';
            }
        }
        textarea_expression.value = result.expression;
        is_running = false;
    } catch(e) {
        logger(e.toString());
        logger(e.stack);
        is_running = false;
        a_message.innerHTML = 'exception';
    }
}

//************************************************************************************************************
function reload() { window.location.reload(true) }

//************************************************************************************************************
this.docs = {
    logger:logger,
    execute:execute,
    reload:reload
};
})();
