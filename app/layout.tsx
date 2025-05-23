import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { PageWrapper } from "@/components/page-wrapper" // ✅ new

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Journalyze",
  description: "Record your thoughts and track your mood over time",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto py-6 px-4">
              <PageWrapper>{children}</PageWrapper> {/* ✅ added animation wrapper */}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
