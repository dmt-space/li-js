import { LiElement, html, css } from '../../li.js';

customElements.define('li-life-webgl', class LiLifeWebGL extends LiElement {
    static get styles() {
        return css`
            :host {
                width: 100%;
                height: 100%;
                display: flex;
                position: relative;
            }
            #game_of_life {
                width: 100%;
                height:  100%;
                border: 0.1em solid #111;
                cursor: pointer;
                image-rendering: crisp-edges;
                image-rendering: pixelated;
            }
            #i1 {
                position: absolute;
                top: 10px;
                right: 10px;
            }
            #i2 {
                position: absolute;
                top: 30px;
                right: 10px;
            }
        `;
    }

    render() {
        return html`
            <input id="i1" type="range" min="1" max="20" step="1" value="3" @change=${this._change}>
            <input id="i2" type="range" min=".05" max="1.5" step=".05" value=".25" @change=${this._change}>
            <canvas id="game_of_life"></canvas>
        `;
    }

    static get properties() {
        return {
            speed_factor: { type: Number, default: 3, save: true },
            precision: { type: Number, default: 0.25, save: true },
        }
    }

    firstUpdated() {
        super.firstUpdated();
        canvas = this.$id("game_of_life");
        gl = canvas.getContext("webgl2");
        texture = document.createElement("canvas");
        tx = texture.getContext("webgl2");
        this.$id('i1').value = speed_factor = this.speed_factor || 3;
        this.$id('i2').value = precision = this.precision || 0.25;
        initialize_game_of_life();
        canvas.addEventListener("click", reset_game_of_life);
        reset_game_of_life();
    }

    updated(changedProperties) {
        if ((changedProperties.has('speed_factor') && this.speed_factor) || (changedProperties.has('precision') && this.precision)) {
            this.$id('i1').value = speed_factor = this.speed_factor;
            this.$id('i2').value = precision = this.precision;
            initialize_game_of_life();
        }
    }
    _change() {
        this.speed_factor = speed_factor = this.$id('i1').value;
        this.precision = precision = this.$id('i2').value;
        this.$update();
        console.log(speed_factor, precision);
        initialize_game_of_life();
    }
});

let canvas, gl, texture, tx,

    speed_factor = 3,
    precision = 0.25,

    gl_program,
    gl_vsource = `
        attribute vec4 vertices;
        varying vec2 texel_coord;
        
        void main () {
            gl_Position = vertices;
            texel_coord = (vertices.xy + 1.0) / 2.0;
        }
    `,
    gl_fsource = `
        precision mediump float;
        varying vec2 texel_coord;
        
        uniform sampler2D texture_image;
        uniform vec2 resolution;
        
        int get (vec2 offset) {
            vec4 texel = texture2D(texture_image, (gl_FragCoord.xy + offset) / resolution);
            return int(dot(texel, vec4(1)) / 3.0);
        }
        
        void main () {
            int n = 
                get(vec2(-1, -1)) +
                get(vec2(-1,  0)) +
                get(vec2(-1,  1)) +

                get(vec2( 0,  1)) +
                get(vec2( 0, -1)) +

                get(vec2( 1, -1)) +
                get(vec2( 1,  0)) +
                get(vec2( 1,  1));
            
            bool pre_state = get(vec2(0, 0)) == 1;
            bool new_state;
            
            /* GAME OF LIFE */ 
            if (pre_state && (n < 2 || n > 3)) { new_state = false; }
            if (pre_state && (n == 2 || n == 3)) { new_state = true; }
            if (!pre_state && n == 3) { new_state = true; }
            
            /* GANE OF CHAOS (?) */
            /* LOOKS LIKE REACTION DIFFUSION */
            // if (pre_state && (n < 3 || n > 4)) { new_state = false; }
            // if (pre_state && (n == 3 || n == 4 || n == 1)) { new_state = true; }
            // if (!pre_state && n == 3) { new_state = true; }
            
            /* ANOTHER WEIRD ONE */
            // if (pre_state && (n < 2 || n > 4)) { new_state = false; }
            // if (pre_state && (n == 3 || n == 4 || n == 2)) { new_state = true; }
            // if (!pre_state && n == 3) { new_state = true; }
            
            gl_FragColor = vec4(vec3(int(new_state)), 1);
        }
    `,

    tx_texture,
    tx_texture_vsource = `
        attribute vec4 vertices;
        varying vec2 texel_coord;

        void main () {
            gl_Position = vertices;
            texel_coord = (vertices.xy + 1.0) / 2.0;
        }
    `,
    tx_texture_fsource = `
        precision mediump float;

        uniform sampler2D texture_image;
        varying vec2 texel_coord;

        void main () {
            gl_FragColor = texture2D(texture_image, texel_coord);
        }
    `,

    tx_random,
    tx_random_vsource = `
        attribute vec4 vertices;
        
        void main () {
            gl_Position = vertices;
        }
    `,
    tx_random_fsource = `
        precision highp float;
        uniform float random_seed;

        void main () {
            bool randomized = fract(sin(dot(gl_FragCoord.xy * random_seed, vec2(12.9898, 78.233))) * 43758.5453123) >= 0.5;
            gl_FragColor = vec4(vec3(int(randomized)), 1);
        }
    `,

    vertices = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),

    tx_random_seed,
    tx_random_vertices,

    tx_texture_vertices,
    tx_texture_frame,

    gl_program_vertices,
    gl_program_resolution,
    gl_program_frame,

    animation_key;

function size_setup() {
    let w = Math.round(canvas.clientWidth * devicePixelRatio * precision),
        h = Math.round(canvas.clientHeight * devicePixelRatio * precision);

    canvas.width = texture.width = w;
    canvas.height = texture.height = h;

    gl.viewport(0, 0, w, h);
    tx.viewport(0, 0, w, h);
}

function gl_setup(webgl, program, vertex_source, fragment_source) {
    let vertex_shader = webgl.createShader(webgl.VERTEX_SHADER),
        fragment_shader = webgl.createShader(webgl.FRAGMENT_SHADER);

    webgl.shaderSource(vertex_shader, vertex_source);
    webgl.shaderSource(fragment_shader, fragment_source);

    webgl.compileShader(vertex_shader);
    webgl.compileShader(fragment_shader);

    webgl.attachShader(program, vertex_shader);
    webgl.attachShader(program, fragment_shader);

    webgl.linkProgram(program);

    // console.log(webgl.getShaderInfoLog(vertex_shader));
    // console.log(webgl.getShaderInfoLog(fragment_shader));
}

function gl_initialize() {
    gl_program = gl.createProgram();
    gl_setup(gl, gl_program, gl_vsource, gl_fsource);

    tx_random = tx.createProgram();
    gl_setup(tx, tx_random, tx_random_vsource, tx_random_fsource);

    tx_texture = tx.createProgram();
    gl_setup(tx, tx_texture, tx_texture_vsource, tx_texture_fsource);

    gl.useProgram(gl_program);
    gl.clearColor(0, 0, 0, 1);
}

function generate_random() {
    tx.useProgram(tx_random);
    let tx_buffer = tx.createBuffer();

    tx.bindBuffer(tx.ARRAY_BUFFER, tx_buffer);
    tx.bufferData(tx.ARRAY_BUFFER, vertices, tx.STATIC_DRAW);

    tx.uniform1f(tx_random_seed, Math.random());
    tx.vertexAttribPointer(tx_random_vertices, 2, tx.FLOAT, false, 0, 0);

    tx.enableVertexAttribArray(tx_random_vertices);
    tx.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    tx.deleteBuffer(tx_buffer);
    tx.useProgram(tx_texture);
}

function location_setup() {
    tx_random_seed = tx.getUniformLocation(tx_random, "random_seed");
    tx_random_vertices = tx.getAttribLocation(tx_random, "vertices");

    tx_texture_vertices = tx.getAttribLocation(tx_texture, "vertices");
    tx_texture_frame = tx.getUniformLocation(tx_texture, "texture_image");

    gl_program_vertices = gl.getAttribLocation(gl_program, "vertices");
    gl_program_resolution = gl.getUniformLocation(gl_program, "resolution");
    gl_program_frame = gl.getUniformLocation(gl_program, "texture_image");
}

function run_game_of_life() {
    animation_key = requestAnimationFrame(run_game_of_life, 500);
    if (animation_key % speed_factor) return;

    let gl_frame = gl.createTexture(),
        gl_buffer = gl.createBuffer();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, gl_frame);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture);
    gl.uniform1i(gl_program_frame, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(gl_program_vertices, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(gl_program_resolution, canvas.width, canvas.height);

    gl.enableVertexAttribArray(gl_program_vertices);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    gl.deleteBuffer(gl_buffer);
    gl.deleteTexture(gl_frame);

    save_frame();
}

function save_frame() {
    let tx_frame = tx.createTexture(),
        tx_buffer = tx.createBuffer();

    tx.pixelStorei(tx.UNPACK_FLIP_Y_WEBGL, true);
    tx.activeTexture(tx.TEXTURE0);

    tx.bindTexture(tx.TEXTURE_2D, tx_frame);
    tx.texParameteri(tx.TEXTURE_2D, tx.TEXTURE_MIN_FILTER, tx.LINEAR);

    tx.texImage2D(tx.TEXTURE_2D, 0, tx.RGB, tx.RGB, tx.UNSIGNED_BYTE, canvas);
    tx.uniform1i(tx_texture_frame, 0);

    tx.bindBuffer(tx.ARRAY_BUFFER, tx_buffer);
    tx.bufferData(tx.ARRAY_BUFFER, vertices, tx.STATIC_DRAW);

    tx.vertexAttribPointer(tx_texture_vertices, 2, tx.FLOAT, false, 0, 0);
    tx.enableVertexAttribArray(tx_texture_vertices);

    tx.drawArrays(tx.TRIANGLE_FAN, 0, 4);

    tx.deleteTexture(tx_frame);
    tx.deleteBuffer(tx_buffer);
}

function reset_game_of_life() {
    cancelAnimationFrame(animation_key);

    generate_random();
    run_game_of_life();
}

function initialize_game_of_life() {
    size_setup();
    gl_initialize();

    location_setup();
    generate_random();

    run_game_of_life();
}
