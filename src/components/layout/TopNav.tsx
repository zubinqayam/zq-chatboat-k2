import React from 'react';
import { Search, Bell, Settings, Zap, Shield, Database, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export function TopNav() {
  return (
    <header className="flex justify-between items-center px-6 h-14 w-full sticky top-0 z-[40] bg-void/80 backdrop-blur-xl border-b border-ghost-border font-display tracking-tight">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-high border border-neon-primary/20 flex items-center justify-center text-neon-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Zap size={16} fill="currentColor" />
          </div>
          <div className="text-sm font-bold tracking-tighter text-on-void">Operational Console</div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-widest font-bold">
          <a href="#" className="text-neon-primary relative">
            Orchestrator
            <motion.div layoutId="nav-glow" className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-neon-primary shadow-[0_0_10px_#10b981]" />
          </a>
          <a href="#" className="text-on-void-muted hover:text-on-void transition-colors">Neural Graph</a>
          <a href="#" className="text-on-void-muted hover:text-on-void transition-colors">Vault</a>
        </nav>
      </div>

      <div className="flex-1 max-w-xl px-12">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-void-muted group-focus-within:text-neon-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search operational memory..."
            className="w-full bg-surface-low/50 border border-ghost-border focus:border-neon-primary/40 rounded-full py-1.5 pl-10 pr-4 text-xs transition-all outline-none text-on-void placeholder:text-on-void-muted/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Trust Indicators */}
        <div className="hidden md:flex items-center gap-4 border-r border-ghost-border pr-6">
          <div className="flex items-center gap-2 group cursor-help">
            <Shield size={12} className="text-neon-primary" />
            <span className="text-[9px] font-mono uppercase text-on-void-muted group-hover:text-on-void transition-colors">Encrypted</span>
          </div>
          <div className="flex items-center gap-2 group cursor-help">
            <RefreshCw size={12} className="text-neon-secondary animate-spin-slow" />
            <span className="text-[9px] font-mono uppercase text-on-void-muted group-hover:text-on-void transition-colors">Synced</span>
          </div>
          <div className="flex items-center gap-2 group cursor-help">
            <Database size={12} className="text-neon-tertiary" />
            <span className="text-[9px] font-mono uppercase text-on-void-muted group-hover:text-on-void transition-colors">Memory: 4.2GB</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-void-muted hover:text-on-void hover:bg-surface-high rounded-lg transition-all">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-on-void">Zubin Qayam</div>
              <div className="text-[9px] font-mono text-neon-primary uppercase tracking-tighter">Root Privileges</div>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-neon-primary/20 cursor-pointer">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOSRTs-Iwl_L63VdI-7WPCw3iucRmvvMPZ3acbDaG5riPm-SKPLbeXLA0R3i3jqSx3IlYNzXTR976pjVJr0Pm5-V3fFzntRiP-IYtdCWjc2UIuvpqLc9FbJ2VetB19KtWy-Q02S8AergNGoTMw4Bm_rvSgCXjtLzautv2E-RlMGYYxbhCJKASfPt82bFd_cqNDxenbDZHc64ZrHJMZRkzn4IF4rKgjlRKLf8aVpWXwoix4oTae8nuW9V_10l6JIAQvWU3IgwkkOOA" 
                alt="Profile"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
