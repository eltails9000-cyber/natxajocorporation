import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/components/site/blocks";

export const Route = createFileRoute("/privacidad")({
  head: () => ({ meta: seo("Política de Privacidad | NATXAJO CORPORATION", "Política de privacidad y tratamiento de datos de NATXAJO CORPORATION.") }),
  component: () => <LegalPage title="Política de Privacidad" sections={["Responsable del tratamiento", "Datos recopilados", "Finalidad", "Derechos del usuario"]} />,
});
