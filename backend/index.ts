import { router, json, error, requireAuth, db } from '@appdeploy/sdk';

function tableFor(userId: string) {
  const safe = userId.replace(/[^a-zA-Z0-9_.-]/g, '_');
  return 'studio_tasks_' + safe;
}

export const handler = router({
  'GET /api/health': [async () => json({ ok: true, service: 'studio-hq' })],
  'GET /api/tasks': [
    requireAuth(),
    async ctx => {
      const { items } = await db.list(tableFor(ctx.user!.userId), {
        limit: 100,
      });
      return json({ tasks: items });
    },
  ],
  'POST /api/tasks': [
    requireAuth(),
    async ctx => {
      const body = (ctx.body || {}) as { title?: unknown };
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title || title.length > 180)
        return error('Task title must contain 1–180 characters.', 400);
      const createdAt = Date.now();
      const [id] = await db.add(tableFor(ctx.user!.userId), [
        { title, done: false, createdAt },
      ]);
      if (!id)
        return error('Task could not be saved. Retry the operation.', 503);
      return json({ task: { id, title, done: false, createdAt } }, 201);
    },
  ],
  'PUT /api/tasks/:id': [
    requireAuth(),
    async ctx => {
      const body = (ctx.body || {}) as { title?: unknown; done?: unknown };
      const table = tableFor(ctx.user!.userId);
      const [current] = await db.get<Record<string, unknown>>(table, [
        ctx.params.id,
      ]);
      if (!current) return error('Task not found.', 404);
      const title =
        typeof body.title === 'string' ? body.title.trim() : current.title;
      const done = typeof body.done === 'boolean' ? body.done : current.done;
      if (typeof title !== 'string' || !title.trim() || title.length > 180)
        return error('Invalid task title.', 400);
      const [updated] = await db.update(table, [
        { id: ctx.params.id, record: { ...current, title, done } },
      ]);
      if (!updated) return error('Task update failed.', 503);
      return json({
        task: { id: ctx.params.id, title, done, createdAt: current.createdAt },
      });
    },
  ],
  'DELETE /api/tasks/:id': [
    requireAuth(),
    async ctx => {
      const [deleted] = await db.delete(tableFor(ctx.user!.userId), [
        ctx.params.id,
      ]);
      if (!deleted) return error('Task not found or already removed.', 404);
      return json({ deleted: true });
    },
  ],
});
