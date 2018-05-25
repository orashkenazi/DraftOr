// -20.884850, 55.467112 = 0 point of our world. (in coordinates)


var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 25000 );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),INTERSECTED;
var theta=0, radius =100;

var renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild( renderer.domElement );

camera.position.set( 0, -400 , 600 );
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

//add Orbit Controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.minPolarAngle=0.1*Math.PI/2;
controls.maxPolarAngle=0.98*Math.PI/2;
controls.autoRotateSpeed = 0.2  ;
controls.autoRotate = true;


var imgmat =  null; //used in addGround();
var myObjects = []; //all objects to be controled with admin controls need to be pushed here
var unselectableObjects = [];   //objects that would not be able to select by click / have hover effect when mouse on them 
let interactiveObjects = [] //all objects that should be interactive (have label and menu button and extra features)
var lastColor;                          //used for the selecting
let selectedObjectIndex;                  //the current selected object in the lsit

addLights();
initObjects();
createImagePlane();
createTerrainMaterial();






loadingOBJObject('./models/saint-denis/prunel_bati.obj','buildings');
//loadingOBJObject('./models/saint-denis/prunel_ground.obj','ground');

loadingOBJObject('./models/saint-denis/prunel_roof.obj','roof');
loadingOBJObject('./models/saint-denis/prunel_streets.obj','street');
setObjectsInSelectList(myObjects)




window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseClick, false );
animate();

function createImagePlane(){
     // instantiate a loader
var loader = new THREE.TextureLoader();

// load a resource
loader.load(
	// resource URL
	'./images/version-def.jpg',

	// onLoad callback
	function ( texture ) {
        texture.minFilter = THREE.LinearFilter;
		// in this example we create the material when the texture is loaded
		var material = new THREE.MeshBasicMaterial( {
			map: texture
         } );
         
         var geometry = new THREE.PlaneGeometry(6916*0.377,4790*0.377,1,1);
         var plane = new THREE.Mesh(geometry,material)
         plane.name = "plane with image";
       
         myObjects.push(plane);
         unselectableObjects.push(plane);
         scene.add(plane);

        
	},

	// onProgress callback currently not supported
	undefined,

	// onError callback
	function ( err ) {
		console.error( 'An error happened.' );
	}
);
}

function createTerrainMaterial(){
    // instantiate a loader
    var loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
        // resource URL
        './reunionsat.jpg',

        // onLoad callback
        function ( texture ) {
            // in this example we create the material when the texture is loaded
            var material = new THREE.MeshBasicMaterial( {
                map: texture
            } );
            
            imgmat = material;
            addGround();
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        function ( err ) {
            console.error( 'An error happened.' );
        }
    );
}




function addLights() {
    var ambientLight = new THREE.AmbientLight(0x444444);
    ambientLight.intensity = 0.0;
    scene.add(ambientLight);
   
    var directionalLight = new THREE.DirectionalLight(0xffffff);
   
    directionalLight.position.set(0, 4, 10).normalize();
    scene.add(directionalLight);
   }


function getTerrainPixelData(){
  var img = document.getElementById("landscape-image");
 
  var canvas = document.getElementById("canvas1");
  
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

  var data = canvas.getContext('2d').getImageData(0,0, img.height, img.width).data;
  var normPixels = []

  for (var i = 0, n = data.length; i < n; i += 4) {
    // get the average value of R, G and B.
    normPixels.push((data[i] + data[i+1] + data[i+2]) / 3);
  }

  
  return normPixels;
}
 
function addGround() {
    //go to zero point => +29.84[km] in X, 7.21[km] in Y
    /*imgdata??
    originial pixels = 2592
    
    upper width (x) = 74.83km
    lower dith (x) = 74.47km
    height (Y) = 80.06km

    
    coordinates: (earth coordiantes)
    minX: 55.18
    maxX   55.9

    mmaxY: -20.82
    minY: -21.54

    pixelsize: 0.000277778 (each pixel in the picture, eqcual this coordinate distance)


    */
    

    var numSegments = 299;
  
    var geometry = new THREE.PlaneGeometry(74830, 80060, numSegments, numSegments); // now each threejs unit eqcual
    var material = new THREE.MeshPhongMaterial({
        color: 0x2df5f5,
        wireframe: true
      });

    material2= new  THREE.MeshPhongMaterial({
        color: 0x2d852d,
        polygonOffset: true,
        polygonOffsetFactor: 1, // positive value pushes polygon further away
        polygonOffsetUnits: 1
    });

    terrain = getTerrainPixelData();  
    
    

    // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
    // there's 10 segments, there's 11 vertices, and so forth. 
    // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
    // "skewing the landscape" then..
  
    // to check uncomment the next line, numbers should be equal
     console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);
  
    for (var i = 0, l = geometry.vertices.length; i < l; i++)
    {
        var terrainValue = terrain[i] / 255;
        geometry.vertices[i].z = geometry.vertices[i].z + terrainValue *3036 *1.5 ;
         
    }
   
   
  
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  
    var plane = new THREE.Mesh(geometry,material);
    //var plane2 = new THREE.Mesh(geometry,material2)
    plane.position = new THREE.Vector3(0,0,0);
 
    var q = new THREE.Quaternion();
    q.setFromAxisAngle( new THREE.Vector3(0,0,0), 90 * Math.PI / 180 );
    plane.quaternion.multiplyQuaternions( q, plane.quaternion );

    plane.name="plane";
   
    plane.position.x=+74830/2 -29840;
    plane.position.y=-80060/2 +7210;
    plane.position.z=-30;
    scene.add(plane)
    myObjects.push(plane)
    unselectableObjects.push(plane);

/*
    plane2.position = new THREE.Vector3(0,0,0);
 
    var q = new THREE.Quaternion();
    q.setFromAxisAngle( new THREE.Vector3(0,0,0), 90 * Math.PI / 180 );
    plane2.quaternion.multiplyQuaternions( q, plane2.quaternion );

    plane2.name="plane2";
   
    plane2.position.x=+74830/2 -29840;
    plane2.position.y=-80060/2 +7210;
    plane2.position.z=-30;
    scene.add(plane2)
    myObjects.push(plane2)
    unselectableObjects.push(plane2);*/
  }

 




function initObjects(){
    // building some boxes!
   var material = new THREE.MeshPhongMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (8,8,30)
   var cube = new THREE.Mesh( geo, material);
   cube.name="My Box Bulding";
   cube.position.x =11;
   cube.position.y =19;
   cube.position.z = 15
   cube.rotateZ(Math.PI/2.8)
   scene.add(cube)
   myObjects.push(cube)
   interactiveObjects.push(cube)


   var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (7,7,20)
   var cube2 = new THREE.Mesh( geo, material);
   cube2.name="My Box Bulding";
   cube2.position.x =33;
   cube2.position.y =-29;
   cube2.position.z = 10
   cube2.rotateZ(Math.PI/2.8)
   scene.add(cube2)
   myObjects.push(cube2)
   interactiveObjects.push(cube2)


   
   
    
    
    
    
  

}


function changeCameraPosition(){
    var posx = document.getElementById("cameraX");
    var posy = document.getElementById("cameraY");
    var posz = document.getElementById("cameraZ");
    var lax = +document.getElementById("lookatX").value;
    var lay = +document.getElementById("lookatY").value;
    var laz = +document.getElementById("lookatZ").value;
    camera.position.x= +posx.value;
    camera.position.y= +posy.value;
    camera.position.z= +posz.value;

    camera.lookAt( new THREE.Vector3( lax, lay, laz ) );
    controls.target = new THREE.Vector3( lax, lay, laz ) ;


    camera.up = new THREE.Vector3(0,0,1);
   
}

function setObjectsInSelectList(objects){                            //creating the option in the selectlist:
    
    var selectList = document.getElementById('objectSelectList');
    
    
    while ( selectList.length>0){
        selectList.remove(0);
        
    }
    

    for (let i = 0; i< objects.length; i++){
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = objects[i].name;
        selectList.appendChild(opt);
    }
    selectList.selectedIndex = -1;
    selectedObjectIndex = selectList.selectedIndex
    document.getElementById("ObjectData").style.display ="none";
}


function changeSelectedObjectByClick(){
    
    document.getElementById("objectSelectList").selectedIndex = selectedObjectIndex;
    changeSelectedObject();
   
  
   

   
}
function changeSelectedObject(){

    
    selectedObjectIndex = document.getElementById("objectSelectList").value;
    var selectedObject = myObjects[selectedObjectIndex]
    
    
    

    if (unselectableObjects.indexOf(selectedObject)==-1){
     document.getElementById("objectSelectable").checked = true;
    }
 
    else {
     document.getElementById("objectSelectable").checked = false;
    }
    
    
   
   document.getElementById("objectR").value =selectedObject.material.color.r*255;
   document.getElementById("objectG").value =selectedObject.material.color.g*255;
   document.getElementById("objectB").value =selectedObject.material.color.b*255;
   document.getElementById("objectX").value=selectedObject.position.x;
   document.getElementById("objectY").value=selectedObject.position.y;
   document.getElementById("objectZ").value=selectedObject.position.z;




    console.log("Selected object index changed to:"+selectedObjectIndex+', the object name is: "'+myObjects[selectedObjectIndex].name+'".')
    document.getElementById("ObjectData").style.display ="block";

}


function changeObjectData(){
    console.log('changing object data')
    var x = +document.getElementById("objectX").value;
    var y = +document.getElementById("objectY").value;
    var z = +document.getElementById("objectZ").value;
    var r = document.getElementById("objectR").value;
    var g = document.getElementById("objectG").value;
    var b = document.getElementById("objectB").value;

    
    myObjects[selectedObjectIndex].material.color = new THREE.Color(r/255,g/255,b/255);
    myObjects[selectedObjectIndex].position.set(x,y,z);

    //unselectable changing:
    if ((document.getElementById("objectSelectable").checked == false) && (unselectableObjects.indexOf(myObjects[selectedObjectIndex])==-1)){
       unselectableObjects.push(myObjects[selectedObjectIndex])
       }
    
       if ((document.getElementById("objectSelectable").checked == true) && (unselectableObjects.indexOf(myObjects[selectedObjectIndex])>-1)){
        unselectableObjects.splice(unselectableObjects.indexOf(myObjects[selectedObjectIndex]),1);
        }
       
        console.log(unselectableObjects)

    
}

function testFunc(x,y){
    console.log(document.documentElement.clientHeight)
   

}

function onLoadBody(){
    
    
    document.getElementById("cameraX").value = camera.position.x;
    document.getElementById("cameraY").value = camera.position.y;
    document.getElementById("cameraZ").value = camera.position.z;
    
    document.getElementById("lookatX").value = controls.target.x;
   document.getElementById("lookatY").value = controls.target.y;
  document.getElementById("lookatZ").value = controls.target.z;
    
}

function loadingOBJObject(path,name){
    console.log('starting function loadingOBJ')
    // instantiate a loader
    var loader = new THREE.OBJLoader();

    // load a resource
    loader.load(
        // resource URL
        path,
        // called when resource is loaded
        function ( object ) {
           
            var newObject = object;
            newObject.material = new THREE.MeshPhongMaterial( {color: 0xc5c5c7, side: THREE.DoubleSide} );
           
            for(let i=0; i < newObject.children.length; i++){
              
                newObject.children[i].material = newObject.material;
            }
           
            newObject.name=name;
            newObject.position.z=0;
          
            
            //spinning:
            //newObject.rotateX(Math.PI/2)
            
            scene.add(newObject)
             //move to mathias zero point! : 55.45933228, -20.875329,  =~ -49,75
            newObject.position.x=-49;
            newObject.position.y=75;
            myObjects.push(newObject)
            unselectableObjects.push(newObject);
            setObjectsInSelectList(myObjects)
            
           
            
            
            

        },
        // called when loading is in progresses
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );
}


function onMouseMove( event ) {
    
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX /( window.innerWidth/1)  ) * 2 - 1;
	mouse.y = - ( event.clientY / (window.innerHeight/1) ) * 2 + 1;

}

function onMouseClick( event) {
    
 
    
    var intersects = raycaster.intersectObjects(scene.children,true);
    if (intersects.length>0){
        if (intersects[0].object.parent != scene) {
            intersects[0].object = intersects[0].object.parent
        }
       
        if (intersects.length>0 && unselectableObjects.indexOf(intersects[0].object)==-1)
        {
           selectedObjectIndex = myObjects.indexOf(intersects[0].object);
           
           intersects[0].object.material.color = lastColor;
          
           changeSelectedObjectByClick();
        }
    }
  
   

}

function render() {
 
	
    raycaster.setFromCamera( mouse, camera );
   
	
    var intersects = raycaster.intersectObjects( scene.children,true );
   
    
    

    var hoverColor = new THREE.Color( 0,0,1 );

   
   

	if ( (intersects.length > 0) && ( (unselectableObjects.indexOf(intersects[0].object)==-1 ) && (unselectableObjects.indexOf(intersects[0].object.parent)==-1 ) ) ) {
         /*the next "if" statment is because we load objects with groups (childrens..) hence, we need to change the intersectred 
    object to be the group and not the objects. but we dont want to do it to all objects (only the one who are children of objects).
     the "gloabal-without parent objects" (those in myObjects) actually have parent, and its the scene object.
     anyway in this way we can make sure that when a child of an object is intersected, it will act as if it choose the all group  ( hisparent object) */

        if (intersects[0].object.parent != scene) {         
    
            intersects[0].object = intersects[0].object.parent
            
        }
					if ( INTERSECTED != intersects[ 0 ].object ) {
                        
						if ( INTERSECTED ) INTERSECTED.material.color = lastColor;
						INTERSECTED = intersects[ 0 ].object
                        lastColor = INTERSECTED.material.color;
						INTERSECTED.material.color = hoverColor;
                    }
                    
				} else {
                    
					if ( INTERSECTED ) INTERSECTED.material.color = lastColor ;
                    INTERSECTED = null;
                   
				}

	renderer.render( scene, camera );

}


function animate() {
    requestAnimationFrame( animate );
    updateLabels();
    controls.update();
    render();
}

function convertCoordinates(realX,realY){
   
    var coordinatesTerrainLength = 0.72; //cordinate distance unit
    var terrainLength = 2592; //threejs distance unit
    var coordinatesOrigin = {x:55.18, y: -20.82}
    
    var newX = (realX - coordinatesOrigin.x) * ( terrainLength / coordinatesTerrainLength );
    var newY = (realY - coordinatesOrigin.y) * ( terrainLength / coordinatesTerrainLength );
    console.log('x:'+newX+'y:'+newY)
    return {x:newX,y:newY}



}

function toScreenPosition(obj, camera){              //calc 2d coordinate of object

    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return { 
        x: vector.x,
        y: vector.y
    };

}

function updateLabels(){

    for( let i=0; i< interactiveObjects.length; i++){

        var proj = toScreenPosition(myObjects[i], camera);
        
        document.getElementById("interactiveLabel"+i).style.left=proj.x+'px';
        document.getElementById("interactiveLabel"+i).style.top=proj.y+'px';
       

    }
   
}


// for interactive items:
function hoverInteractiveItem(event,hovered){
    if (hovered === 'label'){
        event.target.classList.add('sd-labeltext-active');
        document.getElementById('button-'+event.target.id).classList.add('sd-interactive-button-active');
    }

    if(hovered === 'button'){
        
        event.target.classList.add('sd-interactive-button-active');
        document.getElementById(event.target.id.slice(7)).classList.add('sd-labeltext-active');
    }
   
}

function unhoverInteractiveItem(event,hovered){
    if (hovered === 'label'){
        event.target.classList.remove('sd-labeltext-active');
        document.getElementById('button-'+event.target.id).classList.remove('sd-interactive-button-active');
    }

    if(hovered === 'button'){
        
        event.target.classList.remove('sd-interactive-button-active');
        document.getElementById(event.target.id.slice(7)).classList.remove('sd-labeltext-active');
    }
   
}


function loadInteractiveItem(id) {

    document.getElementById("letsDesign"+0).style.display="none";
    document.getElementById("letsDesign"+1).style.display="none";
    document.getElementById("letsDesign"+id).style.display="block";
}


//
