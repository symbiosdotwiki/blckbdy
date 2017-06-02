var container, stats;

var clock = new THREE.Clock();

var camera, scene, renderer, composer;

var uniforms, material, mesh;

var mouseX = 0, mouseY = 0,
lat = 0, lon = 0, phy = 0, theta = 0;

var width = window.innerWidth || 2;
var height = window.innerHeight || 2;

var windowHalfX = width / 2;
var windowHalfY = height / 2;

var saturation = .5;
var hue = .5;

var torusSize = [.65, 0.3, 30, 30]; 

var time = 0;

var mirrorSphereCamera = null;
var sphereMesh = null;

var textureLoader = new THREE.TextureLoader();
var earthMap = null;

var mirrorMaterial;
var firstTex;

var numBars = 64;
var numComponents = 10;
var compMargin = 3
var equalizerInstantiated = false;
var minHeight = 100;

var notClicked = true;
var refreshTime = 50;

var isSafari = false;
var isMobile = false;

var bpm = 126.0;
var songTime = 0;

var audio = $('#audioPlayer');
