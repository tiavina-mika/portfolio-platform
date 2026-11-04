'use client';

import { useReportWebVitals } from 'next/web-vitals';

const WebVitals = () => {
  useReportWebVitals((metric) => {
    window.gtag?.('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_delta: metric.delta,
    });
  });

  return null;
};

export default WebVitals;
