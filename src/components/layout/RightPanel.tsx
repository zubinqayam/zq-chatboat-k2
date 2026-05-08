import React from 'react';
import { Bot, ChevronRight, Activity, Terminal, Shield, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export function RightPanel() {
  return (
    <aside className="w-80 flex flex-col border-l border-ghost-border bg-surface-low shrink-0 font-sans overflow-hidden">
      {/* Coordinator Header */}
      <div className="p-5 border-b border-ghost-border bg-void/30">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-void-muted mb-4 opacity-50 font-mono">ZQ Coordinator</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-high border border-neon-primary/20 flex items-center justify-center text-neon-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Bot size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-on-void">Active Nodes</div>
              <div className="text-[10px] text-neon-primary font-mono tracking-tighter">48 Agents Online</div>
            </div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-neon-primary" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8">
        {/* Live Reasoning */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted flex items-center gap-2">
              <Terminal size={12} />
              Reasoning Stream
            </h4>
            <span className="text-[9px] font-mono text-neon-primary">LIVE</span>
          </div>
          <div className="bg-void/50 border border-ghost-border rounded-xl p-4 font-mono text-[10px] leading-relaxed space-y-2 opacity-80 relative overflow-hidden">
             <div className="absolute inset-0 scanline opacity-5" />
             <p className="text-on-void-muted"><span className="text-neon-primary">→</span> Initializing context expansion...</p>
             <p className="text-on-void-muted"><span className="text-neon-secondary">→</span> Analyzing relational dependencies...</p>
             <p className="text-on-void"><span className="text-neon-tertiary">→</span> Optimized 124 neural paths.</p>
             <motion.div 
               animate={{ opacity: [1, 0] }}
               transition={{ duration: 0.8, repeat: Infinity }}
               className="inline-block w-1.5 h-3 bg-neon-primary ml-1 translate-y-0.5" 
             />
          </div>
        </section>

        {/* Operational Agents */}
        <section className="space-y-4">
          <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted">Operational Agents</h4>
          <div className="space-y-3">
            {[
              { name: 'Research Subroutine', status: 'Running', color: 'text-neon-primary', icon: Activity },
              { name: 'ALGA Validator', status: 'Paused', color: 'text-on-void-muted', icon: Shield },
              { name: 'Deployment Monitor', status: 'Alert', color: 'text-amber-500', icon: AlertTriangle },
              { name: 'Sync Engine', status: 'Healthy', color: 'text-neon-secondary', icon: CheckCircle2 },
            ].map((agent, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-high/40 rounded-xl border border-ghost-border/50 group cursor-pointer hover:border-ghost-border transition-all">
                <div className="flex items-center gap-3">
                  <div className={cn("p-1.5 rounded-lg bg-void border border-ghost-border", agent.color)}>
                    <agent.icon size={14} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-on-void">{agent.name}</div>
                    <div className={cn("text-[9px] font-mono uppercase tracking-tighter", agent.color)}>{agent.status}</div>
                  </div>
                </div>
                <ChevronRight size={14} className="text-on-void-muted opacity-0 group-hover:opacity-100 transition-all" />
              </div>
            ))}
          </div>
        </section>

        {/* Security Health */}
        <section>
           <h4 className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted mb-4">Security Health</h4>
           <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface-high/40 rounded-xl border border-neon-primary/10 flex flex-col items-center gap-1.5">
                <Shield size={16} className="text-neon-primary" />
                <span className="text-[9px] font-bold text-on-void">E2E Active</span>
              </div>
              <div className="p-3 bg-surface-high/40 rounded-xl border border-neon-secondary/10 flex flex-col items-center gap-1.5">
                <Zap size={16} className="text-neon-secondary" />
                <span className="text-[9px] font-bold text-on-void">JWT Valid</span>
              </div>
           </div>
        </section>
      </div>

      {/* Footer Status */}
      <div className="p-5 border-t border-ghost-border bg-void/30">
        <div className="flex items-center justify-between text-[10px] font-mono text-on-void-muted">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-primary" />
            <span>SYNC STABLE</span>
          </div>
          <span>42ms LAT</span>
        </div>
      </div>
    </aside>
  );
}
