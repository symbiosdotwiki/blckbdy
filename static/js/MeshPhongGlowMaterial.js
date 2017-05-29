function inherit(classObj, members) {
	var base = Object.create(classObj.prototype);

	Object.getOwnPropertyNames(members).forEach(function(prop) {
		var desc = Object.getOwnPropertyDescriptor(members, prop);

		if (desc.get !== undefined) {
			base.__defineGetter__(prop, desc.get);
		} else {
			base[prop] = members[prop];
		}

		if (desc.set !== undefined) {
			base.__defineSetter__(prop, desc.set);
		}
	});
	
	return base;
};

var PhongGlowShader = {

	uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ "common" ],
		THREE.UniformsLib[ "normalmap" ],
		THREE.UniformsLib[ "fog" ],
		THREE.UniformsLib[ "lights" ],

		{
			"ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
			"emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
			"specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
			"shininess": { type: "f", value: 30 },
			"wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },

			"glowMap"  	   : { type: "t", value: null },
			"glowIntensity": { type: "f", value: 1 },
		}

	] ),

	vertexShader: [

		"#define PHONG",

		"varying vec3 vViewPosition;",
		"varying vec3 vNormal;",

		THREE.ShaderChunk[ "map_pars_vertex" ],
		THREE.ShaderChunk[ "lightmap_pars_vertex" ],
		THREE.ShaderChunk[ "envmap_pars_vertex" ],
		THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
		THREE.ShaderChunk[ "color_pars_vertex" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

		"void main() {",

			THREE.ShaderChunk[ "map_vertex" ],
			THREE.ShaderChunk[ "lightmap_vertex" ],
			THREE.ShaderChunk[ "color_vertex" ],

			THREE.ShaderChunk[ "defaultnormal_vertex" ],

		"	vNormal = normalize( transformedNormal );",
			
			THREE.ShaderChunk[ "default_vertex" ],
			THREE.ShaderChunk[ "logdepthbuf_vertex" ],

		"	vViewPosition = -mvPosition.xyz;",

			THREE.ShaderChunk[ "worldpos_vertex" ],
			THREE.ShaderChunk[ "envmap_vertex" ],
			THREE.ShaderChunk[ "lights_phong_vertex" ],

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 diffuse;",
		"uniform float opacity;",

		"uniform vec3 ambient;",
		"uniform vec3 emissive;",
		"uniform vec3 specular;",
		"uniform float shininess;",

		"uniform sampler2D glowMap;",
		"uniform float glowIntensity;",

		THREE.ShaderChunk[ "color_pars_fragment" ],
		THREE.ShaderChunk[ "map_pars_fragment" ],
		THREE.ShaderChunk[ "lightmap_pars_fragment" ],
		THREE.ShaderChunk[ "envmap_pars_fragment" ],
		THREE.ShaderChunk[ "fog_pars_fragment" ],
		THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
		THREE.ShaderChunk[ "normalmap_pars_fragment" ],
		THREE.ShaderChunk[ "specularmap_pars_fragment" ],
		THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

		"void main() {",

		"	gl_FragColor = vec4( vec3( 1.0 ), opacity );",

			THREE.ShaderChunk[ "logdepthbuf_fragment" ],
			THREE.ShaderChunk[ "map_fragment" ],
			THREE.ShaderChunk[ "alphatest_fragment" ],
			THREE.ShaderChunk[ "specularmap_fragment" ],

			THREE.ShaderChunk[ "lights_phong_fragment" ],

		"	float glow = texture2D(glowMap, vUv).x * glowIntensity * 2.0;",
		"	gl_FragColor.xyz = texelColor.xyz * clamp(emissive + totalDiffuse + ambientLightColor * ambient + glow, 0.0, 2.0) + totalSpecular;",

			THREE.ShaderChunk[ "lightmap_fragment" ],
			THREE.ShaderChunk[ "color_fragment" ],
			THREE.ShaderChunk[ "envmap_fragment" ],

			THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

			THREE.ShaderChunk[ "fog_fragment" ],

		"}"

	].join("\n")

};

var MeshPhongGlowMaterial = function(map, glow, normal, emissive, glowIntensity) {
	this.shader = PhongGlowShader;

	this.uniforms = THREE.UniformsUtils.clone(this.shader.uniforms);

	this.uniforms["map"].value = map;
	this.uniforms["glowMap"].value = glow;
	this.uniforms["normalMap"].value = normal;
	this.uniforms["emissive"].value = new THREE.Color(emissive || 0);
	this.uniforms["glowIntensity"].value = (glowIntensity !== undefined) ? glowIntensity : 1;

	THREE.ShaderMaterial.call(this, {
		uniforms: this.uniforms,
		fragmentShader: this.shader.fragmentShader,
		vertexShader: this.shader.vertexShader,
		lights: true,
	});

	this.map = true;
	this.normalMap = (normal !== undefined && normal !== null);
};

MeshPhongGlowMaterial.prototype = inherit(THREE.ShaderMaterial, {
	constructor: MeshPhongGlowMaterial,

	clone: function() {
		var material = new MeshPhongGlowMaterial(
			this.uniforms["map"].value,
			this.uniforms["glowMap"].value,
			this.uniforms["normalMap"].value,			
			this.uniforms["emissive"].value,
			this.uniforms["glowIntensity"].value
		);

		return material;
	},

	get emissive() {
		return this.uniforms["emissive"].value;
	},

	set glowIntensity(value) {
		this.uniforms["glowIntensity"].value = value;
	},

	get glowIntensity() {
		return this.uniforms["glowIntensity"].value
	},
});
    
function getTexture(glow) {    
    var canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    canvas.style.position = "absolute";
    canvas.style.background = "rgba(0, 0, 0, 1)";
    
    if (glow) {
        canvas.style.left = "128px";
    }
    
    var ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    
    if (!glow) {
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 128, 128);
    }
    
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(64, 64, 32, 0, 2 * Math.PI);
    ctx.fill();
    
    document.body.appendChild(canvas);
    
    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    return tex;
}
                                             
var scene, camera, renderer;
var geometry, material, mesh;
var count = 0;

init();
animate();

function init() {

    var diffuse = getTexture();
    var glow = getTexture(true);
    
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 2;
    
    geometry = new THREE.BoxGeometry( 1, 1, 1 );
    
    material = new MeshPhongGlowMaterial(diffuse, glow);
    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = Math.PI / 4;
    mesh.rotation.y = Math.PI / 4;
    
    scene.add( mesh );
    
    var ambLight = new THREE.AmbientLight();
    ambLight.color.setRGB(0.1, 0.1, 0.1);
    scene.add(ambLight);
    
    var dirLight = new THREE.DirectionalLight();
    dirLight.color.setRGB(1, 1, 1);
    dirLight.position.set(1, 1, 1);
    dirLight.intensity = 1;
    scene.add(dirLight);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x202020, 1);
    
    document.body.appendChild( renderer.domElement );
    
}

function animate() {
    
    requestAnimationFrame( animate );    
    
    count += 0.1;
    
    mesh.material.glowIntensity = 0.5 + 0.5 * Math.sin(count);
    
    renderer.render( scene, camera );
    
}