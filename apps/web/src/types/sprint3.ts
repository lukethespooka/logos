// Sprint 3 Type Definitions
// Created: 2025-01-02
// Purpose: Type safety for hybrid AI integration and provider connections

// =============================================================================
// PROVIDER INTEGRATION TYPES
// =============================================================================

export type ProviderType = 
  | 'gmail' 
  | 'google_calendar'
  | 'google_drive'
  | 'google_tasks'
  | 'google_maps'
  | 'openweathermap'
  | 'weatherapi'
  | 'tomorrow_io'
  | 'apple_calendar';

export type ConnectionStatus = 'active' | 'expired' | 'revoked';

export interface ProviderConnection {
  id: string;
  provider: ProviderType;
  status: 'active' | 'expired' | 'revoked';
  connected_at: string;
  last_sync?: string;
  scopes: string[];
  user_email?: string;
  display_name?: string;
  avatar_url?: string;
  settings: {
    // Maps settings
    defaultCenter?: [number, number];
    defaultZoom?: number;
    language?: string;
    region?: string;
    // Weather settings
    units?: 'metric' | 'imperial';
    daysForcast?: number;
    // Other provider-specific settings
    [key: string]: any;
  };
  sync_enabled: boolean;
  sync_frequency: number;
}

export interface OAuthConfig {
  gmail: {
    client_id: string;
    client_secret: string;
    scopes: string[];
  };
  google_calendar: {
    client_id: string;
    client_secret: string;
    scopes: string[];
  };
  google_drive: {
    client_id: string;
    client_secret: string;
    scopes: string[];
  };
  google_tasks: {
    client_id: string;
    client_secret: string;
    scopes: string[];
  };
  google_maps: {
    api_key: string;
    places_api_key: string;
    geocoding_api_key: string;
    scopes: string[];
  };
  openweathermap: {
    api_key: string;
    units: 'metric' | 'imperial';
  };
  weatherapi: {
    api_key: string;
    days_forecast: number;
  };
  tomorrow_io: {
    api_key: string;
    units: 'metric' | 'imperial';
  };
  apple_calendar: {
    client_id: string;
    client_secret: string;
    scopes: string[];
  };
}

// =============================================================================
// AI ROUTER & MODEL TYPES
// =============================================================================

export type AIProvider = 'ollama' | 'openai' | 'claude';

export type LocalModel = 
  | 'llama3.2:1b'
  | 'llama3.2:3b'
  | 'all-minilm:l6-v2'

export type CloudModel = 
  | 'gpt-4o-mini'
  | 'gpt-4'
  | 'claude-3.5-sonnet'

export type InteractionType = 'brief' | 'email_triage' | 'calendar_analysis' | 'task_generation' | 'focus_suggestion';

export interface AIRouterConfig {
  cost_threshold_usd: number;
  daily_budget_usd: number;
  prefer_local: boolean;
  fallback_enabled: boolean;
  privacy_mode: boolean;
}

export interface AIModelConfig {
  name: LocalModel | CloudModel;
  provider: AIProvider;
  cost_per_1k_tokens: number;
  privacy_level: 'high' | 'medium' | 'low';
  max_tokens: number;
  timeout_ms: number;
}

export interface AIInteraction {
  id: string;
  user_id: string;
  interaction_type: InteractionType;
  ai_provider: AIProvider;
  model_used: LocalModel | CloudModel;
  input_tokens?: number;
  output_tokens?: number;
  cost_usd?: number;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

// =============================================================================
// EMAIL INSIGHTS TYPES
// =============================================================================

export type EmailCategory = 'high_priority' | 'client' | 'marketing' | 'personal' | 'automated';

export interface EmailInsight {
  id: string;
  user_id: string;
  provider_email_id: string;
  provider: ProviderType;
  category: EmailCategory;
  summary?: string;
  tasks_extracted: string[];
  urgency_score: number; // 1-10
  processed_at: string;
  ai_model_used: LocalModel | CloudModel;
}

export interface EmailTriageRequest {
  emails: {
    id: string;
    subject: string;
    sender: string;
    snippet: string;
    timestamp: string;
  }[];
  user_context?: {
    current_tasks: string[];
    focus_mode_active: boolean;
    time_of_day: string;
  };
}

export interface EmailTriageResponse {
  insights: EmailInsight[];
  suggested_actions: {
    type: 'reply' | 'schedule' | 'task' | 'ignore';
    email_id: string;
    reasoning: string;
    priority: number;
  }[];
  processing_stats: {
    total_processed: number;
    ai_model_used: LocalModel | CloudModel;
    processing_time_ms: number;
    cost_usd: number;
  };
}

// =============================================================================
// SUGGESTION & LEARNING TYPES
// =============================================================================

export type SuggestionType = 'review_emails' | 'prep_meeting' | 'focus_block' | 'break_reminder' | 'task_priority';

export type SuggestionOutcome = 'completed' | 'dismissed' | 'deferred' | 'modified';

export interface SuggestionContext {
  time_of_day: string;
  focus_mode_active: boolean;
  recent_activity: string[];
  upcoming_events: number;
  task_count: number;
  stress_indicators?: string[];
}

export interface SuggestionMetric {
  id: string;
  user_id: string;
  suggestion_type: SuggestionType;
  context: SuggestionContext;
  suggested_at: string;
  clicked?: boolean;
  clicked_at?: string;
  outcome?: SuggestionOutcome;
  feedback_score?: number; // 1-5
}

export interface SmartSuggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  action_label: string;
  priority: number;
  confidence: number; // 0-1
  reasoning: string;
  estimated_time_minutes?: number;
  context_triggers: string[];
}

// =============================================================================
// DAILY BRIEF TYPES
// =============================================================================

export interface DailyBriefConfig {
  enabled: boolean;
  time: string; // HH:MM format
  include_emails: boolean;
  include_calendar: boolean;
  include_tasks: boolean;
  ai_insights_enabled: boolean;
  max_email_summary_count: number;
}

export interface DailyBriefData {
  date: string;
  email_summary: {
    total_count: number;
    high_priority_count: number;
    top_insights: EmailInsight[];
  };
  calendar_summary: {
    total_events: number;
    next_meeting?: {
      title: string;
      start_time: string;
      duration_minutes: number;
      attendees: number;
    };
    focus_blocks: {
      start_time: string;
      duration_minutes: number;
    }[];
  };
  task_summary: {
    total_active: number;
    due_today: number;
    overdue: number;
    suggested_focus: string[];
  };
  ai_suggestions: SmartSuggestion[];
  generated_at: string;
  ai_model_used: LocalModel | CloudModel;
  cost_usd: number;
}

// =============================================================================
// FEATURE FLAGS & CONFIG
// =============================================================================

export interface Sprint3FeatureFlags {
  email_integration: boolean;
  calendar_integration: boolean;
  ai_suggestions: boolean;
  local_ai_routing: boolean;
  cost_tracking: boolean;
  learning_mode: boolean;
}

export interface Sprint3Config {
  features: Sprint3FeatureFlags;
  ai_router: AIRouterConfig;
  oauth: Partial<OAuthConfig>;
  daily_brief: DailyBriefConfig;
  cost_limits: {
    daily_usd: number;
    weekly_usd: number;
    monthly_usd: number;
  };
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    cost_usd?: number;
    processing_time_ms?: number;
    ai_model_used?: LocalModel | CloudModel;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type CreateType<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

export type UpdateType<T> = Partial<Omit<T, 'id' | 'user_id' | 'created_at'>>;

// Weather Types
export interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;
    country: string;
    timezone: string;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    wind_direction: number;
    conditions: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temp_min: number;
    temp_max: number;
    conditions: string;
    icon: string;
    precipitation_chance: number;
  }>;
  alerts?: Array<{
    title: string;
    description: string;
    severity: 'info' | 'warning' | 'severe' | 'extreme';
    start: string;
    end: string;
  }>;
}

// Maps Types
export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
  place_id?: string;
  types?: string[];
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: {
    open_now: boolean;
    periods: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  website?: string;
  formatted_phone_number?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
} 