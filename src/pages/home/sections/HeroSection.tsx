import { Link } from "react-router-dom";
import { Button } from "@/components/ui/interactive/button";
import AnimatedCounter from "@/components/ui/interactive/AnimatedCounter";
import { IconBadge, AnimationBubble } from "../components";
import { heroStats } from "../data";

interface HeroSectionProps {
  animations: Record<string, any>;
}

const HeroSection = ({ animations }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden min-h-[80vh] sm:min-h-screen flex items-center">
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-to-br from-slate-900 via-blue-900/50 to-primary/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/30" />
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="space-y-4 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/20 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 backdrop-blur-xl">
              <IconBadge size="sm" variant="glass" className="shadow-none" />
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white/80">
                El Eulma · Studio d'impression
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
                Créons des expériences visuelles qui marquent.
              </h1>
              <p className="mt-2 sm:mt-4 max-w-lg text-xs sm:text-sm md:text-base text-white/80">
                MAMI PUB orchestre vos campagnes d'impression avec précision artisanale.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link to="/store">
                <Button size="default" className="h-9 sm:h-10 md:h-12 rounded-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 px-4 sm:px-6 md:px-8 text-xs sm:text-sm font-semibold shadow-xl shadow-primary/40">
                  Explorer nos solutions
                </Button>
              </Link>
              <a href="https://wa.me/213557914544" target="_blank" rel="noopener noreferrer">
                <Button size="default" className="h-9 sm:h-10 md:h-12 rounded-full border-2 border-white/60 bg-white/15 backdrop-blur-sm px-4 sm:px-6 md:px-8 text-xs sm:text-sm font-semibold !text-white hover:bg-white/25 shadow-lg">
                  Lancer votre projet
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4">
              {heroStats.map(stat => (
                <div key={stat.label} className="rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-xl p-2 sm:p-4 border border-white/20 text-center">
                  <AnimatedCounter value={stat.value} label={stat.label} duration={2200} delay={stat.delay} />
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center lg:w-auto">
            <div className="relative aspect-square w-full max-w-sm rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur-2xl shadow-[0_40px_120px_-20px_rgba(59,130,246,0.45)]">
              <div className="absolute inset-3 rounded-[1.5rem] border border-white/10" />
              <AnimationBubble animation={animations.orbit} className="h-full w-full" />
              <div className="pointer-events-none absolute bottom-8 left-1/2 flex w-48 -translate-x-1/2 flex-col gap-1 rounded-xl bg-white/90 p-3 text-center shadow-xl">
                <div className="text-xs font-semibold text-primary">Smart Print Hub</div>
                <div className="text-xs text-muted-foreground">
                  Monitoring en direct
                </div>
              </div>
              <IconBadge size="lg" className="absolute -right-3 top-8 rotate-12 shadow-primary/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
