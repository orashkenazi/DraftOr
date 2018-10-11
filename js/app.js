
//chrome only support alert:
if(!(navigator.userAgent.indexOf('Chrome') > -1)){ //alret if no chrome!
    console.log('its not chrome browser.')
    let alertdiv = document.createElement("div");
 
    alertdiv.id = 'alertdiv';
    alertdiv.style.alignItems = 'center';
    alertdiv.style.marginTop = '0px';
    alertdiv.style.position = 'absolute';
    alertdiv.style.zIndex = '1005';
    alertdiv.style.top = '40%';
    alertdiv.style.left = '30%';
    alertdiv.style.background = 'rgb(0,0,0,0.8)';
    alertdiv.style.width = '40%';
    alertdiv.style.padding = '30px';
    
    
    
    alertdiv.innerHTML = "<div class='sd-content'><p style='font-size:18px; color:red; font-weight:bold;'>Attention, le navigateur n'est pas Google Chrome: </p><p style='color:white;'>Le siteweb est en cours de developpement et fonctionne uniquement avec Google Chrome.</p></div>";
    document.body.appendChild(alertdiv)
}

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
scene.fog = new THREE.FogExp2( 0xa5aab7, 0.000038 );
let controls;
var labelsRaycaster = new THREE.Raycaster();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),INTERSECTED;
var theta=0, radius =100;
var directionalLight;
let sky, sunSphere;
let water;
let airpictextures = [];
let history_mode=0;
let mountain;



var renderer = new THREE.WebGLRenderer();
renderer.domElement.id = 'renderer';

renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//cameraa setup

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000000000 );

camera.up = new THREE.Vector3(0,0,1);


//defining renderer for interactivepages..
let interactivePageRenderer = new THREE.WebGLRenderer();
interactivePageRenderer.domElement.id = 'page_renderer';




function initControls(){
    camera.position.set(-5349.095,7727.42,4390.05);
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target = new THREE.Vector3( 200.99  , 190.3 , 870.36)
    updatePositionMark(controls.target);
    controls.minPolarAngle=0.1*Math.PI/2;
    controls.maxPolarAngle=0.98*Math.PI/2;
    controls.autoRotateSpeed = 0.2 ;
    controls.autoRotate = false;
}



var inFlight = false; // determine if currently flying
var imgmat =  []; //used in addGround();
var myObjects = []; //all objects to be controled with admin controls need to be pushed here
var unselectableObjects = [];   //objects that would not be able to select by click / have hover effect when mouse on them 
let interactiveObjects = [] //all objects that should be interactive (have label and menu button and extra features).
var hoverColor = new THREE.Color( 0x4C43D5 );
var lastColor;                          //used for the selecting
let selectedObjectIndex;                  //the current selected object in the lsit
let myMovie = new Movie(); //create the movie object




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
    
      var geometry = new THREE.PlaneGeometry(74830, 80060, numSegments, numSegments); 
    
        var material = new THREE.MeshBasicMaterial({color: 0xffffff})
      
        
  
  
  
      terrain = getTerrainPixelData();  
      sealevel = getSeaLevelData();
      
  
      // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
      // there's 10 segments, there's 11 vertices, and so forth. 
      // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
      // "skewing the landscape" then..
    
      // to check uncomment the next line, numbers should be equal
      console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);
  
  
     
  
      for (var i = 0, l = geometry.vertices.length; i < l; i++)
      {   
          var terrainValue = terrain[i] / 255;
          if (terrainValue > 2/255) {                 // we let only height>2 pass... in order to keep it flat in first ~ 30meters.
              geometry.vertices[i].z = geometry.vertices[i].z + (terrainValue *3036) *1.5 ;
          }
         
          
          if (sealevel[i] == 0){
             // geometry.vertices[i].z = -2000;
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
     
      //plane.position.x=+74830/2 -29840;
      //plane.position.y=-80060/2 +7210;
      plane.position.z=-15;
      
      console.log('terrain created');
      terrainMesh = plane;
         
    

  
     
  
      
    }




//photos
let photos = [];
let spherePhotos = [];

photos.push({name:'photo1', position: new THREE.Vector3(100,100,0), url:'./images/pano.jpg'});
spherePhotos.push({name:'sphere photo1', position: new THREE.Vector3(200,100,0), url:'./images/pano.jpg'});

//pois:
let poi = [];
// Set the global configs to synchronous 
$.ajaxSetup({
    async: false
});
$.getJSON("./data/voiep.json", function(result){
   let features = result.features;
    
   for (let i=0; i<100;i++){
        let position = {x:convertCoordinates( features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]).x,y:convertCoordinates( features[i].geometry.coordinates[0], features[i].geometry.coordinates[1]).y}
        if ((position.x < 1310)  && (position.x > -1286)  && (position.y > -917) ){
            poi.push({
                label:features[i].properties.TEX,
                position: new THREE.Vector3(position.x,position.y ,5 ) 
                })
        }
 

       
    }

    console.log(poi)
   
});

// Set the global configs back to asynchronous 
$.ajaxSetup({
    async: true
});




//poi.push({label:'POI A',position:new THREE.Vector3(-490,60,25)})
//poi.push({label:'POI B',position:new THREE.Vector3(-370,-40,10)})
//poi.push({label:'POI C',position:new THREE.Vector3(-500,-13,25)})








createTerrainMaterial();



createImagePlane();

loadObjects();







//vehicles (sheres for now)

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
        
        
        
	
	
		//next create a set of about 1000 animation points along the line
        var linePoints1 = createLinePoints(line1.geometry.vertices[0], line1.geometry.vertices[1],1000);
        var linePoints2 = createLinePoints(line2.geometry.vertices[1], line2.geometry.vertices[0],1000);
        
        var geometry = new THREE.SphereGeometry(1.5,8,8);
        
		//add spheres
        
    
	
			
		//create particles
        var numCars = 25;
        let spheres1 =[];
        let spheres2 = [];
		for(let i=0; i< numCars; i++){
			
			let index1 = Math.floor(linePoints1.length*i/numCars);
			let sphere1 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xFFC105}) );
            sphere1.position.copy(linePoints1[index1]);
            
            scene.add(sphere1)
            sphere1.index = index1;
            spheres1.push( sphere1 );
            

            let index2 = Math.floor(linePoints2.length*i/numCars);
            let sphere2 = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xFFC105}) );
            scene.add(sphere2)
            sphere2.position.copy(linePoints2[index2]);
            sphere2.index = index2;
            spheres2.push( sphere2 );
		}
			


	
        
       
	
	
		function UpdateParticles(){
            
          
			for(let n=0; n<spheres1.length; n++){
				
				let sphere = spheres1[n];
				
				if (sphere.index >= linePoints1.length) {
					
					sphere.index = 0;
					sphere.position = linePoints1[0];
				}
				else {	
					
					
					
					sphere.position.copy(linePoints1[sphere.index]);
                    sphere.index = sphere.index+1;
				
                }
                
                sphere = spheres2[n];
				
				if (sphere.index >= linePoints2.length) {
					
					sphere.index = 0;
					sphere.position = linePoints2[0];
				}
				else {	
					
					
					
					sphere.position.copy(linePoints2[sphere.index]);
                    sphere.index = sphere.index+1;
				
				}
				
            }
                
               
			
		};
	

		
		function createLinePoints(start,end,N){
			let linePoints = [];
			for (let i=0; i<=N; i++){
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
	'./images/version-def-2.jpg',

	// onLoad callback
	function ( texture ) {
        texture.minFilter = THREE.LinearFilter;
		// in this example we create the material when the texture is loaded
		var material = new THREE.MeshBasicMaterial( {
            map: texture
           
         } );
         airpictextures.push(texture);
         airpictextures.push(new THREE.TextureLoader().load( './images/version-def-histo-2.jpg'),(texture2) => {
            texture2.minFilter = THREE.LinearFilter;
         })
         
         
         var geometry = new THREE.PlaneGeometry(6916*0.377,4790*0.377,1,1);
         var plane = new THREE.Mesh(geometry,material)
         plane.name = "plane with image";
         plane.position.z = -1;
       
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
        './reunion_sat_6000_9.jpg',

        // onLoad callback
        function ( satTexture ) {
            // in this example we create the material when the texture is loaded
            var material = new THREE.MeshBasicMaterial( {
                map: satTexture
               
            } );
            console.log(material)
            imgmat.push(material)

            var loader = new THREE.TextureLoader();

            // load a resource
            loader.load(
            // resource URL
            './reunion_sat_6000_histo_1.jpg',
    
            // onLoad callback
            function ( satTexture ) {
                // in this example we create the material when the texture is loaded
                var material = new THREE.MeshBasicMaterial( {
                    map: satTexture
                   
                } );
                console.log(material)
                imgmat.push(material)
                
                
                
            },
    
            // onProgress callback currently not supported
            undefined,
    
            // onError callback
            function ( err ) {
                console.error( 'An error happened.' );
            })
            
            
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



function addSkyAndWater(){
    
 

    console.log('adding sky')

    // Add Sky
        sky = new THREE.Sky();
        sky.scale.setScalar( 450000 );
        
       
        scene.add( sky );
        // Add Sun Helper
        sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        //sunSphere.position.z = + 700000;
        sunSphere.visible = false;
        scene.add( sunSphere );
        sunSphere.name ="sun";
        
    
        unselectableObjects.push(sunSphere);
        myObjects.push(sunSphere);
      

        /// GUI
        var effectController  = {
        turbidity: 10,
        rayleigh: 2,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
        luminance: 1,
        inclination: 0.014, // elevation / inclination
        azimuth: 0.2581, // Facing front,
        sun: ! true
        };

        sunSphere.inclination = effectController.inclination;

    var distance = 40000000;
    

    //add light:

    //"skylight"
    var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.2 );
   
    hemiLight.position.set( 0, 0, 500);
    scene.add( hemiLight );

    //"sunlight"

   
     directionalLight = new THREE.DirectionalLight(0xffffff);
   
    directionalLight.position.set(0, 4, 10).normalize();
    directionalLight.position.set(-1500,0,1500)

    directionalLight.castShadow = true;            // default false
    scene.add(directionalLight);

    //Set up shadow properties for the light
    directionalLight.shadow.mapSize.width = 2*1024;  // default
    directionalLight.shadow.mapSize.height = 2*1024; // default
    directionalLight.shadow.camera.near = -2000;    // default
    directionalLight.shadow.camera.far = 1555;     // default

    directionalLight.shadow.camera.left = 1000;
    directionalLight.shadow.camera.right = -1000;
    directionalLight.shadow.camera.top = 650;
    directionalLight.shadow.camera.bottom = -600;


    directionalLight.shadow.camera.bias = 0.0002;
       

    
   

    var planeGeometry = new THREE.PlaneGeometry( 1800, 1500 );


    var planeMaterial = new THREE.ShadowMaterial();
    planeMaterial.opacity = 0.5;

    var plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.z = 0.1;
    plane.position.x = -200;
    plane.receiveShadow = true;
    scene.add( plane );
    plane.name="shadow Plane"
    unselectableObjects.push(plane);
    


    //Create a helper for the shadow camera (optional)
    // helper = new THREE.CameraHelper( directionalLight.shadow.camera );
    // scene.add( helper );
    
    //water:
    var waterGeometry = new THREE.PlaneBufferGeometry( 748300, 800600 );
    water = new THREE.Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            landArea: new THREE.TextureLoader().load( './reunionsealevel_6000.png', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            waterNormals: new THREE.TextureLoader().load( './js/textures/waternormals.jpg', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 1.0,
            shiftX:-65.0,
            shiftY:-770.0,
            size:8,
            sunDirection: sunSphere.position.clone().normalize(),
            sunColor: 0xffffff,
            height: 0.0,
            waterColor: 0x000622    ,
            distortionScale:  3.7,
            fog: scene.fog !== undefined
        }
    );
    water.position.x=+74830/2 -29840;
    water.position.y=-80060/2 +7210;
    
    water.name="water";
    unselectableObjects.push(water);
    
    scene.add( water );

    

    var gui = new dat.GUI();
    let skyfolder = gui.addFolder('Sky')
    skyfolder.open();

    skyfolder.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
    skyfolder.add( effectController, "rayleigh", 0.0, 4, 0.001 ).onChange( guiChanged );
    skyfolder.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
    skyfolder.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
    skyfolder.add( effectController, "luminance", 0.0, 2 ).onChange( guiChanged );
    skyfolder.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
    skyfolder.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
    skyfolder.add( effectController, "sun" ).onChange( guiChanged );


    document.getElementById("Controllers").appendChild(gui.domElement)
    

    guiChanged();
       
    var uniforms = water.material.uniforms;
    var folder = gui.addFolder( 'Water' );
				folder.add( uniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
				folder.add( uniforms.size, 'value', 0.1, 100, 0.1 ).name( 'size' );
                folder.add( uniforms.alpha, 'value', 0.9, 1, .001 ).name( 'alpha' );
                folder.add( uniforms.height, 'value', 0, 1, 0.01 ).name( 'height' );
                folder.add( uniforms.shiftX, 'value', -1000, 1000, 1 ).name( 'shiftX' );
                folder.add( uniforms.shiftY, 'value', -1000, 1000, 1 ).name( 'shiftY' );
                folder.open();
                
     
	function guiChanged() {
        sunSphere.inclination = effectController.inclination;
        
        var uniforms = sky.material.uniforms;
        uniforms.turbidity.value = effectController.turbidity;
        uniforms.rayleigh.value = effectController.rayleigh;
        uniforms.luminance.value = effectController.luminance;
        uniforms.mieCoefficient.value = effectController.mieCoefficient;
        uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
        sunSphere.position.z = distance * Math.cos( theta );
        sunSphere.position.x = distance * Math.sin( theta ) * Math.sin( phi );
        sunSphere.position.y = distance * Math.sin( theta) * Math.cos( phi );
        sunSphere.visible = effectController.sun;
        uniforms.sunPosition.value.copy( sunSphere.position );
        water.material.uniforms.sunDirection.value.copy( sunSphere.position ).normalize();
       
        directionalLight.position.set(sunSphere.position.normalize().x,sunSphere.position.normalize().y,sunSphere.position.normalize().z);

        scene.getObjectByName("shadow Plane").material.opacity=  -0.95*4*(sunSphere.inclination-1)*sunSphere.inclination;
      
    }

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
  
    var geometry = new THREE.PlaneGeometry(74830, 80060, numSegments, numSegments); 
  
      var material = imgmat[0];
    
      



    terrain = getTerrainPixelData();  
    sealevel = getSeaLevelData();
    

    // keep in mind, that the plane has more vertices than segments. If there's one segment, there's two vertices, if
    // there's 10 segments, there's 11 vertices, and so forth. 
    // The simplest is, if like here you have 100 segments, the image to have 101 pixels. You don't have to worry about
    // "skewing the landscape" then..
  
    // to check uncomment the next line, numbers should be equal
    console.log("length: " + terrain.length + ", vertices length: " + geometry.vertices.length);


   

    for (var i = 0, l = geometry.vertices.length; i < l; i++)
    {   
        var terrainValue = terrain[i] / 255;
        if (terrainValue > 2/255) {                 // we let only height>2 pass... in order to keep it flat in first ~ 30meters.
            geometry.vertices[i].z = geometry.vertices[i].z + (terrainValue *3036) *1.5 ;
        }
       
        
        if (sealevel[i] == 0){
           // geometry.vertices[i].z = -2000;
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
    plane.position.z=-15;
  
    scene.add(plane)
    mountain = plane;
    
    
    myObjects.push(plane)
    unselectableObjects.push(plane);
    altitudes =JSON.parse(JSON.stringify(plane.geometry.vertices));

   

    
  }


  window.addEventListener( 'resize', onWindowResize, false );

  function onWindowResize(){
  
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
  
      renderer.setSize( window.innerWidth, window.innerHeight );
      
     if (activePage) activePage.onWindowResize();    
  
  }
 
  function loadObjects() {
    loadingOBJObject('./models/saint-denis/prunel_bati.obj','buildings',{ castShadow:true, offset:{x:0,y:0,z:-3},unselectable:true,hidden:false, buildref:true,transparent:0.7,color:new THREE.Color( 0xffffff)});
    //loadingOBJObject('./models/saint-denis/prunel_ground.obj','ground');
    
    loadingOBJObject('./models/saint-denis/prunel_roof.obj','roof',{castShadow:true, offset:{x:0,y:0,z:-3},unselectable:true,hidden:false,transparent:0.6,color:new THREE.Color( 0xffffff)});
    loadingOBJObject('./models/saint-denis/prunel_streets.obj','street',{ transparent: 0, receiveShadow:false, offset:{x:0,y:0,z:-2.5},unselectable:true,hidden:false});
    loadingOBJObject('./models/saint-denis/prunel_mainstreet.obj','Rue Marechal Leclerc',{transparent:0.5, receiveShadow:false, offset:{x:0,y:0,z:-2}, offsetChildren: {x:550,y:-194,z:-4}, interactive:true, color:new THREE.Color( 0x4E4E59)});
    
    
    
    loadingOBJObject('./models/saint-denis/prunel_areashape_1.obj','Zone 1',{color: new THREE.Color(0xff0000), interactive:true,offset:{x:2,y:2,z:-3}, offsetChildren:{x:880,y:-485,z:-20},transparent:0.5})
    
    loadingOBJObject('./models/saint-denis/prunel_areashape_2.obj','Zone 2',{color: new THREE.Color(0x00ff00), interactive:true, offset:{x:3,y:3,z:-3}, offsetChildren:{x:189,y:-70,z:-25},transparent:0.5});
    
    loadingOBJObject('./models/saint-denis/prunel_areashape_3.obj','Zone 3',{color: new THREE.Color(0xFFDB03), interactive:true,offset:{x:0,y:0,z:-3}, offsetChildren:{x:359,y:495,z:-25},transparent:0.5});
}



function initObjects(){
 


   var material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
   var geo = new THREE.CubeGeometry (1,1,1    )
   var place = new THREE.Mesh( geo, material);
   place.name="Piton des Neiges";
   place.position.x =1500;
   place.position.y =-23700;
   place.position.z = 4500;
   
   scene.add(place)
   
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


function createToolTip(){

    let parent = document.createElement("div");
    let circle = document.createElement("div")
    let div = document.createElement("div");

    
  
    parent.style.top= document.getElementById("menuArrow").getBoundingClientRect().y+'px';
    parent.style.left= document.getElementById("menuArrow").getBoundingClientRect().x+'px';
    parent.style.position = 'absolute';
    parent.style.zIndex = '+200';
    parent.style.pointerEvents = 'none';
    parent.id="tooltipdiv";
    document.body.appendChild(parent);

    div.classList.add("tooltiptext");
    div.innerHTML = 'Click here to open the controls menu...';
    parent.appendChild(div);
    
    circle.classList.add("tooltipcircle");
    parent.appendChild(circle)

    
    setTimeout(() => {
        console.log('hiding tooltip')
        parent.style.display = 'none';
      
    }, 5000);
   
}

function onLoadBody(){
   
    console.log('onLoadBody is running')
    initControls();
    initObjects();
    addSkyAndWater();
    setObjectsInSelectList(myObjects)
    createInteractiveGUI();
    setRotation();
    document.body.appendChild(renderer.domElement); //reappend render and hide loading div
    document.getElementById("loading").classList.add('loadingOff');
    animate();
    
    myMovie.createGui();
    //load data to movie
    $.getJSON(("./data/movie.json"), function(json) {
        
        myMovie.loadMovie(json);
        myMovie.refreshGui();
        myMovie.playMovie();
    });
    //

    


    

    
    
    document.getElementById("cameraX").value = camera.position.x;
    document.getElementById("cameraY").value = camera.position.y;
    document.getElementById("cameraZ").value = camera.position.z;
    
    document.getElementById("lookatX").value = controls.target.x;
    document.getElementById("lookatY").value = controls.target.y;
    document.getElementById("lookatZ").value = controls.target.z;

    createToolTip()

  
  
    
    
}


function loadingOBJObjectWithMaterials(objPath,mtlPath,name,options){
    console.log(mtlPath.substring(0, mtlPath.length-4))
    new THREE.MTLLoader()
                    
                    .setTexturePath( mtlPath.substring(0, mtlPath.length-4) +'_Textures/')
					.load( mtlPath, function ( materials ) {
                        materials.preload();
                        
                        
						new THREE.OBJLoader()
							.setMaterials( materials )
							.load( objPath , function ( object ) {

                                addNewObject = function(object) {
                                    //start
                                    var newObject = object;
                                    newObject.name = name;

                                    
                                                                    
                                    scene.add(newObject)
                                    //move to mathias zero point! : 55.45933228, -20.875329,  =~ -49,75
                                    newObject.position.x=-49;
                                    newObject.position.y=75;

                                    //ading offset
                                    
                                    if(options.offset){
                                                        
                                        newObject.position.x += options.offset.x;
                                        newObject.position.y += options.offset.y;
                                        newObject.position.z += options.offset.z;
                                    }

                                    if(options.rotate){
                                        newObject.rotateOnAxis(new THREE.Vector3( options.rotate.x,options.rotate.y,options.rotate.z),options.rotate.angle);
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
                                        
                                        newObject.material.opacity=options.transparent;
                                    }

                                    if (options.hidden!=true){
                                        myObjects.push(newObject)  
                                    }
                                    
                                    if (options.castShadow){
                                        newObject.castShadow = true;

                                    }


                                    console.log(newObject)
                                    
                                    console.log('obj "' + newObject.name + '" has loaded')
                                    
                                    //finish
                                }

                                
                                if( options.seperateChildren) {
                                    var parentName = name;
                                    for (let i=0; i< object.children.length; i++){
                                    
                                        name = parentName + "/" + object.children[i].name;
                                        addNewObject(object.children[i])
                                    }
                                }
                                else {
                                        addNewObject(object);
                                        
                                }
                               
                                
							},  // called when loading is in progresses
                            function ( xhr ) {
                           
                            
                                
                                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                    
                            },
                            // called when loading has errors
                            function ( error ) {
                    
                                console.log( 'An error happened' );
                    
                            }
                        );
					} );
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
                if (options.castShadow){
                    newObject.children[i].castShadow = true;
    
                }
                if (options.receiveShadow){
                    newObject.children[i].receiveShadow = true;
    
                }
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

            if(options.transparent != null){
                newObject.material.transparent=true;
                newObject.material.opacity=options.transparent;
            }
          
            if (options.hidden!=true){
                myObjects.push(newObject)  
            }
            
            if(options.buildref){         //just for demo
                buildingsref = newObject;
               
            }
          
           
            if (options.castShadow){
                newObject.castShadow = true;

            }

            if (options.receiveShadow){
                newObject.receiveShadow = true;

            }


            console.log(newObject)
          
           
            
            
            

        },
        // called when loading is in progresses
        function ( xhr ) {
            
            if (loading_events.length == 0 ) {
                console.log('pushed first event ' +  xhr.srcElement.responseURL)
                loading_events.push(xhr)
            }

            let pushMe = true;

            for (let j=0; j<loading_events.length; j++){
               
                if(loading_events[j].srcElement.responseURL === xhr.srcElement.responseURL){
                    pushMe = false;
                    loading_events.splice(j,1,xhr)
                    j = loading_events.length;
                    
                }

                
            }

            if(pushMe) {
                loading_events.push(xhr);
                console.log('pushed another event'+  xhr.srcElement.responseURL)
            }

         
            console.log(loading_events)
            calculateLoading();
      
            

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
    //for water

	var time = performance.now() * 0.001;
				sphere.position.y = Math.sin( time ) * 20 + 5;
				sphere.rotation.x = time * 0.5;
				sphere.rotation.z = time * 0.51;
				water.material.uniforms.time.value += 1.0 / 60.0;
    //end water

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
        text.innerHTML ='<div style="direction:ltr;"><p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu lorem nec est convallis rhoncus quis a tortor. Praesent tristique lectus odio, non porta arcu accumsan eu. In vitae nunc massa. Donec dignissim accumsan fringilla. Donec gravida, leo eu molestie lobortis, lorem erat mattis nisl, eu scelerisque eros ipsum a erat. Morbi tincidunt ultricies ex, vel ultricies leo venenatis eu. Vestibulum accumsan, libero a dignissim egestas, leo nunc aliquam nisl, quis congue enim tortor at justo.</p> <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu lorem nec est convallis rhoncus quis a tortor. Praesent tristique lectus odio, non porta arcu accumsan eu. In vitae nunc massa. Donec dignissim accumsan fringilla. Donec gravida, leo eu molestie lobortis, lorem erat mattis nisl, eu scelerisque eros ipsum a erat. Morbi tincidunt ultricies ex, vel ultricies leo venenatis eu. Vestibulum accumsan, libero a dignissim egestas, leo nunc aliquam nisl, quis congue enim tortor at justo.</p> </div> ';
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
        btn.innerHTML = 'Télécharger PDF &nbsp&nbsp<i class="fa fa-file-pdf-o" style="font-size:24px"></i>';
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

        var parent = document.createElement("div");
        parent.style="position: absolute; z-index:3; cursor:pointer;"
        parent.id="photo_"+i;

        var container = document.createElement("div");
        container.classList.add("photoLinkButton")
        container.addEventListener("click",function() {loadPhoto(i)},false)

        var span = document.createElement("span");
        span.classList.add("glyphicon");
        span.classList.add("glyphicon-camera");
        container.appendChild(span);
        parent.appendChild(container)
        document.body.appendChild(parent);
    }

    for(let i=0; i< spherePhotos.length; i++){
        var parent = document.createElement("div");
        parent.style="position: absolute; z-index:3; cursor:pointer;"
        parent.id="spherePhoto_"+i;

        var container = document.createElement("div");
        container.classList.add("photoLinkButton")
        container.addEventListener("click",function() {loadSpherePhoto(i)},false)

        var span = document.createElement("span");
        span.classList.add("glyphicon");
        span.classList.add("glyphicon-eye-open");
        container.appendChild(span);
        
        parent.appendChild(container)
        
        document.body.appendChild(parent);
    }

    for(let i=0; i< poi.length; i++){
        var parent = document.createElement("div");
        var label = document.createElement("div");
        var arrow = document.createElement("div");
        parent.classList.add("poi-parent");
        label.classList.add("poi-label");
        arrow.classList.add("poi-arrow");

        parent.id = "poi_"+i;
        label.id = "poi_label_"+i;
        label.appendChild(document.createTextNode(poi[i].label))
        parent.appendChild(arrow);
        parent.appendChild(label);
        
        document.body.appendChild(parent)

        
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
        
        
      
            
        if ( (camera.position.z < 40) || (interactiveObjects[i].position.distanceTo(camera.position) >5000)  ) {
            document.getElementById("interactiveLabel"+i).style.display = 'none'; // not working...
        }

        else {
            document.getElementById("interactiveLabel"+i).style.display = 'block';
            document.getElementById("interactiveLabel"+i).style.left=proj.x+'px';
            document.getElementById("interactiveLabel"+i).style.top=proj.y+'px';
        }

    }

    for( let i=0; i< nonInteractiveLabels.length; i++){

        var proj = toScreenPosition(nonInteractiveLabels[i], camera);
        
        if ( (camera.position.z < 40 )|| (nonInteractiveLabels[i].position.distanceTo(camera.position) >5000)) {
            document.getElementById("nonInteractiveLabel"+i).style.display='none';

        }

        else {
            document.getElementById("nonInteractiveLabel"+i).style.left=proj.x+'px';
            document.getElementById("nonInteractiveLabel"+i).style.top=proj.y+'px';
            document.getElementById("nonInteractiveLabel"+i).style.display='block';
        }
       
        
     

    }

    for( let i=0; i< photos.length; i++){

        var proj = toScreenPosition(photos[i], camera);
        
        if ( (camera.position.z < 40 )|| (photos[i].position.distanceTo(camera.position) >5000)) {
            document.getElementById("photo_"+i).style.display='none';

        }

        else {
            document.getElementById("photo_"+i).style.left=proj.x+'px';
            document.getElementById("photo_"+i).style.top=proj.y+'px';
            document.getElementById("photo_"+i).style.display='block';
        }
      
        
     

    }

    for( let i=0; i< spherePhotos.length; i++){

        var proj = toScreenPosition(spherePhotos[i], camera);
        
        if (  (camera.position.z < 40 )|| (spherePhotos[i].position.distanceTo(camera.position) >5000) ) {
            document.getElementById("spherePhoto_"+i).style.display = 'none';

        }

        else {
            document.getElementById("spherePhoto_"+i).style.left=proj.x+'px';
            document.getElementById("spherePhoto_"+i).style.top=proj.y+'px';  
            document.getElementById("spherePhoto_"+i).style.display = 'block';
        }
       
        
     

    }

    for( let i=0; i< poi.length; i++){

        let x = camera.position.x;
        let y = camera.position.y;
        let z= camera.position.z;
        
        //calc distance
        let d = Math.sqrt((poi[i].position.x - x) * (poi[i].position.x - x) + (poi[i].position.y - y) * (poi[i].position.y - y) + (poi[i].position.z - z) * (poi[i].position.z - z));
   
        if((d < 800) && (camera.position.z>40)){
            
            var proj = toScreenPosition(poi[i], camera);
           
          
            document.getElementById("poi_"+i).style.left=proj.x+'px';
            document.getElementById("poi_"+i).style.top=proj.y+'px';
            document.getElementById("poi_"+i).style.display='block';
        }

        else {
            
            document.getElementById("poi_"+i).style.display='none';

        }
        
     

    }

   
   
}


// for interactive items:
function hoverInteractiveItem(event,hovered){
    console.log('hovered')
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
    
    
    flyTo(interactiveObjects[id].position,0.1+dl/5000,dl/10000,1+dl/5000).then( ()=>{
        setTimeout(()=>{ 
            loadInteractivePageCanvas(id,interactivePageRenderer);

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

   console.log(event.layerX/200,event.layerY/200)
    xpixel=Math.floor(event.layerX*300/200)
    ypixel= Math.floor(event.layerY*300/200)
    index = xpixel + 300*(ypixel)
    
    z=altitudes[index].z+200;
    console.log(z)
    if (z<0){z=0;}
    var dz=Math.abs(z-controls.target.z)/2000;
    console.log('dz=',dz)
    
    
    //and now lets fly to it..
    dx=camera.position.x-x;
    dy=camera.position.y-y;
    dl=Math.sqrt(dx*dx+dy*dy)
    
   flyTo({x:x,y:y,z:z},0.1+dl/5000,dz,10)
    
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

function toggleWireframeView(){
    console.log(document.getElementById("wireframeView").checked)
    if (document.getElementById("wireframeView").checked) {
        console.log('wireframe on')
       
       scene.getObjectByName("terrain",true).material.wireframe = true;
       water.visible = false;
    }
    
    else {
        console.log('wireframe off')
        
        scene.getObjectByName("terrain",true).material.wireframe = false;
        water.visible = true;
    }
    
}


function historyMode(){
    history_mode = 1- history_mode;
    airpicref.material.map = airpictextures[history_mode];
    mountain.material = imgmat[history_mode]

    if (history_mode==1) {
        document.getElementById("historyModeButton").classList.add("active");
    }

    if (history_mode==0) {
        document.getElementById("historyModeButton").classList.remove("active");
    }

    
}

function topView(){
    
    if (document.getElementById("topView").checked){
        console.log('topview')
        camera.position.x= 0;
        camera.position.y= -10;
        camera.position.z= 900;
        setRotation()

        controls.minPolarAngle=0;
        controls.maxPolarAngle=0;
        camera.lookAt( new THREE.Vector3(0,0, 0 ) );
        controls.target = new THREE.Vector3(0,0, 0 ) ;
        updatePositionMark(controls.target);

        document.getElementById("topViewButton").classList.add("active");
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
        setRotation()
        document.getElementById("topViewButton").classList.remove("active");
        
    }
    
}

function toggleMenu(){
    document.getElementById("tooltipdiv").style.display = 'none';
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
    loadInteractiveItem(index)
   
}

function sliderChange(value){
    buildingsref.scale.set(1,1,1+(value-2018)*0.2)
}


//
// movie code part:
function TimePoint(time,position,target){
    this.time = time;
    this.position = position;
    this.target = target;
}

function Subtitle(time,duration,text,x,y,height,width,fontSize){
    
    this.time = time;
    this.duration = duration;
    this.text = text;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fontSize = fontSize;

  
    
    let p=document.createElement("p");
    p.innerHTML=text;
    this.div = document.createElement("div");
    this.div.appendChild(p);
    this.div.classList.add("subtitle");
    
    this.div.style.position='absolute';
    this.div.style.zIndex = '1000';

    this.div.style.left = x+'%';
    this.div.style.top = y+'%';

    if(height) {
        this.div.style.minHeight=height+'%';
        console.log('height')
    }

    if(width) {
        this.div.style.width=width+'%';
        console.log('width')
    }
    
    if(fontSize){
        this.div.style.fontSize=fontSize+'pt';
    }
  
    
    document.body.appendChild(this.div);

    

    this.on = function() {
        this.div.classList.add('on')
        setTimeout(() => {
            this.div.classList.remove('on');
        }, this.duration*1000);
    }


    
}

function ObjectEvent(time,object,property,value){
    console.log(time,object,property,value)
    this.time = time;
    this.object = object;
    this.property = property;
    this.value = value;
    this.startEvent = function(){
        console.log('eventLunched for object :"'+this.object.name+'"')
        if (this.property === 'color'){
            console.log('changing color')
            this.object.material.color = this.value;
        }

        if ((this.property === 'inclination') && (this.object.name === 'sun')){
            console.log('changing inclination')

         
            oldInclination = sunSphere.inclination;
           
            let dI = (this.value - oldInclination)/(50*10);
        
            
            let valstep=0;
           
            
            let val = setInterval(()=>{
                
              sunSphere.inclination =  sunSphere.inclination + dI;
              console.log(sunSphere.inclination)
              valstep++;

              var theta = Math.PI * (sunSphere.inclination - 0.5 );
              var phi = 2 * Math.PI * ( 0.2581 - 0.5 );
              sunSphere.position.z = 40000000 * Math.cos( theta );
              sunSphere.position.x = 40000000 * Math.sin( theta ) * Math.sin( phi );
              sunSphere.position.y = 40000000 * Math.sin( theta) * Math.cos( phi );
              
              sky.material.uniforms.sunPosition.value.copy( sunSphere.position );
              water.material.uniforms.sunDirection.value.copy( sunSphere.position ).normalize();
          
              directionalLight.position.set(sunSphere.position.normalize().x,sunSphere.position.normalize().y,sunSphere.position.normalize().z);
              scene.getObjectByName("shadow Plane").material.opacity=  -0.95*4*(sunSphere.inclination-1)*sunSphere.inclination;
              

              if (valstep == 500) {
                console.log('finished changing sun position');
                 
                clearInterval(val);
              }
            },50);

           
        }

        if (this.property === 'opacity'){
                
                this.object.material.transparent = true;
                
               
                let oldOpacity = this.object.material.opacity;
                let dO = (this.value - oldOpacity)/20;
                
                this.object.material.transparent = true;
                
                let valstep=0;
               
                
                let val = setInterval(()=>{
                    
                  this.object.material.opacity = this.object.material.opacity + dO;
                  console.log(this.object.material.opacity)
                  valstep++;
                 
                  

                  if (valstep == 20) {
                      console.log('finished changing opacity');
                      this.object.material.opacity = Math.round((this.object.material.opacity)*100)/100;
                      if(this.value == 1){
                          this.object.material.transparent = false;      //turning of transperancy... no need if its opacity =1....
                          this.object.visible = true;
                    
                      }

                      if(this.value == 0){
                        this.object.material.transparent = false;     //turning of transperancy... no need if its opacity =0....
                        this.object.visible = false;     //turning of visibility... no need if its opacity =0....
                    
                    }

                    console.log(this.object.material.transparent,this.object.material.opacity,this.object.visible)

                      clearInterval(val);
                  }
                },50);
            
           
           
            this.object.visible = this.value;

            
        }
    }
}



function Movie(){
    this.objectEvents = [];
    this.timepoints =[];
    this.lines = [];
    this.subtitles = []
    this.createGui = function (){

        let  cameraTable = ()=>{
            //camera points
            let pointslistDiv = document.getElementById("pointsList");
            let table = document.createElement("table");
            table.classList.add("pointsTable_table")
            let tablehead = document.createElement("tr");
            tablehead.innerHTML = '<th class="pointsTable_th">Time</th><th class="pointsTable_th">Position</th><th  class="pointsTable_th">Target</th><th class="pointsTable_th"></th>';
            table.appendChild(tablehead);
            pointslistDiv.appendChild(table);


            for (let i=0; i<this.timepoints.length;i++){
                let row = document.createElement("tr");
                row.classList.add("pointsTable_tr")
                let timetd = document.createElement("td");
                timetd.classList.add("pointsTable_td");
                let positiontd = document.createElement("td")

                positiontd.classList.add("pointsTable_td")
                let targettd = document.createElement("td")
                targettd.classList.add("pointsTable_td")

                let pointcontrol = document.createElement("td");
                pointcontrol.classList.add("pointsTable_td")

                timetd.innerHTML = this.timepoints[i].time;
                positiontd.innerHTML = '('+Math.floor(this.timepoints[i].position.x)+','+Math.floor(this.timepoints[i].position.y)+','+Math.floor(this.timepoints[i].position.z)+')';
                targettd.innerHTML = '('+Math.floor(this.timepoints[i].target.x)+','+Math.floor(this.timepoints[i].target.y)+','+Math.floor(this.timepoints[i].target.z)+')';
            

                
                let remove = document.createElement("button");
                remove.innerHTML = "x";
                remove.classList.add("movieControlButton")
                
                remove.onclick= () => {
                    this.removePoint(i);
                }
                pointcontrol.appendChild(remove)

                
                row.appendChild(timetd);
                row.appendChild(positiontd);
                row.appendChild(targettd);
                row.appendChild(pointcontrol);

                table.appendChild(row)
            }

        }
        
        
        let objectEventsTable = ()=>{
       
            // object events
            

            //selecobject tbox:
            let select = document.getElementById("objectSelectorForEvent");
            let option = document.createElement("option");
            option.value = 0;
            option.innerHTML = 'Select Object';
            option.disabled = true;
            option.selected = true;
            select.appendChild(option);

            for(let i=0; i < myObjects.length; i++){
                console.log(i)
                let option = document.createElement("option");
                option.value = myObjects[i];
                option.innerHTML = myObjects[i].name;
                select.appendChild(option);
            }

            //selectproperty box:
            document.getElementById("newObjectEventProperty")[0].selected = true;

            //table:
            
            let pointslistDiv = document.getElementById("objectEventsList");
            let table = document.createElement("table");
            table.classList.add("pointsTable_table")
            let tablehead = document.createElement("tr");
            tablehead.innerHTML = '<th class="pointsTable_th">Time</th><th class="pointsTable_th">Object</th><th  class="pointsTable_th">Event</th><th class="pointsTable_th"></th>';
            table.appendChild(tablehead);
            pointslistDiv.appendChild(table);
        
    
            for (let i=0; i<this.objectEvents.length;i++){
                let row = document.createElement("tr");
                row.classList.add("pointsTable_tr")
                let timetd = document.createElement("td");
                timetd.classList.add("pointsTable_td");
                let positiontd = document.createElement("td")
            
                positiontd.classList.add("pointsTable_td")
                let targettd = document.createElement("td")
                targettd.classList.add("pointsTable_td")
    
                let pointcontrol = document.createElement("td");
                pointcontrol.classList.add("pointsTable_td")
    
                timetd.innerHTML = this.objectEvents[i].time;
                positiontd.innerHTML = this.objectEvents[i].object.name;
                targettd.innerHTML = this.objectEvents[i].property+'('+this.objectEvents[i].value +')';
                
    
                
                let remove = document.createElement("button");
                remove.innerHTML = "x";
                remove.classList.add("movieControlButton")
                
                remove.onclick= () => {
                    this.removeObjectEvent(i);
                }
                pointcontrol.appendChild(remove)
    
                
                row.appendChild(timetd);
                row.appendChild(positiontd);
                row.appendChild(targettd);
                row.appendChild(pointcontrol);
    
                table.appendChild(row)
            }
        }

        let subtitlesTable = ()=>{
       
            //table:
            
            let pointslistDiv = document.getElementById("SubtitlesList");
            let table = document.createElement("table");
            table.classList.add("pointsTable_table")
            let tablehead = document.createElement("tr");
            tablehead.innerHTML = '<th class="pointsTable_th" style="width:50px;">Time</th><th class="pointsTable_th" style="width:50px;">Duration</th><th  class="pointsTable_th">Text</th><th class="pointsTable_th" style="width:30px;"></th>';
            table.appendChild(tablehead);
            pointslistDiv.appendChild(table);
        
    
            for (let i=0; i<this.subtitles.length;i++){
                let row = document.createElement("tr");
                row.classList.add("pointsTable_tr")
                let timetd = document.createElement("td");
                timetd.classList.add("pointsTable_td");
                let positiontd = document.createElement("td")
            
                positiontd.classList.add("pointsTable_td")
                let targettd = document.createElement("td")
                targettd.classList.add("pointsTable_td")
    
                let pointcontrol = document.createElement("td");
                pointcontrol.classList.add("pointsTable_td")
    
                timetd.innerHTML = this.subtitles[i].time;
                positiontd.innerHTML = this.subtitles[i].duration;
                targettd.innerHTML = this.subtitles[i].text;
                
    
                
                let remove = document.createElement("button");
                remove.innerHTML = "x";
                remove.classList.add("movieControlButton")
                
                remove.onclick= () => {
                    this.removeSubtitle(i);
                }
                pointcontrol.appendChild(remove)
    
                
                row.appendChild(timetd);
                row.appendChild(positiontd);
                row.appendChild(targettd);
                row.appendChild(pointcontrol);
    
                table.appendChild(row)
            }
        }
        
        cameraTable();
        objectEventsTable();
        subtitlesTable();

  
       
    };

    

 

    this.addPoint = function(point) {
       
        for(let i=0; i< this.timepoints.length; i++){
            if(point.time < this.timepoints[i].time) {
                this.timepoints.splice(i,0,point);
                console.log('point added at index='+i,point)
                console.log('new points arrayist',this.timepoints)
                this.refreshGui();
                return;
            }
        }

        this.timepoints.push(point); // will happend only if function didnt return on the for loop.. (if the time is bigger than all existing times)
        console.log('point added as last point',point)
        

        this.refreshGui();
        

        
    }

    this.removePoint = function(index) {
        this.timepoints.splice(index,1)
        this.refreshGui();
        
    }

    this.addObjectEvent = function(event) {

        for(let i=0; i< this.objectEvents.length; i++){
            if(event.time < this.objectEvents[i].time) {
                this.objectEvents.splice(i,0,event);
                console.log('objectEvent added at index='+i,event)
                
                this.refreshGui();
                return;
            }
        }

        this.objectEvents.push(event); // will happend only if function didnt return on the for loop.. (if the time is bigger than all existing times)
        console.log('objectEvent added as last event',event)
        

        this.refreshGui();

    }

    this.removeObjectEvent = function(index) {
        this.objectEvents.splice(index,1)
        this.refreshGui();
        
    }

    this.addSubtitle = function (subtitle){
        for(let i=0; i< this.subtitles.length; i++){
            if(subtitle.time < this.subtitles[i].time) {
                this.subtitles.splice(i,0,subtitle);
                console.log('subtitle added at index='+i,subtitle)
                
                this.refreshGui();
                return;
            }
        }

        this.subtitles.push(subtitle); // will happend only if function didnt return on the for loop.. (if the time is bigger than all existing times)
        console.log('subtitle added as last subtitle',subtitle)
        

        this.refreshGui();
        
    };

    this.removeSubtitle = function(index) {
        this.subtitles.splice(index,1)
        this.refreshGui();
        
    }

    this.refreshGui = function() {
        var myNode = document.getElementById("pointsList");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        var myNode = document.getElementById("objectEventsList");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        var myNode = document.getElementById("objectSelectorForEvent");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        var myNode = document.getElementById("SubtitlesList");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        this.createGui();
    }

    this.playMovie = function(){
        let sceneBefore = scene.clone();
        let secPassed = 0;
        let timepoints = this.timepoints;
        let lines = [];
        if (timepoints.length< 2){
            return;
        }
     
        document.getElementById("playButton").disabled = true;
        document.getElementById("playMovieButtonText").innerHTML='Playing...';
        document.getElementById("movieButtonMainScreen").hidden = true;


        controls.minPolarAngle=0; //disable control limit
        controls.maxPolarAngle=Math.PI;
    
        
      
        console.log(timepoints)
        for (let j=0; j < timepoints.length-1; j++) {
         
            
            let T = timepoints[j+1].time-timepoints[j].time;
            let frames = Math.floor(T*25);
    
            lines.push({positions: createLinePoints(timepoints[j].position,timepoints[j+1].position,frames),targets: createLinePoints(timepoints[j].target,timepoints[j+1].target,frames)})     
        }
    
        console.log(lines)
        
        
        let t=0;
        let dt=40
        let i=0;
        let j=0;
        let i_oe = 0;
        let i_s = 0;
 
        document.getElementById("timeClock").innerHTML = '00:00';
        let ivl= setInterval(() => { 
            t=t+dt;

            //clock display
            if((t/1000-secPassed)>1) {
                secPassed++;
                
                document.getElementById("timeClock").innerHTML = secsToMMSS(secPassed);
            }
         
           //object events:
          
           
           if (i_oe < this.objectEvents.length){
            if(this.objectEvents[i_oe].time < t/1000){    //time had jussed passed the [i_oe] objectEvent timestep. we will now lunch the event, and move to our next event.
              
                this.objectEvents[i_oe].startEvent();
                i_oe++;
               }
           }

           //subtitles:
          
          
          
           if (i_s < this.subtitles.length){ 
            if(this.subtitles[i_s].time < t/1000){    ///like above with objectevents.. only this time we will check also for the off...
                console.log('turning on', this.subtitles[i_s])
                this.subtitles[i_s].on();
               
            
                i_s++;
               }
           }
           
            
           //camera changes:

            camera.position.set(lines[j].positions[i].x,lines[j].positions[i].y,lines[j].positions[i].z)
            camera.lookAt(lines[j].targets[i]);
            controls.target=( lines[j].targets[i]);
          //  console.log('Camera Position:'+camera.position.x +','+camera.position.y+','+camera.position.z,' Camera target:' +controls.target.x +','+controls.target.y+','+controls.target.z);
            i++;
            
            if (i>=lines[j].targets.length-1) {
                
                console.log('moving to next segment')
                j=j+1;
                i=0;
                
            }
    
            if ((j==lines.length)) {  //movie ended!!!!
                console.log('clearing interval')
                
                clearInterval(ivl);
                controls.minPolarAngle=0.1*Math.PI/2;       //return control limit
                controls.maxPolarAngle=0.98*Math.PI/2;
                document.getElementById("playMovieButtonText").innerHTML='Play Movie';
                document.getElementById("playButton").disabled = false; // enabling play button again
                document.getElementById("timeClock").innerHTML = '';
                document.getElementById("movieButtonMainScreen").hidden = false;
                
            }
        }, dt);

        this.lines=lines;
        
        
    
    };


    this.saveMovie = function(){
        var obj = {a: 123, b: "4 5 6"};
        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(myMovie));
    
        var a = document.createElement('a');
        a.href = 'data:' + data;
        a.download = 'data.json';
        a.innerHTML = 'download JSON';
        a.click();
    }

    this.loadMovie = function(movie){

      for(let i=0; i<movie.timepoints.length; i++){
          movie.timepoints[i].position = new THREE.Vector3(movie.timepoints[i].position.x,movie.timepoints[i].position.y,movie.timepoints[i].position.z)
          movie.timepoints[i].target = new THREE.Vector3(movie.timepoints[i].target.x,movie.timepoints[i].target.y,movie.timepoints[i].target.z)
      }
      this.timepoints = movie.timepoints;
      
      for(let i=0; i<movie.objectEvents.length; i++){
        myMovie.addObjectEvent(new ObjectEvent(
            movie.objectEvents[i].time,
            scene.getObjectByName(movie.objectEvents[i].object.object.name),
            movie.objectEvents[i].property,
            movie.objectEvents[i].value
        ))
     
    }

    for(let i=0; i<movie.subtitles.length; i++){
        myMovie.addSubtitle(new Subtitle(
            movie.subtitles[i].time,
            movie.subtitles[i].duration,
            movie.subtitles[i].text,
            movie.subtitles[i].x,
            movie.subtitles[i].y,
            movie.subtitles[i].height,
            movie.subtitles[i].width,
            movie.subtitles[i].fontSize
        ));
     
    }
        
    }
}

function addObjectEventClicked() {
  
    if((document.getElementById('newObjectEventProperty').selectedIndex==0) || (document.getElementById('objectSelectorForEvent').selectedIndex==0)) {
        console.log('Object or Property was not selected')
        return;
    }
    myMovie.addObjectEvent(new ObjectEvent(
        +document.getElementById('newObjectEventTime').value,
        myObjects[document.getElementById('objectSelectorForEvent').selectedIndex-1],
        document.getElementById('newObjectEventProperty')[document.getElementById('newObjectEventProperty').selectedIndex].value,
        +document.getElementById('newObjectEventValue').value
    ))
   
}

function addSubtitleClicked(){
    myMovie.addSubtitle(new Subtitle(
        +document.getElementById("subtitleTime").value,
        +document.getElementById("subtitleDuration").value,
        document.getElementById("subtitleText").value,
        +document.getElementById("subtitleLeft").value,
        +document.getElementById("subtitleTop").value,
        +document.getElementById("subtitleHeight").value,
        +document.getElementById("subtitleWidth").value,
        +document.getElementById("subtitleFontSize").value
        
    ));

    //clenaning form:
    document.getElementById("subtitleTime").value = null;
    document.getElementById("subtitleDuration").value  = null;
    document.getElementById("subtitleText").value = null;
    document.getElementById("subtitleLeft").value = null;
    document.getElementById("subtitleTop").value = null;
    document.getElementById("subtitleHeight").value = null;
    document.getElementById("subtitleWidth").value = null;
    document.getElementById("subtitleFontSize").value = null;
}

//time convertion to mm:ss
function secsToMMSS(seconds){
    return Math.floor(seconds/60)+':' + ( ((seconds-60*Math.floor(seconds/60))<10) ? '0':'') +  (seconds-60*Math.floor(seconds/60));
}



function previewSubtitle(){
    let previewSub = new Subtitle(
        +document.getElementById("subtitleTime").value,
        +document.getElementById("subtitleDuration").value,
        document.getElementById("subtitleText").value,
        +document.getElementById("subtitleLeft").value,
        +document.getElementById("subtitleTop").value,
        +document.getElementById("subtitleHeight").value,
        +document.getElementById("subtitleWidth").value,
        +document.getElementById("subtitleFontSize").value
        
    );

    previewSub.on();
    

}

function mainPlayMovieClicked(){
    myMovie.playMovie();
    
    

}

function movieInputChanged(){
 
}



function setRotation(){

  
    controls.autoRotate =(document.getElementById('setRotation').checked * !document.getElementById("topView").checked);
   
}


//end movie code part

function testFunc(){

    calcGroundAltitude(camera.position)
   

  
   
}


function calcGroundAltitude(position){
        
//     let terrainRaycaster = new THREE.Raycaster();
//     terrainRaycaster.set(position,new THREE.Vector3(0,0,-1));

//     let terrainIntersect = terrainRaycaster.intersectObjects( [scene.getObjectByName("terrain")] );

  

//    if (terrainIntersect.length > 0){
    
//     return (terrainIntersect[0].point.z + 15);
//    }
   
//    else {
//        return null;
//     }


    
    var x,y;

    x=position.x;
    y=position.y;
    x=x+29840;
    y=y-7210;

    x =  x/74830
    y = -y/80060
   
    xpixel=Math.floor(x*300)
    ypixel= Math.floor(y*300)
   

    if ( (xpixel >= 0) && (ypixel >= 0) && (xpixel < 300) && (ypixel < 300)){
        
        index1 = xpixel + 300*(ypixel);
        index2 = xpixel+1+300*(ypixel);
        index3 = xpixel+300*(ypixel+1);
        index4 = xpixel+1+300*(ypixel+1);
        z=Math.max(altitudes[index1].z,altitudes[index2].z,altitudes[index3].z,altitudes[index4].z);
    }

    else {
        z=0;
    }
   

    //console.log('altitude is :',z)

    return z;


}



  






