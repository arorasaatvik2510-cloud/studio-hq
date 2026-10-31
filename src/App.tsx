import { useEffect, useMemo, useState } from 'react';
import { auth, api } from '@appdeploy/client';
import './index.css';

type Task = { id: string; title: string; done: boolean; createdAt?: number };
type User = { userId: string; email?: string; name?: string };
const projects = [
  {
    id: 'fern',
    name: 'FernAlibi',
    type: 'Mystery game',
    initials: 'FA',
    color: 'amber',
    repo: 'https://github.com/arorasaatvik2510-cloud/Fernalibi-',
    app: 'https://fernalibi-qa-preview-rj67uv.v2.appdeploy.ai/',
    deploy: 'Ready · AppDeploy status checked',
    qa: 'Asset upload pending',
    detail: 'Case files, evidence board, chapter artwork',
    issues: [
      'fernalibi-main-menu.jpg is not in the deployed resource inventory',
      'Verify logo, square icon, emblem and Store Vault artwork on the live site',
    ],
  },
  {
    id: 'hollow',
    name: 'The Hollow House',
    type: 'Horror adventure',
    initials: 'HH',
    color: 'violet',
    repo: 'https://github.com/arorasaatvik2510-cloud/Hollow-house-1',
    app: 'https://the-hollow-house-seven-nights-m6nqi0.v2.appdeploy.ai/',
    deploy: 'Ready · AppDeploy status checked',
    qa: 'Visual verification pending',
    detail: 'Seven Nights · chapter progression · saved progress',
    issues: [
      'AppDeploy inventory lists the logo, sub-logo and concept collage paths',
      'Verify the images render and retest chapter progression plus saved progress',
    ],
  },
  {
    id: 'pocket',
    name: 'Pocketwise',
    type: 'Expense tracker',
    initials: 'PW',
    color: 'mint',
    repo: 'https://github.com/arorasaatvik2510-cloud/Pocket',
    app: 'https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/',
    deploy: 'Ready · security snapshot deployed',
    qa: 'Encrypted local vault',
    detail: 'Expenses, budgets, encrypted vault backup/restore, spreadsheet export and virtual savings rewards',
    issues: [
      'Vault data is encrypted in this browser; cloud database and cross-device sync are not connected',
      'CSV and Excel exports are unencrypted; real billing, AutoPay mandates and precious-metal purchases are not integrated',
      'GitHub Pages remains pending because its publishing permissions were previously blocked',
    ],
  },
];
const launchLinks = [
  {
    id: 'studio-hq',
    project: 'Studio HQ',
    kind: 'Main website',
    title: 'Studio Headquarters — Project Command Center',
    url: 'https://studio-hq-project-command-center-itfhnh.v2.appdeploy.ai/',
    status: 'Live deployment',
    statusClass: 'good',
    color: 'amber',
    initials: 'HQ',
    detail: 'Private portfolio and unified command dashboard for all three projects.',
    action: 'Open Studio HQ',
  },
  {
    id: 'fern-beta',
    project: 'FernAlibi',
    kind: 'Beta / playable preview',
    title: 'FernAlibi — current beta preview',
    url: 'https://fernalibi-qa-preview-rj67uv.v2.appdeploy.ai/',
    status: 'Upload pending · visual verification',
    statusClass: 'warn',
    color: 'amber',
    initials: 'FA',
    detail: 'Chapter art, square icon, Store Vault art and emblem JPG are present; main-menu artwork is the outstanding resource being connected.',
    action: 'Open FernAlibi preview',
  },
  {
    id: 'fern-repo',
    project: 'FernAlibi',
    kind: 'GitHub source',
    title: 'Fernalibi- repository',
    url: 'https://github.com/arorasaatvik2510-cloud/Fernalibi-',
    status: 'Source repository',
    statusClass: 'neutral',
    color: 'amber',
    initials: 'FA',
    detail: 'Current FernAlibi repository discovered in the connected GitHub account.',
    action: 'Open repository',
  },
  {
    id: 'hollow-beta',
    project: 'The Hollow House',
    kind: 'Developer beta',
    title: 'The Hollow House: Seven Nights',
    url: 'https://the-hollow-house-seven-nights-m6nqi0.v2.appdeploy.ai/',
    status: 'Visual verification pending',
    statusClass: 'warn',
    color: 'violet',
    initials: 'HH',
    detail: 'AppDeploy inventory lists the logo, sub-logo, and concept collage paths; verify that the images render in the live game.',
    action: 'Open Hollow House beta',
  },
  {
    id: 'hollow-primary-repo',
    project: 'The Hollow House',
    kind: 'Primary GitHub source',
    title: 'Hollow-house-1 — retained repository',
    url: 'https://github.com/arorasaatvik2510-cloud/Hollow-house-1',
    status: 'Primary repository',
    statusClass: 'neutral',
    color: 'violet',
    initials: 'HH',
    detail: 'The existing repository retained for the game, as requested.',
    action: 'Open primary repository',
  },
  {
    id: 'hollow-secondary-repo',
    project: 'The Hollow House',
    kind: 'Additional GitHub source',
    title: 'Hollow-house repository',
    url: 'https://github.com/arorasaatvik2510-cloud/Hollow-house',
    status: 'Additional repository',
    statusClass: 'neutral',
    color: 'violet',
    initials: 'HH',
    detail: 'A second repository also appears in the connected GitHub inventory; it is not labelled as the primary source.',
    action: 'Open additional repository',
  },
  {
    id: 'pocket-pages',
    project: 'Pocketwise',
    kind: 'Intended beta URL',
    title: 'Pocketwise GitHub Pages site',
    url: 'https://arorasaatvik2510-cloud.github.io/Pocket/',
    status: 'Pending · not verified',
    statusClass: 'warn',
    color: 'mint',
    initials: 'PW',
    detail: 'This is the intended Pages address, not a confirmed live beta. The previous publish attempt was blocked by Pages permissions.',
    action: 'Try intended URL (unverified)',
  },
  {
    id: 'pocket-pages-settings',
    project: 'Pocketwise',
    kind: 'Publishing configuration',
    title: 'GitHub Pages settings',
    url: 'https://github.com/arorasaatvik2510-cloud/Pocket/settings/pages',
    status: 'Configuration link',
    statusClass: 'neutral',
    color: 'mint',
    initials: 'PW',
    detail: 'Repository Pages settings where the deployment source and publishing configuration can be reviewed.',
    action: 'Open Pages settings',
  },
  {
    id: 'pocket-actions',
    project: 'Pocketwise',
    kind: 'Build and deployment',
    title: 'GitHub Actions workflows',
    url: 'https://github.com/arorasaatvik2510-cloud/Pocket/actions',
    status: 'Workflow link',
    statusClass: 'neutral',
    color: 'mint',
    initials: 'PW',
    detail: 'Inspect publishing workflow runs and any failed GitHub Pages deployment jobs.',
    action: 'Open workflow history',
  },
  {
    id: 'pocket-repo',
    project: 'Pocketwise',
    kind: 'GitHub source',
    title: 'Pocket repository',
    url: 'https://github.com/arorasaatvik2510-cloud/Pocket',
    status: 'Source repository',
    statusClass: 'neutral',
    color: 'mint',
    initials: 'PW',
    detail: 'Source repository for the Pocketwise expense tracker.',
    action: 'Open repository',
  },
  {
    id: 'pocket-design',
    project: 'Pocketwise',
    kind: 'Figma design',
    title: 'Expense Dashboard UI',
    url: 'https://www.figma.com/design/ikmyg68291LnTpuL2k4zvU',
    status: 'Editable design',
    statusClass: 'neutral',
    color: 'mint',
    initials: 'PW',
    detail: 'Editable Figma screen for the expense dashboard UI.',
    action: 'Open Figma design',
  },
  {
    id: 'pocket-appdeploy-beta',
    project: 'Pocketwise',
    kind: 'Live beta deployment',
    title: 'Pocketwise Expense Tracker — AppDeploy beta',
    url: 'https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/',
    status: 'Ready · local records',
    statusClass: 'good',
    color: 'mint',
    initials: 'PW',
    detail: 'Published expense tracker with local transaction records, monthly budgets, transaction filters and CSV export. Cloud sync is not connected.',
    action: 'Open Pocketwise beta',
  },
  {
    id: 'appdeploy-console',
    project: 'Platform',
    kind: 'Deployment management',
    title: 'AppDeploy dashboard',
    url: 'https://dashboard.appdeploy.ai/',
    status: 'Management console',
    statusClass: 'neutral',
    color: 'amber',
    initials: 'AD',
    detail: 'Manage AppDeploy apps, deployments, resources and account settings.',
    action: 'Open AppDeploy dashboard',
  },
];
const roadmap = [
  {
    phase: '01',
    title: 'Connect the control plane',
    note: 'Configure authenticated GitHub and AppDeploy runtime access',
    state: 'Next',
  },
  {
    phase: '02',
    title: 'Close asset gaps',
    note: 'Upload and verify required artwork for both games',
    state: 'Blocked by assets',
  },
  {
    phase: '03',
    title: 'Validate Pocketwise',
    note: 'Confirm hosting, persistence, responsive UI and transaction flows',
    state: 'Pending',
  },
  {
    phase: '04',
    title: 'Automate QA and releases',
    note: 'Show verified workflows, deployment events and regression results',
    state: 'Planned',
  },
];
const STUDIO_VAULT_KEY = 'studio-hq.encrypted-workspace-vault.v1';
const STUDIO_VAULT_PERSON = 'The Archivist';
const STUDIO_VAULT_ITERATIONS = 600000;
type StudioVaultPayload = {
  format: 'studio-hq-workspace-snapshot';
  version: 1;
  createdAt: string;
  owner: string;
  tasks: Array<{ id: string; title: string; done: boolean; createdAt?: number }>;
  projects: Array<{ id: string; name: string; type: string; deploymentStatus: string; url: string; repo: string }>;
};
type StudioVaultEnvelope = {
  format: 'studio-hq-encrypted-vault';
  version: 1;
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};
function studioVaultBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return window.btoa(binary);
}
function studioVaultBytes(value: string): Uint8Array {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
function studioVaultAad(envelope: Pick<StudioVaultEnvelope, 'format' | 'version' | 'kdf' | 'iterations' | 'salt'>): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({
    format: envelope.format, version: envelope.version, kdf: envelope.kdf,
    iterations: envelope.iterations, salt: envelope.salt,
  }));
}
function parseStudioVaultEnvelope(value: unknown): StudioVaultEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('This is not a Studio HQ encrypted archive.');
  const envelope = value as Partial<StudioVaultEnvelope>;
  if (envelope.format !== 'studio-hq-encrypted-vault' || envelope.version !== 1 ||
      envelope.kdf !== 'PBKDF2-SHA-256' || !Number.isInteger(envelope.iterations) ||
      (envelope.iterations as number) < 100000 || (envelope.iterations as number) > 1000000 ||
      typeof envelope.salt !== 'string' || typeof envelope.iv !== 'string' || typeof envelope.ciphertext !== 'string') {
    throw new Error('The encrypted archive format is unsupported or incomplete.');
  }
  const salt = studioVaultBytes(envelope.salt);
  const iv = studioVaultBytes(envelope.iv);
  const ciphertext = studioVaultBytes(envelope.ciphertext);
  if (salt.length < 16 || iv.length !== 12 || ciphertext.length < 16) throw new Error('The encrypted archive is incomplete.');
  return envelope as StudioVaultEnvelope;
}
async function studioVaultDeriveKey(passphrase: string, salt: Uint8Array, iterations = STUDIO_VAULT_ITERATIONS): Promise<CryptoKey> {
  if (!window.crypto?.subtle) throw new Error('This browser does not support the required encryption. Use an up-to-date browser over HTTPS.');
  const material = await window.crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}
async function encryptStudioVaultSnapshot(payload: StudioVaultPayload, passphrase: string): Promise<StudioVaultEnvelope> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const saltText = studioVaultBase64(salt);
  const metadata = {
    format: 'studio-hq-encrypted-vault' as const, version: 1 as const,
    kdf: 'PBKDF2-SHA-256' as const, iterations: STUDIO_VAULT_ITERATIONS,
    salt: saltText, iv: studioVaultBase64(iv),
  };
  const key = await studioVaultDeriveKey(passphrase, salt);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: studioVaultAad(metadata) },
    key, new TextEncoder().encode(JSON.stringify(payload))
  );
  return { ...metadata, ciphertext: studioVaultBase64(new Uint8Array(ciphertext)) };
}
async function decryptStudioVaultSnapshot(value: unknown, passphrase: string): Promise<{ envelope: StudioVaultEnvelope; payload: StudioVaultPayload }> {
  const envelope = parseStudioVaultEnvelope(value);
  const key = await studioVaultDeriveKey(passphrase, studioVaultBytes(envelope.salt), envelope.iterations);
  let payload: unknown;
  try {
    const plaintext = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: studioVaultBytes(envelope.iv), additionalData: studioVaultAad(envelope) },
      key, studioVaultBytes(envelope.ciphertext)
    );
    payload = JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    throw new Error('Incorrect passphrase, or encrypted archive authentication failed.');
  }
  const parsed = payload as StudioVaultPayload | null;
  if (!parsed || parsed.format !== 'studio-hq-workspace-snapshot' || parsed.version !== 1 ||
      typeof parsed.createdAt !== 'string' || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects)) {
    throw new Error('The decrypted archive has an invalid workspace data structure.');
  }
  return { envelope, payload: parsed };
}

function Icon({ children }: { children: string }) {
  return (
    <span className="icon" aria-hidden="true">
      {children}
    </span>
  );
}
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState('Security Vault');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [taskError, setTaskError] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [refreshLabel, setRefreshLabel] = useState(
    'Snapshot captured during setup'
  );

  const [vaultExists, setVaultExists] = useState(() => {
    try { return Boolean(window.localStorage.getItem(STUDIO_VAULT_KEY)); } catch { return false; }
  });
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [vaultIdentity, setVaultIdentity] = useState('');
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [vaultConfirm, setVaultConfirm] = useState('');
  const [vaultMessage, setVaultMessage] = useState('');
  const [vaultBusy, setVaultBusy] = useState(false);
  const [vaultPayload, setVaultPayload] = useState<StudioVaultPayload | null>(null);

  const completed = tasks.filter(t => t.done).length;
  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;
  const nav = [
    { name: 'Overview', icon: '◫' },
    { name: 'Projects', icon: '▦' },
    { name: 'Links & Launches', icon: '↗' },
    { name: 'Deployments & QA', icon: '⌁' },
    { name: 'Tasks', icon: '☑' },
    { name: 'Security Vault', icon: '♜' },
    { name: 'Assets', icon: '▧' },
    { name: 'Analytics', icon: '◷' },
    { name: 'Pocketwise', icon: '₹' },
    { name: 'Finance', icon: '↗' },
    { name: 'Roadmap', icon: '⇢' },
  ];
  async function loadTasks() {
    setLoadingTasks(true);
    setTaskError('');
    try {
      const res = await api.get('/api/tasks');
      setTasks(Array.isArray(res.data.tasks) ? res.data.tasks : []);
    } catch (e) {
      setTaskError(
        'Tasks could not be loaded. Confirm that you are signed in, then retry.'
      );
    } finally {
      setLoadingTasks(false);
    }
  }
  useEffect(() => {
    let alive = true;
    auth
      .getUser()
      .then(u => {
        if (alive) {
          setUser(u);
          setAuthReady(true);
          if (u) void loadTasks();
        }
      })
      .catch(() => {
        if (alive) setAuthReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  async function signIn() {
    setLoginError('');
    try {
      const result = await auth.signIn();
      setUser(result.user);
      await loadTasks();
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setLoginError(
        code === 'popup_blocked'
          ? 'Allow pop-ups to complete sign-in.'
          : code === 'popup_closed'
            ? 'Sign-in was cancelled. Try again when ready.'
            : 'Sign-in did not complete. Please retry.'
      );
    }
  }
  async function signOut() {
    await auth.signOut();
    setUser(null);
    setTasks([]);
    setVaultUnlocked(false); setVaultPassphrase(''); setVaultPayload(null);
    setSection('Security Vault');
  }
  async function addTask() {
    const title = newTask.trim();
    if (!title || addingTask) return;
    setAddingTask(true);
    setTaskError('');
    try {
      const res = await api.post('/api/tasks', { title });
      setTasks(old => [res.data.task, ...old]);
      setNewTask('');
    } catch {
      setTaskError('Could not save this task. Please retry.');
    } finally {
      setAddingTask(false);
    }
  }
  async function toggleTask(task: Task) {
    try {
      const res = await api.put('/api/tasks/' + encodeURIComponent(task.id), {
        done: !task.done,
      });
      setTasks(old => old.map(t => (t.id === task.id ? res.data.task : t)));
    } catch {
      setTaskError('Task update failed. Your previous state has been kept.');
    }
  }
  async function deleteTask(task: Task) {
    try {
      await api.delete('/api/tasks/' + encodeURIComponent(task.id));
      setTasks(old => old.filter(t => t.id !== task.id));
    } catch {
      setTaskError('Task could not be deleted. Please retry.');
    }
  }

  function makeStudioVaultPayload(): StudioVaultPayload {
    return {
      format: 'studio-hq-workspace-snapshot',
      version: 1,
      createdAt: new Date().toISOString(),
      owner: user.email || user.name || 'Studio HQ owner',
      tasks: tasks.map(task => ({ id: task.id, title: task.title, done: task.done, ...(task.createdAt ? { createdAt: task.createdAt } : {}) })),
      projects: projects.map(project => ({
        id: project.id, name: project.name, type: project.type,
        deploymentStatus: project.deploy, url: project.app, repo: project.repo,
      })),
    };
  }
  async function createStudioVault() {
    setVaultMessage('');
    if (vaultPassphrase.length < 12) { setVaultMessage('Use at least 12 characters for the vault passphrase.'); return; }
    if (vaultPassphrase !== vaultConfirm) { setVaultMessage('The passphrases do not match.'); return; }
    setVaultBusy(true);
    try {
      const payload = makeStudioVaultPayload();
      const envelope = await encryptStudioVaultSnapshot(payload, vaultPassphrase);
      window.localStorage.setItem(STUDIO_VAULT_KEY, JSON.stringify(envelope));
      setVaultExists(true); setVaultUnlocked(true); setVaultPayload(payload); setVaultConfirm('');
      setVaultMessage('Encrypted workspace archive created. The passphrase is not stored.');
    } catch (error) {
      setVaultMessage(error instanceof Error ? error.message : 'Could not create the encrypted archive.');
    } finally { setVaultBusy(false); }
  }
  async function unlockStudioVault() {
    setVaultMessage('');
    if (vaultIdentity.trim().toLowerCase() !== STUDIO_VAULT_PERSON.toLowerCase()) {
      setVaultMessage('Access denied. The assigned keeper identity is The Archivist.');
      return;
    }
    setVaultBusy(true);
    try {
      const raw = window.localStorage.getItem(STUDIO_VAULT_KEY);
      if (!raw) throw new Error('No encrypted workspace archive exists in this browser.');
      const opened = await decryptStudioVaultSnapshot(JSON.parse(raw), vaultPassphrase);
      setVaultPayload(opened.payload); setVaultUnlocked(true);
      setVaultMessage('Access granted to The Archivist for this session.');
    } catch (error) {
      setVaultMessage(error instanceof Error ? error.message : 'Could not unlock the archive.');
    } finally { setVaultBusy(false); }
  }
  async function sealStudioVault() {
    setVaultMessage('');
    if (!vaultUnlocked || !vaultPassphrase) { setVaultMessage('Unlock the vault first.'); return; }
    setVaultBusy(true);
    try {
      const payload = makeStudioVaultPayload();
      const envelope = await encryptStudioVaultSnapshot(payload, vaultPassphrase);
      window.localStorage.setItem(STUDIO_VAULT_KEY, JSON.stringify(envelope));
      setVaultPayload(payload);
      setVaultMessage('Current visible tasks and project links were sealed into a new encrypted snapshot.');
    } catch (error) {
      setVaultMessage(error instanceof Error ? error.message : 'Could not seal the current workspace.');
    } finally { setVaultBusy(false); }
  }
  function exportStudioVault() {
    try {
      if (!vaultUnlocked) throw new Error('Unlock the vault before exporting.');
      const raw = window.localStorage.getItem(STUDIO_VAULT_KEY);
      if (!raw) throw new Error('Create and seal the vault before exporting.');
      const envelope = parseStudioVaultEnvelope(JSON.parse(raw));
      const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'studio-hq-encrypted-workspace-vault.json';
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setVaultMessage('Encrypted archive downloaded. It still requires the passphrase.');
    } catch (error) {
      setVaultMessage(error instanceof Error ? error.message : 'Could not export the encrypted archive.');
    }
  }
  async function importStudioVault(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setVaultMessage('');
    try {
      if (!vaultUnlocked || !vaultPassphrase) throw new Error('Unlock the vault before importing an archive.');
      const imported = await decryptStudioVaultSnapshot(JSON.parse(await file.text()), vaultPassphrase);
      if (!window.confirm('Load this encrypted archive into the vault? Live workspace tasks will not be changed.')) return;
      window.localStorage.setItem(STUDIO_VAULT_KEY, JSON.stringify(imported.envelope));
      setVaultPayload(imported.payload); setVaultMessage('Archive loaded into the vault preview. Live tasks were not modified.');
    } catch (error) {
      setVaultMessage(error instanceof Error ? error.message : 'Could not restore the encrypted archive.');
    } finally { event.target.value = ''; }
  }
  function lockStudioVault() {
    setVaultUnlocked(false); setVaultPassphrase(''); setVaultConfirm('');
    setVaultIdentity(''); setVaultPayload(null);
    setVaultMessage('Vault locked. The keeper identity and passphrase are required again.');
  }
  useEffect(() => {
    if (!vaultUnlocked) return;
    const lockWhenHidden = () => {
      if (document.visibilityState === 'hidden') {
        setVaultUnlocked(false); setVaultPassphrase(''); setVaultConfirm('');
        setVaultIdentity(''); setVaultPayload(null);
      }
    };
    document.addEventListener('visibilitychange', lockWhenHidden);
    return () => document.removeEventListener('visibilitychange', lockWhenHidden);
  }, [vaultUnlocked]);

  const activeIssues = useMemo(
    () => projects.reduce((n, p) => n + p.issues.length, 0),
    []
  );
  if (!authReady)
    return (
      <main className="boot">
        <div className="brand-mark">S</div>
        <p>Preparing your workspace…</p>
      </main>
    );
  if (!user)
    return (
      <main className="login-shell">
        <div className="login-grid"></div>
        <section className="login-card">
          <div className="brand-lockup">
            <div className="brand-mark">S</div>
            <div>
              <b>STUDIO HQ</b>
              <small>PROJECT COMMAND CENTER</small>
            </div>
          </div>
          <div className="eyebrow">YOUR PROJECTS. ONE CONTROL ROOM.</div>
          <h1>
            Build boldly.
            <br />
            <span>Ship with clarity.</span>
          </h1>
          <p className="login-copy">
            A private workspace for FernAlibi, The Hollow House, and Pocketwise
            — with verified status, QA follow-ups, tasks and a release roadmap.
          </p>
          <div className="login-projects">
            {projects.map(p => (
              <div className="login-project" key={p.id}>
                <span className={'project-glyph ' + p.color}>{p.initials}</span>
                <div>
                  <b>{p.name}</b>
                  <small>{p.type}</small>
                </div>
                <span className="tiny-dot" />
              </div>
            ))}
          </div>
          <button className="primary wide" onClick={signIn}>
            <Icon>↗</Icon> Sign in to workspace
          </button>
          {loginError && <p className="error">{loginError}</p>}
          <p className="legal-note">
            Sign-in is required. Project status in this first release is an
            explicitly labelled snapshot until runtime integrations are
            configured.
          </p>
        </section>
        <div className="login-footer">
          STUDIO HQ <span>•</span> PRIVATE WORKSPACE <span>•</span> BUILD 0.1
        </div>
      </main>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">S</div>
          <div>
            <b>STUDIO HQ</b>
            <small>PROJECT COMMAND CENTER</small>
          </div>
        </div>
        <div className="workspace-label">
          WORKSPACE <span className="online-dot" />{' '}
        </div>
        <div className="workspace-pill">
          <div className="workspace-avatar">
            {(user.name || user.email || 'S').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <b>My Studio</b>
            <small>Owner workspace</small>
          </div>
          <span className="chevron">⌄</span>
        </div>
        <nav>
          {nav.map(n => (
            <button
              key={n.name}
              className={'nav-item ' + (section === n.name ? 'selected' : '')}
              onClick={() => setSection(n.name)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.name}
              {n.name === 'Tasks' && tasks.length > 0 && (
                <span className="nav-count">
                  {tasks.filter(t => !t.done).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sync-card">
            <div className="sync-head">
              <span className="pulse-dot" /> <b>Integration bridge</b>
            </div>
            <p>Runtime credentials not configured</p>
            <div className="sync-line">
              <span>GitHub</span>
              <b className="muted-status">Link only</b>
            </div>
            <div className="sync-line">
              <span>AppDeploy</span>
              <b className="muted-status">Snapshot</b>
            </div>
            <button
              className="text-button"
              onClick={() => setSection('Deployments & QA')}
            >
              Review connection plan ↗
            </button>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">
              {(user.name || user.email || 'S').slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-text">
              <b>{user.name || 'Workspace owner'}</b>
              <small>{user.email || 'Signed in'}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={signOut}
            >
              ↪
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Studio <span>/</span> <b>{section}</b>
          </div>
          <div className="top-actions">
            <span className="snapshot-pill">
              <span className="amber-dot" /> Snapshot data
            </span>
            <button
              className="icon-button"
              aria-label="Refresh tasks"
              onClick={() => {
                void loadTasks();
                setRefreshLabel(
                  'Tasks refreshed just now; integrations remain unconfigured'
                );
              }}
            >
              ⟳
            </button>
            <div className="top-avatar">
              {(user.name || user.email || 'S').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                SATURDAY, 24 OCTOBER 2026{' '}
                <span className="heading-divider">/</span> WORKSPACE OVERVIEW
              </div>
              <h1>
                {section === 'Overview' ? 'Good to see you back.' : section}
                <span className="heading-period">.</span>
              </h1>
              <p>
                {section === 'Overview'
                  ? "Three products, one view. Here's what needs attention next."
                  : 'A focused view of your projects, current evidence, and next steps.'}
              </p>
            </div>
            <button className="secondary" onClick={() => setSection('Tasks')}>
              <Icon>＋</Icon> Add a task
            </button>
          </div>
          {section === 'Overview' && (
            <>
              <div className="notice">
                <div className="notice-icon">i</div>
                <div>
                  <b>
                    Initial audit complete — live integrations still need setup.
                  </b>
                  <p>
                    Statuses below reflect the connected-account inspection, not
                    a continuous live feed. No deployment or finance figures are
                    fabricated.
                  </p>
                </div>
                <button onClick={() => setSection('Deployments & QA')}>
                  View audit <span>↗</span>
                </button>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-label">
                    PROJECTS DISCOVERED <span>↗</span>
                  </div>
                  <div className="metric-value">
                    03 <small>projects</small>
                  </div>
                  <div className="metric-foot">
                    <span className="green-text">2</span> AppDeploy deployments
                    found
                  </div>
                  <div className="mini-bars">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">
                    OPEN ASSET WARNINGS <span>⌁</span>
                  </div>
                  <div className="metric-value">
                    {activeIssues.toString().padStart(2, '0')}{' '}
                    <small>items</small>
                  </div>
                  <div className="metric-foot">
                    <span className="amber-text">Action required</span> across
                    the project set
                  </div>
                  <div className="metric-ring">
                    <span>!</span>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">
                    TASK COMPLETION <span>☑</span>
                  </div>
                  <div className="metric-value">
                    {progress}
                    <small>%</small>
                  </div>
                  <div className="metric-foot">
                    {completed} of {tasks.length} workspace tasks completed
                  </div>
                  <div className="progress-track">
                    <i style={{ width: progress + '%' }} />
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">
                    RUNTIME CONNECTIONS <span>⌘</span>
                  </div>
                  <div className="metric-value">
                    00 <small>/ 03</small>
                  </div>
                  <div className="metric-foot">
                    <span className="muted-text">Not configured</span> for live
                    dashboard access
                  </div>
                  <div className="connection-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
              <div className="section-title">
                <div>
                  <h2>Your projects</h2>
                  <p>
                    Each project stays independent. Open its app or source
                    repository.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setSection('Projects')}
                >
                  All projects ↗
                </button>
              </div>
              <div className="project-grid">
                {projects.map(p => (
                  <article className="project-card" key={p.id}>
                    <div className="project-card-top">
                      <span className={'project-glyph ' + p.color}>
                        {p.initials}
                      </span>
                      <button
                        className="icon-button"
                        aria-label={'Open ' + p.name + ' links'}
                        onClick={() => setSection('Projects')}
                      >
                        ···
                      </button>
                    </div>
                    <div className="project-name-row">
                      <h3>{p.name}</h3>
                      <span
                        className={
                          'status-tag ' +
                          (p.deploy.startsWith('Ready') ? 'good' : 'neutral')
                        }
                      >
                        {p.deploy.startsWith('Ready')
                          ? '● Ready'
                          : '○ Unverified'}
                      </span>
                    </div>
                    <p className="project-type">{p.type}</p>
                    <p className="project-desc">{p.detail}</p>
                    <div className="project-card-bottom">
                      <span
                        className={
                          'qa-status ' +
                          (p.qa === 'Asset warnings'
                            ? 'warning'
                            : 'muted-status')
                        }
                      >
                        ◈ {p.qa}
                      </span>
                      <div className="project-links">
                        <a href={p.repo} target="_blank" rel="noreferrer">
                          Repository ↗
                        </a>
                        {p.app && (
                          <a href={p.app} target="_blank" rel="noreferrer">
                            Open app ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="lower-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Next up</h2>
                      <p>Workspace tasks saved to your signed-in account</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setSection('Tasks')}
                    >
                      View all ↗
                    </button>
                  </div>
                  {tasks.slice(0, 4).length ? (
                    tasks.slice(0, 4).map(t => (
                      <div className="task-row" key={t.id}>
                        <button
                          className={'task-check ' + (t.done ? 'checked' : '')}
                          onClick={() => void toggleTask(t)}
                        >
                          {t.done ? '✓' : ''}
                        </button>
                        <span className={t.done ? 'task-done' : ''}>
                          {t.title}
                        </span>
                        <button
                          className="quiet-delete"
                          onClick={() => void deleteTask(t)}
                          aria-label="Delete task"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">☑</div>
                      <b>No workspace tasks yet</b>
                      <span>Add your first follow-up to track it here.</span>
                      <button
                        className="secondary small"
                        onClick={() => setSection('Tasks')}
                      >
                        Create a task
                      </button>
                    </div>
                  )}
                </section>
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Release roadmap</h2>
                      <p>Priority sequence for the control center</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setSection('Roadmap')}
                    >
                      Full roadmap ↗
                    </button>
                  </div>
                  {roadmap.slice(0, 3).map(r => (
                    <div className="roadmap-row" key={r.phase}>
                      <span className="roadmap-phase">{r.phase}</span>
                      <div>
                        <b>{r.title}</b>
                        <small>{r.note}</small>
                      </div>
                      <span className="roadmap-state">{r.state}</span>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}
          {section === 'Projects' && (
            <div className="project-list">
              {projects.map(p => (
                <article className="project-detail-card" key={p.id}>
                  <div className="project-detail-head">
                    <span className={'project-glyph ' + p.color}>
                      {p.initials}
                    </span>
                    <div>
                      <h2>{p.name}</h2>
                      <p>
                        {p.type} · {p.detail}
                      </p>
                    </div>
                    <span
                      className={
                        'status-tag ' +
                        (p.deploy.startsWith('Ready') ? 'good' : 'neutral')
                      }
                    >
                      {p.deploy}
                    </span>
                  </div>
                  <div className="detail-links">
                    <a href={p.repo} target="_blank" rel="noreferrer">
                      ↗ Source repository
                    </a>
                    {p.app ? (
                      <a href={p.app} target="_blank" rel="noreferrer">
                        ↗ Open deployed app
                      </a>
                    ) : (
                      <span>Deployment URL not verified</span>
                    )}
                  </div>
                  <h4>Current follow-ups</h4>
                  {p.issues.map(i => (
                    <div className="issue-row" key={i}>
                      <span className="amber-dot" />
                      {i}
                    </div>
                  ))}
                </article>
              ))}
            </div>
          )}
          {section === 'Deployments & QA' && (
            <>
              <div className="notice">
                <div className="notice-icon">!</div>
                <div>
                  <b>
                    Runtime API access has not been connected to this dashboard.
                  </b>
                  <p>
                    GitHub and AppDeploy links work, but the deployed website
                    cannot query those services using ChatGPT's connection. Add
                    credentials through secure configuration before enabling
                    continuous status polling.
                  </p>
                </div>
              </div>
              <div className="project-list">
                {projects.map(p => (
                  <article className="project-detail-card" key={p.id}>
                    <div className="project-detail-head">
                      <span className={'project-glyph ' + p.color}>
                        {p.initials}
                      </span>
                      <div>
                        <h2>{p.name}</h2>
                        <p>{p.deploy}</p>
                      </div>
                      <span
                        className={
                          'status-tag ' +
                          (p.qa === 'Asset warnings' ? 'warn' : 'neutral')
                        }
                      >
                        {p.qa}
                      </span>
                    </div>
                    {p.issues.map(i => (
                      <div className="issue-row" key={i}>
                        <span className="amber-dot" />
                        {i}
                      </div>
                    ))}
                    <div className="detail-links">
                      <a href={p.repo} target="_blank" rel="noreferrer">
                        Repository ↗
                      </a>
                      {p.app && (
                        <a href={p.app} target="_blank" rel="noreferrer">
                          AppDeploy preview ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              <p className="footnote">
                QA baseline: latest available AppDeploy status snapshots from
                the initial inspection. This dashboard has not independently
                rerun the games' end-to-end test suites.
              </p>
            </>
          )}
          {section === 'Tasks' && (
            <section className="panel tasks-panel">
              <div className="panel-heading">
                <div>
                  <h2>Workspace tasks</h2>
                  <p>
                    Stored in the authenticated workspace, separate from each
                    app's data.
                  </p>
                </div>
                <span className="status-tag neutral">
                  {completed}/{tasks.length} complete
                </span>
              </div>
              <form
                className="task-form"
                onSubmit={e => {
                  e.preventDefault();
                  void addTask();
                }}
              >
                <input
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="Add a follow-up, e.g. upload Hollow House logo…"
                  maxLength={180}
                />
                <button
                  className="primary"
                  disabled={!newTask.trim() || addingTask}
                >
                  {addingTask ? 'Saving…' : 'Add task'}
                </button>
              </form>
              {taskError && <p className="error">{taskError}</p>}
              {loadingTasks ? (
                <p className="footnote">Loading saved tasks…</p>
              ) : tasks.length ? (
                tasks.map(t => (
                  <div className="task-row full-task" key={t.id}>
                    <button
                      className={'task-check ' + (t.done ? 'checked' : '')}
                      onClick={() => void toggleTask(t)}
                    >
                      {t.done ? '✓' : ''}
                    </button>
                    <span className={t.done ? 'task-done' : ''}>{t.title}</span>
                    <span className="task-date">
                      {t.done ? 'Complete' : 'Open'}
                    </span>
                    <button
                      className="quiet-delete"
                      onClick={() => void deleteTask(t)}
                      aria-label="Delete task"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">＋</div>
                  <b>Your task list is clear</b>
                  <span>Add tasks to build your own release checklist.</span>
                </div>
              )}
            </section>
          )}
          {section === 'Links & Launches' && (
            <>
              <div className="notice">
                <div className="notice-icon">↗</div>
                <div>
                  <b>Launchpad refreshed on 24 October 2026.</b>
                  <p>
                    Green statuses indicate a deployed destination. Amber statuses flag missing assets or
                    a URL that has not been verified as a live beta. Pocketwise's Pages URL remains pending.
                  </p>
                </div>
              </div>
              <div className="link-hub-grid">
                {launchLinks.map(link => (
                  <article className="launch-link-card" key={link.id}>
                    <div className="launch-link-top">
                      <span className={'project-glyph ' + link.color}>
                        {link.initials}
                      </span>
                      <span className={'status-tag ' + link.statusClass}>
                        {link.status}
                      </span>
                    </div>
                    <div className="launch-link-eyebrow">
                      {link.project} <span>/</span> {link.kind}
                    </div>
                    <h3>{link.title}</h3>
                    <p>{link.detail}</p>
                    <a
                      className="launch-link-action"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.action} ↗
                    </a>
                  </article>
                ))}
              </div>
              <p className="footnote">
                These are link and deployment snapshots, not continuous uptime monitoring. Missing game artwork remains open,
                and the Pocketwise GitHub Pages destination must be confirmed before it is advertised as a final beta.
              </p>
            </>
          )}
          {section === 'Assets' && (
            <div className="project-list">
              {projects.map(p => (
                <article className="project-detail-card" key={p.id}>
                  <div className="project-detail-head">
                    <span className={'project-glyph ' + p.color}>
                      {p.initials}
                    </span>
                    <div>
                      <h2>{p.name}</h2>
                      <p>Resource audit · latest available snapshot</p>
                    </div>
                    <span className="status-tag warn">
                      {p.issues.length} follow-ups
                    </span>
                  </div>
                  {p.issues.map(i => (
                    <div className="issue-row" key={i}>
                      <span className="amber-dot" />
                      {i}
                    </div>
                  ))}
                  <p className="footnote">
                    This is a record of known QA warnings, not a fresh scan of
                    all asset files.
                  </p>
                </article>
              ))}
            </div>
          )}
          {section === 'Analytics' && (
            <>
              <div className="notice">
                <div className="notice-icon">i</div>
                <div>
                  <b>Usage analytics are not connected yet.</b>
                  <p>
                    No visitor counts, retention rates, or performance metrics
                    are being estimated or invented. Connect a supported
                    analytics source to populate this page.
                  </p>
                </div>
              </div>
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-label">APP DEPLOYMENTS FOUND</div>
                  <div className="metric-value">02</div>
                  <div className="metric-foot">
                    Observed in AppDeploy inventory
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">REPOSITORIES FOUND</div>
                  <div className="metric-value">04</div>
                  <div className="metric-foot">
                    Visible in connected GitHub account
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">LIVE TELEMETRY</div>
                  <div className="metric-value">—</div>
                  <div className="metric-foot">
                    Not configured in this website
                  </div>
                </div>
              </div>
              <section className="panel">
                <h2>Integration coverage</h2>
                <p className="panel-subtitle">
                  Known resources are visible; runtime polling still requires
                  separate credentials.
                </p>
                {[
                  {
                    name: 'GitHub',
                    desc: 'Repository links verified',
                    pct: 45,
                  },
                  {
                    name: 'AppDeploy',
                    desc: 'Two deployed apps discovered',
                    pct: 45,
                  },
                  {
                    name: 'Netlify',
                    desc: 'No connected runtime source verified',
                    pct: 0,
                  },
                  {
                    name: 'Analytics',
                    desc: 'Provider not configured',
                    pct: 0,
                  },
                ].map(x => (
                  <div className="coverage-row" key={x.name}>
                    <div>
                      <b>{x.name}</b>
                      <small>{x.desc}</small>
                    </div>
                    <div className="coverage-track">
                      <i style={{ width: x.pct + '%' }} />
                    </div>
                    <span>{x.pct ? 'Partial' : 'Pending'}</span>
                  </div>
                ))}
              </section>
            </>
          )}
          {section === 'Pocketwise' && (
            <>
              <section className="pocketwise-hero">
                <div className="pocketwise-hero-copy">
                  <div className="pocketwise-eyebrow">
                    <span className="pocketwise-pulse" />
                    POCKETWISE / EXPENSE MANAGEMENT
                  </div>
                  <h2>Make every rupee count.</h2>
                  <p>
                    Your expense tracker is now part of Studio HQ. Add income
                    and expenses, review monthly budgets, filter transactions
                    and export a CSV backup without leaving this workspace.
                  </p>
                  <div className="pocketwise-hero-tags">
                    <span>Expense + income</span>
                    <span>Budget tracking</span>
                    <span>CSV export</span>
                  </div>
                </div>
                <div className="pocketwise-hero-action">
                  <span className="pocketwise-live-chip">BETA DEPLOYMENT READY</span>
                  <a
                    className="pocketwise-open-button"
                    href="https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open standalone app ↗
                  </a>
                  <a
                    className="pocketwise-quiet-link"
                    href="https://github.com/arorasaatvik2510-cloud/Pocket"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View source repository
                  </a>
                </div>
              </section>

              <div className="pocketwise-benefit-grid">
                <article className="pocketwise-benefit">
                  <span className="pocketwise-benefit-icon mint">↘</span>
                  <div>
                    <b>Daily money activity</b>
                    <small>Log expenses and income with category and date.</small>
                  </div>
                </article>
                <article className="pocketwise-benefit">
                  <span className="pocketwise-benefit-icon amber">◎</span>
                  <div>
                    <b>Monthly budget</b>
                    <small>Track spending against a target you set.</small>
                  </div>
                </article>
                <article className="pocketwise-benefit">
                  <span className="pocketwise-benefit-icon violet">⇩</span>
                  <div>
                    <b>Portable records</b>
                    <small>Export a CSV backup for your own files.</small>
                  </div>
                </article>
              </div>

              <div className="pocketwise-data-note">
                <span className="pocketwise-note-icon">i</span>
                <div>
                  <b>Your data boundary</b>
                  <p>
                    The beta stores records in the Pocketwise app browser
                    storage on this device. Studio HQ does not read or import
                    personal transaction records, and cloud sync/account access
                    is not connected. If the embedded view is blocked by browser
                    policy, open the standalone app above.
                  </p>
                </div>
              </div>

              <section className="pocketwise-embed-shell">
                <div className="pocketwise-embed-head">
                  <div>
                    <span className="pocketwise-embed-kicker">WORKSPACE APP</span>
                    <h3>Pocketwise Expense Tracker</h3>
                    <p>Embedded beta · browser-local records</p>
                  </div>
                  <a
                    className="pocketwise-embed-external"
                    href="https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in new tab ↗
                  </a>
                </div>
                <iframe
                  className="pocketwise-iframe"
                  title="Pocketwise Expense Tracker Beta"
                  src="https://pocketwise-expense-tracker-beta-gz9icz.v2.appdeploy.ai/"
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-forms allow-downloads allow-modals allow-same-origin"
                />
              </section>
              <p className="footnote">
                Integration status: the deployed Pocketwise beta is embedded
                here with a direct-link fallback. This is not a cloud-connected
                ledger and no real bank data is read.
              </p>
            </>
          )}
          {section === 'Security Vault' && (
            <section className="panel" style={{ marginBottom: 22 }}>
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">RESTRICTED WORKSPACE ARCHIVE</div>
                  <h2>Security Vault</h2>
                  <p>Assigned keeper: <strong>The Archivist</strong> · AES-GCM 256-bit encryption</p>
                </div>
                <span className="status-tag">{vaultUnlocked ? 'UNLOCKED' : vaultExists ? 'LOCKED' : 'NOT SET UP'}</span>
              </div>
              <p className="panel-subtitle">The vault stores an encrypted snapshot of the visible task list and project links. It does not store API keys, session credentials, or financial records. Importing an archive never overwrites live workspace tasks.</p>
              {!vaultExists ? (
                <form className="task-form" onSubmit={event => { event.preventDefault(); void createStudioVault(); }}>
                  <input aria-label="Create vault passphrase" type="password" value={vaultPassphrase} onChange={event => setVaultPassphrase(event.target.value)} minLength={12} maxLength={256} autoComplete="new-password" placeholder="Create passphrase (12+ characters)" required />
                  <input aria-label="Confirm vault passphrase" type="password" value={vaultConfirm} onChange={event => setVaultConfirm(event.target.value)} minLength={12} maxLength={256} autoComplete="new-password" placeholder="Confirm passphrase" required />
                  <button className="primary" type="submit" disabled={vaultBusy}>{vaultBusy ? 'Securing…' : 'Create encrypted vault'}</button>
                </form>
              ) : !vaultUnlocked ? (
                <form className="task-form" onSubmit={event => { event.preventDefault(); void unlockStudioVault(); }}>
                  <input aria-label="Keeper identity" type="text" value={vaultIdentity} onChange={event => setVaultIdentity(event.target.value)} autoComplete="username" placeholder="Keeper identity" required />
                  <input aria-label="Vault passphrase" type="password" value={vaultPassphrase} onChange={event => setVaultPassphrase(event.target.value)} autoComplete="current-password" placeholder="Vault passphrase" required />
                  <button className="primary" type="submit" disabled={vaultBusy}>{vaultBusy ? 'Checking…' : 'Unlock vault'}</button>
                </form>
              ) : (
                <>
                  <div className="task-form" style={{ marginBottom: 16 }}>
                    <button className="primary" type="button" onClick={() => void sealStudioVault()} disabled={vaultBusy}>Seal current workspace</button>
                    <button className="secondary" type="button" onClick={exportStudioVault}>Download encrypted backup</button>
                    <label className="secondary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: 9, cursor: 'pointer' }}>
                      Import encrypted archive
                      <input type="file" accept="application/json,.json" onChange={importStudioVault} style={{ display: 'none' }} />
                    </label>
                    <button className="secondary" type="button" onClick={lockStudioVault}>Lock vault</button>
                  </div>
                  {vaultPayload && (
                    <div className="finance-placeholder">
                      <h3>Encrypted archive opened</h3>
                      <p>Snapshot from {new Date(vaultPayload.createdAt).toLocaleString()} · {vaultPayload.tasks.length} task records · {vaultPayload.projects.length} project links.</p>
                      <ul style={{ textAlign: 'left', paddingLeft: 20 }}>
                        {vaultPayload.tasks.slice(0, 12).map(task => <li key={task.id}>{task.done ? '✓ ' : '○ '}{task.title}</li>)}
                      </ul>
                      {vaultPayload.tasks.length > 12 && <p>Showing the first 12 tasks in this preview.</p>}
                      <p className="footnote">This is a read-only archive preview. To update the live task list, use the Tasks section.</p>
                    </div>
                  )}
                </>
              )}
              {vaultMessage && <p className="error" role="status" aria-live="polite">{vaultMessage}</p>}
              <p className="footnote">Your passphrase exists only in this unlocked page session and is never uploaded. The archive is stored locally in this browser; this is not a cloud vault or a security certification.</p>
            </section>
          )}
          {section === 'Finance' && (
            <>
              <div className="notice">
                <div className="notice-icon">i</div>
                <div>
                  <b>Finance data is not connected.</b>
                  <p>
                    Pocketwise is a separate expense tracker. No bank account,
                    transaction history, or personal financial records have been
                    imported into Studio HQ.
                  </p>
                </div>
              </div>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Pocketwise finance panel</h2>
                    <p>
                      Integration status only — no financial totals are shown.
                    </p>
                  </div>
                  <a
                    className="secondary small link-button"
                    href="https://github.com/arorasaatvik2510-cloud/Pocket"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Pocket repo ↗
                  </a>
                </div>
                <div className="finance-placeholder">
                  <div className="finance-symbol">₹</div>
                  <h3>Ready for a verified connection</h3>
                  <p>
                    Connect Pocketwise's approved data interface before showing
                    expenses, category breakdowns, budgets, or trends. Demo data
                    is intentionally disabled.
                  </p>
                </div>
              </section>
            </>
          )}
          {section === 'Roadmap' && (
            <div className="roadmap-full">
              {roadmap.map((r, i) => (
                <article className="roadmap-card" key={r.phase}>
                  <div className="roadmap-phase large">{r.phase}</div>
                  <div className="roadmap-content">
                    <span className="eyebrow">PHASE {r.phase}</span>
                    <h2>{r.title}</h2>
                    <p>{r.note}</p>
                    <div className="roadmap-state-full">{r.state}</div>
                  </div>
                  <span className="roadmap-connector">
                    {i === roadmap.length - 1 ? '◎' : '↓'}
                  </span>
                </article>
              ))}
            </div>
          )}
          <footer className="page-footer">
            <span>
              STUDIO HQ <span className="footer-dot">•</span> PRIVATE PROJECT
              WORKSPACE
            </span>
            <span>{refreshLabel}</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
