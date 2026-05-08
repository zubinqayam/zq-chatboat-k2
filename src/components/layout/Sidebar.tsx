import { 
  LayoutGrid, 
  Layers, 
  Bot, 
  History, 
  Zap, 
  BookOpen, 
  Share2, 
  ShieldCheck, 
  Rocket, 
  Settings,
  PlusCircle,
  HelpCircle,
  LifeBuoy
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { id: 'workspace', label: 'Workspace', icon: LayoutGrid },
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'agents', label: 'Agents', icon: Bot, live: true },
  { id: 'memory', label: 'Memory', icon: History },
  { id: 'vault', label: 'Vault', icon: Zap },
  { id: 'automations', label: 'Automations', icon: ShieldCheck },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'integrations', label: 'Integrations', icon: Share2 },
  { id: 'audit', label: 'Audit', icon: ShieldCheck },
  { id: 'deployments', label: 'Deployments', icon: Rocket },
];

export function Sidebar({ onNewBranch, activeView, onNavigate }: { 
  onNewBranch: () => void;
  activeView: string;
  onNavigate: (view: string) => void;
}) {
  return (
    <aside className="w-56 bg-surface-low border-r border-ghost-border flex flex-col h-full py-4 shrink-0 font-sans">
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-neon-primary shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <h2 className="text-on-void font-bold tracking-tight text-sm font-display uppercase italic">ZQ AI LOGIC™</h2>
        </div>
        <span className="text-[9px] text-on-void-muted uppercase tracking-[0.2em] font-mono">Operational OS v1.0</span>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-all duration-200 group text-[13px] font-medium",
              activeView === item.id 
                ? "bg-surface-high text-on-void" 
                : "text-on-void-muted hover:bg-surface-high/30 hover:text-on-void"
            )}
          >
            <div className="flex items-center gap-2.5">
              <item.icon size={16} className={cn(activeView === item.id ? "text-neon-primary" : "text-on-void-muted group-hover:text-on-void")} />
              <span>{item.label}</span>
            </div>
            {item.live && (
              <div className="w-1.5 h-1.5 rounded-full bg-neon-primary animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-3 mt-auto pt-4 border-t border-ghost-border space-y-3">
        <button className="flex items-center gap-2.5 px-3 py-1.5 w-full text-on-void-muted hover:text-on-void transition-all text-xs">
          <Settings size={14} />
          <span>Settings</span>
        </button>
        
        <motion.button
          onClick={onNewBranch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface-highest/50 border border-ghost-border rounded-lg text-on-void hover:bg-surface-highest transition-all font-bold text-[10px] uppercase tracking-widest"
        >
          <PlusCircle size={12} />
          New Operation
        </motion.button>
      </div>
    </aside>
  );
}
