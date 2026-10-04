import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { contactInfo } from "@/lib/companies";
import { Container, PageHero, seo } from "@/components/site/blocks";
import { CONSULTATION_AREAS } from "@/lib/areas";
import { consultationSchema, submitConsultation } from "@/lib/consultations.functions";

export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: seo("Contacto | NATXAJO CORPORATION", "Envíe su consulta a NATXAJO CORPORATION y la canalizaremos al área especializada correspondiente.") }),
  component: Page,
});

const input = "w-full rounded-sm border border-input bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-ring/20";

function F({ name, label, errors, children }: { name: string; label: string; errors: Record<string, string>; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-2 block text-muted-foreground">{label}</span>
      {children}
      {errors[name] && <span className="mt-1.5 block text-xs text-destructive">{errors[name]}</span>}
    </label>
  );
}

function Page() {
  const submit = useServerFn(submitConsultation);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null | undefined>(undefined);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = { ...Object.fromEntries(fd), consentimiento: fd.get("consentimiento") === "on" };
    const res = consultationSchema.safeParse(raw);
    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((i) => (errs[String(i.path[0])] ??= i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const r = await submit({ data: { ...res.data, website: String(fd.get("website") ?? ""), elapsedMs: Date.now() - startedAt } });
      if (!r.ok) return void toast.error(r.error);
      form.reset();
      setDone(r.publicId);
    } catch {
      toast.error("No se pudo enviar la consulta. Revise los datos e inténtelo nuevamente.");
    } finally {
      setSending(false);
    }
  };

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
          <div className="space-y-px self-start border bg-border">
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
          {done !== undefined ? (
            <div className="border bg-card p-10">
              <CheckCircle2 className="h-10 w-10 text-brand" strokeWidth={1.5} />
              <h2 className="mt-5 text-2xl font-semibold">Consulta registrada</h2>
              {done && <p className="mt-3 text-sm">Número de seguimiento: <span className="font-mono font-semibold">{done}</span></p>}
              <p className="mt-3 text-sm text-muted-foreground">Gracias por contactar a NATXAJO CORPORATION. El área correspondiente revisará su solicitud.</p>
              <p className="mt-3 text-sm text-muted-foreground">Si crea una cuenta con el mismo correo podrá hacer seguimiento desde el <Link to="/portal" className="text-brand underline">portal</Link>.</p>
              <button onClick={() => setDone(undefined)} className="mt-6 rounded-sm border px-5 py-2.5 text-sm hover:bg-muted">Enviar otra consulta</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-5 border bg-card p-8 md:grid-cols-2">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <F errors={errors} name="nombre" label="Nombre *"><input name="nombre" autoComplete="given-name" className={input} /></F>
              <F errors={errors} name="apellido" label="Apellido *"><input name="apellido" autoComplete="family-name" className={input} /></F>
              <F errors={errors} name="email" label="Correo electrónico *"><input name="email" type="email" autoComplete="email" className={input} /></F>
              <F errors={errors} name="telefono" label="Teléfono"><input name="telefono" type="tel" className={input} /></F>
              <F errors={errors} name="empresa" label="Empresa"><input name="empresa" className={input} /></F>
              <F errors={errors} name="pais" label="País"><input name="pais" className={input} /></F>
              <div className="md:col-span-2">
                <F errors={errors} name="area" label="Área de interés *">
                  <select name="area" defaultValue="" className={input}>
                    <option value="" disabled>Seleccione…</option>
                    {CONSULTATION_AREAS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </F>
              </div>
              <div className="md:col-span-2"><F errors={errors} name="asunto" label="Asunto *"><input name="asunto" maxLength={150} className={input} /></F></div>
              <div className="md:col-span-2"><F errors={errors} name="mensaje" label="Mensaje *"><textarea name="mensaje" rows={6} maxLength={3000} className={input} /></F></div>
              <div className="md:col-span-2">
                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" name="consentimiento" className="mt-1" />
                  <span>Acepto el tratamiento de mis datos conforme a la <Link to="/privacidad" className="text-brand underline">política de privacidad</Link>. *</span>
                </label>
                {errors.consentimiento && <span className="mt-1.5 block text-xs text-destructive">{errors.consentimiento}</span>}
              </div>
              <button type="submit" disabled={sending} className="rounded-sm bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-brand disabled:opacity-60 md:col-span-2 md:justify-self-start">
                {sending ? "Enviando…" : "Enviar consulta"}
              </button>
            </form>
          )}
        </Container>
      </section>
    </>
  );
}
