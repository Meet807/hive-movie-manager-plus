
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
      movies: {
        Row: {
          id: string
          created_at: string
          title: string
          director: string
          year: number
          rating: number
          poster: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          director: string
          year: number
          rating: number
          poster: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          director?: string
          year?: number
          rating?: number
          poster?: string
          description?: string | null
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
