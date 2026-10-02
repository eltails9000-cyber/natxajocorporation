import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { projects, type Project } from "@/lib/companies";
import { Container, CTASection, PageHero, SectionHeader, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/proyectos")({
  head: () => ({ meta: seo("Proyectos | NATXAJO CORPORATION", "Portafolio corporativo de proyectos de NATXAJO CORPORATION.") }),
  component: Page,
});

function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="border bg-card">
      {p.image && <img src={p.image} alt={p.name} className="aspect-video w-full object-cover" />}
      <div className="p-7">
        <p className="eyebrow text-brand">{p.company} · {p.sector}</p>
        <h3 className="mt-3 text-xl font-semibold">{p.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{p.location} · {p.date} · {p.status}</p>
        <p className="mt-4 text-sm text-muted-foreground">{p.description}</p>
      </div>
    </article>
  );
}

const fields = ["Nombre", "Empresa responsable", "Sector", "Ubicación", "Estado", "Fecha", "Descripción", "Capacidades"];

function Page() {
  return (
    <>
      <PageHero eyebrow="Proyectos" title="Proyectos" subtitle="Sistema de portafolio preparado para publicar proyectos de las empresas de NATXAJO CORPORATION." crumbs={[{ label: "Proyectos" }]} />
      <section className="py-20 md:py-28">
        <Container>
          {projects.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard key={p.name} p={p} />)}</div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <SectionHeader eyebrow="Estado" title="Portafolio corporativo en desarrollo." intro="Los proyectos se publicarán una vez que la información sea oficial y verificada." />
              <div className="grid grid-cols-2 border-l border-t border-dashed">
                {fields.map((f) => (
                  <div key={f} className="border-b border-r border-dashed p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground">{f}</div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
      <CTASection />
    </>
  );
}
