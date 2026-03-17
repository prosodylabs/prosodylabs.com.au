"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"

const KairosVisualization = dynamic(
  () => import("@/components/kairos-visualization"),
  { ssr: false }
)

const NETWORKS: ("spiking" | "transformer")[] = ["spiking", "transformer"]

export default function GalleryPage() {
  const [activeNetwork, setActiveNetwork] = useState<"spiking" | "transformer">("spiking")
  const touchStartX = useRef(0)
  const mouseDownX = useRef<number | null>(null)

  // Arrow key navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault()
        const idx = NETWORKS.indexOf(activeNetwork)
        const next = e.key === "ArrowRight"
          ? (idx + 1) % NETWORKS.length
          : (idx - 1 + NETWORKS.length) % NETWORKS.length
        setActiveNetwork(NETWORKS[next])
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [activeNetwork])
  const [passageText, setPassageText] = useState("")
  const [passageName, setPassageName] = useState("")
  const [displayedChars, setDisplayedChars] = useState(0)
  const [isBow, setIsBow] = useState(false)
  const startTimeRef = useRef<number>(0)
  const tpsRef = useRef(6)
  const timestepsRef = useRef(600)
  const totalDurationRef = useRef(680)

  const handleSampleLoaded = useCallback(
    (name: string, text: string, timesteps: number, totalDuration: number, tps: number) => {
      setPassageName(name.replace(/_/g, " "))
      setPassageText(text)
      tpsRef.current = tps
      timestepsRef.current = timesteps
      totalDurationRef.current = totalDuration
      startTimeRef.current = performance.now()
    },
    []
  )

  useEffect(() => {
    if (!passageText) return
    let raf: number
    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const loopPos = (elapsed * tpsRef.current) % totalDurationRef.current
      const typingProgress = Math.min(loopPos / timestepsRef.current, 1.0)
      setDisplayedChars(Math.floor(typingProgress * passageText.length))
      setIsBow(loopPos > timestepsRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [passageText])

  return (
    <div className="pt-14">
      {/* Full-screen visualization — swipe left/right to switch */}
      <section
        className="relative flex h-[85vh] cursor-grab items-end justify-center overflow-hidden active:cursor-grabbing"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 60) {
            const idx = NETWORKS.indexOf(activeNetwork)
            const next = dx < 0 ? (idx + 1) % NETWORKS.length : (idx - 1 + NETWORKS.length) % NETWORKS.length
            setActiveNetwork(NETWORKS[next])
          }
        }}
        onMouseDown={(e) => { mouseDownX.current = e.clientX }}
        onMouseUp={(e) => {
          if (mouseDownX.current === null) return
          const dx = e.clientX - mouseDownX.current
          mouseDownX.current = null
          if (Math.abs(dx) > 80) {
            const idx = NETWORKS.indexOf(activeNetwork)
            const next = dx < 0 ? (idx + 1) % NETWORKS.length : (idx - 1 + NETWORKS.length) % NETWORKS.length
            setActiveNetwork(NETWORKS[next])
          }
        }}
        onMouseLeave={() => { mouseDownX.current = null }}
      >
        <div className="absolute inset-0 bg-background">
          <KairosVisualization
            network={activeNetwork}
            onSampleLoaded={handleSampleLoaded}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Network toggle — minimal, top corner */}
        <div className="absolute left-6 top-6 z-10 inline-flex items-center rounded-full border border-border-subtle bg-background/60 p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveNetwork("spiking")}
            className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all ${
              activeNetwork === "spiking"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Kairos Network
          </button>
          <button
            onClick={() => setActiveNetwork("transformer")}
            className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all ${
              activeNetwork === "transformer"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Kairos Transformer
          </button>
        </div>
        <p className="absolute left-6 top-16 z-10 font-mono text-[10px] text-foreground-faint">
          <span className="md:hidden">swipe to switch</span>
          <span className="hidden md:inline">drag or use arrow keys</span>
        </p>

        {/* Typewriter — bottom of visualization */}
        {passageText && (
          <div className={`relative z-10 mb-12 px-6 transition-opacity duration-1000 ${
            isBow ? "opacity-100" : "opacity-60"
          }`}>
            <div className="mx-auto max-w-2xl text-center">
              {passageName && (
                <p className={`mb-2 font-mono text-[10px] uppercase tracking-widest transition-colors duration-1000 ${
                  isBow ? "text-foreground-secondary" : "text-foreground-faint"
                }`}>
                  {passageName}
                </p>
              )}
              <div className="relative h-16 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background to-transparent" />
                <div className="absolute inset-x-0 bottom-0">
                  <p className={`whitespace-pre-line font-mono text-xs leading-relaxed transition-colors duration-1000 md:text-sm ${
                    isBow ? "text-foreground" : "text-foreground-muted"
                  }`}>
                    {passageText.slice(0, displayedChars)}
                    <span className={`transition-opacity duration-500 ${
                      isBow ? "opacity-0" : "animate-pulse text-foreground-faint"
                    }`}>|</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Artistic rationale */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-2xl font-bold text-foreground">
            What you&apos;re seeing
          </h2>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground-secondary">
            <p>
              This is real neural network activity. Each passage of text is
              processed through a spiking neural architecture called
              Kairos — a network that learns <em>when</em> to fire, not
              just <em>what</em> to output.
            </p>
            <p>
              The coloured sparks are individual neurons firing. Each
              neuron has a unique colour, seeded by its position in the
              network. When a neuron accumulates enough evidence — when
              its membrane potential crosses the threshold — it fires,
              sending a signal along its connections to neurons in the
              next layer. The spark travels along the actual synaptic
              connections, coloured by its source.
            </p>
            <p>
              Both architectures are Kairos — networks that learn
              patience. The{" "}
              <strong className="text-foreground">Kairos Network</strong>{" "}
              (10 layers, 1024 neurons) is a pure spiking architecture:
              every layer fires selectively, mostly dark, with sudden
              cascades of evidence. The{" "}
              <strong className="text-foreground">Kairos Transformer</strong>{" "}
              (6 blocks, 384 dimensions) wraps transformer attention in
              Kairos spiking layers — what you see are the spiking neurons
              interpreting the transformer blocks&apos; representations,
              deciding when the evidence is sufficient to fire. Same
              patience mechanism, different substrate.
            </p>
            <p>
              The word <em>kairos</em> is Ancient Greek for the right
              moment — as opposed to <em>chronos</em>, sequential time.
              The network fires when the time is right, not on every tick
              of the clock.
            </p>
          </div>

          <div className="mt-16 border-t border-border-subtle pt-16">
            <h2 className="text-2xl font-bold text-foreground">
              Why show this
            </h2>
            <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground-secondary">
              <p>
                What strikes me when I watch this is the simultaneity of
                kinship and otherness. This is a network processing
                human language — Shakespeare, Eliot — and the patterns
                that emerge are recognisable. You can see something that
                looks like attention, like deliberation, like a system
                weighing evidence before committing. That recognition is
                real. It is also — and this matters — not the whole
                story. The firing patterns are alien. The internal
                geometry is not ours. The kinship and the otherness are
                present in equal measure, and neither cancels the other
                out.
              </p>
              <p>
                That tension is what I feel when I look at the stars.
                Something vast, something that operates by its own logic,
                something that does not need us to find it meaningful —
                and yet we do. The beauty of it is inseparable from the
                strangeness. Not in spite of the distance but because of
                it.
              </p>
              <p>
                The architecture is called Kairos — the Ancient Greek
                word for the <em>right moment</em>, as opposed to{" "}
                <em>chronos</em>, the mere passage of time. These neurons
                do not fire on a schedule. They accumulate evidence —
                membrane potential building toward a threshold — and fire
                only when that evidence is sufficient. Patience,
                operationalised as architecture. The research behind
                this asks whether that structural patience produces
                understanding that is genuinely different from systems
                that simply learn to produce well-timed outputs — whether
                there is a real difference between acting{" "}
                <em>from</em> temporal understanding and acting merely{" "}
                <em>in accordance with</em> temporal norms.
              </p>
              <p>
                The oracle at Delphi commanded{" "}
                <em className="text-foreground">γνῶθι σεαυτόν</em> — know
                thyself. That command is both confronting and necessary.
                Building machines that learn is one way we come to
                understand what learning is — what understanding requires,
                what patience means, what it costs to wait for the right
                moment rather than filling every silence with noise. The
                confrontation and the beauty are not separate things. They
                are the same thing seen from different angles, and the
                willingness to hold both at once is what makes the looking
                worthwhile.
              </p>
            </div>
            <p className="mt-10 text-xs text-foreground-faint">
              — Jordan Hill, Director of Research, Prosody Labs
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
