import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/components/site/blocks";

export const Route = createFileRoute("/terminos")({
  head: () => ({ meta: seo("Términos de Uso | NATXAJO CORPORATION", "Términos y condiciones de uso del sitio web de NATXAJO CORPORATION.") }),
  component: () => <LegalPage title="Términos de Uso" sections={["Objeto", "Uso del sitio", "Propiedad intelectual", "Limitación de responsabilidad"]} />,
});
