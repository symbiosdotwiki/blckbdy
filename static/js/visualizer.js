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

function scApiUrl(url, apiKey) {
	var useSandBox = false;
    var $doc = $(document);
    var domain = useSandBox ? 'sandbox-soundcloud.com' : 'soundcloud.com';
    var secureDocument = (document.location.protocol === 'https:'); 
	var resolver = ( secureDocument || (/^https/i).test(url) ? 'https' : 'http') + '://api.' + domain + '/resolve?url=';
    var params = 'format=json&consumer_key=' + apiKey +'&callback=?';

	// force the secure url in the secure environment
  	if( secureDocument ) {
    	url = url.replace(/^http:/, 'https:');
  	}

  	// check if it's already a resolved api url
  	if ( (/api\./).test(url) ) {
    	return url + '?' + params;
  	} 
  	else {
  		return resolver + url + '&' + params;
	}
}

function loadAudio(){
	loadingIcon.show();
	audio[0].crossOrigin = "anonymous";
	SC.initialize({
		client_id: mySoundCloudClientId,
	});

	var soundCloudURL = "https://soundcloud.com/madeon/madeon-cut-the-kid";
	SC.get("/resolve", { url: sourceUrl }, function(result, err) {
	  	if (err) {
	    	console.error("bad url:", url, err);
	    	return;
	  	}
	  	if(result.duration){
	    	result.permalink_url = sourceUrl;
	  	}
	  	if (result.streamable && result.stream_url) {
	  		var src = result.stream_url + (/\?/.test(result.stream_url) ? '&' : '?') + 'consumer_key=' + mySoundCloudClientId;
	    	audio.attr("src", src);

	    	console.log("link to music:", result.permalink_url);
	    	console.log("link to band:", result.user.permalink_url);
	    	console.log("name of song:", result.title);
	    	console.log("name to band:", result.user.username);
	    	audio[0].pause();
			audio[0].load();
			audio[0].oncanplaythrough = function(){
				loadingIcon.removeClass('shown');
			playButton.addClass('shown');
			}
	  	} 
	  	else {
	     	console.error("not streamable:", url);
	  	}
	});
}

function pauseFade(){
	if(audio[0].paused){
		audioIcon.removeClass('fa-play');
		audioIcon.addClass('fa-pause');
		audio[0].play();
		audio.animate({volume: 1}, 100);
	}
	else{
		audioIcon.removeClass('fa-pause');
		audioIcon.addClass('fa-play');
		audio.animate({volume: 0}, 100, function(){
			audio[0].pause();
		});
	}
}

function setProgressBar(){
    var track_length = audio[0].duration;
    var secs = audio[0].currentTime;
    var progress = (secs/track_length) * 100;
    progressBar.attr('value', progress);
}

function seek(e) {
    var percent = (e.pageX - progressBar.offset().left) / progressBar.width();
    audio[0].currentTime = percent * audio[0].duration;
    progressBar.value = percent / 100;
    seeking = true;
    updateStuff();
    console.log(triggered);
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
    setProgressBar();
}

var updateStuff = function(){
    var curBar = songTime * bpm / 60 / 4;
    for(var key in audioTriggers){
    	var keyBar = parseFloat(key);
    	var beenTriggered = triggered.indexOf(key) > -1;
    	if(Math.abs(curBar - keyBar) < .125 || (curBar > keyBar && !seeking)){
    		if(!beenTriggered){
    			triggered.push(key);
    			audioTriggers[key]();
    		}
    	}
    	else if(curBar < keyBar){
    		if(beenTriggered){
    			triggered.pop(key);
    		}
    	}
    	else if(curBar > keyBar){
    		if(!beenTriggered){
    			triggered.push(key);
    		}
    	}
    }
    seeking = false;
}

var getHueVal = function(audioVal){
	return 0;
}

var getSatVal = function(audioVal){
	return 0;
}
var getIntensityVal = function(audioVal){
	return 0;
}

var setSpherePos = function(sphere){
	orbitPosition(sphere, 1.0);
}

var setMeshRotation = function(delta){
	mesh.rotation.y += 0.0125 * delta;
	mesh.rotation.x += 0.05 * delta;
}

function setParticleOptions(pDelta){
	tick += pDelta;
	if ( tick < 0 ) tick = 0;

	particleColor.setHSL(uniforms.hue.value, uniforms.saturation.value, .5);
	options.color = particleColor;

	if ( pDelta > 0 ) {
		setParticlePosition();
		spawnAmount = spawnerOptions.spawnRate;
		if(isMobile){
			spawnAmount = 0;
		}
		for ( var x = 0; x < spawnAmount * pDelta; x++ ) {
			particleSystem.spawnParticle( options );
		}
	}
	particleSystem.update( tick );
}

var setParticlePosition = function(){
	options.position.y = 100*Math.sin( tick * options.speed );
}


var updateHSV = function(){
	if(!frequencyData){
		return false;
	}
	updateStuff(songTime);

	var sum1 = 0;
	var sum2 = 0;
	var sum3 = 0;
	var length = 1.0;
	var frac = 1.0;

	if(!isMobile){
		length = frequencyData.length;
		for(var i = 0; i < length/frac; i++){
	        var val = frequencyData[i] / 255.0;
	        sum1 += val;
	    }
	    for(var i = 1*length/4; i < 3*length/4; i++){
	        var val = frequencyData[i] / 255.0;
	        sum2 += val;
	    }
	    for(var i = 3*length/4; i < length; i++){
	        var val = frequencyData[i] / 255.0;
	        sum3 += val;
	    }
	    sum1 = frac * sum1;
	    trace1.x = [];
	    trace1.y = [];
	    for(var i = 0; i < length; i++){
	    	trace1.x.push(i*2500/length);
	    	trace1.y.push(frequencyData[i]/20 * blackBody(1.0, 400.0, i/length, sum1));
	    }
	    Plotly.newPlot(graphDiv, data, layout, plotOptions);
	}
	else{
		sum1 = Math.random() * .25 + .2;
		sum2 = Math.random() * .25 + .2;
		sum3 = Math.random() * .25 + .2;
	}

	if(!audio[0].paused){
		uniforms.hue.value = getHueVal(sum1 / length);
    	uniforms.saturation.value = getSatVal(sum3 / length);
    	uniforms.intensity.value = getIntensityVal(sum2 / length); 
	}
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