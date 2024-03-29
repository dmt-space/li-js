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
            amortization: { type: Number, default: 1 }
        }
    }

    constructor() {
        super();
        this.drag = false;
        this.dX = this.dY = this.timeOld = this.THETA = this.PHI = 0;
    }

    firstUpdated() {
        super.firstUpdated();

        this.canvas = this.$id('canvas');
        this.canvas.width = window.innerWidth / 2 - 6;
        this.canvas.height = window.innerHeight / 2 - 6;
        try {
            this.gl = this.canvas.getContext("webgl", { antialias: true });
        } catch (e) {
            console.log("You are not webgl compatible :(");
            return false;
        }
        this.initShaders();
        this.initBuffers();
        this.setupWebGL();
        this.animate(0);
    }

    initShaders() {
        const shaderVertex = this.getShader(shaderVertexSource, this.gl.VERTEX_SHADER, "VERTEX");
        const shaderFragment = this.getShader(shaderFragmentSource, this.gl.FRAGMENT_SHADER, "FRAGMENT");
        const shaderProgramm = this.gl.createProgram();
        this.gl.attachShader(shaderProgramm, shaderVertex);
        this.gl.attachShader(shaderProgramm, shaderFragment);
        this.gl.linkProgram(shaderProgramm);
        this._Pmatrix = this.gl.getUniformLocation(shaderProgramm, "Pmatrix");
        this._Vmatrix = this.gl.getUniformLocation(shaderProgramm, "Vmatrix");
        this._Mmatrix = this.gl.getUniformLocation(shaderProgramm, "Mmatrix");
        this._color = this.gl.getAttribLocation(shaderProgramm, "color");
        this._position = this.gl.getAttribLocation(shaderProgramm, "position");
        this.gl.enableVertexAttribArray(this._color);
        this.gl.enableVertexAttribArray(this._position);
        this.gl.useProgram(shaderProgramm);
    }
    getShader(source, type, typeString) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log("ERROR IN " + typeString + " SHADER : " + this.gl.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    }
    initBuffers() {
        const cubeVertex = [
            -1, -1, -1, 1, 1, 0,
            1, -1, -1, 1, 1, 0,
            1, 1, -1, 1, 1, 0,
            -1, 1, -1, 1, 1, 0,

            -1, -1, 1, 0, 0, 1,
            1, -1, 1, 0, 0, 1,
            1, 1, 1, 0, 0, 1,
            -1, 1, 1, 0, 0, 1,

            -1, -1, -1, 0, 1, 1,
            -1, 1, -1, 0, 1, 1,
            -1, 1, 1, 0, 1, 1,
            -1, -1, 1, 0, 1, 1,

            1, -1, -1, 1, 0, 0,
            1, 1, -1, 1, 0, 0,
            1, 1, 1, 1, 0, 0,
            1, -1, 1, 1, 0, 0,

            -1, -1, -1, 1, 0, 1,
            -1, -1, 1, 1, 0, 1,
            1, -1, 1, 1, 0, 1,
            1, -1, -1, 1, 0, 1,

            -1, 1, -1, 0, 1, 0,
            -1, 1, 1, 0, 1, 0,
            1, 1, 1, 0, 1, 0,
            1, 1, -1, 0, 1, 0
        ];
        const cubeFaces = [
            0, 1, 2,
            0, 2, 3,

            4, 5, 6,
            4, 6, 7,

            8, 9, 10,
            8, 10, 11,

            12, 13, 14,
            12, 14, 15,

            16, 17, 18,
            16, 18, 19,

            20, 21, 22,
            20, 22, 23
        ];
        this.CUBE_VERTEX = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.CUBE_VERTEX);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(cubeVertex), this.gl.STATIC_DRAW);
        this.CUBE_FACES = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.CUBE_FACES);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeFaces), this.gl.STATIC_DRAW);
    }
    setupWebGL() {
        this.PROJMATRIX = LIBS.get_projection(40, this.canvas.width / this.canvas.height, 1, 100);
        this.MOVEMATRIX = LIBS.get_I4();
        this.VIEWMATRIX = LIBS.get_I4();
        LIBS.translateX(this.VIEWMATRIX, 0);
        LIBS.translateY(this.VIEWMATRIX, 0);
        LIBS.translateZ(this.VIEWMATRIX, -6);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clearDepth(1.0);
    }
    animate(time) {
        let dt = time - this.timeOld;
        if (!this.drag) {
            this.dX *= this.amortization;
            this.dY *= this.amortization;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }
        LIBS.set_I4(this.MOVEMATRIX);
        LIBS.rotateY(this.MOVEMATRIX, this.THETA);
        LIBS.rotateX(this.MOVEMATRIX, this.PHI);
        this.timeOld = time;

        this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.uniformMatrix4fv(this._Pmatrix, false, this.PROJMATRIX);
        this.gl.uniformMatrix4fv(this._Vmatrix, false, this.VIEWMATRIX);
        this.gl.uniformMatrix4fv(this._Mmatrix, false, this.MOVEMATRIX);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.CUBE_VERTEX);
        this.gl.vertexAttribPointer(this._position, 3, this.gl.FLOAT, false, 4 * (3 + 3), 0);
        this.gl.vertexAttribPointer(this._color, 3, this.gl.FLOAT, false, 4 * (3 + 3), 3 * 4);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.CUBE_FACES);
        this.gl.drawElements(this.gl.TRIANGLES, 6 * 2 * 3, this.gl.UNSIGNED_SHORT, 0);

        this.gl.flush();

        requestAnimationFrame(() => this.animate(dt));
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
attribute vec3 position;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
attribute vec3 color;
varying vec3 vColor;
void main(void) {
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
    vColor=color;
}
`

const shaderFragmentSource = `
precision mediump float;
varying vec3 vColor;
void main(void) {
    gl_FragColor = vec4(vColor, 1.);
}
`

const LIBS = {
    degToRad: (angle) => {
        return (angle * Math.PI / 180);
    },
    get_projection: (angle, a, zMin, zMax) => {
        const tan = Math.tan(LIBS.degToRad(0.5 * angle)),
            A = -(zMax + zMin) / (zMax - zMin),
            B = (-2 * zMax * zMin) / (zMax - zMin);

        return [
            0.5 / tan, 0, 0, 0,
            0, 0.5 * a / tan, 0, 0,
            0, 0, A, -1,
            0, 0, B, 0
        ];
    },
    get_I4: () => {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    set_I4: (m) => {
        m[0] = 1, m[1] = 0, m[2] = 0, m[3] = 0,
            m[4] = 0, m[5] = 1, m[6] = 0, m[7] = 0,
            m[8] = 0, m[9] = 0, m[10] = 1, m[11] = 0,
            m[12] = 0, m[13] = 0, m[14] = 0, m[15] = 1;
    },
    rotateX: (m, angle) => {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv1 = m[1], mv5 = m[5], mv9 = m[9];
        m[1] = m[1] * c - m[2] * s;
        m[5] = m[5] * c - m[6] * s;
        m[9] = m[9] * c - m[10] * s;

        m[2] = m[2] * c + mv1 * s;
        m[6] = m[6] * c + mv5 * s;
        m[10] = m[10] * c + mv9 * s;
    },
    rotateY: (m, angle) => {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6];
        m[8] = c * m[8] + s * m[10];

        m[2] = c * m[2] - s * mv0;
        m[6] = c * m[6] - s * mv4;
        m[10] = c * m[10] - s * mv8;
    },
    rotateZ: (m, angle) => {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const mv0 = m[0], mv4 = m[4], mv8 = m[8];
        m[0] = c * m[0] - s * m[1];
        m[4] = c * m[4] - s * m[5];
        m[8] = c * m[8] - s * m[9];

        m[1] = c * m[1] + s * mv0;
        m[5] = c * m[5] + s * mv4;
        m[9] = c * m[9] + s * mv8;
    },
    translateX: (m, t) => { m[12] += t },
    translateY: (m, t) => { m[13] += t },
    translateZ: (m, t) => { m[14] += t }
}
