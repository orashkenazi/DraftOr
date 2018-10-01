let renderer = new THREE.WebGLRenderer();
renderer.domElement.id = 'renderer';
document.getElementById("loading").appendChild( renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight);
renderer.setPixelRatio( window.devicePixelRatio );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100000000000 );

camera.up = new THREE.Vector3(0,0,1);



let loadingFinished = false;
let loadingPercentage = 0.0;
let loadingScene = new THREE.Scene();
let terrainMesh = null;
let loading_events = [];
let loadingAnimation = null;

//create wirematerial for loading
let loadMaterial = null;







addGround();


animateLoading();


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
      initLoadingScene();
    
    

  
     
  
      
    }



function calculateLoading(){

    //console.log( loading_events)
    loading_total =0;
    loading_downloaded=0;
    for(let i=0; i < loading_events.length; i++){
     
        loading_total=loading_total + loading_events[i].total;
        loading_downloaded = loading_downloaded + loading_events[i].loaded;
    }

    loadingPercentage = loading_downloaded/loading_total;
    loadMaterial.uniforms.loading.value = loadingPercentage;
    document.getElementById("loadingProgressText").innerHTML =  Math.floor(loadingPercentage*100) == 100 ? 99 : Math.floor(loadingPercentage*100);
    console.log('calc loading runs ' + loadingPercentage    )

    if( loadingPercentage >= 1) {
        console.log('loadingFinished')
        renderer.render(loadingScene,camera)
        loadingFinished = true;
        
    }


}


function initLoadingScene(){

    console.log('initlpoadingrun')
        
   

    let uniforms = {
        loading: {value: 0.0}
    }
    var geo = new THREE.EdgesGeometry( terrainMesh.geometry ); // or WireframeGeometry( geometry )

    loadMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent,
        transparent: true
    })
    

    var wireframe = new THREE.LineSegments( geo, loadMaterial );
    wireframe.position.x=   terrainMesh.position.x;
    wireframe.position.y=   terrainMesh.position.y;
    wireframe.position.z=   terrainMesh.position.z;
    loadingScene.add(wireframe);
    

   

    camera.position.set( -30000, 30000 , 10600 );
    camera.lookAt( new THREE.Vector3(0,0, 0 ) );
    //controls.target = new THREE.Vector3( -650  , -500 , 300)


    
  
}

function animateLoading() {
    loadingAnimation = requestAnimationFrame( animateLoading );
    
    //controls.update();
    if(loadingFinished){
      cancelAnimationFrame(loadingAnimation)
       
    }
    
    else {
        //spin:
        console.log('rendering')
        loadingScene.rotateZ(0.002)
        renderer.render(loadingScene,camera);
    }
 
    
    
}