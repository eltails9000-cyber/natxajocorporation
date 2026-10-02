import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Compass, HardHat, Truck, Briefcase } from "lucide-react";
import { CapabilityCard, Container, CTASection, PageHero, Reveal, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/capacidades")({
  head: () => ({ meta: seo("Capacidades corporativas | NATXAJO CORPORATION", "Capacidades de NATXAJO CORPORATION en tecnología, ingeniería, construcción, operaciones y gestión empresarial.") }),
  component: Page,
});

const cats = [
  { title: "Tecnología", icon: Cpu, items: ["Software", "Sistemas", "IA", "Automatización", "Infraestructura tecnológica"] },
  { title: "Ingeniería", icon: Compass, items: ["Diseño", "Ingeniería", "Supervisión", "Planificación", "Desarrollo técnico"] },
  { title: "Construcción e infraestructura", icon: HardHat, items: ["Construcción", "Infraestructura", "Gestión de obras", "Mantenimiento"] },
  { title: "Operaciones", icon: Truck, items: ["Logística", "Transporte", "Supply Chain", "Facilities"] },
  { title: "Gestión empresarial", icon: Briefcase, items: ["Project Management", "Servicios corporativos", "Comercialización", "Gestión de activos"] },
];

function Page() {
  return (
    <>
      <PageHero eyebrow="Capacidades" title="Capacidades corporativas" subtitle="Competencias técnicas y de gestión distribuidas entre las empresas especializadas." crumbs={[{ label: "Capacidades" }]} />
      <section className="py-20 md:py-28">
        <Container className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cats.map((c, i) => <Reveal key={c.title} delay={(i % 3) * 80}><CapabilityCard {...c} /></Reveal>)}
        </Container>
      </section>
      <CTASection />
    </>
  );
}
