import * as THREE from 'three';

const KEYS = [
  { f: 0, sun: [0xdbe6ff, 2.4], sunPos: [-16, 19, -14], hemi: [0xc3d3ff, 0x2c2a48, .95], fog: 0x1a2140, sky: [1.55, 1.55, 1.65], screens: .7, rays: .05, bloom: .45, exposure: 1.12, rim: [.9, .95, 1.1] },
  { f: .35, sun: [0xfff3dc, 3.0], sunPos: [-10, 20, -18], hemi: [0xb9c6ff, 0x2a2140, .9], fog: 0x171836, sky: [1.5, 1.4, 1.3], screens: .9, rays: .1, bloom: .55, exposure: 1.1, rim: [1, .95, .85] },
  { f: .7, sun: [0xffa868, 3.1], sunPos: [-9, 16, -20], hemi: [0x9fb0ff, 0x2a2140, .85], fog: 0x161632, sky: [1.5, 1.35, 1.3], screens: 1.25, rays: .16, bloom: .6, exposure: 1.08, rim: [1.2, .8, .5] },
  { f: 1, sun: [0xff6a4e, 1.7], sunPos: [6, 7, -22], hemi: [0x6a5fb0, 0x160f2a, .7], fog: 0x110e26, sky: [.62, .5, .85], screens: 1.9, rays: .1, bloom: .85, exposure: 1, rim: [1.1, .55, .8] },
];

const colA = new THREE.Color(), colB = new THREE.Color();
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t, out) => out.setRGB(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t));
const mixHex = (a, b, t) => colA.setHex(a).lerp(colB.setHex(b), t);
const smooth = t => t * t * (3 - 2 * t);

export function applyDaylight(fraction, r) {
  const f = Math.min(1, Math.max(0, fraction));
  let i = 0;
  while (i < KEYS.length - 2 && f > KEYS[i + 1].f) i++;
  const a = KEYS[i], b = KEYS[i + 1], t = smooth((f - a.f) / (b.f - a.f));
  r.sun.color.copy(mixHex(a.sun[0], b.sun[0], t)); r.sun.intensity = lerp(a.sun[1], b.sun[1], t);
  r.sunOffset.set(lerp(a.sunPos[0], b.sunPos[0], t), lerp(a.sunPos[1], b.sunPos[1], t), lerp(a.sunPos[2], b.sunPos[2], t));
  r.hemi.color.copy(mixHex(a.hemi[0], b.hemi[0], t)); r.hemi.groundColor.copy(mixHex(a.hemi[1], b.hemi[1], t)); r.hemi.intensity = lerp(a.hemi[2], b.hemi[2], t);
  r.scene.fog.color.copy(mixHex(a.fog, b.fog, t)); r.scene.background.copy(r.scene.fog.color);
  lerp3(a.sky, b.sky, t, r.skyMat.color);
  for (const m of r.screenMats) m.emissiveIntensity = lerp(a.screens, b.screens, t);
  if (r.rayMat) r.rayMat.opacity = lerp(a.rays, b.rays, t);
  r.bloom.strength = lerp(a.bloom, b.bloom, t);
  r.renderer.toneMappingExposure = lerp(a.exposure, b.exposure, t);
  lerp3(a.rim, b.rim, t, r.rim);
}
