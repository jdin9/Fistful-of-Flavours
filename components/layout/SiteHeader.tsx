"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book" }
];

export const SiteHeader = () => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const menuId = React.useId();

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background backdrop-blur">
      <Container className="flex items-center justify-between py-5">
        <Link href="/" className="flex items-center gap-2" aria-label="Fistful of Flavours home">
          <span className="text-h3 text-text">Fistful of Flavours</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-text/80 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-text",
                pathname === item.href ? "text-text" : undefined
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex">
          <Link href="/book" aria-label="Book your food crawl">
            <Button>Book now</Button>
          </Link>
        </div>
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((prev) => !prev)}
            className="h-10 w-10 rounded-full p-0"
          >
            <Icon name={open ? "X" : "Menu"} className="h-5 w-5" aria-hidden />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </div>
      </Container>
      <div
        id={menuId}
        className={cn(
          "md:hidden",
          open ? "block border-t border-white/10 bg-background" : "hidden"
        )}
      >
        <Container className="flex flex-col gap-4 py-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-base font-medium text-text">
              {item.label}
            </Link>
          ))}
          <Link href="/book">
            <Button fullWidth>Book now</Button>
          </Link>
        </Container>
      </div>
    </header>
  );
};
