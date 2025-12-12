import { Link } from "react-router-dom";
import { Button } from "@/components/ui/interactive/button";
import { IconBadge, AnimationBubble } from "../components";
import { useLanguage } from "@/contexts/LanguageContext";
import pillarCreativeIcon from "/icons/pillars/pillar-creative-icon.svg";
import pillarTechIcon from "/icons/pillars/pillar-tech-icon.svg";
import pillarSupportIcon from "/icons/pillars/pillar-support-icon.svg";
import serviceProductionIcon from "/icons/service/service-production-icon.svg";
import serviceAdvertisingIcon from "/icons/service/service-advertising-icon.svg";
import serviceLogisticsIcon from "/icons/service/service-logistics-icon.svg";

interface PillarsSectionProps {
  animations: Record<string, any>;
}

const PillarsSection = ({ animations }: PillarsSectionProps) => {
  const { t, language } = useLanguage();

  // French text data (default)
  const frPillars = {
    badge: "Approche & Atelier MAMI PUB",
    title: "Une équipe, trois expertises synchronisées.",
    description: "De la stratégie à la production, nous connectons créativité et workflows numériques pour propulser votre marque avec une constance irréprochable.",
    items: {
      creative: { badge: "Design sur Mesure", title: "Studio Créatif", description: "Identités visuelles, branding d'espaces et concepts immersifs conçus avec vous.", emphasis: "Approche collaborative" },
      tech: { badge: "Impression Haute Fidélité", title: "Technologie", description: "Parc machines calibré en continu pour des couleurs exactes et une tenue durable.", emphasis: "Tolérance <1%" },
      support: { badge: "Accompagnement Premium", title: "Support", description: "Formation, maintenance et hotline dédiée pour garder vos opérations fluides.", emphasis: "Service 7j/7" },
    },
    showcase: { title: "Des productions audacieuses, calibrées pour vos délais.", description: "Nos workflows numériques, découpes robotisées et finitions artisanales garantissent une constance irréprochable.", catalogBtn: "Catalogue matières", whatsappBtn: "Discuter sur WhatsApp" },
    services: {
      dtf: { title: "Production DTF & UV", description: "Textile, panneaux, signalétique ou packaging : nous poussons chaque matière au maximum.", detail: "Film, encre et finition certifiés" },
      advertising: { title: "Solutions Publicitaires", description: "Du lettrage aux structures monumentales, nous sculptons votre présence dans la ville.", detail: "Concept, fabrication, pose" },
      logistics: { title: "Logistique & pièces", description: "Stocks immédiatement disponibles et SAV express pour ne jamais interrompre votre production.", detail: "Livraison sous 24h" },
    },
  };

  const getPillarText = (pillarKey: string, field: string) => {
    if (language === 'fr') return frPillars.items[pillarKey as keyof typeof frPillars.items][field as keyof typeof frPillars.items.creative];
    return t(`pillars.items.${pillarKey}.${field}`);
  };
  const getServiceText = (serviceKey: string, field: string) => {
    if (language === 'fr') return frPillars.services[serviceKey as keyof typeof frPillars.services][field as keyof typeof frPillars.services.dtf];
    return t(`pillars.services.${serviceKey}.${field}`);
  };

  const pillarsData = [
    { key: 'creative', animationKey: 'pulse', icon: pillarCreativeIcon },
    { key: 'tech', animationKey: 'tools', icon: pillarTechIcon },
    { key: 'support', animationKey: 'supplies', icon: pillarSupportIcon },
  ];

  const servicesData = [
    { key: 'dtf', animationKey: 'orbit', icon: serviceProductionIcon, gradient: 'from-primary/30 via-blue-500/20 to-cyan-400/20' },
    { key: 'advertising', animationKey: 'campaign', icon: serviceAdvertisingIcon, gradient: 'from-amber-400/25 via-orange-400/20 to-rose-400/20' },
    { key: 'logistics', animationKey: 'supplies', icon: serviceLogisticsIcon, gradient: 'from-emerald-400/25 via-teal-400/20 to-cyan-400/20' },
  ];
  
  return (
    <section className="relative border-t border-border/20 bg-gradient-to-br from-background via-background to-background/80 py-12 sm:py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 md:mb-16 text-center">
          <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-primary/30 bg-primary/10 px-3 sm:px-5 py-1.5 sm:py-2">
            <IconBadge size="sm" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">{language === 'fr' ? frPillars.badge : t('pillars.badge')}</span>
          </div>
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black">{language === 'fr' ? frPillars.title : t('pillars.title')}</h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-muted-foreground">
            {language === 'fr' ? frPillars.description : t('pillars.description')}
          </p>
        </div>

        <div className="mb-8 sm:mb-12 md:mb-16 grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-3">
          {pillarsData.map(pillar => (
            <article
              key={pillar.key}
              className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/30 bg-card/60 p-4 sm:p-6 md:p-8 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-3"
            >
              <AnimationBubble
                animation={animations[pillar.animationKey]}
                className="absolute -right-8 top-6 h-40 w-40 opacity-20 transition-opacity duration-500 group-hover:opacity-40"
              />
              <div className="relative z-10 flex items-center gap-3">
                <IconBadge size="sm" variant="glass" icon={pillar.icon} className="border-border/40 bg-background/70" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                  {getPillarText(pillar.key, 'badge')}
                </span>
              </div>
              <h3 className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl font-bold text-foreground">{getPillarText(pillar.key, 'title')}</h3>
              <p className="mt-2 sm:mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">{getPillarText(pillar.key, 'description')}</p>
              <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-primary">
                {getPillarText(pillar.key, 'emphasis')}
              </div>
            </article>
          ))}
        </div>

        <div className="relative rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border border-border/40 bg-card/60 p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur-xl">
          <div className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 via-blue-500/15 to-cyan-400/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/15 via-orange-400/10 to-rose-400/10 blur-3xl" />
          </div>

          <div className="relative z-10 mb-6 sm:mb-8 md:mb-10 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-gradient-to-br from-primary/30 via-blue-500/20 to-cyan-400/25 p-4 sm:p-6 md:p-8 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.75)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_65%)] mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/10" />
            <div className="relative">
              <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white">{language === 'fr' ? frPillars.showcase.title : t('pillars.showcase.title')}</h3>
              <p className="mt-2 sm:mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-white/80">
                {language === 'fr' ? frPillars.showcase.description : t('pillars.showcase.description')}
              </p>
              <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap gap-2 sm:gap-4">
                <Link to="/store">
                  <Button
                    variant="outline"
                    className="h-9 sm:h-10 md:h-12 rounded-full border-white/60 bg-white/10 px-4 sm:px-6 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-white/20 hover:text-white"
                  >
                    {language === 'fr' ? frPillars.showcase.catalogBtn : t('pillars.showcase.catalogBtn')}
                  </Button>
                </Link>
                <a href="https://wa.me/213557914544" target="_blank" rel="noopener noreferrer">
                  <Button className="h-9 sm:h-10 md:h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 sm:px-6 text-xs sm:text-sm font-semibold !text-white shadow-lg shadow-green-500/30 transition hover:from-emerald-600 hover:to-green-700">
                    {language === 'fr' ? frPillars.showcase.whatsappBtn : t('pillars.showcase.whatsappBtn')}
                  </Button>
                </a>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {servicesData.map(service => (
              <div
                key={service.key}
                className="group relative flex h-full min-h-[200px] sm:min-h-[240px] md:min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 bg-card/80 p-4 sm:p-6 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-3"
              >
                <div className={`pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-gradient-to-br ${service.gradient} opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-70`} />
                <AnimationBubble animation={animations[service.animationKey]} className="pointer-events-none absolute -right-8 bottom-4 h-28 w-28 opacity-20" />

                <div className="relative z-10">
                  <IconBadge size="sm" variant="glass" icon={service.icon} className="border-border/50 bg-background/70" />
                  <h3 className="mt-6 text-lg font-bold leading-tight text-foreground">{getServiceText(service.key, 'title')}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-4">{getServiceText(service.key, 'description')}</p>
                </div>

                <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                    {getServiceText(service.key, 'detail')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;
