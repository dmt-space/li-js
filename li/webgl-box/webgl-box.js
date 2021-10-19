import { LiElement, html, css } from '../../li.js';

import * as _h4 from '../../lib/webgl/helper4.js';

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
            <canvas id='canvas' style='position: absolute; background-color: black; width: 100%; height: 100%;'
                @pointerdown=${this.mouseDown}
                @pointerup=${this.mouseUp}
                @pointerout=${this.mouseUp}
                @pointermove=${this.mouseMove}
            ></canvas>
        `;
    }

    static get properties() {
        return {
            numParticles: { type: Number, default: 200 },
            pointSize: { type: Number, default: 5 },
            maxNumParticles: { type: Number, default: 500 },
            amortization: { type: Number, default: 0.95 },
            zTranslation: { type: Number, default: -3.5 },
            hideBorder: { type: Boolean, default: false }
        }
    }
    get numColors() {
        return this.vertexColors.length;
    }
    get numVertices() {
        return this.vertices.length * 3;
    }
    constructor() {
        super();
        this.drag = false;
        this.dX = this.dY = this.THETA = this.PHI = 0;
        this.vertices = [
            _h4.vec4(-1.1, -1.1, 1.1, 1.0),
            _h4.vec4(-1.1, 1.1, 1.1, 1.0),
            _h4.vec4(1.1, 1.1, 1.1, 1.0),
            _h4.vec4(1.1, -1.1, 1.1, 1.0),
            _h4.vec4(-1.1, -1.1, -1.1, 1.0),
            _h4.vec4(-1.1, 1.1, -1.1, 1.0),
            _h4.vec4(1.1, 1.1, -1.1, 1.0),
            _h4.vec4(1.1, -1.1, -1.1, 1.0)
        ];
        this.vertexColors = [
            _h4.vec4(1.0, 1.0, 1.0, 1.0),  // white
            _h4.vec4(1.0, 0.5, 0.0, 1.0),  // orange
            _h4.vec4(1.0, 0.0, 0.0, 1.0),  // red
            _h4.vec4(1.0, 1.0, 0.0, 1.0),  // yellow
            _h4.vec4(0.0, 1.0, 0.0, 1.0),  // green
            _h4.vec4(0.0, 0.0, 1.0, 1.0),  // blue
            _h4.vec4(1.0, 0.0, 1.0, 1.0),  // magenta
            _h4.vec4(1.0, 0.5, 0.0, 1.0),  // orange
            _h4.vec4(0.0, 1.0, 1.0, 1.0)   // cyan
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
        this.initData();
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
    initData() {
        this.particleSystem = [];
        for (var i = 0; i < this.maxNumParticles; i++) {
            this.particleSystem.push(this.particle());
        }
        for (var i = 0; i < this.numParticles; i++) {
            this.particleSystem[i].mass = 1.0;
            this.particleSystem[i].color = this.vertexColors[i % this.numColors];
            for (var j = 0; j < 3; j++) {
                this.particleSystem[i].position[j] = 2.0 * Math.random() - 1.0;
            }
            this.particleSystem[i].position[3] = 1.0;
        }
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
        this.gl.viewportWidth = this.canvas.width = window.innerWidth;
        this.gl.viewportHeight = this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.colorsArray = [];
        this.pointsArray = [];
        this.colorCube();
        for (var i = 0; i < this.numParticles; i++) {
            this.pointsArray.push(this.particleSystem[i].position);
            this.colorsArray.push(this.particleSystem[i].color);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferId);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, _h4.flatten(this.colorsArray));
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferId);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, _h4.flatten(this.pointsArray));

        this.modelViewMatrix = _h4.create();
        this.projectionMatrix = _h4.perspectiveMatrix(1, this.gl.viewportWidth / this.gl.viewportHeight, .01, 100.0);
        _h4.translate(this.modelViewMatrix, this.modelViewMatrix, [0, 0, this.zTranslation]);
        _h4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.THETA, [0, 1, 0]);
        _h4.rotate(this.modelViewMatrix, this.modelViewMatrix, this.PHI, [1, 0, 0]);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, "modelViewMatrix"), false, _h4.flatten(this.modelViewMatrix));
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, "projectionMatrix"), false, _h4.flatten(this.projectionMatrix));
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
    particle() {
        var p = {};
        p.color = _h4.vec4(0, 0, 0, 1);
        p.position = _h4.vec4(0, 0, 0, 1);
        p.velocity = _h4.vec4(0, 0, 0, 0);
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
