
export const vertexShader = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition( void )
  {
      vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

      position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
      position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

      return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord( void )
  {
      return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void)
  {
      gl_Position = filterVertexPosition();
      vTextureCoord = filterTextureCoord();
  }
`;

export const fragmentShader = `

in vec2 vTextureCoord;
in vec4 vColor;
uniform sampler2D uTexture;
uniform float uWidth;
uniform float uHeight;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float getDistanceFromCenter(vec2 uv) {
    float distance = distance(uv.xy, vec2(0.5, 0.5));
    return distance;
}

vec2 applyCurvature(vec2 uv) {
    // Center the coordinates
    vec2 centered = uv - 0.5;

    // Apply barrel distortion
    float distortion = 0.1; // Adjust strength
    float r2 = dot(centered, centered);
    vec2 curved = centered * (1.0 + distortion * r2);

    // Return to 0-1 range
    return curved + 0.5;
}
// TRIPPY
// vec2 applyCurvature(vec2 uv) {
//
//     vec2 centered = (uv - 0.5) * 2.0; // -1 to 1 range
//
//     float curvature = 0.2;
//     float r = length(centered);
//     float distortion = 1.0 + curvature * r * r;
//
//     return (centered * distortion) * 0.5 + 0.5;
// }

// vec2 applyCurvature(vec2 uv) {
//     vec2 centered = uv - 0.5;
//
//     // Account for aspect ratio
//     // float aspect = uWidth / uHeight;
//     // centered.x *= aspect;
//
//     float distortion = 0.1;
//     float r2 = dot(centered, centered);
//     vec2 curved = centered * (1.0 + distortion * r2);
//
//     // curved.x /= aspect;
//     return curved + 0.5;
// }

// Simple 2x2 dither pattern
float dither2x2(vec2 pos) {
    int x = int(mod(pos.x, 2.0));
    int y = int(mod(pos.y, 2.0));
    
    if (x == 0 && y == 0) return 0.25;
    if (x == 1 && y == 0) return 0.75;
    if (x == 0 && y == 1) return 1.0;
    return 0.5; // x == 1 && y == 1
}

// 3x3 dither pattern
float dither3x3(vec2 pos) {
    int x = int(mod(pos.x, 3.0));
    int y = int(mod(pos.y, 3.0));
    
    if (x == 0) {
        if (y == 0) return 0.111; // 1/9
        if (y == 1) return 0.778; // 7/9
        return 0.444; // 4/9
    }
    if (x == 1) {
        if (y == 0) return 0.556; // 5/9
        if (y == 1) return 0.222; // 2/
        return 0.889; // 8/9
    }
    // x == 2
    if (y == 0) return 0.333; // 3/9
    if (y == 1) return 1.0;   // 9/9
    return 0.667; // 6/9
}

// Classic 4x4 Bayer matrix
float dither4x4(vec2 pos) {
    int x = int(mod(pos.x, 4.0));
    int y = int(mod(pos.y, 4.0));
    
    if (x == 0) {
        if (y == 0) return 0.0625;  // 1/16
        if (y == 1) return 0.5625;  // 9/16
        if (y == 2) return 0.1875;  // 3/16
        return 0.6875; // 11/16
    }
    if (x == 1) {
        if (y == 0) return 0.8125;  // 13/16
        if (y == 1) return 0.3125;  // 5/16
        if (y == 2) return 0.9375;  // 15/16
        return 0.4375; // 7/16
    }
    if (x == 2) {
        if (y == 0) return 0.25;    // 4/16
        if (y == 1) return 0.75;    // 12/16
        if (y == 2) return 0.125;   // 2/16
        return 0.625; // 10/16
    }
    // x == 3
    if (y == 0) return 1.0;     // 16/16
    if (y == 1) return 0.5;     // 8/16
    if (y == 2) return 0.875;   // 14/16
    return 0.375; // 6/16
}

void main(void) {

    // CURVATURE
    // vec2 curvedUV = applyCurvature(vTextureCoord);

    // if (curvedUV.x < 0.0 || curvedUV.x > 1.0 || curvedUV.y < 0.0 || curvedUV.y > 1.0) {
    //     gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black outside
    //     return;
    // } 
    // vec4 fg = texture2D(uTexture, curvedUV);
    vec4 fg = texture2D(uTexture, vTextureCoord);

    // NOISE
    // float noise = random(vTextureCoord.xy) * 1.25;
    // fg.r *= noise;
    
    // DITHERING
    // float ditherValue = dither2x2(gl_FragCoord.xy);  // Sharp, chunky
    // float ditherValue = dither3x3(gl_FragCoord.xy);  // Medium detail
    float ditherValue = dither4x4(gl_FragCoord.xy);     // Classic Bayer
    fg.rgb = step(ditherValue, fg.rgb);

    // CRT
    float scanline = sin(gl_FragCoord.y * 3.14159 * 0.25) * 0.1 + 0.9;
    fg.rgb *= scanline;

      // FADE
      float d = getDistanceFromCenter(vTextureCoord);
      fg.rgb += d * 0.25;
      gl_FragColor = fg;
}
`;

