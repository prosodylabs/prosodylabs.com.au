"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, EffectFade } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/pagination"

const KairosVisualization = dynamic(
  () => import("@/components/kairos-visualization"),
  { ssr: false }
)

const SLIDES = [
  { network: "spiking" as const, label: "Kairos Network" },
  { network: "transformer" as const, label: "Kairos Transformer" },
]

export default function GalleryPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [passageText, setPassageText] = useState("")
  const [passageName, setPassageName] = useState("")
  const [displayedChars, setDisplayedChars] = useState(0)
  const [isBow, setIsBow] = useState(false)
  const startTimeRef = useRef<number>(0)
  const tpsRef = useRef(6)
  const timestepsRef = useRef(600)
  const totalDurationRef = useRef(680)
  const swiperRef = useRef<SwiperType | null>(null)

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

  // Typewriter sync
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
      {/* Swiper carousel */}
      <section className="relative h-[85vh] overflow-hidden">
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="h-full"
          touchRatio={1.5}
          threshold={10}
          resistanceRatio={0.65}
        >
          {SLIDES.map((slide) => (
            <SwiperSlide key={slide.network} className="relative">
              <div className="absolute inset-0 bg-background">
                <KairosVisualization
                  network={slide.network}
                  {...(slide.network === "spiking" ? { onSampleLoaded: handleSampleLoaded } : {})}
                />
              </div>

              {/* Label */}
              <p className="absolute left-4 top-4 z-10 rounded-full bg-background/60 px-3 py-1 font-mono text-[10px] text-foreground-muted backdrop-blur-sm">
                {slide.label}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Bottom gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Navigation dots */}
        <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.network}
              onClick={() => swiperRef.current?.slideTo(i)}
              aria-label={slide.label}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-6 bg-foreground-muted"
                  : "w-2 bg-foreground-faint/50 hover:bg-foreground-faint"
              }`}
            />
          ))}
        </div>

        {/* Arrow hints */}
        {activeIndex === 0 && (
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/40 p-2 text-foreground-muted backdrop-blur-sm transition-opacity hover:bg-background/60"
            aria-label="Next"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4l6 6-6 6" />
            </svg>
          </button>
        )}
        {activeIndex === 1 && (
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/40 p-2 text-foreground-muted backdrop-blur-sm transition-opacity hover:bg-background/60"
            aria-label="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 4l-6 6 6 6" />
            </svg>
          </button>
        )}

        {/* Typewriter overlay — bottom of visualization */}
        {passageText && (
          <div className={`pointer-events-none absolute inset-x-0 bottom-12 z-10 px-6 transition-opacity duration-1000 ${
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

          <h2 className="text-3xl font-bold italic tracking-tight text-foreground">
            Kairos: Of Distance and Nearness
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
