import { mat4 } from 'gl-matrix';
// 获取 canvas 元素
const canvas = document.getElementById('glCanvas');
// 获取 WebGL 上下文
const gl = canvas.getContext('webgl');
if (!gl) {
    alert('无法初始化 WebGL，你的浏览器可能不支持。');
}

// 顶点着色器代码
const vertexShaderSource = `
    attribute vec3 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
    }
`;

// 片段着色器代码
const fragmentShaderSource = `
    precision mediump float;

    void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
    }
`;

// 创建着色器函数
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('着色器编译出错：', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// 创建着色器程序函数
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('着色器程序链接出错：', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// 创建球的顶点数据
function createSphere(radius, subdivisions) {
    const positions = [];
    const indices = [];

    for (let lat = 0; lat <= subdivisions; lat++) {
        const theta = lat * Math.PI / subdivisions;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= subdivisions; lon++) {
            const phi = lon * 2 * Math.PI / subdivisions;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            positions.push(radius * x, radius * y, radius * z);
        }
    }

    for (let lat = 0; lat < subdivisions; lat++) {
        for (let lon = 0; lon < subdivisions; lon++) {
            const first = (lat * (subdivisions + 1)) + lon;
            const second = first + subdivisions + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        positions: new Float32Array(positions),
        indices: new Uint16Array(indices)
    };
}

// 创建顶点着色器和片段着色器
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// 创建着色器程序
const shaderProgram = createProgram(gl, vertexShader, fragmentShader);

// 创建球的顶点数据
const sphere = createSphere(1.0, 30);

// 创建顶点缓冲区
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);

// 创建索引缓冲区
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

// 获取属性和统一变量的位置
const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');

// 启用属性
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

// 设置视口
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// 设置清除颜色
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clearDepth(1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// 创建投影矩阵和模型视图矩阵
const fieldOfView = 45 * Math.PI / 180;
const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
const zNear = 0.1;
const zFar = 100.0;
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

const modelViewMatrix = mat4.create();
mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

// 使用着色器程序
gl.useProgram(shaderProgram);

// 设置统一变量
gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);
gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

// 清除画布
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// 绘制球
gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);