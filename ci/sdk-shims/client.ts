type CiUser = { userId: string; email: string; name: string };
type CiTask = { id: string; title: string; done: boolean; createdAt: number };
type ApiResult<T> = { data: T };

const USER_KEY = 'studio-hq-ci.user.v1';
const TASKS_KEY = 'studio-hq-ci.tasks.v1';

function currentUser(): CiUser | null {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as CiUser) : null;
  } catch {
    return null;
  }
}

function requireUser(): CiUser {
  const user = currentUser();
  if (!user) {
    const error = new Error('Unauthorized') as Error & { status: number };
    error.status = 401;
    throw error;
  }
  return user;
}

function readTasks(userId: string): CiTask[] {
  try {
    const all = JSON.parse(localStorage.getItem(TASKS_KEY) || '{}') as Record<string, CiTask[]>;
    return Array.isArray(all[userId]) ? all[userId] : [];
  } catch {
    return [];
  }
}

function writeTasks(userId: string, tasks: CiTask[]) {
  const all = JSON.parse(localStorage.getItem(TASKS_KEY) || '{}') as Record<string, CiTask[]>;
  all[userId] = tasks;
  localStorage.setItem(TASKS_KEY, JSON.stringify(all));
}

export const auth = {
  async getUser(): Promise<CiUser | null> {
    return currentUser();
  },
  async signIn(): Promise<{ user: CiUser }> {
    const user = {
      userId: 'studio-hq-ci-user',
      email: 'ci-preview@example.invalid',
      name: 'CI Preview User',
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user };
  },
  async signInWithRedirect(): Promise<void> {
    await this.signIn();
  },
  async signOut(): Promise<void> {
    localStorage.removeItem(USER_KEY);
  },
  isSignedIn(): boolean {
    return Boolean(currentUser());
  },
};

export const api = {
  async get(path: string): Promise<ApiResult<{ tasks: CiTask[] }>> {
    const user = requireUser();
    if (path !== '/api/tasks') throw new Error('CI API route not found');
    return { data: { tasks: readTasks(user.userId) } };
  },
  async post(path: string, body?: { title?: string }): Promise<ApiResult<{ task: CiTask }>> {
    const user = requireUser();
    if (path !== '/api/tasks') throw new Error('CI API route not found');
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > 180) {
      const error = new Error('Task title must contain 1–180 characters.') as Error & { status: number };
      error.status = 400;
      throw error;
    }
    const task: CiTask = {
      id: crypto.randomUUID(),
      title,
      done: false,
      createdAt: Date.now(),
    };
    writeTasks(user.userId, [task, ...readTasks(user.userId)]);
    return { data: { task } };
  },
  async put(path: string, body?: { done?: boolean; title?: string }): Promise<ApiResult<{ task: CiTask }>> {
    const user = requireUser();
    const id = decodeURIComponent(path.replace('/api/tasks/', ''));
    const tasks = readTasks(user.userId);
    const existing = tasks.find(task => task.id === id);
    if (!existing) throw new Error('Task not found');
    const task = {
      ...existing,
      ...(typeof body?.done === 'boolean' ? { done: body.done } : {}),
      ...(typeof body?.title === 'string' ? { title: body.title.trim() } : {}),
    };
    writeTasks(user.userId, tasks.map(item => item.id === id ? task : item));
    return { data: { task } };
  },
  async delete(path: string): Promise<ApiResult<{ deleted: boolean }>> {
    const user = requireUser();
    const id = decodeURIComponent(path.replace('/api/tasks/', ''));
    const tasks = readTasks(user.userId);
    const exists = tasks.some(task => task.id === id);
    writeTasks(user.userId, tasks.filter(task => task.id !== id));
    return { data: { deleted: exists } };
  },
};

declare global {
  interface Window {
    __STUDIO_HQ_CI__?: {
      auth: typeof auth;
      api: typeof api;
    };
  }
}

if (typeof window !== 'undefined') {
  window.__STUDIO_HQ_CI__ = { auth, api };
}
