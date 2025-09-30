#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform vec4 color;
uniform vec4 gapColor;
uniform float dashLength;
uniform float dashPattern;

in float v_polylineAngle;
in float v_width;

const float maskLength = 16.0;

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
        float slope = (p0.y - p1.y) / (p0.x - p1.x);
    return slope * (x - p0.x) + p0.y;
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
        czm_material material = czm_getDefaultMaterial(materialInput);

    vec2 pos = rotate(v_polylineAngle) * gl_FragCoord.xy;

    // Get the relative position within the dash from 0 to 1
    float dashPosition = fract(pos.x / (dashLength * czm_pixelRatio));
    // Figure out the mask index.
    float maskIndex = floor(dashPosition * maskLength);
    // Test the bit mask.
    float maskTest = floor(dashPattern / pow(2.0, maskIndex));
    vec4 fragColor = (mod(maskTest, 2.0) < 1.0) ? gapColor : color;

    vec2 st = materialInput.st;

#ifdef GL_OES_standard_derivatives
    float base = 1.0 - abs(fwidth(st.s)) * 10.0 * czm_pixelRatio;
#else
    float base = 0.975; // 2.5% of the line will be the arrow head
#endif

    vec2 center = vec2(1.0, 0.5);
    float ptOnUpperLine = getPointOnLine(vec2(base, 1.0), center, st.s);
    float ptOnLowerLine = getPointOnLine(vec2(base, 0.0), center, st.s);

    float halfWidth = 0.15;
    float s = step(0.5 - halfWidth, st.t);
    s *= 1.0 - step(0.5 + halfWidth, st.t);
    s *= 1.0 - step(base, st.s);

    float t = step(base, materialInput.st.s);
    t *= 1.0 - step(ptOnUpperLine, st.t);
    t *= step(ptOnLowerLine, st.t);

    // Find the distance from the closest separator (region between two colors)
    float dist;
    if (st.s < base)
    {
        if (fragColor.a < 0.005) {   // matches 0/255 and 1/255
            discard;
        }
        float d1 = abs(st.t - (0.5 - halfWidth));
        float d2 = abs(st.t - (0.5 + halfWidth));
        dist = min(d1, d2);
    }
    else
    {
        fragColor = color;
        float d1 = czm_infinity;
        if (st.t < 0.5 - halfWidth && st.t > 0.5 + halfWidth)
        {
            d1 = abs(st.s - base);
        }
        float d2 = abs(st.t - ptOnUpperLine);
        float d3 = abs(st.t - ptOnLowerLine);
        dist = min(min(d1, d2), d3);
    }

    vec4 outsideColor = vec4(0.0);
    vec4 currentColor = mix(outsideColor, fragColor, clamp(s + t, 0.0, 1.0));
    vec4 outColor = czm_antialias(outsideColor, fragColor, currentColor, dist);

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;
    material.alpha = outColor.a;
    return material;
}
