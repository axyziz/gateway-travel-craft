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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          customer_id: string | null
          enquiry_id: string | null
          id: string
          meta: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          customer_id?: string | null
          enquiry_id?: string | null
          id?: string
          meta?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          customer_id?: string | null
          enquiry_id?: string | null
          id?: string
          meta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          airline: string | null
          amount: number
          booking_date: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          customer_name: string
          id: string
          pnr: string | null
          quotation_id: string | null
          reference: string
          remarks: string | null
          service_type: Database["public"]["Enums"]["enquiry_service"] | null
          status: Database["public"]["Enums"]["booking_status"]
          supplier: string | null
          ticket_number: string | null
          travel_date: string | null
          updated_at: string
        }
        Insert: {
          airline?: string | null
          amount?: number
          booking_date?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name: string
          id?: string
          pnr?: string | null
          quotation_id?: string | null
          reference?: string
          remarks?: string | null
          service_type?: Database["public"]["Enums"]["enquiry_service"] | null
          status?: Database["public"]["Enums"]["booking_status"]
          supplier?: string | null
          ticket_number?: string | null
          travel_date?: string | null
          updated_at?: string
        }
        Update: {
          airline?: string | null
          amount?: number
          booking_date?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string
          id?: string
          pnr?: string | null
          quotation_id?: string | null
          reference?: string
          remarks?: string | null
          service_type?: Database["public"]["Enums"]["enquiry_service"] | null
          status?: Database["public"]["Enums"]["booking_status"]
          supplier?: string | null
          ticket_number?: string | null
          travel_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          enquiry_count: number
          first_enquiry_at: string | null
          id: string
          last_enquiry_at: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          enquiry_count?: number
          first_enquiry_at?: string | null
          id?: string
          last_enquiry_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          enquiry_count?: number
          first_enquiry_at?: string | null
          id?: string
          last_enquiry_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          adults: number | null
          assigned_to: string | null
          children: number | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          customer_whatsapp: string | null
          details: Json
          id: string
          infants: number | null
          message: string | null
          priority: Database["public"]["Enums"]["enquiry_priority"]
          reference: string
          service_type: Database["public"]["Enums"]["enquiry_service"]
          status: Database["public"]["Enums"]["enquiry_status"]
          travel_date: string | null
          updated_at: string
        }
        Insert: {
          adults?: number | null
          assigned_to?: string | null
          children?: number | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_whatsapp?: string | null
          details?: Json
          id?: string
          infants?: number | null
          message?: string | null
          priority?: Database["public"]["Enums"]["enquiry_priority"]
          reference?: string
          service_type: Database["public"]["Enums"]["enquiry_service"]
          status?: Database["public"]["Enums"]["enquiry_status"]
          travel_date?: string | null
          updated_at?: string
        }
        Update: {
          adults?: number | null
          assigned_to?: string | null
          children?: number | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_whatsapp?: string | null
          details?: Json
          id?: string
          infants?: number | null
          message?: string | null
          priority?: Database["public"]["Enums"]["enquiry_priority"]
          reference?: string
          service_type?: Database["public"]["Enums"]["enquiry_service"]
          status?: Database["public"]["Enums"]["enquiry_status"]
          travel_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount: number
          id: string
          invoice_id: string
          position: number
          quantity: number
          service_type: Database["public"]["Enums"]["enquiry_service"] | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount?: number
          id?: string
          invoice_id: string
          position?: number
          quantity?: number
          service_type?: Database["public"]["Enums"]["enquiry_service"] | null
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          service_type?: Database["public"]["Enums"]["enquiry_service"] | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          booking_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount: number
          due_date: string | null
          id: string
          issue_date: string
          notes: string | null
          quotation_id: string | null
          reference: string
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tax: number
          terms: string | null
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          quotation_id?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          quotation_id?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tax?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string | null
          external_reference: string | null
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          reference: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          external_reference?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          external_reference?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string
          discount: number
          id: string
          position: number
          quantity: number
          quotation_id: string
          service_type: Database["public"]["Enums"]["enquiry_service"]
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          discount?: number
          id?: string
          position?: number
          quantity?: number
          quotation_id: string
          service_type: Database["public"]["Enums"]["enquiry_service"]
          total?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number
          id?: string
          position?: number
          quantity?: number
          quotation_id?: string
          service_type?: Database["public"]["Enums"]["enquiry_service"]
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          discount: number
          enquiry_id: string | null
          id: string
          issue_date: string
          notes: string | null
          reference: string
          status: Database["public"]["Enums"]["quotation_status"]
          subtotal: number
          tax: number
          terms: string | null
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          discount?: number
          enquiry_id?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          tax?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          discount?: number
          enquiry_id?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          subtotal?: number
          tax?: number
          terms?: string | null
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      gen_ref: { Args: { prefix: string; seq: unknown }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agent" | "viewer"
      booking_status:
        | "pending"
        | "confirmed"
        | "issued"
        | "completed"
        | "cancelled"
      enquiry_priority: "low" | "normal" | "high"
      enquiry_service:
        | "flight"
        | "hotel"
        | "visa"
        | "holiday"
        | "bus"
        | "vehicle"
      enquiry_status:
        | "new"
        | "in_progress"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      invoice_status: "draft" | "pending" | "paid" | "cancelled"
      payment_method: "cash" | "upi" | "bank_transfer" | "card" | "other"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      quotation_status:
        | "draft"
        | "sent"
        | "accepted"
        | "rejected"
        | "expired"
        | "cancelled"
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
      app_role: ["admin", "agent", "viewer"],
      booking_status: [
        "pending",
        "confirmed",
        "issued",
        "completed",
        "cancelled",
      ],
      enquiry_priority: ["low", "normal", "high"],
      enquiry_service: ["flight", "hotel", "visa", "holiday", "bus", "vehicle"],
      enquiry_status: [
        "new",
        "in_progress",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      invoice_status: ["draft", "pending", "paid", "cancelled"],
      payment_method: ["cash", "upi", "bank_transfer", "card", "other"],
      payment_status: ["pending", "partial", "paid", "refunded"],
      quotation_status: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
    },
  },
} as const
