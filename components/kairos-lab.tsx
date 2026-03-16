"use client"

import { useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────

interface MetaData {
  timesteps: number
  neurons_per_layer: number
  layers: number
  magnitude_range?: [number, number]
  weights: Record<string, number[][]>
  sample_count: number
  samples: Array<{ name: string; text: string }>
}

interface SampleData {
  name: string
  text: string
  spikes: Record<string, number[][]>
  membrane: Record<string, number[][]>
  residual: Record<string, number[][]>
}

// ─── Edge shaders (traveling spark on bezier curves) ──────

const EDGE_VERT = `#version 300 es
precision highp float;

in vec2 a_position;
in vec3 a_color;
in float a_magnitude;
in float a_time;
in float a_progress;

uniform float u_currentTime;
uniform float u_travelTime;
uniform float u_trailTime;

out vec3 v_color;
out float v_magnitude;
out float v_progress;
out float v_sparkPos;
out float v_age;

void main() {
    float age = u_currentTime - a_time;
    float totalLife = u_travelTime + u_trailTime;

    if (age < -0.2 || age > totalLife) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        v_magnitude = 0.0;
        v_color = vec3(0.0);
        return;
    }

    float entrance = smoothstep(-0.2, 0.1, age);
    v_sparkPos = clamp(age / u_travelTime, 0.0, 1.05);
    v_age = age;
    v_progress = a_progress;
    v_color = a_color;
    v_magnitude = a_magnitude * entrance;

    gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
}
`

const EDGE_FRAG = `#version 300 es
precision highp float;

uniform float u_travelTime;

in vec3 v_color;
in float v_magnitude;
in float v_progress;
in float v_sparkPos;
in float v_age;

out vec4 fragColor;

void main() {
    float dist = v_sparkPos - v_progress;
    if (dist < -0.03) discard;

    // Spark: bright coloured head + trail
    float headDist = v_progress - v_sparkPos;
    float head = exp(-headDist * headDist / 0.0015) * 1.4;
    float trail = smoothstep(-0.03, 0.05, dist) * exp(-dist * 1.8);

    // Use real age (not clamped sparkPos) for echo timing
    float echoTime = v_age - u_travelTime;

    // Echo 1: deep blue sweep left→right after spark arrives
    float echo1Pos = echoTime / (u_travelTime * 1.5);
    float echo1Dist = v_progress - echo1Pos;
    float echo1Head = exp(-echo1Dist * echo1Dist / 0.003) * 0.7;
    float echo1Trail = (echo1Dist < 0.0 && echo1Dist > -0.6)
        ? exp(echo1Dist * 3.0) * 0.4 : 0.0;
    float echo1 = (echo1Pos >= 0.0 && echo1Pos < 1.5)
        ? (echo1Head + echo1Trail) * exp(-echoTime * 0.4) : 0.0;

    // Echo 2: dimmer second pulse
    float echo2Age = echoTime - u_travelTime * 0.7;
    float echo2Pos = echo2Age / (u_travelTime * 1.2);
    float echo2Dist = v_progress - echo2Pos;
    float echo2Head = exp(-echo2Dist * echo2Dist / 0.003) * 0.35;
    float echo2Trail = (echo2Dist < 0.0 && echo2Dist > -0.4)
        ? exp(echo2Dist * 4.0) * 0.2 : 0.0;
    float echo2 = (echo2Pos >= 0.0 && echo2Pos < 1.3)
        ? (echo2Head + echo2Trail) * exp(-max(echo2Age, 0.0) * 0.6) : 0.0;

    float afterglow = echo1 + echo2;

    // Intensities
    float sparkIntensity = (head + trail * 0.5) * (0.2 + 0.5 * v_magnitude);
    float afterIntensity = afterglow * (0.3 + 0.4 * v_magnitude);

    float totalIntensity = min(sparkIntensity + afterIntensity, 0.6);
    if (totalIntensity < 0.002) discard;

    // Colour blend: neuron hue → deep blue fading to black
    float blueFade = exp(-max(echoTime, 0.0) * 0.3);
    vec3 deepBlue = vec3(0.15, 0.22, 0.55) * blueFade;
    float blueMix = afterIntensity / max(sparkIntensity + afterIntensity, 0.001);
    vec3 color = mix(v_color, deepBlue, blueMix);

    fragColor = vec4(color * totalIntensity, totalIntensity);
}
`

// ─── Dot shaders (node glow at spike positions) ──────────

const DOT_VERT = `#version 300 es
precision highp float;

in vec2 a_position;
in vec3 a_color;
in float a_magnitude;
in float a_time;
in float a_fanIn;      // normalized incoming connection count

uniform float u_currentTime;
uniform float u_fadeTime;
uniform float u_pixelRatio;

out vec3 v_color;
out float v_alpha;

void main() {
    float age = u_currentTime - a_time;

    if (age < -0.3 || age > u_fadeTime) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        gl_PointSize = 0.0;
        v_alpha = 0.0;
        v_color = vec3(0.0);
        return;
    }

    float normalizedAge = max(age, 0.0) / u_fadeTime;
    float entrance = smoothstep(-0.3, 0.0, age);
    float decay = exp(-normalizedAge * 2.5);

    // Brighter and bigger when more connections fire into this node
    float importance = 0.4 + 0.6 * max(a_magnitude, a_fanIn);
    v_alpha = entrance * decay * importance;
    v_color = a_color * (0.5 + 0.5 * importance);

    gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
    // Size scales with magnitude AND fan-in
    gl_PointSize = (4.0 + a_magnitude * 12.0 + a_fanIn * 16.0) * u_pixelRatio;
}
`

const DOT_FRAG = `#version 300 es
precision highp float;

in vec3 v_color;
in float v_alpha;

out vec4 fragColor;

void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float core = exp(-dist * dist * 10.0);
    float halo = exp(-dist * dist * 3.0) * 0.3;
    float alpha = min(v_alpha * (core + halo), 0.8);
    if (alpha < 0.003) discard;
    fragColor = vec4(v_color * alpha, alpha);
}
`

// ─── Membrane shader (continuous dim glow as potential builds) ─

const MEMBRANE_VERT = `#version 300 es
precision highp float;

in vec2 a_position;
in vec3 a_color;
in float a_magnitude;  // normalized potential (0=80% threshold, 1=at/above threshold)
in float a_time;

uniform float u_currentTime;
uniform float u_pixelRatio;

out vec3 v_color;
out float v_alpha;

void main() {
    float age = u_currentTime - a_time;

    // Visible in a narrow window around current timestep
    if (age < -0.5 || age > 1.5) {
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        gl_PointSize = 0.0;
        v_alpha = 0.0;
        v_color = vec3(0.0);
        return;
    }

    float window = 1.0 - abs(age - 0.5);
    v_alpha = window * a_magnitude * 0.25;
    v_color = a_color * 0.4;

    gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = (2.0 + a_magnitude * 6.0) * u_pixelRatio;
}
`

// Reuses DOT_FRAG for the gaussian glow

// ─── Residual shader (CMB-style full-screen atmospheric glow) ─

const RESIDUAL_VERT = `#version 300 es
precision highp float;

in vec2 a_position;

out vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const RESIDUAL_FRAG = `#version 300 es
precision highp float;

uniform float u_residuals[10];  // current residual per layer
uniform float u_layerX[10];     // x-position of each layer column
uniform int u_numLayers;

in vec2 v_uv;

out vec4 fragColor;

void main() {
    // Accumulate glow from all layer columns
    float glow = 0.0;
    for (int i = 0; i < 10; i++) {
        if (i >= u_numLayers) break;
        float dist = abs(v_uv.x - u_layerX[i]);
        // Wide gaussian centered on each layer column
        float influence = exp(-dist * dist / 0.008) * u_residuals[i];
        glow += influence;
    }

    // Deep blue, atmospheric
    vec3 blue = vec3(0.06, 0.10, 0.30);
    float alpha = glow * 0.25;
    if (alpha < 0.001) discard;

    fragColor = vec4(blue * alpha, alpha);
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
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  return [r + m, g + m, b + m]
}

function neuronColor(layerIdx: number, neuronIdx: number, npl: number): [number, number, number] {
  const globalIdx = layerIdx * npl + neuronIdx
  const hue = (globalIdx * 137.508) % 360
  const rng = mulberry32(globalIdx * 7919)
  return hslToRgb(hue, 0.70 + rng() * 0.25, 0.50 + rng() * 0.15)
}

// Left-to-right column layout
function neuronPosition(
  layerIdx: number, neuronIdx: number,
  totalLayers: number, npl: number
): [number, number] {
  const rng = mulberry32((layerIdx * npl + neuronIdx) * 1337)
  const mx = 0.06
  const x = mx + (layerIdx / Math.max(totalLayers - 1, 1)) * (1.0 - 2 * mx)
  const my = 0.06
  const y = my + rng() * (1.0 - 2 * my)
  return [x, y]
}

// Cubic bezier evaluation
function bezier(
  p0: [number, number], p1: [number, number],
  p2: [number, number], p3: [number, number], t: number
): [number, number] {
  const u = 1 - t
  return [
    u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
    u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
  ]
}

// ─── WebGL helpers ────────────────────────────────────────

function compileShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type)
  if (!s) return null
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error("Shader:", gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

function linkProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram | null {
  const v = compileShader(gl, gl.VERTEX_SHADER, vs)
  const f = compileShader(gl, gl.FRAGMENT_SHADER, fs)
  if (!v || !f) return null
  const p = gl.createProgram()!
  gl.attachShader(p, v)
  gl.attachShader(p, f)
  gl.linkProgram(p)
  gl.deleteShader(v)
  gl.deleteShader(f)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error("Link:", gl.getProgramInfoLog(p))
    return null
  }
  return p
}

// ─── Constants ────────────────────────────────────────────

const TPS = 10
const DOT_FADE = 6.0
const SPARK_TRAVEL = 2.0
const SPARK_TRAIL = 6.0
const SAMPLE_GAP = 20
const CURVE_SEGMENTS = 6        // smooth bezier curves
const MAX_EDGES = 8000          // cap for performance

// ─── Component ────────────────────────────────────────────

interface KairosLabProps {
  onSampleLoaded?: (name: string, text: string, timesteps: number, tps: number) => void
}

export default function KairosLab({ onSampleLoaded }: KairosLabProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let disposed = false
    let cleanup: (() => void) | undefined

    async function init() {
      // Stream JSONL — parallel fetch of meta + random sample
      async function streamJsonl(url: string): Promise<Record<string, any>[]> {
        const res = await fetch(url)
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        const lines: Record<string, any>[] = []
        let buf = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const parts = buf.split('\n')
          buf = parts.pop()!
          for (const p of parts) {
            if (p.trim()) lines.push(JSON.parse(p))
          }
        }
        if (buf.trim()) lines.push(JSON.parse(buf))
        return lines
      }

      const sampleIdx = Math.floor(Math.random() * 5)
      const [metaLines, sampleLines] = await Promise.all([
        streamJsonl("/kairos/meta.jsonl"),
        streamJsonl(`/kairos/sample_${sampleIdx}.jsonl`),
      ])
      if (disposed) return

      // Reconstruct meta
      const metaLine = metaLines.find(l => l.type === 'meta')!
      const weights: Record<string, number[][]> = {}
      for (const l of metaLines) {
        if (l.type === 'weights') weights[l.layer] = l.connections
      }
      const meta: MetaData = { ...metaLine, weights } as MetaData

      // Reconstruct sample
      const sampleMeta = sampleLines.find(l => l.type === 'sample_meta')!
      const spikes: Record<string, number[][]> = {}
      const membrane: Record<string, number[][]> = {}
      const residual: Record<string, number[][]> = {}
      for (const l of sampleLines) {
        if (l.type === 'spikes') spikes[l.layer] = l.data
        else if (l.type === 'membrane') membrane[l.layer] = l.data
        else if (l.type === 'residual') residual[l.layer] = l.data
      }
      const sample: SampleData = {
        name: sampleMeta.name, text: sampleMeta.text,
        spikes, membrane, residual,
      }

      onSampleLoaded?.(sample.name, sample.text, meta.timesteps, TPS)

      const { layers: nLayers, neurons_per_layer: npl, timesteps } = meta
      const magMin = meta.magnitude_range?.[0] ?? 5.0
      const magMax = meta.magnitude_range?.[1] ?? 46.3
      const logMin = Math.log(magMin)
      const logRange = Math.log(magMax) - logMin || 1.0

      const normMag = (m: number) =>
        Math.min(1.0, 0.15 + 0.85 * Math.max(0.0, (Math.log(m) - logMin) / logRange))

      // Single sample — loops continuously
      const totalDuration = timesteps

      // Pre-compute positions and colors
      const pos: [number, number][][] = []
      const col: [number, number, number][][] = []
      for (let l = 0; l < nLayers; l++) {
        pos[l] = []
        col[l] = []
        for (let n = 0; n < npl; n++) {
          pos[l][n] = neuronPosition(l, n, nLayers, npl)
          col[l][n] = neuronColor(l, n, npl)
        }
      }

      // ── Edge detection using actual weights ──
      let totalSpikes = 0
      for (const v of Object.values(sample.spikes)) totalSpikes += (v as number[][]).length

      const edges: number[][] = []
      const fanInMap = new Map<string, number>()

      // Build spike timestep index per layer
      const spikeIdx: Map<number, [number, number][]>[] = []
      for (let l = 0; l < nLayers; l++) {
        spikeIdx[l] = new Map()
        for (const [ts, ni, mag] of (sample.spikes[`layer_${l}`] || [])) {
          if (!spikeIdx[l].has(ts)) spikeIdx[l].set(ts, [])
          spikeIdx[l].get(ts)!.push([ni, mag])
        }
      }

      // Build spike lookup: which timesteps does each neuron fire at?
      const neuronFires: Map<number, number[]>[] = []
      for (let l = 0; l < nLayers; l++) {
        neuronFires[l] = new Map()
        for (const [ts, ni] of (sample.spikes[`layer_${l}`] || [])) {
          if (!neuronFires[l].has(ni)) neuronFires[l].set(ni, [])
          neuronFires[l].get(ni)!.push(ts)
        }
      }

      // Use weights for real edges — only draw where both src fires and dst fires
      const weightKeys = Object.keys(meta.weights).filter(k => k.includes('_'))
      for (const wKey of weightKeys) {
        const parts = wKey.split('_')
        const srcLayer = wKey.startsWith('emb_') ? -1 : parseInt(parts[0])
        const dstLayer = parseInt(parts[parts.length - 1])
        if (srcLayer < 0 || srcLayer >= nLayers || dstLayer >= nLayers) continue

        const weights = meta.weights[wKey]
        for (const [srcN, dstN, w] of weights) {
          const srcTimes = neuronFires[srcLayer]?.get(srcN)
          if (!srcTimes) continue
          const dstTimes = neuronFires[dstLayer]?.get(dstN)
          if (!dstTimes) continue
          const dstSet = new Set(dstTimes)

          for (const ts of srcTimes) {
            if (dstSet.has(ts) || dstSet.has(ts + 1)) {
              const [sx, sy] = pos[srcLayer][srcN]
              const [dx, dy] = pos[dstLayer][dstN]
              const [r, g, b] = col[srcLayer][srcN]
              const mag = Math.min(1.0, Math.abs(w))
              edges.push([sx, sy, dx, dy, r, g, b, mag, ts])

              const dstKey = `${dstLayer}_${dstN}_${ts}`
              fanInMap.set(dstKey, (fanInMap.get(dstKey) || 0) + 1)
            }
          }
        }
      }

      let maxFanIn = 1
      for (const v of fanInMap.values()) if (v > maxFanIn) maxFanIn = v

      // ── Dot data (spikes with fan-in) ──
      const dotFloats = 8
      const dotBuf = new Float32Array(totalSpikes * dotFloats)
      let di = 0

      for (let l = 0; l < nLayers; l++) {
        for (const [ts, ni, mag] of (sample.spikes[`layer_${l}`] || [])) {
          const [x, y] = pos[l][ni]
          const [r, g, b] = col[l][ni]
          const key = `${l}_${ni}_${ts}`
          const fanIn = fanInMap.get(key) || 0
          const normFanIn = Math.min(1.0, Math.log(1 + fanIn) / Math.log(1 + maxFanIn))

          dotBuf[di++] = x; dotBuf[di++] = y
          dotBuf[di++] = r; dotBuf[di++] = g; dotBuf[di++] = b
          dotBuf[di++] = normMag(mag)
          dotBuf[di++] = ts
          dotBuf[di++] = normFanIn
        }
      }

      // ── Cap edges for performance, keep strongest ──
      if (edges.length > MAX_EDGES) {
        edges.sort((a, b) => b[7] - a[7]) // sort by magnitude descending
        edges.length = MAX_EDGES
      }

      // ── Tessellate edges into bezier line segments ──
      const evf = 8 // x,y,r,g,b,mag,time,progress (no lateral — using LINES)
      const totalEdgeVerts = edges.length * CURVE_SEGMENTS * 2
      const edgeBuf = new Float32Array(totalEdgeVerts * evf)
      let ei = 0

      for (const [sx, sy, dx, dy, r, g, b, mag, time] of edges) {
        const p0: [number, number] = [sx, sy]
        const p3: [number, number] = [dx, dy]
        const span = dx - sx
        const p1: [number, number] = [sx + span * 0.35, sy]
        const p2: [number, number] = [dx - span * 0.35, dy]

        for (let s = 0; s < CURVE_SEGMENTS; s++) {
          const t0 = s / CURVE_SEGMENTS
          const t1 = (s + 1) / CURVE_SEGMENTS
          const [x0, y0] = bezier(p0, p1, p2, p3, t0)
          const [x1, y1] = bezier(p0, p1, p2, p3, t1)

          edgeBuf[ei++] = x0; edgeBuf[ei++] = y0
          edgeBuf[ei++] = r; edgeBuf[ei++] = g; edgeBuf[ei++] = b
          edgeBuf[ei++] = mag; edgeBuf[ei++] = time; edgeBuf[ei++] = t0

          edgeBuf[ei++] = x1; edgeBuf[ei++] = y1
          edgeBuf[ei++] = r; edgeBuf[ei++] = g; edgeBuf[ei++] = b
          edgeBuf[ei++] = mag; edgeBuf[ei++] = time; edgeBuf[ei++] = t1
        }
      }

      // ── Membrane data (continuous glow as evidence builds) ──
      const threshold = magMin // θ = 5.0
      const membraneEntries: number[][] = []
      for (let l = 0; l < nLayers; l++) {
        for (const [ts, ni, potential] of (sample.membrane[`layer_${l}`] || [])) {
          const normPot = Math.min(1.0, Math.max(0.0, (potential - threshold * 0.8) / (threshold * 0.4)))
          const [x, y] = pos[l][ni]
          const [r, g, b] = col[l][ni]
          membraneEntries.push([x, y, r, g, b, normPot, ts])
        }
      }
      // Subsample if too many (keep every Nth for performance)
      const MAX_MEMBRANE = 50000
      const memSkip = Math.max(1, Math.ceil(membraneEntries.length / MAX_MEMBRANE))
      const memFiltered = memSkip > 1
        ? membraneEntries.filter((_, i) => i % memSkip === 0)
        : membraneEntries
      const memFloats = 7
      const memBuf = new Float32Array(memFiltered.length * memFloats)
      let mi = 0
      for (const [x, y, r, g, b, mag, ts] of memFiltered) {
        memBuf[mi++] = x; memBuf[mi++] = y
        memBuf[mi++] = r; memBuf[mi++] = g; memBuf[mi++] = b
        memBuf[mi++] = mag; memBuf[mi++] = ts
      }
      const totalMembrane = memFiltered.length

      // ── Residual data (CMB-style: lookup table indexed by timestep) ──
      let maxResidual = 0
      for (let l = 0; l < nLayers; l++) {
        for (const [, mag] of (sample.residual[`layer_${l}`] || [])) {
          if (mag > maxResidual) maxResidual = mag
        }
      }
      // Build lookup: residualByTs[timestep][layer] = normalized magnitude
      const residualByTs: Float32Array[] = []
      for (let t = 0; t < timesteps; t++) {
        residualByTs[t] = new Float32Array(nLayers)
      }
      for (let l = 0; l < nLayers; l++) {
        for (const [ts, mag] of (sample.residual[`layer_${l}`] || [])) {
          if (ts < timesteps) {
            residualByTs[ts][l] = maxResidual > 0 ? mag / maxResidual : 0
          }
        }
      }
      // Layer x-positions for the shader
      const layerXPositions = new Float32Array(nLayers)
      for (let l = 0; l < nLayers; l++) {
        layerXPositions[l] = 0.06 + (l / Math.max(nLayers - 1, 1)) * 0.88
      }
      // Full-screen quad (2 triangles)
      const quadBuf = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1])

      // ── WebGL ──
      const gl = canvas!.getContext("webgl2", {
        alpha: true, premultipliedAlpha: false, antialias: true,
      })
      if (!gl || disposed) return

      // Edge program
      const eProg = linkProgram(gl, EDGE_VERT, EDGE_FRAG)!
      const eVbo = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, eVbo)
      gl.bufferData(gl.ARRAY_BUFFER, edgeBuf, gl.STATIC_DRAW)

      const eVao = gl.createVertexArray()!
      gl.bindVertexArray(eVao)
      const eStr = evf * 4
      gl.enableVertexAttribArray(gl.getAttribLocation(eProg, "a_position"))
      gl.vertexAttribPointer(gl.getAttribLocation(eProg, "a_position"), 2, gl.FLOAT, false, eStr, 0)
      gl.enableVertexAttribArray(gl.getAttribLocation(eProg, "a_color"))
      gl.vertexAttribPointer(gl.getAttribLocation(eProg, "a_color"), 3, gl.FLOAT, false, eStr, 8)
      gl.enableVertexAttribArray(gl.getAttribLocation(eProg, "a_magnitude"))
      gl.vertexAttribPointer(gl.getAttribLocation(eProg, "a_magnitude"), 1, gl.FLOAT, false, eStr, 20)
      gl.enableVertexAttribArray(gl.getAttribLocation(eProg, "a_time"))
      gl.vertexAttribPointer(gl.getAttribLocation(eProg, "a_time"), 1, gl.FLOAT, false, eStr, 24)
      gl.enableVertexAttribArray(gl.getAttribLocation(eProg, "a_progress"))
      gl.vertexAttribPointer(gl.getAttribLocation(eProg, "a_progress"), 1, gl.FLOAT, false, eStr, 28)
      gl.bindVertexArray(null)

      const euTime = gl.getUniformLocation(eProg, "u_currentTime")!
      const euTravel = gl.getUniformLocation(eProg, "u_travelTime")!
      const euTrail = gl.getUniformLocation(eProg, "u_trailTime")!

      // Dot program
      const dProg = linkProgram(gl, DOT_VERT, DOT_FRAG)!
      const dVbo = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, dVbo)
      gl.bufferData(gl.ARRAY_BUFFER, dotBuf, gl.STATIC_DRAW)

      const dVao = gl.createVertexArray()!
      gl.bindVertexArray(dVao)
      const dStr = dotFloats * 4
      gl.enableVertexAttribArray(gl.getAttribLocation(dProg, "a_position"))
      gl.vertexAttribPointer(gl.getAttribLocation(dProg, "a_position"), 2, gl.FLOAT, false, dStr, 0)
      gl.enableVertexAttribArray(gl.getAttribLocation(dProg, "a_color"))
      gl.vertexAttribPointer(gl.getAttribLocation(dProg, "a_color"), 3, gl.FLOAT, false, dStr, 8)
      gl.enableVertexAttribArray(gl.getAttribLocation(dProg, "a_magnitude"))
      gl.vertexAttribPointer(gl.getAttribLocation(dProg, "a_magnitude"), 1, gl.FLOAT, false, dStr, 20)
      gl.enableVertexAttribArray(gl.getAttribLocation(dProg, "a_time"))
      gl.vertexAttribPointer(gl.getAttribLocation(dProg, "a_time"), 1, gl.FLOAT, false, dStr, 24)
      gl.enableVertexAttribArray(gl.getAttribLocation(dProg, "a_fanIn"))
      gl.vertexAttribPointer(gl.getAttribLocation(dProg, "a_fanIn"), 1, gl.FLOAT, false, dStr, 28)
      gl.bindVertexArray(null)

      const duTime = gl.getUniformLocation(dProg, "u_currentTime")!
      const duFade = gl.getUniformLocation(dProg, "u_fadeTime")!
      const duDpr = gl.getUniformLocation(dProg, "u_pixelRatio")!

      // Membrane program (reuses DOT_FRAG for gaussian glow)
      const mProg = linkProgram(gl, MEMBRANE_VERT, DOT_FRAG)!
      const mVbo = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, mVbo)
      gl.bufferData(gl.ARRAY_BUFFER, memBuf, gl.STATIC_DRAW)

      const mVao = gl.createVertexArray()!
      gl.bindVertexArray(mVao)
      const mStr = memFloats * 4
      gl.enableVertexAttribArray(gl.getAttribLocation(mProg, "a_position"))
      gl.vertexAttribPointer(gl.getAttribLocation(mProg, "a_position"), 2, gl.FLOAT, false, mStr, 0)
      gl.enableVertexAttribArray(gl.getAttribLocation(mProg, "a_color"))
      gl.vertexAttribPointer(gl.getAttribLocation(mProg, "a_color"), 3, gl.FLOAT, false, mStr, 8)
      gl.enableVertexAttribArray(gl.getAttribLocation(mProg, "a_magnitude"))
      gl.vertexAttribPointer(gl.getAttribLocation(mProg, "a_magnitude"), 1, gl.FLOAT, false, mStr, 20)
      gl.enableVertexAttribArray(gl.getAttribLocation(mProg, "a_time"))
      gl.vertexAttribPointer(gl.getAttribLocation(mProg, "a_time"), 1, gl.FLOAT, false, mStr, 24)
      gl.bindVertexArray(null)

      const muTime = gl.getUniformLocation(mProg, "u_currentTime")!
      const muDpr = gl.getUniformLocation(mProg, "u_pixelRatio")!

      // Residual program (full-screen quad + per-frame uniforms)
      const rProg = linkProgram(gl, RESIDUAL_VERT, RESIDUAL_FRAG)!
      const rVbo = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, rVbo)
      gl.bufferData(gl.ARRAY_BUFFER, quadBuf, gl.STATIC_DRAW)

      const rVao = gl.createVertexArray()!
      gl.bindVertexArray(rVao)
      gl.enableVertexAttribArray(gl.getAttribLocation(rProg, "a_position"))
      gl.vertexAttribPointer(gl.getAttribLocation(rProg, "a_position"), 2, gl.FLOAT, false, 0, 0)
      gl.bindVertexArray(null)

      // Set static uniforms
      gl.useProgram(rProg)
      gl.uniform1fv(gl.getUniformLocation(rProg, "u_layerX[0]"), layerXPositions)
      gl.uniform1i(gl.getUniformLocation(rProg, "u_numLayers"), nLayers)
      const ruResiduals = gl.getUniformLocation(rProg, "u_residuals[0]")!

      // Resize
      function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const r = canvas!.getBoundingClientRect()
        canvas!.width = r.width * dpr
        canvas!.height = r.height * dpr
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(canvas!)

      setLoaded(true)
      const t0 = performance.now()

      function render() {
        if (disposed) return
        const now = ((performance.now() - t0) / 1000 * TPS) % totalDuration
        const dpr = Math.min(window.devicePixelRatio || 1, 2)

        gl!.viewport(0, 0, canvas!.width, canvas!.height)
        gl!.clearColor(0, 0, 0, 0)
        gl!.clear(gl!.COLOR_BUFFER_BIT)
        gl!.enable(gl!.BLEND)
        gl!.blendFunc(gl!.ONE, gl!.ONE)

        // 1. Residual CMB (deep blue atmospheric glow — drawn first)
        const currentTs = Math.floor(now) % timesteps
        gl!.useProgram(rProg)
        gl!.uniform1fv(ruResiduals, residualByTs[currentTs] || new Float32Array(nLayers))
        gl!.bindVertexArray(rVao)
        gl!.drawArrays(gl!.TRIANGLES, 0, 6)
        gl!.bindVertexArray(null)

        // 2. Membrane (dim continuous glow — evidence building)
        gl!.useProgram(mProg)
        gl!.uniform1f(muTime, now)
        gl!.uniform1f(muDpr, dpr)
        gl!.bindVertexArray(mVao)
        gl!.drawArrays(gl!.POINTS, 0, totalMembrane)
        gl!.bindVertexArray(null)

        // 3. Edges (sparks traveling along wires)
        gl!.useProgram(eProg)
        gl!.uniform1f(euTime, now)
        gl!.uniform1f(euTravel, SPARK_TRAVEL)
        gl!.uniform1f(euTrail, SPARK_TRAIL)
        gl!.bindVertexArray(eVao)
        gl!.drawArrays(gl!.LINES, 0, totalEdgeVerts)
        gl!.bindVertexArray(null)

        // 4. Spike dots (bright flash — drawn last, on top)
        gl!.useProgram(dProg)
        gl!.uniform1f(duTime, now)
        gl!.uniform1f(duFade, DOT_FADE)
        gl!.uniform1f(duDpr, dpr)
        gl!.bindVertexArray(dVao)
        gl!.drawArrays(gl!.POINTS, 0, totalSpikes)
        gl!.bindVertexArray(null)

        animRef.current = requestAnimationFrame(render)
      }

      render()

      cleanup = () => {
        ro.disconnect()
        gl!.deleteBuffer(eVbo); gl!.deleteBuffer(dVbo)
        gl!.deleteBuffer(mVbo); gl!.deleteBuffer(rVbo)
        gl!.deleteVertexArray(eVao); gl!.deleteVertexArray(dVao)
        gl!.deleteVertexArray(mVao); gl!.deleteVertexArray(rVao)
        gl!.deleteProgram(eProg); gl!.deleteProgram(dProg)
        gl!.deleteProgram(mProg); gl!.deleteProgram(rProg)
      }
    }

    init()
    return () => { disposed = true; cancelAnimationFrame(animRef.current); cleanup?.() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
      aria-hidden="true"
    />
  )
}
