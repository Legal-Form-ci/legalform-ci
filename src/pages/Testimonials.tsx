import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Testimonials = () => {
  const testimonials = [
    {
      name: "KOFFI Inocent",
      company: "AGRICAPITAL SARL",
      region: "Daloa",
      type: "SARL",
      rating: 5,
      comment: "Service rapide et professionnel. L'équipe Legal Form a été disponible à chaque étape de la création de mon entreprise agricole. Je recommande vivement leurs services.",
      image: "/placeholder.svg"
    },
    {
      name: "KOUASSI Marie",
      company: "TECHNOVATE SARL",
      region: "Abidjan",
      type: "SARL",
      rating: 5,
      comment: "J'ai créé mon entreprise en moins d'une semaine. Excellent accompagnement ! L'équipe est réactive et très professionnelle. Tous mes documents ont été traités rapidement.",
      image: "/placeholder.svg"
    },
    {
      name: "DIALLO Amadou",
      company: "BATIR CI SARL",
      region: "Bouaké",
      type: "SARL",
      rating: 5,
      comment: "Processus simplifié, équipe compétente. Je recommande vivement Legal Form pour toute création d'entreprise. Le suivi est excellent du début à la fin.",
      image: "/placeholder.svg"
    },
    {
      name: "TRAORE Fatoumata",
      company: "MODE AFRIQUE",
      region: "Korhogo",
      type: "SUARL",
      rating: 5,
      comment: "Très satisfaite de l'accompagnement personnalisé. Legal Form m'a aidé à concrétiser mon rêve de créer ma propre marque de mode. Service impeccable !",
      image: "/placeholder.svg"
    },
    {
      name: "YAO Kouadio",
      company: "TRANSPORT EXPRESS",
      region: "San-Pédro",
      type: "SARL",
      rating: 5,
      comment: "Professionnalisme et réactivité au rendez-vous. Mon entreprise de transport a été créée dans les délais annoncés avec tous les documents nécessaires.",
      image: "/placeholder.svg"
    },
    {
      name: "BAMBA Mariam",
      company: "BEAUTE NATURELLE",
      region: "Yamoussoukro",
      type: "SUARL",
      rating: 5,
      comment: "Un grand merci à toute l'équipe ! J'ai pu lancer mon entreprise de cosmétiques naturels sans stress grâce à leur accompagnement de qualité.",
      image: "/placeholder.svg"
    },
    {
      name: "KONE Sekou",
      company: "AGRO BUSINESS CI",
      region: "Daloa",
      type: "SARL",
      rating: 5,
      comment: "Service complet et prix transparents. Legal Form a géré toute la partie administrative de ma société agricole. Je peux me concentrer sur mon activité.",
      image: "/placeholder.svg"
    },
    {
      name: "SYLLA Aissata",
      company: "EDUCATION PLUS",
      region: "Abidjan",
      type: "ONG",
      rating: 5,
      comment: "Excellente expérience pour la création de mon ONG éducative. L'équipe comprend bien les spécificités des structures à but non lucratif.",
      image: "/placeholder.svg"
    },
    {
      name: "COULIBALY Ibrahim",
      company: "CONSTRUCTION MODERNE",
      region: "Bouaké",
      type: "SARL",
      rating: 5,
      comment: "Délais respectés et conseils pertinents. Mon entreprise de BTP a été créée en respectant toutes les normes. Je recommande à tous les entrepreneurs !",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
              Témoignages
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez ce que nos clients disent de leurs expériences avec Legal Form
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Entreprises créées</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">14</div>
                <p className="text-sm text-muted-foreground">Régions couvertes</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">7j</div>
                <p className="text-sm text-muted-foreground">Délai moyen</p>
              </CardContent>
            </Card>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 hover:shadow-strong transition-all">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.type} - {testimonial.region}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-hero rounded-2xl p-12 text-center text-white">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-4">
              Rejoignez nos clients satisfaits
            </h2>
            <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
              Faites confiance à Legal Form pour créer votre entreprise en toute sérénité
            </p>
            <Link to="/create">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-strong text-lg px-8 py-6 h-auto font-semibold">
                Créer mon entreprise
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonials;