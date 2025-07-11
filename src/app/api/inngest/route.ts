import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { distributeCreditsDaily, helloWorld } from '../../../inngest/functions';

/**
 * Inngest route
 *
 * https://www.inngest.com/docs/getting-started/nextjs-quick-start
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, distributeCreditsDaily],
});
