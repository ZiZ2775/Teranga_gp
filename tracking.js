/**
 * Teranga GP - Event Tracking System
 * Tracks user interactions and application events for analytics
 */

class EventTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.isOnline = navigator.onLine;
    this.startTime = Date.now();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackEvent(eventName, eventData = {}) {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      data: eventData,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp_ms: Date.now()
    };

    this.events.push(event);
    
    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📊 Event: ${eventName}`, event);
    }

    // Send event to analytics if online
    if (this.isOnline && this.events.length % 5 === 0) {
      this.flushEvents();
    }

    return event;
  }

  async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      // Send to Supabase analytics table
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            events: eventsToSend,
            batch_id: `batch_${Date.now()}`
          })
        }
      ).catch(() => null);

      if (response && response.ok) {
        console.log(`✅ Flushed ${eventsToSend.length} events`);
      }
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Re-add events to queue for retry
      this.events = [...eventsToSend, ...this.events];
    }
  }

  handleOnline() {
    this.isOnline = true;
    console.log('📡 Back online - flushing events');
    this.flushEvents();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('📡 Offline - events queued');
  }

  // Convenience methods for common events
  trackPageView(pageTitle) {
    return this.trackEvent('page_view', {
      title: pageTitle,
      path: window.location.pathname
    });
  }

  trackClick(elementInfo) {
    return this.trackEvent('click', {
      element: elementInfo,
      timestamp: Date.now()
    });
  }

  trackFormSubmit(formName, success = true) {
    return this.trackEvent('form_submit', {
      form: formName,
      success
    });
  }

  trackError(errorMessage, errorType = 'unknown') {
    return this.trackEvent('error', {
      message: errorMessage,
      type: errorType,
      stack: new Error().stack
    });
  }

  trackPerformance(metricName, duration) {
    return this.trackEvent('performance', {
      metric: metricName,
      duration_ms: duration
    });
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      uptime_ms: Date.now() - this.startTime,
      eventCount: this.events.length,
      isOnline: this.isOnline
    };
  }
}

// Global tracker instance
const tracker = new EventTracker();

// Auto-track page views
tracker.trackPageView(document.title);

// Auto-track unhandled errors
window.addEventListener('error', (event) => {
  tracker.trackError(event.message, 'uncaught_error');
});

// Auto-track unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  tracker.trackError(event.reason, 'unhandled_rejection');
});

// Flush events before page unload
window.addEventListener('beforeunload', () => {
  tracker.flushEvents();
});

// Export for use in modules
export function trackEvent(eventName, eventData = {}) {
  return tracker.trackEvent(eventName, eventData);
}

export function getSessionInfo() {
  return tracker.getSessionInfo();
}

export default tracker;
