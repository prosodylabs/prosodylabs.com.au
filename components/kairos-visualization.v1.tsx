"use client"

import { useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────

interface FiringData {
  timesteps: number
  neurons_per_layer: number
  layers: number
  magnitude_range?: [number, number]
  samples: Array<{
    layers: Record<string, number[][]>
  }>
}

// ─── Shaders ──────────────────────────────────────────────

const VERT_SRC = `#version 300 es
precision highp float;

in vec2 a_position;
in vec3 a_color;
in float a_magnitude;
in float a_time;

uniform float u_currentTime;
uniform float u_fadeTime;
uniform float u_pixelRatio;

out vec3 v_color;
out float v_alpha;

void main() {
    float age = u_currentTime - a_time;

    if (age < -0.5 || age > u_fadeTime) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        gl_PointSize = 0.0;
        v_alpha = 0.0;
        v_color = vec3(0.0);
        return;
    }

    float normalizedAge = max(age, 0.0) / u_fadeTime;
    float entrance = smoothstep(-0.5, 0.0, age);
    float decay = exp(-normalizedAge * 3.0);
    float flash = entrance * decay;

    v_alpha = flash * (0.5 + 0.5 * a_magnitude);
    v_color = a_color * (0.6 + 0.4 * a_magnitude);

    vec2 clipPos = a_position * 2.0 - 1.0;
    gl_Position = vec4(clipPos, 0.0, 1.0);
    gl_PointSize = (5.0 + a_magnitude * 25.0) * u_pixelRatio;
}
`

const FRAG_SRC = `#version 300 es
precision highp float;

in vec3 v_color;
in float v_alpha;

out vec4 fragColor;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);

    // Gaussian glow with soft core
    float core = exp(-dist * dist * 10.0);
    float halo = exp(-dist * dist * 3.0) * 0.3;
    float glow = core + halo;

    float alpha = v_alpha * glow;
    if (alpha < 0.003) discard;

    fragColor = vec4(v_color * alpha, alpha);
}
`

// ─── Utilities ────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r: number, g: number, b: number
  if (h < 60) {
    r = c; g = x; b = 0
  } else if (h < 120) {
    r = x; g = c; b = 0
  } else if (h < 180) {
    r = 0; g = c; b = x
  } else if (h < 240) {
    r = 0; g = x; b = c
  } else if (h < 300) {
    r = x; g = 0; b = c
  } else {
    r = c; g = 0; b = x
  }
  return [r + m, g + m, b + m]
}

function neuronColor(layerIdx: number, neuronIdx: number, neuronsPerLayer: number): [number, number, number] {
  const globalIdx = layerIdx * neuronsPerLayer + neuronIdx
  const hue = (globalIdx * 137.508) % 360
  const rng = mulberry32(globalIdx * 7919)
  const saturation = 0.70 + rng() * 0.25
  const lightness = 0.50 + rng() * 0.15
  return hslToRgb(hue, saturation, lightness)
}

function neuronPosition(
  layerIdx: number,
  neuronIdx: number,
  totalLayers: number,
  neuronsPerLayer: number
): [number, number] {
  const globalIdx = layerIdx * neuronsPerLayer + neuronIdx
  const rng = mulberry32(globalIdx * 1337)

  // Leave 8% at top (behind header) and 5% at bottom
  const usableTop = 0.08
  const usableBottom = 0.95
  const usableHeight = usableBottom - usableTop

  const bandHeight = usableHeight / (totalLayers + (totalLayers - 1) * 0.15)
  const gap = bandHeight * 0.15

  const bandTop = usableTop + layerIdx * (bandHeight + gap)
  const padding = bandHeight * 0.04

  const x = 0.01 + rng() * 0.98
  const y = bandTop + padding + rng() * (bandHeight - 2 * padding)

  return [x, 1.0 - y]
}

// ─── WebGL helpers ────────────────────────────────────────

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile:", gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertSrc: string,
  fragSrc: string
): WebGLProgram | null {
  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc)
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  if (!vert || !frag) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link:", gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  gl.deleteShader(vert)
  gl.deleteShader(frag)
  return program
}

// ─── Constants ────────────────────────────────────────────

const TIMESTEPS_PER_SECOND = 12
const FADE_TIME = 10.0
const INTER_SAMPLE_GAP = 20

// ─── Component ────────────────────────────────────────────

export default function KairosVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    let cleanupGl: (() => void) | undefined

    async function init() {
      const res = await fetch("/kairos_firing_data.json")
      const data: FiringData = await res.json()
      if (disposed) return

      const {
        layers: numLayers,
        neurons_per_layer: neuronsPerLayer,
        timesteps,
        samples,
      } = data
      const magMin = data.magnitude_range?.[0] ?? 5.0
      const magMax = data.magnitude_range?.[1] ?? 41.3
      // Log scale for perceptual brightness — threshold spikes still visible
      const logMin = Math.log(magMin)
      const logRange = Math.log(magMax) - logMin || 1.0

      // Timing
      const sampleDuration = timesteps
      const totalDuration =
        samples.length * sampleDuration +
        (samples.length - 1) * INTER_SAMPLE_GAP

      // Build vertex buffer
      const FLOATS_PER_VERTEX = 7
      let totalSpikes = 0
      for (const sample of samples) {
        for (const spikes of Object.values(sample.layers)) {
          totalSpikes += spikes.length
        }
      }

      const vertexData = new Float32Array(totalSpikes * FLOATS_PER_VERTEX)
      let offset = 0

      for (let si = 0; si < samples.length; si++) {
        const timeOffset = si * (sampleDuration + INTER_SAMPLE_GAP)
        const sample = samples[si]

        for (let li = 0; li < numLayers; li++) {
          const spikes = sample.layers[`layer_${li}`] || []
          for (const [ts, ni, mag] of spikes) {
            const [x, y] = neuronPosition(li, ni, numLayers, neuronsPerLayer)
            const [r, g, b] = neuronColor(li, ni, neuronsPerLayer)
            // Log scale with 0.15 floor — even threshold spikes glow softly
            const logNorm = (Math.log(mag) - logMin) / logRange
            const normMag = Math.min(1.0, 0.15 + 0.85 * Math.max(0.0, logNorm))
            vertexData[offset++] = x
            vertexData[offset++] = y
            vertexData[offset++] = r
            vertexData[offset++] = g
            vertexData[offset++] = b
            vertexData[offset++] = normMag
            vertexData[offset++] = timeOffset + ts
          }
        }
      }

      // WebGL2
      const gl = canvas!.getContext("webgl2", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      })
      if (!gl || disposed) return

      const program = createProgram(gl, VERT_SRC, FRAG_SRC)
      if (!program) return

      const aPosition = gl.getAttribLocation(program, "a_position")
      const aColor = gl.getAttribLocation(program, "a_color")
      const aMagnitude = gl.getAttribLocation(program, "a_magnitude")
      const aTime = gl.getAttribLocation(program, "a_time")
      const uCurrentTime = gl.getUniformLocation(program, "u_currentTime")
      const uFadeTime = gl.getUniformLocation(program, "u_fadeTime")
      const uPixelRatio = gl.getUniformLocation(program, "u_pixelRatio")

      const vbo = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
      gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW)

      const vao = gl.createVertexArray()
      gl.bindVertexArray(vao)

      const stride = FLOATS_PER_VERTEX * 4
      gl.enableVertexAttribArray(aPosition)
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, stride, 0)
      gl.enableVertexAttribArray(aColor)
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, stride, 8)
      gl.enableVertexAttribArray(aMagnitude)
      gl.vertexAttribPointer(aMagnitude, 1, gl.FLOAT, false, stride, 20)
      gl.enableVertexAttribArray(aTime)
      gl.vertexAttribPointer(aTime, 1, gl.FLOAT, false, stride, 24)

      gl.bindVertexArray(null)

      // Resize
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const rect = canvas!.getBoundingClientRect()
        canvas!.width = rect.width * dpr
        canvas!.height = rect.height * dpr
      }

      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas!)

      setLoaded(true)
      const startTime = performance.now()

      // Render loop
      function render() {
        if (disposed) return

        const elapsed = (performance.now() - startTime) / 1000
        const currentTime = (elapsed * TIMESTEPS_PER_SECOND) % totalDuration

        gl!.viewport(0, 0, canvas!.width, canvas!.height)
        gl!.clearColor(0, 0, 0, 0)
        gl!.clear(gl!.COLOR_BUFFER_BIT)

        // Additive blending — fragment shader pre-multiplies by alpha
        gl!.enable(gl!.BLEND)
        gl!.blendFunc(gl!.ONE, gl!.ONE)

        gl!.useProgram(program!)
        gl!.uniform1f(uCurrentTime!, currentTime)
        gl!.uniform1f(uFadeTime!, FADE_TIME)
        gl!.uniform1f(
          uPixelRatio!,
          Math.min(window.devicePixelRatio || 1, 2)
        )

        gl!.bindVertexArray(vao!)
        gl!.drawArrays(gl!.POINTS, 0, totalSpikes)
        gl!.bindVertexArray(null)

        animRef.current = requestAnimationFrame(render)
      }

      render()

      cleanupGl = () => {
        ro.disconnect()
        gl.deleteBuffer(vbo)
        gl.deleteVertexArray(vao)
        gl.deleteProgram(program)
      }
    }

    init()

    return () => {
      disposed = true
      cancelAnimationFrame(animRef.current)
      cleanupGl?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    />
  )
}
