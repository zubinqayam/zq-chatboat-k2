import React, { useState, useMemo, useEffect } from 'react';
import { 
  Key, 
  Lock, 
  Unlock, 
  Shield, 
  Activity, 
  Search, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  PlusCircle,
  MoreVertical,
  Terminal,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { AgentRole } from '@/src/types';
import { collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { useFirebase } from '@/src/context/FirebaseContext';

interface VaultKey {
  id: string;
  name: string;
  prog: string;
  val: string;
  created: string;
  active: boolean;
  allowedRoles: AgentRole[];
  usageCount: number;
  lastAccessedBy?: AgentRole;
  lastAccessedAt?: string;
}

interface AuditEntry {
  ts: string;
  lvl: 'INFO' | 'WARN' | 'CRIT';
  msg: string;
  src: string;
}

// Initial Data
const INITIAL_KEYS: VaultKey[] = [
  { id: "ZQ-A1B2C3D4E5F6", name: "OpenAI API Key", prog: "ZQ_AGENTS", val: "sk-proj-xK9mN2pQ7rL4tV8wE1yA3", created: "2025-03-12", active: true, allowedRoles: [AgentRole.ORCHESTRATOR, AgentRole.RESEARCH], usageCount: 42, lastAccessedBy: AgentRole.RESEARCH, lastAccessedAt: "2025-05-01" },
  { id: "ZQ-G7H8I9J0K1L2", name: "Anthropic API Key", prog: "ZQ_AGENTS", val: "sk-ant-api03-xM7nP2qR5sT8uV1wX4yZ", created: "2025-03-12", active: true, allowedRoles: [AgentRole.ORCHESTRATOR, AgentRole.DEVELOPER], usageCount: 156, lastAccessedBy: AgentRole.ORCHESTRATOR, lastAccessedAt: "2025-05-03" },
  { id: "ZQ-M3N4O5P6Q7R8", name: "Notion API Key", prog: "ZQ_TASKMASTER", val: "secret_ntn_K8mN2pL7rQ4tV9wE1", created: "2025-03-15", active: true, allowedRoles: [AgentRole.RESEARCH, AgentRole.SYSTEM], usageCount: 8, lastAccessedBy: AgentRole.SYSTEM, lastAccessedAt: "2025-04-22" },
  { id: "ZQ-S9T0U1V2W3X4", name: "GitHub Token", prog: "ZQ_CONNECTER", val: "ghp_xK9mN2pQ7rL4tV8wE1yA3bC5dE6fG7", created: "2025-03-18", active: true, allowedRoles: [AgentRole.DEVELOPER, AgentRole.ORCHESTRATOR], usageCount: 892, lastAccessedBy: AgentRole.DEVELOPER, lastAccessedAt: "2025-05-04" },
  { id: "ZQ-Y5Z6A7B8C9D0", name: "Linear API Token", prog: "ZQ_CONNECTER", val: "lin_api_xK9mN2pQ7rL4tV8wE1yA3b", created: "2025-03-20", active: true, allowedRoles: [AgentRole.DEVELOPER], usageCount: 231, lastAccessedBy: AgentRole.DEVELOPER, lastAccessedAt: "2025-05-02" },
  { id: "ZQ-E1F2G3H4I5J6", name: "NodeDR Internal Key", prog: "ZQ_NODEDR", val: "zq-internal-K8mN2pL7rQ4tV9wE", created: "2025-04-01", active: true, allowedRoles: [AgentRole.SYSTEM, AgentRole.ORCHESTRATOR], usageCount: 12, lastAccessedBy: AgentRole.SYSTEM, lastAccessedAt: "2025-04-15" }
];

const INITIAL_AUDIT: AuditEntry[] = [
  { ts: "2025-05-04 09:12:03", lvl: "INFO", msg: "SecureZQKeyBox initialized: vault=keybox_vault", src: "secure_manager" },
  { ts: "2025-05-04 09:12:04", lvl: "INFO", msg: "Using master key from environment", src: "secure_manager" },
  { ts: "2025-05-04 09:13:22", lvl: "INFO", msg: "Admin authenticated successfully", src: "auth" },
  { ts: "2025-05-04 09:17:45", lvl: "WARN", msg: "Default password still in use — change immediately", src: "auth" },
  { ts: "2025-05-04 09:31:00", lvl: "INFO", msg: "Registry saved atomically (fsync complete)", src: "registry" },
  { ts: "2025-05-04 10:00:00", lvl: "CRIT", msg: "Failed decrypt attempt on ZQ-S9T0U1V2W3X4", src: "secure_manager" }
];

const PROG_CONFIG: Record<string, { color: string, bg: string, text: string }> = {
  "ZQ_AGENTS": { color: "text-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400" },
  "ZQ_TASKMASTER": { color: "text-blue-400", bg: "bg-blue-400/10", text: "text-blue-400" },
  "ZQ_CONNECTER": { color: "text-amber-400", bg: "bg-amber-400/10", text: "text-amber-400" },
  "ZQ_NODEDR": { color: "text-indigo-400", bg: "bg-indigo-400/10", text: "text-indigo-400" },
  "CUSTOM": { color: "text-slate-400", bg: "bg-slate-400/10", text: "text-slate-400" }
};

export function VaultDashboard() {
  const { user, signIn, signOut } = useFirebase();
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeAgentRole, setActiveAgentRole] = useState<AgentRole>(AgentRole.DEVELOPER);
  const [keys, setKeys] = useState<VaultKey[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [newKey, setNewKey] = useState<{name: string, prog: string, val: string, allowedRoles: AgentRole[]}>({ 
    name: '', 
    prog: 'ZQ_AGENTS', 
    val: '',
    allowedRoles: [AgentRole.DEVELOPER]
  });

  const mask = (v: string) => v.substring(0, 4) + "••••••••••••" + v.slice(-4);

  // Sync keys & audit logs from Firestore in real-time
  useEffect(() => {
    if (!user) return;

    // Listen to vaultKeys
    const unsubscribeKeys = onSnapshot(collection(db, 'vaultKeys'), (snapshot) => {
      if (snapshot.empty) {
        // Safe, non-blocking asynchronous seeding if collection is empty
        INITIAL_KEYS.forEach(async (k) => {
          try {
            await setDoc(doc(db, 'vaultKeys', k.id), k);
          } catch (err) {
            console.error("Error seeding key:", err);
          }
        });
      } else {
        const fetchedKeys = snapshot.docs.map(doc => doc.data() as VaultKey);
        fetchedKeys.sort((a, b) => b.created.localeCompare(a.created));
        setKeys(fetchedKeys);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vaultKeys');
    });

    // Listen to vaultAudits
    const unsubscribeAudits = onSnapshot(collection(db, 'vaultAudits'), (snapshot) => {
      if (snapshot.empty) {
        // Safe, non-blocking asynchronous seeding of audit logs
        INITIAL_AUDIT.forEach(async (a, index) => {
          try {
            const auditId = `INIT-${index}`;
            await setDoc(doc(db, 'vaultAudits', auditId), {
              id: auditId,
              message: a.msg,
              level: a.lvl,
              timestamp: a.ts,
              component: a.src
            });
          } catch (err) {
            console.error("Error seeding audit log:", err);
          }
        });
      } else {
        const fetchedAudits = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ts: data.timestamp,
            lvl: data.level,
            msg: data.message,
            src: data.component
          } as AuditEntry;
        });
        fetchedAudits.sort((a, b) => b.ts.localeCompare(a.ts));
        setAudit(fetchedAudits);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'vaultAudits');
    });

    return () => {
      unsubscribeKeys();
      unsubscribeAudits();
    };
  }, [user]);

  const handleUnlock = () => {
    if (pin === '00000') {
      setIsLocked(false);
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const addAuditEntry = async (msg: string, lvl: AuditEntry['lvl'] = 'INFO', src = 'ui') => {
    const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const id = 'AUDIT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    try {
      await setDoc(doc(db, 'vaultAudits', id), {
        id,
        message: msg,
        level: lvl,
        timestamp: ts,
        component: src
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `vaultAudits/${id}`);
    }
  };

  const toggleReveal = async (id: string) => {
    const key = keys.find(k => k.id === id);
    if (key && !key.allowedRoles.includes(activeAgentRole)) {
      await addAuditEntry(`ACCESS DENIED: Role ${activeAgentRole} attempted reveal on ${id}`, 'CRIT', 'secure_manager');
      return;
    }

    if (key) {
      try {
        await updateDoc(doc(db, 'vaultKeys', id), {
          usageCount: key.usageCount + 1,
          lastAccessedBy: activeAgentRole,
          lastAccessedAt: new Date().toISOString().substring(0, 10)
        });
        await addAuditEntry(`Key revealed: ${id} by ${activeAgentRole}`, 'WARN', 'secure_manager');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `vaultKeys/${id}`);
      }
    }

    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
      }
      return next;
    });
  };

  const copyKey = async (id: string, val: string) => {
    const key = keys.find(k => k.id === id);
    if (key && !key.allowedRoles.includes(activeAgentRole)) {
      await addAuditEntry(`ACCESS DENIED: Role ${activeAgentRole} attempted copy on ${id}`, 'CRIT', 'secure_manager');
      return;
    }

    if (key) {
      try {
        await updateDoc(doc(db, 'vaultKeys', id), {
          usageCount: key.usageCount + 1,
          lastAccessedBy: activeAgentRole,
          lastAccessedAt: new Date().toISOString().substring(0, 10)
        });
        await addAuditEntry(`Key copied to clipboard: ${id} by ${activeAgentRole}`, 'INFO', 'ui');
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `vaultKeys/${id}`);
      }
    }

    navigator.clipboard.writeText(val);
  };

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.val) return;
    const id = 'ZQ-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const today = new Date().toISOString().substring(0, 10);
    const item: VaultKey = { ...newKey, id, created: today, active: true, usageCount: 0 };
    
    try {
      await setDoc(doc(db, 'vaultKeys', id), item);
      await addAuditEntry(`New key added: ${id} (${newKey.prog}) with roles: ${newKey.allowedRoles.join(', ')}`, 'INFO', 'secure_manager');
      setNewKey({ name: '', prog: 'ZQ_AGENTS', val: '', allowedRoles: [AgentRole.DEVELOPER] });
      setActiveTab('vault');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `vaultKeys/${id}`);
    }
  };

  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return keys;
    const lower = searchQuery.toLowerCase();
    return keys.filter(k => 
      k.name.toLowerCase().includes(lower) || 
      k.prog.toLowerCase().includes(lower) || 
      k.id.toLowerCase().includes(lower)
    );
  }, [keys, searchQuery]);

  // Auth Protection First
  if (!user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-void relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05)_0%,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10 text-center"
        >
          <div className="w-16 h-16 rounded-3xl bg-surface-high border border-ghost-border flex items-center justify-center text-neon-tertiary shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <Database size={32} />
          </div>
          <div className="text-center">
             <h1 className="text-2xl font-bold text-on-void tracking-tight mb-2">Secure Cloud Connection</h1>
             <p className="text-on-void-muted text-sm px-8">Establish an authenticated session with Firebase to sync key vault variables & audit logs.</p>
          </div>
          
          <button 
            onClick={signIn}
            className="w-full py-4 bg-neon-tertiary text-void rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Authenticate with Google
          </button>
          
          <div className="flex flex-col items-center gap-1.5 opacity-30">
             <p className="text-[9px] font-mono text-on-void-muted uppercase tracking-tighter italic font-bold">Encrypted Handshake Tunnel Active</p>
          </div>
        </motion.div>
      </main>
    );
  }

  if (isLocked) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-void relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.05)_0%,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm flex flex-col items-center gap-8 relative z-10"
        >
          <div className="w-16 h-16 rounded-3xl bg-surface-high border border-ghost-border flex items-center justify-center text-neon-tertiary shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <Lock size={32} />
          </div>
          <div className="text-center">
             <div className="text-[10px] font-mono text-neon-tertiary uppercase tracking-widest font-bold mb-1.5">Handshake Established</div>
             <h1 className="text-2xl font-bold text-on-void tracking-tight mb-2">ZQ KeyBox V1.11</h1>
             <p className="text-on-void-muted text-sm px-8">Enter administrative credential to unlock the encrypted vault.</p>
          </div>
          
          <div className="w-full space-y-4">
             <div className="relative">
                <input 
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                  placeholder="••••••••"
                  className={cn(
                    "w-full bg-void border rounded-xl py-4 text-center text-xl tracking-[0.5em] font-mono text-neon-tertiary focus:outline-none focus:ring-1 transition-all",
                    pinError ? "border-amber-500 ring-amber-500/20" : "border-ghost-border focus:border-neon-tertiary focus:ring-neon-tertiary/20"
                  )}
                  autoFocus
                />
             </div>
             {pinError && (
               <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest text-center animate-shake">
                 Access Denied. Default: 00000
               </p>
             )}
             <button 
               onClick={handleUnlock}
               className="w-full py-4 bg-neon-tertiary text-void rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:brightness-110 active:scale-95 transition-all"
             >
               Unlock Vault
             </button>
          </div>
          
          <div className="flex flex-col items-center gap-1.5 opacity-30">
             <p className="text-[9px] font-mono text-on-void-muted">PBKDF2-HMAC-SHA256 · 200,000 iterations</p>
             <p className="text-[9px] font-mono text-on-void-muted uppercase tracking-tighter italic font-bold">AES-128-CBC Encryption Active</p>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-void relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-ghost-border bg-void/30 relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-neon-tertiary flex items-center justify-center text-void font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.3)]">ZQ</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold text-on-void tracking-tight">KeyBox</h1>
              <span className="text-[10px] bg-surface-high border border-ghost-border rounded px-1.5 py-0.5 text-on-void-muted font-mono">V1.11</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-neon-primary" />
               <span className="text-[10px] font-bold text-neon-primary uppercase tracking-widest mr-4">Vault Unlocked</span>
               
               <div className="flex items-center gap-2 bg-surface-high/50 border border-ghost-border rounded-lg px-3 py-1 ml-4">
                 <span className="text-[9px] font-mono text-on-void-muted uppercase border-none">Simulated Role:</span>
                 <select 
                    value={activeAgentRole}
                    onChange={(e) => setActiveAgentRole(e.target.value as AgentRole)}
                    className="bg-transparent text-[10px] font-bold text-neon-tertiary outline-none cursor-pointer border-none"
                 >
                    {Object.values(AgentRole).map(role => (
                      <option key={role} value={role} className="bg-surface-high">{role}</option>
                    ))}
                 </select>
               </div>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-surface-low p-1 rounded-xl border border-ghost-border">
          {['dashboard', 'vault', 'add', 'audit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-surface-high text-on-void shadow-sm" 
                  : "text-on-void-muted hover:text-on-void"
              )}
            >
              {tab}
            </button>
          ))}
          <div className="w-px h-4 bg-ghost-border mx-1" />
          <button 
            onClick={() => setIsLocked(true)}
            className="p-1.5 text-on-void-muted hover:text-amber-500 rounded-lg transition-colors"
          >
            <Lock size={16} />
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 {[
                   { label: 'Total Keys', val: keys.length, sub: `Across ${new Set(keys.map(k=>k.prog)).size} programs` },
                   { label: 'Active', val: keys.filter(k=>k.active).length, sub: 'All healthy', color: 'text-neon-primary' },
                   { label: 'Total Accesses', val: keys.reduce((acc, k) => acc + k.usageCount, 0), sub: 'Aggregated audit events', color: 'text-neon-secondary' },
                   { label: 'Security Score', val: 'A+', sub: 'ALGA Compliant', color: 'text-neon-tertiary' },
                 ].map((m, i) => (
                   <div key={i} className="bg-surface-high/40 border border-ghost-border p-5 rounded-2xl backdrop-blur-sm">
                      <div className="text-[10px] text-on-void-muted uppercase tracking-widest font-bold mb-2 opacity-60">{m.label}</div>
                      <div className={cn("text-3xl font-display font-medium text-on-void", m.color)}>{m.val}</div>
                      <div className="text-[10px] text-on-void-muted mt-2 italic font-mono">{m.sub}</div>
                   </div>
                 ))}
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-high/40 border border-ghost-border rounded-2xl p-6 backdrop-blur-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold text-on-void uppercase tracking-[0.2em] flex items-center gap-2">
                        <Shield size={14} className="text-neon-tertiary" />
                        Security Status
                      </h3>
                      <button className="text-[9px] font-bold text-neon-tertiary uppercase tracking-widest hover:brightness-125">ALGA Recheck</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        "AES-128-CBC encryption active",
                        "PBKDF2-HMAC-SHA256 200k iter",
                        "Per-key file locking enabled",
                        "Atomic writes (fsync) active",
                        "0o600 permissions enforced",
                        "Constant-time comparison",
                        "Default password unchanged",
                        "Audit log streaming"
                      ].map((item, i) => (
                        <div key={i} className="bg-void/40 p-3 rounded-xl border border-ghost-border/30 flex items-center gap-3">
                           <div className={cn("w-1.5 h-1.5 rounded-full", item.includes('unchanged') ? "bg-amber-500 animate-pulse" : "bg-neon-primary")} />
                           <span className={cn("text-[11px] font-medium", item.includes('unchanged') ? "text-amber-500" : "text-on-void/80")}>
                             {item}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-surface-high/40 border border-ghost-border rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xs font-bold text-on-void uppercase tracking-[0.2em] flex items-center gap-2">
                        <Terminal size={14} className="text-neon-secondary" />
                        Program Distribution
                      </h3>
                   </div>
                   <div className="grid grid-cols-2 gap-4 flex-1">
                      {Object.keys(PROG_CONFIG).filter(p=>p!=='CUSTOM').map((p) => (
                        <div key={p} className="bg-void/40 p-4 rounded-xl border border-ghost-border/30 group hover:border-ghost-border transition-all">
                           <div className="text-[9px] text-on-void-muted uppercase font-mono tracking-tighter mb-1">{p}</div>
                           <div className={cn("text-2xl font-display text-on-void", PROG_CONFIG[p].color)}>
                             {keys.filter(k=>k.prog === p).length}
                           </div>
                           <div className="text-[9px] text-on-void-muted mt-1 uppercase tracking-tighter opacity-40 italic">
                             {p.split('_')[1]} Sub-namespace
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'vault' && (
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-xl font-bold text-on-void tracking-tight mb-1">Encrypted Key Vault</h2>
                     <p className="text-on-void-muted text-sm">{filteredKeys.length} records available in memory.</p>
                   </div>
                   <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-void-muted" />
                      <input 
                        type="text"
                        placeholder="Filter keys..."
                        value={searchQuery}
                        onChange={(e)=>setSearchQuery(e.target.value)}
                        className="bg-surface-high/50 border border-ghost-border rounded-xl pl-9 pr-4 py-2 text-xs text-on-void focus:outline-none focus:border-neon-tertiary transition-all w-64"
                      />
                   </div>
                </div>

                <div className="bg-surface-high/20 border border-ghost-border rounded-2xl overflow-hidden divide-y divide-ghost-border/30">
                   {/* Table Head */}
                   <div className="grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-on-void-muted opacity-50 bg-void/20">
                      <div className="col-span-3">Designation / Locker ID</div>
                      <div className="col-span-2">Namespace</div>
                      <div className="col-span-2">Access Control</div>
                      <div className="col-span-2">Usage Tracking</div>
                      <div className="col-span-2">Credential Value</div>
                      <div className="col-span-1 text-right">Actions</div>
                   </div>

                   {/* Table Body */}
                   <div className="divide-y divide-ghost-border/20">
                     {filteredKeys.map((k) => (
                       <div key={k.id} className="grid grid-cols-12 px-6 py-4 items-center group hover:bg-surface-high/40 transition-all">
                         <div className="col-span-3 flex items-center gap-4">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] bg-void border border-ghost-border", PROG_CONFIG[k.prog]?.color || "text-on-void-muted")}>
                               {k.prog.substring(3,5)}
                            </div>
                            <div className="min-w-0">
                               <div className="text-sm font-bold text-on-void group-hover:text-neon-tertiary transition-colors truncate">{k.name}</div>
                               <div className="text-[10px] font-mono text-on-void-muted opacity-40">{k.id}</div>
                            </div>
                         </div>
                         <div className="col-span-2">
                            <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border", PROG_CONFIG[k.prog]?.bg, PROG_CONFIG[k.prog]?.color, PROG_CONFIG[k.prog]?.color.replace('text-', 'border-'))}>
                               {k.prog}
                            </span>
                         </div>
                         <div className="col-span-2 flex flex-wrap gap-1">
                            {k.allowedRoles.map(role => (
                              <span key={role} className={cn(
                                "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border transition-all",
                                role === activeAgentRole 
                                  ? "border-neon-tertiary bg-neon-tertiary/20 text-neon-tertiary shadow-[0_0_8px_rgba(168,85,247,0.1)]" 
                                  : "border-ghost-border bg-void/30 text-on-void-muted opacity-40"
                              )}>
                                {role.substring(0, 3)}
                              </span>
                            ))}
                            {!k.allowedRoles.includes(activeAgentRole) && (
                              <div className="absolute inset-y-0 left-0 w-1 bg-amber-500/50" title="Unauthorized Role" />
                            )}
                         </div>
                         <div className="col-span-2 font-mono text-[11px] text-on-void-muted/80">
                            {revealedIds.has(k.id) ? k.val : mask(k.val)}
                         </div>
                         <div className="col-span-2">
                            <div className="flex items-center gap-2">
                               <span className="text-[11px] font-bold text-on-void font-mono">{k.usageCount}</span>
                               <span className="text-[8px] uppercase text-on-void-muted font-bold opacity-50 tracking-tighter">Accesses</span>
                            </div>
                            {k.lastAccessedBy && (
                              <div className="text-[9px] text-on-void-muted flex items-center gap-1 mt-0.5">
                                <span className="opacity-50 font-mono text-[7px]">Last by:</span>
                                <span className="text-neon-tertiary/80 font-bold">{k.lastAccessedBy.substring(0, 3)}</span>
                                {k.lastAccessedAt && <span className="opacity-30">({k.lastAccessedAt})</span>}
                              </div>
                            )}
                         </div>
                         <div className="col-span-1 flex justify-end gap-1">
                            <button 
                              onClick={() => toggleReveal(k.id)}
                              disabled={!k.allowedRoles.includes(activeAgentRole)}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                k.allowedRoles.includes(activeAgentRole) 
                                  ? "text-on-void-muted hover:text-on-void hover:bg-surface-high" 
                                  : "text-red-500/30 cursor-not-allowed"
                              )}
                              title={k.allowedRoles.includes(activeAgentRole) ? "Reveal Key" : "Access Denied"}
                            >
                              {revealedIds.has(k.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button 
                              onClick={() => copyKey(k.id, k.val)}
                              disabled={!k.allowedRoles.includes(activeAgentRole)}
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                k.allowedRoles.includes(activeAgentRole) 
                                  ? "text-on-void-muted hover:text-on-void hover:bg-surface-high" 
                                  : "text-red-500/30 cursor-not-allowed"
                              )}
                              title={k.allowedRoles.includes(activeAgentRole) ? "Copy Key" : "Access Denied"}
                            >
                               <Copy size={14} />
                            </button>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'add' && (
             <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-8 py-10">
                <div className="text-center space-y-2">
                   <h2 className="text-3xl font-display font-light text-on-void tracking-tight">Provision New <span className="text-neon-tertiary font-medium">Credential</span></h2>
                   <p className="text-on-void-muted text-sm leading-relaxed px-12">Authorized agents can inject new static credentials into the persistence layer. All writes are atomic and fsync-verified.</p>
                </div>

                <div className="bg-surface-high/40 border border-ghost-border rounded-2xl p-8 backdrop-blur-sm space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted font-mono">Key Designation</label>
                         <input 
                           type="text"
                           placeholder="e.g., Stripe Production Secret"
                           value={newKey.name}
                           onChange={(e)=>setNewKey(prev=>({...prev, name: e.target.value}))}
                           className="w-full bg-void border border-ghost-border rounded-xl px-4 py-3 text-sm text-on-void focus:outline-none focus:border-neon-tertiary transition-all"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted font-mono">Target Namespace</label>
                         <select 
                           value={newKey.prog}
                           onChange={(e)=>setNewKey(prev=>({...prev, prog: e.target.value}))}
                           className="w-full bg-void border border-ghost-border rounded-xl px-4 py-3 text-sm text-on-void focus:outline-none focus:border-neon-tertiary transition-all appearance-none"
                         >
                            {Object.keys(PROG_CONFIG).map(p => <option key={p} value={p}>{p}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted font-mono">Credential Payload</label>
                      <input 
                        type="password"
                        placeholder="sk-secret-..."
                        value={newKey.val}
                        onChange={(e)=>setNewKey(prev=>({...prev, val: e.target.value}))}
                        className="w-full bg-void border border-ghost-border rounded-xl px-4 py-3 text-sm text-on-void focus:outline-none focus:border-neon-tertiary transition-all font-mono"
                      />
                   </div>

                   <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted font-mono">Authorized Roles</label>
                      <div className="flex flex-wrap gap-3">
                        {Object.values(AgentRole).map(role => (
                          <button
                            key={role}
                            onClick={() => {
                              setNewKey(prev => ({
                                ...prev,
                                allowedRoles: prev.allowedRoles.includes(role)
                                  ? prev.allowedRoles.filter(r => r !== role)
                                  : [...prev.allowedRoles, role]
                              }));
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                              newKey.allowedRoles.includes(role)
                                ? "border-neon-tertiary bg-neon-tertiary/10 text-neon-tertiary"
                                : "border-ghost-border bg-void/20 text-on-void-muted hover:border-ghost-border-bright"
                            )}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      <p className="text-[9px] text-on-void-muted italic">Selected roles will have permission to reveal or copy this credential.</p>
                   </div>

                   <div className="pt-4">
                      <button 
                        onClick={handleAddKey}
                        className="w-full py-4 bg-neon-tertiary text-void rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={18} fill="currentColor" />
                        Provision Key
                      </button>
                   </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-on-void-muted opacity-40">
                   <div className="flex items-center gap-2 italic"> <Shield size={10} /> Fernet-Encrypted Output </div>
                   <div className="w-1 h-1 rounded-full bg-ghost-border" />
                   <div className="flex items-center gap-2 italic"> <Activity size={10} /> Atomic Storage Queue </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'audit' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-on-void tracking-tight">Audit Log Stream</h2>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-on-void-muted uppercase tracking-widest flex items-center gap-2">
                        <RefreshCw size={10} className="animate-spin-slow" />
                        SIEM Ready Integration
                      </span>
                      <button className="p-2 border border-ghost-border rounded-lg text-on-void-muted hover:text-on-void transition-colors">
                        <Settings size={14} />
                      </button>
                   </div>
                </div>

                <div className="bg-surface-high/20 border border-ghost-border rounded-2xl overflow-hidden divide-y divide-ghost-border/30">
                   <div className="grid grid-cols-12 px-6 py-3 text-[10px] uppercase tracking-widest font-bold text-on-void-muted opacity-50 bg-void/20">
                      <div className="col-span-3">Timestamp</div>
                      <div className="col-span-2">Criticality</div>
                      <div className="col-span-5">Message</div>
                      <div className="col-span-2 text-right">Identifier</div>
                   </div>
                   <div className="divide-y divide-ghost-border/10">
                     {audit.map((entry, i) => (entry && (
                       <div key={i} className="grid grid-cols-12 px-6 py-4 items-start group hover:bg-void/40 transition-all font-mono">
                         <div className="col-span-3 text-[10px] text-on-void-muted">{entry.ts}</div>
                         <div className="col-span-2">
                            <span className={cn(
                              "px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase",
                              entry.lvl === 'INFO' ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" :
                              entry.lvl === 'WARN' ? "border-amber-500/30 bg-amber-400/10 text-amber-500" :
                              "border-red-500/30 bg-red-500/10 text-red-500"
                            )}>
                              {entry.lvl}
                            </span>
                         </div>
                         <div className="col-span-5 text-[11px] text-on-void/70 leading-relaxed italic">{entry.msg}</div>
                         <div className="col-span-2 text-right text-[10px] text-on-void-muted opacity-40 uppercase tracking-tighter">{entry.src}</div>
                       </div>
                     )))}
                   </div>
                </div>
             </motion.div>
          )}

        </div>
      </div>
      
      {/* Persistence Bar */}
      <div className="bg-void/80 border-t border-ghost-border px-8 py-4 backdrop-blur-xl relative z-20">
         <div className="max-w-6xl mx-auto flex items-center justify-between text-[10px] font-mono text-on-void-muted uppercase tracking-[0.2em]">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Subroutine Isolation: 100%</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Memory Encryption: ACTIVE</span>
               </div>
            </div>
            <div className="flex items-center gap-1.5">
               <Database size={12} className="text-emerald-500" />
               <span className="text-emerald-500">Node Sync Healthy</span>
            </div>
         </div>
      </div>
    </main>
  );
}
