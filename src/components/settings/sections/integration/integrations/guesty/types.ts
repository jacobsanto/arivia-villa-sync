export interface ApiUsage {
  id: string;
  endpoint: string;
  rate_limit: number;
  remaining: number;
  timestamp: string;
  reset?: string;
  status?: number;
}

export interface RateLimitError extends ApiUsage {
  status: number;
  method?: string;
  listing_id?: string;
}

export interface IntegrationHealthData {
  id?: string;
  provider: string;
  status: string;
  last_synced?: string;
  last_bookings_synced?: string;
  is_rate_limited?: boolean;
  last_error?: string;
  created_at?: string;
  updated_at: string;
  remaining_requests?: number;
  rate_limit_reset?: string;
  request_count?: number;
  endpoint_stats?: Record<string, any>;
  last_successful_endpoint?: string;
}

export interface SyncHistory {
  id: string;
  provider: string;
  entities_synced: number;
  sync_type: 'listings' | 'bookings';
  status: 'success' | 'partial' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface GuestyStatusBadgeProps {
  status?: string;
}

export interface GuestySyncControlsProps {
  onTest: () => void;
  onSync: () => void;
  onSyncBookings?: () => void;
  isTesting: boolean;
  isSyncing: boolean;
  isSyncingBookings?: boolean;
  isConnected: boolean;
}

// Define MonitorData interface to match the data structure returned by useGuestyMonitor
export interface MonitorData {
  isConnected: boolean;
  lastListingSync?: any | null;
  lastBookingsWebhook?: any | null;
  totalListings: number;
  totalBookings: number;
  logs: any[];
  avgSyncDuration: number | null;
  hasRecentRateLimits: boolean;
  rateLimitErrors: RateLimitError[];
}
