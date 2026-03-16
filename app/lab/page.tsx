import dynamic from "next/dynamic"

const KairosLab = dynamic(() => import("@/components/kairos-lab"), {
  ssr: false,
})

export default function LabPage() {
  return (
    <div className="pt-14">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-background">
          <KairosLab />
        </div>

        {/* Lighter overlay so we can see the viz clearly */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(120_4%_7%/0.3)_0%,transparent_60%)]" />

        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="mb-4 text-xs font-mono text-foreground-muted">
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
      </section>
    </div>
  )
}
