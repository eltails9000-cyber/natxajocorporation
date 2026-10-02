import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/empresa", label: "Empresa" },
  { to: "/empresas", label: "Empresas" },
  { to: "/capacidades", label: "Capacidades" },
  { to: "/proyectos", label: "Proyectos" },
  { to: "/gobierno-corporativo", label: "Gobierno Corporativo" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-card transition-all duration-300 ${
        scrolled ? "border-border shadow-[0_6px_24px_-12px_oklch(0.2_0_0/0.25)]" : "border-transparent"
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-300 lg:px-8 ${scrolled ? "h-16" : "h-20"}`}>
        <Logo className={scrolled ? "h-8" : "h-10"} />
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Principal">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:-bottom-2 data-[status=active]:after:left-0 data-[status=active]:after:h-0.5 data-[status=active]:after:w-full data-[status=active]:after:bg-brand"
            >
              {n.label}
            </Link>
          ))}
          <Link to="/contacto" className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand">
            Contactar
          </Link>
        </nav>
        <button className="p-2 xl:hidden" aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && <MobileMenu onNavigate={() => setOpen(false)} />}
    </header>
  );
}

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <nav className="animate-rise border-t bg-card px-5 pb-6 xl:hidden" aria-label="Móvil">
      {navItems.map((n) => (
        <Link key={n.to} to={n.to} onClick={onNavigate} activeOptions={{ exact: n.to === "/" }}
          className="block border-b py-3.5 text-base text-foreground data-[status=active]:text-brand">
          {n.label}
        </Link>
      ))}
      <Link to="/contacto" onClick={onNavigate} className="mt-5 block rounded-sm bg-primary py-3 text-center text-sm font-medium text-primary-foreground">
        Contactar
      </Link>
    </nav>
  );
}
