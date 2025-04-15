"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MicIcon, BarChart3Icon, UserIcon } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleHomeClick = () => {
    router.push("/")
  }

  const navItems = [
    {
      name: "Onboarding",
      href: "/onboarding",
      icon: UserIcon,
    },
    {
      name: "Journal",
      href: "/journal",
      icon: MicIcon,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3Icon,
    },
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo clickable */}
        <div
          onClick={handleHomeClick}
          className="mr-4 font-semibold cursor-pointer hover:opacity-80 transition"
        >
          Journalyze
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 items-center">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className="gap-2"
                size="sm"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
