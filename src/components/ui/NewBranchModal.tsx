import React from 'react';
import { X, GitBranch, Terminal, Globe, Shield, Zap, Cpu, MemoryStick as Memory, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface NewBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewBranchModal({ isOpen, onClose }: NewBranchModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-void/90 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            className="bg-surface-mid w-full max-w-2xl rounded-2xl border border-ghost-border shadow-[0px_32px_64px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-ghost-border flex justify-between items-start bg-void/20">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <Zap size={14} className="text-neon-primary fill-neon-primary/20" />
                   <span className="text-[10px] font-mono text-neon-primary uppercase tracking-widest font-bold">New Operation Command</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-on-void tracking-tight">
                  Initialize Operational Thread
                </h2>
                <p className="text-on-void-muted text-[13px] mt-1 leading-relaxed max-w-md">Orchestrate a new AI-native environment with persistent memory and agent support.</p>
              </div>
              <button 
                onClick={onClose}
                className="text-on-void-muted hover:text-on-void transition-colors p-2 rounded-lg hover:bg-surface-high"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 flex flex-col gap-8 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest text-on-void-muted font-bold font-mono">Thread Designation</label>
                  <input 
                    type="text"
                    placeholder="e.g., supply-chain-rebalancing-v4"
                    className="w-full bg-void border border-ghost-border rounded-xl py-3 px-4 text-sm text-on-void focus:outline-none focus:border-neon-primary/40 focus:ring-1 focus:ring-neon-primary/40 transition-all placeholder:text-on-void-muted/30 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-void-muted font-bold font-mono">Memory Allocation</label>
                      <div className="flex items-center gap-2 p-3 bg-void border border-ghost-border rounded-xl">
                         <Memory size={14} className="text-neon-tertiary" />
                         <span className="text-xs text-on-void">Persistent (12GB)</span>
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-[10px] uppercase tracking-widest text-on-void-muted font-bold font-mono">Agent Capacity</label>
                      <div className="flex items-center gap-2 p-3 bg-void border border-ghost-border rounded-xl">
                         <Cpu size={14} className="text-neon-secondary" />
                         <span className="text-xs text-on-void">Up to 16 Nodes</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] uppercase tracking-widest text-on-void-muted font-bold font-mono">Select Base Orchestration Pattern</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pattern 1 */}
                  <div className="relative bg-surface-high border border-neon-primary/40 rounded-xl p-5 cursor-pointer group hover:bg-surface-highest transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-neon-primary/10 text-neon-primary">
                        <Terminal size={20} />
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-neon-primary flex items-center justify-center p-1">
                        <div className="w-full h-full bg-neon-primary rounded-full" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-on-void mb-1">Standard Logic Void</h3>
                    <p className="text-[11px] text-on-void-muted leading-relaxed">Clean slate with default ZQ LLM reasoning and local memory sync.</p>
                  </div>

                  {/* Pattern 2 */}
                  <div className="bg-void border border-ghost-border rounded-xl p-5 cursor-pointer group hover:bg-surface-highest transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-neon-secondary/10 text-neon-secondary">
                        <Share2 size={20} />
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-ghost-border" />
                    </div>
                    <h3 className="text-sm font-bold text-on-void mb-1">API Integration Hub</h3>
                    <p className="text-[11px] text-on-void-muted leading-relaxed">Pre-configured with webhook listeners and multi-vector data siphons.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-ghost-border bg-void/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <Shield size={14} className="text-neon-primary" />
                 <span className="text-[9px] font-mono text-on-void-muted uppercase tracking-widest">End-to-End Encrypted Thread</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={onClose}
                  className="text-on-void-muted hover:text-on-void text-xs font-bold uppercase tracking-widest px-4 py-2"
                >
                  Cancel
                </button>
                <button className="bg-neon-primary text-void font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] text-xs uppercase tracking-widest">
                  Initialize Operation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
