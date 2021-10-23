import { LiElement, html, css } from '../../li.js';

customElements.define('li-webgl-box', class LiWebGLBox extends LiElement {
    static get styles() {
        return css`
            :host {
                display: flex;
                width: 100%;
                height: 100%;
            }
        `;
    }

    render() {
        return html`
            <canvas id='canvas' style='flex: 1; width: 100%; height: 100%; touch-action: none;'
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
            showGrid: { type: Boolean, default: true },
            gridSize: { type: Number, default: 10 },
            gridPointSize: { type: Number, default: 1 },
            gridColor: { type: String, default: '0, 0, 1, 0.1' },
            showBorder: { type: Boolean, default: true },
            borderColor: { type: String, default: '0, 0, 1, 1' },
            zTranslation: { type: Number, default: -3.5 },
            amortization: { type: Number, default: 0.95 }
        }
    }
    constructor() {
        super();
        this.drag = false;
        this.dX = this.dY = this.THETA = this.PHI = 0;
    }

    firstUpdated() {
        super.firstUpdated();
        this.canvas = this.$id('canvas');
        this.gl = this.canvas.getContext("webgl2");
        this.gl.viewportWidth = this.canvas.width = window.innerWidth;
        this.gl.viewportHeight = this.canvas.height = window.innerHeight;
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.shapes = [];
        if (this.showGrid) this.initGrid(this.gl, this.shapes, this.gridSize);
        if (this.showBorder) this.initBorder(this.gl, this.shapes);
        this.initCone(this.gl, this.shapes);
        this.draw();
    }

    draw() {
        if (!this.drag) {
            this.dX *= this.amortization;
            this.dY *= this.amortization;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }

        const gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        const uModelViewMatrix = modelViewMatrix();
        const uProjectionMatrix = perspectiveMatrix(1, gl.viewportWidth / gl.viewportHeight, .01, 1000.0);
        translate(uModelViewMatrix, uModelViewMatrix, [0, 0, this.zTranslation]);
        rotate(uModelViewMatrix, uModelViewMatrix, this.THETA, [0, 1, 0]);
        rotate(uModelViewMatrix, uModelViewMatrix, this.PHI, [1, 0, 0]);

        this.shapes.forEach(sh => {
            gl.useProgram(sh.program);
            gl.bindVertexArray(sh.vao);

            gl.uniformMatrix4fv(gl.getUniformLocation(sh.program, "uModelViewMatrix"), false, uModelViewMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(sh.program, "uProjectionMatrix"), false, uProjectionMatrix);

            sh.draw(gl, sh);

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        })
        requestAnimationFrame(() => this.draw());
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
    mouseWheel(e) {
        this.zTranslation += e.deltaY / (this.offsetHeight / 2);
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
    initGrid(gl, shapes, size) {
        const info = { name: 'cone', size: 3, vertexShader: 'vs_Grid', fragmentShader: 'fs_Grid' };
        info._vertices = [];
        for (let x = -size; x <= size; x += 2)
            for (let y = -size; y <= size; y += 2)
                for (let z = -size; z <= size; z += 2)
                    info._vertices.push(...[x / size, y / size, z / size]);
        info._indices = [];
        for (let i = 0; i < (info._vertices.length / 3); i++) info._indices.push(i);
        info._attributes = ['aVertexPosition'];
        info.draw = (gl, sh) => {
            gl.uniform1f(gl.getUniformLocation(sh.program, "uPointSize"), this.gridPointSize);
            gl.uniform4fv(gl.getUniformLocation(sh.program, "uPointColor"), this.gridColor.split(','));
            gl.drawElements(gl.POINTS, sh.indices.length, gl.UNSIGNED_SHORT, 0);
        }
        initInfo(gl, shapes, info);
    }
    initBorder(gl, shapes) {
        const info = { name: 'cone', size: 3, vertexShader: 'vs_Grid', fragmentShader: 'fs_Border' };
        info._vertices = [
            -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1, -1, -1, 1,
            -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1,
            -1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1, -1, -1, -1, 1, -1, -1,
        ]
        info._attributes = ['aVertexPosition'];
        info.draw = (gl, sh) => {
            gl.uniform4fv(gl.getUniformLocation(sh.program, "uPointColor"), this.borderColor.split(','));
            gl.drawArrays(gl.LINE_STRIP, 0, 10);
            gl.drawArrays(gl.LINES, 10, 6);
        }
        initInfo(gl, shapes, info);
    }
    initCone(gl, shapes) {
        const info = { name: 'cone', size: 3, vertexShader: 'vs_Cone', fragmentShader: 'fs_Cone' };
        info._vertices = [
            0.5, 0, 0, -0.5, 1, 0, -0.5, 0.809017, 0.587785, -0.5, 0.309017, 0.951057, -0.5, -0.309017, 0.951057, -0.5, -0.809017, 0.587785,
            -0.5, -1, 0, -0.5, -0.809017, -0.587785, -0.5, -0.309017, -0.951057, -0.5, 0.309017, -0.951057, -0.5, 0.809017, -0.587785
        ];
        info._indices = [0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 5, 0, 5, 6, 0, 6, 7, 0, 7, 8, 0, 8, 9, 0, 9, 10, 0, 10, 1];
        info._attributes = ['aVertexPosition'];
        info.draw = (gl, sh) => {
            sh.count = sh.count || 0;
            sh.count += 0.01;
            const uModelViewMatrix = modelViewMatrix();
            const uProjectionMatrix = perspectiveMatrix(1, gl.viewportWidth / gl.viewportHeight, .01, 1000.0);
            translate(uModelViewMatrix, uModelViewMatrix, [0, 0, this.zTranslation - 7]);
            rotate(uModelViewMatrix, uModelViewMatrix, this.THETA, [0, 1, 0]);
            rotate(uModelViewMatrix, uModelViewMatrix, this.PHI + sh.count, [1, 0, 0]);
            gl.uniformMatrix4fv(gl.getUniformLocation(sh.program, "uModelViewMatrix"), false, uModelViewMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(sh.program, "uProjectionMatrix"), false, uProjectionMatrix);
            gl.drawElements(gl.LINE_LOOP, sh.indices.length, gl.UNSIGNED_SHORT, 0);
        }
        initInfo(gl, shapes, info);
    }
})

const initInfo = (gl, shapes, info) => {
    info.program = createProgram(gl, info.vertexShader, info.fragmentShader);
    if (!info.program) return null;
    shapes.push(info);

    info.vao = gl.createVertexArray();
    gl.bindVertexArray(info.vao);

    info.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, info.vbo);
    info.vertices = new Float32Array(info._vertices);
    gl.bufferData(gl.ARRAY_BUFFER, info.vertices, gl.STATIC_DRAW);
    (info._attributes || []).forEach(i => {
        info[i] = gl.getAttribLocation(info.program, i);
        gl.vertexAttribPointer(info[i], info.size || 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(info[i]);
    })

    info.ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, info.ibo);
    info.indices = new Uint16Array(info._indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, info.indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
const createProgram = (gl, vertexShader = 'v_shader', fragmentShader = 'f_shader') => {
    const program = gl.createProgram();
    gl.attachShader(program, initShader(gl, vertexShader));
    gl.attachShader(program, initShader(gl, fragmentShader));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Could not create program');
        return null;
    }
    gl.useProgram(program);
    return program;
}
const initShader = (gl, name) => {
    const type = name.startsWith('vs_') ? 'VERTEX_SHADER' : 'FRAGMENT_SHADER';
    const shader = gl.createShader(gl[type]);
    gl.shaderSource(shader, shaders[name].trim());
    gl.compileShader(shader);
    return shader;
}
const shaders = {
    vs_Grid: `#version 300 es
        precision mediump float;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        uniform float uPointSize;
        uniform vec4 uPointColor;
        in vec3 aVertexPosition;
        out vec4 fColor;
        void main(void) {
            gl_Position = vec4(aVertexPosition, 1.0);
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            fColor = uPointColor;
            gl_PointSize = uPointSize;
        } 
    `,
    fs_Grid: `#version 300 es
        precision mediump float;
        in vec4 fColor;
        out vec4 fragColor;
        void main(void) {
            if (length(gl_PointCoord - vec2(0.5)) > 0.5)
                discard;
            fragColor = fColor;
        }
    `,
    fs_Border: `#version 300 es
        precision mediump float;
        in vec4 fColor;
        out vec4 fragColor;
        void main(void) {
            fragColor = fColor;
        }
    `,
    vs_Cone: `#version 300 es
        precision mediump float;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        in vec3 aVertexPosition;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        }
    `,
    fs_Cone: `#version 300 es
        precision mediump float;
        out vec4 fragColor;
        void main(void) {
            fragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
    `,
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
        len = Math.hypot(x, y, z), s, c, t,
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
    if (a !== out) out[12] = a[12]; out[13] = a[13]; out[14] = a[14]; out[15] = a[15];
    return out;
}
