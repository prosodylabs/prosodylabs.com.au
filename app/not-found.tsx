import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center pt-14">
      <div className="px-6 text-center">
        <p className="text-6xl font-bold text-foreground-faint">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-foreground-secondary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Back to Prosody Labs
        </Link>
      </div>
    </div>
  )
}
