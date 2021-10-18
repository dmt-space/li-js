import { LiElement, html, css } from '../../li.js';

import 'https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.6.1/gl-matrix.js';

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
            amortization: { type: Number, default: 0.95 }
        }
    }

    constructor() {
        super();
        this.drag = false;
        this.dX = this.dY = this.THETA = this.PHI = 0;
        this.zTranslation = -3;
        this.mvMatrix = mat4.create();
        this.pMatrix = mat4.create();
    }

    firstUpdated() {
        super.firstUpdated();

        this.canvas = this.$id('canvas');
        this.gl = this.canvas.getContext("webgl", { antialias: true });
        this.gl.viewportWidth = this.canvas.width = window.innerWidth;
        this.gl.viewportHeight = this.canvas.height = window.innerHeight;
        this.initShaders();
        this.initBuffers();
        this.setupWebGL();
        this.animate();
    }

    initShaders() {
        const fragmentShader = this.getShader(this.gl.FRAGMENT_SHADER, shaderFragmentSource);
        const vertexShader = this.getShader(this.gl.VERTEX_SHADER, shaderVertexSource);
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);
        this.gl.useProgram(this.shaderProgram);
        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
        this.shaderProgram.MVMatrix = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        this.shaderProgram.ProjMatrix = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    }
    getShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        return shader;
    }
    initBuffers() {
        const vertices = [
            -1, -1, 1,
            -1, 1, 1,
            1, 1, 1,
            1, -1, 1,

            -1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            1, -1, -1
        ];
        const indices = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 4, 5, 5, 6, 6, 7, 7, 4, 1, 5, 2, 6, 3, 7];
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
        this.vertexBuffer.itemSize = 3;
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
        this.indexBuffer.numberOfItems = indices.length;
    }
    setupWebGL() {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        mat4.perspective(this.pMatrix, 1.04, this.gl.viewportWidth / this.gl.viewportHeight, 0.1, 100.0);
    }
    setWebGL() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.mvMatrix, [0, 0, this.zTranslation]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.THETA, [0, 1, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.PHI, [1, 0, 0]);
    }
    draw() {
        this.gl.uniformMatrix4fv(this.shaderProgram.ProjMatrix, false, this.pMatrix);
        this.gl.uniformMatrix4fv(this.shaderProgram.MVMatrix, false, this.mvMatrix);
        this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.drawElements(this.gl.LINES, this.indexBuffer.numberOfItems, this.gl.UNSIGNED_SHORT, 0);
        //this.gl.flush();
    }
    animate() {
        if (!this.drag) {
            this.dX *= this.amortization;
            this.dY *= this.amortization;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }
        // this.THETA += .01;
        // this.PHI += .01;
        this.setWebGL();
        this.draw();
        requestAnimationFrame(() => this.animate());
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
})

const shaderVertexSource = `
attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}
`
const shaderFragmentSource = `
void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`
