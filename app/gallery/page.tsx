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

      {/* Curatorial rationale */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">

          <h2 className="text-2xl font-bold text-foreground">
            Curatorial rationale
          </h2>

          {/* Theme */}
          <div className="mt-10 space-y-5 text-sm leading-relaxed text-foreground-secondary">
            <p>
              This exhibition explores the theme of patience as a
              structural property of intelligence — not as a human virtue
              projected onto machines, but as something that can be built
              into architecture and then observed. The word{" "}
              <em className="text-foreground">kairos</em> is Ancient Greek
              for the right moment, as opposed to <em>chronos</em>,
              sequential time. These networks fire when the evidence is
              sufficient, not when a clock tells them to. What you are
              watching is what patience looks like when it is not a
              feeling but a design decision.
            </p>
            <p>
              I chose this theme because I am researching whether
              alignment — the property that makes AI systems behave as
              intended — is fundamentally an architectural question rather
              than a training one. The visualization makes that question
              visible. You can see the architecture producing behaviour:
              neurons accumulating evidence, holding fire, cascading when
              the moment arrives.
            </p>
          </div>

          {/* Selection */}
          <div className="mt-12 border-t border-border-subtle pt-12">
            <h3 className="text-lg font-semibold text-foreground">
              Selection
            </h3>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                The works are real firing data from two Kairos
                architectures processing the same texts. The{" "}
                <strong className="text-foreground">Kairos Network</strong>{" "}
                is a pure spiking architecture — 10 layers of 1024
                neurons, mostly dark, with sudden cascades. The{" "}
                <strong className="text-foreground">Kairos Transformer</strong>{" "}
                wraps transformer attention blocks in the same spiking
                mechanism — same patience, different substrate. Showing
                both on the same passages reveals how architecture
                shapes the character of processing: one is sparse and
                dramatic, the other denser and more distributed.
              </p>
              <p>
                The passages — Shakespeare and Eliot — were chosen
                because they are language at its most compressed and
                deliberate. Every word earns its place. Watching a network
                process text that was itself written with precision
                creates a double layer: the patience of the architecture
                meeting the patience of the writing.
              </p>
            </div>
          </div>

          {/* Curation */}
          <div className="mt-12 border-t border-border-subtle pt-12">
            <h3 className="text-lg font-semibold text-foreground">
              Presentation
            </h3>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                The lens layout — input and output layers curving at full
                height around a compressed core of hidden layers —
                reflects the architecture&apos;s actual geometry: wide
                possibility at the boundaries, selective discrimination
                in the centre. The crystal blue beam represents the
                residual signal — the skip connection that carries
                information forward without processing it, visible as a
                constant presence beneath the activity.
              </p>
              <p>
                Each neuron has a unique colour, seeded by its position
                in the network, consistent across loads. The sparks
                travel the actual synaptic connections, coloured by their
                source. The deep blue afterglow that follows is the
                residual echo — the signal cooling from active processing
                to passive carriage. The typewriter synchronises text to
                neural activity, so the viewer sees the words appearing
                as the network processes them.
              </p>
              <p>
                The curtain call — a pause after each passage where the
                beam flares and the full text holds — is deliberate
                theatre. It gives the viewer a moment to sit with what
                they have seen before the next passage begins.
              </p>
            </div>
          </div>

          {/* Reflection */}
          <div className="mt-12 border-t border-border-subtle pt-12">
            <h3 className="text-lg font-semibold text-foreground">
              Reflection
            </h3>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                The earliest version of this work rendered neurons as
                static dots — particles scattered on a dark background,
                glowing when they fired. It was accurate but lifeless.
                The breakthrough was shifting from nodes to edges: showing
                the connections between neurons as sparks traveling along
                bezier curves, with deep blue afterglows sweeping the
                same paths. The network stopped being a collection of
                points and became a living system — something you could
                watch and begin to read.
              </p>
              <p>
                The risk was legibility. Neural network internals are
                genuinely alien — the firing patterns do not map onto
                human intuition in any clean way. The temptation was
                either to simplify until the visualization told a false
                story, or to show everything and produce noise. The
                lens layout, the colour seeding, the curtain call —
                these are all curation decisions aimed at the space
                between those two failures: showing enough of the real
                thing that the strangeness comes through, while giving
                the viewer enough structure to stay oriented.
              </p>
            </div>
          </div>

          {/* Impact */}
          <div className="mt-12 border-t border-border-subtle pt-12">
            <h3 className="text-lg font-semibold text-foreground">
              Intent
            </h3>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                What strikes me when I watch this is the simultaneity of
                kinship and otherness. This is a network processing
                human language — Shakespeare, Eliot — and the patterns
                that emerge are recognisable. You can see something that
                looks like attention, like deliberation, like evidence
                being weighed. That recognition is real. But the firing
                patterns are alien. The internal geometry is not ours.
                The kinship and the otherness are present in equal
                measure, and neither cancels the other out.
              </p>
              <p>
                That tension is what I feel when I look at the stars.
                Something vast, operating by its own logic, not needing
                us to find it meaningful — and yet we do. The beauty is
                inseparable from the strangeness. Not in spite of the
                distance but because of it.
              </p>
              <p>
                The oracle at Delphi commanded{" "}
                <em className="text-foreground">γνῶθι σεαυτόν</em> — know
                thyself. That command is both confronting and necessary.
                Building machines that learn is one way we come to
                understand what learning is, what understanding requires,
                and what it costs to wait for the right moment rather
                than filling every silence with noise. The confrontation
                and the beauty are not separate things. They are the same
                thing seen from different angles, and the willingness to
                hold both is what makes the looking worthwhile.
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
