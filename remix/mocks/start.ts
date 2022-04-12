// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from 'msw/node';

import '~/utils';

const server = setupServer();

server.listen({ onUnhandledRequest: 'warn' });
// eslint-disable-next-line no-console
console.info('🔶 Mock server running');

process.once('SIGINT', () => server.close());
process.once('SIGTERM', () => server.close());
