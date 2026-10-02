import { createFileRoute } from "@tanstack/react-router";
import { Container, CTASection, PageHero, Reveal, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/gobierno-corporativo")({
  head: () => ({ meta: seo("Gobierno Corporativo | NATXAJO CORPORATION", "Estructura, dirección, control, cumplimiento y ética empresarial de NATXAJO CORPORATION.") }),
  component: Page,
});

const PH = "[Información pendiente de publicación]";
const sections = [
  { t: "Estructura corporativa", d: "NATXAJO CORPORATION actúa como matriz que coordina a las empresas especializadas." },
  { t: "Dirección", d: PH },
  { t: "Organización", d: PH },
  { t: "Empresas especializadas", d: "Cada empresa opera bajo lineamientos comunes definidos por la corporación." },
  { t: "Gobierno y control", d: PH },
  { t: "Gestión de riesgos", d: PH },
  { t: "Cumplimiento", d: PH },
  { t: "Ética empresarial", d: PH },
];

function Page() {
  return (
    <>
      <PageHero eyebrow="Gobierno corporativo" title="Gobierno Corporativo" subtitle="Marco de organización, control y conducta de NATXAJO CORPORATION." crumbs={[{ label: "Gobierno Corporativo" }]} />
      <section className="py-20 md:py-28">
        <Container className="divide-y border-y">
          {sections.map((s, i) => (
            <Reveal key={s.t} className="grid gap-4 py-8 md:grid-cols-[80px_1fr_1.4fr]">
              <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="text-xl font-semibold">{s.t}</h2>
              <p className={s.d === PH ? "font-mono text-sm text-muted-foreground" : "text-muted-foreground"}>{s.d}</p>
            </Reveal>
          ))}
        </Container>
      </section>
      <CTASection />
    </>
  );
}
