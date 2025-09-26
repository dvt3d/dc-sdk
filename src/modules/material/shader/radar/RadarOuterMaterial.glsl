uniform vec4 color;
uniform float speed;
uniform float repeat;
uniform float thickness;
czm_material czm_getMaterial(czm_materialInput materialInput){
  czm_material material = czm_getDefaultMaterial(materialInput);
  float sp = 1.0 / repeat;
  vec2 st = materialInput.st;
  float dis = distance(st, vec2(0.5));
  float t = czm_frameNumber * speed / 1000.0;
  float m = mod(dis - fract(t), sp);
  float a = step(sp * (1.0 - thickness), m);
  material.diffuse = color.rgb;
  material.alpha   = a * color.a;
  return material;
}
