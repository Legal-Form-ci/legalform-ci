import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  const services = [
    "Création d'entreprise",
    "Création d'association",
    "Création d'ONG",
    "Documents juridiques",
    "Immatriculation CNPS",
  ];

  const regions = [
    "Abidjan (Lagunes)",
    "Yamoussoukro (Lacs)",
    "Bouaké (Vallée du Bandama)",
    "Daloa (Sassandra-Marahoué)",
    "San-Pédro (Bas-Sassandra)",
    "Korhogo (Savanes)",
    "Man (Montagnes)",
    "Abengourou (Comoé)",
    "Bondoukou (Zanzan)",
    "Gagnoa (Gôh-Djiboua)",
  ];

  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src={logo} alt="Legal Form" className="h-10 w-10" />
              <span className="font-heading font-bold text-xl text-primary">Legal Form</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Votre partenaire de confiance pour créer et développer votre entreprise en Côte d'Ivoire.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Nos Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Nos Régions</h3>
            <ul className="space-y-2">
              {regions.map((region) => (
                <li key={region}>
                  <Link
                    to="/regions"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {region}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <div>+225 07 09 67 79 25</div>
                  <div>+225 05 05 66 31 31</div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">entreprise@legalform.ci</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">Cocody Angré 8e Tranche, Abidjan, Côte d'Ivoire</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Legal Form. Tous droits réservés.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
