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
  {
    name: "Рекоммендации",
    href: "/recommendations",
    icon: TrendingUp,
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
    <header className="top-0 z-50 flex flex-col gap-2 pb-4 pt-2 md:pb-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-12 bg-gradient-to-b from-background/70 via-background/50 to-transparent blur-3xl md:block"
      />
      <nav className="relative mx-auto flex w-screen items-center justify-between rounded-3xl border border-border/50 bg-background/80 px-4 py-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-md transition-colors sm:px-6">
        <div className="flex gap-3 justify-end">
          <Link href="/ru" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 text-primary-foreground shadow-lg shadow-primary/35 transition-transform duration-300 group-hover:scale-105">
              <Activity className="h-5 w-5" />
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-lg font-semibold text-foreground">
                MedMonitor
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
                Мониторинг госпитализаций и коечной мощности
              </span>
            </div>
            <span className="text-base font-semibold text-foreground sm:hidden">
              Almaty Roads
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
                      ? "bg-primary text-primary-foreground shadow-[0_12px_35px_-20px_rgba(59,130,246,0.75)]"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-transparent shadow-inner shadow-primary/30"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 shrink-0 rounded-full border border-border/70 bg-background/70 shadow-sm backdrop-blur md:hidden"
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
        <div className="mx-4 mt-2 rounded-3xl border border-border/60 bg-background/95 p-4 shadow-[0_25px_45px_-20px_rgba(15,23,42,0.45)] backdrop-blur md:hidden">
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
                      ? "bg-primary/90 text-primary-foreground shadow-inner shadow-primary/30"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-foreground/80">
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
