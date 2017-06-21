/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   	{ value: null },
		"swirl":       	{ value: 0.0 },
		"center": 		{ value: new THREE.Vector2(0.0, 0.0) },
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",
	
		"uniform float swirl;",

		"uniform vec2 center;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",
			"vec2 normUV = vUv - vec2(.5, .5) + vec2(-1.0 * center.x, center.y);",
			"float angle = atan(normUV.y, normUV.x);",
			"float radius = sqrt(normUV.y * normUV.y + normUV.x * normUV.x);",
			// get us a sine and cosine
			"vec2 sc = vec2( .5 + center.x + radius * cos(angle + swirl*radius), .5 - center.y + radius * sin(angle + swirl*radius) );",

			"gl_FragColor =  texture2D( tDiffuse, sc );",

		"}"

	].join( "\n" )

};
