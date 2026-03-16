"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"

const KairosLab = dynamic(() => import("@/components/kairos-lab"), {
  ssr: false,
})

export default function LabPage() {
  const [passageText, setPassageText] = useState("")
  const [displayedChars, setDisplayedChars] = useState(0)
  const [passageName, setPassageName] = useState("")
  const startTimeRef = useRef<number>(0)
  const tpsRef = useRef(10)
  const timestepsRef = useRef(256)

  const handleSampleLoaded = useCallback(
    (name: string, text: string, timesteps: number, tps: number) => {
      setPassageName(name.replace(/_/g, " "))
      setPassageText(text)
      tpsRef.current = tps
      timestepsRef.current = timesteps
      startTimeRef.current = performance.now()
    },
    []
  )

  // Typewriter synced to animation timing
  useEffect(() => {
    if (!passageText) return

    let raf: number
    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const currentTimestep =
        (elapsed * tpsRef.current) % timestepsRef.current
      // Map timestep progress to text position
      const progress = currentTimestep / timestepsRef.current
      const chars = Math.floor(progress * passageText.length)
      setDisplayedChars(chars)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [passageText])

  return (
    <div className="pt-14">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background">
          <KairosLab onSampleLoaded={handleSampleLoaded} />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(120_4%_7%/0.3)_0%,transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 font-mono text-xs text-foreground-muted">
            /lab — experimental visualization
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            AI infrastructure
            <br />
            <span className="text-primary">for Australian research</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary">
            Kairos visualization lab. Compare with{" "}
            <a href="/" className="text-primary underline">
              the original
            </a>
            .
          </p>
        </div>

        {/* Typewriter passage — bottom of hero */}
        {passageText && (
          <div className="absolute inset-x-0 bottom-36 z-10 px-6">
            <div className="mx-auto max-w-2xl">
              {passageName && (
                <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-widest text-foreground-faint">
                  {passageName}
                </p>
              )}
              <p className="whitespace-pre-line text-center font-mono text-xs leading-relaxed text-foreground-muted/70">
                {passageText.slice(0, displayedChars)}
                <span className="animate-pulse text-foreground-muted">
                  |
                </span>
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
