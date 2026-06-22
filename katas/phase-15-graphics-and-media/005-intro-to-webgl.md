---
id: "phase-15/005-intro-to-webgl"
title: "Intro to WebGL (conceptual)"
phase: 15
sequence: 5
difficulty: "advanced"
tags: ["graphics", "webgl", "gpu"]
prerequisites: ["phase-15/004-images-and-media-elements"]
estimated_minutes: 15
starter: ["html", "js"]
network: false
---

## Concept

WebGL is a thin JavaScript binding to the GPU, obtained with `canvas.getContext('webgl')`.
Where the 2D context offers high-level verbs (`fillRect`, `arc`), WebGL offers almost none:
you describe geometry as raw numbers and write tiny GPU programs that turn those numbers into
pixels. It is low-level on purpose — that is what makes it fast enough for thousands of
shapes, 3D, and real-time effects.

This is an **intro**: the goal is the mental model, not mastery. The WebGL pipeline, roughly:

1. **Buffers** — you upload vertex data (positions, colors) into GPU memory.
2. **Vertex shader** — a small GLSL program that runs **once per vertex**, deciding where
   each point lands in clip space (`gl_Position`).
3. **Rasterization** — the GPU fills the triangles between vertices with fragments (candidate
   pixels). You don't write this stage; the GPU does it.
4. **Fragment shader** — a GLSL program that runs **once per fragment**, deciding its color
   (`gl_FragColor`).
5. **Draw call** — `gl.drawArrays(...)` kicks the whole pipeline off.

Everything is explicit and verbose, so most real projects use a library (Three.js, regl,
PixiJS) on top. Knowing the raw pipeline is what lets you understand and debug them.

Always **feature-detect**: `getContext('webgl')` returns `null` if WebGL is unavailable.

## Key Insight

> WebGL talks to the GPU in two tiny programs — a **vertex shader** (where points go) and a
> **fragment shader** (what color pixels are) — driven by buffers and a draw call. It is
> verbose by design; that is the cost of GPU speed.

## Experiment

```html
<canvas id="gl" width="300" height="200" style="border:1px solid #cbd5e1"></canvas>
```

```js
const canvas = document.getElementById('gl');
const gl = canvas.getContext('webgl');

if (!gl) {
  console.log('WebGL is not available in this environment.');
} else {
  console.log('WebGL context acquired:', gl.constructor.name);

  // The simplest possible "draw": clear the whole framebuffer to a color.
  // This already runs on the GPU.
  gl.clearColor(0.39, 0.40, 0.95, 1.0); // indigo (R,G,B,A in 0..1, not 0..255)
  gl.clear(gl.COLOR_BUFFER_BIT);

  // A minimal shader pair: one vertex, one fragment program.
  const vsSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fsSource = `
    precision mediump float;
    void main() { gl_FragColor = vec4(0.98, 0.45, 0.09, 1.0); } // orange
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  // Upload three vertices (clip space: -1..1 on each axis) into a buffer.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     0.0,  0.6,
    -0.6, -0.6,
     0.6, -0.6,
  ]), gl.STATIC_DRAW);

  // Wire the buffer to the shader's `position` attribute.
  const loc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // The draw call runs the pipeline: vertex shader → raster → fragment shader.
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  console.log('drew 1 triangle (3 vertices)');
}
```

## Expected Result

In the **preview**, the canvas is cleared to an **indigo** background with a single **orange
triangle** in the middle. The **console** prints `WebGL context acquired: WebGLRenderingContext`
and `drew 1 triangle (3 vertices)`. If WebGL is unavailable, it prints the fallback message
instead and nothing draws — that is the feature-detection branch working.

## Challenge

1. Change the three vertex coordinates and watch the triangle move and stretch. Note the
   coordinate range is **clip space** (-1 to 1), with the origin at the **center**, not the
   top-left.
2. Pass a color from the vertex shader to the fragment shader (a `varying`) so the GPU
   interpolates a gradient across the triangle — the classic "rainbow triangle."
3. Add error checking with `gl.getShaderParameter(shader, gl.COMPILE_STATUS)` and log
   `gl.getShaderInfoLog(shader)` to see real GLSL compile errors.

## Deep Dive

WebGL coordinates are **normalized clip space** (-1..1, origin centered, Y up) — unlike 2D
canvas pixels (origin top-left, Y down). The vertex shader's job is precisely to map your
model's numbers into that space. Shaders run **massively in parallel**: the fragment shader
executes for every covered pixel at once, which is why GPUs can shade millions of pixels per
frame. WebGL2 and the newer **WebGPU** API extend this model with more features and a modern
shading language; the buffer → shader → draw-call mental model carries straight over.

## Common Mistakes

- Not feature-detecting — assuming `getContext('webgl')` is non-null on every device.
- Using `0..255` color values; WebGL colors are floats in **`0.0..1.0`**.
- Forgetting that clip space is centered at the origin with Y **up**, then being surprised
  the triangle is mirrored or off-screen.
- Expecting 2D-context convenience methods — WebGL has no `fillRect`; everything is buffers,
  shaders, and draw calls (which is why libraries exist).
