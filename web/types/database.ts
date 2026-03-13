export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          artist_ids: string[] | null
          artist_names: string[] | null
          venue_id: string | null
          venue_name: string | null
          city: string
          event_date: string
          event_end_date: string | null
          event_type: string
          scale: string
          poster_url: string | null
          poster_storage_url: string | null
          ticket_platforms: Json | null
          price_range: string | null
          source_platform: string | null
          source_url: string | null
          source_id: string | null
          status: string
          view_count: number
          favorite_count: number
          search_vector: unknown | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          artist_ids?: string[] | null
          artist_names?: string[] | null
          venue_id?: string | null
          venue_name?: string | null
          city: string
          event_date: string
          event_end_date?: string | null
          event_type?: string
          scale?: string
          poster_url?: string | null
          poster_storage_url?: string | null
          ticket_platforms?: Json | null
          price_range?: string | null
          source_platform?: string | null
          source_url?: string | null
          source_id?: string | null
          status?: string
          view_count?: number
          favorite_count?: number
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          artist_ids?: string[] | null
          artist_names?: string[] | null
          venue_id?: string | null
          venue_name?: string | null
          city?: string
          event_date?: string
          event_end_date?: string | null
          event_type?: string
          scale?: string
          poster_url?: string | null
          poster_storage_url?: string | null
          ticket_platforms?: Json | null
          price_range?: string | null
          source_platform?: string | null
          source_url?: string | null
          source_id?: string | null
          status?: string
          view_count?: number
          favorite_count?: number
          search_vector?: unknown | null
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          name: string
          name_en: string | null
          aliases: string[] | null
          type: string
          avatar_url: string | null
          bio: string | null
          genres: string[] | null
          source_platform: string | null
          source_id: string | null
          event_count: number
          follower_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_en?: string | null
          aliases?: string[] | null
          type?: string
          avatar_url?: string | null
          bio?: string | null
          genres?: string[] | null
          source_platform?: string | null
          source_id?: string | null
          event_count?: number
          follower_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_en?: string | null
          aliases?: string[] | null
          type?: string
          avatar_url?: string | null
          bio?: string | null
          genres?: string[] | null
          source_platform?: string | null
          source_id?: string | null
          event_count?: number
          follower_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      venues: {
        Row: {
          id: string
          name: string
          aliases: string[] | null
          city: string
          district: string | null
          address: string | null
          capacity: number | null
          scale: string
          venue_type: string
          cover_url: string | null
          event_count: number
          latitude: number | null
          longitude: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          aliases?: string[] | null
          city: string
          district?: string | null
          address?: string | null
          capacity?: number | null
          scale?: string
          venue_type?: string
          cover_url?: string | null
          event_count?: number
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          aliases?: string[] | null
          city?: string
          district?: string | null
          address?: string | null
          capacity?: number | null
          scale?: string
          venue_type?: string
          cover_url?: string | null
          event_count?: number
          latitude?: number | null
          longitude?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      crawler_tasks: {
        Row: {
          id: string
          platform: string
          task_type: string
          status: string
          started_at: string | null
          finished_at: string | null
          events_found: number
          events_added: number
          events_updated: number
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          platform: string
          task_type: string
          status?: string
          started_at?: string | null
          finished_at?: string | null
          events_found?: number
          events_added?: number
          events_updated?: number
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          platform?: string
          task_type?: string
          status?: string
          started_at?: string | null
          finished_at?: string | null
          events_found?: number
          events_added?: number
          events_updated?: number
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
