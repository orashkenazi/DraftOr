
var activePage = null;


function InteractivePage(id,scene,renderer)  {
    
    this.id = id;
    this.interactivePageAnimation = null;
    this.scene = new THREE.Scene();
    
    if (scene) this.scene = scene;
    this.renderer =renderer;
    this.camera = null;
    this.controls = null;
    this.mouse = new THREE.Vector2(-2,-2)
    this.INTERSECTED = null;
    this.hoverColor = new THREE.Color ( 0xffffff)
    this.lastColor = null;
    this.planes = [];
    this.clippingCube = null;
    this.init();
    
    

}

InteractivePage.prototype.init = function (){
    
    
    var canvasdiv = document.getElementById("canvasarea_"+this.id);
    
    var width = canvasdiv.clientWidth;
    
    
    this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 70000 );
    
    this.raycaster = new THREE.Raycaster();
    

    
    this.renderer.setSize( width, width);
    
    canvasdiv.appendChild( this.renderer.domElement );
    this.renderer.domElement.style.border="1px solid rgba(169, 169, 169, 0.527)";
    this.renderer.domElement.classList.remove('hidefordemo') // for demo
    if ( interactiveObjects[this.id].name === "Zone 3"){   //for demo..
        let img = document.createElement("img");
        img.src="./images/zone3.PNG";
        img.style="width:100%; border: 1px solid rgba(169, 169, 169, 0.527);";
        
        canvasdiv.appendChild(img)

        this.renderer.domElement.classList.add('hidefordemo')
    } 

    if ( interactiveObjects[this.id].name === "Piton des Neiges"){   //for demo..
        let img = document.createElement("img");
        img.src="./images/piton.jpg";
        img.style="width:100%; border: 1px solid rgba(169, 169, 169, 0.527);";
        canvasdiv.appendChild(img)
        this.renderer.domElement.classList.add('hidefordemo')
    } 

    if ( interactiveObjects[this.id].name === "Rue Marechal Leclerc"){   //for demo..
        let img = document.createElement("img");
        img.src="./images/mainstreet.PNG";
        img.style="width:100%; border: 1px solid rgba(169, 169, 169, 0.527);";
        canvasdiv.appendChild(img)
        this.renderer.domElement.classList.add('hidefordemo')
    } 



    // just creating an empty pictures array if doesnt exist:
    if (this.scene.userData.pictures == null) { this.scene.userData.pictures=[]}
    
    this.camera.position.set( 100, 100 ,100 )
    if (this.scene.userData.cameraPosition) { 
        console.log('Scene userData contains starting camera position. Setting the camera position.');
        this.camera.position.set(this.scene.userData.cameraPosition.x,this.scene.userData.cameraPosition.y,this.scene.userData.cameraPosition.z);
    }

    this.camera.up = new THREE.Vector3(0,0,1);

    

    //add Orbit Controls
    this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.target = new THREE.Vector3( 0  , 0 , 0);
    if (this.scene.userData.cameraLookAt) { 
        console.log('Scene userData contains starting camera target. Setting the control target.');    
        this.controls.target = this.scene.userData.cameraLookAt;
    }
    updatePositionMark(this.controls.target);
    this.controls.minPolarAngle=0.1*Math.PI/2;
    this.controls.maxPolarAngle=0.98*Math.PI/2;
    this.controls.autoRotateSpeed = 0.2 ;
    this.controls.autoRotate = false;
    


  

    this.renderer.clippingPlanes = [];

    // adding clipping controls
   clippingCube = new THREE.Geometry();
   var cc = {o:new THREE.Vector3( -200, -200, -200 ),a:new THREE.Vector3( 400, 0, 0 ),b:new THREE.Vector3( 0, 400, 0 ),c:new THREE.Vector3( 0, 0, 400 )}
    
    clippingCube.vertices.push(
        cc.o.clone(),
        cc.o.clone().add(cc.a),
        cc.o.clone().add(cc.b),
        cc.o.clone().add(cc.a).add(cc.b),
        cc.o.clone().add(cc.c),
        cc.o.clone().add(cc.a).add(cc.c),
        cc.o.clone().add(cc.b).add(cc.c),
        cc.o.clone().add(cc.a).add(cc.b).add(cc.c)
        
    );
    this.clippingCube = clippingCube;


    //plane   
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        clippingCube.vertices[0],
        clippingCube.vertices[1],
        clippingCube.vertices[2],
        clippingCube.vertices[3],
    );
    geometry.faces.push( 
        new THREE.Face3( 0, 2, 1 ),
        new THREE.Face3( 2, 3, 1 ),
    );
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

   var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide, transparent:true, opacity: 0.5, depthWrite: false} );
   
   var planeZDown = new THREE.Mesh(geometry,material)
    planeZDown.clippingPlaneRef = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), -geometry.vertices[0].z + 0.1);
   this.renderer.clippingPlanes.push(planeZDown.clippingPlaneRef)
   this.scene.add(planeZDown);
   clippingCube.planeZDown = planeZDown;

//plane
   var geometry = new THREE.Geometry();
    geometry.vertices.push(
        clippingCube.vertices[4],
        clippingCube.vertices[5],
        clippingCube.vertices[6],
        clippingCube.vertices[7],
    );
    geometry.faces.push( 
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 1, 3, 2 ),
    );
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
   

   var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, transparent:true, opacity: 0.5, depthWrite: false} );
   
   var planeZUp = new THREE.Mesh(geometry,material)
   planeZUp.clippingPlaneRef = new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), geometry.vertices[0].z+0.1 );
   this.renderer.clippingPlanes.push(planeZUp.clippingPlaneRef)
   this.scene.add(planeZUp);
   clippingCube.planeZUp = planeZUp;

  
   //plane
   var geometry = new THREE.Geometry();
    geometry.vertices.push(
        clippingCube.vertices[0],
        clippingCube.vertices[2],
        clippingCube.vertices[4],
        clippingCube.vertices[6],
    );
    geometry.faces.push( 
        new THREE.Face3( 1, 0, 2 ),
        new THREE.Face3( 3, 1, 2 ),
    );
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

   var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide, transparent:true, opacity: 0.5, depthWrite: false} );
   
   var planeXDown = new THREE.Mesh(geometry,material)
   planeXDown.clippingPlaneRef = new THREE.Plane( new THREE.Vector3( 1, 0, 0 ), -geometry.vertices[0].x + 0.1);
   this.renderer.clippingPlanes.push(planeXDown.clippingPlaneRef)
   this.scene.add(planeXDown);
   clippingCube.planeXDown = planeXDown;
   

   
   //plane
   var geometry = new THREE.Geometry();
    geometry.vertices.push(
        clippingCube.vertices[1],
        clippingCube.vertices[3],
        clippingCube.vertices[5],
        clippingCube.vertices[7],
    );
    geometry.faces.push( 
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 1, 3, 2 ),
    );
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

   var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, transparent:true, opacity: 0.5, depthWrite: false} );
   
   var planeXUp = new THREE.Mesh(geometry,material)
   planeXUp.clippingPlaneRef = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), geometry.vertices[0].x + 0.1);
   this.renderer.clippingPlanes.push(planeXUp.clippingPlaneRef)
   this.scene.add(planeXUp);
   clippingCube.planeXUp = planeXUp;

   //plane
   var geometry = new THREE.Geometry();
    geometry.vertices.push(
        clippingCube.vertices[0],
        clippingCube.vertices[1],
        clippingCube.vertices[4],
        clippingCube.vertices[5],
    );
    geometry.faces.push( 
        new THREE.Face3( 0, 1, 2 ),
        new THREE.Face3( 1, 3, 2 ),
    );
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

   var material = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide, transparent:true, opacity: 0.5, depthWrite: false} );
   
   var planeYDown = new THREE.Mesh(geometry,material)
   planeYDown.clippingPlaneRef = new THREE.Plane( new THREE.Vector3( 0, 1, 0 ), -geometry.vertices[0].y + 0.1);
   this.renderer.clippingPlanes.push(planeYDown.clippingPlaneRef)
   this.scene.add(planeYDown);
   clippingCube.planeYDown = planeYDown;

    //plane
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        clippingCube.vertices[2],
        clippingCube.vertices[3],
        clippingCube.vertices[6],
        clippingCube.vertices[7],
    );
    geometry.faces.push( 
        new THREE.Face3( 1, 0, 2 ),
        new THREE.Face3( 3, 1, 2 ),
    );
    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

   var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide, transparent:true, opacity: 0.5, depthWrite: false} );
   
   var planeYUp = new THREE.Mesh(geometry,material)
   planeYUp.clippingPlaneRef = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), geometry.vertices[0].y + 0.1);
   this.renderer.clippingPlanes.push(planeYUp.clippingPlaneRef)
   this.scene.add(planeYUp);
   clippingCube.planeYUp = planeYUp;

   
    //hiding cube:
    this.clippingCube.planeXDown.visible=false;
    this.clippingCube.planeXUp.visible=false;
    this.clippingCube.planeYDown.visible=false;
    this.clippingCube.planeYUp.visible=false;
    this.clippingCube.planeZDown.visible=false;
    this.clippingCube.planeZUp.visible=false;

    //this.toggleClipMode();
    this.renderer.clippingPlanes = [] //cancel clipping for a second.
    
    

    //clipping mouse events:

    canvasdiv.addEventListener( 'mousedown', this.onMouseDownClip.bind(this), false );
    canvasdiv.addEventListener( 'mouseup', this.onMouseUpClip.bind(this), false );
    canvasdiv.addEventListener( 'mousemove', this.onMouseMoveClip.bind(this), false );

    //other events (intersected and click..)
    canvasdiv.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
    canvasdiv.addEventListener( 'mousedown', this.onMouseClick.bind(this), false );




}

InteractivePage.prototype.toggleClipMode = function(){

    var state =  !(this.clippingCube.planeXDown.visible);
    this.clippingCube.planeXDown.visible=state;
    this.clippingCube.planeXUp.visible=state;
    this.clippingCube.planeYDown.visible=state;
    this.clippingCube.planeYUp.visible=state;
    this.clippingCube.planeZDown.visible=state;
    this.clippingCube.planeZUp.visible=state;

}

InteractivePage.prototype.onMouseDownClip = function(){
    

    if(event.path[0].id!='page_renderer'){
        
        return;
    }
    
    var intersects = this.raycaster.intersectObjects(this.scene.children,true);
    if (intersects.length>0){
        if ( (this.clippingCube.planeXDown == intersects[0].object) || (this.clippingCube.planeYDown == intersects[0].object) || (this.clippingCube.planeZDown == intersects[0].object) || (this.clippingCube.planeXUp == intersects[0].object) || (this.clippingCube.planeYUp == intersects[0].object) || (this.clippingCube.planeZUp == intersects[0].object)){
            this.clippingCube.chosenPlane = intersects[0].object;
            this.clippingCube.chosenPlane.material.opacity = 0.8;
            this.controls.enabled = false;
        }
    }

}

InteractivePage.prototype.onMouseUpClip = function(){
    if(this.clippingCube.chosenPlane){
        this.clippingCube.chosenPlane.material.opacity = 0.5;
        this.clippingCube.chosenPlane = null;
        this.controls.enabled = true;
    }
   
    

}

InteractivePage.prototype.onMouseMoveClip = function(event){ 
    if(this.clippingCube.chosenPlane){
        
        let normal = this.clippingCube.chosenPlane.geometry.faces[0].normal.clone();
        
        let lookat = new THREE.Vector3()
        this.camera.getWorldDirection( lookat )
        let x = lookat.clone().cross(camera.up)
        
        let y = x.clone().cross(lookat);
        
        x.normalize();
        y.normalize();

        x.x = x.x*event.movementX;
        x.y = x.y*event.movementX;
        x.z = x.z*event.movementX;

        y.x = -y.x*event.movementY;
        y.y = -y.y*event.movementY;
        y.z = -y.z*event.movementY;

        let movement = normal.clone().dot(x) +normal.clone().dot(y)
        
        normal.x = movement*normal.x;
        normal.y = movement*normal.y;
        normal.z = movement*normal.z;
        
        

        for(let n = 0; n<8; n++){
           
            if (!(this.clippingCube.chosenPlane.geometry.vertices[0] === this.clippingCube.vertices[n])){
                
                if(this.clippingCube.chosenPlane.geometry.vertices[0].clone().add(normal).distanceTo(this.clippingCube.vertices[n])<5){
                  
                    return;
                }

                
                
               // if( (this.clippingCube.chosenPlane.geometry.vertices[0].clone().add(normal).x < 0)  ||(this.clippingCube.chosenPlane.geometry.vertices[0].clone().add(normal).y < 0) || (this.clippingCube.chosenPlane.geometry.vertices[0].clone().add(normal).z < 0) ){
                    //console.log('no negative placed plane allowed')
                    //return;
              //  }

            }
          
        }


        for(let i=0; i<4; i++){

           
            
            this.clippingCube.chosenPlane.geometry.vertices[i].add(normal);

          
            
                 
           
          

        }


        //if did something not good, cancel movement:
        if(
            (this.clippingCube.vertices[4].z-this.clippingCube.vertices[0].z<0) ||
            (this.clippingCube.vertices[2].y-this.clippingCube.vertices[0].y<0) ||
            (this.clippingCube.vertices[1].x-this.clippingCube.vertices[0].x<0) 
        ){ 
            console.log('flipped cube..canceling')
            for(let i =0 ; i <4; i++) {
                this.clippingCube.chosenPlane.geometry.vertices[i].sub(normal);
               
            }
            return;
        }

           //chagning clipping if all ok:
        if (this.clippingCube.chosenPlane === this.clippingCube.planeZUp){
          this.clippingCube.chosenPlane.clippingPlaneRef.constant=this.clippingCube.chosenPlane.geometry.vertices[0].z+0.1;
           
        }

        if (this.clippingCube.chosenPlane === this.clippingCube.planeZDown){
    
           this.clippingCube.chosenPlane.clippingPlaneRef.constant= -this.clippingCube.chosenPlane.geometry.vertices[0].z+0.1;
    
        }

        if (this.clippingCube.chosenPlane === this.clippingCube.planeXUp){
          this.clippingCube.chosenPlane.clippingPlaneRef.constant=this.clippingCube.chosenPlane.geometry.vertices[0].x+0.1;
           
        }

        if (this.clippingCube.chosenPlane === this.clippingCube.planeXDown){
    
            this.clippingCube.chosenPlane.clippingPlaneRef.constant= -this.clippingCube.chosenPlane.geometry.vertices[0].x+0.1;
    
        }

        if (this.clippingCube.chosenPlane === this.clippingCube.planeYUp){
            this.clippingCube.chosenPlane.clippingPlaneRef.constant=this.clippingCube.chosenPlane.geometry.vertices[0].y+0.1;
           
        }

        if (this.clippingCube.chosenPlane === this.clippingCube.planeYDown){
    
           this.clippingCube.chosenPlane.clippingPlaneRef.constant= -this.clippingCube.chosenPlane.geometry.vertices[0].y+0.1;
    
        }

       this.clippingCube.planeXDown.geometry.verticesNeedUpdate = true;
       this.clippingCube.planeXDown.geometry.boundingSphere = null;
       this.clippingCube.planeXDown.geometry.boundingBox = null;
       

       this.clippingCube.planeXUp.geometry.verticesNeedUpdate = true;
       this.clippingCube.planeXUp.geometry.boundingSphere = null;
       this.clippingCube.planeXUp.geometry.boundingBox = null;

       this.clippingCube.planeYDown.geometry.verticesNeedUpdate = true;
       this.clippingCube.planeYDown.geometry.boundingSphere = null;
       this.clippingCube.planeYDown.geometry.boundingBox = null;


       this.clippingCube.planeYUp.geometry.verticesNeedUpdate = true;
       this.clippingCube.planeYUp.geometry.boundingSphere = null;
       this.clippingCube.planeYUp.geometry.boundingBox = null;

       this.clippingCube.planeZDown.geometry.verticesNeedUpdate = true;
       this.clippingCube.planeZDown.geometry.boundingSphere = null;
       this.clippingCube.planeZDown.geometry.boundingBox = null;

       this.clippingCube.planeZUp.geometry.verticesNeedUpdate = true;
       this.clippingCube.planeZUp.geometry.boundingSphere = null;
       this.clippingCube.planeZUp.geometry.boundingBox = null;

            
            
        
        



       
    }
   
    

}

InteractivePage.prototype.onMouseMove = function(event){
    

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	this.mouse.x = ( event.layerX /( this.renderer.domElement.clientWidth/1)  ) * 2 - 1;
    this.mouse.y = - ( event.layerY / (this.renderer.domElement.clientHeight/1) ) * 2 + 1;
  

}

InteractivePage.prototype.onMouseClick = function(event){
    
    
    if(event.path[0].id!='page_renderer'){
        
        return;
    }
    
    var intersects = this.raycaster.intersectObjects(this.scene.children,true);
    if (intersects.length>0){
        if (intersects[0].object.parent != this.scene) {
            intersects[0].object = intersects[0].object.parent
        }
       
        if (intersects.length>0 && this.scene.userData.pictures.indexOf(intersects[0].object)!=-1)
        {
                     
            console.log(intersects[0].object.userData.url);
        }
    }
  
   
}

InteractivePage.prototype.render = function() {
 
	
    this.raycaster.setFromCamera( this.mouse, this.camera );
   
	
    var intersects = this.raycaster.intersectObjects(this.scene.children,true );
   
    
        if ( (intersects.length > 0) && ( ( this.scene.userData.zones.indexOf(intersects[0].object) !=-1 ) || ( this.scene.userData.pictures.indexOf(intersects[0].object) !=-1 ) || (this.clippingCube.planeXDown == intersects[0].object) || (this.clippingCube.planeYDown== intersects[0].object) || (this.clippingCube.planeZDown== intersects[0].object) || (this.clippingCube.planeXUp== intersects[0].object) || (this.clippingCube.planeYUp == intersects[0].object) || (this.clippingCube.planeZUp == intersects[0].object)) ) {
            
            /*the next "if" statment is because we load objects with groups (childrens..) hence, we need to change the intersectred 
        object to be the group and not the objects. but we dont want to do it to all objects (only the one who are children of objects).
        the "gloabal-without parent objects" (those in myObjects) actually have parent, and its the scene object.
        anyway in this way we can make sure that when a child of an object is intersected, it will act as if it choose the all group  ( hisparent object) */

            if (intersects[0].object.parent != this.scene) {         
        
                intersects[0].object = intersects[0].object.parent
                
            }
                        if ( this.INTERSECTED != intersects[ 0 ].object ) {
                            
                            if ( this.INTERSECTED ) { this.INTERSECTED.material.color = this.lastColor;}
                            
                            this.INTERSECTED = intersects[ 0 ].object
                            this.lastColor = this.INTERSECTED.material.color;
                            this.INTERSECTED.material.color = this.hoverColor;
                        
                        }
                        
                    } else {
                        
                        if ( this.INTERSECTED ) {this.INTERSECTED.material.color = this.lastColor ; } 
                        this.INTERSECTED = null;
                        
                    
                    }
        

        this.renderer.render( this.scene, this.camera );

}

InteractivePage.prototype.animate = function(){
    
       this.interactivePageAnimation = requestAnimationFrame( this.animate.bind(this)  );
        
        
        this.controls.update();
        this.updateDOMElements();

        // if there is animation of person;
        if (this.scene.userData.mixers) {
            if ( this.scene.userData.mixers.length > 0 ) {
                var tick = this.scene.userData.clock.getDelta();
                
                for ( var i = 0; i < mixers.length; i ++ ) {
                    
                    this.scene.userData.mixers[i].update( tick );
                    
                    this.scene.userData.mixers[i]._root.position.y+=-tick*1.3;

                    if (this.scene.userData.mixers[i]._root.position.y <-30) {
                        this.scene.userData.mixers[i]._root.position.y = 0;
                    }
                }
            }
        }
       

        this.render();
       
  
}







InteractivePage.prototype.close = function(){
    console.log('close runs for id=', this.id)
    cancelAnimationFrame(  this.interactivePageAnimation );
    
 

   
    let canvasdiv =  this.renderer.domElement.parentNode;
    canvasdiv.removeChild(this.renderer.domElement);


    let grid=canvasdiv.parentNode;
    canvasdiv.remove();

    var canvas = document.createElement("div");
    canvas.id = "canvasarea_"+this.id;
    canvas.classList.add("interactivePage-content-canvas");
  
    grid.appendChild(canvas);

    
    //removing clipping's stuff
  
    this.scene.remove(this.clippingCube.planeXUp)
    this.scene.remove(this.clippingCube.planeZUp)
    this.scene.remove(this.clippingCube.planeYUp)
    this.scene.remove(this.clippingCube.planeXDown)
    this.scene.remove(this.clippingCube.planeYDown)
    this.scene.remove( this.clippingCube.planeZDown)
    this.clippingCube.dispose();

    activePage=null;
   
    
    
    
 
   
}

InteractivePage.prototype.createDOMElements = function(){

    var canvasdiv = this.renderer.domElement.parentNode;
    if (this.scene.userData.zones == null) { this.scene.userData.zones=[]}
    for(let i=0; i < this.scene.userData.zones.length ; i++){

        var labelparent = document.createElement("div");
        labelparent.id="zoneLabel"+i;
        labelparent.style="position: absolute; top:0px; left:0px;z-index:+3; pointer-events:none;";
    
        var label = document.createElement("div"); //creating tag
        label.id="textLabel"+i;
        label.classList.add("sd-labeltext");
        
        label.addEventListener("mouseenter",function(){console.log('entered')},false)
        label.addEventListener("mouseout",function(){console.log('out')},false)
        label.appendChild(document.createTextNode('dadad'));
    
        labelparent.appendChild(label); //adding tag
    
        var line = document.createElement("div"); //creating and adding line
        line.classList.add("sd-labelline");
        labelparent.appendChild(line); 
    
        canvasdiv.appendChild(labelparent);

    }
    
    
    
}

InteractivePage.prototype.updateDOMElements = function(){
    
    var toScreenPosition2 = function (obj, camera){              //calc 2d coordinate of object
        
        var vector = new THREE.Vector3();
        
        var widthHalf = 0.5*this.renderer.context.canvas.width;
        var heightHalf = 0.5*this.renderer.context.canvas.height;
       
       // obj.updateMatrixWorld();
       // vector.setFromMatrixPosition(obj.matrixWorld);
       vector.x = + obj.position.x;
       vector.y = + obj.position.y;
       vector.z = + obj.position.z;
        vector.project(camera);
        
        
        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;
    
        
        if(vector.z>1 || vector.x<-60 || vector.y < 0 || vector.y>this.renderer.domElement.parentNode.getBoundingClientRect().height+60 || vector.x>this.renderer.domElement.parentNode.getBoundingClientRect().width){
          return {
                    x:-400,
                    y:-400
        };
        }
        
        return { 
            x: vector.x,
            y: vector.y
        };
    
    }

    for( let i=0; i< this.scene.userData.zones.length; i++){
        var parent = this.renderer.domElement.parentNode.parentNode.parentNode.parentNode;
        var proj = toScreenPosition2.call(this,this.scene.userData.zones[i], this.camera);
        
        document.getElementById("zoneLabel"+i).style.left=this.renderer.domElement.parentNode.getBoundingClientRect().left - parent.getBoundingClientRect().left+proj.x+'px';
        document.getElementById("zoneLabel"+i).style.top=this.renderer.domElement.parentNode.getBoundingClientRect().top  - parent.getBoundingClientRect().top +proj.y+'px';
     
        
     

    }
    
  
    
    
    
}

InteractivePage.prototype.onWindowResize = function(){
    
    let canvasdiv = this.renderer.domElement.parentNode;
    this.renderer.domElement.style.display='none';
    this.renderer.setSize(canvasdiv.clientWidth,canvasdiv.clientWidth);
    this.renderer.domElement.style.display='block';
}




function closeAllPages(){
    //close active page
    if(activePage) { activePage.close(); }
    
    //reset all pages all other interactive pages...
    for(let i=0; i<interactiveObjects.length; i++){
        
        document.getElementById('interactivePage_'+i).style.left="100%";
      
    }

    
}

function loadInteractivePageCanvas(id,renderer){
    
    let scene = new THREE.Scene();
    scene.name = 'empty scene';
    scene.userData.zones = [];
    scene.userData.pictures = [];
    for (let i=0; i < childScenes.length; i++){
       
        if (interactiveObjects[id].name === childScenes[i].name) {
            scene = childScenes[i];
        }
    }

    console.log( 'loadingInteractivePageCanvas runs, loading scene:'+scene.name )
           
    
  
    if (activePage) activePage.close();
   

    var newPage = new InteractivePage(id,scene,renderer);
    document.getElementById('interactivePage_'+id).style.left="22%";
    newPage.createDOMElements();
    newPage.animate();
    
    activePage = newPage;
    
    
  

}

function closeInteractivePageCanvas(id){
   console.log('closeInteractivePageCanvas runs')
    closeAllPages();
   
  

}



