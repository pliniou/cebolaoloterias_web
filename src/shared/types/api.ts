/**
 * Tipos TypeScript para entidades da API Django
 * Correspondem aos models e serializers do backend
 */

// ============================================================================
// LOTTERIES
// ============================================================================

export interface Lottery {
    id: number;
    name: string;
    slug: string;
    api_identifier: string;
    description: string;
    numbers_count: number;
    min_number: number;
    max_number: number;
    color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PrizeTier {
    id: number;
    tier: number;
    description: string;
    matches: number | null;
    winners_count: number;
    prize_value: string; // Decimal como string
}

export interface Draw {
    id: number;
    lottery: number; // FK
    lottery_details?: Lottery; // Nested quando incluído
    number: number;
    draw_date: string; // ISO date
    numbers: number[];
    numbers_draw_order: number[] | null;
    is_accumulated: boolean;
    accumulated_value: string; // Decimal como string
    next_draw_estimate: string;
    total_revenue: string;
    location: string;
    city_state: string;
    next_draw_number: number | null;
    next_draw_date: string | null;
    prize_tiers?: PrizeTier[]; // Nested quando incluído
    created_at: string;
    updated_at: string;
}

// ============================================================================
// TICKETS (User Bets)
// ============================================================================

export interface UserBetLine {
    id: number;
    ticket: number; // FK
    numbers: number[];
    order: number;
    created_at: string;
}

export interface UserTicket {
    id: number;
    user: number; // FK
    lottery: number; // FK
    lottery_details?: Lottery;
    name: string;
    numbers_per_bet: number;
    is_active: boolean;
    bet_lines?: UserBetLine[];
    lines_count?: number;
    created_at: string;
    updated_at: string;
}

export interface LineCheckResult {
    id: number;
    bet_line: number; // FK
    hits: number;
    hit_numbers: number[];
    prize_tier: number | null; // FK
    prize_value: string;
}

export interface TicketCheckResult {
    id: number;
    ticket: number; // FK
    draw: number; // FK
    checked_at: string;
    total_prize: string;
    best_tier: number | null;
    best_hits: number;
    winning_lines_count: number;
    line_results?: LineCheckResult[];
}

// ============================================================================
// GENERATOR
// ============================================================================

export interface PresetConfig {
    min_sum?: number;
    max_sum?: number;
    min_even?: number;
    max_even?: number;
    min_odd?: number;
    max_odd?: number;
    min_prime?: number;
    max_prime?: number;
    fixed_numbers?: number[];
    excluded_numbers?: number[];
    [key: string]: unknown; // Permite campos adicionais
}

export interface Preset {
    id: number;
    user: number; // FK
    lottery: number; // FK
    lottery_details?: Lottery;
    name: string;
    description: string;
    config: PresetConfig;
    created_at: string;
    updated_at: string;
}

export interface GeneratedGame {
    numbers: number[];
    sum: number;
    even_count: number;
    odd_count: number;
    prime_count: number;
}

export interface GeneratorRun {
    id: number;
    user: number; // FK
    preset: number | null; // FK
    lottery: number; // FK
    count: number;
    result: GeneratedGame[];
    created_at: string;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface DrawStatistics {
    id: number;
    draw: number; // FK
    draw_details?: Draw;
    sum_total: number;
    range_amplitude: number;
    even_count: number;
    odd_count: number;
    prime_count: number;
    consecutive_count: number;
    repeated_from_previous: number;
    created_at: string;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface User {
    id: number;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    date_joined: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface RefreshTokenRequest {
    refresh: string;
}

export interface RefreshTokenResponse {
    access: string;
}

// ============================================================================
// API RESPONSES (Paginação Django REST Framework)
// ============================================================================

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiError {
    detail?: string;
    [key: string]: unknown;
}

// ============================================================================
// REQUEST PAYLOADS
// ============================================================================

export interface CreateTicketRequest {
    lottery: number;
    name?: string;
    numbers_per_bet: number;
    bet_lines: {
        numbers: number[];
        order: number;
    }[];
}

export interface CheckTicketRequest {
    draw_id: number;
}

export interface GenerateGamesRequest {
    lottery_id: number;
    count: number;
    preset_id?: number;
    config?: PresetConfig;
}

export interface CreatePresetRequest {
    lottery: number;
    name: string;
    description?: string;
    config: PresetConfig;
}
