import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    console.log('Hello World function start');
    await step.sleep('wait-a-moment', '1s');
    console.log('Hello World function end');
    return { message: `Hello ${event.data.email}!` };
  }
);
