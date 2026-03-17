"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"

const KairosLab = dynamic(() => import("@/components/kairos-lab"), {
  ssr: false,
})

export default function LabPage() {
  const [network, setNetwork] = useState<"spiking" | "transformer">("spiking")
  const [passageText, setPassageText] = useState("")
  const [displayedChars, setDisplayedChars] = useState(0)
  const [passageName, setPassageName] = useState("")
  const [isBow, setIsBow] = useState(false)
  const startTimeRef = useRef<number>(0)
  const tpsRef = useRef(10)
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

  // Typewriter synced to animation loop including curtain call
  useEffect(() => {
    if (!passageText) return

    let raf: number
    function tick() {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const loopPos = (elapsed * tpsRef.current) % totalDurationRef.current
      // Typing happens over timesteps; holds during curtain call
      const typingProgress = Math.min(loopPos / timestepsRef.current, 1.0)
      const chars = Math.floor(typingProgress * passageText.length)
      setDisplayedChars(chars)
      setIsBow(loopPos > timestepsRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [passageText])

  return (
    <div className="pt-14">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background">
          <KairosLab network={network} onSampleLoaded={handleSampleLoaded} />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(120_4%_7%/0.3)_0%,transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Network toggle */}
          <div className="mb-6 inline-flex items-center rounded-full border border-border-subtle bg-background/60 p-1 backdrop-blur-sm">
            <button
              onClick={() => setNetwork("spiking")}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all ${
                network === "spiking"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Kairos Network
            </button>
            <button
              onClick={() => setNetwork("transformer")}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition-all ${
                network === "transformer"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              Kairos Transformer
            </button>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            AI infrastructure
            <br />
            <span className="text-primary">for Australian research</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground-secondary">
            Same text, different architecture. Watch how each network processes Shakespeare.
          </p>
        </div>

        {/* Typewriter passage — windowed at bottom of hero */}
        {passageText && (
          <div className={`absolute inset-x-0 bottom-24 z-10 px-6 transition-opacity duration-1000 ${
            isBow ? "opacity-100" : "opacity-70"
          }`}>
            <div className="mx-auto max-w-2xl">
              {passageName && (
                <p className={`mb-2 text-center font-mono text-[10px] uppercase tracking-widest transition-colors duration-1000 ${
                  isBow ? "text-foreground-secondary" : "text-foreground-faint"
                }`}>
                  {passageName}
                </p>
              )}
              {/* Fixed-height window — text anchored to bottom, top fades out */}
              <div className="relative h-20 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background to-transparent" />
                <div className="absolute inset-x-0 bottom-0">
                  <p className={`whitespace-pre-line text-center font-mono text-xs leading-relaxed transition-colors duration-1000 ${
                    isBow ? "text-foreground-secondary" : "text-foreground-muted/70"
                  }`}>
                    {passageText.slice(0, displayedChars)}
                    <span className={`transition-opacity duration-500 ${
                      isBow ? "opacity-0" : "animate-pulse text-foreground-muted"
                    }`}>
                      |
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
