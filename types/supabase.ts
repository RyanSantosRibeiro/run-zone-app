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
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          color: string
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          color?: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          color?: string
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: number
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: number
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: number
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      runs: {
        Row: {
          id: number
          user_id: string
          title: string | null
          distance: number
          duration: number
          average_speed: number
          calories_burned: number
          started_at: string | null
          completed_at: string | null
          route_data: Json | null
          crossed_h3_ids: string[] | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          title?: string | null
          distance?: number
          duration?: number
          average_speed?: number
          calories_burned?: number
          started_at?: string | null
          completed_at?: string | null
          route_data?: Json | null
          crossed_h3_ids?: string[] | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string | null
          distance?: number
          duration?: number
          average_speed?: number
          calories_burned?: number
          started_at?: string | null
          completed_at?: string | null
          route_data?: Json | null
          crossed_h3_ids?: string[] | null
          created_at?: string
        }
      }
      cells: {
        Row: {
          id: number
          h3_index: string
          owner_id: string | null
          hp: number
          max_hp: number
          boundary: Json | null
          season: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          h3_index: string
          owner_id?: string | null
          hp?: number
          max_hp?: number
          boundary?: Json | null
          season?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          h3_index?: string
          owner_id?: string | null
          hp?: number
          max_hp?: number
          boundary?: Json | null
          season?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: number
          name: string
          description: string | null
          icon: string | null
          category: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          icon?: string | null
          category?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          icon?: string | null
          category?: string
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: number
          user_id: string
          achievement_id: number
          earned_at: string
        }
        Insert: {
          id?: number
          user_id: string
          achievement_id: number
          earned_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          achievement_id?: number
          earned_at?: string
        }
      }
      season_rankings: {
        Row: {
          id: number
          season: string
          user_id: string
          position: number
          category: string
          score: number
          created_at: string
        }
        Insert: {
          id?: number
          season: string
          user_id: string
          position: number
          category: string
          score?: number
          created_at?: string
        }
        Update: {
          id?: number
          season?: string
          user_id?: string
          position?: number
          category?: string
          score?: number
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
