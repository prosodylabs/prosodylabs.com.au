"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"

const KairosVisualization = dynamic(
  () => import("@/components/kairos-visualization"),
  { ssr: false }
)

export function Hero() {
  const [passageText, setPassageText] = useState("")
  const [displayedChars, setDisplayedChars] = useState(0)
  const [isBow, setIsBow] = useState(false)
  const startTimeRef = useRef<number>(0)
  const tpsRef = useRef(6)
  const timestepsRef = useRef(600)
  const totalDurationRef = useRef(680)

  const handleSampleLoaded = useCallback(
    (_name: string, text: string, timesteps: number, totalDuration: number, tps: number) => {
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
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <KairosVisualization network="spiking" onSampleLoaded={handleSampleLoaded} />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      {/* Frosted glass pane behind text for readability */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="absolute -inset-x-8 -inset-y-6 rounded-3xl border border-border-subtle/30 bg-background/50 backdrop-blur-md" />
        <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-sovereign/30 bg-sovereign-muted/50 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sovereign" />
          <span className="text-xs font-medium text-sovereign">
            Built in Perth, Western Australia
          </span>
        </div>

        <h1 className="relative text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          AI infrastructure
          <br />
          <span className="text-primary">for Australian research</span>
        </h1>

        <p className="relative mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary sm:text-xl">
          GPU compute, model hosting, and training jobs — built and
          operated in Western Australia. Your data never leaves Australian
          soil. One API, from laptop to cluster.
        </p>

        <div className="relative mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="https://account.yarn.prosodylabs.com.au"
            className="w-full rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
          >
            Get started
          </a>
          <a
            href="https://account.yarn.prosodylabs.com.au/docs"
            className="w-full rounded-xl border border-border bg-background-surface/50 px-8 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-background-hover sm:w-auto"
          >
            View docs
          </a>
        </div>
      </div>

      {/* Typewriter */}
      {passageText && (
        <div className={`absolute inset-x-0 bottom-24 z-10 px-6 transition-opacity duration-1000 ${
          isBow ? "opacity-100" : "opacity-60"
        }`}>
          <div className="mx-auto max-w-2xl">
            <div className="relative h-16 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-background to-transparent" />
              <div className="absolute inset-x-0 bottom-0">
                <p className={`whitespace-pre-line text-center font-mono text-xs leading-relaxed transition-colors duration-1000 md:text-sm ${
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

      {/* Curious? hook */}
      <Link
        href="/gallery"
        className="absolute bottom-8 right-8 z-10 font-mono text-[10px] text-foreground-faint transition-colors hover:text-foreground-muted"
      >
        What is this?
      </Link>
    </section>
  )
}
