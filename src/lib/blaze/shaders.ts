// Adapted from Canvas UI Blaze by David Haz.
// https://canvasui.dev/docs/components/blaze
// License: licenses/canvas-ui.txt

export const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const NOISE = `
float hash1_2 (vec2 x) {
  return fract(sin(dot(x, vec2(52.127, 61.2871))) * 521.582);
}

vec2 hash2_2 (vec2 x) {
  return fract(sin(x * mat2(20.52, 24.1994, 70.291, 80.171)) * 492.194);
}

vec2 noise2_2 (vec2 uv) {
  vec2 f = smoothstep(0.0, 1.0, fract(uv));
  vec2 uv00 = floor(uv);
  vec2 v00 = hash2_2(uv00);
  vec2 v01 = hash2_2(uv00 + vec2(0.0, 1.0));
  vec2 v10 = hash2_2(uv00 + vec2(1.0, 0.0));
  vec2 v11 = hash2_2(uv00 + 1.0);
  return mix(mix(v00, v01, f.y), mix(v10, v11, f.y), f.x);
}

vec3 permute (vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise (vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}`;

export const FIRE_FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
uniform float uHeight;
uniform float uSparks;
uniform float uSparkDensity;
uniform float uSparkSize;
uniform int uLayers;
uniform float uSmoke;
uniform float uGlow;
uniform vec3 uSparkColor;
uniform vec3 uSmokeColor;
uniform vec2 uMouse;
uniform vec2 uMouseVel;
uniform float uMouseStrength;

#define MOVE_DIR vec2(0.0, -1.0)
#define MOVE_SPEED 0.5
${NOISE}

float fbm (vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * snoise(p);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + 11.7;
    a *= 0.5;
  }
  return v * 0.5 + 0.5;
}

float smokeField (vec2 p, float t) {
  vec2 rise = vec2(-t * 0.03, -t * 0.22);
  vec2 q = vec2(
    fbm(p + rise),
    fbm(p + rise * 0.85 + vec2(5.2, 1.3)));
  return fbm(p + 0.55 * q + rise);
}

vec2 rotate2 (vec2 point, float deg) {
  float s = sin(deg);
  float c = cos(deg);
  return mat2(s, c, -c, s) * point;
}

vec2 voronoiPoint (vec2 root, float deg) {
  vec2 point = hash2_2(root) - 0.5;
  float s = sin(deg);
  float c = cos(deg);
  point = mat2(s, c, -c, s) * point * 0.66;
  point += root + 0.5;
  return point;
}

vec2 randomAround (vec2 point, vec2 range, vec2 uv) {
  return point + (hash2_2(uv) - 0.5) * range;
}

vec3 fireParticles (vec2 uv, vec2 originalUV) {
  vec3 particles = vec3(0.0);
  vec2 rootUV = floor(uv);
  float deg = uTime * 0.6 * (hash1_2(rootUV) - 0.5) * 2.0;
  vec2 pointUV = voronoiPoint(rootUV, deg);
  float size = 0.002 * uSparkSize;

  vec2 tempUV = uv + vec2(
    snoise(uv * 1.8 + uTime * 0.55),
    snoise(uv * 1.8 - uTime * 0.4 + 7.3)) * 0.06;

  float dist = length(rotate2(tempUV - pointUV, 0.7)
    * randomAround(vec2(0.5, 1.6), vec2(0.25, 0.2), rootUV));
  float distBloom = length(rotate2(tempUV - pointUV, 0.7)
    * randomAround(vec2(0.5, 0.8), vec2(0.3, 0.1), rootUV));

  particles += (1.0 - smoothstep(size * 0.6, size * 3.0, dist)) * uSparkColor * 1.5;
  particles += pow(1.0 - smoothstep(0.0, size * 6.0, distBloom), 3.0) * uSparkColor * 0.8;

  float border = (hash1_2(rootUV) - 0.5) * 2.0;
  float disappear = 1.0 - smoothstep(border, border + 0.5, originalUV.y);
  border = (hash1_2(rootUV + 0.214) - 1.8) * 0.7;
  float appear = smoothstep(border, border + 0.4, originalUV.y);

  return particles * disappear * appear;
}

vec3 layeredParticles (vec2 uv, float sizeMod, float alphaMod, int layers, float smoke) {
  vec3 particles = vec3(0.0);
  float size = 1.0;
  float alpha = 1.0;
  vec2 offset = vec2(0.0);
  for (int i = 0; i < layers; i++) {
    vec2 noiseOffset = (noise2_2(uv * size * 2.0 + 0.5) - 0.5) * 0.15;
    vec2 bokehUV = (uv * size * uSparkDensity + uTime * MOVE_DIR * MOVE_SPEED)
      + offset + noiseOffset;
    particles += fireParticles(bokehUV, uv) * alpha
      * (1.0 - smoothstep(0.0, 1.0, smoke) * (float(i) / float(layers)));
    offset += hash2_2(vec2(alpha, alpha)) * 10.0;
    alpha *= alphaMod;
    size *= sizeMod;
  }
  return particles;
}

void main () {
  vec2 uv = vUv;

  float zone = clamp(uHeight, 0.02, 1.0);
  float fy = uv.y / zone;

  if (fy > 1.0) {
    outColor = vec4(0.0);
    return;
  }

  float aspect = uResolution.x / uResolution.y;

  vec2 fireUv = vec2((uv.x - 0.5) * aspect * 3.2, mix(-0.7, 1.6, fy));

  // Pointer force field, applied to the sparks only: sample closer to the cursor so they
  // appear pushed outward, and against the pointer's motion so they trail in its wake.
  vec2 toMouse = (uv - uMouse) * vec2(aspect, 1.0);
  float field = exp(-dot(toMouse, toMouse) / 0.05) * uMouseStrength;
  vec2 push = toMouse / vec2(aspect, 1.0) * 0.6 * field;
  vec2 warped = uv - push - uMouseVel * 0.045 * field;
  vec2 sparkUv = vec2((warped.x - 0.5) * aspect * 3.2, mix(-0.7, 1.6, warped.y / zone));

  float smokeIntensity = 0.0;
  if (uSmoke > 0.001) {
    smokeIntensity = smokeField(fireUv * vec2(0.4, 0.55), uTime);
    smokeIntensity = smoothstep(0.42, 1.15, smokeIntensity);
    smokeIntensity *= pow(1.0 - smoothstep(-1.0, 1.6, fireUv.y), 1.5);
  }
  vec3 smoke = smokeIntensity * uSmokeColor * 0.8 * uSmoke;

  vec3 particles = vec3(0.0);
  if (uSparks > 0.001) {
    particles = layeredParticles(sparkUv, 1.01, 0.9, uLayers, smokeIntensity) * uSparks;
    particles *= 1.0 + 1.4 * field;
  }

  float fade = 1.0 - smoothstep(0.55, 1.0, fy);
  vec3 glow = uSmokeColor * 0.05 * uGlow * pow(1.0 - fy, 2.0);
  vec3 fire = (particles + smoke) * fade + glow;

  outColor = vec4(fire, max(fire.r, max(fire.g, fire.b)));
}`;
