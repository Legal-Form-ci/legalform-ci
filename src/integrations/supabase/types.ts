export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          request_id: string | null
          request_type: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          request_id?: string | null
          request_type?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          request_id?: string | null
          request_type?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      company_associates: {
        Row: {
          birth_date: string | null
          birth_place: string | null
          cash_contribution: number | null
          children_count: number | null
          company_request_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          id_number: string | null
          is_manager: boolean | null
          marital_regime: string | null
          marital_status: string | null
          nature_contribution_description: string | null
          nature_contribution_value: number | null
          number_of_shares: number | null
          percentage: number | null
          phone: string | null
          residence_address: string | null
          share_end: number | null
          share_start: number | null
          total_contribution: number | null
        }
        Insert: {
          birth_date?: string | null
          birth_place?: string | null
          cash_contribution?: number | null
          children_count?: number | null
          company_request_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          id_number?: string | null
          is_manager?: boolean | null
          marital_regime?: string | null
          marital_status?: string | null
          nature_contribution_description?: string | null
          nature_contribution_value?: number | null
          number_of_shares?: number | null
          percentage?: number | null
          phone?: string | null
          residence_address?: string | null
          share_end?: number | null
          share_start?: number | null
          total_contribution?: number | null
        }
        Update: {
          birth_date?: string | null
          birth_place?: string | null
          cash_contribution?: number | null
          children_count?: number | null
          company_request_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          id_number?: string | null
          is_manager?: boolean | null
          marital_regime?: string | null
          marital_status?: string | null
          nature_contribution_description?: string | null
          nature_contribution_value?: number | null
          number_of_shares?: number | null
          percentage?: number | null
          phone?: string | null
          residence_address?: string | null
          share_end?: number | null
          share_start?: number | null
          total_contribution?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "company_associates_company_request_id_fkey"
            columns: ["company_request_id"]
            isOneToOne: false
            referencedRelation: "company_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_documents: {
        Row: {
          associate_id: string | null
          company_request_id: string
          document_type: string
          file_name: string
          file_path: string
          id: string
          original_name: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          associate_id?: string | null
          company_request_id: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
          original_name?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          associate_id?: string | null
          company_request_id?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          original_name?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_associate_id_fkey"
            columns: ["associate_id"]
            isOneToOne: false
            referencedRelation: "company_associates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_documents_company_request_id_fkey"
            columns: ["company_request_id"]
            isOneToOne: false
            referencedRelation: "company_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_requests: {
        Row: {
          activity: string | null
          additional_services: string[] | null
          address: string
          associates_count: string | null
          capital: string | null
          city: string | null
          client_rating: number | null
          client_review: string | null
          closed_at: string | null
          closed_by: string | null
          company_name: string | null
          contact_name: string
          created_at: string
          email: string
          estimated_price: number | null
          id: string
          phone: string
          region: string
          status: string | null
          structure_type: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity?: string | null
          additional_services?: string[] | null
          address: string
          associates_count?: string | null
          capital?: string | null
          city?: string | null
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string | null
          contact_name: string
          created_at?: string
          email: string
          estimated_price?: number | null
          id?: string
          phone: string
          region: string
          status?: string | null
          structure_type: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity?: string | null
          additional_services?: string[] | null
          address?: string
          associates_count?: string | null
          capital?: string | null
          city?: string | null
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          estimated_price?: number | null
          id?: string
          phone?: string
          region?: string
          status?: string | null
          structure_type?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      created_companies: {
        Row: {
          created_at: string
          district: string | null
          founder_name: string
          id: string
          name: string
          rating: number | null
          region: string
          show_publicly: boolean | null
          testimonial: string | null
          type: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          founder_name: string
          id?: string
          name: string
          rating?: number | null
          region: string
          show_publicly?: boolean | null
          testimonial?: string | null
          type: string
        }
        Update: {
          created_at?: string
          district?: string | null
          founder_name?: string
          id?: string
          name?: string
          rating?: number | null
          region?: string
          show_publicly?: boolean | null
          testimonial?: string | null
          type?: string
        }
        Relationships: []
      }
      ebook_downloads: {
        Row: {
          contact: string | null
          downloaded_at: string | null
          ebook_id: string | null
          id: string
          name: string | null
        }
        Insert: {
          contact?: string | null
          downloaded_at?: string | null
          ebook_id?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          contact?: string | null
          downloaded_at?: string | null
          ebook_id?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebook_downloads_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebooks: {
        Row: {
          category: string
          cover_image: string | null
          created_at: string | null
          description: string
          download_count: number | null
          file_path: string
          id: string
          published: boolean | null
          requires_form: boolean | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          cover_image?: string | null
          created_at?: string | null
          description: string
          download_count?: number | null
          file_path: string
          id?: string
          published?: boolean | null
          requires_form?: boolean | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          cover_image?: string | null
          created_at?: string | null
          description?: string
          download_count?: number | null
          file_path?: string
          id?: string
          published?: boolean | null
          requires_form?: boolean | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      public_tracking: {
        Row: {
          created_at: string | null
          id: string
          phone: string
          request_id: string
          request_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone: string
          request_id: string
          request_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          phone?: string
          request_id?: string
          request_type?: string
        }
        Relationships: []
      }
      public_tracking_rate_limit: {
        Row: {
          attempt_count: number | null
          blocked_until: string | null
          first_attempt_at: string | null
          id: string
          ip_address: string
          last_attempt_at: string | null
          phone: string
        }
        Insert: {
          attempt_count?: number | null
          blocked_until?: string | null
          first_attempt_at?: string | null
          id?: string
          ip_address: string
          last_attempt_at?: string | null
          phone: string
        }
        Update: {
          attempt_count?: number | null
          blocked_until?: string | null
          first_attempt_at?: string | null
          id?: string
          ip_address?: string
          last_attempt_at?: string | null
          phone?: string
        }
        Relationships: []
      }
      request_documents_exchange: {
        Row: {
          created_at: string | null
          description: string | null
          document_name: string
          document_type: string
          file_path: string
          id: string
          request_id: string
          request_type: string
          uploaded_by: string
          uploaded_by_role: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_name: string
          document_type: string
          file_path: string
          id?: string
          request_id: string
          request_type: string
          uploaded_by: string
          uploaded_by_role: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_name?: string
          document_type?: string
          file_path?: string
          id?: string
          request_id?: string
          request_type?: string
          uploaded_by?: string
          uploaded_by_role?: string
        }
        Relationships: []
      }
      request_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          request_id: string
          request_type: string
          sender_id: string
          sender_role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          request_id: string
          request_type: string
          sender_id: string
          sender_role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          request_id?: string
          request_type?: string
          sender_id?: string
          sender_role?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          client_rating: number | null
          client_review: string | null
          closed_at: string | null
          closed_by: string | null
          company_name: string | null
          contact_name: string
          created_at: string
          documents: string[] | null
          email: string
          estimated_price: number | null
          id: string
          payment_status: string | null
          phone: string
          service_details: Json | null
          service_type: string
          status: string
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string | null
          contact_name: string
          created_at?: string
          documents?: string[] | null
          email: string
          estimated_price?: number | null
          id?: string
          payment_status?: string | null
          phone: string
          service_details?: Json | null
          service_type: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_rating?: number | null
          client_review?: string | null
          closed_at?: string | null
          closed_by?: string | null
          company_name?: string | null
          contact_name?: string
          created_at?: string
          documents?: string[] | null
          email?: string
          estimated_price?: number | null
          id?: string
          payment_status?: string | null
          phone?: string
          service_details?: Json | null
          service_type?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_super_admin: { Args: never; Returns: undefined }
      generate_document_path: {
        Args: {
          associate_name: string
          doc_type: string
          is_manager: boolean
          original_filename: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const
