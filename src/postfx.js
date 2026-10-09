import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`;

const BLUR = `
uniform sampler2D tDiffuse; uniform vec2 uTexel; uniform vec2 uDir;
uniform float uFocus; uniform float uBand; uniform float uFeather; uniform float uMax;
varying vec2 vUv;
vec4 tiltBlur(vec2 uv){
  float b = smoothstep(uBand, uBand + uFeather, abs(uv.y - uFocus)) * uMax;
  if (b < .5) return texture2D(tDiffuse, uv);
  vec2 s = uDir * uTexel * b;
  vec4 c = texture2D(tDiffuse, uv) * 0.2270270270;
  c += (texture2D(tDiffuse, uv + s * 1.3846153846) + texture2D(tDiffuse, uv - s * 1.3846153846)) * 0.3162162162;
  c += (texture2D(tDiffuse, uv + s * 3.2307692308) + texture2D(tDiffuse, uv - s * 3.2307692308)) * 0.0702702703;
  return c;
}`;

const GRADE = `
uniform float uTime; uniform float uGrain; uniform vec2 uRes;
void main(){
  vec4 col = tiltBlur(vUv);
  vec3 c = col.rgb;
  float l = dot(c, vec3(.2126, .7152, .0722));
  float hi = l / (1.0 + l);
  c += (vec3(-.012, .004, .028) * (1.0 - hi) + vec3(.045, .012, -.03) * hi) * (l + .04);
  float n = fract(sin(dot(floor(vUv * uRes) + uTime, vec2(12.9898, 78.233))) * 43758.5453) - .5;
  c += n * uGrain * (l * .6 + .03);
  gl_FragColor = vec4(c, col.a);
}`;

function tiltUniforms(dir) {
  return {
    tDiffuse: { value: null }, uTexel: { value: new THREE.Vector2(1 / 1920, 1 / 1080) }, uDir: { value: dir },
    uFocus: { value: .52 }, uBand: { value: .27 }, uFeather: { value: .2 }, uMax: { value: 0 },
  };
}

export function createPostFx(composer, { isTouch, dpr }) {
  const maxBlur = isTouch ? 0 : 2.4 * dpr;
  const horizontal = new ShaderPass({ uniforms: tiltUniforms(new THREE.Vector2(1, 0)), vertexShader: VERT, fragmentShader: BLUR + `void main(){ gl_FragColor = tiltBlur(vUv); }` });
  const vertical = new ShaderPass({
    uniforms: { ...tiltUniforms(new THREE.Vector2(0, 1)), uTime: { value: 0 }, uGrain: { value: isTouch ? .03 : .04 }, uRes: { value: new THREE.Vector2(1920, 1080) } },
    vertexShader: VERT, fragmentShader: BLUR + GRADE,
  });
  horizontal.uniforms.uMax.value = maxBlur; vertical.uniforms.uMax.value = maxBlur;
  if (!isTouch) composer.addPass(horizontal);
  composer.addPass(vertical);
  let time = 0;
  return {
    setSize(w, h) {
      for (const p of [horizontal, vertical]) { p.uniforms.uTexel.value.set(1 / (w * dpr), 1 / (h * dpr)); }
      vertical.uniforms.uRes.value.set(w * dpr, h * dpr);
    },
    tick(dt) { time = (time + dt * 60) % 1000; vertical.uniforms.uTime.value = time; },
  };
}
