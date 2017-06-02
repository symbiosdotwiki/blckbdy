function init() {

	isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
	isIE = !webkitAudioSafe();

	createEqualizer();

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 35, windowHalfX / windowHalfY, 1, 3000 );
	camera.position.z = 4;

	scene = new THREE.Scene();

	uniforms = {

		fogDensity: { value: 0.45 },
		fogColor:   { value: new THREE.Vector3( 0, 0, 0 ) },
		time:       { value: 1.0 },
		hue: 		{ value: .5},
		saturation: {value: .5},
		resolution: { value: new THREE.Vector2() },
		uvScale:    { value: new THREE.Vector2( 20.0, 1.0 ) },
		deltaUV:    { value: new THREE.Vector2( .1, 0.0 ) },
		texture1:   { value: textureLoader.load( "static/img/lava/cloud.png" ) },
		texture2:   { value: textureLoader.load( "static/img/turing.png" ) },
		setHue: 	{ value: true },
		setSat: 	{ value: true },

	};

	uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
	uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;

	material = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent

	} );

	mesh = new THREE.Mesh(new THREE.SphereBufferGeometry( .6, 30, 30 ) , material );
	
	//mesh.geometry = new THREE.TorusKnotGeometry(.65 , .15, 200, 30, 4, 5 );
	
	mesh.rotation.x = 0.3;

	var plight = new THREE.PointLight( 0x999999, .4, 100 );
	plight.position.set( 0, 0, 0 );
	scene.add( plight );

	var alight = new THREE.AmbientLight( 0x444444);
	scene.add( alight );


	var geometry = new THREE.SphereBufferGeometry( .2, 32, 16 );

	mirrorSphereCamera = new THREE.CubeCamera( 0.001, 50, 512 );
	mirrorSphereCamera.autoClearColor = true;
	mirrorSphereCamera.autoClear = true;

	mirrorMaterial = new THREE.MeshBasicMaterial( { 
		color: 0x000000,
		//refractionRatio: 0.95,
		//envMap: mirrorSphereCamera.renderTarget,
	} );

	sphereMesh = new THREE.Mesh( geometry, mirrorMaterial );
	scene.add(mirrorSphereCamera);
	sphereMesh.position.x = 0;
	sphereMesh.position.y = 0;
	sphereMesh.position.z = 0;
	mesh.add( sphereMesh );

	scene.add(mesh);
	mesh.visible = false;

	earthMap = textureLoader.load( "static/img/lava/earthNormalMap.jpg" );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	container.appendChild( renderer.domElement );
	renderer.autoClear = false;

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( 1.1 );
	var effectFilm = new THREE.FilmPass( 0.0, 0.95, 2048, false );

	effectFilm.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectBloom );
	composer.addPass( effectFilm );

	//

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );
}

//

function animate() {
	requestAnimationFrame( animate );
	render();
}

function setUpdateCubeMap() {
	renderCubeMap();
	setTimeout(function(){
		setUpdateCubeMap();
	}, refreshTime);
}

function renderCubeMap(){
	sphereMesh.visible = false;

	if(!firstTex){
		mirrorSphereCamera = new THREE.CubeCamera( 0.01, 50, 256 );
		mirrorSphereCamera.autoClear = true;
		mirrorSphereCamera.autoClearColor = true;
		
	}
	else{
		mirrorSphereCamera.renderTarget.dispose();
		mirrorSphereCamera.renderTarget.copy(firstTex);
	}
	mirrorSphereCamera.position.setFromMatrixPosition( sphereMesh.matrixWorld );
	mirrorSphereCamera.updateCubeMap( renderer, scene );

	mirrorMaterial.envMap = mirrorSphereCamera.renderTarget;
	sphereMesh.material = mirrorMaterial;
	
		sphereMesh.visible = true;

	if(!firstTex){
		firstTex = mirrorSphereCamera.renderTarget.clone();
		firstTex.mapping = THREE.CubeRefractionMapping;
	}

}

function render() {

	renderer.setRenderTarget( null );
	renderer.clear();

	var delta = 5 * clock.getDelta();

	time += delta;

	uniforms.time.value += 0.2 * delta;
	//uniforms.hue.value = hue + 0.5 * Math.sin(.1*time);
	//uniforms.saturation.value = saturation + 0.5 * Math.sin(.05*time);

	//console.log(uniforms.saturation.value);

	var valAdd = 4*Math.sin(delta/100);

	//mesh.geometry = sphereObject(.6);

	//mesh.geometry = new THREE.TorusGeometry( torusSize[0], torusSize[1] + valAdd, torusSize[2], torusSize[3] + valAdd );

	/*
	scene.remove(mesh);

	mesh.geometry.dispose();
	mesh.material.dispose();
	//mesh.texture.dispose();

	mesh.geometry = new THREE.TorusKnotGeometry(.65 + .4*Math.sin(.06*time), .15, 100, 30, 2 + Math.sin(.06*time), 2 + 2*Math.sin(.06*time) );
	*/

	setMeshRotation();
	setSpherePos();

	/*
	var newPos = figure8OrbitPosition(sphereMesh, 1, time);
	sphereMesh.position.x = newPos.x;
	sphereMesh.position.y = newPos.y;
	sphereMesh.position.z = newPos.z;
	*/

	
	composer.render( 0.01 );

}

init();
animate();
//setUpdateCubeMap();



