export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      article_tags: {
        Row: {
          article_id: string;
          created_at: string;
          tag_id: string;
        };
        ComputedFields: never;
        Insert: {
          article_id: string;
          created_at?: string;
          tag_id: string;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'article_tags_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'article_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      article_views: {
        Row: {
          article_id: string;
          id: string;
          viewed_at: string;
          visitor_hash: string | null;
        };
        ComputedFields: never;
        Insert: {
          article_id: string;
          id?: string;
          viewed_at?: string;
          visitor_hash?: string | null;
        };
        Update: {
          article_id?: string;
          id?: string;
          viewed_at?: string;
          visitor_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'article_views_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
        ];
      };
      articles: {
        Row: {
          author_id: string | null;
          category_id: string;
          content: string;
          cover_image_url: string | null;
          created_at: string;
          description: string;
          difficulty: Database['public']['Enums']['difficulty_level'] | null;
          id: string;
          is_featured: boolean;
          published_at: string | null;
          reading_time_minutes: number;
          search: unknown;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: Database['public']['Enums']['content_status'];
          title: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          author_id?: string | null;
          category_id: string;
          content?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          difficulty?: Database['public']['Enums']['difficulty_level'] | null;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          reading_time_minutes?: number;
          search?: never;
          seo_description?: string | null;
          seo_title?: string | null;
          slug: string;
          status?: Database['public']['Enums']['content_status'];
          title: string;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          category_id?: string;
          content?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          difficulty?: Database['public']['Enums']['difficulty_level'] | null;
          id?: string;
          is_featured?: boolean;
          published_at?: string | null;
          reading_time_minutes?: number;
          search?: never;
          seo_description?: string | null;
          seo_title?: string | null;
          slug?: string;
          status?: Database['public']['Enums']['content_status'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'articles_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'articles_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'articles_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'category_summaries';
            referencedColumns: ['id'];
          },
        ];
      };
      bookmarks: {
        Row: {
          article_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          article_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          article_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarks_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'articles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookmarks_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          description?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      dsa_problems: {
        Row: {
          brute_force_approach: string;
          category_id: string;
          created_at: string;
          difficulty: Database['public']['Enums']['difficulty_level'];
          dry_run: string;
          examples: NonNullable<Json>;
          explanation: string;
          id: string;
          optimized_approach: string;
          problem_constraints: string[];
          problem_statement: string;
          published_at: string | null;
          search: unknown;
          slug: string;
          solutions: NonNullable<Json>;
          space_complexity: string;
          status: Database['public']['Enums']['content_status'];
          time_complexity: string;
          title: string;
          topic: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          brute_force_approach?: string;
          category_id: string;
          created_at?: string;
          difficulty: Database['public']['Enums']['difficulty_level'];
          dry_run?: string;
          examples?: NonNullable<Json>;
          explanation?: string;
          id?: string;
          optimized_approach?: string;
          problem_constraints?: string[];
          problem_statement: string;
          published_at?: string | null;
          search?: never;
          slug: string;
          solutions?: NonNullable<Json>;
          space_complexity?: string;
          status?: Database['public']['Enums']['content_status'];
          time_complexity?: string;
          title: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          brute_force_approach?: string;
          category_id?: string;
          created_at?: string;
          difficulty?: Database['public']['Enums']['difficulty_level'];
          dry_run?: string;
          examples?: NonNullable<Json>;
          explanation?: string;
          id?: string;
          optimized_approach?: string;
          problem_constraints?: string[];
          problem_statement?: string;
          published_at?: string | null;
          search?: never;
          slug?: string;
          solutions?: NonNullable<Json>;
          space_complexity?: string;
          status?: Database['public']['Enums']['content_status'];
          time_complexity?: string;
          title?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'dsa_problems_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'dsa_problems_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'category_summaries';
            referencedColumns: ['id'];
          },
        ];
      };
      interview_questions: {
        Row: {
          category_id: string;
          code_example: string | null;
          code_language: string | null;
          created_at: string;
          detailed_explanation: string;
          difficulty: Database['public']['Enums']['difficulty_level'];
          id: string;
          interview_category: string | null;
          practical_example: string;
          published_at: string | null;
          related_question_ids: string[];
          search: unknown;
          short_answer: string;
          slug: string;
          status: Database['public']['Enums']['content_status'];
          technology: string;
          title: string;
          topic: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          category_id: string;
          code_example?: string | null;
          code_language?: string | null;
          created_at?: string;
          detailed_explanation?: string;
          difficulty: Database['public']['Enums']['difficulty_level'];
          id?: string;
          interview_category?: string | null;
          practical_example?: string;
          published_at?: string | null;
          related_question_ids?: string[];
          search?: never;
          short_answer: string;
          slug: string;
          status?: Database['public']['Enums']['content_status'];
          technology: string;
          title: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          code_example?: string | null;
          code_language?: string | null;
          created_at?: string;
          detailed_explanation?: string;
          difficulty?: Database['public']['Enums']['difficulty_level'];
          id?: string;
          interview_category?: string | null;
          practical_example?: string;
          published_at?: string | null;
          related_question_ids?: string[];
          search?: never;
          short_answer?: string;
          slug?: string;
          status?: Database['public']['Enums']['content_status'];
          technology?: string;
          title?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'interview_questions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'interview_questions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'category_summaries';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          role: Database['public']['Enums']['user_role'];
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id: string;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      category_summaries: {
        Row: {
          article_count: number | null;
          description: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
        };
        ComputedFields: never;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: {
      content_status: 'draft' | 'published';
      difficulty_level: 'easy' | 'medium' | 'hard';
      user_role: 'reader' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      content_status: ['draft', 'published'],
      difficulty_level: ['easy', 'medium', 'hard'],
      user_role: ['reader', 'admin'],
    },
  },
} as const;
