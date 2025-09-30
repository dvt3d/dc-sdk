#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif


uniform vec4 color;
uniform float dashLength;
uniform float dashPattern;

uniform float maskLength;
uniform float outlineWidth;
uniform vec4 outlineColor;

in float v_polylineAngle;
in float v_width; // 线段宽度
mat2 rotate(float rad) {
    float c = cos(rad);
    float s = sin(rad);
    return mat2(
    c, s,
    -s, c
    );
}
// 计算给定输入的材质
// 栅栏形状的polyline是以虚线材质未基础，往虚线空隙里面填充外轮廓是透明的外轮廓线所绘制的
czm_material czm_getMaterial(czm_materialInput materialInput)
{
    // 获取默认的材质
    czm_material material = czm_getDefaultMaterial(materialInput);

    // 外轮廓纹理部分
    // 获取标准化的纹理坐标
    vec2 st = materialInput.st;
    //v_width是整个线宽，outlineWidth是轮廓线宽，两者差值的一半就是外轮廓线内部线条的宽度
    float halfInteriorWidth =  0.5 * (v_width - outlineWidth) / v_width;
    // 判断当前的纹理坐标是否在内部线条范围内，如果在范围内，b值将为1，否则为0。step(edge, x)函数会返回一个值，如果x < edge，返回0.0，否则返回1.0
    float b = step(0.5 - halfInteriorWidth, st.t);
    b *= 1.0 - step(0.5 + halfInteriorWidth, st.t);
    //计算当前片元距离最近的颜色分隔线的距离，这个距离将被用于后面的抗锯齿处理。
    float d1 = abs(st.t - (0.5 - halfInteriorWidth));
    float d2 = abs(st.t - (0.5 + halfInteriorWidth));
    float dist = min(d1, d2);
    // 根据b的值选择颜色，如果b是1，则选择color，否则选择outlineColor。这就确定了当前片元的基础颜色
    vec4 currentColor = mix(outlineColor, color, b);
    // 使用czm_antialias()函数进行抗锯齿处理，输入参数包括轮廓色，内部色，当前色和距离
    vec4 outColor = czm_antialias(outlineColor, color, currentColor, dist);
    // 对经过抗锯齿处理后的颜色进行伽马校正
    vec4 gapColor = czm_gammaCorrect(outColor);


    // 虚线纹理部分
    // 计算旋转后的片元位置。
    vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;
    // 计算当前片元在虚线模式中的位置。
    float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));
    // 计算对应虚线模式的索引位置。
    float maskIndex = floor(dashPosition * maskLength);
    // 通过使用虚线模式和索引位置，计算当前位置是否应有线条。
    float maskTest = floor(dashPattern / pow(2.0, maskIndex));
    // 如果当前位置应为虚线的间隔部分，则颜色设为gapColor，否则设为color。
    vec4 fragColor = (mod(maskTest, 2.0) < 1.0) ? gapColor : color;
    if (fragColor.a < 0.005) {
        discard;
    }
    // 设置材质的颜色和透明度，后返回处理过后的材质
    fragColor = czm_gammaCorrect(fragColor);
    material.emission = fragColor.rgb;
    material.alpha = fragColor.a;
    return material;
}
