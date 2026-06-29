// Regenerar tras ejecutar migrations (Task 2.1-2.4):
// npx supabase gen types typescript --project-id iptavlxqdzmxlpsopofw > src/types/database.ts
// O via MCP: supabase_generate_typescript_types

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
