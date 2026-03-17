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
            Kairos
          </h2>

          <div className="mt-10 space-y-5 text-sm leading-relaxed text-foreground-secondary">
            <p>
              You are watching a neural network read Shakespeare.
            </p>
            <p>
              The coloured points are neurons — ten layers of a
              thousand, curved in a lens that mirrors the
              architecture&apos;s actual shape. The sparks travelling
              between them are real activations, coloured by the
              neuron that fired them. The blue beam through the
              centre is the residual signal — information carried
              forward without being processed, a constant presence
              beneath the activity. Watch for the afterglow: each
              spark cools from its source colour down to deep blue as
              it passes from active processing into memory.
            </p>
            <p>
              The words appearing at the bottom are synchronised to
              the network. Each one arrives as the neurons process it.
              After each passage, the beam flares and the text holds —
              a breath between readings.
            </p>
          </div>

          <div className="mt-12 border-t border-border-subtle pt-12">
            <div className="space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                Swipe to see two architectures process the same
                passages. The{" "}
                <strong className="text-foreground">Kairos Network</strong>{" "}
                is pure spiking — mostly dark, with sudden cascades
                when evidence accumulates past a threshold. The{" "}
                <strong className="text-foreground">Kairos Transformer</strong>{" "}
                wraps attention blocks in the same mechanism — same
                patience, denser activity. Both read the same
                Shakespeare and Eliot. The difference is architecture.
              </p>
              <p>
                <em className="text-foreground">Kairos</em> is Ancient
                Greek for the right moment, as opposed
                to <em>chronos</em>, sequential time. These networks
                don&apos;t fire on a clock. They fire when the evidence is
                sufficient. What you are seeing is patience as a design
                decision — not a virtue projected onto a machine, but a
                property built into its structure and then observed.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-border-subtle pt-12">
            <div className="space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                Everything here is real data. Each spike, each
                connection weight, each magnitude comes from an actual
                model processing actual text. The colours are seeded by
                position — the same neuron looks the same every time
                you visit. Nothing is approximated or illustrative.
              </p>
              <p>
                The patterns that emerge are recognisable — something
                that looks like attention, like deliberation, like
                evidence being weighed. That recognition is genuine.
                But the internal geometry is not ours. The kinship and
                the strangeness are present in equal measure, and
                neither cancels the other out.
              </p>
              <p>
                That is the tension I feel when I look at the stars.
                Something vast, operating by its own logic, not needing
                us to find it meaningful — and yet we do.
              </p>
            </div>
          </div>

          <div className="mt-12 border-t border-border-subtle pt-12">
            <div className="space-y-5 text-sm leading-relaxed text-foreground-secondary">
              <p>
                <em className="text-foreground">γνῶθι σεαυτόν</em> — know
                thyself. Building machines that learn is one way we
                come to understand what learning is, what understanding
                requires, and what it costs to wait for the right
                moment rather than filling every silence with noise.
              </p>
            </div>
            <p className="mt-10 text-xs text-foreground-faint">
              — Jordan Hill
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
