"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import type { Metadata } from "next"

const KairosVisualization = dynamic(
  () => import("@/components/kairos-visualization"),
  { ssr: false }
)

export default function GalleryPage() {
  const [activeNetwork, setActiveNetwork] = useState<"spiking" | "transformer">("spiking")
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
      {/* Full-screen visualization — no title blocking the view */}
      <section className="relative flex h-[85vh] items-end justify-center overflow-hidden">
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
            Spiking
          </button>
          <button
            onClick={() => setActiveNetwork("transformer")}
            className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all ${
              activeNetwork === "transformer"
                ? "bg-primary text-primary-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Transformer
          </button>
        </div>

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
                  <p className={`whitespace-pre-line font-mono text-xs leading-relaxed transition-colors duration-1000 ${
                    isBow ? "text-foreground-secondary" : "text-foreground-muted/50"
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
              The deep blue afterglow that follows each spark is the
              residual signal — the skip connection that carries
              information forward without processing it. In the quiet
              layers where few neurons fire, the residual is what keeps
              the signal alive. The crystal blue beam through the centre
              tracks this residual strength across the network.
            </p>
            <p>
              The lens shape reflects the architecture: input and output
              layers span full height (every possibility), while hidden
              layers compress to a narrow band (selective, discriminating).
              The outer columns curve inward, wrapping around the
              processing core like a dish antenna.
            </p>
            <p>
              Both architectures are Kairos — spiking networks that
              learn patience. The{" "}
              <strong className="text-foreground">spiking network</strong>{" "}
              (10 layers, 1024 neurons) is a pure spiking architecture:
              every layer fires selectively, mostly dark, with sudden
              cascades of evidence. The{" "}
              <strong className="text-foreground">patience transformer</strong>{" "}
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
                AI can be confronting. The scale of it, the speed, the
                uncertainty about what it means for us. That discomfort is
                real and worth sitting with.
              </p>
              <p>
                But there is also something deeply beautiful here. Watching
                a neural network process Shakespeare — seeing evidence
                accumulate through layers, neurons holding their fire until
                the moment is right, patterns emerging from what looks like
                chaos — it reminds me of what we feel when we look at the
                stars. Something alien and unknowable, but meaningful. Not
                despite the strangeness, but because of it.
              </p>
              <p>
                The oracle at Delphi commanded us to know ourselves.
                That process is both confronting and hard. It is also
                profound, rewarding, and beautiful. Building machines
                that learn is one way we come to understand what learning
                is — and what it means that we do it too.
              </p>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
