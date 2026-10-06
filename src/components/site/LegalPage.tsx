import { Container, PageHero } from "./blocks";

export type LegalSection = { title: string; paragraphs: string[] };

export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={title} crumbs={[{ label: title }]} />
      <section className="py-20">
        <Container className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-semibold">{s.title}</h2>
              {s.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 leading-relaxed text-muted-foreground">{paragraph}</p>)}
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
