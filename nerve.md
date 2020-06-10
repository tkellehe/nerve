[Home](https://tkellehe.github.io/nerve/)

Click [here](https://tkellehe.github.io/nerve/nerve.html) to view the editor.

---

<div>
    <textarea rows="10" cols="75" id="code" placeholder="code"></textarea>
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
    (function(){
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
    
    function stateToByteString() {
        value = textToByteString(get_code())
        return "Vlang\0"+"1\0"+"python3\0"+"VTIO_OPTIONS\0"+"0\0"+"F.code.tio\0" + value.length + "\0" + value + "F.input.tio\0"+"0\0"+"Vargs\0"+"0\0"+"R"
    }
    
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
    
    function get_code() {
        let nerve_code = $("#code").value;
        let result = nerve_py + "\n" + nerve_code;
        return result;
    }
</script>
