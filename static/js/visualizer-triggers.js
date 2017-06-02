var triggered = []
var counters = []
var timerID = null;
var audioTriggers = {
	'0' : function(){
		mesh.geometry = new THREE.SphereBufferGeometry( .6, 30, 30 );
		uniforms.uvScale.value = new THREE.Vector2( 2.0, 1.0 );
		mesh.visible = true;
	},
	'8' : function(){
		getSatVal = function(audioVal){
			return 5 * audioVal + .5 * Math.sin(.05 * time);
		}
	},
	'24' : function(){
		getHueVal = function(audioVal){
			return .25;
		}

	},
	'32' : function(){
		getHueVal = function(audioVal){
			return .5;
		}

	},
	'40' : function(){
		getHueVal = function(audioVal){
			return .85;
		}

	},
	'48' : function(){
		getHueVal = function(audioVal){
			return 2 * audioVal + .5 * Math.sin(.04 * time);
		}

	},
	'64' : function(){
		getHueVal = function(audioVal){
			return 2 * audioVal + .5 * Math.sin(.04 * time);
		}
		getSatVal = function(audioVal){
			return 5 * audioVal + .5 * Math.sin(.05 * time);
		}

	},
	'56' : function(){
		mesh.geometry = new THREE.TorusGeometry( torusSize[0], torusSize[1], torusSize[2], torusSize[3] );
		uniforms.uvScale.value = new THREE.Vector2( 3.0, 1.0 );
		sphereMesh.material.color = new THREE.Color(0xffffff);
		setSpherePos = function(sphere){
			figure8OrbitPosition(sphere, 1.0);
		}
		getSatVal = function(audioVal){
			return 0;
		}
	},
	'100' : function(){
		setSpherePos = function(sphere){
			oscillatePosition(sphere, 1.0);
		}
		var funFunction = function(t){
			mesh.geometry.dispose();
			mesh.geometry = new THREE.TorusKnotGeometry(.65, .15, 200, 30, 1 + 3*t, 1+4*t );
		}
		timerID = animateForBars(8, 8, funFunction);
	},
	'116' : function(){
		clearInterval(timerID);
		/*
		getHueVal = function(audioVal){
			return 2 * audioVal + .5 * Math.sin(.04 * time);
		}

		getSatVal = function(audioVal){
			return 5 * sum2 / length + .5 * Math.sin(.05 * time);
		}
		*/
		mesh.geometry = new THREE.TorusKnotGeometry(.65, .15, 200, 30, 4, 5 );
		uniforms.uvScale.value = new THREE.Vector2( 20.0, 1.0 );
		uniforms.setHue.value = false;
	}
}

function animateForBars(bars, numStepsPerBar, funfunction){
	var fullTime = 1000.0 * 60.0 * (bars * 4) / bpm;
	//var numSteps =  fullTime / (refreshTime * 4);
	var numSteps = bars * numStepsPerBar;
	var rTime = fullTime / numSteps;
	console.log(refreshTime)
	console.log(numSteps)
	var i = 0;
	var thing = function(){
		//console.log(songTime);
		var funInput = i / numSteps;
		if(i < numSteps){
			//console.log(i);
			funfunction(funInput);
			i ++;				
		}
		if(i >= numSteps){
			funInput = 1.0;
			funfunction(funInput);
		}
	}
	var funID = setInterval(function(){
		thing()
	}, rTime - 10);
	thing();
	
	setTimeout(function(){
		console.log(i);
		funfunction(1.0);
		clearInterval(funID);
	}, fullTime - 10);

	return funID;
}