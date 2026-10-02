import { Container, PageHero } from "./blocks";

export function LegalPage({ title, sections }: { title: string; sections: string[] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} crumbs={[{ label: title }]} />
      <section className="py-20">
        <Container className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s}>
              <h2 className="text-xl font-semibold">{s}</h2>
              <p className="mt-3 font-mono text-sm text-muted-foreground">[Información pendiente de publicación]</p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
