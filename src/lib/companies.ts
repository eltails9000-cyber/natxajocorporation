import {
  Cpu, ShieldCheck, Compass, Network, HardHat, ClipboardList, Factory, Zap, Leaf,
  Warehouse, Truck, PackageSearch, BarChart3, Briefcase, Wrench, Building2, Landmark, Layers,
  type LucideIcon,
} from "lucide-react";

export type Pillar = "Technology" | "Engineering" | "Operations" | "Corporate";

export interface Company {
  slug: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  pillar: Pillar;
  icon: LucideIcon;
  areas: string[];
  capabilities: string[];
  solutions: string[];
}

export const companies: Company[] = [
  { slug: "technology", name: "NATXAJO TECHNOLOGY", short: "Technology", pillar: "Technology", icon: Cpu,
    tagline: "Technology, software and intelligent systems.",
    description: "Software, sistemas, inteligencia artificial y automatización.",
    areas: ["Desarrollo de software", "Sistemas empresariales", "Inteligencia artificial", "Automatización de procesos"],
    capabilities: ["Arquitectura de sistemas", "Integración de plataformas", "Análisis de datos", "Infraestructura tecnológica"],
    solutions: ["Plataformas digitales a medida", "Automatización operativa", "Soluciones basadas en IA"] },
  { slug: "cybersecurity", name: "NATXAJO CYBERSECURITY", short: "Cybersecurity", pillar: "Technology", icon: ShieldCheck,
    tagline: "Protection for systems, data and operations.",
    description: "Ciberseguridad, protección de sistemas y seguridad tecnológica.",
    areas: ["Seguridad de la información", "Protección de infraestructura", "Gestión de riesgos tecnológicos"],
    capabilities: ["Evaluación de seguridad", "Monitoreo", "Respuesta ante incidentes", "Políticas de seguridad"],
    solutions: ["Diagnóstico de seguridad", "Hardening de sistemas", "Programas de concientización"] },
  { slug: "engineering", name: "NATXAJO ENGINEERING", short: "Engineering", pillar: "Engineering", icon: Compass,
    tagline: "Engineering, design and technical supervision.",
    description: "Ingeniería, diseño, desarrollo y supervisión técnica.",
    areas: ["Ingeniería de diseño", "Desarrollo técnico", "Supervisión"],
    capabilities: ["Estudios técnicos", "Planificación", "Ingeniería de detalle", "Control de calidad"],
    solutions: ["Diseño de proyectos", "Supervisión técnica", "Consultoría de ingeniería"] },
  { slug: "infrastructure", name: "NATXAJO INFRASTRUCTURE", short: "Infrastructure", pillar: "Engineering", icon: Network,
    tagline: "Infrastructure development and delivery.",
    description: "Infraestructura y desarrollo de proyectos de infraestructura.",
    areas: ["Proyectos de infraestructura", "Desarrollo de activos", "Planificación territorial"],
    capabilities: ["Estructuración de proyectos", "Gestión técnica", "Coordinación multidisciplinaria"],
    solutions: ["Desarrollo integral de infraestructura", "Gestión del ciclo de vida de activos"] },
  { slug: "construction", name: "NATXAJO CONSTRUCTION", short: "Construction", pillar: "Engineering", icon: HardHat,
    tagline: "Construction and works execution.",
    description: "Construcción y ejecución de obras.",
    areas: ["Ejecución de obras", "Edificación", "Obras civiles"],
    capabilities: ["Gestión de obras", "Seguridad en obra", "Control de avance", "Mantenimiento"],
    solutions: ["Construcción llave en mano", "Ampliaciones y remodelaciones"] },
  { slug: "project-management", name: "NATXAJO PROJECT MANAGEMENT", short: "Project Management", pillar: "Corporate", icon: ClipboardList,
    tagline: "Direction, coordination and project control.",
    description: "Dirección, coordinación y gestión de proyectos.",
    areas: ["Dirección de proyectos", "PMO", "Control de proyectos"],
    capabilities: ["Planificación y cronogramas", "Gestión de costos", "Gestión de riesgos", "Reportes ejecutivos"],
    solutions: ["Gerencia de proyectos", "Oficina de gestión de proyectos"] },
  { slug: "industrial-services", name: "NATXAJO INDUSTRIAL SERVICES", short: "Industrial Services", pillar: "Operations", icon: Factory,
    tagline: "Technical, industrial and operational services.",
    description: "Servicios técnicos, industriales y operativos.",
    areas: ["Servicios industriales", "Soporte técnico", "Operaciones de planta"],
    capabilities: ["Mantenimiento industrial", "Montaje", "Soporte operativo"],
    solutions: ["Servicios técnicos especializados", "Soporte a operaciones"] },
  { slug: "energy", name: "NATXAJO ENERGY", short: "Energy", pillar: "Engineering", icon: Zap,
    tagline: "Energy solutions and projects.",
    description: "Soluciones y proyectos relacionados con energía.",
    areas: ["Proyectos energéticos", "Eficiencia energética", "Energías renovables"],
    capabilities: ["Evaluación energética", "Diseño de soluciones", "Implementación"],
    solutions: ["Proyectos de eficiencia", "Soluciones de generación"] },
  { slug: "environmental", name: "NATXAJO ENVIRONMENTAL", short: "Environmental", pillar: "Operations", icon: Leaf,
    tagline: "Environmental services and management.",
    description: "Servicios ambientales y gestión ambiental.",
    areas: ["Gestión ambiental", "Estudios ambientales", "Sostenibilidad"],
    capabilities: ["Monitoreo ambiental", "Planes de manejo", "Gestión de residuos"],
    solutions: ["Programas de gestión ambiental", "Asesoría en sostenibilidad"] },
  { slug: "logistics", name: "NATXAJO LOGISTICS", short: "Logistics", pillar: "Operations", icon: Warehouse,
    tagline: "Logistics, warehousing and supply chain.",
    description: "Logística, almacenamiento y cadena de suministro.",
    areas: ["Almacenamiento", "Distribución", "Cadena de suministro"],
    capabilities: ["Gestión de inventarios", "Planificación logística", "Operación de almacenes"],
    solutions: ["Logística integral", "Optimización de cadena de suministro"] },
  { slug: "transport", name: "NATXAJO TRANSPORT", short: "Transport", pillar: "Operations", icon: Truck,
    tagline: "Transport and mobility operations.",
    description: "Transporte y operaciones de movilidad.",
    areas: ["Transporte de carga", "Movilidad", "Gestión de flotas"],
    capabilities: ["Planificación de rutas", "Control de flota", "Seguridad operativa"],
    solutions: ["Servicios de transporte", "Gestión de movilidad"] },
  { slug: "supply", name: "NATXAJO SUPPLY", short: "Supply", pillar: "Operations", icon: PackageSearch,
    tagline: "Procurement and supply management.",
    description: "Abastecimiento, procurement y suministros.",
    areas: ["Procurement", "Abastecimiento", "Gestión de proveedores"],
    capabilities: ["Compras estratégicas", "Evaluación de proveedores", "Gestión de contratos de suministro"],
    solutions: ["Abastecimiento para proyectos", "Gestión de compras"] },
  { slug: "commercial", name: "NATXAJO COMMERCIAL", short: "Commercial", pillar: "Corporate", icon: BarChart3,
    tagline: "Commercialization, distribution and growth.",
    description: "Comercialización, distribución y desarrollo comercial.",
    areas: ["Comercialización", "Distribución", "Desarrollo de mercados"],
    capabilities: ["Estrategia comercial", "Canales de distribución", "Gestión de cuentas"],
    solutions: ["Desarrollo comercial", "Distribución de productos"] },
  { slug: "business-services", name: "NATXAJO BUSINESS SERVICES", short: "Business Services", pillar: "Corporate", icon: Briefcase,
    tagline: "Administrative and corporate services.",
    description: "Servicios administrativos y empresariales.",
    areas: ["Administración", "Servicios compartidos", "Soporte corporativo"],
    capabilities: ["Gestión administrativa", "Procesos corporativos", "Soporte a empresas del grupo corporativo"],
    solutions: ["Servicios compartidos", "Outsourcing administrativo"] },
  { slug: "facilities", name: "NATXAJO FACILITIES", short: "Facilities", pillar: "Operations", icon: Wrench,
    tagline: "Facilities and maintenance management.",
    description: "Instalaciones, mantenimiento y facilities management.",
    areas: ["Facilities management", "Mantenimiento", "Instalaciones"],
    capabilities: ["Mantenimiento preventivo", "Gestión de instalaciones", "Servicios generales"],
    solutions: ["Gestión integral de instalaciones", "Programas de mantenimiento"] },
  { slug: "real-estate", name: "NATXAJO REAL ESTATE", short: "Real Estate", pillar: "Corporate", icon: Building2,
    tagline: "Real estate assets and developments.",
    description: "Activos inmobiliarios, propiedades y proyectos inmobiliarios.",
    areas: ["Activos inmobiliarios", "Desarrollo inmobiliario", "Gestión de propiedades"],
    capabilities: ["Evaluación de activos", "Gestión patrimonial", "Desarrollo de proyectos"],
    solutions: ["Gestión de propiedades", "Desarrollo de proyectos inmobiliarios"] },
  { slug: "capital", name: "NATXAJO CAPITAL", short: "Capital", pillar: "Corporate", icon: Landmark,
    tagline: "Investments and capital management.",
    description: "Inversiones, participaciones y gestión de capital.",
    areas: ["Inversiones", "Participaciones", "Gestión de capital"],
    capabilities: ["Análisis de inversiones", "Estructuración financiera", "Gestión de portafolio"],
    solutions: ["Inversión en proyectos", "Gestión de participaciones"] },
  { slug: "holding", name: "NATXAJO HOLDING", short: "Holding", pillar: "Corporate", icon: Layers,
    tagline: "Corporate holdings management.",
    description: "Gestión de participaciones corporativas cuando corresponda.",
    areas: ["Participaciones corporativas", "Estructura societaria"],
    capabilities: ["Gestión de participaciones", "Coordinación corporativa"],
    solutions: ["Administración de participaciones"] },
];

export const getCompany = (slug: string) => companies.find((c) => c.slug === slug);

export const PENDING = "Información corporativa en desarrollo.";

/** Configurable corporate contact data. Leave null until officially defined. */
export const contactInfo = {
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
};

export interface Project {
  name: string; company: string; sector: string; location: string;
  status: string; description: string; date: string; image?: string; capabilities: string[];
}
/** Add published projects here. Empty until officially released. */
export const projects: Project[] = [];
