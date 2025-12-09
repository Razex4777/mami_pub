import pillarCreativeIcon from "/icons/pillars/pillar-creative-icon.svg";
import pillarTechIcon from "/icons/pillars/pillar-tech-icon.svg";
import pillarSupportIcon from "/icons/pillars/pillar-support-icon.svg";
import serviceProductionIcon from "/icons/service/service-production-icon.svg";
import serviceAdvertisingIcon from "/icons/service/service-advertising-icon.svg";
import serviceLogisticsIcon from "/icons/service/service-logistics-icon.svg";

export type AnimationKey = keyof typeof animationSources;

export type HeroStat = {
  value: string;
  label: string;
  delay: number;
};

export type CreativePillar = {
  title: string;
  description: string;
  emphasis: string;
  badge: string;
  animationKey: AnimationKey;
  icon: string;
};

export type ServiceShowcase = {
  title: string;
  description: string;
  detail: string;
  gradient: string;
  animationKey: AnimationKey;
  icon: string;
};

export type ExperienceMilestone = {
  year: string;
  title: string;
  description: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  href: string;
  description: string;
};

export const animationSources = {
  hero: "https://assets-v2.lottiefiles.com/a/fd1e8fe4-117d-11ee-abeb-370ab0af7065/taalsBfHev.json",
  orbit: "https://assets-v2.lottiefiles.com/a/4cbc4d2e-3172-11ef-9d51-dba08622b4e2/N1chiMLYTk.json",
  pulse: "https://assets-v2.lottiefiles.com/a/1ecfe618-1176-11ee-abe2-97e5a469fffe/PU5bta5OPD.json",
  campaign: "https://assets-v2.lottiefiles.com/a/947eea12-1167-11ee-8338-3fa5f450cbe8/5ZrshfQY3e.json",
  supplies: "https://assets-v2.lottiefiles.com/a/1251a4b8-4014-11ee-b580-77c1299827fa/mgrb18Csfy.json",
  tools: "https://assets-v2.lottiefiles.com/a/895c9f16-1177-11ee-84c8-8318798743f1/jdYaoJsCFX.json",
} as const;

export const heroStats: HeroStat[] = [
  { value: "15+", label: "Années d'expertise", delay: 0 },
  { value: "1000+", label: "Clients accompagnés", delay: 200 },
  { value: "72h", label: "Production express", delay: 400 },
];

export const creativePillars: CreativePillar[] = [
  {
    title: "Studio Créatif",
    description: "Identités visuelles, branding d'espaces et concepts immersifs conçus avec vous.",
    emphasis: "Approche collaborative",
    badge: "Design sur Mesure",
    animationKey: "pulse",
    icon: pillarCreativeIcon,
  },
  {
    title: "Technologie",
    description: "Parc machines calibré en continu pour des couleurs exactes et une tenue durable.",
    emphasis: "Tolérance <1%",
    badge: "Impression Haute Fidélité",
    animationKey: "tools",
    icon: pillarTechIcon,
  },
  {
    title: "Support",
    description: "Formation, maintenance et hotline dédiée pour garder vos opérations fluides.",
    emphasis: "Service 7j/7",
    badge: "Accompagnement Premium",
    animationKey: "supplies",
    icon: pillarSupportIcon,
  },
];

export const serviceShowcases: ServiceShowcase[] = [
  {
    title: "Production DTF & UV",
    description: "Textile, panneaux, signalétique ou packaging : nous poussons chaque matière au maximum.",
    detail: "Film, encre et finition certifiés",
    gradient: "from-primary/30 via-blue-500/20 to-cyan-400/20",
    animationKey: "orbit",
    icon: serviceProductionIcon,
  },
  {
    title: "Solutions Publicitaires",
    description: "Du lettrage aux structures monumentales, nous sculptons votre présence dans la ville.",
    detail: "Concept, fabrication, pose",
    gradient: "from-amber-400/25 via-orange-400/20 to-rose-400/20",
    animationKey: "campaign",
    icon: serviceAdvertisingIcon,
  },
  {
    title: "Logistique & pièces",
    description: "Stocks immédiatement disponibles et SAV express pour ne jamais interrompre votre production.",
    detail: "Livraison sous 24h",
    gradient: "from-emerald-400/25 via-teal-400/20 to-cyan-400/20",
    animationKey: "supplies",
    icon: serviceLogisticsIcon,
  },
];

export const experienceMilestones: ExperienceMilestone[] = [
  {
    year: "2009",
    title: "Première presse DTF à El Eulma",
    description: "Déploiement des premiers transferts premium et fondation de MAMI PUB dans la région.",
  },
  {
    year: "2014",
    title: "Atelier Grande Capacité",
    description: "Extension du parc machines, double équipe et premiers contrats nationaux.",
  },
  {
    year: "2019",
    title: "Studio 360°",
    description: "Intégration du design, du prototypage et de la 3D pour des projets clés-en-main.",
  },
  {
    year: "2024",
    title: "Hub Smart Print",
    description: "Monitoring à distance, maintenance prédictive et optimisation des flux logistiques.",
  },
];

export const contactChannels: ContactChannel[] = [
  {
    label: "Appelez-nous",
    value: "0557 91 45 44",
    href: "tel:0557914544",
    description: "Conseiller dédié, réponses immédiates",
  },
  {
    label: "Écrivez-nous",
    value: "anes.mami.n@gmail.com",
    href: "mailto:anes.mami.n@gmail.com",
    description: "Devis, fichiers techniques, suivi",
  },
  {
    label: "Visitez-nous",
    value: "Ets Mahamid Mami, El Eulma 19600",
    href: "https://maps.app.goo.gl/nGvSkUpqJbsxjH9r8",
    description: "Showroom & atelier sur rendez-vous",
  },
];

export const mapEmbedSrc =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51541.49530872628!2d5.632973353059769!3d36.158196014473184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f30b1d665f911f%3A0x2494c24d17bcda30!2sEts%20Mahamid%20Mami!5e0!3m2!1sfr!2sdz!4v1762622572439!5m2!1sfr!2sdz";
