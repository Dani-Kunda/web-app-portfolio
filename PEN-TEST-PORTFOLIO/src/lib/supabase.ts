import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          target: string;
          date_performed: string;
          status: 'draft' | 'in-progress' | 'completed';
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          target?: string;
          date_performed?: string;
          status?: 'draft' | 'in-progress' | 'completed';
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          target?: string;
          date_performed?: string;
          status?: 'draft' | 'in-progress' | 'completed';
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      findings: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
          description: string;
          impact: string;
          remediation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
          description?: string;
          impact?: string;
          remediation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
          description?: string;
          impact?: string;
          remediation?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
