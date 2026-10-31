declare module '@appdeploy/client' {
  export interface AppDeployUser {
    userId: string;
    email?: string;
    name?: string;
    scope?: string;
  }
  export const auth: {
    getUser(): Promise<AppDeployUser | null>;
    signIn(): Promise<{ user: AppDeployUser }>;
    signInWithRedirect(options?: { scope?: string }): Promise<void>;
    signOut(): Promise<void>;
    isSignedIn(): boolean;
  };
  export const api: {
    get(url: string, data?: unknown): Promise<{ data: any }>;
    post(url: string, data?: unknown): Promise<{ data: any }>;
    put(url: string, data?: unknown): Promise<{ data: any }>;
    delete(url: string, data?: unknown): Promise<{ data: any }>;
  };
}
