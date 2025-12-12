import { IconBadge, AnimationBubble } from "../components";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimelineSectionProps {
  animations: Record<string, any>;
}

const TimelineSection = ({ animations }: TimelineSectionProps) => {
  const { t, language } = useLanguage();
  
  // French text data (default)
  const frTimeline = {
    badge: "Timeline",
    title: "15 ans d'innovation continue.",
    description: "Chaque palier nous a rapprochés d'un objectif : offrir aux créateurs d'Algérie une infrastructure premium.",
    milestones: {
      "2009": { title: "Première presse DTF à El Eulma", description: "Déploiement des premiers transferts premium et fondation de MAMI PUB dans la région." },
      "2014": { title: "Atelier Grande Capacité", description: "Extension du parc machines, double équipe et premiers contrats nationaux." },
      "2019": { title: "Studio 360°", description: "Intégration du design, du prototypage et de la 3D pour des projets clés-en-main." },
      "2024": { title: "Hub Smart Print", description: "Monitoring à distance, maintenance prédictive et optimisation des flux logistiques." },
    },
  };

  const getMilestoneText = (year: string, field: string) => {
    if (language === 'fr') {
      const milestone = frTimeline.milestones[year as keyof typeof frTimeline.milestones];
      return milestone?.[field as 'title' | 'description'] ?? '';
    }
    return t(`timeline.milestones.${year}.${field}`);
  };  
  const milestones = ['2009', '2014', '2019', '2024'];
  
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-background/95 py-12 sm:py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
      <AnimationBubble animation={animations.pulse} className="pointer-events-none absolute -left-20 top-24 h-64 w-64 opacity-30 hidden sm:block" />
      <AnimationBubble animation={animations.tools} className="pointer-events-none absolute -right-12 bottom-24 h-72 w-72 opacity-20 hidden sm:block" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-primary/20 bg-primary/10 px-3 sm:px-5 py-1.5 sm:py-2">
              <IconBadge size="sm" />
              <span className="text-[10px] sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary">{language === 'fr' ? frTimeline.badge : t('timeline.badge')}</span>
            </div>
            <h2 className="mt-4 sm:mt-6 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black">
              {language === 'fr' ? frTimeline.title : t('timeline.title')}
            </h2>
          </div>
          <p className="max-w-xl text-xs sm:text-sm md:text-base text-muted-foreground">
            {language === 'fr' ? frTimeline.description : t('timeline.description')}
          </p>
        </div>

        {/* Timeline - Mobile: no line, Desktop: with line */}
        <div className="relative pl-0 sm:pl-12">
          <span className="absolute left-[1.1rem] top-0 hidden h-full w-px bg-border/40 sm:block" />
          {milestones.map((year, index) => (
            <div key={year} className="relative pb-6 sm:pb-16 last:pb-0 sm:pl-2">
              {/* Icon - Hidden on mobile, shown on desktop */}
              <div className="absolute -left-[2.45rem] top-2 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg shadow-primary/20">
                <IconBadge size="sm" className="shadow-none" />
              </div>
              <div className="rounded-2xl sm:rounded-3xl border border-border/40 bg-card/70 p-4 sm:p-6 backdrop-blur-xl shadow-[0_20px_45px_-25px_rgba(59,130,246,0.35)]">
                {/* Mobile: Icon inline */}
                <div className="flex items-center gap-3 sm:hidden mb-3">
                  <IconBadge size="sm" className="shadow-none shrink-0" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                    {year}
                  </span>
                </div>
                {/* Desktop: Year only */}
                <span className="hidden sm:block text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                  {year}
                </span>
                <h3 className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl font-bold text-foreground">{getMilestoneText(year, 'title')}</h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">{getMilestoneText(year, 'description')}</p>
              </div>
              {index !== milestones.length - 1 && (
                <span className="absolute left-[1.15rem] top-14 hidden h-20 border-l border-dashed border-border/50 sm:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
