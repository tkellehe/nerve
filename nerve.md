[Home](https://tkellehe.github.io/nerve/)

Click [here](https://tkellehe.github.io/nerve/nerve.html) to view the editor.

---

<div>
    <textarea rows="10" cols="75" id="python" placeholder="python"></textarea>
</div>
<div>
    <textarea rows="10" cols="75" id="code" placeholder="code"></textarea>
</div>
<div>
    <textarea rows="1" cols="75" id="input" placeholder="input"></textarea>
</div>
<div>
    <button onclick="execute()">RUN</button><a id="message"></a>
</div>
<div>
    <textarea rows="10" cols="75" id="output" placeholder="output"></textarea>
</div>
<div>
    <textarea rows="10" cols="75" id="debug" placeholder="debug"></textarea>
</div>
<div>
    <button onclick="reload()">RELOAD</button>
</div>

<script src="paco.js"></script>
<script>
    <!-- ******************************************************************************** -->
    <!-- This code was pulled from TIO -->
    var authKeyURL = "/cgi-bin/static/04cc47c57f016cbe971132df49bf9125-auth";
    var baseTitle = document.title;
    var bodyWidth = document.body.clientWidth;
    var cacheURL = "/cgi-bin/static/5f222455af4449f60c97222aa04d3510-cache";
    var fieldSeparator = "\xff";
    var greeted = "65a4609a"
    var languageId;
    var languages;
    var ms = window.MSInputMethodContext !== undefined;
    var quitURL = "/cgi-bin/static/c5ba5a3ddf5ce434ee4017d5cbc9f9f2-quit";
    var rEmptyStateString = /^[^ÿ]+ÿ+$/;
    var rExtraFieldStrings = /\xfe[\x00-\xf3\xff]+/g;
    var rEscapees = /[\x00-\x09\x0b-\x1f\x7f-\x9f&<>]| $/gm;
    var rFieldString = /^[\x00-\xf3\xff]+/;
    var rNewLine = /^/gm;
    var rLineOfSpaces = /^\s+$/m;
    var rSettingString = /\xf5[\x20-\x7e]+/;
    var rSurroundingLinefeed = /^\n|\n$/;
    var rUnpairedSurrogates = /[\ud800-\udbff](?![\udc00-\udfff])|([^\ud800-\udbff]|^)[\udc00-\udfff]/;
    var rUnicodeCharacters = /[^][\udc00-\udfff]?/g;
    var rUnprintable = /[\x00-\x09\x0b-\x1f\x7f-\x9f]/;
    var rXxdLastLine = /(\w+):(.*?)\s\s.*$/;
    var runRequest;
    var runURL = "/cgi-bin/static/fb67788fd3d1ebf92e66b295525335af-run";
    var savedFocus;
    var startOfExtraFields = "\xfe";
    var startOfSettings = "\xf5";
    var touchDevice = navigator.MaxTouchPoints > 0 || window.ontouchstart !== undefined;
    var token;
    
    var nerve_py = "";
    var nerve_raw = "https://raw.githubusercontent.com/tkellehe/nerve/master/src/python/nerve.py";
    (function fetch_nerve_py(){
        var client = new XMLHttpRequest();
        client.open('GET', nerve_raw);
        client.onreadystatechange = function() {
            nerve_py = client.responseText;
        }
        client.send();
    })();
    
    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function $$(selector, parent) {
        return (parent || document).querySelectorAll(selector);
    }

    function iterate(iterable, monad) {
        if (!iterable)
            return;
        for (var i = 0; i < iterable.length; i++)
            monad(iterable[i]);
    }

    function deflate(byteString) {
        return pako.deflateRaw(byteStringToByteArray(byteString), {"level": 9});
    }

    function inflate(byteString) {
        return byteArrayToByteString(pako.inflateRaw(byteString));
    }
    
    function byteStringToByteArray(byteString) {
        var byteArray = new Uint8Array(byteString.length);
        for(var index = 0; index < byteString.length; index++)
            byteArray[index] = byteString.charCodeAt(index);
        byteArray.head = 0;
        return byteArray;
    }

    function textToByteString(string) {
        return unescape(encodeURIComponent(string));
    }

    function byteStringToText(byteString) {
        return decodeURIComponent(escape(byteString));
    }

    function byteArrayToByteString(byteArray) {
        var retval = "";
        iterate(byteArray, function(byte) { retval += String.fromCharCode(byte); });
        return retval;
    }

    function byteStringToBase64(byteString) {
        return btoa(byteString).replace(/\+/g, "@").replace(/=+/, "");
    }

    function base64ToByteString(base64String) {
        return atob(unescape(base64String).replace(/@|-/g, "+").replace(/_/g, "/"))
    }

    function pluralization(number, string) {
        return number + " " + string + (number == 1 ? "" : "s");
    }

    function byteStringToTextArea(byteString, textArea) {
        textArea.value = byteStringToText(byteString);
        resize(textArea);
    }

    function countBytes(string, encoding) {
        if (string === "")
            return 0;
        if (encoding == "SBCS")
            return string.match(rUnicodeCharacters).length;
        if (encoding == "UTF-8")
            return textToByteString(string).length;
        if (encoding == "nibbles")
            return Math.ceil(string.match(rUnicodeCharacters).length / 2);
        if (encoding == "xxd") {
            var fields = string.match(rXxdLastLine);
            if (!fields)
                return 0;
            return Number("0x" + fields[1]) + fields[2].match(/\S\S/g).length;
        }
    }
    
    function bufferToHex(buffer) {
        var dataView = new DataView(buffer);
        var retval = "";

        for (var i = 0; i < dataView.byteLength; i++)
            retval += (256 | dataView.getUint8(i)).toString(16).slice(-2);

        return retval;
    }

    function getRandomBits(minBits) {
        var crypto = window.crypto || window.msCrypto;
        return bufferToHex(crypto.getRandomValues(new Uint8Array(minBits + 7 >> 3)).buffer);
    }

    <!-- ******************************************************************************** -->
    
    function runRequestOnReadyState() {
        if (runRequest.readyState != XMLHttpRequest.DONE)
            return;

        var response = byteArrayToByteString(new Uint8Array(runRequest.response));
        var statusCode = runRequest.status;
        var statusText = runRequest.statusText;

        runRequest = undefined;

        if (statusCode == 204) {
            execute();
            $("#output").placeholder += " Cache miss. Running code...";
            $("#message").innerHTML = "cache miss...";
            return;
        }

        if (statusCode >= 400) {
            console.log("Error " + statusCode, statusCode < 500 ? response || statusText : statusText);
            $("#message").innerHTML = "server error...";
            return;
        }

        try {
            var rawOutput = inflate(response.slice(10));
        } catch(error) {
            console.log("Error", "The server's response could not be decoded.");
            $("#message").innerHTML = "The server's response could not be decoded.";
            return;
        }

        try {
            response = byteStringToText(rawOutput);
        } catch(error) {
            response = rawOutput;
        }

        if (response.length < 32) {
            console.log("Error", "Could not establish or maintain a connection with the server.");
            $("#message").innerHTML = "Could not establish or maintain a connection with the server.";
        }

        $("#message").innerHTML = "processing...";
        var results = response.substr(16).split(response.substr(0, 16));
        var warnings = results.pop().split("\n");
        $("#output").value = results[0]
        $("#debug").value = results[1]
        $("#message").innerHTML = "done";
    }
    
    function execute() {
        if (runRequest) {
            var quitRequest = new XMLHttpRequest;
            quitRequest.open("GET", "https://tio.run/" + quitURL + "/" + token);
            quitRequest.send();
            return;
        }
        $("#message").innerHTML = "running...";
        token = getRandomBits(128);
        runRequest = new XMLHttpRequest;
        runRequest.open("POST", "https://tio.run/" + runURL + "/" + token, true);
        runRequest.responseType = "arraybuffer";
        runRequest.onreadystatechange = runRequestOnReadyState;
        runRequest.send(deflate(stateToByteString()));
    }
    
    characters = {};
    characters.correct = function(s) { return s[s.length-1] };
    (function() {
    let chars = '\u00b0\u00b9\u00b2\u00b3\u2074\u2075\u2076\u2077\u2078\u2079\u00b6\u00d7\u00f7\u207a\u207b\u207c\u2260\u2264\u2265\u2261\u2248\u207d\u207e\u221e\u00bf\u00a1\u203c\u2026\u20ac\u00a2\u00a3\u00a5\u00a4\u0021\u0022\u0023\u0024\u0025\u0026\u0027\u0028\u0029\u002a\u002b\u002c\u002d\u002e\u002f\u0030\u0031\u0032\u0033\u0034\u0035\u0036\u0037\u0038\u0039\u003a\u003b\u003c\u003d\u003e\u003f\u0040\u0041\u0042\u0043\u0044\u0045\u0046\u0047\u0048\u0049\u004a\u004b\u004c\u004d\u004e\u004f\u0050\u0051\u0052\u0053\u0054\u0055\u0056\u0057\u0058\u0059\u005a\u005b\u005c\u005d\u005e\u005f\u0060\u0061\u0062\u0063\u0064\u0065\u0066\u0067\u0068\u0069\u006a\u006b\u006c\u006d\u006e\u006f\u0070\u0071\u0072\u0073\u0074\u0075\u0076\u0077\u0078\u0079\u007a\u007b\u007c\u007d\u007e\u1ea0\u1e04\u1e0c\u1eb8\u1e24\u1eca\u1e32\u1e36\u1e42\u1e46\u1ecc\u1e5a\u1e62\u1e6c\u1ee4\u1e7e\u1e88\u1ef4\u1e92\u1ea1\u1e05\u1e0d\u1eb9\u1e25\u1ecb\u1e33\u1e37\u1e43\u1e47\u1ecd\u1e5b\u1e63\u1e6d\u1ee5\u1e7f\u1e89\u1ef5\u1e93\u0226\u1e02\u010a\u1e0a\u0116\u1e1e\u0120\u1e22\u0130\u013f\u1e40\u1e44\u022e\u1e56\u1e58\u1e60\u1e6a\u1e86\u1e8a\u1e8e\u017b\u0227\u1e03\u010b\u1e0b\u0117\u1e1f\u0121\u1e23\u0140\u1e41\u1e45\u022f\u1e57\u1e59\u1e61\u1e6b\u1e87\u1e8b\u1e8f\u017c\u0181\u0187\u018a\u0191\u0193\u0198\u019d\u01a4\u01ac\u01b2\u0224\u0253\u0188\u0257\u0192\u0260\u0199\u0272\u01a5\u01ad\u028b\u0225\u00ab\u00bb\u2018\u2019\u201c\u201d\u0266\u0271\u02a0\u027c\u0282\u00a6\u00a9\u00ae\u00c6\u00c7\u00d1\u00d8\u00de\u00e6\u00e7\u00f1\u00f8\u00fe\u0131\u0237\u0020\u000a'


    let char_to_int = {};
    (function(){for(let i = chars.length; i--;) char_to_int[characters.correct(chars.charAt(i))] = i })();

    characters.int_to_char = function(i) { return chars.charAt(i); };
    characters.char_to_int = function(c) { return char_to_int[c]; };
    })()
    function get_nerve_py() {
        return "FORCE_MAIN = True\n" + nerve_py + "\n" + $("#python").value;
    }
    function pad(n, width, z) {
      return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }
    function get_nerve_code() {
        let code = $("#code").value;
        let result = "";
        for(let i = 0; i < code.length; ++i) {
            result += "\\x" + pad(characters.char_to_int(code[i]).toString(16), 2);
        }
        return result;
    }
    function stateToByteString() {
        let nvpy = textToByteString(get_nerve_py())
        let nvc = textToByteString(get_nerve_code())
        return "Vlang\0"+"1\0"+"python3\0"+"VTIO_OPTIONS\0"+"0\0"+"F.code.tio\0" + nvpy.length + "\0" + nvpy + "F.input.tio\0"+nvc.length+"\0"+nvc+"Vargs\0"+"2\0"+"-i\0"+textToByteString($("#input").value)+"\0"+"R"
    }
    function reload() { window.location.reload(true) }
</script>
