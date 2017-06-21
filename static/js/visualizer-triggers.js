var triggered = []
var counters = []
var timerID = null;

var audioTriggers = {
	'0' : function(){
		mesh.geometry = new THREE.SphereBufferGeometry( .6, 30, 30 );
		uniforms.uvScale.value = new THREE.Vector2( 2.0, 1.0 );
		mesh.visible = true;
	},
	'4' : function(){
		uniforms.setInt.value = true;
		getIntensityVal = function(audioVal){
			return 3*audioVal;
		}
	},
	'8' : function(){
		uniforms.setInt.value = false;
		getHueVal = function(audioVal){
			return .5;
		}
		getSatVal = function(audioVal){
			return 5 * audioVal + .5 * Math.sin(.05 * time);
		}
	},
	'16' : function(){
		getSatVal = function(audioVal){
			return 5 * audioVal + .4 * Math.sin(.05 * time);
		}
	},
	'24' : function(){
		getHueVal = function(audioVal){
			return .25;
		}

	},
	'32' : function(){
		getHueVal = function(audioVal){
			return .7;
		}

	},
	'36' : function(){
		uniforms.setInt.value = true;
		getIntensityVal = function(audioVal){
			return 3*audioVal;
		}
	},
	'40' : function(){
		uniforms.setInt.value = false;
		getHueVal = function(audioVal){
			return .85;
		}

	},
	'48' : function(){
		getHueVal = function(audioVal){
			return 2 * audioVal + .4 * Math.sin(.04 * time) + .1;
		}

	},
	'56' : function(){
		var startSat = uniforms.saturation.value;
		var funFunction = function(t){
			var mScale = 1.0-t;
			getSatVal = function(audioVal){
				return mScale*startSat;
			}
		}
		timerID = animateForBars(2, 8, funFunction);
		uniforms.setInt.value = true;
		var funFunction2 = function(t){
			var mScale = 1.0-t;
			getIntensityVal = function(audioVal){
				return mScale*audioVal*3;
			}
			//mesh.scale.set(mScale, mScale, mScale);
		}
		timerID = animateForBars(8, 16, funFunction2);
	},
	'64' : function(){
		spawnerOptions.spawnRate = 0;
		clearInterval(timerID);
		uniforms.setInt.value = false;
		mesh.geometry = new THREE.TorusGeometry( torusSize[0], torusSize[1], torusSize[2], torusSize[3] );
		uniforms.uvScale.value = new THREE.Vector2( 3.0, 1.0 );
		setSpherePos = function(sphere){
			//mesh.scale.set(1, 1, 1);
			figure8OrbitPosition(sphere, 1.0);
		}
		particleSystem.rotation.x = Math.PI/2;
		getHueVal = function(audioVal){
			return 2 * audioVal + .4 * Math.sin(.04 * time) + .1;
		}
	},
	'72' : function(){
		getSatVal = function(audioVal){
			return 2 * audioVal + .5 * Math.sin(.05 * time);
		}
	},
	'80' : function(){
		sphereMesh.material.color = new THREE.Color(0xffffff);
		getSatVal = function(audioVal){
			return 5 * audioVal + .5 * Math.sin(.05 * time);
		}
	},
	'92' : function(){
		var funFunction = function(t){
			mesh.geometry.dispose();
			mesh.geometry = new THREE.TorusGeometry( torusSize[0], torusSize[1]-.15*t, torusSize[2], torusSize[3] );
		}
		timerID = animateForBars(4, 8, funFunction);
	},
	'96' : function(){
		clearInterval(timerID);
		setSpherePos = function(sphere){
			oscillatePosition(sphere, 1.0);
		}
		var funFunction = function(t){
			mesh.geometry.dispose();
			mesh.geometry = new THREE.TorusKnotGeometry(.65, .15, 200, 30, 1+3*t*t, 5*t );
			console.log(t);
		}
		timerID = animateForBars(8, 8, funFunction);
	},
	'100' : function(){
		//clearInterval(timerID);
		var funFunction = function(t){
			uniforms.uvScale.value.x = (20.0-3) * t + 3.0;
		}
		timerID = animateForBars(4,32, funFunction);
	},
	'116' : function(){
		spawnerOptions.spawnRate = 22000;
		tick = 0;
		clearInterval(timerID);
		mesh.geometry = new THREE.TorusKnotGeometry(.65, .15, 200, 30, 4, 5 );
		uniforms.uvScale.value = new THREE.Vector2( 20.0, 1.0 );
		uniforms.setHue.value = false;
		getSatVal = function(audioVal){
			return 5 * audioVal + .2 * Math.sin(.05 * time) + .3;
		}
	}
}

//history.go(-1 * history.length + 1);

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
	}, rTime);
	thing();
	
	setTimeout(function(){
		console.log(i);
		funfunction(1.0);
		clearInterval(funID);
	}, fullTime - refreshTime);

	return funID;
}