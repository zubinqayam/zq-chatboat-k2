import React from 'react';
import { Send, Mic, Plus, Sparkles, User, Terminal, ChevronRight, Play, Clock, ArrowUpRight, LayoutGrid, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  code?: string;
  type?: 'operation' | 'chat';
}

const recentOperations = [
  { id: '1', title: 'Corporate Insurance Analysis', subtitle: 'Phase 2: Liability Gap Mapping', progress: 65, color: 'text-neon-primary' },
  { id: '2', title: 'Deployment Review: Alpha Node', subtitle: 'Waiting for manual override', progress: 88, color: 'text-neon-secondary' },
  { id: '3', title: 'ALGA Audit Remediation', subtitle: 'Fixing 14 critical validation failures', progress: 12, color: 'text-amber-500' },
];

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: "Operation Logistic_Optimization_X4 is currently in orchestration check. I have verified 12 data siphons across the Northern Hemisphere. Latency reduced by 18%.",
    type: 'operation',
    code: `// Neural Routing Optimization
async function deploySync(nodes) {
  const map = await ZQ.sync.mapNodes(nodes);
  return ZQ.orchestrator.execute(map);
}`
  },
  {
    id: '2',
    role: 'user',
    content: "Initialize secondary audit for the remaining 4 siphon points and merge the findings into the Operational Timeline."
  }
];

export function ChatArea() {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-void relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ghost-border to-transparent opacity-20" />
      
      {/* Thread Header */}
      <div className="px-10 pt-8 pb-4 max-w-5xl relative z-10 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-mono text-neon-primary bg-neon-primary/10 px-2 py-0.5 rounded border border-neon-primary/20">LOGIC_X4</span>
             <span className="text-[10px] font-mono text-on-void-muted opacity-40 italic">SESSION_ID: 88Q-01X</span>
          </div>
          <h1 className="font-display text-3xl font-light text-on-void/90 tracking-tighter">
            Operational Canvas: <span className="text-on-void font-medium">Logistic_Optimization</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-1.5 bg-surface-high border border-ghost-border rounded-lg text-xs font-bold text-on-void hover:bg-surface-highest transition-all group">
             <Clock size={14} className="text-on-void-muted group-hover:text-neon-primary" />
             Timeline
           </button>
           <button className="flex items-center gap-2 px-3 py-1.5 bg-neon-primary text-void rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
             <Play size={14} fill="currentColor" />
             Execute Operation
           </button>
        </div>
      </div>

      {/* Context Area */}
      <div className="px-10 py-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
           <h3 className="text-[10px] uppercase tracking-widest font-bold text-on-void-muted flex items-center gap-2">
             <LayoutGrid size={12} />
             Active Operational Context
           </h3>
           <button className="text-[10px] text-neon-primary font-bold uppercase tracking-tight flex items-center gap-1 hover:brightness-125">
             View All <ArrowUpRight size={12} />
           </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentOperations.map((op) => (
            <motion.div 
              key={op.id}
              whileHover={{ y: -2 }}
              className="bg-surface-low border border-ghost-border rounded-xl p-4 cursor-pointer group hover:border-neon-primary/20 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <ArrowUpRight size={14} className="text-neon-primary" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                 <div className={cn("w-1.5 h-1.5 rounded-full", op.progress > 80 ? "bg-neon-primary shadow-[0_0_8px_#10b981]" : "bg-on-void-muted")} />
                 <span className="text-[9px] font-mono text-on-void-muted uppercase tracking-tighter">Operation {op.id}</span>
              </div>
              <h4 className="text-xs font-bold text-on-void mb-1 group-hover:text-neon-primary transition-colors">{op.title}</h4>
              <p className="text-[10px] text-on-void-muted leading-tight mb-4">{op.subtitle}</p>
              
              <div className="h-1 bg-void rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${op.progress}%` }}
                  className={cn("h-full", op.color.replace('text-', 'bg-'))} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Messages / Execution Timeline */}
      <div className="flex-1 overflow-y-auto px-10 py-6 space-y-10 custom-scrollbar relative z-10 border-t border-ghost-border/30 mt-4 bg-void/20">
        <div className="max-w-5xl space-y-10">
          {initialMessages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-6", msg.role === 'user' ? "justify-end" : "justify-start")}
            >
              <div className={cn(
                "flex-1 max-w-2xl p-6 rounded-2xl text-[13px] leading-relaxed relative group",
                msg.role === 'ai' 
                  ? "bg-surface-high/50 border-l-2 border-neon-primary backdrop-blur-sm" 
                  : "bg-surface-low/30 border border-ghost-border text-on-void/80"
              )}>
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                     <div className={cn(
                       "w-5 h-5 rounded flex items-center justify-center",
                       msg.role === 'ai' ? "bg-neon-primary/20 text-neon-primary" : "bg-on-void-muted/20 text-on-void-muted"
                     )}>
                       {msg.role === 'ai' ? <Sparkles size={12} fill="currentColor" /> : <User size={12} />}
                     </div>
                     <span className="text-[10px] font-bold text-on-void uppercase font-mono tracking-tighter">
                       {msg.role === 'ai' ? 'ZQ_COORDINATOR' : 'ROOT_USER'}
                     </span>
                   </div>
                   <span className="text-[9px] font-mono text-on-void-muted opacity-40">14:02:44 UTC</span>
                </div>

                <p className="mb-4">{msg.content}</p>
                
                {msg.code && (
                  <div className="bg-void/80 rounded-lg p-5 font-mono text-[11px] leading-relaxed border border-ghost-border group relative">
                    <div className="absolute top-2 right-3 text-[9px] text-on-void-muted uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">javascript / orchestration</div>
                    <pre className="text-on-void/70">
                      <code>{msg.code}</code>
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Persistence Bar / Input */}
      <div className="p-8 border-t border-ghost-border bg-void/80 backdrop-blur-xl relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-2xl border border-ghost-border focus-within:border-neon-primary/40 transition-all p-2 flex items-center gap-3">
            <button className="p-2.5 text-on-void-muted hover:text-neon-primary transition-colors rounded-lg hover:bg-surface-high flex items-center gap-2">
              <Plus size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest hidden md:block">Cmd</span>
            </button>
            <div className="w-[1px] h-6 bg-ghost-border mx-1" />
            <input 
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-on-void placeholder:text-on-void-muted/50"
              placeholder="What operation should continue?"
            />
            <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all px-2">
               <FileText size={16} className="text-neon-secondary" />
               <LayoutGrid size={16} className="text-neon-tertiary" />
            </div>
            <div className="flex items-center gap-2 px-1">
              <button className="p-2 text-on-void-muted hover:text-neon-secondary transition-colors rounded-xl">
                <Mic size={18} />
              </button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-neon-primary text-void rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                Execute
                <Send size={14} fill="currentColor" />
              </motion.button>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5">
               <span className="w-1 h-1 rounded-full bg-neon-primary animate-pulse" />
               <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-on-void-muted/50">Neural Engine Active</span>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-on-void-muted/20">|</span>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-on-void-muted/50 italic">CTRL + / FOR ACTIONS</span>
          </div>
        </div>
      </div>
    </main>
  );
}
