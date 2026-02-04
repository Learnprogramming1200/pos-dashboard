import { generateUUID, generateCorrelationId } from './uuid';

// Simple test to verify UUID generation
describe('UUID Generation', () => {
  test('generateUUID should generate valid UUID format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuid).toMatch(uuidRegex);
  });

  test('generateUUID should generate unique UUIDs', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  test('generateCorrelationId should generate valid correlation ID format', () => {
    const correlationId = generateCorrelationId();
    expect(correlationId).toMatch(/^corr_[a-z0-9]+$/);
  });

  test('generateCorrelationId should generate unique IDs', () => {
    const id1 = generateCorrelationId();
    const id2 = generateCorrelationId();
    expect(id1).not.toBe(id2);
  });
});

