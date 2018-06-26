var gl, prg, canvas;

window.onload = function(){
    init();
}

function init() {
    if(!canvas) canvas = document.getElementById('canvas');
    if(!gl) gl = canvas.getContext('webgl');
    document.body.style.margin = 0;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    prg = gl.createProgram();
    var vSource = 'attribute vec3 p;void main(){gl_Position=vec4(p,1.);}';
    readFile(document.getElementById('fs').getAttribute('data-src'),
             function(str){ start_render(vSource, str) });
}

function start_render(vSource, fSource) {
    if(!shader(0, vSource) && !shader(1, fSource)) {
        gl.linkProgram(prg);
    } else {
        return;
    }
    var e = gl.getProgramParameter(prg, gl.LINK_STATUS);
    if(!e) {
        alert(gl.getProgramInfoLog(prg));
        return;
    }
    gl.useProgram(prg);
    setTimeout(function(){ render(); }, 100);
}

function shader(i, j) {
    var k = gl.createShader(gl.VERTEX_SHADER - i);
    gl.shaderSource(k, j);
    gl.compileShader(k);
    if(!gl.getShaderParameter(k, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(k));
        return;
    }
    gl.attachShader(prg, k);
    return gl.getShaderInfoLog(k);
}

function render() {
    var a, d, z;
    var uni = {};
    uni.time = gl.getUniformLocation(prg, 't');
    uni.resolution = gl.getUniformLocation(prg, 'r');
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0,-1,-1,0,1,1,0,1,-1,0]), gl.STATIC_DRAW);
    a = gl.getAttribLocation(prg, 'p');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 3, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    z = new Date().getTime();
    (function(){
        d = (new Date().getTime() - z) * 0.001;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uni.time, d);
        gl.uniform2fv(uni.resolution, [canvas.width, canvas.height]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.flush();
        requestAnimationFrame(arguments.callee);
    })();
}

function readFile(filename, callback) {
    var h = new XMLHttpRequest();
    h.open('GET', filename, true);
    h.onreadystatechange = function() {
        if (h.readyState == 4) {
            var str = h.responseText;
            callback(str);
        }
    }
    h.send(null);
}
