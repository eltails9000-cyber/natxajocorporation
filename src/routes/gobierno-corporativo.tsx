import { createFileRoute } from "@tanstack/react-router";
import { Container, CTASection, PageHero, Reveal, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/gobierno-corporativo")({
  head: () => ({ meta: seo("Gobierno Corporativo | NATXAJO CORPORATION", "Estructura, dirección, control, cumplimiento y ética empresarial de NATXAJO CORPORATION.") }),
  component: Page,
});

const sections = [
  { t: "Estructura corporativa", d: "NATXAJO CORPORATION actúa como matriz que coordina a las empresas especializadas." },
  { t: "Dirección", d: "La dirección corporativa orienta la coordinación entre áreas especializadas y la evaluación de los requerimientos que recibe NATXAJO CORPORATION. Sus criterios de actuación son la viabilidad técnica, el uso responsable de los recursos y la coherencia entre los objetivos del requerimiento y el alcance que pueda acordarse." },
  { t: "Organización", d: "La organización se articula en áreas de tecnología, ingeniería, operaciones y servicios corporativos. Esta estructura permite canalizar consultas según su naturaleza y coordinar disciplinas cuando un requerimiento lo necesita. Las responsabilidades y el alcance de cada intervención deben definirse de manera expresa, sin atribuir competencias ajenas a su ámbito." },
  { t: "Empresas especializadas", d: "Cada empresa opera bajo lineamientos comunes definidos por la corporación." },
  { t: "Gobierno y control", d: "El marco de gobierno se basa en responsabilidades identificables, permisos de acceso acordes con las funciones y trazabilidad de las decisiones. En la plataforma corporativa, los cambios de estado y las actuaciones administrativas se registran para facilitar su revisión. La información interna debe mantenerse separada de la información disponible para usuarios y visitantes." },
  { t: "Gestión de riesgos", d: "La evaluación de un requerimiento debe considerar riesgos técnicos, operativos, de seguridad, de confidencialidad y de ejecución. El enfoque corporativo prioriza identificar restricciones, valorar su impacto y definir medidas proporcionadas antes de asumir compromisos. Los cambios de alcance o las incidencias relevantes requieren revisión y coordinación entre las áreas involucradas." },
  { t: "Cumplimiento", d: "La actuación corporativa debe ajustarse a las obligaciones legales y contractuales aplicables a cada actividad. Esto comprende el tratamiento responsable de datos, el respeto a la propiedad intelectual y el uso autorizado de la información. La presentación institucional de un área no sustituye las autorizaciones o requisitos específicos que puedan exigirse para una intervención concreta." },
  { t: "Ética empresarial", d: "NATXAJO CORPORATION establece como principios de conducta la integridad, el respeto, la confidencialidad y la comunicación veraz. La relación con usuarios, clientes y colaboradores debe evitar conflictos de interés, promesas sin sustento y el uso indebido de información. Las situaciones que puedan comprometer estos principios pueden comunicarse por los canales de contacto corporativos para su evaluación." },
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
              <p className="leading-relaxed text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </Container>
      </section>
      <CTASection />
    </>
  );
}
