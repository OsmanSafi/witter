precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha;

varying vec2 vTexcoords;

void main(void) {
    vec4 textureColor = texture2D(uTexture, vTexcoords);
    gl_FragColor = vec4(textureColor.rgb, uAlpha);
}
