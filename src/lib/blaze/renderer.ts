import { FIRE_FRAG, VERT } from './shaders';

/** Canvas UI's fire pass, adapted to render a decorative background only. */
export function createBlazeBackground(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
    preserveDrawingBuffer: false,
  });
  if (!gl) return null;

  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;

  const release = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach((shader) => gl.deleteShader(shader));
  };

  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error('Shader allocation failed');
    shaders.push(shader);
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      throw new Error('Shader compilation failed');
    }
    return shader;
  }

  try {
    program = gl.createProgram();
    if (!program) throw new Error('Program allocation failed');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FIRE_FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Shader linking failed');
    gl.useProgram(program);

    buffer = gl.createBuffer();
    if (!buffer) throw new Error('Buffer allocation failed');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  } catch {
    release();
    return null;
  }

  const uniform = (name: string) => gl.getUniformLocation(program!, name);
  const resolution = uniform('uResolution');
  const timeUniform = uniform('uTime');
  const layersUniform = uniform('uLayers');
  gl.uniform1f(uniform('uHeight'), 0.98);
  gl.uniform1f(uniform('uSparks'), 0.72);
  gl.uniform1f(uniform('uSparkDensity'), 1.6);
  gl.uniform1f(uniform('uSparkSize'), 1.6);
  gl.uniform1f(uniform('uSmoke'), 0.85);
  gl.uniform1f(uniform('uGlow'), 2.4);
  gl.uniform3f(uniform('uSparkColor'), 1.0, 0.27, 0.095);
  gl.uniform3f(uniform('uSmokeColor'), 0.74, 0.115, 0.055);

  let frame = 0;
  let lastDraw = 0;
  let time = 8;
  let inView = true;
  let destroyed = false;
  let interval = 1000 / 30;
  let resizePending = true;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = () => !destroyed && !document.hidden && inView && !motionQuery.matches && hero.dataset.motion !== 'paused';

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const small = width < 768;
    // This soft background doesn't need a Retina-sized framebuffer.
    const maxDimension = Math.min(1024, gl!.getParameter(gl!.MAX_RENDERBUFFER_SIZE));
    const ratio = Math.min(small ? 0.8 : 0.65, maxDimension / Math.max(width, height), Math.sqrt(420_000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    interval = 1000 / (small ? 24 : 30);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.uniform2f(resolution, width, height);
    gl!.uniform1i(layersUniform, small ? 2 : 3);
    resizePending = false;
  }

  function draw(now: number) {
    frame = 0;
    if (!canAnimate()) return;
    const delta = now - lastDraw;
    if (resizePending || delta >= interval) {
      if (resizePending) resize();
      time += Math.min(delta / 1000, 0.1) * 0.55;
      lastDraw = now;
      gl!.uniform1f(timeUniform, time);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      canvas.dataset.ready = 'true';
    }
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    if (!canAnimate()) {
      cancelAnimationFrame(frame);
      frame = 0;
      return;
    }
    if (!frame) {
      lastDraw = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }

  const resizeObserver = new ResizeObserver(() => { resizePending = true; sync(); });
  resizeObserver.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => { inView = entry?.isIntersecting ?? false; sync(); });
  intersection.observe(hero);
  document.addEventListener('visibilitychange', sync);
  hero.addEventListener('blaze:motionchange', sync);
  motionQuery.addEventListener('change', sync);

  function onContextLost(event: Event) {
    event.preventDefault();
    destroy();
    canvas.dataset.ready = 'false';
    hero.dispatchEvent(new Event('blaze:unavailable'));
  }
  canvas.addEventListener('webglcontextlost', onContextLost);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersection.disconnect();
    document.removeEventListener('visibilitychange', sync);
    hero.removeEventListener('blaze:motionchange', sync);
    motionQuery.removeEventListener('change', sync);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    release();
  }

  sync();
  return { destroy };
}
