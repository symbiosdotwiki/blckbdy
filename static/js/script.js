var audio = $('#audioPlayer');
var video = $('#bgvid');
var pauseButton = $('#audioPause');
var playButton = $('#playButton');
var loadingIcon = $('#loading');
var audioIcon = $('#audioIcon');
var equalizer = $('.equalizer');
var logo = $("#logo");
var icons = $("#icons");
var phoneCall = $("#phoneCall");
var centerBox = $(".centerBox");
var adRegion = $(".adRegion");
var container = $('.container');
var sideButtons = $(".sideButtons");

var audioFile = 'static/audio/track.mp3';

var numBars = 8;
var numComponents = 10;
var compMargin = 3
var equalizerInstantiated = false;
var minHeight = 100;

var notClicked = true;
var refreshTime = 30;

var isSafari = false;
var isMobile = false;

function setVCFPath(){
	logo.click(function(){
		window.location.href = vcfPath;
	});
}

function addMobileCss(){
	var landscape = '<link rel="stylesheet" media="all and (orientation:landscape)" href="static/css/landscape.css">';
	$('head').append(landscape);
}

function getURLParams(url){
    var sPageURL = url.split('?');
    var sParams = {};
    if (sPageURL.length < 2) return sParams;
    sPageURL = sPageURL[1];
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParam = sURLVariables[i].split('=');
        sParams[sParam[0]] =sParam[1];
    }
    return sParams;
}

function getURLParameter(sParam, other){
    var sParams = getURLParams(window.location.href);
    if (sParam in sParams) return sParams[sParam];
    return other;
}

function setURLParameters(url, sParams){
    var baseURL = url.split('?')[0];
    var sParams = $.extend(getURLParams(url), sParams);
    var keys = Object.keys(sParams);
    var keyVals = keys.map(function(v) { 
        return v + '=' + sParams[v]; 
    });
    return baseURL + '?' + keyVals.join('&');
}

function getRandomNumber(min, max){
	var numObj = (max - min) + 1;
	return Math.floor((Math.random() * numObj) + min);
}

function getNewRandomNumber(min, max, old){
	var numObj = (max - min) + 1;
	var newNum = getRandomNumber(min, max);
	if(newNum == old){
		newNum = (newNum + 1) % numObj + min;
	} 
	return newNum;
}

function loadRandomAudio(){
	curAudio = getURLParameter('clip', getRandomNumber(minAudio, maxAudio));
	loadAudio();
}

function loadNextAudio(){
	curAudio = (curAudio + 1) % (maxAudio + 1)
	loadAudio();
}

function reloadNextAudio(){
	curAudio = (curAudio + 1) % (maxAudio + 1)
	window.location = setURLParameters(window.location.href, {
		clip : curAudio
	})
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

function setBackgroundImg(sourceUrl){
	var body = $('.backgroundBox');
	body.css({
		'background' : 'url(' + sourceUrl + ')',
		'background-size' : '100%',
		'-webkit-background-size' : 'cover',
			'-moz-background-size': 'cover',
			'-o-background-size': 'cover',
			'background-size': 'cover',
		'-webkit-filter': 'blur(2px)',
    	'-moz-filter': 'blur(2px)',
    	'-o-filter': 'blur(2px)',
    	'-ms-filter': 'blur(2px)',
    	'filter': 'blur(2px)',
    	'background-attachment': 'fixed',
    	'background-repeat' : 'no-repeat',
    	'background-position': 'center',
	});
}

function setToOffWhite(){
	container.css({
		'color': offWhite,
	});
	baseColor = offWhite;
	sideButtons.css({
		'color': '#000000',
	})
}

function resizeToFiteAd(){
	var wHeight = $(window).height();
	var wWidth = $(window).width();
	var newWidth = wWidth*.55*.8;
	//check if landscape
	if(wWidth/wHeight > adRatioTotal){
		var newWidth = wHeight*adRatio*.8;
	}
	adRegion.width(newWidth);
}

function setBackgroundPic(sourceUrl){
	var body = $('.backgroundBox');
	body.css({
		'background' : 'url(' + sourceUrl + ')',
		'background-size' : 'contain',
		'background-attachment': 'fixed',
    	'background-repeat' : 'no-repeat',
    	'background-position': 'center',
	});
	setToOffWhite();
}

function setBackgroundVid(sourceUrl, picUrl){
	video.attr('poster', picUrl);
	var vidSource = video.children('source');
	vidSource.attr('src', sourceUrl);
	video[0].load();
	video[0].oncanplaythrough = video[0].play();
}

function loadRandomStill(){
	var curPic = getRandomNumber(minPic, minGif-1);
	var sourceUrl = stillPath + curPic.toString() + '.png';
	setBackgroundPic(sourceUrl);
	logo.attr('src', adLogoPath);
	$(window).resize(resizeToFiteAd);

	centerBox.css({
		'left':'52%',
		'top':'48%',
		'transform':'none',
		'width':'',
	})
	equalizer.css({
		'left':'52%',
		'transform':'none',
	})
	
	setEqualizerHeight = function(){
		var wHeight = $(window).height();
		var wWidth = $(window).width()*.5;
		//check if portrait
		if(wWidth/wHeight < adRatioTotal){
			var adHeight = wWidth / adRatio;
			var newPos = ((1-.76*(adHeight/wHeight)) / .02).toString() + '%';
			equalizer.css({
				'top':newPos,
			})
			wHeight = adHeight;
		}
		else{
			equalizer.css({
				'top':'12%',
			})
		}
		var height = (wHeight - centerBox.height())/2;
		height = height - .1 * wHeight;
		if(height < minHeight){
			equalizer.hide();
		}
		else{
			equalizer.height(height);
			equalizer.show();
			height = height * compMargin / 100.0
			$('.equalizer_bar_component').css('margin', height + 'px 0px');
		}
	}
}

function loadRandomGif(){
	var curPic = getRandomNumber(minPic, maxPic);
	if(curPic >= minGif){
		var sourceUrl = stillPath + curPic.toString() + '.png';
		setBackgroundImg(sourceUrl)
		sourceUrl = gifPath + curPic.toString() + '.gif';
		setBackgroundImg(sourceUrl)
	}
	else{
		loadRandomStill();
	}
}

function loadRandomVid(){
	var curPic = getRandomNumber(minPic, maxPic);
	if(curPic >= minGif){
		var picUrl = stillPath + curPic.toString() + '.png';
		setBackgroundImg(picUrl)
		var sourceUrl = vidPath + curPic.toString() + '.mp4';
		setBackgroundVid(sourceUrl, picUrl);
	}
	else{
		loadRandomStill();
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

var setEqualizerHeight = function(){
	var wHeight = $(window).height()
	var height = (wHeight - centerBox.height())/2;
		height = height - .1 * wHeight 
	if(height < minHeight){
		equalizer.hide();
	}
	else{
		equalizer.height(height);
		equalizer.show();
		height = height * compMargin / 100.0
		$('.equalizer_bar_component').css('margin', height + 'px 0px');
	}
}

function checkEqualizerInsantiated() {
	equalizerInstantiated = (numBars * numComponents == $('.equalizer_bar_component').length)
    if(equalizerInstantiated == false) {
       window.setTimeout(checkEqualizerInsantiated, 100);
    } else {
		setEqualizerHeight();
		equalizer.show();
    }
}

function createEqualizer() {
    if(audio[0].paused) {
       window.setTimeout(createEqualizer, 100);
    } else {
      audio.equalizer({
			width: 100.0,
			height: 100.0,
			color: baseColor,
			bars: numBars,
			components: numComponents,
			barMargin: 3,
			componentMargin: compMargin,
			refreshTime: refreshTime,
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

$(document).ready(function() {

	equalizer.hide();

	isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
	isIE = !webkitAudioSafe();

	if(isMobile){
		loadRandomStill();
		logo.attr('src', adLogoPath);
		addMobileCss();
	}
	else{
		phoneCall.hide();
		if(isSafari){
			loadRandomVid();
		}
		else{
			loadRandomGif();
		}
	}

	loadRandomAudio();
	pauseButton.click(pauseFade);

	if (!isMobile && !isIE){
		createEqualizer();
		$(window).resize(setEqualizerHeight);
		logo.on('load', function(){
			checkEqualizerInsantiated();
			setVCFPath();
		});
		$(window).keypress(function (e) {
		    if(e.keyCode == 32){
		        pauseButton.click();
		    }
		});
	}
	else{
		$('#playButton').click(function(){
			audio[0].play();
			playButton.hide();
			notClicked = false;
		});
	}
	
	if (isSafari || isIE){
		audio.on('ended', reloadNextAudio);
	}
	else{
		audio.on('ended', loadNextAudio);
	}

	$(window).resize();

});