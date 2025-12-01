import { useState } from "react";
import { Building2, MapPin, Calendar, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Showcase = () => {
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Mock data - À remplacer par les données de la base de données Cloud
  const companies = [
    {
      name: "AGRICAPITAL SARL",
      type: "SARL",
      region: "Daloa",
      district: "Haut-Sassandra",
      date: "2025-11-13",
      rating: 5,
      testimonial: "Service rapide et professionnel. Équipe disponible et à l'écoute.",
      founder: "KOFFI Inocent"
    },
    {
      name: "TECH SOLUTIONS CI",
      type: "SARL",
      region: "Abidjan",
      district: "Cocody",
      date: "2025-11-10",
      rating: 5,
      testimonial: "Accompagnement exceptionnel du début à la fin. Je recommande vivement.",
      founder: "KOUASSI Marie"
    },
    {
      name: "CONSTRUCTION MODERNE",
      type: "SARL",
      region: "Bouaké",
      district: "Gbêkê",
      date: "2025-11-08",
      rating: 5,
      testimonial: "Procédure rapide et efficace. Tous les documents en règle.",
      founder: "DIALLO Abdoulaye"
    },
    {
      name: "ÉCOLE EXCELLENCE",
      type: "Association",
      region: "San-Pédro",
      district: "San-Pédro",
      date: "2025-11-05",
      rating: 4,
      testimonial: "Bon service, quelques délais mais résultat satisfaisant.",
      founder: "YAO Akissi"
    },
    {
      name: "TRANSPORT EXPRESS",
      type: "SARL",
      region: "Korhogo",
      district: "Poro",
      date: "2025-11-02",
      rating: 5,
      testimonial: "Équipe professionnelle et tarifs compétitifs.",
      founder: "COULIBALY Seydou"
    },
    {
      name: "AGRO EXPORT CI",
      type: "SA",
      region: "Yamoussoukro",
      district: "Yamoussoukro",
      date: "2025-10-28",
      rating: 5,
      testimonial: "Service impeccable pour la création de notre SA.",
      founder: "BAMBA Fatou"
    },
  ];

  const regions = ["Abidjan", "Yamoussoukro", "Bouaké", "Daloa", "San-Pédro", "Korhogo", "Man"];
  const types = ["SARL", "SUARL", "SNC", "SCS", "Association", "ONG", "Coopérative"];

  const filteredCompanies = companies.filter(company => {
    const regionMatch = filterRegion === "all" || company.region === filterRegion;
    const typeMatch = filterType === "all" || company.type === filterType;
    return regionMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-foreground mb-6">
              Entreprises Créées
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez les entreprises que nous avons accompagnées avec succès
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 max-w-2xl mx-auto">
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCompanies.map((company, index) => (
              <Card key={index} className="hover:shadow-strong transition-all hover:border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Building2 className="h-8 w-8 text-primary flex-shrink-0" />
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
                      {company.type}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{company.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {company.region}, {company.district}
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Créée le {new Date(company.date).toLocaleDateString('fr-FR')}
                  </div>

                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < company.rating ? "fill-accent text-accent" : "text-muted"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-semibold">{company.rating}/5</span>
                  </div>

                  {company.testimonial && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground italic mb-2">
                        "{company.testimonial}"
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        - {company.founder}, Fondateur
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" size="lg">
              Voir plus d'entreprises
            </Button>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center border-2">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Entreprises créées</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">18</div>
                <p className="text-muted-foreground">Régions couvertes</p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-2">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
                <p className="text-muted-foreground">Satisfaction client</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Showcase;
