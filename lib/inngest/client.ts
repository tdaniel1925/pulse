import { Inngest } from 'inngest';

/**
 * Inngest client for PulseAgent
 * Used by all background jobs
 */
export const inngest = new Inngest({
  id: 'pulseagent',
  name: 'PulseAgent',
});
