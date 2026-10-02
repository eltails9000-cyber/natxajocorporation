import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const col = "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo className="h-10" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Corporación multidisciplinaria que coordina y desarrolla áreas especializadas de tecnología, ingeniería, infraestructura y operaciones.
          </p>
        </div>
        <div>
          <h3 className="eyebrow mb-5 text-foreground">Corporativo</h3>
          <ul className="space-y-3">
            <li><Link to="/empresa" className={col}>Empresa</Link></li>
            <li><Link to="/gobierno-corporativo" className={col}>Gobierno corporativo</Link></li>
            <li><Link to="/capacidades" className={col}>Capacidades</Link></li>
            <li><Link to="/proyectos" className={col}>Proyectos</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-5 text-foreground">Empresas</h3>
          <ul className="space-y-3">
            {["technology", "cybersecurity", "engineering", "infrastructure", "construction", "logistics"].map((s) => (
              <li key={s}>
                <Link to="/empresas/$slug" params={{ slug: s }} className={`${col} capitalize`}>{s}</Link>
              </li>
            ))}
          </ul>
          <Link to="/empresas" className="mt-5 inline-block border-b border-brand pb-0.5 text-sm font-medium text-brand">
            Ver todas las empresas
          </Link>
        </div>
        <div>
          <h3 className="eyebrow mb-5 text-foreground">Legal</h3>
          <ul className="space-y-3">
            <li><Link to="/privacidad" className={col}>Privacidad</Link></li>
            <li><Link to="/terminos" className={col}>Términos</Link></li>
            <li><Link to="/cookies" className={col}>Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-muted-foreground lg:px-8">
          © 2026 NATXAJO CORPORATION. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
