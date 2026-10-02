import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { Company } from "@/lib/companies";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-5 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionHeader({ eyebrow, title, intro, dark = false }: { eyebrow: string; title: string; intro?: string; dark?: boolean }) {
  return (
    <Reveal className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-brand-bright" />
        <p className={`eyebrow ${dark ? "text-brand-bright" : "text-brand"}`}>{eyebrow}</p>
      </div>
      <h2 className={`mt-5 text-3xl font-semibold leading-tight md:text-4xl ${dark ? "text-ink-foreground" : "text-foreground"}`}>{title}</h2>
      {intro && <p className={`mt-5 text-lg leading-relaxed ${dark ? "text-ink-muted" : "text-muted-foreground"}`}>{intro}</p>}
    </Reveal>
  );
}

/** Geometric linework inspired by the hexagonal isotype. */
export function GeoLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" fill="none" className={className} aria-hidden>
      <g strokeWidth="1">
        <polygon points="300,40 525,170 525,430 300,560 75,430 75,170" className="animate-draw stroke-ink-foreground/25" />
        <polygon points="300,110 465,205 465,395 300,490 135,395 135,205" className="animate-draw stroke-ink-foreground/10" style={{ animationDelay: ".4s" }} />
        <path d="M160 250 L300 165 L380 215 M300 165 L300 300 L440 390 M220 340 L330 410" className="animate-draw stroke-ink-foreground/30" style={{ animationDelay: ".8s" }} />
        <path d="M360 400 L465 335 L465 395 L400 435 Z" className="animate-draw stroke-brand-bright fill-brand/40" style={{ animationDelay: "1.2s" }} />
      </g>
      {[[300,40],[525,170],[525,430],[300,560],[75,430],[75,170]].map(([x,y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3" className="fill-brand-bright" />
      ))}
    </svg>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
      <Link to="/" className="hover:text-ink-foreground">Inicio</Link>
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {i.to ? <Link to={i.to} className="hover:text-ink-foreground">{i.label}</Link> : <span className="text-ink-foreground">{i.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({ eyebrow, title, subtitle, crumbs }: { eyebrow: string; title: string; subtitle?: string; crumbs: { label: string; to?: string }[] }) {
  return (
    <section className="blueprint relative overflow-hidden bg-ink">
      <GeoLines className="pointer-events-none absolute -right-24 -top-10 h-[460px] w-[460px] opacity-60" />
      <Container className="relative py-20 md:py-28">
        <Breadcrumbs items={crumbs} />
        <p className="eyebrow mt-10 animate-rise text-brand-bright">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl animate-rise text-4xl font-semibold leading-[1.08] text-ink-foreground md:text-6xl">{title}</h1>
        {subtitle && <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-ink-muted" style={{ animationDelay: ".15s" }}>{subtitle}</p>}
      </Container>
    </section>
  );
}

export function CompanyCard({ company, index }: { company: Company; index: number }) {
  const Icon = company.icon;
  return (
    <Link
      to="/empresas/$slug"
      params={{ slug: company.slug }}
      className="group relative flex h-full flex-col border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_40px_-24px_oklch(0.2_0_0/0.35)]"
    >
      <span className="absolute left-0 top-0 h-0.5 w-0 bg-brand transition-all duration-500 group-hover:w-full" />
      <div className="flex items-start justify-between">
        <div className="hex-clip flex h-12 w-11 items-center justify-center bg-primary text-primary-foreground transition-colors group-hover:bg-brand">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-6 text-base font-semibold tracking-wide">{company.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{company.description}</p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">
        Ver empresa <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function CompanyGrid({ items }: { items: Company[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c, i) => (
        <Reveal key={c.slug} delay={(i % 3) * 80}><CompanyCard company={c} index={i} /></Reveal>
      ))}
    </div>
  );
}

export function CTASection({ title = "Hablemos de su próximo requerimiento.", text = "Contacte a NATXAJO CORPORATION para canalizar su consulta hacia el área especializada correspondiente." }: { title?: string; text?: string }) {
  return (
    <section className="blueprint relative overflow-hidden bg-ink">
      <Container className="relative flex flex-col items-start justify-between gap-8 py-20 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold text-ink-foreground md:text-4xl">{title}</h2>
          <p className="mt-4 text-ink-muted">{text}</p>
        </div>
        <Link to="/contacto" className="group inline-flex items-center gap-3 rounded-sm bg-brand px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-bright">
          Contactar <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Container>
    </section>
  );
}

export function Pending({ text = "Información corporativa en desarrollo." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 border border-dashed bg-muted/50 px-5 py-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
      <span className="h-2 w-2 bg-brand" /> {text}
    </div>
  );
}

export function CapabilityCard({ title, items, icon: Icon }: { title: string; items: string[]; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }) {
  return (
    <div className="h-full border bg-card p-8">
      <Icon className="h-7 w-7 text-brand" strokeWidth={1.4} />
      <h3 className="mt-6 text-xl font-semibold">{title}</h3>
      <ul className="mt-5 space-y-2.5">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-3 border-t pt-2.5 text-sm text-muted-foreground">
            <span className="h-1 w-1 bg-brand" />{i}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function seo(title: string, description: string) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}
