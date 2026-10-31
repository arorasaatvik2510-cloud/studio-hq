import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [app, backend, serverTypes] = await Promise.all([
  readFile(new URL('../src/App.tsx', import.meta.url), 'utf8'),
  readFile(new URL('../backend/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('./types/appdeploy-server.d.ts', import.meta.url), 'utf8'),
]);

assert.match(app, /from ['"]@appdeploy\/client['"]/,
  'Production frontend must use the AppDeploy client package.');
assert.match(backend, /from ['"]@appdeploy\/sdk['"]/,
  'Production backend must use the AppDeploy server package.');

for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
  const path = method === 'GET' || method === 'POST' ? '/api/tasks' : '/api/tasks/:id';
  const routePattern = new RegExp(
    `'${method} ${path.replaceAll('/', '\\/')}': \\[\\s*requireAuth\\(\\)`
  );
  assert.match(backend, routePattern,
    `${method} ${path} must remain protected by requireAuth().`);
}

assert.match(serverTypes, /export function requireAuth\(\): RouterMiddleware/,
  'CI type shim must include the documented auth middleware contract.');
assert.doesNotMatch(app, /ci\/sdk-shims/,
  'Production frontend source must not import the CI adapter directly.');

console.log('AppDeploy SDK boundary and authenticated task-route contract checks passed.');
