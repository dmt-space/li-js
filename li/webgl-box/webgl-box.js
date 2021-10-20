import { LiElement, html, css } from '../../li.js';

customElements.define('li-webgl-box', class LiWebGLBox extends LiElement {
    static get styles() {
        return css`
            :host {
                position: relative;
                width: 100%;
                height: 100%;
            }
        `;
    }

    render() {
        return html`
            <canvas id='canvas' style='position: absolute; background-color: black; width: 100%; height: 100%; touch-action: none;'
                @pointerdown=${this.mouseDown}
                @pointerup=${this.mouseUp}
                @pointerout=${this.mouseUp}
                @pointermove=${this.mouseMove}
                @mousewheel=${this.mouseWheel}
            ></canvas>
        `;
    }

    static get properties() {
        return {
            pointSize: { type: Number, default: 4 },
            amortization: { type: Number, default: 0.95 },
            zTranslation: { type: Number, default: -3.5 },
            hideBorder: { type: Boolean, default: false },
            size: { type: Number, default: 4 },
        }
    }
    get numColors() {
        return this.vertexColors.length;
    }
    get numVertices() {
        return this.vertices.length * 3;
    }
    get numParticles() {
        return (this.size + 1) * (this.size + 1) * (this.size + 1);
    }
    get maxNumParticles() {
        return this.numParticles;
    }
    constructor() {
        super();
        this.drag = false;
        this.dX = this.dY = this.THETA = this.PHI = 0;
        this.vertices = [
            vec4(-1.1, -1.1, 1.1, 1.0),
            vec4(-1.1, 1.1, 1.1, 1.0),
            vec4(1.1, 1.1, 1.1, 1.0),
            vec4(1.1, -1.1, 1.1, 1.0),
            vec4(-1.1, -1.1, -1.1, 1.0),
            vec4(-1.1, 1.1, -1.1, 1.0),
            vec4(1.1, 1.1, -1.1, 1.0),
            vec4(1.1, -1.1, -1.1, 1.0)
        ];
        this.vertexColors = [
            vec4(1.0, 1.0, 1.0, 1.0),  // white
            vec4(1.0, 0.5, 0.0, 1.0),  // orange
            vec4(1.0, 0.0, 0.0, 1.0),  // red
            vec4(1.0, 1.0, 0.0, 1.0),  // yellow
            vec4(0.0, 1.0, 0.0, 1.0),  // green
            vec4(0.0, 0.0, 1.0, 1.0),  // blue
            vec4(1.0, 0.0, 1.0, 1.0),  // magenta
            vec4(1.0, 0.5, 0.0, 1.0),  // orange
            vec4(0.0, 1.0, 1.0, 1.0)   // cyan
        ];
    }

    firstUpdated() {
        super.firstUpdated();

        this.canvas = this.$id('canvas');
        this.gl = this.canvas.getContext("webgl");
        this.gl.viewportWidth = this.canvas.width = window.innerWidth;
        this.gl.viewportHeight = this.canvas.height = window.innerHeight;
        this.initShaders();
        this.initBuffers();
        this.initParticle();
        this.animate();
    }

    initShaders() {
        const shaderVertexSource = `
attribute vec4 vPosition;
attribute vec4 vColor;
varying vec4 fColor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float pointSize;
void main() 
{
    gl_Position = projectionMatrix * modelViewMatrix * vPosition;
    fColor = vColor;
    gl_PointSize = pointSize;
} 
`
        const shaderFragmentSource = `
precision mediump float;
varying vec4 fColor;
void main()
{
    gl_FragColor = fColor;
}
`
        this.shaderProgram = this.gl.createProgram();
        const fragmentShader = this.getShader(this.gl.FRAGMENT_SHADER, shaderFragmentSource);
        const vertexShader = this.getShader(this.gl.VERTEX_SHADER, shaderVertexSource);
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        this.gl.useProgram(this.shaderProgram);
    }
    getShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        return shader;
    }
    initBuffers() {
        this.cBufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 16 * (this.maxNumParticles + this.numVertices), this.gl.STATIC_DRAW);

        this.vColor = this.gl.getAttribLocation(this.shaderProgram, "vColor");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vColor);

        this.vBufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 16 * (this.maxNumParticles + this.numVertices), this.gl.STATIC_DRAW);

        this.vPosition = this.gl.getAttribLocation(this.shaderProgram, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.vPosition);
    }
    initParticle() {
        this.particleSystem = [];
        const size = this.size;
        let i = 0;
        for (let x = -size; x <= size; x += 2) {
            for (let y = -size; y <= size; y += 2) {
                for (let z = -size; z <= size; z += 2) {
                    const p = this.particle();
                    const r = Math.random();

                    // p.color = this.vertexColors[i % this.numColors];
                    // p.color = i === 0 ? [0, 1, 0, 0] : i === size ? [0, 0, 1, 1] : [1, 1, 1, .1];
                    p.color = [1, 1, 1, 1];
                    p.position[0] = x / size;
                    p.position[1] = y / size;
                    p.position[2] = z / size;
                    p.position[3] = 1.0;
                    this.particleSystem.push(p);
                }
            }
            i++;
        }
        // for (var i = 0; i < this.maxNumParticles; i++) {
        //     this.particleSystem.push(this.particle());
        // }
        // for (var i = 0; i < this.numParticles; i++) {
        //     this.particleSystem[i].mass = 1.0;
        //     this.particleSystem[i].color = this.vertexColors[i % this.numColors];
        //     for (var j = 0; j < 3; j++) {
        //         this.particleSystem[i].position[j] = 2.0 * Math.random() - 1.0;
        //     }
        //     this.particleSystem[i].position[3] = 1.0;
        // }
    }
    animate() {
        if (!this.drag) {
            this.dX *= this.amortization;
            this.dY *= this.amortization;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }
        this._recalc();
        if (!this.hideBorder) {
            for (var i = 0; i < 6; i++) this.gl.drawArrays(this.gl.LINE_LOOP, i * 4, 4);
        }
        this.gl.drawArrays(this.gl.POINTS, this.numVertices, this.numParticles);
        requestAnimationFrame(() => this.animate());
    }
    _recalc() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.colorsArray = [];
        this.pointsArray = [];
        this.colorCube();
        for (var i = 0; i < this.numParticles; i++) {
            this.pointsArray.push(this.particleSystem[i].position);
            this.colorsArray.push(this.particleSystem[i].color);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferId);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(this.colorsArray));
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferId);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, flatten(this.pointsArray));

        this.modelViewMatrix = create();
        this.projectionMatrix = perspectiveMatrix(1, this.gl.viewportWidth / this.gl.viewportHeight, .01, 100.0);
        translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, this.zTranslation]);
        rotate(this.modelViewMatrix, this.modelViewMatrix, this.THETA, [0, 1, 0]);
        rotate(this.modelViewMatrix, this.modelViewMatrix, this.PHI, [1, 0, 0]);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, "modelViewMatrix"), false, flatten(this.modelViewMatrix));
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix"), false, flatten(this.projectionMatrix));
        this.gl.uniform1f(this.gl.getUniformLocation(this.shaderProgram, "pointSize"), this.pointSize);
    }
    mouseDown(e) {
        this.drag = true;
        this.oldX = e.pageX;
        this.oldY = e.pageY;
        e.preventDefault();
        return false;
    }
    mouseUp(e) {
        this.drag = false;
    }
    mouseMove(e) {
        if (!this.drag) return false;
        this.dX = (e.pageX - this.oldX) * 2 * Math.PI / this.canvas.width;
        this.dY = (e.pageY - this.oldY) * 2 * Math.PI / this.canvas.height;
        this.THETA += this.dX;
        this.PHI += this.dY;
        this.oldX = e.pageX;
        this.oldY = e.pageY;
        e.preventDefault();
    }
    mouseWheel(e) {
        this.zTranslation += e.deltaY / (this.offsetHeight / 2);
    }
    particle() {
        var p = {};
        p.color = vec4(0, 0, 0, 1);
        p.position = vec4(0, 0, 0, 1);
        p.velocity = vec4(0, 0, 0, 0);
        p.mass = 1;
        return p;
    }
    quad(a, b, c, d) {
        this.pointsArray.push(this.vertices[a]);
        this.colorsArray.push(this.vertexColors[0]);
        this.pointsArray.push(this.vertices[b]);
        this.colorsArray.push(this.vertexColors[0]);
        this.pointsArray.push(this.vertices[c]);
        this.colorsArray.push(this.vertexColors[0]);
        this.pointsArray.push(this.vertices[d]);
        this.colorsArray.push(this.vertexColors[0]);
    }
    colorCube() {
        this.quad(1, 0, 3, 2);
        this.quad(2, 3, 7, 6);
        this.quad(3, 0, 4, 7);
        this.quad(6, 5, 1, 2);
        this.quad(4, 5, 6, 7);
        this.quad(5, 4, 0, 1);
    }
})

const ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
function _argumentsToArray(args) {
    return [].concat.apply([], Array.prototype.slice.apply(args));
}
function radians(degrees) {
    return degrees * Math.PI / 180.0;
}
function vec4() {
    let result = _argumentsToArray(arguments);
    switch (result.length) {
        case 0: result.push(0.0);
        case 1: result.push(0.0);
        case 2: result.push(0.0);
        case 3: result.push(1.0);
    }
    return result.splice(0, 4);
}
function flatten(v) {
    if (v.matrix === true)
        v = transpose(v);
    let n = v.length;
    let elemsAreArrays = false;
    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }
    const floats = new Float32Array(n);
    if (elemsAreArrays) {
        let idx = 0;
        for (let i = 0; i < v.length; ++i)
            for (let j = 0; j < v[i].length; ++j)
                floats[idx++] = v[i][j];
    }
    else
        for (let i = 0; i < v.length; ++i)
            floats[i] = v[i];
    return floats;
}
function perspectiveMatrix(fieldOfViewInRadians, aspectRatio, near, far) {
    const f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
    const rangeInv = 1 / (near - far);
    return [
        f / aspectRatio, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}
function create() {
    const out = new ARRAY_TYPE(16);
    if (ARRAY_TYPE != Float32Array) {
        out[1] = 0; out[2] = 0; out[3] = 0; out[4] = 0;
        out[6] = 0; out[7] = 0; out[8] = 0; out[9] = 0;
        out[11] = 0; out[12] = 0; out[13] = 0; out[14] = 0;
    }
    out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
    return out;
}
function perspective(out, fovy, aspect, near, far) {
    const f = 1.0 / Math.tan(fovy / 2);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[11] = -1;
    out[12] = 0; out[13] = 0; out[15] = 0;
    if (far != null && far !== Infinity) {
        const nf = 1 / (near - far);
        out[10] = (far + near) * nf;
        out[14] = 2 * far * near * nf;
    } else {
        out[10] = -1;
        out[14] = -2 * near;
    }
    return out;
}
function translate(out, a, v) {
    const x = v[0], y = v[1], z = v[2];
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;
    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
}
const EPSILON = 0.000001;
function rotate(out, a, rad, axis) {
    let x = axis[0], y = axis[1], z = axis[2];
    let len = Math.hypot(x, y, z);
    let s, c, t;
    let a00, a01, a02, a03;
    let a10, a11, a12, a13;
    let a20, a21, a22, a23;
    let b00, b01, b02;
    let b10, b11, b12;
    let b20, b21, b22;
    if (len < EPSILON) return null;
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
    s = Math.sin(rad);
    c = Math.cos(rad);
    t = 1 - c;
    a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
    a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
    a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
    out[0] = a00 * b00 + a10 * b01 + a20 * b02;
    out[1] = a01 * b00 + a11 * b01 + a21 * b02;
    out[2] = a02 * b00 + a12 * b01 + a22 * b02;
    out[3] = a03 * b00 + a13 * b01 + a23 * b02;
    out[4] = a00 * b10 + a10 * b11 + a20 * b12;
    out[5] = a01 * b10 + a11 * b11 + a21 * b12;
    out[6] = a02 * b10 + a12 * b11 + a22 * b12;
    out[7] = a03 * b10 + a13 * b11 + a23 * b12;
    out[8] = a00 * b20 + a10 * b21 + a20 * b22;
    out[9] = a01 * b20 + a11 * b21 + a21 * b22;
    out[10] = a02 * b20 + a12 * b21 + a22 * b22;
    out[11] = a03 * b20 + a13 * b21 + a23 * b22;
    if (a !== out) {
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    return out;
}
