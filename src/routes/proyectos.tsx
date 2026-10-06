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

function Page() {
  return (
    <>
      <PageHero eyebrow="Proyectos" title="Proyectos" subtitle="Información pública sobre proyectos y ámbitos de intervención de NATXAJO CORPORATION." crumbs={[{ label: "Proyectos" }]} />
      <section className="py-20 md:py-28">
        <Container>
          {projects.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.map((p) => <ProjectCard key={p.name} p={p} />)}</div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <SectionHeader eyebrow="Portafolio" title="Información de proyectos" intro="Actualmente no hay fichas públicas de proyectos. La ausencia de publicaciones no constituye una referencia sobre intervenciones, clientes o resultados." />
              <div className="space-y-5 leading-relaxed text-muted-foreground">
                <p>La publicación de información de proyectos requiere verificar su alcance y respetar los compromisos de confidencialidad. Solo se incluyen referencias que puedan comunicarse públicamente.</p>
                <p>Para plantear un requerimiento o solicitar información sobre un área de actividad, utilice los canales de contacto de NATXAJO CORPORATION.</p>
              </div>
            </div>
          )}
        </Container>
      </section>
      <CTASection />
    </>
  );
}
