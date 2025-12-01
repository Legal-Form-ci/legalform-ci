import { Link } from "react-router-dom";
import { ArrowRight, Building2, FileText, Users, Shield, CheckCircle2, Star, Lightbulb, DollarSign, Palette, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroBackground from "@/assets/hero-bg.jpg";

const Index = () => {
  const services = [
    {
      icon: Building2,
      title: "Création & Structuration",
      description: "De l'idée au lancement opérationnel",
      items: ["SARL, SUARL, SNC, SCS, Entreprise Individuelle", "Association, ONG, Coopérative", "Structuration et formalisation de projet", "Publication au journal officiel incluse"],
    },
    {
      icon: FileText,
      title: "Accompagnement juridique",
      description: "Documents et immatriculations complètes",
      items: ["RCCM, DFE, NCC, CNPS", "IDU, NTD, Domiciliation", "Contrats, Statuts, Procurations", "Modification de statuts"],
    },
    {
      icon: GraduationCap,
      title: "Formation & Conseil",
      description: "Accompagnement stratégique personnalisé",
      items: ["Formation entrepreneuriale", "Conseil en stratégie d'entreprise", "Structuration de business model", "Accompagnement opérationnel"],
    },
    {
      icon: DollarSign,
      title: "Financement",
      description: "Mobilisation et recherche de fonds",
      items: ["Recherche de financement", "Mobilisation de fonds", "Montage de dossiers", "Mise en relation avec partenaires"],
    },
    {
      icon: Palette,
      title: "Solutions digitales",
      description: "Identité visuelle et présence en ligne",
      items: ["Conception de sites web", "Développement d'applications", "Création de logo et identité", "Branding complet"],
    },
  ];

  const steps = [
    { number: "01", title: "Choisissez votre service", description: "Création, Formation, Financement, Digital..." },
    { number: "02", title: "Remplissez le formulaire", description: "Informations simples et rapides" },
    { number: "03", title: "Validation & paiement", description: "Tarifs adaptés selon votre région" },
    { number: "04", title: "Accompagnement complet", description: "Suivi personnalisé jusqu'au succès" },
  ];

  const testimonials = [
    {
      name: "KOFFI Inocent",
      company: "AGRICAPITAL SARL",
      region: "Daloa",
      rating: 5,
      comment: "Service rapide et professionnel. L'équipe Legal Form a été disponible à chaque étape.",
    },
    {
      name: "KOUASSI Marie",
      company: "TECHNOVATE SARL",
      region: "Abidjan",
      rating: 5,
      comment: "J'ai créé mon entreprise en moins d'une semaine. Excellent accompagnement !",
    },
    {
      name: "DIALLO Amadou",
      company: "BATIR CI SA",
      region: "Bouaké",
      rating: 5,
      comment: "Processus simplifié, équipe compétente. Je recommande vivement Legal Form.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-hero opacity-95"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(23, 162, 184, 0.95) 0%, rgba(17, 128, 145, 0.95) 100%), url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-32 left-10 w-96 h-96 border-2 border-white transform rotate-45" />
          <div className="absolute top-1/2 right-1/4 w-48 h-48 border-2 border-white transform -rotate-12" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Transformez votre idée en{" "}
              <span className="text-accent">entreprise solide</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              Accompagnement complet de la structuration au financement, en passant par la création juridique et l'identité digitale
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <Link to="/create">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-strong text-lg px-8 py-6 h-auto font-semibold group">
                  Créer mon entreprise
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-white text-lg px-8 py-6 h-auto font-semibold">
                  Nos services
                </Button>
              </Link>
            </div>

            <div className="inline-flex items-center justify-center bg-accent text-white rounded-full px-8 py-4 shadow-strong animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <span className="text-3xl font-bold">À partir de 150 000 FCFA</span>
              <span className="ml-3 text-lg opacity-90">selon la région</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              Nos Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Votre partenaire stratégique pour entreprendre en toute sécurité avec une équipe d'experts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary hover:shadow-strong transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors w-fit">
                        <Icon className="h-8 w-8 text-primary group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                          {service.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <ul className="space-y-2">
                          {service.items.map((item, i) => (
                            <li key={i} className="flex items-start text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                Voir tous nos services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Créez votre entreprise en 4 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-hero text-white font-heading font-bold text-2xl mb-4 shadow-soft">
                    {step.number}
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-1/2" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/create">
              <Button size="lg" className="bg-gradient-accent hover:opacity-90 shadow-soft text-lg px-8 py-6 h-auto font-semibold">
                Commencer maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4">
              Entreprises Créées
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les témoignages de nos clients satisfaits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.comment}"</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{testimonial.region}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/showcases">
              <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white">
                Voir toutes les entreprises créées
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
