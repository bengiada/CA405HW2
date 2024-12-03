/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor, setMesh, 
 * 					draw, setAmbientLight, setSpecularLight and enableLighting functions 
 *      @task3 : 
 *      @task4 : 
 * 		
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	constructor() {
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');

		this.colorLoc = gl.getUniformLocation(this.prog, 'color');

		this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');


		this.vertbuffer = gl.createBuffer();
		this.texbuffer = gl.createBuffer();

		this.numTriangles = 0;

		/**
		 * @Task2 : You should initialize the required variables for lighting here
		 */
		this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
		this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
		this.normLoc = gl.getAttribLocation(this.prog, 'normal');
		this.normbuffer = gl.createBuffer();

		this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos'); //from light to object? vector

		this.specularLoc = gl.getUniformLocation(this.prog, 'specular');

		this.viewPosLoc = gl.getUniformLocation(this.prog, 'viewPos');

		this.showSecondTexLoc = gl.getUniformLocation(this.prog, 'showSecondTex');

		this.blendingLoc = gl.getUniformLocation(this.prog, 'blending');
		this.blendingTypeLoc = gl.getUniformLocation(this.prog, 'blendingType');


	}

	setMesh(vertPos, texCoords, normalCoords) {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// update texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		this.numTriangles = vertPos.length / 3;

		/**
		 * @Task2 : You should update the rest of this function to handle the lighting
		 */

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.DYNAMIC_DRAW);
		//using normalCoords
	}

	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw(trans) {
		gl.useProgram(this.prog);

		gl.uniformMatrix4fv(this.mvpLoc, false, trans);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

		/**
		 * @Task2 : You should update this function to handle the lighting
		 */

		///////////////////////////////
		//TO DO - something wrong here
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.enableVertexAttribArray(this.normLoc);
		gl.vertexAttribPointer(this.normLoc, 3, gl.FLOAT, false, 0, 0);
		
		//lightX, lightY
		gl.uniform3f(this.lightPosLoc, lightX, lightY, lightZ); //TO - make this from light to vertex
		gl.uniform3f(this.viewPosLoc, 0,0,-3);

		updateLightPos();
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);

	}

	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture(img) {
		const texture = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0);

		gl.bindTexture(gl.TEXTURE_2D, texture);

		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			//console.error("Task 1: Non power of 2, you should implement this part to accept non power of 2 sized textures");

			/**
			 * @Task1 : You should implement this part to accept non power of 2 sized textures
			 */
			//img.width = Math.pow(2,Math.ceil(Math.log2(img.width))); //could be floor too TODO
			//img.height = Math.pow(2,Math.ceil(Math.log2(img.height)));
			
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		gl.useProgram(this.prog);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		const sampler = gl.getUniformLocation(this.prog, 'tex');
		gl.uniform1i(sampler, 0);
	}

	setTexture2(img) {
		var texture2 = gl.createTexture();
		gl.activeTexture(gl.TEXTURE1);

		gl.bindTexture(gl.TEXTURE_2D, texture2);

		// You can set the texture image data using the following command.
		gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGB,
			gl.RGB,
			gl.UNSIGNED_BYTE,
			img);

		// Set texture parameters 
		if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
			gl.generateMipmap(gl.TEXTURE_2D);
		} else {
			//console.error("Task 1: Non power of 2, you should implement this part to accept non power of 2 sized textures");

			/**
			 * @Task1 : You should implement this part to accept non power of 2 sized textures
			 */


			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		gl.useProgram(this.prog);

		gl.bindTexture(gl.TEXTURE_2D, texture2);
		const sampler2 = gl.getUniformLocation(this.prog, 'tex2');
		gl.uniform1i(sampler2, 1);


	}

	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	showTexture2(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showSecondTexLoc, show);
	}

	enableLighting(show) {
		//console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */
		
		gl.useProgram(this.prog);
		gl.uniform1i(this.enableLightingLoc, show);

	}
	
	setAmbientLight(ambient) {
		//console.error("Task 2: You should implement the lighting and implement this function ");
		/**
		 * @Task2 : You should implement the lighting and implement this function
		 */

		gl.useProgram(this.prog);
		gl.uniform1f(this.ambientLoc, ambient);

	}

	setSpecularLight(specular)
	{
		gl.useProgram(this.prog);
		gl.uniform1f(this.specularLoc, specular);
	}

	setBlending(blending){
		gl.useProgram(this.prog);
		gl.uniform1f(this.blendingLoc, blending);
	}

	setBlendingType(type){
		gl.useProgram(this.prog);
		gl.uniform1f(this.blendingTypeLoc, type);
	}
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 
			varying vec3 v_pos; //added

			void main()
			{
				v_texCoord = texCoord;
				vec4 temp = mvp * vec4(normal,0); //added
				v_normal = vec3(temp.x,temp.y, temp.z); //changed

				gl_Position = mvp * vec4(pos,1);
				v_pos = vec3(gl_Position.x, gl_Position.y, gl_Position.z); //Added
			}`;

// Fragment shader source code
/**
 * @Task2 : You should update the fragment shader to handle the lighting
 */
const meshFS = `
			precision mediump float;

			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex;
			uniform vec3 color; 
			uniform vec3 lightPos;
			uniform float ambient;
			uniform float specular; //added
			uniform vec3 viewPos; //added
			uniform float blending; //added
			uniform float blendingType; //added

			uniform sampler2D tex2; //added
			uniform bool showSecondTex; //added

			varying vec2 v_texCoord;
			varying vec3 v_normal;
			varying vec3 v_pos;

			void main()
			{
				vec3 normals = v_normal;
				vec4 baseTexture = texture2D(tex, v_texCoord);
				if(showSecondTex && showTex){ //only blending
					vec4 tempTexture = texture2D(tex2, v_texCoord);
					if(blendingType == 0.0){//linear
						baseTexture = mix(baseTexture, tempTexture, blending);
					}
					else if(blendingType == 1.0){//multiply
						baseTexture = baseTexture * tempTexture;
					}
					else if(blendingType == 2.0){//screen
						vec3 a = vec3(1.0 - baseTexture.x, 1.0 - baseTexture.y, 1.0 - baseTexture.z);
						vec3 b = vec3(1.0 - tempTexture.x, 1.0 - tempTexture.y, 1.0 - tempTexture.z);

						baseTexture = vec4(1.0 - a * b,1.0);
					}
					else if(blendingType == 3.0){ //overlay
						baseTexture.r = (baseTexture.r < 0.5) 
							? (2.0 * baseTexture.r * tempTexture.r)
							: (1.0 - 2.0 * (1.0 - baseTexture.r) * (1.0 - tempTexture.r));

						baseTexture.g = (baseTexture.g < 0.5) 
							? (2.0 * baseTexture.g * tempTexture.g)
							: (1.0 - 2.0 * (1.0 - baseTexture.g) * (1.0 - tempTexture.g));

						baseTexture.b = (baseTexture.b < 0.5) 
							? (2.0 * baseTexture.b * tempTexture.b)
							: (1.0 - 2.0 * (1.0 - baseTexture.b) * (1.0 - tempTexture.b));
					}
					else if(blendingType == 4.0){//normal mapping
						normals = vec3(tempTexture.x+v_normal.x, tempTexture.y+v_normal.y, tempTexture.z+v_normal.z);
					
					}
				}
				else if(showSecondTex){
					baseTexture = texture2D(tex2, v_texCoord);
				}
				

				if((showTex || showSecondTex) && enableLighting){
					// UPDATE THIS PART TO HANDLE LIGHTING
					//check if it is illuminated by the lightPos

					//lightPos, color, ambient
					vec4 ambientLighting = vec4(ambient,ambient,ambient, 1.0);

					//TO DO : use color somewhere?

					//TO DO - also normalize the light Pos??
 					float cos_angle = dot(normalize(normals), normalize(lightPos*-1.0));

					vec4 diffuseLighting;
					if(cos_angle > 0.0){
						diffuseLighting = vec4(cos_angle,cos_angle,cos_angle, 0);
					}


					vec4 specularLighting;
					if(specular > 0.0){
						vec3 to_light = lightPos*-1.0 - v_pos;
						to_light = normalize(to_light)*-1.0;

						vec3 normal_normal = normalize(normals);

						vec3 reflected_light = 2.0 * normal_normal * dot(normal_normal, to_light) + to_light * -1.0;

						float specular_cos_angle = dot(normalize(reflected_light), normalize(vec3(0,0,2)));
						if (specular_cos_angle > 0.0) {
							specular_cos_angle = clamp(specular_cos_angle, 0.0, 1.0);

							
							specular_cos_angle = pow(specular_cos_angle,1.0/specular);
							specularLighting = vec4(specular_cos_angle,specular_cos_angle,specular_cos_angle,0.0);
						}
						
					}

					//is ambient + diffuse + specular right??? TODO
					gl_FragColor = baseTexture * (ambientLighting + diffuseLighting+ specularLighting);
					
				}
				else if(showTex || showSecondTex){
					gl_FragColor = baseTexture; //texture2D(tex, v_texCoord);
				}
				else{
					gl_FragColor =  vec4(1.0, 0, 0, 1.0);

				}
			}`;

// Light direction parameters for Task 2
var lightX = 1;
var lightY = 1;
var lightZ = 1;

const keys = {};
function updateLightPos() {
	const translationSpeed = 1;
	if (keys['ArrowUp']) lightY -= translationSpeed;
	if (keys['ArrowDown']) lightY += translationSpeed;
	if (keys['ArrowRight']) lightX -= translationSpeed;
	if (keys['ArrowLeft']) lightX += translationSpeed;

}
///////////////////////////////////////////////////////////////////////////////////