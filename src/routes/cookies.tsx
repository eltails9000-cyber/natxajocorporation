import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { seo } from "@/components/site/blocks";

export const Route = createFileRoute("/cookies")({
  head: () => ({ meta: seo("Política de Cookies | NATXAJO CORPORATION", "Información sobre el uso de cookies en el sitio de NATXAJO CORPORATION.") }),
  component: () => <LegalPage title="Política de Cookies" sections={[
    { title: "Qué son las cookies", paragraphs: ["Las cookies son pequeños archivos que un sitio puede almacenar en el navegador para conservar información entre visitas. El almacenamiento local del navegador es una tecnología distinta que permite mantener determinados datos en el dispositivo. Ambos mecanismos pueden utilizarse para funciones técnicas, como reconocer una sesión de acceso."] },
    { title: "Cookies utilizadas", paragraphs: ["La plataforma utiliza mecanismos de almacenamiento de sesión para mantener el acceso a las cuentas y permitir el uso del portal corporativo. La información de sesión se gestiona mediante el servicio de autenticación y el almacenamiento del navegador; no equivale a una cookie publicitaria.", "El sitio no incorpora herramientas de publicidad ni de analítica que requieran cookies de seguimiento. No se presenta un catálogo de cookies de terceros que no estén implementadas. La carga de tipografías externas y las solicitudes necesarias para operar la plataforma se describen en la Política de Privacidad."] },
    { title: "Gestión de cookies", paragraphs: ["Puede consultar, bloquear o eliminar las cookies y los datos de sitios desde la configuración de su navegador. Eliminar el almacenamiento asociado a esta plataforma puede cerrar la sesión o impedir que el acceso se conserve entre visitas.", "Para finalizar el acceso, utilice la opción de cerrar sesión del portal. Si comparte un dispositivo, cierre la sesión al terminar. Si se incorporan tecnologías de seguimiento no esenciales, esta política deberá actualizarse y se solicitará el consentimiento que corresponda antes de utilizarlas."] },
  ]} />,
});
