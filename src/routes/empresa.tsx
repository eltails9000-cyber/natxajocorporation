import { createFileRoute } from "@tanstack/react-router";
import { Container, CTASection, PageHero, Reveal, SectionHeader, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/empresa")({
  head: () => ({ meta: seo("Empresa | NATXAJO CORPORATION", "Quiénes somos: la estructura, áreas de actividad y principios corporativos de NATXAJO CORPORATION.") }),
  component: Page,
});

const blocks = [
  { t: "Quiénes somos", d: "NATXAJO CORPORATION es la empresa corporativa principal que coordina y desarrolla diferentes áreas empresariales especializadas." },
  { t: "Nuestra estructura", d: "Una matriz corporativa que integra empresas especializadas bajo una misma marca, dirección y marco de gobierno." },
  { t: "Áreas de actividad", d: "Tecnología, ingeniería, infraestructura, construcción, operaciones, servicios empresariales, activos e inversiones." },
  { t: "Innovación", d: "Incorporación de nuevas tecnologías y métodos de trabajo en cada área especializada." },
  { t: "Tecnología", d: "Software, sistemas, inteligencia artificial, automatización y ciberseguridad como base transversal." },
  { t: "Ingeniería", d: "Diseño, desarrollo técnico, supervisión e infraestructura con enfoque en rigor y calidad." },
  { t: "Operaciones", d: "Logística, transporte, suministro, facilities y servicios industriales coordinados." },
  { t: "Visión de crecimiento", d: "Una arquitectura empresarial escalable, preparada para incorporar nuevas capacidades de forma ordenada." },
];

const principles = ["Integridad", "Rigor técnico", "Responsabilidad", "Innovación", "Coordinación", "Mejora continua"];

function Page() {
  return (
    <>
      <PageHero eyebrow="Empresa" title="Sobre NATXAJO CORPORATION" subtitle="Una corporación multidisciplinaria con una estructura diseñada para coordinar capacidades especializadas." crumbs={[{ label: "Empresa" }]} />
      <section className="py-20 md:py-28">
        <Container className="grid gap-px border bg-border md:grid-cols-2">
          {blocks.map((b, i) => (
            <Reveal key={b.t} className="bg-card p-10">
              <span className="font-mono text-xs text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-4 text-2xl font-semibold">{b.t}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{b.d}</p>
            </Reveal>
          ))}
        </Container>
      </section>
      <section className="blueprint bg-ink py-20 md:py-28">
        <Container>
          <SectionHeader dark eyebrow="Principios corporativos" title="Los principios que orientan a cada empresa." />
          <div className="mt-14 grid grid-cols-2 gap-px bg-ink-line md:grid-cols-3">
            {principles.map((p) => (
              <div key={p} className="bg-ink p-8 text-lg font-medium text-ink-foreground">{p}</div>
            ))}
          </div>
        </Container>
      </section>
      <CTASection />
    </>
  );
}
