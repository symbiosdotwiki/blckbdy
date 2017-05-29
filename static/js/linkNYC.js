if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container, stats, controls;
var camera, scene, renderer;
var clock = new THREE.Clock();
var mixers = [];
var objects = [];
var numObjs = 2;
var plane = new THREE.Plane();
var raycaster = new THREE.Raycaster();
var allLoaded = false;
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
var up_vector = new THREE.Vector3(0,1,0);
var INTERSECTED, SELECTED;
var rotateView = false;
var rotSpeed = -.004;
var tagHeight = 2.1;
var labelHeight = 4.5;
var fontSize = 30;

var showTags = false;

var plane_flat = new THREE.Plane(up_vector, 0);

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

init();

function init() {

    $('body').keyup(function(e){
        if(e.keyCode == 32){ //spacebar
            rotateView = !rotateView;
        }
        else if(e.keyCode == 80){ //p
            var printObjPos = {}
            for(var i = 0; i < objects.length; i ++){
                printObjPos[objects[i].name] = {
                    'x' : objects[i].position.x,
                    'y' : objects[i].position.y,
                    'z' : objects[i].position.z,
                }
           }
           console.log(JSON.stringify(printObjPos));
        }
        else if(e.keyCode == 78){ //n
            adjustTagHeight(-.1);
        }
        else if(e.keyCode == 77){ //m
            adjustTagHeight(.1);
        }
        else if(e.keyCode == 72){ //m
            $('.tag').toggle();
        }
        else if(e.keyCode == 74){ //m
            $('#overlay').hide();
        }
    });
    $('body').keypress(function(e){
        if(e.keyCode == 43){ //spacebar
            fontSize = (1.05 * parseFloat(fontSize)).toString() + 'px';
            console.log(fontSize);
            $('.tag').css('font-size',  fontSize);
        }
        else if(e.keyCode == 95){ //spacebar
            fontSize = (parseFloat(fontSize) / 1.05).toString() + 'px';
            console.log(fontSize);
            $('.tag').css('font-size',  fontSize);
        }
    });

    function adjustTagHeight(val){
        labelHeight += val;
        for(var i = 0; i < objects.length; i ++){
            var objTagName = slugify(objects[i].name) + '-tag';
            for(var j = 0; j < objects[i].children.length; j ++){
                if(objects[i].children[j].name.indexOf(objTagName) > -1){
                    objects[i].children[j].position.y = labelHeight + tagHeight;
                }   
            }
        }
    }

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    scene = new THREE.Scene();

    // scene
    var ambient = new THREE.AmbientLight( 0xFFFFFF );
    scene.add( ambient );
    scene.add( plane_flat );

    var textures = {};

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
    };

    // models
    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
        if(loaded == total){
            allLoaded = true;
        }

    };

    var index = 0;

    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

    $.ajax({
        url: tagsFile,
        dataType: "text",
        success: function (tagData) {
            $.ajax({
                url: posFile,
                dataType: "text",
                success: function (posData) {
                    var posjson = $.parseJSON(posData);
                    var json = $.parseJSON(tagData);
                    var tileNums = []
                    if (isMobile){
                        while(Object.keys(json).length > 3){
                            var randNum = getRandomInt(0,Object.keys(json).length);
                            delete json[Object.keys(json)[randNum]];
                        }
                    }
                    var texLoader = new THREE.ImageLoader( manager );
                    loader = new THREE.OBJLoader( manager );
                    for (var i in json){
                        (function(iKey){
                            textures[iKey] =  new THREE.Texture();
                            texLoader.load( '/static/obj/'+ iKey + ' texture.jpg', function ( image ) {
                                textures[iKey].image = image;
                                textures[iKey].needsUpdate = true;
                            } );
                            loader.load( '/static/obj/' + iKey + '_Reduced.obj', function ( object ) {
                                object.traverse( function ( child ) {
                                    if ( child instanceof THREE.Mesh ) {
                                        child.material.map = textures[iKey];
                                    }
                                });
                                addTagObj(object, iKey, 'board-label', {'x':0,'y':labelHeight,'z':0});
                                for(var jKey in json[iKey]){
                                    addTagObj(object, jKey, '', json[iKey][jKey]);
                                }
                                index ++;
                                object.position.z = parseFloat(posjson[iKey].z);
                                object.position.x = parseFloat(posjson[iKey].x);
                                object.name = iKey;     
                                scene.add( object );
                                objects.push( object );
                            }, onProgress, onError );
                        })(i);
                    }
                }
            });
        }
    });

    //renderer
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 0 );
    container.appendChild( renderer.domElement );

    // controls, camera
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    camera.position.set( 2, 20, 20 );
    controls.update();
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
    renderer.domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
    renderer.domElement.addEventListener( 'touchstart', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'touchend', onDocumentMouseUp, false );
    window.addEventListener( 'resize', onWindowResize, false );
    animate();
}

//event actions
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    if(!rotateView){
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        moveObjects(mouse); 
    }           
}

function onDocumentTouchMove( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouse.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
        moveObjects(mouse);
    }       
}

function moveObjects(mouse){
    raycaster.setFromCamera( mouse, camera );
    if ( SELECTED ) {
        if ( raycaster.ray.intersectPlane( plane_flat, intersection ) ) {
            SELECTED.position.copy( intersection.sub( offset ) );
        }
        return;
    }
    var intersects = raycaster.intersectObjects( objects );
    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ];
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            plane.setFromNormalAndCoplanarPoint(
                camera.getWorldDirection( plane.normal ),
                INTERSECTED.position );
        }
        container.style.cursor = 'pointer';
    } else {
        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
        container.style.cursor = 'auto';
    }
}

function onDocumentMouseDown( event ) {
    if(!rotateView){
        event.preventDefault();
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( objects, true );
        if ( intersects.length > 0 ) {
            controls.enabled = false;
            SELECTED = getParent(intersects[ 0 ].object);
            if ( raycaster.ray.intersectPlane( plane_flat, intersection ) ) {
                offset.copy( intersection ).sub( SELECTED.position );
            }
            container.style.cursor = 'move';
        }
        var rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
        mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    }
}

function onDocumentMouseUp( event ) {
    if(!rotateView){
        event.preventDefault();
        controls.enabled = true;
        SELECTED = null;
        container.style.cursor = 'auto';
    }
}

//helpers
function toScreenPosition(obj, camera){
    var vector = new THREE.Vector3();
    var widthHalf = .5 * $(window).width();
    var heightHalf = .5 * $(window).height();

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };
};

function getParent(obj){
    if(obj.parent == scene)
        return obj;
    return getParent(obj.parent);
}

function slugify(text){
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

function addTagDiv(title, extraClass){
    var slug = slugify(title) + '-tag';
    $(".content").append('<div class="circle-red" id="'+slug+'-circlered"></div><div class="circle-green" id="'+slug+'-circlegreen"></div><div class="tag noselect" id="'+slug+'"><div class="label ' + extraClass + '">'+title+'</div><span class="pointer"></span></div>');               
}

function addTagObj(object, title, extraClass, pos){
    addTagDiv(title, extraClass);
    var tagObj = new THREE.Group();
    tagObj.name = slugify(title) + '-tag';
    tagObj.position.x = pos.x;
    tagObj.position.y = pos.y + tagHeight;
    tagObj.position.z = -1 * zPos * pos.z -.4;
    object.add(tagObj);
}

//animate, render
function animate() {
    requestAnimationFrame( animate );
    if ( mixers.length > 0 ) {
        for ( var i = 0; i < mixers.length; i ++ ) {
            mixers[ i ].update( clock.getDelta() );
        }
    }
    render();

    if(rotateView){
        var x = camera.position.x,
            y = camera.position.y,
            z = camera.position.z;
        camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
        camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
        camera.lookAt(scene.position);
        controls.enabled = false;
    }

    if(allLoaded){
        if(!showTags){
            showTags = true;
            $('.tag').show();
        }
        for(var i = 0; i < objects.length; i ++){
            //objects[i].rotateY(.01);
            var distance = objects[i].position.distanceTo( camera.position );
            var tagObj = null;
            for(var j = 0; j < objects[i].children.length; j++){
                if(objects[i].children[j].name.indexOf('-tag') > -1){
                    tagObj = objects[i].children[j];
                    var tagPos = toScreenPosition(tagObj, camera);
                    tagObj.position.y -= tagHeight;
                    var objPos = toScreenPosition(tagObj, camera);
                    tagObj.position.y += tagHeight;
                    var tagDivID = '#' + tagObj.name;
                    $(tagDivID).css({
                        'left': objPos.x + 'px',
                        'top' : tagPos.y + 'px',
                        'z-index' : Math.round(1/distance*100),
                    });
                    //console.log(tagDivID + "-circle");
                    $(tagDivID + "-circlered").css({
                        'left': tagPos.x + 'px',
                        'top' : tagPos.y + 'px',
                    });
                    $(tagDivID + "-circlegreen").css({
                        'left': objPos.x + 'px',
                        'top' : objPos.y + 'px',
                    });
                    $(tagDivID + " .label").parent().css({
                        'font-size': (fontSize/(.001+distance)).toString() + 'em',
                    });
                    var pHeight = Math.abs(tagPos.y - objPos.y);
                    $(tagDivID + " span").css({
                        'top': 8,
                        'height' : pHeight-8,
                    });
                }
            }
        }
    }
    else{
        $('.tag').hide();
    }
}

function render() {
    renderer.render( scene, camera );
}