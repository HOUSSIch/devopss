export type ApiPerformanceMetric = {
  method: string;
  url: string;
  status?: number;
  durationMs: number;
  timestamp: string;
};

export type AppPerformanceSnapshot = {
  loadTimeMs?: number;
  domContentLoadedMs?: number;
  apiRequests: ApiPerformanceMetric[];
};

declare global {
  interface Window {
    __deepskynPerformanceMetrics__?: AppPerformanceSnapshot;
  }
}

const getMetricsStore = () => {
  if (typeof window === "undefined") {
    return {
      apiRequests: [] as ApiPerformanceMetric[],
    } satisfies AppPerformanceSnapshot;
  }

  window.__deepskynPerformanceMetrics__ ??= {
    apiRequests: [],
  };

  return window.__deepskynPerformanceMetrics__;
};

export function recordAppLoadTime() {
  if (typeof window === "undefined") {
    return;
  }

  const metricsStore = getMetricsStore();
  const navigationEntry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

  if (navigationEntry) {
    metricsStore.loadTimeMs = Math.round(navigationEntry.duration);
    metricsStore.domContentLoadedMs = Math.round(
      navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime
    );
    return;
  }

  const timeOrigin = window.performance.timing;

  if (timeOrigin) {
    metricsStore.loadTimeMs = timeOrigin.loadEventEnd - timeOrigin.navigationStart;
    metricsStore.domContentLoadedMs = timeOrigin.domContentLoadedEventEnd - timeOrigin.navigationStart;
  }
}

export function recordApiPerformanceMetric(metric: Omit<ApiPerformanceMetric, "timestamp">) {
  if (typeof window === "undefined") {
    return;
  }

  const metricsStore = getMetricsStore();
  metricsStore.apiRequests.push({
    ...metric,
    timestamp: new Date().toISOString(),
  });
}

export function getPerformanceMetrics() {
  return getMetricsStore();
}