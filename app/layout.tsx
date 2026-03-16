import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Prosody Labs — Sovereign AI Infrastructure",
    template: "%s | Prosody Labs",
  },
  description:
    "Australian AI infrastructure for research and enterprise. GPU compute, model hosting, and training — with data that stays in Australia.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Prosody Labs",
    title: "Prosody Labs — Sovereign AI Infrastructure",
    description:
      "Australian AI infrastructure for research and enterprise. GPU compute, model hosting, and training — with data that stays in Australia.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
