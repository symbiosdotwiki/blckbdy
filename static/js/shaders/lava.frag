uniform float time;
uniform float hue;
uniform float saturation;
uniform vec2 resolution;

uniform float fogDensity;
uniform vec3 fogColor;

uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 vUv;

vec4 replaceRGB(vec4 color, vec3 colorRGB){
	return vec4(colorRGB.x, colorRGB.y, colorRGB.z, color.w); 
}

vec3 rgb2hsv(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 setH(float h, vec4 color){
	vec3 colorRGB = rgb2hsv(color.rgb);
	colorRGB.x = h;
	colorRGB = hsv2rgb(colorRGB);
	return replaceRGB(color, colorRGB);
}

vec4 setS(float s, vec4 color){
	vec3 colorRGB = rgb2hsv(color.rgb);
	colorRGB.y = s;
	colorRGB = hsv2rgb(colorRGB);
	return replaceRGB(color, colorRGB);
}

vec4 setV(float v, vec4 color){
	vec3 colorRGB = rgb2hsv(color.rgb);
	colorRGB.z = v;
	colorRGB = hsv2rgb(colorRGB);
	return replaceRGB(color, colorRGB);
}

float getH(vec4 color){
	return rgb2hsv(color.rgb).x;
}

float getS(vec4 color){
	return rgb2hsv(color.rgb).y;
}

float getV(vec4 color){
	return rgb2hsv(color.rgb).z;
}

void main( void ) {

	vec2 position = -1.0 + 2.0 * vUv;

	vec4 noise = texture2D( texture1, vUv );
	vec2 T1 = vUv + vec2( 1.5, -1.5 ) * time  *0.02;
	vec2 T2 = vUv + vec2( -0.5, 2.0 ) * time * 0.01;

	T1.x += noise.x * 2.0;
	T1.y += noise.y * 2.0;
	T2.x -= noise.y * 0.2;
	T2.y += noise.z * 0.2;

	float p = texture2D( texture1, T1 * 2.0 ).a;

	vec4 color = texture2D( texture2, T2 * 2.0 );
	vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );

	if( temp.r > 1.0 ){ temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
	if( temp.g > 1.0 ){ temp.rb += temp.g - 1.0; }
	if( temp.b > 1.0 ){ temp.rg += temp.b - 1.0; }

	gl_FragColor = temp;

	float depth = gl_FragCoord.z / gl_FragCoord.w;
	const float LOG2 = 1.442695;
	float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
	fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );

	gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );
	gl_FragColor = setH(hue, gl_FragColor);
	//gl_FragColor = setV(0.2, gl_FragColor);
	gl_FragColor = setS(saturation, gl_FragColor);
	vec4 glow = gl_FragColor;

}