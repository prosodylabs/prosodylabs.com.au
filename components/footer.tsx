import Link from "next/link"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Yarn Chat", href: "https://yarn.prosodylabs.com.au" },
      {
        label: "Research Portal",
        href: "https://research.yarn.prosodylabs.com.au",
      },
      {
        label: "Account Portal",
        href: "https://account.yarn.prosodylabs.com.au",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Documentation",
        href: "https://account.yarn.prosodylabs.com.au/docs",
      },
      {
        label: "API reference",
        href: "https://account.yarn.prosodylabs.com.au/docs",
      },
      { label: "GitHub", href: "https://github.com/prosodylabs/yarn" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background-elevated">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-semibold text-foreground">
              Prosody Labs
            </span>
            <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
              Sovereign AI infrastructure for Australian research and
              enterprise. Your data stays in Australia.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-sovereign-muted px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sovereign" />
              <span className="text-xs font-medium text-sovereign">
                AU data residency
              </span>
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border-subtle pt-8">
          <p className="text-xs text-foreground-faint">
            &copy; {new Date().getFullYear()} Prosody Labs Pty Ltd. ABN
            48&nbsp;686&nbsp;529&nbsp;102. Perth, Western Australia.
          </p>
        </div>
      </div>
    </footer>
  )
}
