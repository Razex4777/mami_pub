import { Link } from "react-router-dom";
import { Button } from "@/components/ui/interactive/button";
import { IconBadge } from "../components";
import { mapEmbedSrc } from "../data";
import { useLanguage } from "@/contexts/LanguageContext";
import contactPhoneIcon from "/icons/contact/contact-phone-icon.svg";
import contactMailIcon from "/icons/contact/contact-mail-icon.svg";
import contactLocationIcon from "/icons/contact/contact-location-icon.svg";

const ContactSection = () => {
  const { t, language } = useLanguage();

  // French text data (default)
  const frContact = {
    badge: "Contact",
    title: "Parlons de votre prochaine activation.",
    description: "Nous co-créons des dispositifs qui marquent les esprits.",
    phone: { label: "Appelez-nous", description: "Conseiller dédié, réponses immédiates" },
    email: { label: "Écrivez-nous", description: "Devis, fichiers techniques, suivi" },
    location: { label: "Visitez-nous", description: "Showroom & atelier sur rendez-vous" },
    catalogBtn: "Voir nos catalogues",
    whatsappBtn: "Discuter sur WhatsApp",
  };
  
  return (
    <section className="relative bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%)] py-12 sm:py-16 md:py-24">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/15 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-12 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-stretch lg:gap-16">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-[0_24px_80px_-30px_rgba(59,130,246,0.55)]">
            <iframe
              src={mapEmbedSrc}
              title="Localisation MAMI PUB"
              className="h-[200px] sm:h-[320px] md:h-[420px] lg:h-full lg:min-h-[580px] w-full"
              style={{ border: "0" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="lg:pl-4">
            <div className="inline-flex items-center gap-2 sm:gap-3 rounded-full border border-primary/30 bg-primary/10 px-3 sm:px-5 py-1.5 sm:py-2">
              <IconBadge size="sm" />
              <span className="text-[10px] sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">{language === 'fr' ? frContact.badge : t('contact.badge')}</span>
            </div>
            <h2 className="mt-4 sm:mt-6 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black">
              {language === 'fr' ? frContact.title : t('contact.title')}
            </h2>
            <p className="mt-2 sm:mt-4 text-xs sm:text-sm md:text-base text-muted-foreground">
              {language === 'fr' ? frContact.description : t('contact.description')}
            </p>

            <div className="mt-6 sm:mt-8 md:mt-10 space-y-3 sm:space-y-4">
              <a
                href="tel:0557914544"
                className="group flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80 p-3 sm:p-4 md:p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
              >
                <IconBadge size="sm" variant="glass" icon={contactPhoneIcon} className="border-border/40 bg-background/70 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/80">{language === 'fr' ? frContact.phone.label : t('contact.phone.label')}</div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">0557 91 45 44</div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">{language === 'fr' ? frContact.phone.description : t('contact.phone.description')}</p>
                </div>
              </a>

              <a
                href="mailto:anes.mami.n@gmail.com"
                className="group flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80 p-3 sm:p-4 md:p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
              >
                <IconBadge size="sm" variant="glass" icon={contactMailIcon} className="border-border/40 bg-background/70 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/80">{language === 'fr' ? frContact.email.label : t('contact.email.label')}</div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">anes.mami.n@gmail.com</div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{language === 'fr' ? frContact.email.description : t('contact.email.description')}</p>
                </div>
              </a>

              <a
                href="https://maps.app.goo.gl/nGvSkUpqJbsxjH9r8"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80 p-3 sm:p-4 md:p-5 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
              >
                <IconBadge size="sm" variant="glass" icon={contactLocationIcon} className="border-border/40 bg-background/70 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/80">{language === 'fr' ? frContact.location.label : t('contact.location.label')}</div>
                  <div className="text-sm sm:text-base md:text-lg font-bold text-foreground">Ets Mahamid Mami, El Eulma 19600</div>
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{language === 'fr' ? frContact.location.description : t('contact.location.description')}</p>
                </div>
              </a>
            </div>

            <div className="mt-6 sm:mt-8 md:mt-10 flex flex-wrap gap-2 sm:gap-4">
              <Link to="/store">
                <Button className="h-9 sm:h-10 md:h-12 rounded-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 px-4 sm:px-6 md:px-8 text-xs sm:text-sm font-semibold shadow-lg shadow-primary/30">
                  {language === 'fr' ? frContact.catalogBtn : t('contact.catalogBtn')}
                </Button>
              </Link>
              <a href="https://wa.me/213557914544" target="_blank" rel="noopener noreferrer">
                <Button className="h-9 sm:h-10 md:h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-4 sm:px-6 md:px-8 text-xs sm:text-sm font-semibold !text-white shadow-lg shadow-green-500/30 hover:from-emerald-600 hover:to-green-700">
                  {language === 'fr' ? frContact.whatsappBtn : t('contact.whatsappBtn')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
