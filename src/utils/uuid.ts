/**
 * Generate a UUID v4 for correlation IDs and other unique identifiers
 * This is a simple implementation that generates RFC 4122 compliant UUIDs
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Generate a shorter correlation ID for payment tracking
 * This is useful when you need a shorter identifier
 */
export const generateCorrelationId = (): string => {
  return 'corr_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

