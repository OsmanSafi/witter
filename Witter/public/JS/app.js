'use strict'

var gl;

var appInput = new Input();
var time = new Time();
var camera = new OrbitCamera(appInput);

var groundGeometry = null;   // this will be procedurally created
var topCube = null; 
var bottomCube = null;
var leftCube = null;
var rightCube = null;
var frontCube = null;
var backCube = null;

var roationMatrix = new Matrix4(); 

var leftPosition = new Vector3();

var projectionMatrix = new Matrix4();

// the shader that will be used by each piece of geometry (they could each use their own shader but in this case it will be the same)
var textureShaderProgram;

// auto start the app when the html page is ready
window.onload = window['initializeAndStartRendering'];

// we need to asynchronously fetch files from the "server" (your local hard drive)
// all of this is stored in memory on the CPU side and must be fed to the GPU
var loadedAssets = {
    textureTextVS: null, textureTextFS: null,     // our textured shader code text
    sphereJSON: null,                         // the raw JSON for our sphere model
    uvGridImage: null                         // a basic test image
};

// -------------------------------------------------------------------------
function initializeAndStartRendering() {
    initGL();
    loadAssets(function() {
        createShaders(loadedAssets);
        createScene();

        updateAndRender();
    });
}

// -------------------------------------------------------------------------
function initGL(canvas) {
    var canvas = document.getElementById("webgl-canvas");

    try {
        gl = canvas.getContext("webgl", { alpha: false });
        gl.canvasWidth = canvas.width;
        gl.canvasHeight = canvas.height;

        // enable depth test (z-buffering) and backface culling
        gl.enable(gl.DEPTH_TEST);
       
    } catch (e) {}

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}

// -------------------------------------------------------------------------
function loadAssets(onLoadedCB) {
    // a list of data to fetch from the "server" (our hard drive)
    var filePromises = [
        fetch('./JS/shaders/unlit.textured.vs.glsl').then((response) => { return response.text(); }),
        fetch('./JS/shaders/unlit.textured.fs.glsl').then((response) => { return response.text(); }),
        fetch('./JS/data/sphere.json').then((response) => { return response.json(); }),
        loadImage('./JS/data/witterlogo.jpg')
    ];

    // once all files are downloaded, this promise function will execute
    Promise.all(filePromises).then(function(values) {
        // Assign loaded data to our named variables
        loadedAssets.textureTextVS = values[0]; // from 1st fetch
        loadedAssets.textureTextFS = values[1]; // from 2nd fetch
        loadedAssets.sphereJSON = values[2];    // from 3rd fetch
        loadedAssets.uvGridImage = values[3];   // from loadImage
    }).catch(function(error) {
        console.error(error.message);
    }).finally(function() {
        onLoadedCB();
    });
}

// -------------------------------------------------------------------------
function createShaders(loadedAssets) {
    textureShaderProgram = createCompiledAndLinkedShaderProgram(loadedAssets.textureTextVS, loadedAssets.textureTextFS);

    textureShaderProgram.attributes = {
        vertexPositionAttribute: gl.getAttribLocation(textureShaderProgram, "aVertexPosition"),
        vertexTexcoordsAttribute: gl.getAttribLocation(textureShaderProgram, "aTexcoords")
    };

    textureShaderProgram.uniforms = {
        worldMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uWorldMatrix"),
        viewMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uViewMatrix"),
        projectionMatrixUniform: gl.getUniformLocation(textureShaderProgram, "uProjectionMatrix"),
        textureUniform: gl.getUniformLocation(textureShaderProgram, "uTexture"),
        alphaUniform: gl.getUniformLocation(textureShaderProgram, "uAlpha"),
    };
}

// -------------------------------------------------------------------------
function createScene() {

    topCube = new WebGLGeometryQuad(gl, textureShaderProgram);
    bottomCube = new WebGLGeometryQuad(gl, textureShaderProgram); 
    leftCube = new WebGLGeometryQuad(gl, textureShaderProgram);
    rightCube = new WebGLGeometryQuad(gl, textureShaderProgram);
    frontCube = new WebGLGeometryQuad(gl, textureShaderProgram);
    backCube = new WebGLGeometryQuad(gl, textureShaderProgram);

    topCube.create(loadedAssets.uvGridImage); 
    bottomCube.create(loadedAssets.uvGridImage); 
    leftCube.create(loadedAssets.uvGridImage); 
    rightCube.create(loadedAssets.uvGridImage); 
    frontCube.create(loadedAssets.uvGridImage); 
    backCube.create(loadedAssets.uvGridImage);


    // make it bigger
    var scale = new Matrix4().makeScale(5.0, 5.0, 5.0);


    var topRotation = new Matrix4().makeRotationX(-90); 
    var TopTranslation = new Matrix4().makeTranslation(0, 0, 1);
    
    var bottomRotation = new Matrix4().makeRotationX(-90);
    var BottomTranslation = new Matrix4().makeTranslation(0, 0, -1); 
    
    var leftRotation = new Matrix4().makeRotationY(-90); 
    var LeftTranslation = new Matrix4().makeTranslation(0, 0, 1);

    var rightRotation = new Matrix4().makeRotationY(-90); 
    var RightTranslation = new Matrix4().makeTranslation(0, 0, -1);

    var frontRotation = new Matrix4().makeRotationX(0); 
    var FrontTranslation = new Matrix4().makeTranslation(0,0,1); 
    
    var backRotation = new Matrix4().makeRotationX(0);
    var BackTranslation = new Matrix4().makeTranslation(0, 0, -1);


    topCube.worldMatrix.multiply(topRotation).multiply(scale).multiply(TopTranslation);
    bottomCube.worldMatrix.multiply(bottomRotation).multiply(scale).multiply(BottomTranslation);
    leftCube.worldMatrix.multiply(leftRotation).multiply(scale).multiply(LeftTranslation);
    rightCube.worldMatrix.multiply(rightRotation).multiply(scale).multiply(RightTranslation);
    frontCube.worldMatrix.multiply(frontRotation).multiply(scale).multiply(FrontTranslation);
    backCube.worldMatrix.multiply(backRotation).multiply(scale).multiply(BackTranslation);
}

// -------------------------------------------------------------------------
function updateAndRender() {
    requestAnimationFrame(updateAndRender);

    var aspectRatio = gl.canvasWidth / gl.canvasHeight;

    time.update();
    camera.update(time.deltaTime, time.secondsElapsedSinceStart);

    // specify what portion of the canvas we want to draw to (all of it, full width and height)
    gl.viewport(0, 0, gl.canvasWidth, gl.canvasHeight);

    // this is a new frame so let's clear out whatever happened last frame
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    projectionMatrix.makePerspective(45, aspectRatio, 0.1, 1000);

    var cosTime = Math.cos(time.secondsElapsedSinceStart * 10);
    var sinTime = Math.sin(time.secondsElapsedSinceStart * 10);
    var tanTime = Math.tan(time.secondsElapsedSinceStart * 10);

    var xRotation = new Matrix4().makeRotationX(3); 
    var yRotation = new Matrix4().makeRotationY(3);
    var zRotation = new Matrix4().makeRotationZ(-3);

    leftPosition.x = cosTime; 
    leftPosition.z = sinTime;


    // topCube.worldMatrix.multiply(zRotation); 
    // bottomCube.worldMatrix.multiply(zRotation);

    // leftCube.worldMatrix.multiply(xRotation); 
    // leftCube.worldMatrix.elements[3] = leftPosition.x * 5;
    // leftCube.worldMatrix.elements[7] = leftPosition.y; 
    // leftCube.worldMatrix.elements[11] = leftPosition.z * 5; 
    
    // rightCube.worldMatrix.elements[3] = leftPosition.x * 5;
    // rightCube.worldMatrix.elements[7] = leftPosition.y; 
    // rightCube.worldMatrix.elements[11] = leftPosition.z * 5;

    // frontCube.worldMatrix.elements[3] = leftPosition.x * 5;
    // frontCube.worldMatrix.elements[7] = leftPosition.y; 
    // frontCube.worldMatrix.elements[11] = leftPosition.z * 5;

    // backCube.worldMatrix.elements[3] = leftPosition.x * 5;
    // backCube.worldMatrix.elements[7] = leftPosition.y; 
    // backCube.worldMatrix.elements[11] = leftPosition.z * 5;


    topCube.render(camera, projectionMatrix, textureShaderProgram);
    bottomCube.render(camera, projectionMatrix, textureShaderProgram); 
    leftCube.render(camera, projectionMatrix, textureShaderProgram);
    rightCube.render(camera, projectionMatrix, textureShaderProgram);
    frontCube.render(camera, projectionMatrix, textureShaderProgram);
    backCube.render(camera, projectionMatrix, textureShaderProgram);


}
