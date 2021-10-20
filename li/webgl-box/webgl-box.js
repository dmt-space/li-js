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
            gridSize: { type: Number, default: 5 },
            gridPointSize: { type: Number, default: 4 },
            gridPointColor: { type: String, default: '1, 1, 1, 1' },
            showGrid: { type: Boolean, default: true },
            showGridBorder: { type: Boolean, default: true },
            zTranslation: { type: Number, default: -3.5 },
            amortization: { type: Number, default: 0.95 }
        }
    }
    get numColors() { return this.vertexColors.length }
    get numCubeVertices() { return this.cubeVertices.length * 3 }
    get numGridParticles() { return this.showGrid ? (this.gridSize + 1) * (this.gridSize + 1) * (this.gridSize + 1) : 0 }

    constructor() {
        super();
        this.drag = false;
        this.dX = this.dY = this.THETA = this.PHI = 0;
        this.cubeVertices = [
            [-1.0, -1.0, 1.0, 1.0],
            [-1.0, 1.0, 1.0, 1.0],
            [1.0, 1.0, 1.0, 1.0],
            [1.0, -1.0, 1.0, 1.0],
            [-1.0, -1.0, -1.0, 1.0],
            [-1.0, 1.0, -1.0, 1.0],
            [1.0, 1.0, -1.0, 1.0],
            [1.0, -1.0, -1.0, 1.0]
        ];
        this.vertexColors = [
            [1.0, 1.0, 1.0, 1.0],  // white
            [1.0, 0.5, 0.0, 1.0],  // orange
            [1.0, 0.0, 0.0, 1.0],  // red
            [1.0, 1.0, 0.0, 1.0],  // yellow
            [0.0, 1.0, 0.0, 1.0],  // green
            [0.0, 0.0, 1.0, 1.0],  // blue
            [1.0, 0.0, 1.0, 1.0],  // magenta
            [1.0, 0.5, 0.0, 1.0],  // orange
            [0.0, 1.0, 1.0, 1.0]   // cyan
        ];
    }

    firstUpdated() {
        super.firstUpdated();
        this.canvas = this.$id('canvas');
        this.gl = this.canvas.getContext("webgl");
        this.gl.viewportWidth = this.canvas.width = window.innerWidth;
        this.gl.viewportHeight = this.canvas.height = window.innerHeight;
        this.makeProgram();
        this.initBuffers();
        this.initGridParticles();
        this.animate();
    }

    makeProgram() {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, this.getShader('VERTEX_SHADER'));
        this.gl.attachShader(program, this.getShader('FRAGMENT_SHADER'));
        this.gl.linkProgram(program);
        this.gl.useProgram(program);
        this.shaderProgram = program;
    }
    getShader(type) {
        const shader = this.gl.createShader(this.gl[type]);
        const shaders = {
            VERTEX_SHADER: `
                attribute vec4 vPosition;
                attribute vec4 vColor;
                varying vec4 fColor;
                uniform mat4 mvMatrix;
                uniform mat4 pMatrix;
                uniform float gridPointSize;
                void main() 
                {
                    gl_Position = pMatrix * mvMatrix * vPosition;
                    fColor = vColor;
                    gl_PointSize = gridPointSize;
                } 
            `,
            FRAGMENT_SHADER: `
                precision mediump float;
                varying vec4 fColor;
                vec2 center = vec2(0.5, 0.5);
                void main()
                {
                    if (distance(center, gl_PointCoord) > 0.5) {
                        discard;
                    }
                    gl_FragColor = fColor;
                }
            `
        }
        this.gl.shaderSource(shader, shaders[type]);
        this.gl.compileShader(shader);
        return shader;
    }
    initBuffers() {
        this.cBufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 16 * (this.numGridParticles + this.numCubeVertices), this.gl.STATIC_DRAW);
        const vColor = this.gl.getAttribLocation(this.shaderProgram, "vColor");
        this.gl.vertexAttribPointer(vColor, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vColor);

        this.vBufferId = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferId);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, 16 * (this.numGridParticles + this.numCubeVertices), this.gl.STATIC_DRAW);
        const vPosition = this.gl.getAttribLocation(this.shaderProgram, "vPosition");
        this.gl.vertexAttribPointer(vPosition, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(vPosition);
    }
    initGridParticles() {
        this.particleSystem = [];
        if (this.showGrid) {
            const size = this.gridSize;
            for (let x = -size; x <= size; x += 2) {
                for (let y = -size; y <= size; y += 2) {
                    for (let z = -size; z <= size; z += 2) {
                        this.particleSystem.push({
                            color: this.gridPointColor.split(','),
                            position: [x / size, y / size, z / size, 1],
                            size: 1
                        });
                    }
                }
            }
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
        if (this.showGridBorder)
            for (var i = 0; i < 6; i++) this.gl.drawArrays(this.gl.LINE_LOOP, i * 4, 4);
        this.gl.drawArrays(this.gl.POINTS, this.numCubeVertices, this.numGridParticles);
        requestAnimationFrame(() => this.animate());
    }
    _recalc() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.colorsArray = [];
        this.pointsArray = [];
        this.makeGridBorder();
        for (var i = 0; i < this.numGridParticles; i++) {
            this.pointsArray.push(this.particleSystem[i].position);
            this.colorsArray.push(this.particleSystem[i].color);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.cBufferId);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.colorsArray.flat()));
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferId);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.pointsArray.flat()));

        const mvMatrix = modelViewMatrix();
        const pMatrix = perspectiveMatrix(1, this.gl.viewportWidth / this.gl.viewportHeight, .01, 100.0);
        translate(mvMatrix, mvMatrix, [0, 0, this.zTranslation]);
        rotate(mvMatrix, mvMatrix, this.THETA, [0, 1, 0]);
        rotate(mvMatrix, mvMatrix, this.PHI, [1, 0, 0]);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, "mvMatrix"), false, mvMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shaderProgram, "pMatrix"), false, pMatrix);
        this.gl.uniform1f(this.gl.getUniformLocation(this.shaderProgram, "gridPointSize"), this.gridPointSize);
    }
    mouseDown(e) {
        this.drag = true;
        this.oldX = e.pageX;
        this.oldY = e.pageY;
        e.preventDefault();
    }
    mouseUp(e) {
        this.drag = false;
    }
    mouseMove(e) {
        if (this.drag) {
            this.dX = (e.pageX - this.oldX) * 2 * Math.PI / this.canvas.width;
            this.dY = (e.pageY - this.oldY) * 2 * Math.PI / this.canvas.height;
            this.THETA += this.dX;
            this.PHI += this.dY;
            this.oldX = e.pageX;
            this.oldY = e.pageY;
            e.preventDefault();
        }
    }
    mouseWheel(e) {
        this.zTranslation += e.deltaY / (this.offsetHeight / 2);
    }
    makeGridBorder() {
        [
            1, 0, 3, 2,
            2, 3, 7, 6,
            3, 0, 4, 7,
            6, 5, 1, 2,
            4, 5, 6, 7,
            5, 4, 0, 1
        ].forEach(i => {
            this.pointsArray.push(this.cubeVertices[i]);
            this.colorsArray.push(this.vertexColors[0]);
        })
    }
})

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
function modelViewMatrix() {
    const out = new Float32Array(16);
    out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
    return out;
}
function translate(out, a, v) {
    const x = v[0], y = v[1], z = v[2];
    let a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;
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
function rotate(out, a, rad, axis) {
    const EPSILON = 0.000001;
    let x = axis[0], y = axis[1], z = axis[2],
        len = Math.hypot(x, y, z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;
    if (len < EPSILON) return null;
    len = 1 / len;
    x *= len; y *= len; z *= len;
    s = Math.sin(rad); c = Math.cos(rad); t = 1 - c;
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
    if (a !== out)
        out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
    return out;
}
