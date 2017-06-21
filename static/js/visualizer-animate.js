if ( ! Detector.webgl ){
	$('#loading').removeClass('shown');
	$('#noWebGL').addClass('shown');
}
else {
	init();
	animate();
}

function init() {

	//AUDIO STUFF
	isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
	isIE = !webkitAudioSafe();

	loadAudio();
	createEqualizer();

	progressBar.click(function(e){
		seek(e);
	});
	progressBar.hide();
	pauseButton.click(pauseFade);

	if (!isMobile && !isIE){
		$(window).keypress(function (e) {
		    if(e.keyCode == 32){
		        pauseButton.click();
		    }
		});
	}
	else{
		$('#tester').hide();
	}

	$('#playButton').click(function(){
		audio[0].play();
		//playButton.hide();
		notClicked = false;
		$('#overlay').removeClass('shown');
		setTimeout(function(){
			$('#overlay').hide();
			$('#audioPause').show();
		}, 1000);
	});

	//BUILD SCENE
	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 35, windowHalfX / windowHalfY, 1, 3000 );
	camera.position.z = 4;

	scene = new THREE.Scene();

	var plight = new THREE.PointLight( 0x999999, .4, 100 );
	plight.position.set( 0, 0, 0 );
	scene.add( plight );

	var alight = new THREE.AmbientLight( 0x444444);
	scene.add( alight );

	//BUILD GEOMETRY
	uniforms = {

		fogDensity: { value: 0.45 },
		fogColor:   { value: new THREE.Vector3( 0, 0, 0 ) },
		time:       { value: 1.0 },
		hue: 		{ value: 0.5},
		saturation: { value: 0.5},
		intensity: 	{ value: 0.0},
		resolution: { value: new THREE.Vector2() },
		uvScale:    { value: new THREE.Vector2( 20.0, 1.0 ) },
		deltaUV:    { value: new THREE.Vector2( .1, 0.0 ) },
		texture1:   { value: textureLoader.load( "static/img/tex/cloud.png" ) },
		texture2:   { value: textureLoader.load( "static/img/tex/turing.png" ) },
		setHue: 	{ value: true },
		setSat: 	{ value: true },
		setInt: 	{ value: false },

	};

	uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
	uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;

	material = new THREE.ShaderMaterial( {

		uniforms: uniforms,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent

	} );

	mesh = new THREE.Mesh(new THREE.SphereBufferGeometry( .6, 30, 30 ) , material );
	
	mesh.rotation.x = 0.3;

	var geometry = new THREE.SphereBufferGeometry( .2, 32, 16 );

	mirrorMaterial = new THREE.MeshBasicMaterial( { 
		color: 0x000000,
	} );

	sphereMesh = new THREE.Mesh( geometry, mirrorMaterial );
	sphereMesh.position.x = 0;
	sphereMesh.position.y = 0;
	sphereMesh.position.z = 0;
	mesh.add( sphereMesh );

	scene.add(mesh);
	mesh.visible = false;

	// PARTICLES
	particleSystem = new THREE.GPUParticleSystem( {
		maxParticles: 25000
	} );

	particleSystem.scale.set(.01, .01, .01)

	mesh.add( particleSystem );

	// RENDERER
	renderer = new THREE.WebGLRenderer( );//{ antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	container.appendChild( renderer.domElement );
	renderer.autoClear = false;

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( 1.1 );
	effectFilm = new THREE.FilmPass( 0.0, new THREE.Vector2(.0, .0));

	effectFilm.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectBloom );
	composer.addPass( effectFilm );

	touchAmount = .1;

	window.addEventListener( 'mousedown', onMouseDown, false );
	window.addEventListener( 'mousemove', onMouseMove, false );
	window.addEventListener( 'mouseup', onMouseUp, false );

	window.addEventListener( 'touchstart', onMouseDown, false );
	window.addEventListener( 'touchmove', onMouseMove, false );
	window.addEventListener( 'touchend', onMouseUp, false );

	// WINDOW RESIZE
	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );
}

function getNormalizedTouch(event){
	var x = event.offsetX / $( document ).width() - .5;
	var y = event.offsetY / $( document ).height() - .5;
	return new THREE.Vector2(x, y);
}

function onMouseDown(event){
	if(touchTimer != null){
		clearInterval(touchTimer);
	}
	touching = true;
	touchLocation = getNormalizedTouch(event);
	touchTimer = setInterval(function(){
		effectFilm.uniforms["center"].value = touchLocation;
		effectFilm.uniforms["swirl"].value = touchTime;
    }, 50);
}

function onMouseMove(event){
	touchLocation = getNormalizedTouch(event);
}

function onMouseUp(event){
	touching = false;
	clearInterval(touchTimer);
	var x = 0;
	var numSteps = 40;
	var numSecs = 2000;
	var curTouchLocation = new THREE.Vector2(
		touchLocation.x / numSteps, 
		touchLocation.y / numSteps
	);
	var curTouchTime = effectFilm.uniforms["swirl"].value / numSteps;
	touchTimer = setInterval(function () {
		effectFilm.uniforms["center"].value = new THREE.Vector2(
			curTouchLocation.x * (numSteps - x), 
			curTouchLocation.y * (numSteps - x)
		);
		effectFilm.uniforms["swirl"].value -= curTouchTime;
	   	if (++x === numSteps) {
	    	window.clearInterval(touchTimer);
	    	effectFilm.uniforms["center"].value = new THREE.Vector2(0,0);
			effectFilm.uniforms["swirl"].value = 0;
	   	}
	}, numSecs / numSteps);
}

//

function animate() {
	requestAnimationFrame( animate );
	render();
	updateHSV();
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

	if(touching){
		touchTime += touchAmount * delta;
	}
	else{
		touchTime = 0;
	}

	var valAdd = 4*Math.sin(delta/100);
	setMeshRotation(delta);
	setSpherePos(sphereMesh);
	setParticleOptions(delta  * spawnerOptions.timeScale / 5);	

	composer.render( 0.01 );
}
