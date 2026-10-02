import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { contactInfo } from "@/lib/companies";
import { Container, PageHero, seo } from "@/components/site/blocks";

export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: seo("Contacto | NATXAJO CORPORATION", "Envíe su consulta a NATXAJO CORPORATION y la canalizaremos al área especializada correspondiente.") }),
  component: Page,
});

const areas = ["Technology", "Cybersecurity", "Engineering", "Infrastructure", "Construction", "Logistics", "Commercial", "Business Services", "Other"];

const schema = z.object({
  nombre: z.string().trim().min(2, "Ingrese su nombre").max(100),
  empresa: z.string().trim().max(120).optional(),
  email: z.string().trim().email("Correo inválido").max(255),
  telefono: z.string().trim().max(30).regex(/^[\d\s+()-]*$/, "Teléfono inválido").optional(),
  pais: z.string().trim().max(60).optional(),
  area: z.string().min(1, "Seleccione un área"),
  mensaje: z.string().trim().min(10, "El mensaje es muy corto").max(2000),
});

const input = "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/20";

function Page() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (fd.get("website") || Date.now() - startedAt < 2500) return; // anti-spam
    const res = schema.safeParse(Object.fromEntries(fd));
    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((i) => (errs[String(i.path[0])] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    e.currentTarget.reset();
    toast.success("Consulta registrada. Gracias por contactar a NATXAJO CORPORATION.");
  };

  const F = ({ name, label, children }: { name: string; label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="eyebrow mb-2 block text-muted-foreground">{label}</span>
      {children}
      {errors[name] && <span className="mt-1.5 block text-xs text-destructive">{errors[name]}</span>}
    </label>
  );

  const info = [
    { icon: Mail, label: "Correo", value: contactInfo.email },
    { icon: Phone, label: "Teléfono", value: contactInfo.phone },
    { icon: MapPin, label: "Dirección", value: contactInfo.address },
  ];

  return (
    <>
      <PageHero eyebrow="Contacto" title="Contacto" subtitle="Envíenos su consulta y será canalizada al área especializada correspondiente." crumbs={[{ label: "Contacto" }]} />
      <section className="py-20 md:py-28">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.6fr]">
          <div className="space-y-px border bg-border">
            {info.map((i) => (
              <div key={i.label} className="flex gap-4 bg-card p-6">
                <i.icon className="h-5 w-5 text-brand" strokeWidth={1.5} />
                <div>
                  <p className="eyebrow text-muted-foreground">{i.label}</p>
                  <p className="mt-1 text-sm">{i.value ?? <span className="font-mono text-muted-foreground">[Pendiente de definir]</span>}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={onSubmit} noValidate className="grid gap-5 border bg-card p-8 md:grid-cols-2">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            <F name="nombre" label="Nombre *"><input name="nombre" className={input} /></F>
            <F name="empresa" label="Empresa"><input name="empresa" className={input} /></F>
            <F name="email" label="Correo electrónico *"><input name="email" type="email" className={input} /></F>
            <F name="telefono" label="Teléfono"><input name="telefono" type="tel" className={input} /></F>
            <F name="pais" label="País"><input name="pais" className={input} /></F>
            <F name="area" label="Área de interés *">
              <select name="area" defaultValue="" className={input}>
                <option value="" disabled>Seleccione…</option>
                {areas.map((a) => <option key={a}>{a}</option>)}
              </select>
            </F>
            <div className="md:col-span-2">
              <F name="mensaje" label="Mensaje *"><textarea name="mensaje" rows={6} className={input} /></F>
            </div>
            <button type="submit" className="rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand md:col-span-2 md:justify-self-start">
              Enviar consulta
            </button>
          </form>
        </Container>
      </section>
    </>
  );
}
