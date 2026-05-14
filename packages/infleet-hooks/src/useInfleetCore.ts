/**
 * useInfleetCore — Generic React hook for INFLEET API access.
 * Mirrors the useBleCore pattern: injectable service, transform callback as
 * the abstraction seam, onInit for initial queries, and a request log.
 *
 * Apps wrap this in domain-specific hooks (e.g. useFleetVehicles) which
 * supply the transform and expose typed domain objects to UI screens.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { InfleetApiService } from '@infleet/core';

// Equivalent of LogEntry in @ble/core
export interface RequestLogEntry {
  id:        string;
  endpoint:  string;
  method:    string;
  status:    'pending' | 'success' | 'error';
  duration?: number;
  timestamp: Date;
}

// Per-resource loading/error/data state — replaces ConnectionState
export interface ResourceState<T> {
  data:      T | null;
  loading:   boolean;
  error:     Error | null;
  lastFetch: Date | null;
}

export interface InfleetCoreConfig {
  apiService: InfleetApiService;
  /**
   * Called once on mount — equivalent to onConnected in useBleCore.
   * Use for initial data fetches or auth validation.
   */
  onInit?: (api: InfleetApiService) => Promise<void>;
  /**
   * Global error handler — called whenever any fetch fails.
   * Equivalent to the error-direction onRawMessage callback in BLE.
   */
  onError?: (error: Error) => void;
}

export interface InfleetCoreReturn {
  /**
   * Execute any API call and store the result under `key`.
   * The transform callback is the onRawMessage equivalent:
   * it maps the raw API response to your typed domain object.
   *
   * Example:
   *   await fetch(
   *     'activeVehicles',
   *     () => apiService.getVehicles({ fleet: 'north' }),
   *     (raw) => raw.filter(v => v.vehicleStatus === 'active'),
   *   );
   */
  fetch: <TRaw, TDomain = TRaw>(
    key:       string,
    fetcher:   () => Promise<TRaw>,
    transform?: (raw: TRaw) => TDomain,
  ) => Promise<TDomain | null>;

  /** Get the current ResourceState for a named resource key */
  getState: <T>(key: string) => ResourceState<T>;

  /** Full request audit log (newest first, capped at 100) */
  log:      RequestLogEntry[];
  clearLog: () => void;
}

let idCounter = 0;
const uid = () => String(++idCounter);

export function useInfleetCore(config: InfleetCoreConfig): InfleetCoreReturn {
  const { apiService, onInit, onError } = config;

  const [states, setStates] = useState<Record<string, ResourceState<unknown>>>({});
  const [log,    setLog]    = useState<RequestLogEntry[]>([]);

  // Run onInit once on mount
  const initRan = useRef(false);
  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    if (onInit) {
      onInit(apiService).catch(e => onError?.(e instanceof Error ? e : new Error(String(e))));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetch = useCallback(async <TRaw, TDomain = TRaw>(
    key:        string,
    fetcher:    () => Promise<TRaw>,
    transform?: (raw: TRaw) => TDomain,
  ): Promise<TDomain | null> => {
    const logId = uid();
    const start = Date.now();

    // Mark as loading
    setStates((prev: Record<string, ResourceState<unknown>>) => ({
      ...prev,
      [key]: { data: prev[key]?.data ?? null, loading: true, error: null, lastFetch: null },
    }));
    setLog((prev: RequestLogEntry[]) => [{
      id: logId, endpoint: key, method: 'fetch',
      status: 'pending', timestamp: new Date(),
    }, ...prev.slice(0, 99)]);

    try {
      const raw    = await fetcher();
      const data   = transform ? transform(raw) : (raw as unknown as TDomain);
      const duration = Date.now() - start;

      setStates((prev: Record<string, ResourceState<unknown>>) => ({ ...prev, [key]: { data, loading: false, error: null, lastFetch: new Date() } }));
      setLog((prev: RequestLogEntry[]) => prev.map((e: RequestLogEntry) => e.id === logId ? { ...e, status: 'success' as const, duration } : e));

      return data;
    } catch (e) {
      const error    = e instanceof Error ? e : new Error(String(e));
      const duration = Date.now() - start;

      setStates((prev: Record<string, ResourceState<unknown>>) => ({ ...prev, [key]: { data: null, loading: false, error, lastFetch: new Date() } }));
      setLog((prev: RequestLogEntry[]) => prev.map((e: RequestLogEntry) => e.id === logId ? { ...e, status: 'error' as const, duration } : e));
      onError?.(error);

      return null;
    }
  }, [apiService, onError]);

  const getState = useCallback(<T>(key: string): ResourceState<T> => {
    return (states[key] as ResourceState<T>) ?? { data: null, loading: false, error: null, lastFetch: null };
  }, [states]);

  const clearLog = useCallback(() => setLog([]), []);

  return { fetch, getState, log, clearLog };
}
