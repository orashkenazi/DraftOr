// -20.884850, 55.467112 = 0 point of our world. (in coordinates)

/*some points (threejs meters)

piton des neige: 1500, - 23700, 4500;
RUN airpot: 4700, -598, 0
saint marie : 8409, -1712, ?
saint suzane: 14029 , -3071, ?
*/
var buildingsref = 1;
var airpicref = null;
var nonInteractiveLabels = [];
var altitudes =[];  //help to calc altitude when clicking on minimap to know what altitude to fly to... (because mini map choose only x,y)
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 70000 );

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),INTERSECTED;
var theta=0, radius =100;

var renderer = new THREE.WebGLRenderer();
renderer.domElement.id = 'renderer';

renderer.setSize( window.innerWidth, window.innerHeight);

document.body.appendChild( renderer.domElement );

camera.position.set( -700, 1300 , 860 );

camera.up = new THREE.Vector3(0,0,1);
//camera.lookAt( new THREE.Vector3( -650  , -500 , 300 ) );

//add Orbit Controls
var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target = new THREE.Vector3( -650  , -500 , 300)
updatePositionMark(controls.target);
controls.minPolarAngle=0.1*Math.PI/2;
controls.maxPolarAngle=0.98*Math.PI/2;
controls.autoRotateSpeed = 0.2 ;
controls.autoRotate = true;


var inFlight = false; // determine if currently flying
var imgmat =  null; //used in addGround();
var myObjects = []; //all objects to be controled with admin controls need to be pushed here
var unselectableObjects = [];   //objects that would not be able to select by click / have hover effect when mouse on them 
let interactiveObjects = [] //all objects that should be interactive (have label and menu button and extra features).
var hoverColor = new THREE.Color( 0x4C43D5 );
var lastColor;                          //used for the selecting
let selectedObjectIndex;                  //the current selected object in the lsit


//photos
let photos = [];
let spherePhotos = [];

photos.push({name:'photo1', position: new THREE.Vector3(100,100,0), url:'./images/pano.jpg'});
spherePhotos.push({name:'sphere photo1', position: new THREE.Vector3(200,100,0), url:'./images/pano.jpg'});







addLights();

createImagePlane();
createTerrainMaterial();






loadingOBJObject('./models/saint-denis/prunel_bati.obj','buildings',{offset:{x:0,y:0,z:-3},unselectable:true,hidden:true, buildref:true});
//loadingOBJObject('./models/saint-denis/prunel_ground.obj','ground');

loadingOBJObject('./models/saint-denis/prunel_roof.obj','roof',{offset:{x:0,y:0,z:-3},unselectable:true,hidden:true});
loadingOBJObject('./models/saint-denis/prunel_streets.obj','street',{offset:{x:0,y:0,z:-2.5},unselectable:true,hidden:true});
loadingOBJObject('./models/saint-denis/prunel_mainstreet.obj','Rue Marechal Leclerc',{offset:{x:0,y:0,z:-2}, offsetChildren: {x:550,y:-194,z:-4}, interactive:true, color:new THREE.Color( 0x30D97D)});



loadingOBJObject('./models/saint-denis/prunel_areashape_1.obj','Zone 1',{color: new THREE.Color(0xff0000), interactive:true,offset:{x:2,y:2,z:-3}, offsetChildren:{x:880,y:-485,z:-20},transparent:true})

loadingOBJObject('./models/saint-denis/prunel_areashape_2.obj','Zone 2',{color: new THREE.Color(0x00ff00), interactive:true, offset:{x:0,y:0,z:-3}, offsetChildren:{x:189,y:-70,z:-25},transparent:true});

loadingOBJObject('./models/saint-denis/prunel_areashape_3.obj','Zone 3',{color: new THREE.Color(0xFFDB03), interactive:true,offset:{x:0,y:0,z:-3}, offsetChildren:{x:359,y:495,z:-25},transparent:true});



//for demo, adding particles

var material = new THREE.LineBasicMaterial({color: 0x0000ff });
		//First create the line that we want to animate the particles along
		var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(-1050, 487, 2.5));
		geometry.vertices.push(new THREE.Vector3(-100, 15, 2.5));
	
	
		var line1 = new THREE.Line(geometry, material);
	    

        var geometry = new THREE.Geometry();
		geometry.vertices.push(new THREE.Vector3(-1048, 490, 2.5));
		geometry.vertices.push(new THREE.Vector3(-98, 18, 2.5));
	
	
		var line2 = new THREE.Line(geometry, material);
        
        
        
	
	
		//next create a set of about 30 animation points along the line
        var linePoints1 = createLinePoints(line1.geometry.vertices[0], line1.geometry.vertices[1],1000);
        var linePoints2 = createLinePoints(line2.geometry.vertices[1], line2.geometry.vertices[0],1000);
        var particleGeometry1 = new THREE.Geometry();
        var particleGeometry2 = new THREE.Geometry();
		//add particles to scene
		
	
			
		//create particles
		var numParticles = 25;
		for(let i=0; i< numParticles; i++){
			
			let index = Math.floor(linePoints1.length*i/numParticles);
			let particle = linePoints1[index];
			particle.index = index;
            particleGeometry1.vertices.push( particle );
            

            index = Math.floor(linePoints2.length*i/numParticles);
			particle = linePoints2[index];
			particle.index = index;
			particleGeometry2.vertices.push( particle );
		}
			


		//set particle material
		var pMaterial1 = new THREE.ParticleBasicMaterial({
			color: 0xFF0000,
            size: 15,
            map: THREE.ImageUtils.loadTexture(
                "./images/particle.png"
              ),
			blending: THREE.AdditiveBlending,
			transparent: true
        });
        
        var pMaterial2 = new THREE.ParticleBasicMaterial({
			color: 0xFF0000,
            size: 15,
            map: THREE.ImageUtils.loadTexture(
                "./images/particle.png"
              ),
			blending: THREE.AdditiveBlending,
			transparent: true
		});
	
	
        var particles1 = new THREE.ParticleSystem( particleGeometry1, pMaterial1 );
        var particles2 = new THREE.ParticleSystem( particleGeometry2, pMaterial2 );

        particles1.sortParticles = true;
        particles2.sortParticles = true;
        particles1.dynamic = true;
        particles2.dynamic = true;
        scene.add(particles1);
        scene.add(particles2);
	
		function UpdateParticles(){

			for(let n=0; n<particles1.geometry.vertices.length; n++){
				let i;
				let particle = particles1.geometry.vertices[n];
				
				if (particle.index >= linePoints1.length) {
					
					particle.index = 0;
					particle = linePoints1[0];
				}
				else {	
					
					
					let i=particle.index+1;
					particle = linePoints1[particle.index];
					particle.index = i;
					
					particles1.geometry.vertices[n] = particle;
				
				}
				particles1.geometry.verticesNeedUpdate = true;
                }
                
                for(let n=0; n<particles2.geometry.vertices.length; n++){
                    let i;
                    let particle = particles2.geometry.vertices[n];
                    
                    if (particle.index >= linePoints2.length) {
                        
                        particle.index = 0;
                        particle = linePoints2[0];
                    }
                    else {	
                        
                        
                        let i=particle.index+1;
                        particle = linePoints2[particle.index];
                        particle.index = i;
                        
                        particles2.geometry.vertices[n] = particle;
                    
                    }
                    particles2.geometry.verticesNeedUpdate = true;
                    }
			
		};
	

		
		function createLinePoints(start,end,N){
			let linePoints = [];
			for (let i=0; i<N; i++){
				let point = new THREE.Vector3();
				point = start.clone().lerp(end,i/N)
				linePoints.push(point);
			}

			return linePoints;
			
		}



window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseClick, false );





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
       
         //myObjects.push(plane);
         airpicref = plane;
         unselectableObjects.push(plane);
         scene.add(plane);
         console.log('Air Picture added')

         setObjectsInSelectList(myObjects)

        
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
 

function getSeaLevelData(){
    var img = document.getElementById("sealevel-image");
   
    var canvas = document.getElementById("canvas2");
    
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
    //go to zero point => -29.84[km] in X, +7.21[km] in Y
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



    terrain = getTerrainPixelData();  
    sealevel = getSeaLevelData();
    

    // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
    // there's 10 segments, there's 11 vertices, and so forth. 
    // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
    // "skewing the landscape" then..
  
    // to check uncomment the next line, numbers should be equal
    console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);

    /*rying buffer:
    var bufferGeometry = new THREE.BufferGeometry();
    
   var vertices = [];
    
    for ( var i = 0, j = 0, l = vertices.length; i < terrain.length; i ++, j += 3 ) {
        if(terrain[i] != 0){
        
        y=Math.floor(i/300)
        x=(i - y*300);

        var terrainValue = terrain[i] / 255;
        vertices.push(x *74830 /300);
        vertices.push(y* 80060/300);
        vertices.push(terrainValue *3036 *1.5 );
        }
        
    }
    var buffervertices = new Float32Array();
    var buffervertices = Float32Array.from(vertices)
    console.log(buffervertices)
    bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( buffervertices, 3 ) );
  
   

finish try code*/
   

    for (var i = 0, l = geometry.vertices.length; i < l; i++)
    {   
        var terrainValue = terrain[i] / 255;
        geometry.vertices[i].z = geometry.vertices[i].z + terrainValue *3036 *1.5 ;
        
        if (sealevel[i] == 0){
            geometry.vertices[i].z = -2000;
        }
      
        
         
    }
    
   

 
   
   
  
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
  
    var plane = new THREE.Mesh(geometry,material);
    //var plane2 = new THREE.Mesh(geometry,material2)
    plane.position = new THREE.Vector3(0,0,0);
 
    var q = new THREE.Quaternion();
    q.setFromAxisAngle( new THREE.Vector3(0,0,0), 90 * Math.PI / 180 );
    plane.quaternion.multiplyQuaternions( q, plane.quaternion );

    plane.name="terrain";
   
    plane.position.x=+74830/2 -29840;
    plane.position.y=-80060/2 +7210;
    plane.position.z=-30;
  
    scene.add(plane)
    
    myObjects.push(plane)
    unselectableObjects.push(plane);
    altitudes =JSON.parse(JSON.stringify(plane.geometry.vertices));
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

    var geometry = new THREE.PlaneGeometry(90000, 90000,10,10);
    var material = new THREE.MeshBasicMaterial({
        color: 0x000000
    })
   
    var seaplane = new THREE.Mesh(geometry,material);
    seaplane.position.x=+74830/2 -29840;
    seaplane.position.y=-80060/2 +7210;
    seaplane.position.z=-155;
    unselectableObjects.push(seaplane);
    scene.add(seaplane);

    
  }


  window.addEventListener( 'resize', onWindowResize, false );

  function onWindowResize(){
  
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize( window.innerWidth, window.innerHeight );
      
    if (activePage) activePage.onWindowResize();    
  
  }
 




function initObjects(){
    // building some boxes!
    /*
   var material = new THREE.MeshPhongMaterial( {color: 0xff0000, side: THREE.DoubleSide, transparent:true, opacity:0.5} );
   var geo = new THREE.CubeGeometry (8,8,30)
   var cube = new THREE.Mesh( geo, material);
   cube.name="Zone 1";
   cube.position.x =11;
   cube.position.y =19;
   cube.position.z = 15
   cube.rotateZ(Math.PI/2.8)
   scene.add(cube)
   myObjects.push(cube)
   interactiveObjects.push(cube)


   var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, side: THREE.DoubleSide, transparent:true, opacity:0.5} );
   var geo = new THREE.CubeGeometry (7,7,20)
   var cube2 = new THREE.Mesh( geo, material);
   cube2.name="Zone 2";
   cube2.position.x =33;
   cube2.position.y =-29;
   cube2.position.z = 10
   cube2.rotateZ(Math.PI/2.8)
   scene.add(cube2)
   myObjects.push(cube2)
   interactiveObjects.push(cube2)

   
   var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, side: THREE.DoubleSide, transparent:true, opacity:0.5} );
   var geo = new THREE.CubeGeometry (100,100,60)
   var cube2 = new THREE.Mesh( geo, material);
   cube2.name="Zone 3";
   cube2.position.x =330;
   cube2.position.y =-29;
   cube2.position.z = 10
   cube2.rotateZ(Math.PI/2.8)
   scene.add(cube2)
   myObjects.push(cube2)
   interactiveObjects.push(cube2) */


   var material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (1,1,1    )
   var place = new THREE.Mesh( geo, material);
   place.name="Piton des Neiges";
   place.position.x =1500;
   place.position.y =-23700;
   place.position.z = 4500;
   
   scene.add(place)
   myObjects.push(place)
   interactiveObjects.push(place)

   var material = new THREE.MeshPhongMaterial( {color: 0x000000, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (1,1,1)
   var place = new THREE.Mesh( geo, material);
   place.name="Roland Garros Airport";
   place.position.x =4700;
   place.position.y =-598;
   place.position.z = 0;
   
   scene.add(place)
   //myObjects.push(place)
   nonInteractiveLabels.push(place)

   var material = new THREE.MeshPhongMaterial( {color: 0x000000, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (1,1,1)
   var place = new THREE.Mesh( geo, material);
   place.name="Saint Marie";
   place.position.x =8409;
   place.position.y =-1712;
   place.position.z = 0;
   
   scene.add(place)
   //myObjects.push(place)
   nonInteractiveLabels.push(place)

   var material = new THREE.MeshPhongMaterial( {color: 0x000000, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (1,1,1)
   var place = new THREE.Mesh( geo, material);
   place.name="Saint Suzane";
   place.position.x =14029;
   place.position.y =-3071;
   place.position.z = 0;
   
   scene.add(place)
   //myObjects.push(place)
   nonInteractiveLabels.push(place)

/*
   piton des neige: 1500, - 23700, 4500;
   RUN airpot: 4700, -598, 0
   saint marie : 8409, -1712, ?
   saint suzane: 14029 , -3071, ?
   */

   
   
    
    
    
    
  

}


function changeCameraPosition(){
    controls.autoRotateSpeed = 0.2 * (+document.getElementById("speedControl").value);
    console.log( controls.autoRotateSpeed)
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
    
}


function changeSelectedObjectByClick(){
    
    document.getElementById("objectSelectList").selectedIndex = selectedObjectIndex;
    changeSelectedObject();
   
  
   

   
}
function changeSelectedObject(){

    document.getElementById("objectData").style.display="block"
    selectedObjectIndex = document.getElementById("objectSelectList").value;
    var selectedObject = myObjects[selectedObjectIndex]
    
    
    

    if (unselectableObjects.indexOf(selectedObject)==-1){
     document.getElementById("objectSelectable").checked = true;
 

    }
 
    else {
     document.getElementById("objectSelectable").checked = false;
 
    }

    
    
    
   
  
   document.getElementById("objectX").value=selectedObject.position.x;
   document.getElementById("objectY").value=selectedObject.position.y;
   document.getElementById("objectZ").value=selectedObject.position.z;
   document.getElementById("colorInput").jscolor.fromRGB(selectedObject.material.color.r*255,selectedObject.material.color.g*255,selectedObject.material.color.b*255)
  document.getElementById("hideObject").checked =  !myObjects[selectedObjectIndex].visible 



    console.log("Selected object index changed to:"+selectedObjectIndex+', the object name is: "'+myObjects[selectedObjectIndex].name+'".')
    

}


function changeObjectData(){
    console.log('changing object data')
    var x = +document.getElementById("objectX").value;
    var y = +document.getElementById("objectY").value;
    var z = +document.getElementById("objectZ").value;
    var colorString = document.getElementById("colorInput").jscolor.toRGBString();
    
    
    
    myObjects[selectedObjectIndex].material.color = new THREE.Color(colorString);
    myObjects[selectedObjectIndex].position.set(x,y,z);
    myObjects[selectedObjectIndex].visible = !document.getElementById("hideObject").checked

    //unselectable changing:
    if ((document.getElementById("objectSelectable").checked == false) && (unselectableObjects.indexOf(myObjects[selectedObjectIndex])==-1)){
       unselectableObjects.push(myObjects[selectedObjectIndex])
       }
    
       if ((document.getElementById("objectSelectable").checked == true) && (unselectableObjects.indexOf(myObjects[selectedObjectIndex])>-1)){
        unselectableObjects.splice(unselectableObjects.indexOf(myObjects[selectedObjectIndex]),1);
        }
       
        

    
}

function testFunc(x,y,z){
    
  

}

function onLoadBody(){
    
    console.log('onLoadBody is running')
    initObjects();
    setObjectsInSelectList(myObjects)
    createInteractiveGUI();
    document.getElementById("loading").style.display='none';
    animate();
    
    document.getElementById("cameraX").value = camera.position.x;
    document.getElementById("cameraY").value = camera.position.y;
    document.getElementById("cameraZ").value = camera.position.z;
    
    document.getElementById("lookatX").value = controls.target.x;
    document.getElementById("lookatY").value = controls.target.y;
    document.getElementById("lookatZ").value = controls.target.z;



  
  
    
}

function loadingOBJObject(path,name,options){
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
           
          
            
            //spinning:
            //newObject.rotateX(Math.PI/2)
            
            scene.add(newObject)
             //move to mathias zero point! : 55.45933228, -20.875329,  =~ -49,75
            newObject.position.x=-49;
            newObject.position.y=75;

            //ading offset
            console.log(newObject)
            if(options.offset){
                               
                newObject.position.x += options.offset.x;
                newObject.position.y += options.offset.y;
                newObject.position.z += options.offset.z;
            }

            if (options.offsetChildren){
                for (let index=0; index< newObject.children.length ; index ++){
                    newObject.children[index].position.set( options.offsetChildren.x,options.offsetChildren.y,options.offsetChildren.z ) ;
                }
                
                newObject.position.x -= options.offsetChildren.x;
                newObject.position.y -= options.offsetChildren.y;
                newObject.position.z -= options.offsetChildren.z;
            }

            if (options.color) {
                newObject.material.color = options.color;
            }

            if (options.interactive){
                interactiveObjects.push(newObject)
            }
            
            if (options.unselectable){
                unselectableObjects.push(newObject);
            }

            if(options.transparent){
                newObject.material.transparent=true;
                newObject.material.opacity=0.5;
            }
          
            if (options.hidden!=true){
                myObjects.push(newObject)  
            }
            
            if(options.buildref){         //just for demo
                buildingsref = newObject;
               
            }
          
           
            
            console.log(newObject)
            
           
            
            
            

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
    
    if(event.path[0].id!='renderer'){
        return;
    }
    
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
           openInteractiveByClick(intersects[0].object);
        }
    }
  
   

}

function render() {
 
    UpdateParticles();  
    
    raycaster.setFromCamera( mouse, camera );
   
	
    var intersects = raycaster.intersectObjects( scene.children,true );
   
  
    

    

   
   

	if ( (intersects.length > 0) && ( (unselectableObjects.indexOf(intersects[0].object)==-1 ) && (unselectableObjects.indexOf(intersects[0].object.parent)==-1 ) ) ) {
         /*the next "if" statment is because we load objects with groups (childrens..) hence, we need to change the intersectred 
    object to be the group and not the objects. but we dont want to do it to all objects (only the one who are children of objects).
     the "gloabal-without parent objects" (those in myObjects) actually have parent, and its the scene object.
     anyway in this way we can make sure that when a child of an object is intersected, it will act as if it choose the all group  ( hisparent object) */

        if (intersects[0].object.parent != scene) {         
    
            intersects[0].object = intersects[0].object.parent
            
        }
					if ( INTERSECTED != intersects[ 0 ].object ) {
                        
                        if ( INTERSECTED ) { INTERSECTED.material.color = lastColor;hoverLabelsFake(INTERSECTED,false);}
                        
						INTERSECTED = intersects[ 0 ].object
                        lastColor = INTERSECTED.material.color;
                        INTERSECTED.material.color = hoverColor;
                        hoverLabelsFake(INTERSECTED,true);
                    }
                    
				} else {
                    
					if ( INTERSECTED ) {INTERSECTED.material.color = lastColor ; hoverLabelsFake(INTERSECTED,false); } 
                    INTERSECTED = null;
                    
                   
				}

	renderer.render( scene, camera );

}


function animate() {
    requestAnimationFrame( animate );
    
    controls.update();
    render();
    updateLabels();
    
    updatePositionMark(controls.target)
}

function convertCoordinates(lon2,lat2){
   // -20.884850, 55.467112 = 0 point of our world. (in coordinates)
    var o = {x:55.467112, y:-20.884850};
    lat1 = o.y;
    lon1 = o.x;
    
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;

    var dX = dLon * R *Math.sin((90-lat1) * Math.PI / 180) * 1000;
    var dY = dLat * R * 1000;

    return {x:dX, y:dY}
   
    
  




}


function createInteractiveGUI(){
    console.log("initializing Interactive buttons, labels, and pages")
    for(let i=0; i< interactiveObjects.length; i++){
        //menu items:
        var menu = document.getElementById("interactive-items-menu");

        var btn = document.createElement("button");
        btn.id="button-label"+i;
        btn.classList.add("sd-interactive-button");
        btn.addEventListener("click",function() {loadInteractiveItem(i)},false)
        btn.addEventListener("mouseenter",function(){hoverInteractiveItem(event,'button')},false)
        btn.addEventListener("mouseout",function(){unhoverInteractiveItem(event,'button')},false)
        
        btn.appendChild(document.createTextNode(interactiveObjects[i].name))
        menu.appendChild(btn);

        //labels:
        

        var labelparent = document.createElement("div");
        labelparent.id="interactiveLabel"+i;
        labelparent.style="position: absolute; top:0px; left:0px;z-index:+3; pointer-events:none;";

        var label = document.createElement("div"); //creating tag
        label.id="label"+i;
        label.classList.add("sd-labeltext");
        label.addEventListener("click",function() {loadInteractiveItem(i)},false)
        label.addEventListener("mouseenter",function(){hoverInteractiveItem(event,'label')},false)
        label.addEventListener("mouseout",function(){unhoverInteractiveItem(event,'label')},false)
        label.appendChild(document.createTextNode(interactiveObjects[i].name))

        labelparent.appendChild(label); //adding tag

        var line = document.createElement("div"); //creating and adding line
        line.classList.add("sd-labelline");
        labelparent.appendChild(line); 

        document.body.appendChild(labelparent);


        //pages:

        var obj = interactiveObjects[i];
       

        //creating container
        var container = document.createElement("div");
        container.id = "interactivePage_"+i;
        container.classList.add("interactivePage-container");
        //container.style="display:none";
        document.body.appendChild(container);
        
        //creating controls
        
        var controls = document.createElement("div");
        controls.classList.add("interactivePage-controls");
        
        container.appendChild(controls);
       
        var backBtn = document.createElement("button");
        backBtn.classList.add('sd-control-button');
        backBtn.addEventListener('click',function(){closeInteractivePageCanvas(i)},false);
        backBtn.innerHTML = "X"
        controls.appendChild(backBtn);

        //creating header
        var header = document.createElement("div");
        header.classList.add("interactivePage-header");
        header.innerHTML = obj.name;
        container.appendChild(header);


        //creating content
        var content = document.createElement("div");
        content.classList.add("interactivePage-content");
        container.appendChild(content);

        //creating grid to content
        var grid = document.createElement("div");
        grid.classList.add("interactivePage-content-grid");
        content.appendChild(grid);

        //creating text area
        var text = document.createElement("div");
        text.classList.add("interactivePage-content-text");
        text.innerHTML = "I AM TEXT";
        grid.appendChild(text);

         //creating canvas area
         var canvas = document.createElement("div");
         canvas.id = "canvasarea_"+i;
         canvas.classList.add("interactivePage-content-canvas");       
         grid.appendChild(canvas);

         
         

          //creating footer
        var footer = document.createElement("div");
        footer.classList.add("interactivePage-footer");
       
        var btn = document.createElement("button");
        btn.innerHTML = "CLICK ME";
        btn.classList.add("sd-button");
        footer.appendChild(btn);
        container.appendChild(footer)
    }

    

    

    //now just labels that are noninteratice:
    console.log("initializing non-interactive labels");
    for(let i=0; i< nonInteractiveLabels.length; i++){
      
        var labelparent = document.createElement("div");
        labelparent.id="nonInteractiveLabel"+i;
        labelparent.style="position: absolute; top:0px; left:0px;z-index:+3 ";
    
        var label = document.createElement("div"); //creating tag
        label.id="ni_label"+i;
        label.classList.add("sd-labeltext");
        label.style.cursor="default";
        
        label.appendChild(document.createTextNode(nonInteractiveLabels[i].name))
    
        labelparent.appendChild(label); //adding tag
    
        var line = document.createElement("div"); //creating and adding line
        line.classList.add("sd-labelline");
        labelparent.appendChild(line); 
    
        document.body.appendChild(labelparent);
    }

    //photos:
    for(let i=0; i< photos.length; i++){
        var container = document.createElement("div");
        container.id="photo_"+i;
        container.style="position: absolute; top:10px: right:10px; z-index:3; cursor:pointer;"
        container.classList.add("photoLinkButton")
        container.addEventListener("click",function() {loadPhoto(i)},false)

        var span = document.createElement("span");
        span.classList.add("glyphicon");
        span.classList.add("glyphicon-camera");
        container.appendChild(span);

        document.body.appendChild(container);
    }

    for(let i=0; i< spherePhotos.length; i++){
        var container = document.createElement("div");
        container.id="spherePhoto_"+i;
        container.style="position: absolute; top:10px: right:10px; z-index:3; cursor:pointer;"
        container.classList.add("photoLinkButton")
        container.addEventListener("click",function() {loadSpherePhoto(i)},false)

        var span = document.createElement("span");
        span.classList.add("glyphicon");
        span.classList.add("glyphicon-eye-open");
        container.appendChild(span);
        span.clic

        document.body.appendChild(container);
    }
        
       
    
    
   
}


function toScreenPosition(obj, camera){              //calc 2d coordinate of object

    var vector = new THREE.Vector3();

    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;
   
   // obj.updateMatrixWorld();
   // vector.setFromMatrixPosition(obj.matrixWorld);
   vector.x = + obj.position.x;
   vector.y = + obj.position.y;
   vector.z = + obj.position.z;
    vector.project(camera);
    
  
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    
    if(vector.z>1){
      return {
                x:-100,
                y:-100
    };
    }
    
    return { 
        x: vector.x,
        y: vector.y
    };

}

function updateLabels(){
    
    for( let i=0; i< interactiveObjects.length; i++){

        var proj = toScreenPosition(interactiveObjects[i], camera);
        
        document.getElementById("interactiveLabel"+i).style.left=proj.x+'px';
        document.getElementById("interactiveLabel"+i).style.top=proj.y+'px';
        if (i==1) {
          
        }

    }

    for( let i=0; i< nonInteractiveLabels.length; i++){

        var proj = toScreenPosition(nonInteractiveLabels[i], camera);
        
        document.getElementById("nonInteractiveLabel"+i).style.left=proj.x+'px';
        document.getElementById("nonInteractiveLabel"+i).style.top=proj.y+'px';
        
     

    }

    for( let i=0; i< photos.length; i++){

        var proj = toScreenPosition(photos[i], camera);
        
        document.getElementById("photo_"+i).style.left=proj.x+'px';
        document.getElementById("photo_"+i).style.top=proj.y+'px';
        
     

    }

    for( let i=0; i< spherePhotos.length; i++){

        var proj = toScreenPosition(spherePhotos[i], camera);
        
        document.getElementById("spherePhoto_"+i).style.left=proj.x+'px';
        document.getElementById("spherePhoto_"+i).style.top=proj.y+'px';
        
     

    }

   
   
}


// for interactive items:
function hoverInteractiveItem(event,hovered){
    if (hovered === 'label'){
        
        event.target.classList.add('sd-labeltext-active');
        document.getElementById('button-'+event.target.id).classList.add('sd-interactive-button-active');

        var index = event.target.id.slice(5);
        lastcolor = interactiveObjects[index].material.color;
        interactiveObjects[index].material.color = hoverColor;
    }

    if(hovered === 'button'){
       
        event.target.classList.add('sd-interactive-button-active');
        document.getElementById(event.target.id.slice(7)).classList.add('sd-labeltext-active');
        
        var index = event.target.id.slice(12);
        
        lastcolor=interactiveObjects[index].material.color;
        interactiveObjects[index].material.color = hoverColor;
    }
   
}

function unhoverInteractiveItem(event,hovered){
    if (hovered === 'label'){
        event.target.classList.remove('sd-labeltext-active');
        document.getElementById('button-'+event.target.id).classList.remove('sd-interactive-button-active');

        var index = event.target.id.slice(5);
        interactiveObjects[index].material.color = lastcolor;
    }

    if(hovered === 'button'){
        
        event.target.classList.remove('sd-interactive-button-active');
        document.getElementById(event.target.id.slice(7)).classList.remove('sd-labeltext-active');
        
        var index = event.target.id.slice(12);
        interactiveObjects[index].material.color = lastcolor;
    }
   
}

function loadPhoto(i) {
    document.getElementById("photo").style.display = 'block';
    var img = document.getElementById("photo_img");
    img.src =  photos[i].url;
    console.log(img)
    img.style.display = 'block';
    document.getElementById("photo_viewer").style.display = 'none';

    
}

function loadSpherePhoto(i) {
    document.getElementById("photo").style.display = 'block';
    document.getElementById("photo_img").style.display = 'none';
    
    var div = document.getElementById('photo_viewer');
    div.style.display = 'block';
    var PSV = new PhotoSphereViewer({
            panorama: './images/pano.jpg',
            container: div,
            navbar: true,
            navbar_style: {
                backgroundColor: 'rgba(58, 67, 77, 0.7)'
            },
        });
}


function loadInteractiveItem(id) {
    
    for(let i=0; i < interactiveObjects.length; i++){
       
        document.getElementById("interactivePage_"+i).style.left="100%";
  
        
    }
    dx=camera.position.x-interactiveObjects[id].position.x;
    dy=camera.position.y-interactiveObjects[id].position.y;
    dl=Math.sqrt(dx*dx+dy*dy)
    console.log(dl)
    
    
    flyTo(interactiveObjects[id].position,0.1+dl/10000,dl/40000,1+dl/5000).then( ()=>{
        setTimeout(()=>{ 
            loadInteractivePageCanvas(id);

        },500)
      
    } );

   
}

function flyTo(target,time,zjump,distance){

    
    return new Promise(function(resolve,reject){

        if( inFlight) {
            reject();
            return;
        }

        inFlight=true;
        var T = time; //flight time in seconds;
   

   
        t = 0;
        var startpoint = {x:0,y:0,z:0};
        startpoint.x = 0 + camera.position.x;
        startpoint.y = 0 + camera.position.y;
        startpoint.z = 0 + camera.position.z;
    
        var starttarget = {x:+controls.target.x,y:+controls.target.y,z:+controls.target.z};
    
        var i = setInterval(function(){
            
            
            camera.position.x= startpoint.x +(target.x-10-startpoint.x)*Math.sin((Math.PI*1/2)*(t/T)) ;
            camera.position.y=startpoint.y +(target.y+200*distance-startpoint.y)*Math.sin((Math.PI*1/2)*(t/T)) ;
            camera.position.z=startpoint.z +(target.z+100*distance-startpoint.z)*Math.sin((Math.PI*1/2)*(t/T)) + 400*(1-t*(t-T))*zjump;
           
           
            
            camera.lookAt( new THREE.Vector3( starttarget.x+(target.x-starttarget.x)*Math.sin((Math.PI*1/2)*(t/T)), starttarget.y+(target.y-starttarget.y)*Math.sin((Math.PI*1/2)*(t/T)), starttarget.z+(target.z-starttarget.z)*Math.sin((Math.PI*1/2)*(t/T)) ));
            controls.target = new THREE.Vector3( starttarget.x+(target.x-starttarget.x)*Math.sin((Math.PI*1/2)*(t/T)), starttarget.y+(target.y-starttarget.y)*Math.sin((Math.PI*1/2)*(t/T)), starttarget.z+(target.z-starttarget.z)*Math.sin((Math.PI*1/2)*(t/T)) );
    
            updatePositionMark(controls.target);
            
    
            t += 0.016;
            
            if(t > T) {
                clearInterval(i);
                console.log('position:',camera.position,'target:',controls.target)
                inFlight=false;
                resolve();
            }
        }, 16);

    });
   

    
        
    
  
    

    

}

function onMiniMapClick(event){
    //200x200 = minimap res
    //world res = 300x300px , 74830 x 80060 meters
    // x,y on minimap => x/200 y/200 will be numbers between 0 to 1 and will be doubled in the max length of the axis..
    var x,y;
    
    x =  74830*event.layerX/200;
    y = -80060*event.layerY/200;
  
    //now we need to consider that our 0 point in the map is located on:    +29840,-7210; so:

    x+=-29840;
    y+=+7210;

   
    xpixel=Math.floor(event.layerX*300/200)
    ypixel= Math.floor(event.layerY*300/200)
    index = xpixel + 300*(ypixel)

    z=altitudes[index].z
    
    if (z<0){z=0;}
    var dz=Math.abs(z-controls.target.z)/2000;
    console.log('dz=',dz)
    
    
    //and now lets fly to it..
    
    
   flyTo({x:x,y:y,z:z},2,dz,10)
    
}

function updatePositionMark(newposition){
    var x,y;
    x=+newposition.x;
    y=+newposition.y;
    
    x+=29840;
    y-=7210;
    

    x= 200*x/74830;
    y= 200*y/80060;

    
    document.getElementById("positionMark").style.left = -8 + x +'px';
    document.getElementById("positionMark").style.top = -8 - y +'px';
}

function adminOn(){
    if(document.getElementById('adminControls').style.display === 'none'){
        document.getElementById('adminControls').style.display = 'block';
    }
    
    else {
        document.getElementById('adminControls').style.display = 'none';
    }
}

function hideAirMap(){
    airpicref.visible = !document.getElementById("hideAirMapPicture").checked;
}

function topView(){
    
    if (document.getElementById("topView").checked){
        console.log('topview')
        camera.position.x= 0;
        camera.position.y= 0;
        camera.position.z= 900;
        controls.autoRotateSpeed = 0;

        controls.minPolarAngle=0;
        controls.maxPolarAngle=0;
        camera.lookAt( new THREE.Vector3(0,0, 0 ) );
        controls.target = new THREE.Vector3(0,0, 0 ) ;
        updatePositionMark(controls.target);
    }

    else{
        //reseting controls and camera...
        camera.position.set( -700, 1300 , 860 );

        camera.up = new THREE.Vector3(0,0,1);
        //camera.lookAt( new THREE.Vector3( -650  , -500 , 300 ) );

       
        controls.target = new THREE.Vector3( -650  , -500 , 300)
        updatePositionMark(controls.target);
        controls.minPolarAngle=0.1*Math.PI/2;
        controls.maxPolarAngle=0.98*Math.PI/2;
        controls.autoRotateSpeed = 0.2 ;
        controls.autoRotate = true;
    }
    
}

function toggleMenu(){
    menu=document.getElementById("userMenu");
    arrow=document.getElementById('menuArrow');
    if (menu.classList.contains('off')){
        menu.classList.remove('off')
        document.getElementById("toggleMenuButton").style.left="320px"
      
        
        arrow.classList.remove('glyphicon-menu-left')
        arrow.classList.add('glyphicon-menu-right')

    }

    else {
        menu.classList.add('off');
        document.getElementById("toggleMenuButton").style.left="0px"
        
        
        arrow.classList.remove('glyphicon-menu-right')
        arrow.classList.add('glyphicon-menu-left')

    }
}

function hoverLabelsFake(obj,hover){
    
   
    var index = interactiveObjects.indexOf(obj); // if -1, it doesnt exist..
    
    if (index != -1) {              // if it exist, we need to fake hover (crate labels effects...)
       
        if(hover){
            document.getElementById('label'+index).classList.add('sd-labeltext-active');
            document.getElementById('button-label'+index).classList.add('sd-interactive-button-active');
        }

        if(!hover){
            document.getElementById('label'+index).classList.remove('sd-labeltext-active');
            document.getElementById('button-label'+index).classList.remove('sd-interactive-button-active');
        }
       
    }

}

function openInteractiveByClick(obj){
    var index = interactiveObjects.indexOf(obj); // if -1, it doesnt exist..
    
    if (index != -1) {
        if(obj.name==="Zone 1"){
            document.getElementById('letsDesign0').style.display='block';
        }

        if(obj.name==="Zone 2"){
            document.getElementById('letsDesign1').style.display='block';
        }

        if(obj.name==="Zone 3"){
            document.getElementById('letsDesign2').style.display='block';
        }

        if(obj.name==="Rue Marechal Leclerc"){
            document.getElementById('letsDesign3').style.display='block';
        }

        if(obj.name==="Piton des Neiges"){
            document.getElementById('letsDesign4').style.display='block'; 
        }
        
    }
}

function sliderChange(value){
    buildingsref.scale.set(1,1,1+(value-2018)*0.2)
}


//

