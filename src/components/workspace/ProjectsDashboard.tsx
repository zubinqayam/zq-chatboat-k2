import React from 'react';
import { 
  Layers, 
  GitBranch, 
  Rocket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight,
  Monitor,
  Globe,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Project {
  id: string;
  name: string;
  branch: string;
  status: 'production' | 'staging' | 'development' | 'failed';
  updated: string;
  creator: string;
  tags: string[];
}

const projectsData: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Logistic_Optimization_X4',
    branch: 'main',
    status: 'production',
    updated: '2h ago',
    creator: 'ZQ_COORDINATOR',
    tags: ['NEURAL', 'LOGISTICS', 'PRECISION']
  },
  {
    id: 'PRJ-002',
    name: 'Unified_Context_Siphon',
    branch: 'feat/vector-indexing',
    status: 'staging',
    updated: '14h ago',
    creator: 'ROOT_USER',
    tags: ['MEMORY', 'SIPHON', 'SYNC']
  },
  {
    id: 'PRJ-003',
    name: 'ALGA_Security_Gateway',
    branch: 'hotfix/audit-remediation',
    status: 'development',
    updated: '1d ago',
    creator: 'SECURITY_AGENT',
    tags: ['SECURITY', 'AUDIT', 'ALGA']
  },
  {
    id: 'PRJ-004',
    name: 'Pacific_Hub_Routing',
    branch: 'legacy-stable',
    status: 'production',
    updated: '5d ago',
    creator: 'SYSTEM_BOT',
    tags: ['LEGACY', 'ROUTING']
  },
  {
    id: 'PRJ-005',
    name: 'Neural_Test_Bench',
    branch: 'exp/regression-v2',
    status: 'failed',
    updated: '2h ago',
    creator: 'ZQ_COORDINATOR',
    tags: ['TEST', 'EXPERIMENTAL']
  }
];

const statusConfig = {
  production: { color: 'text-neon-primary', bg: 'bg-neon-primary/10', icon: Globe },
  staging: { color: 'text-neon-secondary', bg: 'bg-neon-secondary/10', icon: Rocket },
  development: { color: 'text-neon-tertiary', bg: 'bg-neon-tertiary/10', icon: GitBranch },
  failed: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertCircle },
};

export function ProjectsDashboard() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-void relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(160,255,195,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <div className="px-10 pt-10 pb-6 max-w-6xl relative z-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-on-void/90 tracking-tighter mb-2">
            Operational <span className="text-neon-secondary font-medium">Projects</span>
          </h1>
          <p className="text-on-void-muted text-sm leading-relaxed max-w-2xl">
            Manage logic branches, deployment targets, and unified operational threads.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-void-muted" />
            <input 
              type="text" 
              placeholder="Search logic threads..."
              className="bg-surface-low border border-ghost-border rounded-lg pl-9 pr-4 py-2 text-xs text-on-void focus:border-neon-secondary/40 transition-all outline-none"
            />
          </div>
          <button className="bg-neon-secondary text-void font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] text-xs uppercase tracking-widest">
            <Plus size={16} />
            New Thread
          </button>
        </div>
      </div>

      {/* Projects List/Table */}
      <div className="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar relative z-10 border-t border-ghost-border/30 mt-4 bg-void/10">
        <div className="max-w-6xl space-y-4">
          <div className="grid grid-cols-12 px-6 py-2 text-[10px] uppercase tracking-widest font-bold text-on-void-muted opacity-50">
            <div className="col-span-5">Designation</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Last Update</div>
            <div className="col-span-2">Orchestrator</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          <div className="space-y-3">
            {projectsData.map((project, i) => {
              const config = statusConfig[project.status];
              return (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid grid-cols-12 items-center px-6 py-4 bg-surface-high/40 border border-ghost-border rounded-2xl group hover:border-neon-secondary/30 transition-all cursor-pointer backdrop-blur-sm"
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-void border border-ghost-border flex items-center justify-center text-on-void-muted group-hover:text-neon-secondary transition-colors">
                       <Layers size={18} />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-on-void group-hover:text-neon-secondary transition-colors">{project.name}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <GitBranch size={12} className="text-on-void-muted" />
                          <span className="text-[10px] font-mono text-on-void-muted">{project.branch}</span>
                       </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold border", config.color, config.bg, config.color.replace('text-', 'border-'))}>
                       <config.icon size={12} />
                       {project.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2 text-on-void-muted">
                       <Clock size={14} />
                       <span className="text-xs">{project.updated}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-md bg-neon-primary/20 flex items-center justify-center text-neon-primary">
                          <Monitor size={12} />
                       </div>
                       <span className="text-xs text-on-void/80">{project.creator}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button className="p-2 text-on-void-muted hover:text-on-void rounded-lg hover:bg-surface-high transition-colors">
                       <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Persistence Bar */}
      <div className="flex items-center justify-between px-10 py-4 bg-void/50 border-t border-ghost-border relative z-20 backdrop-blur-md">
         <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-neon-primary" />
               <span className="text-[9px] font-mono text-on-void-muted uppercase tracking-[0.2em]">3 Production Environments Active</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-neon-secondary" />
               <span className="text-[9px] font-mono text-on-void-muted uppercase tracking-[0.2em]">1 Staging Ready</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <Lock size={12} className="text-on-void-muted" />
            <span className="text-[9px] font-mono text-on-void-muted uppercase tracking-widest">Logic Locking: Enabled</span>
         </div>
      </div>
    </main>
  );
}
