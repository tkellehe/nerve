[Home](https://tkellehe.github.io/nerve/)

Click [here](https://tkellehe.github.io/nerve/nerve.html) to view the editor powered by [__tio_lang__](https://tkellehe.github.io/tio-lang/).

---

<div id='editor'></div>

---

<div>
    <button onclick="reload()">force refresh</button><button onclick="fetch_nerve_py()">nerve.py</button>
</div>

<script type="text/javascript" src="https://tkellehe.github.io/tio-lang/release/tio_lang-1.0.js"></script>

<script>
    var nerve_py = "";
    var nerve_py_path = "https://tkellehe.github.io/nerve/src/python/nerve.py";
    var editor = document.getElementById("editor");

    function fetch_nerve_py(){
        var client = new XMLHttpRequest();
        client.open('GET', nerve_py_path);
        client.onreadystatechange = function() {
            if(client.readyState != XMLHttpRequest.DONE) return;
            nerve_py = client.responseText.replace(/\\/g, "\\\\");

            editor.setAttribute('tio-header', nerve_py + '\n\ncode="""');
            editor.setAttribute('tio-code', '');
            editor.setAttribute('tio-footer', '"""\ncode=code[1:-2]\nimport sys\nparse_argv(sys.argv, sys.stdin.read())\nmain(code)');
            editor.setAttribute('tio-runable', '');
            editor.setAttribute('tio-js', '');
            editor.setAttribute('tio-editable', '');
            editor.setAttribute('tio-input', '');
            editor.setAttribute('tio-debug', '');
            editor.setAttribute('tio-args', '');
            editor.setAttribute('tio-animate-button', '');

            editor.setAttribute('tio-hide-header', '');
            editor.setAttribute('tio-hide-footer', '');
            editor.setAttribute('tio-hide-bytes', '');
            editor.setAttribute('tio-hide-language', '');

            tio_apply_editor(editor)
        }
        client.send();
    }
    function reload() { window.location.reload(true) }

    fetch_nerve_py();
</script>
