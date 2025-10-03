"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Activity, TrendingUp, Menu, X, BarChart3 } from "lucide-react";

const navigation = [
  {
    name: "Карта стационаров",
    href: "/",
    icon: Activity,
  },
  {
    name: "Аналитика",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="top-0 z-50 flex flex-col gap-2">
      <nav className="relative mx-auto flex w-screen items-center justify-between bg-white px-4 py-3 shadow-lg sm:px-6">
        <div className="flex gap-3 justify-end">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4169E1] text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#5B7FED]">
              <Activity className="h-5 w-5" />
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-lg font-semibold text-[#4169E1]">
                MedMonitor
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.35em] text-gray-600">
                Мониторинг госпитализаций и коечной мощности
              </span>
            </div>
            <span className="text-base font-semibold text-[#4169E1] sm:hidden">
              MedMonitor
            </span>
          </Link>
        </div>
        <div className="flex justify-between px-3">
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-[#4169E1] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon
                    className={cn(
                      "relative z-10 h-4 w-4 transition-transform duration-300",
                      active ? "scale-105" : "group-hover:scale-110"
                    )}
                  />
                  <span className="relative z-10 whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 shrink-0 rounded-full bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Открыть меню навигации"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mx-4 mt-2 rounded-3xl border border-gray-200 bg-white p-4 shadow-lg md:hidden">
          <div className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-base font-medium transition-all duration-200",
                    active
                      ? "bg-[#4169E1] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      active ? "bg-white/20" : "bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
