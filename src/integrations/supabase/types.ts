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
      app_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          rating: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      appointment_modifications: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          modification_type: string
          modified_by: string | null
          new_date: string | null
          new_end_time: string | null
          new_start_time: string | null
          new_status: string | null
          old_date: string | null
          old_end_time: string | null
          old_start_time: string | null
          old_status: string | null
          reason: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          modification_type: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          new_status?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          old_status?: string | null
          reason?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          modification_type?: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          new_status?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          old_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_modifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_modifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "my_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          business_id: string
          can_cancel: boolean | null
          can_reschedule: boolean | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          customer_address: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          discount_percentage: number | null
          discount_reason: string | null
          end_time: string
          final_price: number | null
          id: string
          notes: string | null
          payment_intent_id: string | null
          requires_deposit: boolean | null
          service_id: string
          service_point_id: string | null
          staff_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          business_id: string
          can_cancel?: boolean | null
          can_reschedule?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          discount_percentage?: number | null
          discount_reason?: string | null
          end_time: string
          final_price?: number | null
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          requires_deposit?: boolean | null
          service_id: string
          service_point_id?: string | null
          staff_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          business_id?: string
          can_cancel?: boolean | null
          can_reschedule?: boolean | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          customer_address?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          discount_percentage?: number | null
          discount_reason?: string | null
          end_time?: string
          final_price?: number | null
          id?: string
          notes?: string | null
          payment_intent_id?: string | null
          requires_deposit?: boolean | null
          service_id?: string
          service_point_id?: string | null
          staff_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_appointments_service_point"
            columns: ["service_point_id"]
            isOneToOne: false
            referencedRelation: "service_points"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_modifications: {
        Row: {
          appointment_id: string
          created_at: string | null
          id: string
          modification_type: string
          modified_by: string | null
          new_date: string | null
          new_end_time: string | null
          new_start_time: string | null
          old_date: string | null
          old_end_time: string | null
          old_start_time: string | null
          reason: string | null
        }
        Insert: {
          appointment_id: string
          created_at?: string | null
          id?: string
          modification_type: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          reason?: string | null
        }
        Update: {
          appointment_id?: string
          created_at?: string | null
          id?: string
          modification_type?: string
          modified_by?: string | null
          new_date?: string | null
          new_end_time?: string | null
          new_start_time?: string | null
          old_date?: string | null
          old_end_time?: string | null
          old_start_time?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_modifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_modifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "my_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          business_id: string
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_closed: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_closed?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_closed?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          business_id: string
          created_at: string
          id: string
          next_billing_date: string | null
          payment_method: Json | null
          plan_id: string
          status: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          next_billing_date?: string | null
          payment_method?: Json | null
          plan_id: string
          status?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          next_billing_date?: string | null
          payment_method?: Json | null
          plan_id?: string
          status?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: true
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          banner_url: string | null
          block_reason: string | null
          blocked_at: string | null
          booking_link: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          email: string | null
          id: string
          instagram: string | null
          is_active: boolean | null
          is_blocked: boolean | null
          language_settings: Json | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          offline_settings: Json | null
          owner_id: string
          payment_settings: Json | null
          phone: string | null
          postal_code: string | null
          state: string | null
          tiktok: string | null
          updated_at: string | null
          website: string | null
          whatsapp_enabled: boolean | null
          whatsapp_number: string | null
          whatsapp_settings: Json | null
        }
        Insert: {
          address?: string | null
          banner_url?: string | null
          block_reason?: string | null
          blocked_at?: string | null
          booking_link?: string | null
          business_type: Database["public"]["Enums"]["business_type"]
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_blocked?: boolean | null
          language_settings?: Json | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          offline_settings?: Json | null
          owner_id: string
          payment_settings?: Json | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          whatsapp_settings?: Json | null
        }
        Update: {
          address?: string | null
          banner_url?: string | null
          block_reason?: string | null
          blocked_at?: string | null
          booking_link?: string | null
          business_type?: Database["public"]["Enums"]["business_type"]
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          is_blocked?: boolean | null
          language_settings?: Json | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          offline_settings?: Json | null
          owner_id?: string
          payment_settings?: Json | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          tiktok?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_enabled?: boolean | null
          whatsapp_number?: string | null
          whatsapp_settings?: Json | null
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          created_at: string
          email: string | null
          followed_businesses: Json | null
          id: string
          is_loyalty_member: boolean | null
          name: string
          phone: string
          total_bookings: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          followed_businesses?: Json | null
          id: string
          is_loyalty_member?: boolean | null
          name: string
          phone: string
          total_bookings?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          followed_businesses?: Json | null
          id?: string
          is_loyalty_member?: boolean | null
          name?: string
          phone?: string
          total_bookings?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      offline_sync_log: {
        Row: {
          action: string
          business_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          record_id: string
          synced: boolean | null
          table_name: string
        }
        Insert: {
          action: string
          business_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          record_id: string
          synced?: boolean | null
          table_name: string
        }
        Update: {
          action?: string
          business_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          record_id?: string
          synced?: boolean | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "offline_sync_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      page_visits: {
        Row: {
          business_id: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: string | null
          is_unique_visit: boolean | null
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visit_date: string
          visit_timestamp: string
        }
        Insert: {
          business_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_unique_visit?: boolean | null
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visit_date?: string
          visit_timestamp?: string
        }
        Update: {
          business_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_unique_visit?: boolean | null
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visit_date?: string
          visit_timestamp?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          business_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string
          provider_config: Json
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          provider_config?: Json
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          provider_config?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string
          created_at: string | null
          currency: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          appointment_id: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "my_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_statistics: {
        Row: {
          active_subscriptions: number | null
          created_at: string
          date: string
          expired_subscriptions: number | null
          id: string
          monthly_revenue: number | null
          new_businesses_today: number | null
          total_businesses: number | null
          trial_subscriptions: number | null
        }
        Insert: {
          active_subscriptions?: number | null
          created_at?: string
          date: string
          expired_subscriptions?: number | null
          id?: string
          monthly_revenue?: number | null
          new_businesses_today?: number | null
          total_businesses?: number | null
          trial_subscriptions?: number | null
        }
        Update: {
          active_subscriptions?: number | null
          created_at?: string
          date?: string
          expired_subscriptions?: number | null
          id?: string
          monthly_revenue?: number | null
          new_businesses_today?: number | null
          total_businesses?: number | null
          trial_subscriptions?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          appointment_id: string | null
          business_id: string
          created_at: string
          customer_email: string | null
          customer_name: string
          id: string
          rating: number
          review_text: string | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          business_id: string
          created_at?: string
          customer_email?: string | null
          customer_name: string
          id?: string
          rating: number
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          business_id?: string
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "my_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      service_points: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_concurrent_slots: number
          name: string
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_concurrent_slots?: number
          name: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_concurrent_slots?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_service_points_business"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          service_type: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          service_type?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          specialties: string[] | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          specialties?: string[] | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          specialties?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_appointments_per_month: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_appointments_per_month?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_appointments_per_month?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
      work_pictures: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string
          service_type: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url: string
          service_type?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_pictures_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      my_appointments: {
        Row: {
          appointment_date: string | null
          business_id: string | null
          created_at: string | null
          customer_id: string | null
          end_time: string | null
          id: string | null
          service_id: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Insert: {
          appointment_date?: string | null
          business_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          end_time?: string | null
          id?: string | null
          service_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Update: {
          appointment_date?: string | null
          business_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          end_time?: string | null
          id?: string | null
          service_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_service_point: {
        Args: {
          p_appointment_date: string
          p_business_id: string
          p_end_time: string
          p_start_time: string
        }
        Returns: string
      }
      calculate_customer_discount: {
        Args: {
          p_base_price: number
          p_business_id: string
          p_customer_id: string
        }
        Returns: Json
      }
      calculate_deposit_amount: {
        Args: { service_price: number }
        Returns: number
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      check_appointment_conflict: {
        Args: {
          p_appointment_date: string
          p_business_id: string
          p_end_time: string
          p_exclude_appointment_id?: string
          p_staff_id?: string
          p_start_time: string
        }
        Returns: boolean
      }
      check_business_subscription_status: {
        Args: { p_business_id: string }
        Returns: string
      }
      check_time_overlap: {
        Args: { end1: string; end2: string; start1: string; start2: string }
        Returns: boolean
      }
      find_nearby_businesses_with_slots: {
        Args: {
          search_date?: string
          search_radius?: number
          user_lat: number
          user_lon: number
        }
        Returns: {
          address: string
          available_slots: number
          business_id: string
          business_name: string
          business_type: string
          distance_km: number
          latitude: number
          logo_url: string
          longitude: number
          phone: string
        }[]
      }
      get_available_time_slots: {
        Args: {
          p_business_id: string
          p_date: string
          p_duration_minutes: number
          p_staff_id?: string
        }
        Returns: {
          is_available: boolean
          slot_time: string
        }[]
      }
      get_business_public_data: {
        Args: { business_booking_link: string }
        Returns: {
          address: string
          banner_url: string
          booking_link: string
          business_type: string
          city: string
          country: string
          cover_image_url: string
          created_at: string
          currency: string
          description: string
          email: string
          id: string
          instagram: string
          is_active: boolean
          logo_url: string
          name: string
          owner_id: string
          phone: string
          state: string
          tiktok: string
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_default_business_hours: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      initialize_default_service_point: {
        Args: { p_business_id: string }
        Returns: undefined
      }
      is_timeslot_conflicting: {
        Args: {
          p_appointment_date: string
          p_business_id: string
          p_end_time: string
          p_exclude_appointment_id?: string
          p_service_id: string
          p_staff_id?: string
          p_start_time: string
        }
        Returns: boolean
      }
      list_booked_slots: {
        Args: { p_business_id: string; p_date_from: string; p_date_to: string }
        Returns: {
          appointment_date: string
          end_at: string
          service_id: string
          start_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "business_owner"
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      business_type:
        | "barbershop"
        | "hair_salon"
        | "makeup_artist"
        | "nail_salon"
        | "spa"
        | "beauty_clinic"
        | "fashion_designer"
        | "cleaning"
        | "fitness"
        | "cleaning_service"
        | "fitness_center"
        | "massage_therapy"
        | "tattoo_parlor"
        | "medspa"
        | "driving_service"
        | "painting"
        | "flooring"
        | "plumbing"
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
      app_role: ["admin", "business_owner"],
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      business_type: [
        "barbershop",
        "hair_salon",
        "makeup_artist",
        "nail_salon",
        "spa",
        "beauty_clinic",
        "fashion_designer",
        "cleaning",
        "fitness",
        "cleaning_service",
        "fitness_center",
        "massage_therapy",
        "tattoo_parlor",
        "medspa",
        "driving_service",
        "painting",
        "flooring",
        "plumbing",
      ],
    },
  },
} as const
