import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  uploaded_by_role: string;
  description: string | null;
  created_at: string;
}

interface RequestDocumentsProps {
  requestId: string;
  requestType: "company" | "service";
}

const RequestDocuments = ({ requestId, requestType }: RequestDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    loadDocuments();
  }, [requestId, user]);

  const loadDocuments = async () => {
    const { data, error } = await supabase
      .from('request_documents_exchange')
      .select('*')
      .eq('request_id', requestId)
      .eq('request_type', requestType)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
      return;
    }

    setDocuments(data || []);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !user) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et un type de document",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${requestId}/${Date.now()}_${documentType}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(fileName, selectedFile, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Save reference in database
      const { error: dbError } = await supabase
        .from('request_documents_exchange')
        .insert({
          request_id: requestId,
          request_type: requestType,
          document_name: selectedFile.name,
          document_type: documentType,
          file_path: fileName,
          uploaded_by: user.id,
          uploaded_by_role: userRole === 'admin' ? 'admin' : 'client',
          description: description || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Document envoyé",
        description: "Le document a été uploadé avec succès",
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setDescription("");
      loadDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('company-documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.document_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Téléchargement réussi",
        description: "Le document a été téléchargé",
      });
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documents échangés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-semibold text-sm">Envoyer un document</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="file">Fichier</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept="image/*,application/pdf,.doc,.docx"
              />
            </div>
            <div>
              <Label htmlFor="docType">Type de document</Label>
              <Input
                id="docType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                placeholder="Ex: Statuts, DSV, Contrat de bail..."
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajoutez une note sur ce document..."
                rows={2}
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !documentType}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Envoi en cours..." : "Envoyer le document"}
            </Button>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Documents ({documents.length})</h4>
          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun document échangé pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{doc.document_type}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.document_name}</p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {doc.uploaded_by_role === 'admin' ? 'Legal Form' : 'Client'}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(doc)}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestDocuments;
