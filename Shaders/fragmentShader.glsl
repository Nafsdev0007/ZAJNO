uniform sampler2D uTexture;
varying vec2 vUv;
uniform vec2 uMouse;
uniform float uHover;

void main(){
    float block = 20.;
    vec2 blockUv = floor(vUv*block) / block;
    float distance = length(blockUv - uMouse); 
    float effect = smoothstep(.35,0.0,distance);
    vec2 distortion = vec2(0.035)*effect;    

    vec4 color = texture2D(uTexture, vUv + (distortion*uHover));
    gl_FragColor =color;
}