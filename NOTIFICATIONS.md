# Avisos de NATXAJO CORPORATION

## Estado real
- Destinatario administrativo: `natxajosupport@gmail.com`.
- La identidad inicial de SUPER_ADMIN no cambia al cambiar el destinatario.
- No existe un dominio remitente verificado. Gmail es un destinatario, no un servicio de envío autorizado para esta plataforma.
- Las consultas se guardan antes de preparar el aviso. Su estado de correo sigue siendo `pending_domain`, visible en el panel. No significa envío realizado ni envío en cola.
- Los avisos de cambios de rol, estado de cuenta, configuración, revocación de sesiones, eliminación de cuenta, contraseña y MFA quedan preparados a partir del registro de seguridad existente. Los registros permanecen en auditoría; no se crea almacenamiento ni cola de correo.
- Verificación de correo y recuperación de acceso conservan su flujo existente. No se cambian sus destinatarios al correo administrativo ni se reenvían enlaces o códigos de recuperación a soporte.

## Activación futura
Cuando exista un dominio remitente verificado, generar las plantillas y el ayudante oficial de Lovable para app emails. Conectar las preparaciones existentes a plantillas fijas de nueva consulta, confirmación de consulta y evento administrativo/de seguridad. Usar las claves de idempotencia derivadas de cada evento y enviar cada aviso a un solo destinatario.

La API de envío debe confirmar el resultado antes de marcar una consulta como enviada. La supresión de destinatarios es un resultado normal; los errores de envío nunca deben invalidar una consulta ni una acción administrativa ya registrada. No reproducir automáticamente eventos históricos. Los textos de confirmación no deben prometer plazos de respuesta.

No se requieren credenciales Gmail ni cambios de base de datos. No añadir claves privadas al navegador. La configuración del remitente y la clave protegida de Lovable se gestionarán mediante el proceso oficial cuando se habilite el envío.

## Contenido institucional
Las políticas y el marco de gobierno están redactados según las funciones actuales y sin datos corporativos inventados. Se recomienda revisión jurídica antes de adoptar estos textos como documentación legal definitiva para una jurisdicción concreta.