import { Button } from "@/components/ui/interactive/button";
import { ArrowRight, Zap, Shield, TrendingUp, Star, Users, Package, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-dtf-print.jpg";

const Home = () => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15, 17, 23, 0.97) 0%, rgba(15, 17, 23, 0.85) 50%, rgba(15, 17, 23, 0.7) 100%), url(${heroImage})`,
          }}
        />
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-6 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Premium DTF Solutions</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]">
                Impression DTF{" "}
                <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                  Qualité Pro
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Fabrication de précision et flux de travail rationalisé. Transferts direct-to-film premium pour professionnels.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/transfers">
                  <Button size="lg" className="gradient-primary hover:opacity-90 h-16 px-10 text-lg animate-glow group">
                    Parcourir le Catalogue
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/designer">
                  <Button size="lg" variant="outline" className="border-2 border-primary/50 hover:bg-primary/10 h-16 px-10 text-lg backdrop-blur-sm">
                    Concepteur Personnalisé
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/50">
                <div className="animate-fade-in">
                  <div className="text-3xl font-bold text-primary mb-1">2,400+</div>
                  <div className="text-sm text-muted-foreground">Designs</div>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <div className="text-3xl font-bold text-primary mb-1">10K+</div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative hidden md:block h-[600px]">
              {/* Floating Card 1 */}
              <div className="absolute top-0 right-0 w-80 gradient-card p-6 rounded-2xl border border-border hover-lift animate-float">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Premium Qualité</div>
                    <div className="text-sm text-muted-foreground">Garantie 100%</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Matériaux professionnels et procédés certifiés pour chaque transfert
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute top-40 left-0 w-72 gradient-card p-6 rounded-2xl border border-border hover-lift animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Livraison Rapide</div>
                    <div className="text-sm text-muted-foreground">24-48h</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Production express disponible pour vos projets urgents
                </div>
              </div>

              {/* Floating Card 3 */}
              <div className="absolute bottom-0 right-10 w-64 gradient-card p-6 rounded-2xl border border-border hover-lift animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">Support Pro</div>
                    <div className="text-sm text-muted-foreground">24/7</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Équipe d'experts à votre service
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="relative py-32 px-8 overflow-hidden">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-6 animate-fade-in">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Pourquoi Nous Choisir</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Excellence à Chaque{" "}
              <span className="text-primary">Étape</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des processus optimisés et une qualité irréprochable pour vos projets professionnels
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group gradient-card p-12 rounded-3xl border border-border hover-lift hover-glow relative overflow-hidden animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Livraison Ultra Rapide</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Production le jour même disponible. Infrastructure de qualité professionnelle conçue pour le volume et la vitesse.
                </p>
              </div>
            </div>

            <div className="group gradient-card p-12 rounded-3xl border border-border hover-lift hover-glow relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Qualité Premium Garantie</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Matériaux de qualité industrielle et application de précision. Chaque transfert répond à des normes exigeantes.
                </p>
              </div>
            </div>

            <div className="group gradient-card p-12 rounded-3xl border border-border hover-lift hover-glow relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Solutions Évolutives</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Des prototypes aux séries de production. Infrastructure conçue pour évoluer avec votre entreprise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="relative py-32 px-8 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/50 via-card/80 to-card/50" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Solutions{" "}
              <span className="text-primary">Professionnelles</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour l'impression DTF professionnelle
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Transferts DTF", items: "2 400+ designs", icon: Package },
              { title: "Impression Personnalisée", items: "Options illimitées", icon: Sparkles },
              { title: "Presses à Chaleur", items: "Qualité commerciale", icon: Zap },
              { title: "Matériaux & Fournitures", items: "Qualité professionnelle", icon: Shield },
            ].map((category, index) => (
              <Link
                key={category.title}
                to="/transfers"
                className="group gradient-card p-10 rounded-3xl border border-border hover-lift hover-glow relative overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <category.icon className="h-12 w-12 text-primary mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-smooth">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-lg">{category.items}</p>
                  <ArrowRight className="h-6 w-6 text-primary mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
