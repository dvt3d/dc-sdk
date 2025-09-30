uniform vec4 color; // 线主体颜色
uniform float startType; // 起始点的类型
uniform float endType; // 终点的类型
uniform vec4 outlineColor; // 边界颜色
uniform bool outlineShow;
uniform float lineWidth;

const float SHAPE_TYPE_NORMAL = 0.0; // 普通
const float SHAPE_TYPE_ARROW= 1.0; // 箭头
const float SHAPE_TYPE_CIRCLE = 2.0; // 圆
const float SHAPE_TYPE_END = 3.0; // 终止竖线

const float ratio = 2.5; // 线宽和base的比例，测试经验值

float outlineWidth = 0.005; // 效果比较好的经验值，后面有需要再传入

float getArrowPointOnLine(vec2 p0, vec2 p1, float x){
    float slope = (p0.y - p1.y) / (p0.x - p1.x);
    return slope * (x - p0.x) + p0.y;
}

float getCirclePointOnLine(vec2 center, float radius, float x, float upper) {
    // 计算 x 到圆心的水平距离的平方
    float dx = x - center.x;
    
    // 在圆方程中求解出 y 变化部
    float dy = sqrt(radius * radius - dx * dx);

    dy = dy * 0.5 / radius;
    
    // 根据 upper 的值决定上边还是下边
    if (upper == 1.0) {
        return center.y + dy; // 上半边
    } else {
        return center.y - dy; // 下半边
    }
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    vec2 st = materialInput.st;

    #if (__VERSION__ == 300 || defined(GL_OES_standard_derivatives))
        float base = 1.0 - abs(fwidth(st.s)) * lineWidth * ratio * czm_pixelRatio;
    #else
        // If no derivatives available (IE 10?), 2.5% of the line will be the arrow head
        float base = 0.975;
    #endif

    float reverseBase = 1.0 - base;
    float halfB = reverseBase / 2.0;
    float baseLeft = reverseBase;

    if(startType == SHAPE_TYPE_END) {
      baseLeft = halfB;
    }

    if(endType == SHAPE_TYPE_END) {
      base += halfB;
    }

    // 这里用来解决圆形端点的裂缝问题
    float circleOffset = 0.01 * baseLeft;

    float halfWidth = 0.08;

  // 左侧  
  if(st.s < baseLeft) {

    if(outlineShow) {
      halfWidth += outlineWidth;
    }

    float ptOnUpperLineLeft = 0.5 + halfWidth;
    float ptOnLowerLineLeft = 0.5 - halfWidth;

    if(startType == SHAPE_TYPE_CIRCLE && st.s < baseLeft - circleOffset) {
      float r = baseLeft / 2.0;
      vec2 leftCenter = vec2(r, 0.5);

      ptOnUpperLineLeft = getCirclePointOnLine(leftCenter, r, st.s, 1.0);
      ptOnLowerLineLeft = getCirclePointOnLine(leftCenter, r, st.s, 0.0);
    } else if(startType == SHAPE_TYPE_END) {
      ptOnUpperLineLeft = 1.0;
      ptOnLowerLineLeft = 0.0;
    } else if(startType == SHAPE_TYPE_ARROW) {
      vec2 leftCenter = vec2(0.0, 0.5);
      ptOnUpperLineLeft = getArrowPointOnLine(vec2(baseLeft, 1.0), leftCenter, st.s);
      ptOnLowerLineLeft = getArrowPointOnLine(vec2(baseLeft, 0.0), leftCenter, st.s);
    }

    float t = 1.0 - step(ptOnUpperLineLeft, st.t);
    t *= step(ptOnLowerLineLeft, st.t);

    float d1 = czm_infinity;
    if (st.t < 0.5 - halfWidth && st.t > 0.5 + halfWidth)
    {
        d1 = abs(st.s - baseLeft);
    }
    float d2 = abs(st.t - ptOnUpperLineLeft);
    float d3 = abs(st.t - ptOnLowerLineLeft);
    float dist = min(min(d1, d2), d3);

    float dtUpper = abs(st.t - ptOnUpperLineLeft);
    dtUpper = step(dtUpper, outlineWidth);

    float dtLower = abs(st.t - ptOnLowerLineLeft);
    dtLower = step(dtLower, outlineWidth);

    vec4 contentColor;
    if(outlineShow) {
      contentColor = mix(color, outlineColor, clamp(dtUpper + dtLower, 0.0, 1.0));
    } else {
      contentColor = color;
    }

    vec4 outsideColor = vec4(0.0);
    vec4 currentColor = mix(outsideColor, contentColor, clamp(t, 0.0, 1.0));
    vec4 outColor = czm_antialias(outlineColor, color, currentColor, dist, 0.05);

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;
    material.alpha = outColor.a;
    
    return material;
  } else if(st.s <= base) {

    float fuzzFactor = 0.1; // 效果比较好的经验值
    if(lineWidth > 10.0) {
      fuzzFactor = 0.05; // 效果比较好的经验值
    }

    if(outlineShow) {
      halfWidth += outlineWidth;
    }

    float ptOnUpperLineRight = 0.5 + halfWidth;
    float ptOnLowerLineRight = 0.5 - halfWidth;

    float s = step(0.5 - halfWidth, st.t);
    s *= 1.0 - step(0.5 + halfWidth, st.t);
    s *= 1.0 - step(base, st.s);

    float t = step(base, materialInput.st.s);
    t *= 1.0 - step(ptOnUpperLineRight, st.t);
    t *= step(ptOnLowerLineRight, st.t);

    // Find the distance from the closest separator (region between two colors)
    float d1 = abs(st.t - (0.5 - halfWidth));
    float d2 = abs(st.t - (0.5 + halfWidth));
    float dist = min(d1, d2);

    float dtUpper = abs(st.t - (0.5 + halfWidth));
    dtUpper = step(dtUpper, outlineWidth);

    float dtLower = abs(st.t - (0.5 - halfWidth));
    dtLower = step(dtLower, outlineWidth);

    vec4 contentColor;
    if(outlineShow) {
      contentColor = mix(color, outlineColor, clamp(dtUpper + dtLower, 0.0, 1.0));
    } else {
      contentColor = color;
    }

    vec4 outsideColor = vec4(contentColor.r, contentColor.g, contentColor.b, 0.0);
    vec4 currentColor = mix(outsideColor, contentColor, clamp(s + t, 0.0, 1.0));

    vec4 outColor = czm_antialias(outlineColor, color, currentColor, dist, fuzzFactor);


    float delta = outlineWidth * 10.0;

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;
    material.alpha = outColor.a;
    return material;
  } else {

    if(outlineShow) {
      halfWidth += outlineWidth;
    }

    float ptOnUpperLineRight = 0.5 + halfWidth;
    float ptOnLowerLineRight = 0.5 - halfWidth;

    if(endType == SHAPE_TYPE_CIRCLE && st.s > base + circleOffset) {
      float r = reverseBase / 2.0;
      vec2 rightCenter = vec2(1.0 - r, 0.5);

      ptOnUpperLineRight = getCirclePointOnLine(rightCenter, r, st.s, 1.0);
      ptOnLowerLineRight = getCirclePointOnLine(rightCenter, r, st.s, 0.0);
    } else if(endType == SHAPE_TYPE_END) {
      ptOnUpperLineRight = 1.0;
      ptOnLowerLineRight = 0.0;
    } else if(endType == SHAPE_TYPE_ARROW) {
      vec2 rightCenter = vec2(1.0, 0.5);

      ptOnUpperLineRight = getArrowPointOnLine(vec2(base, 1.0), rightCenter, st.s);
      ptOnLowerLineRight = getArrowPointOnLine(vec2(base, 0.0), rightCenter, st.s);
    }

    float s = step(0.5 - halfWidth, st.t);
    s *= 1.0 - step(0.5 + halfWidth, st.t);
    s *= 1.0 - step(base, st.s);

    float t = step(base, materialInput.st.s);
    t *= 1.0 - step(ptOnUpperLineRight, st.t);
    t *= step(ptOnLowerLineRight, st.t);

    // Find the distance from the closest separator (region between two colors)

    float d1 = czm_infinity;
    if (st.t < 0.5 - halfWidth && st.t > 0.5 + halfWidth)
    {
        d1 = abs(st.s - base);
    }
    float d2 = abs(st.t - ptOnUpperLineRight);
    float d3 = abs(st.t - ptOnLowerLineRight);
    float dist = min(min(d1, d2), d3);

    float dtUpper = abs(st.t - ptOnUpperLineRight);
    dtUpper = step(dtUpper, outlineWidth);

    float dtLower = abs(st.t - ptOnLowerLineRight);
    dtLower = step(dtLower, outlineWidth);

    vec4 contentColor;
    if(outlineShow) {
      contentColor = mix(color, outlineColor, clamp(dtUpper + dtLower, 0.0, 1.0));
    } else {
      contentColor = color;
    }

    vec4 outsideColor = vec4(contentColor.r, contentColor.g, contentColor.b, 0.0);
    vec4 currentColor = mix(outsideColor, contentColor, clamp(s + t, 0.0, 1.0));

    vec4 outColor = czm_antialias(outlineColor, color, currentColor, dist, 0.05);

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;
    material.alpha = outColor.a;
    return material;
  }
}
