#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform vec4 color;
uniform float repeatFactor;// 重复箭头的次数
uniform bool antiClockWise; // 确定箭头的方向

// 一个辅助函数，给定两点(p0, p1)和一个x坐标，返回直线上对应的y坐标
float getPointOnLine(vec2 p0, vec2 p1, float x)
{
    float slope = (p0.y - p1.y) / (p0.x - p1.x);// 计算斜率
    return slope * (x - p0.x) + p0.y;// 使用斜率公式返回y坐标
}

// 主材质函数，将被Cesium调用以获得每个片元的材质属性
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);// 获取默认材质

    vec2 st = materialInput.st;// 获取当前片元的纹理坐标

    if (antiClockWise) {  // 根据antiClockWise的值选择性地翻转s坐标
        st.s = 1.0 - st.s;
    }

    float arrowWidth = 1.0 / repeatFactor;// 每个箭头的宽度

    // 使用mod函数将片元的s坐标映射到[0, arrowWidth]的范围内，从而实现箭头的重复
    st.s = mod(st.s, arrowWidth) / arrowWidth;

    // 如果可用，使用fwidth函数来获得箭头的宽度，否则使用固定值
    #if (__VERSION__ == 300 || defined(GL_OES_standard_derivatives))
    float base = 1.0 - abs(fwidth(st.s)) * 10.0 * czm_pixelRatio;
    #else
    float base = 0.995;
    #endif

    vec2 center = vec2(1.0, 0.5);// 箭头的顶点坐标

    // 增大箭头的尺寸来覆盖空隙
    center.s += 0.01;

    // 计算箭头上部和下部直线上的点
    float ptOnUpperLine = getPointOnLine(vec2(base, 1.0), center, st.s);
    float ptOnLowerLine = getPointOnLine(vec2(base, 0.0), center, st.s);

    float halfWidth = 0.15;// 箭头的半宽
    // 计算箭头主体部分的纹理坐标
    float s = step(0.5 - halfWidth, st.t);
    s *= 1.0 - step(0.5 + halfWidth, st.t);
    s *= 1.0 - step(base, st.s);

    // 计算箭头顶部部分的纹理坐标
    float t = step(base, st.s);
    t *= 1.0 - step(ptOnUpperLine, st.t);
    t *= step(ptOnLowerLine, st.t);

    // 计算片元与箭头边界的距离，以便进行抗锯齿处理
    float dist;
    if (st.s < base)
    {
        float d1 = abs(st.t - (0.5 - halfWidth));
        float d2 = abs(st.t - (0.5 + halfWidth));
        dist = min(d1, d2);
    }
    else
    {
        float d1 = czm_infinity;
        if (st.t < 0.5 - halfWidth && st.t > 0.5 + halfWidth)
        {
            d1 = abs(st.s - base);
        }
        float d2 = abs(st.t - ptOnUpperLine);
        float d3 = abs(st.t - ptOnLowerLine);
        dist = min(min(d1, d2), d3);
    }

    vec4 outsideColor = vec4(0.0);// 外部颜色（非箭头部分）
    // 根据s和t的值混合颜色，如果片元位于箭头上，则使用箭头颜色，否则使用外部颜色
    vec4 currentColor = mix(outsideColor, color, clamp(s + t, 0.0, 1.0));
    // 使用czm_antialias函数进行抗锯齿处理
    vec4 outColor = czm_antialias(outsideColor, color, currentColor, dist);

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;// 设置材质的漫反射颜色
    material.alpha = outColor.a;// 设置材质的透明度

    return material;// 返回材质
}


