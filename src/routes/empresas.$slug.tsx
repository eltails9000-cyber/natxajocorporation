import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { companies, getCompany, PENDING } from "@/lib/companies";
import { Container, CompanyCard, CTASection, PageHero, Pending, Reveal, SectionHeader, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/empresas/$slug")({
  loader: ({ params }) => {
    const company = getCompany(params.slug);
    if (!company) throw notFound();
    return { slug: company.slug };
  },
  head: ({ loaderData }) => {
    const c = loaderData && getCompany(loaderData.slug);
    return { meta: c ? seo(`${c.name} | NATXAJO CORPORATION`, `${c.name}: ${c.description}`) : [] };
  },
  component: Page,
});

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Reveal className="border bg-card p-8">
      <h3 className="eyebrow text-brand">{title}</h3>
      <ul className="mt-6 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />{i}</li>
        ))}
      </ul>
    </Reveal>
  );
}

function Page() {
  const { slug } = Route.useLoaderData();
  const c = getCompany(slug)!;
  const Icon = c.icon;
  const related = companies.filter((x) => x.pillar === c.pillar && x.slug !== c.slug).slice(0, 3);
  return (
    <>
      <PageHero eyebrow={`${c.pillar} · NATXAJO CORPORATION`} title={c.name} subtitle={c.tagline} crumbs={[{ label: "Empresas", to: "/empresas" }, { label: c.short }]} />
      <section className="py-20 md:py-28">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="hex-clip flex h-20 w-[72px] items-center justify-center bg-primary text-primary-foreground"><Icon className="h-8 w-8" strokeWidth={1.4} /></div>
            <SectionHeader eyebrow="Descripción" title={c.description} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <List title="Áreas de actividad" items={c.areas} />
            <List title="Capacidades" items={c.capabilities} />
            <div className="md:col-span-2"><List title="Soluciones" items={c.solutions} /></div>
          </div>
        </Container>
      </section>
      <section className="border-t bg-muted/40 py-20">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Relación corporativa" title="Parte de NATXAJO CORPORATION" intro={`${c.name} opera como área especializada bajo la estructura corporativa de NATXAJO CORPORATION, compartiendo marca, principios y coordinación con las demás empresas.`} />
          </div>
          <div>
            <SectionHeader eyebrow="Proyectos relacionados" title="Portafolio" />
            <div className="mt-8"><Pending text={PENDING} /></div>
            <Link to="/proyectos" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand">Ver proyectos <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Container>
      </section>
      {related.length > 0 && (
        <section className="py-20">
          <Container>
            <SectionHeader eyebrow="Empresas relacionadas" title="Misma área de operación" />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => <CompanyCard key={r.slug} company={r} index={i} />)}
            </div>
          </Container>
        </section>
      )}
      <CTASection title={`Contactar con ${c.name}`} />
    </>
  );
}
