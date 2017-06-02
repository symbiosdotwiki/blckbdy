var sphereObject = function(radius){
	return new THREE.SphereBufferGeometry( radius, 32, 16 );
}

var torusKnotObject = function(radius, diameter, p, q){
	return new THREE.TorusKnotGeometry(radius, diameter, 100, 30, p, q);
}

function orbitPosition(object, radius){
	object.position.copy(new THREE.Vector3( 
		radius * Math.cos(.1*time), 
		0, 
		radius * Math.sin(.1*time)
	))
}

function oscillatePosition(object, radius){
	object.position.copy(new THREE.Vector3( 
		0, 
		0, 
		radius * Math.sin(.15*time)
	))
} 

var figure8OrbitPosition = function(object, radius){
	object.position.copy(new THREE.Vector3( 
		1.2 * radius * Math.sin(.1*time), 
		0, 
		.8 * radius * Math.sin(.2*time)
	))
}

function loadAudio(){
	loadingIcon.show();
	var sourceUrl = audioPath + curAudio.toString() + audioType;
	audio.attr("src", sourceUrl);
	audio[0].pause();
	audio[0].load();
	audio[0].oncanplaythrough = function(){
		loadingIcon.hide();
		if(isMobile && notClicked){
			playButton.show();
		}
		else{
			audio[0].play();
		}
	}
}

function pauseFade(){
	if(audio[0].paused){
		audioIcon.removeClass('fa-volume-off');
		audioIcon.addClass('fa-volume-up');
		audio[0].play();
		audio.animate({volume: 1}, 100);
	}
	else{
		audioIcon.removeClass('fa-volume-up');
		audioIcon.addClass('fa-volume-off');
		audio.animate({volume: 0}, 100, function(){
			audio[0].pause();
		});
	}
}

function webkitAudioSafe(){
	try{
		var test = new (window.AudioContext || window.webkitAudioContext)();
	}
	catch(err){
		return false;
	}
	return true;
}

function createEqualizer() {
    if(audio[0].paused) {
    	audio[0].load();
    	audio[0].play();
       window.setTimeout(createEqualizer, 100);
    } else {
      audio.equalizer({
			width: 100.0,
			height: 100.0,
			bars: numBars,
			components: numComponents,
			barMargin: 3,
			componentMargin: compMargin,
			refreshTime: refreshTime,
			equiFunction: updateHSV,
		});
      $(audio[0]).bind('timeupdate', updateTime);
    }
}

var updateTime = function(){
    songTime = this.currentTime;
    //console.log(bars);
}

var updateStuff = function(){
    var bars = songTime * bpm / 60 / 4;
    for(var key in audioTriggers){
    	if(Math.abs(bars - parseFloat(key)) < .125){
    		if(triggered.indexOf(key) < 0){
    			triggered.push(key);
    			audioTriggers[key]();
    		}
    	}
    }
}

var getHueVal = function(audioVal){
	return 0;
}

var getSatVal = function(audioVal){
	return 0;
}

var setSpherePos = function(){
	orbitPosition(sphereMesh, 1.0);
}

var setMeshRotation = function(){
	mesh.rotation.y += 0.0125 * delta;
	mesh.rotation.x += 0.05 * delta;
}

var updateHSV = function(frequencyData){
	updateStuff(songTime);
	var sum1 = 0;
	var sum2 = 0;
	var length = frequencyData.length;
	var frac = 1.0;
	for(var i = 0; i < length/frac; i++){
        var val = frequencyData[i] / 255.0;
        sum1 += val;
    }
    for(var i = 3*length/4; i < length; i++){
        var val = frequencyData[i] / 255.0;
        sum2 += val;
    }
    sum1 = frac * sum1
    //uniforms.saturation.value = saturation + sum1 ;
    //console.log(sum2 / length*Math.sin(.05*time));
    uniforms.hue.value = getHueVal(sum1 / length);
    uniforms.saturation.value = getSatVal(sum2 / length);

    trace1.x = [];
    trace1.y = [];
    for(var i = 0; i < length; i++){
    	trace1.x.push(i*2500/length);
    	trace1.y.push(frequencyData[i]/20 * blackBody(1.0, 400.0, i/length, sum1));
    }
    Plotly.newPlot(graphDiv, data, layout, plotOptions);
}

function blackBody(c1, c2, v, t){
	return c1*Math.pow(v, 3)/(Math.exp(c2*v/t)-1)
}

function onWindowResize( event ) {

	uniforms.resolution.value.x = window.innerWidth;
	uniforms.resolution.value.y = window.innerHeight;

	renderer.setSize( window.innerWidth, window.innerHeight );

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	composer.reset();
}