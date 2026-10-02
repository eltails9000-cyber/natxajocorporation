import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, Compass, Truck } from "lucide-react";
import { companies } from "@/lib/companies";
import { Container, CTASection, CompanyGrid, GeoLines, Reveal, SectionHeader, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seo(
      "NATXAJO CORPORATION | Technology, Engineering & Infrastructure",
      "NATXAJO CORPORATION integra capacidades de tecnología, ingeniería, infraestructura, operaciones y servicios bajo una estructura corporativa común.",
    ),
  }),
  component: Index,
});

const pillars = [
  { icon: Cpu, title: "Technology", text: "Tecnología, software, IA y automatización." },
  { icon: Compass, title: "Engineering", text: "Ingeniería, infraestructura y desarrollo técnico." },
  { icon: Truck, title: "Operations", text: "Logística, servicios, construcción, suministro y operaciones." },
];

function Index() {
  return (
    <>
      <section className="blueprint relative overflow-hidden bg-ink">
        <GeoLines className="pointer-events-none absolute -right-32 top-1/2 h-[720px] w-[720px] -translate-y-1/2 animate-drift opacity-90 max-lg:opacity-30" />
        <Container className="relative flex min-h-[calc(100vh-5rem)] flex-col justify-center py-24">
          <div className="flex animate-rise items-center gap-3">
            <span className="h-px w-10 bg-brand-bright" />
            <p className="eyebrow text-brand-bright">NATXAJO CORPORATION</p>
          </div>
          <h1 className="mt-7 max-w-4xl animate-rise text-5xl font-semibold leading-[1.02] text-ink-foreground md:text-7xl" style={{ animationDelay: ".1s" }}>
            Engineering the infrastructure of tomorrow.
          </h1>
          <p className="mt-8 max-w-2xl animate-rise text-lg leading-relaxed text-ink-muted" style={{ animationDelay: ".2s" }}>
            Una corporación multidisciplinaria orientada al desarrollo tecnológico, ingeniería, infraestructura, operaciones y servicios empresariales.
          </p>
          <div className="mt-11 flex animate-rise flex-wrap gap-4" style={{ animationDelay: ".3s" }}>
            <Link to="/empresa" className="group inline-flex items-center gap-3 rounded-sm bg-brand px-6 py-3.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-brand-bright">
              Conocer NATXAJO CORPORATION <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/empresas" className="inline-flex items-center rounded-sm border border-ink-line px-6 py-3.5 text-sm font-medium text-ink-foreground transition-colors hover:border-ink-foreground/50">
              Explorar nuestras empresas
            </Link>
          </div>
          <div className="mt-20 grid max-w-3xl grid-cols-3 border-t border-ink-line pt-6">
            {["Technology", "Engineering", "Operations"].map((t, i) => (
              <div key={t} className="font-mono text-xs uppercase tracking-widest text-ink-muted">
                <span className="text-brand-bright">0{i + 1}</span> / {t}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <SectionHeader eyebrow="Estructura corporativa" title="Una estructura diseñada para operar a través de múltiples industrias." />
            <Reveal>
              <p className="text-lg leading-relaxed text-muted-foreground">
                NATXAJO CORPORATION integra diferentes áreas especializadas bajo una estructura corporativa común, coordinando capacidades técnicas, operativas y de gestión con una visión unificada.
              </p>
            </Reveal>
          </div>
          <div className="mt-16 grid border-l border-t md:grid-cols-3">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 100} className="border-b border-r p-10">
                <p.icon className="h-8 w-8 text-brand" strokeWidth={1.4} />
                <h3 className="mt-8 font-mono text-sm tracking-[0.2em]">{p.title.toUpperCase()}</h3>
                <p className="mt-3 text-muted-foreground">{p.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t bg-muted/40 py-24 md:py-32">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader eyebrow="Empresas especializadas" title="Nuestras empresas" intro="Áreas especializadas que operan bajo la marca y la estructura de NATXAJO CORPORATION." />
            <Link to="/empresas" className="inline-flex items-center gap-2 text-sm font-medium text-brand">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-14"><CompanyGrid items={companies.slice(0, 9)} /></div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
