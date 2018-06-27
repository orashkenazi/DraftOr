//creating child scenes;

var childScenes = [];

//building A
var scene = new THREE.Scene();
scene.name = "Zone 1"

//objects:
var material = new THREE.MeshBasicMaterial( {color: 0xFF7248, side: THREE.DoubleSide, transparent:true, opacity:0.5} );
var geo = new THREE.CubeGeometry (40,23,10    )
var building = new THREE.Mesh( geo, material);
building.name="Building A";
building.position.x =30;
building.position.y =85;
building.position.z = 5;
building.rotateZ(Math.PI/4.2)

scene.add(building);


//zones

var zones =[];
var pictures = [];

var material = new THREE.MeshBasicMaterial( {color: 0xFF7248, side: THREE.DoubleSide, transparent:true, opacity:0.5} );
var geo = new THREE.CubeGeometry (10,10,10    )
var building = new THREE.Mesh( geo, material);
building.name="Zone 1";
building.position.x = 0;
building.position.y = 0;
building.position.z = 0;
building.rotateZ(Math.PI/4.2)
scene.add(building);
zones.push(building);


var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, side: THREE.DoubleSide, transparent:true, opacity:0.5} );
var geo = new THREE.CubeGeometry (10,10,10    )
var building = new THREE.Mesh( geo, material);
building.name="Zone 2";
building.position.x = 50;
building.position.y = 100;
building.position.z = 0;
building.rotateZ(Math.PI/4.2)
scene.add(building);
zones.push(building);






//adding pictures:
var geometry = new THREE.SphereGeometry( 1, 20, 20 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var sphere = new THREE.Mesh( geometry, material );

var pic1 = sphere.clone();

pic1.name="pic1";
pic1.userData.url="urlpath123";
pic1.position.set(10,10,20)
scene.add(pic1)
pictures.push(pic1);



//lights
var ambientLight = new THREE.AmbientLight(0x444444);
ambientLight.intensity = 0.0;
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);

directionalLight.position.set(0, 4, 10).normalize();
scene.add(directionalLight);

//finished and pushing to childScenes array
scene.userData.pictures = pictures;
scene.userData.zones=zones;
childScenes.push(scene);


// new example scene with panorama background

var scene = new THREE.Scene();
scene.name = 'Zone 2';

var newScene=scene;


// model fbx
var clock = new THREE.Clock();
var mixers=[];
var loader = new THREE.FBXLoader();
				loader.load( './models/fbx/Samba Dancing.fbx', function ( object ) {
                    object.mixer = new THREE.AnimationMixer( object );
					mixers.push( object.mixer );
					var action = object.mixer.clipAction( object.animations[ 0 ] );
					action.play();
					object.traverse( function ( child ) {
						if ( child.isMesh ) {
							child.castShadow = true;
							child.receiveShadow = true;
						}
                    } );
                    object.rotateX(Math.PI/2);
                    object.scale.set(0.1,0.1,0.1)
					newScene.add( object );
				},  // called when loading is in progresses
                function ( xhr ) {
        
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        
                },
                // called when loading has errors
                function ( error ) {
        
                    console.log( 'An error happened', error );
        
                } );

//sphere
var geometry = new THREE.SphereBufferGeometry( 100, 60, 40 );

// invert the geometry on the x-axis so that all of the faces point inward
geometry.scale( - 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( {
    map: new THREE.TextureLoader().load( './images/pano.jpg' )
} );
mesh = new THREE.Mesh( geometry, material );
mesh.rotateX(Math.PI/2);
scene.add( mesh );

//lights
var ambientLight = new THREE.AmbientLight(0x444444);
ambientLight.intensity = 0.0;
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);

directionalLight.position.set(0, 4, 10).normalize();
scene.add(directionalLight);


scene.userData.cameraPosition = new THREE.Vector3(20,10,1.5);
scene.userData.cameraLookAt = new THREE.Vector3(0,0,0);
scene.userData.mixers = mixers;
scene.userData.clock = clock;
console.log(scene)
childScenes.push(scene);

