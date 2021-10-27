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
            gridSize: { type: Number, default: 5 },
            gridPointSize: { type: Number, default: 2 },
            gridColor: { type: String, default: '1, 1, 1, 1' },
            showBorder: { type: Boolean, default: true },
            borderColor: { type: String, default: '0.1, 0.1, 0.1, 0.9' },
            showLink: { type: Boolean, default: true },
            linkColor: { type: String, default: '0.5, 0.5, 0.5, 0.9' },
            zTranslation: { type: Number, default: -3.5 },
            amortization: { type: Number, default: 1 },
            enableDraw: { type: Boolean, default: true },
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

        setTimeout(() => {
            this.clearGL(this.gl);

            this.initGrid(this);
            if (this.showBorder) this.initBorder(this);
            this.initData(this);

            this.draw();
        }, 300);

    }

    clearGL(gl) {
        gl.viewportWidth = gl.canvas.width = window.innerWidth;
        gl.viewportHeight = gl.canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.0, 1.0);
    }
    draw() {
        if (!this.drag) {
            this.dX *= this.amortization;
            this.dY *= this.amortization;
            this.THETA += this.dX;
            this.PHI += this.dY;
        }

        const gl = this.gl;
        this.clearGL(gl);

        const uModelViewMatrix = modelViewMatrix();
        const uProjectionMatrix = perspectiveMatrix(1, gl.viewportWidth / gl.viewportHeight, 1, 2000.0);
        translate(uModelViewMatrix, uModelViewMatrix, [0, 0, this.zTranslation]);
        rotate(uModelViewMatrix, uModelViewMatrix, this.THETA, [0, 1, 0]);
        rotate(uModelViewMatrix, uModelViewMatrix, this.PHI, [1, 0, 0]);

        this.shapes.forEach(inf => {
            gl.useProgram(inf.program);
            gl.bindVertexArray(inf.vao);

            gl.uniformMatrix4fv(gl.getUniformLocation(inf.program, "uModelViewMatrix"), false, uModelViewMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(inf.program, "uProjectionMatrix"), false, uProjectionMatrix);

            inf.draw();

            gl.bindVertexArray(null);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        })
        if (this.enableDraw || this.drag)
            this._draw = requestAnimationFrame(() => this.draw());
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
    initGrid(s = this) {
        const gl = s.gl, shapes = s.shapes, _size = s.data?._size || s.data?.size || s.gridSize,
            pointSize = s.gridPointSize, gridColor = s.gridColor, showGrid = s.showGrid;
        const info = { name: 'grid', size: 3, vertexShader: 'vs_Grid', fragmentShader: 'fs_Grid', pointSize, gridColor };
        let size, _z, _x, _y, endPoint;
        if (typeof _size === 'number') {
            size = _size - 1;
            size <= 1 ? 2 : size;
            _x = _z = _y = size;
            endPoint = _size * _size * _size - 1;
        } else {
            _x = _size.x - 1;
            _y = _size.y - 1;
            _z = _size.z - 1;
            endPoint = _size.x * _size.y * _size.z - 1;
        }
        s._size = { x: _x, y: _y, z: _z, endPoint };
        s._map = new Map();
        let i = 0;
        info._vertices = [];
        let _pointSize = pointSize;
        let _pointColor = gridColor.split(',');
        for (let z = _z; z >= -_z; z -= 2)
            for (let y = _y; y >= -_y; y -= 2)
                for (let x = -_x; x <= _x; x += 2) {
                    s._map.set(i, { x: x / _x, y: y / _y, z: z / _z });
                    if (showGrid)
                        info._vertices.push(...[x / _x, y / _y, z / _z], ..._pointColor, _pointSize); // stride = 3 + + 4 + 1 = (xyz) + (rgba) + s = 8
                    i++;
                }
        if (!showGrid) return;
        let stride = 8;
        info._attributes = [
            { name: 'aVertexPosition', size: 3, stride, offset: 0 },
            { name: 'aPointColor', size: 4, stride, offset: 3 },
            { name: 'aPointSize', size: 1, stride, offset: 7 }
        ];
        info.draw = () => {
            gl.drawArrays(gl.POINTS, 0, info._vertices.length / stride);
        }
        initInfo(gl, shapes, info);
    }
    initBorder(s = this, sz = 1.0) {
        const gl = s.gl, shapes = this.shapes, borderColor = s.borderColor;
        const info = { name: 'border', size: 3, vertexShader: 'vs_Border', fragmentShader: 'fs_Border', borderColor };
        info._vertices = [-sz, -sz, sz, -sz, sz, sz, sz, sz, sz, sz, -sz, sz, -sz, -sz, -sz, -sz, sz, -sz, sz, sz, -sz, sz, -sz, -sz];
        info._indices = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 4, 5, 5, 6, 6, 7, 7, 4, 1, 5, 2, 6, 3, 7];
        info._attributes = [{ name: 'aVertexPosition', size: 3, stride: 0, offset: 0 },];
        info.draw = () => {
            gl.uniform4fv(gl.getUniformLocation(info.program, "uPointColor"), info.borderColor.split(','));
            gl.drawElements(gl.LINES, info.indices.length, gl.UNSIGNED_SHORT, 0);
        }
        initInfo(gl, shapes, info);
    }
    initData(s = this) {
        const gl = s.gl, shapes = s.shapes, pointSize = s.gridPointSize, gridColor = s.gridColor, showGrid = s.showGrid,
            brain = s.brain, data = s.data || {}, showLink = s.showLink, linkColor = s.linkColor, _map = s._map;
        const info = { name: 'points', size: 3, vertexShader: 'vs_Grid', fragmentShader: 'fs_Grid', pointSize, gridColor };
        const _usedPoints = new Set();
        const _usedLines = new Set();
        info._vertices = [];
        const _lines = [];
        const _wlines = [];
        let _pointSize = pointSize;
        let _pointColor = [];
        if (showGrid) {
            info._vertices.push(-1, 1, 1, ...[0, 1, 0, 1], 8); // startPoint
            info._vertices.push(1, -1, -1, ...[1, 0, 0, 1], 8); // endPoint
        }
        if (brain) {
            (brain.neurons || []).forEach(i => {
                // console.log(i)
                _usedPoints.add(i.id);
                _pointSize = i.size || pointSize;
                _pointColor = gridColor.split(',');
                if (_map.has(i.id)) {
                    const coor = _map.get(i.id);
                    info._vertices.push(coor.x, coor.y, coor.z, ..._pointColor, _pointSize);
                }
            })
        } else {
            Object.keys(data || {}).forEach(k => {
                const s = _map.get(+k);
                if (!s) return;
                if (typeof +k === 'number' && !_usedPoints.has(+k)) {
                    _usedPoints.add(k);
                    const _pointSize = data[k].size || data.neuronSize || pointSize;
                    const _pointColor = data[k].color || gridColor.split(',');
                    info._vertices.push(s.x, s.y, s.z, ..._pointColor, _pointSize);
                }
                Object.keys(data[k] || {}).forEach(i => {
                    if (typeof +i === 'number') {
                        const p = _map.get(+i);
                        if (p) {
                            if (!_usedPoints.has(+i)) {
                                _usedPoints.add(i);
                                const _pointSize = data[k][i].size || data[k].size || data.neuronSize || pointSize;
                                const _pointColor = data[k][i]?.color || data[k].color || gridColor.split(',');
                                info._vertices.push(p.x, p.y, p.z, ..._pointColor, _pointSize);
                            }
                            if (!_usedLines.has(k + '-' + i)) {
                                _usedLines.add(k + '-' + i);
                                const width = data[k][i].w || data[k][i];
                                const color = data[k][i].color || data[k].color || data.color || linkColor;
                                if (width > 0)
                                    _wlines.push({ x: s.x, y: s.y, z: s.z, x1: p.x, y1: p.y, z1: p.z, color, width });
                                else
                                    _lines.push(s.x, s.y, s.z, p.x, p.y, p.z);
                            }
                        }
                    }
                })
            })
        }

        let stride = 8;
        info._attributes = [
            { name: 'aVertexPosition', size: 3, stride, offset: 0 },
            { name: 'aPointColor', size: 4, stride, offset: 3 },
            { name: 'aPointSize', size: 1, stride, offset: 7 }
        ];
        info.draw = () => {
            gl.drawArrays(gl.POINTS, 0, info._vertices.length / stride);
        }
        initInfo(gl, shapes, info);

        if (showLink && _lines?.length) {
            const _lineInfo = { ...{}, ...info };
            _lineInfo._vertices = _lines
            _lineInfo.name = 'links';
            _lineInfo.size = 3;
            _lineInfo.vertexShader = 'vs_Border';
            _lineInfo.fragmentShader = 'fs_Border';
            _lineInfo._attributes = [{ name: 'aVertexPosition', size: 3, stride: 0, offset: 0 }];
            _lineInfo.draw = () => {
                gl.uniform4fv(gl.getUniformLocation(_lineInfo.program, "uPointColor"), linkColor.split(','));
                gl.drawArrays(gl.LINES, 0, _lineInfo._vertices.length / 2);
            }
            initInfo(gl, shapes, _lineInfo);
        }
        if (_wlines?.length) {
            this.initLines(gl, shapes, _wlines);
        }
    }
    initLines(gl, shapes, _wlines, NumSides = 12) {
        const info = { name: 'lines', size: 3, vertexShader: 'vs_Line', fragmentShader: 'fs_Line', NumSides };
        info._vertices = [];
        let cyl_vertices;
        const buildVertices = (i) => {
            let x, y, angle = 0;
            const inc = Math.PI * 2.0 / NumSides;
            cyl_vertices = new Array(NumSides * 2);
            for (let i_side = 0; i_side < NumSides; i_side++) {
                x = i.width * Math.cos(angle);
                y = i.width * Math.sin(angle);
                cyl_vertices[i_side] = [i.x + x, i.y + y, i.z];
                cyl_vertices[i_side + NumSides] = [i.x1 + x, i.y1 + y, i.z1];
                angle += inc;
            }
        }
        const quad = (a, b, c, d, color) => {
            let indices = [a, b, c, a, c, d];
            for (let i = 0; i < indices.length; ++i)
                info._vertices.push(...cyl_vertices[indices[i]], ...color);
        }
        (_wlines || []).forEach(i => {
            buildVertices(i);
            for (let i_side = 0; i_side < NumSides - 1; i_side++)
                quad(i_side + 1, i_side, NumSides + i_side, NumSides + i_side + 1, i.color);
            quad(0, NumSides - 1, 2 * NumSides - 1, NumSides, i.color);
        })
        info._attributes = [
            { name: 'aPosition', size: 3, stride: 7, offset: 0 },
            { name: 'aPointColor', size: 4, stride: 7, offset: 3 }
        ];
        info.draw = () => {
            gl.drawArrays(gl.TRIANGLES, 0, 6 * NumSides * info._vertices.length);
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
    info.FSIZE = info.vertices?.BYTES_PER_ELEMENT;
    (info._attributes || []).forEach(i => {
        info[i.name] = gl.getAttribLocation(info.program, i.name);
        gl.vertexAttribPointer(info[i.name], i.size || 3, gl.FLOAT, false, info.FSIZE * (i.stride || 0), info.FSIZE * (i.offset || 0));
        gl.enableVertexAttribArray(info[i.name]);
    })

    if (info._indices) {
        info.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, info.ibo);
        info.indices = new Uint16Array(info._indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, info.indices, gl.STATIC_DRAW);
    }

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
        in vec3 aVertexPosition;
        in vec4 aPointColor;
        in float aPointSize;
        out vec4 fColor;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
            fColor = aPointColor;
            gl_PointSize = aPointSize;
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
    vs_Border: `#version 300 es
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
    fs_Border: `#version 300 es
        precision mediump float;
        in vec4 fColor;
        out vec4 fragColor;
        void main(void) {
            fragColor = fColor;
        }
    `,
    vs_Line: `#version 300 es
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        in vec4 aPosition;
        in vec4 aPointColor;
        out vec4 fColor;
        void main() {
            fColor = aPointColor;
            gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
        }
    `,
    fs_Line: `#version 300 es
        precision mediump float;
        in vec4 fColor;
        out vec4 fragColor;
        void main(void) {
            fragColor = fColor;
        }
    `
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
