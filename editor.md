[Home](https://tkellehe.github.io/nerve/)

Click [here](https://tkellehe.github.io/nerve/editor.html) to view the editor.

---

<script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"></script>
<script src="src/js/docs.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.0.0/dist/tf.min.js"></script>
<script src="src/js/detail/helpers.js"></script>
<script src="src/js/detail/layers.js"></script>
<script src="src/js/detail/collectors.js"></script>
<script src="src/js/detail/neural.js"></script>
<script src="src/js/detail/expression.js"></script>
<script src="src/js/detail/short.js"></script>
<script src="src/js/detail/expression_to_context.js"></script>
<script src="src/js/nerve.js"></script>

<div>
    <textarea rows="2" cols="100" id="header" placeholder="header"></textarea>
</div>
<div>
    <textarea rows="10" cols="100" id="code" placeholder="code"></textarea>
</div>
<div>
    <textarea rows="2" cols="100" id="footer" placeholder="footer"></textarea>
</div>
<div>
    <button onclick="docs.execute()">RUN</button><a id="message"></a>
</div>
<div>
    <textarea rows="10" cols="100" id="output" placeholder="output"></textarea>
</div>
<div>
    <textarea rows="10" cols="100" id="expression"></textarea>
</div>
<div>
    <textarea rows="20" cols="100" id="debug"></textarea>
</div>
<div>
    <button onclick="docs.reload()">RELOAD</button>
</div>
