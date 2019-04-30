var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var score = 0;
var seconds = 0;
var gamescreenscore = null;

window.addEventListener('load', init, false);

function init() {

    createScene();

    createLights();

    createNinja();
    createGround();
    createForest();
    setTimeout(createArrow, 10000);
    document.addEventListener('keydown', handleJump, false);
    document.addEventListener('touchstart', handleJump, false);

    loop();
    
}


// ----------- CREATING A SCENE --------- //
var scene, camera, fieldOfView, aspectRatio, farPlane, HEIGHT, WIDTH, renderer, container;

function createScene(){
    // Get the width and the height of the screen,
    // use them to set up the aspect ratio of the camera
    // and the size of the renderer.
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    // Create the scene
    scene = new THREE.Scene();

    // Add a fog effect to the scene; same colour as the
    scene.fog = new THREE.Fog(0xCFE1C7, 100, 950)

    //Create the camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 50;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

    // Set the position of the camera
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 50;

    // Create the renderer
    renderer = new THREE.WebGLRenderer({
        // Allow transparecy to show the gradient background
        // we defined in the css
        alpha: true,

        // Activate the anti-aliasing; Makes the game run worse

        antialias: true
    });

    // Define the size of the renderer; in this case, it will fill the screen
    renderer.setSize(WIDTH, HEIGHT);

    // Enable shadow rendering
    renderer.shadowMap.enabled = true;

    // Add the DOM element of the renderer to the 
    // container we created in the HTML
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', handleWindowResize, false);

    renderer.render(scene, camera);

    console.log(renderer);

    console.log('Created Scene');
}

function handleWindowResize(){
    // update height and width of the renderer and the camera
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH/ HEIGHT;
    camera.updateProjectionMatrix();
}

//LIGHTING

var hemisphereLight, shadowLight;

function createLights() {
    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intestiy of the light
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel. 
    shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    // Allow shadow casting
    shadowLight.castShadow = true;

    // define the visibile area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // define the resolution of the shadow; the hiegher the better,
    // but also the more expensive and less performant
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    // to activate the lights, just add them to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);

    console.log('Created Lights');
}

// --------- Ground Object --------- //
Ground = function() {

    // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
    var geom = new THREE.BoxGeometry(1500, 1300, 1000, 10, 10, 10);

    // rotate the geometry on the x axis
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

    // create the material
    var mat = new THREE.MeshPhongMaterial({
        color: 0x025138,
        transparent:false,
        opacity:1,
        shading:THREE.FlatShading,
    });

    // To create an object in Three.js, we have to create a mesh
    // which is a combination of a geometry and some material
    this.mesh = new THREE.Mesh(geom, mat);

    // Allow the ground to recieve shadows
    this.mesh.receiveShadow = true;
}

// ---------- Tree Group Object ---------//
Tree = function(){

    // Creates a small group of trees

	// Create an empty container that will hold a group of trees in the forest
	this.mesh = new THREE.Object3D();
	
	// create a cube geometry;
	// this is a single tree
	var geom = new THREE.BoxGeometry(3,500,3);
	
	// create a material; a simple green material
	var mat = new THREE.MeshPhongMaterial({
		color: 0x047450,  
	});
	
	// duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){
		
		// create the mesh by cloning the geometry
		var m = new THREE.Mesh(geom, mat); 
		
		// set the position of each tree randomly
		m.position.x = 150 + (-600 * Math.random() * Math.random());
		m.position.y = Math.random()*10;
		m.position.z = -160 + Math.random()*300;
	
		
		// set the size of the tree randomly
		var s = .1 + Math.random()*.9;
		m.scale.set(s,s,s);
		
		// allow each tree to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;
		
		// add the tree to the container we first created
		this.mesh.add(m);
	} 
}

// --------- Forest Object -------- //
Forest = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	// choose a number of tree groups to be scattered in the forest
	this.nTrees = 40;
	
    
	for(var i=0; i<this.nTrees; i++){
		var tree = new Tree();
	
		tree.mesh.position.y = 600
		tree.mesh.position.x = 300
		tree.mesh.position.z = -500
		
		// we also set a random scale for each tree group
		var s = 1+Math.random()*2;
		tree.mesh.scale.set(5,7,3);

		// Add the mesh of each tree group in the scene
		this.mesh.add(tree.mesh);  
	}  

}

// --------- Ninja Object ------- //
Ninja = function(){
    // Create an empty container
    this.mesh = new THREE.Object3D(); 
    this.mesh.name = 'ninja';

    // Head
    var headGeom = new THREE.BoxGeometry(10,10,15);
    var headMat = new THREE.MeshLambertMaterial({
        color: 0x2e6aa5,
        shading: THREE.FlatShading
    })
    var head = new THREE.Mesh(headGeom, headMat)
    head.position.set(3,33,0);
    head.rotation.z = -5;

    head.castShadow = true;
    head.receiveShadow = true;
    this.mesh.add(head);

    // Face
    var faceGeom = new THREE.BoxGeometry(5,5,16);
    var faceMat = new THREE.MeshLambertMaterial({
        color: 0xD3AF8E,
        shading: THREE.FlatShading
    })
    var face = new THREE.Mesh(faceGeom, faceMat)
    face.position.set(6,33,0);
    face.rotation.z= -5;
  
    face.castShadow = true;
    face.receiveShadow = true;
    this.mesh.add(face);

    // Eyes
    var eyesGeom = new THREE.BoxGeometry(1,1,17);
    var eyesMat = new THREE.MeshLambertMaterial({
        color: 0x000000,
        shading: THREE.FlatShading
    })
    var eyes = new THREE.Mesh(eyesGeom, eyesMat)
    eyes.position.set(6,33,0);
    eyes.rotation.z = -5
    
    eyes.castShadow = true;
    eyes.receiveShadow = true;
    this.mesh.add(eyes);

    // Torso
    var torsoGeom = new THREE.BoxGeometry(7,15,15);
    var torsoMat = new THREE.MeshLambertMaterial({
        color: 0x2e6aa5,
        shading: THREE.FlatShading
    })
    var torso = new THREE.Mesh(torsoGeom, torsoMat)
    torso.position.set(-4,23,0);
    torso.rotation.z = -0.7;

    torso.castShadow = true;
    torso.receiveShadow = true;
    this.mesh.add(torso);

    // Arm
    var armGeom = new THREE.BoxGeometry(14,3,3);
    var armMat = new THREE.MeshLambertMaterial({
        color: 0x2e6aa5,
        shading: THREE.FlatShading
    })
    var arm = new THREE.Mesh(armGeom, armMat)
    arm.position.set(-9,28,8);
    arm.castShadow = true;
    arm.receiveShadow = true;
    this.mesh.add(arm);

    // Leg  
    var legGeom = new THREE.BoxGeometry(14,4,3);
    var legMat = new THREE.MeshLambertMaterial({
        color: 0x2e6aa5,
        shading: THREE.FlatShading
    })
    this.leg = new THREE.Mesh(legGeom, legMat)
    this.leg.position.set(-8,14,6.8);
    this.leg.rotation.z = 0.8;

    this.leg.castShadow = true;
    this.leg.receiveShadow = true;
    this.mesh.add(this.leg);

    // Leg 2
    var leg2Geom = new THREE.BoxGeometry(14,4,3);
    var leg2Mat = new THREE.MeshLambertMaterial({
        color: 0x2e6aa5,
        shading: THREE.FlatShading
    })
    this.leg2 = new THREE.Mesh(leg2Geom, leg2Mat)
    this.leg2.position.set(-8,10,0);
    this.leg2.rotation.z = 0.8;

    this.leg2.castShadow = true;
    this.leg2.receiveShadow = true;
    this.mesh.add(this.leg2);

}


// ---------- Arrow Object ---------- //
var pivot;
Arrow = function() {

    // This is a container for the whole Arrow object
    this.mesh = new THREE.Object3D(); 
    this.mesh.name = 'arrow';


    // Pivoting the Arrow ---- This does not work yet
    var box = new THREE.Box3().setFromObject(this.mesh);
    box.getCenter(this.mesh.position); // this re-sets the mesh position
    console.log(this.mesh.position);
    this.mesh.position.multiplyScalar( - 1 );

    pivot = new THREE.Group();
    pivot.add(this.mesh);
    scene.add(pivot);
    

    // Arrow Head
    var arrowHeadGeom = new THREE.TetrahedronGeometry(3,0);
    var arrowHeadMat = new THREE.MeshPhongMaterial({
        color: 0xC0C0C0,
        shading: THREE.FlatShading
    })

    var arrowHead = new THREE.Mesh(arrowHeadGeom, arrowHeadMat);
    arrowHead.position.set(20,20,4);
    arrowHead.rotation.y = (30*Math.PI)/180;
    arrowHead.rotation.z = (45*Math.PI)/180;
    arrowHead.castShadow = true;
    arrowHead.receiveShadow = true;
    this.mesh.add(arrowHead);

    // Arrow cylinder 
    var arrowBodyGeom = new THREE.CylinderGeometry(1, 1, 20, 32)
    var arrowBodyMat = new THREE.MeshLambertMaterial({
        color: 0x663300,
        shading: THREE.FlatShading
    })

    var arrowBody = new THREE.Mesh(arrowBodyGeom, arrowBodyMat);
    arrowBody.position.set(30,20,4);
    arrowBody.rotation.z = (90*Math.PI)/180;
    arrowBody.castShadow = true;
    arrowBody.receiveShadow = true;
    this.mesh.add(arrowBody);

}


// --------- Create the Ground -------- //
var ground;
function createGround(){
    ground = new Ground();

    // push it a little bit at the bottom of the scene
    ground.mesh.position.y = -500;

    // add the mesh of the sea to the scene
    scene.add(ground.mesh);
    console.log(ground)
}

// -------- Create the Forest ------- //
var forestArray=[];
function createForest(){
	forestArray[0] = new Forest();
    forestArray[1] = new Forest();

    forestArray[1].mesh.position.x = 2000;
    for(let i=0; i<2; i++){
        
        forestArray[i].mesh.position.y = -600;
        scene.add(forestArray[i].mesh);
    }
}


// -------- Create the Ninja ------- //
var ninja;
function createNinja(){
    ninja = new Ninja();
    scene.add(ninja.mesh);
}


// -------- Spawn Arrow ------------ //
var arrowSpawn=[];
function createArrow(){
    if(arrowSpawn.length == 0){
        var arrow = new Arrow();
        arrowSpawn.push(arrow);
        arrowSpawn[0].mesh.position.x = 175;
        scene.add(arrowSpawn[0].mesh);
    }
}


// --------- Jump Handler ----------- //
var jump = false;
var disableJump = false;
function handleJump(e) {
    if (disableJump === false){
        if (jump === false){
            if(e.keyCode == 32){
                jump = !jump;
            }
            else if(e.type == "touchstart"){
                jump = !jump;
            }
        }
    }
}


// ------- Animation Vars --------- //
var ninjaSwitch = false;
var jumpIncrease = 0;
var jumpTotal = 0;
var arrowSpeed = 3;
var hit = false;


// -------- Loop On Each Frame -------//
function loop() {
    // // Forest Animation
    for(let i=0; i<2; i++){
         forestArray[i].mesh.position.x -= 3;
    }

    if((forestArray[0].mesh.position.x) <= (-2300)){
        forestArray.push(forestArray.shift());
        forestArray[1].mesh.position.x = 2000;
    }

    // Ninja Animation

        //Leg 1
        if ((ninja.leg.position.y > (14 + jumpTotal)) || (ninja.leg.position.y < (10 + jumpTotal))) {
            ninjaSwitch = !ninjaSwitch;
        }

        if (ninjaSwitch == true){
            ninja.leg.position.y -= (3/10);
        } else if (ninjaSwitch == false){
            ninja.leg.position.y += (3/10);
        }

        //Leg 2
        if (ninjaSwitch == true){
            ninja.leg2.position.y += (3/10);
        } else if (ninjaSwitch == false){
            ninja.leg2.position.y -= (3/10);
        }


        //Jumping
        if(jump == true){
            jumpIncrease = 1.5;
            jumpTotal += 1.5;
            ninja.mesh.position.y += jumpIncrease;
            if(jumpTotal >= 40 && !disableJump){
                jump = !jump;
                jumpIncrease = 0;
                disableJump = true;
            }
        }else {
            jumpIncrease = 0;
            if(jumpTotal > 0){
                jumpIncrease = -1.5;
                jumpTotal += -1.5;
                ninja.mesh.position.y += jumpIncrease;
            }
            else {
                disableJump = false;
            }
        }


        //Arrow Spawn Animation
        if(arrowSpawn[0] != undefined){
            if (arrowSpawn[0].mesh.position.x < (-250)){
                arrowSpawn[0].mesh.position.x = 175;
                arrowSpeed = ((4.5*Math.random())+1);
            }
            arrowSpawn[0].mesh.position.x -= arrowSpeed;
        }

        //Losing
        if(arrowSpawn[0] != undefined){
            if((ninja.mesh.position.y < 15) && 
            ((arrowSpawn[0].mesh.position.x <= -20)&&(arrowSpawn[0].mesh.position.x >= -23))){
                console.log('You lose!')
                container.removeChild(renderer.domElement);

                var gameOver = `<div id="gameover"><h1>Game Over</h1><h3>Refresh to Play Again</h3></div>`;

                var parser = new DOMParser();
                var doc = parser.parseFromString(gameOver, 'text/xml')
                container.appendChild(doc.firstChild);

                return null
            }
        }
    
    var gamescreenscore = document.querySelector('#game-score');


    gamescreenscore.textContent = `Score: ${score}`;

    // render the scene
    renderer.render(scene,camera);
    
    seconds++;
    if(seconds%100 == 0){
        score++;
    }


    // call the loop function again
    requestAnimationFrame(loop);

}



