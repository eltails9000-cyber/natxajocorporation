import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/components/site/blocks";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: seo("Política de Cookies | NATXAJO CORPORATION", "Información sobre el uso de cookies en el sitio de NATXAJO CORPORATION.") }),
  component: () => <LegalPage title="Política de Cookies" sections={["Qué son las cookies", "Cookies utilizadas", "Gestión de cookies"]} />,
});
