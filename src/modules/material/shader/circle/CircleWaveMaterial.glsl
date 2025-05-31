uniform vec4 color;
uniform float speed;
uniform float count;
uniform float gradient;

czm_material czm_getMaterial(czm_materialInput materialInput)
{
  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = 1.5 * color.rgb;
  vec2 st = materialInput.st;
  float dis = distance(st, vec2(0.5, 0.5));
  float per = fract(czm_frameNumber * speed / 1000.0);
  if(count == 1.0){
    if(dis > per * 0.5){
      discard;
    }else {
      material.alpha = color.a  * dis / per / 2.0;
    }
  } else {
    vec3 str = materialInput.str;
    if(abs(str.z)  > 0.001){
      discard;
    }
    if(dis > 0.5){
      discard;
    } else {
      float perDis = 0.5 / count;
      float disNum;
      float bl = 0.0;
      for(int i = 0; i <= 10; i++){
        if(float(i) <= count){
          disNum = perDis * float(i) - dis + per / count;
          if(disNum > 0.0){
            if(disNum < perDis){
              bl = 1.0 - disNum / perDis;
            }
            else if(disNum - perDis < perDis){
              bl = 1.0 - abs(1.0 - disNum / perDis);
            }
            material.alpha = pow(bl,(1.0 + 10.0 * (1.0 - gradient)));
          }
        }
      }
    }
  }
  return material;
}

