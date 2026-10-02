import { createFileRoute } from "@tanstack/react-router";
import { companies, type Pillar } from "@/lib/companies";
import { Container, CTASection, CompanyGrid, PageHero, SectionHeader, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/empresas/")({
  head: () => ({ meta: seo("Empresas | NATXAJO CORPORATION", "Empresas especializadas de NATXAJO CORPORATION en tecnología, ingeniería, operaciones y servicios corporativos.") }),
  component: Page,
});

const groups: { pillar: Pillar; title: string }[] = [
  { pillar: "Technology", title: "Tecnología" },
  { pillar: "Engineering", title: "Ingeniería e infraestructura" },
  { pillar: "Operations", title: "Operaciones" },
  { pillar: "Corporate", title: "Gestión y servicios corporativos" },
];

function Page() {
  return (
    <>
      <PageHero eyebrow="Empresas" title="Nuestras empresas" subtitle="Áreas empresariales especializadas coordinadas por NATXAJO CORPORATION." crumbs={[{ label: "Empresas" }]} />
      {groups.map((g, i) => (
        <section key={g.pillar} className={`py-20 ${i % 2 ? "bg-muted/40" : ""}`}>
          <Container>
            <SectionHeader eyebrow={g.pillar} title={g.title} />
            <div className="mt-12"><CompanyGrid items={companies.filter((c) => c.pillar === g.pillar)} /></div>
          </Container>
        </section>
      ))}
      <CTASection />
    </>
  );
}
