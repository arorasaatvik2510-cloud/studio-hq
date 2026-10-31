declare module '@appdeploy/sdk' {
  export interface AppDeployUser {
    userId: string;
    email?: string;
    name?: string;
    scope?: string;
  }
  export interface RouterContext {
    body: unknown;
    query: Record<string, string>;
    params: Record<string, string>;
    event: unknown;
    user?: AppDeployUser;
  }
  export type RouterMiddleware = (context: RouterContext) => unknown | Promise<unknown>;
  export function router(routes: Record<string, RouterMiddleware[]>): (event: unknown) => Promise<unknown>;
  export function json(data: unknown, status?: number): unknown;
  export function error(message: string, status?: number): unknown;
  export function requireAuth(): RouterMiddleware;
  export const db: {
    list<T = Record<string, unknown>>(table: string, options?: { limit?: number; nextToken?: string }): Promise<{ items: Array<T & { id: string }>; nextToken?: string }>;
    get<T = Record<string, unknown>>(table: string, ids: string[]): Promise<Array<T | null>>;
    add(table: string, records: Array<Record<string, unknown>>): Promise<Array<string | null>>;
    update(table: string, items: Array<{ id: string; record: Record<string, unknown> }>): Promise<boolean[]>;
    delete(table: string, ids: string[]): Promise<boolean[]>;
  };
  export const ws: {
    send(connectionIds: string | string[], payload: unknown): Promise<{ ok: boolean; accepted?: boolean; send_id?: string; gone?: boolean; error?: string }>;
  };
}
