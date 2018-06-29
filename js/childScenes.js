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
for(let i=0; i<4; i++){
    var loader = new THREE.FBXLoader();
    loader.load( './models/fbx/Female Walk (1).fbx', function ( object ) {
        
       
       
       
        
       
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
        object.scale.set(0.01,0.01,0.01)
        object.position.y = i*4;
        newScene.add( object );

        
      
       
        
    },  // called when loading is in progresses
    function ( xhr ) {

        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

        console.log( 'An error happened', error );

    } );                 
}


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

//plane
var geo = new THREE.PlaneGeometry(200,200,1,1);
var mat = new THREE.MeshPhongMaterial({color: (0x444444)});
var plane = new THREE.Mesh(geo,mat);
plane.position.z +=-0.2;
scene.add(plane);


//lights
var ambientLight = new THREE.AmbientLight(0x444444);
ambientLight.intensity = 0.0;
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);

directionalLight.position.set(0, 4, 10).normalize();
scene.add(directionalLight);

//building
loadingOBJObjectWithMaterials('./models/CGC/CGC_A.obj','./models/CGC/CGC_A.mtl','CGC_A',scene,{offset:{x:-50,y:-100,z:0},unselectable:true, rotate:{x:1,y:0,z:0,angle:Math.PI/2}});

scene.userData.cameraPosition = new THREE.Vector3(5,5,2);
scene.userData.cameraLookAt = new THREE.Vector3(0,0,0);
scene.userData.mixers = mixers;
scene.userData.clock = clock;
console.log(scene)
childScenes.push(scene);


//end child scenes


//functions here:




function loadingOBJObjectWithMaterials(objPath,mtlPath,name,targetScene,options){
    
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

                                    
                                                                    
                                    targetScene.add(newObject)
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


                                    if(options.transparent){
                                        newObject.material.transparent=true;
                                        newObject.material.opacity=0.5;
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