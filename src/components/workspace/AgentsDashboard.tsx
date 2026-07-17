import React from 'react';
import { 
  Bot, 
  Activity, 
  Shield, 
  Zap, 
  Cpu, 
  Network, 
  Search, 
  Filter, 
  ChevronRight, 
  ExternalLink,
  MoreVertical,
  Play,
  Square,
  RefreshCw,
  Database,
  SearchCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { AgentRole } from '@/src/types';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'idle' | 'alert' | 'syncing' | 'paused';
  tokens: string;
  duration: string;
  memory: string;
  lastAction: string;
  role: AgentRole;
}

const agentsData: Agent[] = [
  {
    id: 'A-01',
    name: 'Research Subroutine',
    type: 'Information Fetcher',
    status: 'running',
    tokens: '14.2k',
    duration: '12m 44s',
    memory: '1.2 GB',
    lastAction: 'Crawling Pacific-Hub logistics',
    role: AgentRole.RESEARCH
  },
  {
    id: 'A-02',
    name: 'ALGA Validator',
    type: 'Security Auditor',
    status: 'alert',
    tokens: '2.8k',
    duration: '1h 04m',
    memory: '422 MB',
    lastAction: 'Illegal logic branch detected',
    role: AgentRole.SECURITY
  },
  {
    id: 'A-03',
    name: 'Sync Monitor',
    type: 'Reliability Engine',
    status: 'syncing',
    tokens: '0.4k',
    duration: '2d 14h',
    memory: '12 MB',
    lastAction: 'Pushing local SQL updates',
    role: AgentRole.SYSTEM
  },
  {
    id: 'A-04',
    name: 'Deployment Agent',
    type: 'Orchestrator',
    status: 'idle',
    tokens: '184k',
    duration: '5m 12s',
    memory: '4.8 GB',
    lastAction: 'Deployment v0.4.2 successful',
    role: AgentRole.ORCHESTRATOR
  },
  {
    id: 'A-05',
    name: 'Memory Indexer',
    type: 'Durable Context',
    status: 'running',
    tokens: '44k',
    duration: '14h 22m',
    memory: '8.4 GB',
    lastAction: 'Re-indexing operational timeline',
    role: AgentRole.DEVELOPER
  }
];

const statusStyles = {
  running: { color: 'text-neon-primary', bg: 'bg-neon-primary/10', dot: 'bg-neon-primary', label: 'ACTIVE' },
  idle: { color: 'text-on-void-muted', bg: 'bg-surface-high', dot: 'bg-on-void-muted', label: 'STANDBY' },
  alert: { color: 'text-amber-500', bg: 'bg-amber-500/10', dot: 'bg-amber-500', label: 'ALERT' },
  syncing: { color: 'text-neon-secondary', bg: 'bg-neon-secondary/10', dot: 'bg-neon-secondary animate-pulse', label: 'SYNCING' },
  paused: { color: 'text-on-void-muted', bg: 'bg-surface-high', dot: 'bg-on-void-muted', label: 'PAUSED' },
};

export function AgentsDashboard() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-void relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <div className="px-10 pt-10 pb-6 max-w-6xl relative z-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-on-void/90 tracking-tighter mb-2">
            Agent <span className="text-neon-primary font-medium">Orchestration</span>
          </h1>
          <p className="text-on-void-muted text-sm leading-relaxed max-w-2xl">
            Real-time management of independent neural subroutines. Monitor performance metrics, token burn rates, and memory access patterns.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-surface-high border border-ghost-border rounded-xl px-4 py-2 flex items-center gap-6">
              <div className="text-center">
                 <div className="text-[10px] text-on-void-muted uppercase font-mono tracking-tighter">Total Burn</div>
                 <div className="text-sm font-bold text-on-void">245.4k <span className="text-[8px] text-on-void-muted">TOKENS</span></div>
              </div>
              <div className="w-[1px] h-8 bg-ghost-border" />
              <div className="text-center">
                 <div className="text-[10px] text-on-void-muted uppercase font-mono tracking-tighter">Uptime</div>
                 <div className="text-sm font-bold text-neon-primary">99.98%</div>
              </div>
           </div>
           <button className="bg-neon-primary text-void font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] text-xs uppercase tracking-widest">
             <Bot size={16} fill="currentColor" />
             Spawn Agent
           </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar relative z-10 border-t border-ghost-border/30 mt-4 bg-void/10">
        <div className="max-w-6xl grid grid-cols-1 xl:grid-cols-2 gap-6">
          {agentsData.map((agent, i) => {
            const style = statusStyles[agent.status];
            return (
              <motion.div 
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-high/40 border border-ghost-border rounded-2xl p-6 group hover:border-neon-primary/20 transition-all backdrop-blur-sm flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-ghost-border shadow-inner bg-void", style.color)}>
                      {agent.status === 'running' && <Activity size={24} />}
                      {agent.status === 'alert' && <Shield size={24} />}
                      {agent.status === 'syncing' && <RefreshCw size={24} className="animate-spin-slow" />}
                      {agent.status === 'idle' && <Zap size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-on-void font-bold text-base group-hover:text-neon-primary transition-colors">{agent.name}</h3>
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border border-ghost-border bg-surface-high text-on-void-muted">
                           {agent.role}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-on-void-muted uppercase tracking-widest">{agent.type}</p>
                    </div>
                  </div>
                  <div className={cn("px-2 py-1 rounded text-[9px] font-bold border flex items-center gap-2", style.color.replace('text-', 'border-'))}>
                    <div className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                    {style.label}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-void/40 rounded-xl p-3 border border-ghost-border/30">
                    <div className="flex items-center gap-2 text-on-void-muted mb-1">
                      <Cpu size={12} />
                      <span className="text-[9px] font-mono uppercase tracking-tighter">Computation</span>
                    </div>
                    <div className="text-xs font-bold text-on-void">{agent.tokens} <span className="text-[8px] opacity-40">tkns</span></div>
                  </div>
                  <div className="bg-void/40 rounded-xl p-3 border border-ghost-border/30">
                    <div className="flex items-center gap-2 text-on-void-muted mb-1">
                      <Database size={12} />
                      <span className="text-[9px] font-mono uppercase tracking-tighter">Context</span>
                    </div>
                    <div className="text-xs font-bold text-on-void">{agent.memory}</div>
                  </div>
                  <div className="bg-void/40 rounded-xl p-3 border border-ghost-border/30">
                    <div className="flex items-center gap-2 text-on-void-muted mb-1">
                      <Activity size={12} />
                      <span className="text-[9px] font-mono uppercase tracking-tighter">Uptime</span>
                    </div>
                    <div className="text-xs font-bold text-on-void">{agent.duration}</div>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-ghost-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SearchCode size={12} className="text-on-void-muted" />
                    <span className="text-[10px] text-on-void-muted italic truncate max-w-[200px]">{agent.lastAction}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="p-2 text-on-void-muted hover:text-on-void rounded-lg hover:bg-surface-high transition-colors">
                        <Play size={14} fill="currentColor" />
                     </button>
                     <button className="p-2 text-on-void-muted hover:text-on-void rounded-lg hover:bg-surface-high transition-colors">
                        <Square size={14} fill="currentColor" />
                     </button>
                     <button className="p-2 text-on-void-muted hover:text-on-void rounded-lg hover:bg-surface-high transition-colors">
                        <MoreVertical size={14} />
                     </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Orchestration Controls Overlay */}
      <div className="p-6 border-t border-ghost-border bg-void/50 backdrop-blur-md relative z-20">
         <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded bg-neon-primary shadow-[0_0_8px_#10b981]" />
                  <span className="text-xs font-bold text-on-void">Orchestrator Operational</span>
               </div>
               <div className="flex items-center gap-2 text-[11px] text-on-void-muted">
                  <Network size={14} />
                  <span>Sub-thread integrity: 100%</span>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="text-[10px] font-bold uppercase tracking-widest text-on-void-muted hover:text-on-void px-4 py-2">
                  Emergency All-Stop
               </button>
               <button className="px-6 py-2 bg-surface-highest text-on-void rounded-xl font-bold text-[10px] uppercase tracking-widest border border-ghost-border hover:bg-void transition-all">
                  Re-Sync All Agents
               </button>
            </div>
         </div>
      </div>
    </main>
  );
}
