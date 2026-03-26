// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.IDEOGRAM_API_KEY = 'test-ideogram-key';
process.env.SQUARE_ACCESS_TOKEN = 'test-square-token';
process.env.SQUARE_LOCATION_ID = 'test-location-id';
process.env.SQUARE_ENVIRONMENT = 'sandbox';
process.env.RESEND_API_KEY = 'test-resend-key';
process.env.INNGEST_EVENT_KEY = 'test-inngest-event-key';
process.env.INNGEST_SIGNING_KEY = 'test-inngest-signing-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long';
