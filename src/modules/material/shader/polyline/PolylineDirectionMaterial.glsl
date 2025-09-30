#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform vec4 color;
uniform vec4 directionColor; // 箭头颜色
uniform vec4 outlineColor; // 边界颜色
uniform float outlineWidth; // 边界宽度

in float v_width; // 线段宽度
in float v_polylineAngle; // 线段角度

const float fragLength = 100.0; // 每个箭头线段有多长
const float startPosition = 0.45; // 开始的位置，从 0 ～ 1
const float endPosition = 0.55; // 结束的位置，从 0 ～ 1

mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
    c, s,
    -s, c
    );
}

float getPointOnLine(vec2 p0, vec2 p1, float x)
{
    float slope = (p0.y - p1.y) / (p0.x - p1.x); // 根据两个点获取斜率
    return slope * (x - p0.x) + p0.y; // 根据斜率和 x 值获取 y 值
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    // 用 Dash 的方式渲染正常的线
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 st = materialInput.st;

    // copy from polyline outline
    float halfInteriorWidth =  0.5 * (v_width - outlineWidth) / v_width;
    float b = step(0.5 - halfInteriorWidth, st.t);
    b *= 1.0 - step(0.5 + halfInteriorWidth, st.t);

    // Find the distance from the closest separator (region between two colors)
    float d1 = abs(st.t - (0.5 - halfInteriorWidth));
    float d2 = abs(st.t - (0.5 + halfInteriorWidth));
    float dist = min(d1, d2);

    vec4 currentColor = mix(outlineColor, color, b);
    vec4 outColor = czm_antialias(outlineColor, color, currentColor, dist);
    outColor = czm_gammaCorrect(outColor);

    // 获取当前位置处于窗口的相对位置（像素值）
    vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;

    // 获取当前位置处于箭头线段的哪部分, 0 ~ 1
    float maskS = fract(pos.x / (fragLength * czm_pixelRatio));
//    float maskS = fract(st.s / (abs(fwidth(st.s)) * fragLength * czm_pixelRatio));
    float maskT = st.t;
    // 判断是正常的线还是箭头
    bool isDirection = (maskS > startPosition) && (maskS <= endPosition);

    vec4 fragColor;
    if (isDirection) {
        // 渲染箭头
        float arrowWidth = (endPosition - startPosition) / 2.0;
        float midS = startPosition + arrowWidth;

        float t = 1.0;
        if (maskS < midS) {
            // 左边的三角形
            vec2 center = vec2(midS, 0.5);
            float ptOnUpperLine = getPointOnLine(vec2(startPosition, 1.0), center, maskS); // 三角形上边的线
            float ptOnLowerLine = getPointOnLine(vec2(startPosition, 0.0), center, maskS); // 三角形下边的线

            t *= 1.0 - step(ptOnUpperLine, maskT); // 低于上面的线
            t *= step(ptOnLowerLine, maskT); // 而且高于下面的线
            t = 1.0 - t; // 取反
        } else {
            // 右边的三角形
            vec2 center = vec2(endPosition, 0.5);
            float ptOnUpperLine = getPointOnLine(vec2(midS, 1.0), center, maskS); // 三角形上边的线
            float ptOnLowerLine = getPointOnLine(vec2(midS, 0.0), center, maskS); // 三角形下边的线

            t *= 1.0 - step(ptOnUpperLine, maskT); // 低于上面的线
            t *= step(ptOnLowerLine, maskT); // 而且高于下面的线
        }

        vec4 outsideColor = outColor;
        vec4 currentColor = mix(outsideColor, directionColor, clamp(t, 0.0, 1.0));
        fragColor = currentColor;
    } else {
        fragColor = outColor;
    }

    fragColor = czm_gammaCorrect(fragColor);
    material.diffuse = fragColor.rgb;
    material.alpha = fragColor.a;
    return material;
}
