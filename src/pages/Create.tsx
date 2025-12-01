import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, FileText, CheckCircle2, Users, UserCircle, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AssociateForm from "@/components/AssociateForm";

interface Associate {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber: string;
  birthDate: string;
  birthPlace: string;
  maritalStatus: string;
  maritalRegime: string;
  childrenCount: number;
  residenceAddress: string;
  isManager: boolean;
  cashContribution: number;
  natureContributionDescription: string;
  natureContributionValue: number;
  // Document files
  idDocument: File | null;
  birthCertificate: File | null;
  criminalRecord: File | null;
}

const Create = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    structureType: "",
    region: "",
    city: "",
    address: "",
    companyName: "",
    activity: "",
    capital: "",
    associatesCount: "1",
    contactName: "",
    phone: "",
    email: "",
    additionalServices: [] as string[],
  });
  
  // Manager info removed - no longer needed
  
  const [associates, setAssociates] = useState<Associate[]>([
    {
      id: "1",
      fullName: "",
      phone: "",
      email: "",
      idNumber: "",
      birthDate: "",
      birthPlace: "",
      maritalStatus: "",
      maritalRegime: "",
      childrenCount: 0,
      residenceAddress: "",
      isManager: false,
      cashContribution: 0,
      natureContributionDescription: "",
      natureContributionValue: 0,
      idDocument: null,
      birthCertificate: null,
      criminalRecord: null,
    }
  ]);
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour créer une entreprise",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, loading, navigate, toast]);

  const structureTypes = [
    { value: "sarl", label: "SARL - Société à Responsabilité Limitée" },
    { value: "suarl", label: "SUARL - Société Unipersonnelle à Responsabilité Limitée" },
    { value: "snc", label: "SNC - Société en Nom Collectif" },
    { value: "scs", label: "SCS - Société en Commandite Simple" },
    { value: "ei", label: "Entreprise Individuelle" },
    { value: "association", label: "Association" },
    { value: "ong", label: "ONG" },
    { value: "cooperative", label: "Coopérative" },
    { value: "gie", label: "GIE - Groupement d'Intérêt Économique" },
  ];

  const regions = [
    "Abidjan (Lagunes)", "Yamoussoukro (Lacs)", "Bouaké (Vallée du Bandama)",
    "Daloa (Sassandra-Marahoué)", "San-Pédro (Bas-Sassandra)", "Korhogo (Savanes)",
    "Man (Montagnes)", "Abengourou (Comoé)", "Bondoukou (Zanzan)", "Gagnoa (Gôh-Djiboua)",
    "Divo (Lôh-Djiboua)", "Soubré (Nawa)", "Séguéla (Worodougou)", "Odienné (Denguélé)"
  ];

  const additionalServicesList = [
    { id: "dfe", label: "DFE - Déclaration Fiscale d'Existence" },
    { id: "ncc", label: "NCC - Numéro Compte Contribuable" },
    { id: "cnps", label: "CNPS - Immatriculation" },
    { id: "idu", label: "IDU - Identification Unique" },
    { id: "ntd", label: "NTD - Numéro de Télédéclarant" },
    { id: "domiciliation", label: "Domiciliation commerciale" },
  ];

  const calculatePrice = () => {
    const basePrice = formData.region === "Abidjan (Lagunes)" ? 150000 : 200000;
    const servicesPrice = formData.additionalServices.length * 25000;
    return basePrice + servicesPrice;
  };

  const calculateShareDistribution = () => {
    // Utiliser le capital déclaré à l'étape 3 comme référence
    const declaredCapital = parseFloat(formData.capital) || 0;
    
    const totalContributions = associates.reduce((sum, a) => 
      sum + a.cashContribution + a.natureContributionValue, 0
    );
    
    // Si le capital déclaré diffère significativement des contributions totales, afficher un avertissement
    if (declaredCapital > 0 && Math.abs(declaredCapital - totalContributions) > 1000) {
      toast({
        title: "Attention",
        description: `Le capital déclaré (${declaredCapital.toLocaleString()} FCFA) diffère du total des apports (${totalContributions.toLocaleString()} FCFA). Veuillez vérifier.`,
        variant: "default",
      });
    }
    
    // Utiliser le capital déclaré pour les calculs
    const baseCapital = declaredCapital > 0 ? declaredCapital : totalContributions;
    
    if (baseCapital === 0) return associates;
    
    const shareValue = 5000; // FCFA par part selon OHADA
    let currentShareNumber = 1;
    
    return associates.map(associate => {
      const totalContribution = associate.cashContribution + associate.natureContributionValue;
      const percentage = (totalContribution / baseCapital) * 100;
      const numberOfShares = Math.floor(totalContribution / shareValue);
      const shareStart = currentShareNumber;
      const shareEnd = currentShareNumber + numberOfShares - 1;
      
      currentShareNumber = shareEnd + 1;
      
      return {
        ...associate,
        percentage: parseFloat(percentage.toFixed(2)),
        numberOfShares,
        shareStart,
        shareEnd,
      };
    });
  };

  const addAssociate = () => {
    const maxAssociates = parseInt(formData.associatesCount) || 1;
    
    if (associates.length >= maxAssociates) {
      toast({
        title: "Limite atteinte",
        description: `Vous avez défini ${maxAssociates} associé(s) à l'étape 3. Impossible d'en ajouter plus.`,
        variant: "destructive",
      });
      return;
    }
    
    const newId = (associates.length + 1).toString();
    setAssociates([...associates, {
      id: newId,
      fullName: "",
      phone: "",
      email: "",
      idNumber: "",
      birthDate: "",
      birthPlace: "",
      maritalStatus: "",
      maritalRegime: "",
      childrenCount: 0,
      residenceAddress: "",
      isManager: false,
      cashContribution: 0,
      natureContributionDescription: "",
      natureContributionValue: 0,
      idDocument: null,
      birthCertificate: null,
      criminalRecord: null,
    }]);
  };

  const removeAssociate = (id: string) => {
    if (associates.length > 1) {
      setAssociates(associates.filter(a => a.id !== id));
      setFormData({ ...formData, associatesCount: (associates.length - 1).toString() });
    }
  };

  const updateAssociate = (id: string, field: keyof Associate, value: any) => {
    setAssociates(associates.map(a => 
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  const handleFileChange = (id: string, field: 'idDocument' | 'birthCertificate' | 'criminalRecord', file: File | null) => {
    setAssociates(associates.map(a =>
      a.id === id ? { ...a, [field]: file } : a
    ));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const estimatedPrice = calculatePrice();
      
      // 1. Create company request
      const { data: requestData, error: requestError } = await supabase
        .from('company_requests')
        .insert({
          user_id: user.id,
          structure_type: formData.structureType,
          company_name: formData.companyName,
          region: formData.region,
          city: formData.city,
          address: formData.address,
          activity: formData.activity,
          capital: formData.capital,
          associates_count: formData.associatesCount,
          contact_name: formData.contactName,
          phone: formData.phone,
          email: formData.email,
          additional_services: formData.additionalServices,
          estimated_price: estimatedPrice,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // 2. Insert associates with calculated shares
      const calculatedAssociates = calculateShareDistribution();
      const associatesData = calculatedAssociates.map(a => ({
        company_request_id: requestData.id,
        full_name: a.fullName,
        phone: a.phone,
        email: a.email,
        id_number: a.idNumber,
        birth_date: a.birthDate || null,
        birth_place: a.birthPlace || null,
        marital_status: a.maritalStatus || null,
        marital_regime: a.maritalRegime || null,
        children_count: a.childrenCount || 0,
        residence_address: a.residenceAddress || null,
        is_manager: a.isManager || false,
        cash_contribution: a.cashContribution,
        nature_contribution_description: a.natureContributionDescription,
        nature_contribution_value: a.natureContributionValue,
        percentage: (a as any).percentage,
        share_start: (a as any).shareStart,
        share_end: (a as any).shareEnd,
        number_of_shares: (a as any).numberOfShares,
        total_contribution: a.cashContribution + a.natureContributionValue,
      }));

      const { error: associatesError } = await supabase
        .from('company_associates')
        .insert(associatesData);

      if (associatesError) console.error("Associates insert error:", associatesError);

      // 3. Initiate payment with FedaPay
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: estimatedPrice,
          description: `Création d'entreprise ${formData.structureType.toUpperCase()} - ${formData.companyName || 'Sans nom'}`,
          requestId: requestData.id,
          customerEmail: formData.email,
          customerName: formData.contactName,
          customerPhone: formData.phone
        }
      });

      if (paymentError) throw paymentError;

      toast({
        title: "Demande enregistrée",
        description: "Redirection vers la page de paiement...",
      });

      // Redirect to FedaPay payment page
      if (paymentData?.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error("URL de paiement non disponible");
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.structureType) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner un type de structure",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && (!formData.region || !formData.address)) {
      toast({
        title: "Informations requises",
        description: "Veuillez renseigner la région et l'adresse",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && (!formData.contactName || !formData.email || !formData.phone)) {
      toast({
        title: "Informations requises",
        description: "Veuillez renseigner le nom de contact, l'email et le téléphone",
        variant: "destructive",
      });
      return;
    }
    if (step === 4 && associates.some(a => !a.fullName || !a.email || !a.phone)) {
      toast({
        title: "Informations requises",
        description: "Veuillez remplir tous les champs obligatoires pour chaque associé",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl sm:text-5xl text-foreground mb-4">
              Créer Mon Entreprise
            </h1>
            <p className="text-lg text-muted-foreground">
              Suivez les étapes pour démarrer votre projet
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-12">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= num ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {num}
                </div>
                <div className="text-xs mt-2 text-center">
                  {num === 1 && "Type"}
                  {num === 2 && "Localisation"}
                  {num === 3 && "Infos"}
                  {num === 4 && "Associés"}
                  {num === 5 && "Services"}
                  {num === 6 && "Récap"}
                </div>
              </div>
            ))}
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                {step === 1 && <><Building2 className="mr-2" /> Type de structure</>}
                {step === 2 && <><MapPin className="mr-2" /> Localisation</>}
                {step === 3 && <><FileText className="mr-2" /> Informations de la structure</>}
                {step === 4 && <><Users className="mr-2" /> Associés et apports</>}
                {step === 5 && <><CheckCircle2 className="mr-2" /> Services complémentaires</>}
                {step === 6 && <><CheckCircle2 className="mr-2" /> Récapitulatif</>}
              </CardTitle>
              <CardDescription>Étape {step} sur 6</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Step 1: Structure Type */}
              {step === 1 && (
                <div className="space-y-4">
                  <Label htmlFor="structureType">Que souhaitez-vous créer ?</Label>
                  <Select 
                    value={formData.structureType} 
                    onValueChange={(value) => setFormData({...formData, structureType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de structure" />
                    </SelectTrigger>
                    <SelectContent>
                      {structureTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="region">Région</Label>
                    <Select 
                      value={formData.region} 
                      onValueChange={(value) => setFormData({...formData, region: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre région" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Ville/Département</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: Cocody, Abobo..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Adresse complète</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Entrez l'adresse complète de votre structure"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Company Info */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Nom de la structure</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Nom de votre entreprise/structure"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="activity">Secteur d'activité</Label>
                    <Input
                      id="activity"
                      value={formData.activity}
                      onChange={(e) => setFormData({...formData, activity: e.target.value})}
                      placeholder="Ex: Commerce, Agriculture, Services..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="capital">Capital social (FCFA)</Label>
                    <Input
                      id="capital"
                      type="number"
                      value={formData.capital}
                      onChange={(e) => setFormData({...formData, capital: e.target.value})}
                      onFocus={(e) => {
                        if (e.target.value === '0') {
                          e.target.value = '';
                        }
                      }}
                      placeholder="Ex: 1000000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="associatesCount">Nombre d'associés</Label>
                    <Input
                      id="associatesCount"
                      type="number"
                      value={formData.associatesCount}
                      onChange={(e) => setFormData({...formData, associatesCount: e.target.value})}
                      onFocus={(e) => {
                        if (e.target.value === '0' || e.target.value === '1') {
                          e.target.value = '';
                        }
                      }}
                      placeholder="Ex: 2"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactName">Nom du contact principal</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                      placeholder="Votre nom complet"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Ex: +225 0101010101"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Associates */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-muted-foreground">
                      Ajoutez les associés et leurs apports (minimum 1)
                    </p>
                    <Button type="button" onClick={addAssociate} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un associé
                    </Button>
                  </div>
                  
                  {associates.map((associate, index) => {
                    const calculated = calculateShareDistribution()[index];
                    const totalContribution = associate.cashContribution + associate.natureContributionValue;
                    
                    return (
                      <AssociateForm
                        key={associate.id}
                        associate={associate}
                        index={index}
                        calculated={calculated}
                        totalContribution={totalContribution}
                        canRemove={associates.length > 1}
                        onUpdate={updateAssociate}
                        onRemove={removeAssociate}
                        onFileChange={handleFileChange}
                      />
                    );
                  })}
                </div>
              )}

              {/* Step 5: Additional Services */}
              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground mb-4">
                    Sélectionnez les services complémentaires dont vous avez besoin :
                  </p>
                  
                  {additionalServicesList.map((service) => (
                    <div key={service.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={service.id}
                        checked={formData.additionalServices.includes(service.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              additionalServices: [...formData.additionalServices, service.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              additionalServices: formData.additionalServices.filter(s => s !== service.id)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={service.id} className="cursor-pointer">
                        {service.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 6: Summary */}
              {step === 6 && (
                <div className="space-y-6">
                  <div className="bg-muted/50 p-6 rounded-lg space-y-3">
                    <h3 className="font-semibold text-lg mb-4">Récapitulatif de votre demande</h3>
                    
                    <div className="space-y-2">
                      <p><strong>Type de structure :</strong> {structureTypes.find(t => t.value === formData.structureType)?.label}</p>
                      <p><strong>Région :</strong> {formData.region}</p>
                      {formData.city && <p><strong>Ville :</strong> {formData.city}</p>}
                      <p><strong>Nom de contact :</strong> {formData.contactName}</p>
                      <p><strong>Email :</strong> {formData.email}</p>
                      <p><strong>Téléphone :</strong> {formData.phone}</p>
                      {formData.companyName && <p><strong>Nom de l'entreprise :</strong> {formData.companyName}</p>}
                      {formData.activity && <p><strong>Activité :</strong> {formData.activity}</p>}
                      {formData.capital && <p><strong>Capital social :</strong> {parseInt(formData.capital).toLocaleString()} FCFA</p>}
                      <p><strong>Nombre d'associés :</strong> {associates.length}</p>
                      
                      {formData.additionalServices.length > 0 && (
                        <div className="mt-4">
                          <strong>Services additionnels :</strong>
                          <ul className="list-disc list-inside ml-4 mt-2">
                            {formData.additionalServices.map(serviceId => (
                              <li key={serviceId}>{additionalServicesList.find(s => s.id === serviceId)?.label}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-lg font-semibold">
                        Tarif estimé :
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {calculatePrice().toLocaleString()} FCFA
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Le prix final sera confirmé par notre équipe après étude de votre dossier.
                    </p>
                    
                    <div className="bg-background p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Méthodes de paiement acceptées :</h4>
                      <ul className="text-sm space-y-1">
                        <li>✓ Mobile Money (MTN, Moov, Orange Money)</li>
                        <li>✓ Cartes bancaires (Visa, Mastercard)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Précédent
                  </Button>
                )}
                
                {step < 6 ? (
                  <Button onClick={nextStep} className="ml-auto">
                    Suivant
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit} 
                    className="ml-auto bg-accent hover:bg-accent/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Traitement en cours..." : "Procéder au paiement"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Create;
