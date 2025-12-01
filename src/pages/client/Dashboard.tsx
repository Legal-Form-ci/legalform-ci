import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LogOut, Plus } from "lucide-react";

interface Request {
  id: string;
  tracking_number: string | null;
  status: string;
  created_at: string;
  estimated_price: number | null;
  payment_status?: string | null;
  company_name: string | null;
  // Company specific
  structure_type?: string;
  region?: string;
  // Service specific
  service_type?: string;
  type: 'company' | 'service';
}

const ClientDashboard = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else if (userRole === 'admin') {
        navigate("/admin/dashboard");
      }
    }
  }, [user, userRole, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      // Fetch company requests
      const { data: companyData, error: companyError } = await supabase
        .from('company_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (companyError) throw companyError;

      // Fetch service requests
      const { data: serviceData, error: serviceError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (serviceError) throw serviceError;

      // Combine and sort
      const companyRequests = (companyData || []).map(r => ({ ...r, type: 'company' as const }));
      const serviceRequests = (serviceData || []).map(r => ({ ...r, type: 'service' as const }));
      
      const allRequests = [...companyRequests, ...serviceRequests].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRequests(allRequests);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos demandes",
        variant: "destructive",
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending_quote':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'rejected':
        return 'Rejeté';
      case 'pending_quote':
        return 'Devis en attente';
      default:
        return status;
    }
  };

  if (loading || loadingRequests) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-heading font-bold text-4xl text-foreground mb-2">
                Mon Espace Client
              </h1>
              <p className="text-muted-foreground">
                Suivez l'avancement de vos dossiers
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle demande
              </Button>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </div>

          {requests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Vous n'avez pas encore de demande en cours
                </p>
                <Button onClick={() => navigate("/create")}>
                  Créer ma première entreprise
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/request/${request.id}?type=${request.type}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {request.type === 'company' 
                            ? (request.company_name || 'Création d\'entreprise') 
                            : `Service ${request.service_type}`
                          }
                        </CardTitle>
                        <CardDescription>
                          N° de suivi: <span className="font-semibold">{request.tracking_number || request.id.slice(0, 8)}</span>
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">
                          {request.type === 'company' 
                            ? request.structure_type?.toUpperCase() 
                            : request.service_type
                          }
                        </p>
                      </div>
                      {request.region && (
                        <div>
                          <p className="text-sm text-muted-foreground">Région</p>
                          <p className="font-medium">{request.region}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Date de création</p>
                        <p className="font-medium">
                          {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {request.estimated_price && (
                        <div>
                          <p className="text-sm text-muted-foreground">Tarif estimé</p>
                          <p className="font-medium">{request.estimated_price?.toLocaleString()} FCFA</p>
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/request/${request.id}?type=${request.type}`);
                      }}
                      className="w-full"
                    >
                      Voir les détails et messagerie
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
