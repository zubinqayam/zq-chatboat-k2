import React, { useMemo, useState } from 'react';
import { 
  History, 
  MessageSquare, 
  Sparkles, 
  Rocket, 
  Wrench, 
  ShieldCheck, 
  GitPullRequest, 
  RefreshCw,
  Search,
  Filter,
  Download,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

// Data structures
interface ALGAReport {
  composite: number;
  accuracy: number;
  logic: number;
  governance: number; // Hard gate if < 90
  alignment: number;
  decision: 'ACCEPT' | 'QUARANTINE' | 'REJECT';
}

interface TimelineEvent {
  id: string;
  type: 'prompt' | 'output' | 'deployment' | 'fix' | 'audit' | 'pr' | 'sync';
  timestamp: string;
  title: string;
  description: string;
  meta?: string;
  status?: 'success' | 'warning' | 'info';
  algaReport?: ALGAReport;
  details?: {
    logs: string[];
    metrics?: Record<string, string>;
  };
}

const timelineData: TimelineEvent[] = [
  {
    id: '1',
    type: 'sync',
    timestamp: '2s ago',
    title: 'Local Memory Synchronized',
    description: 'ElectricSQL queue cleared. 4 pending updates merged into global namespace.',
    status: 'success',
    algaReport: { composite: 92.4, accuracy: 94, logic: 90, governance: 95, alignment: 91, decision: 'ACCEPT' },
    details: {
      logs: [
        'Queue: fetching pending transactions...',
        'Sync: 4 objects detected',
        'Merge: conflict resolution applied to index 0x4f',
        'Status: Persistence layer synchronized'
      ],
      metrics: { 'Latency': '12ms', 'Throughput': '1.4 MB/s' }
    }
  },
  {
    id: '2',
    type: 'deployment',
    timestamp: '14m ago',
    title: 'Alpha Node Deployed',
    description: 'Version v0.4.2-stable pushed to Northern Hemisphere cluster. 12 data siphons active.',
    meta: 'DEPLOY_ID: ZQ-889-X',
    status: 'success',
    algaReport: { composite: 89.2, accuracy: 88, logic: 85, governance: 98, alignment: 85, decision: 'ACCEPT' },
    details: {
      logs: [
        'Orchestrator: Initializing node clusters...',
        'Network: Siphon points established at LON, NYC, TYO',
        'Verification: SSL handshakes concurrent',
        'State: Operational'
      ],
      metrics: { 'Nodes': '12', 'Reliability': '99.9%' }
    }
  },
  {
    id: '3',
    type: 'audit',
    timestamp: '1h ago',
    title: 'ALGA Validation Check',
    description: 'Security scan completed. Illegal logic branch identified and isolated.',
    status: 'warning',
    algaReport: { composite: 64.5, accuracy: 70, logic: 40, governance: 45, alignment: 60, decision: 'QUARANTINE' },
    details: {
      logs: [
        'Security: Full scan initiated...',
        'Warning: Unauthenticated read attempt at /api/vault',
        'Anomaly: Token spoofing detected in research-node-4',
        'Action: Routing to quarantine'
      ]
    }
  },
  {
    id: '4',
    type: 'pr',
    timestamp: '3h ago',
    title: 'PR Review: Logistic_Optimization',
    description: 'ZQ_COORDINATOR approved code changes. Regression path verified via simulation.',
    meta: 'PR #124',
    algaReport: { composite: 94.1, accuracy: 96, logic: 92, governance: 98, alignment: 90, decision: 'ACCEPT' },
    details: {
      logs: [
        'Review: Diff analysis complete',
        'Comment: Logic flow seems optimized for low-latency',
        'CI: All checks passed (14/14)',
        'Decision: Merge approved'
      ]
    }
  },
  {
    id: '5',
    type: 'fix',
    timestamp: '5h ago',
    title: 'Hotfix: Latency Regression',
    description: 'Resolved high-frequency packet loss in Pacific-Hub nodes by rebalancing neural load.',
    status: 'success',
    algaReport: { composite: 88.4, accuracy: 90, logic: 88, governance: 92, alignment: 82, decision: 'ACCEPT' },
    details: {
      logs: [
        'Alert: Packet loss exceeded 1.5%',
        'Diagnostic: CPU bottleneck in node-ph-01',
        'Patch: Load distribution adjusted to node-ph-04',
        'Status: Resolved'
      ]
    }
  },
  {
    id: '6',
    type: 'output',
    timestamp: 'Yesterday',
    title: 'AI Operational Response',
    description: 'Generated potential outcomes for internal API Vault integration. Recommended path: Non-linear regression.',
    algaReport: { composite: 91.2, accuracy: 94, logic: 95, governance: 98, alignment: 75, decision: 'ACCEPT' },
    details: {
      logs: [
        'Thinking: Expanding logic branches...',
        'Simulation: 4,000 iterations current',
        'Result: Path A (Linear) rejected (14% risk)',
        'Result: Path B (Non-linear) selected (2% risk)'
      ]
    }
  },
  {
    id: '7',
    type: 'prompt',
    timestamp: 'Yesterday',
    title: 'System Command: /analyze-nodes',
    description: 'Root user requested deep-scan of terminal logistics paths for anomalies.',
    algaReport: { composite: 95.0, accuracy: 100, logic: 90, governance: 100, alignment: 90, decision: 'ACCEPT' },
    details: {
      logs: [
        'Input: /analyze-nodes --deep',
        'Context: Logistic_Optimization_X4',
        'Authorization: Root verified'
      ]
    }
  }
];

const typeConfig = {
  prompt: { icon: MessageSquare, color: 'text-on-void', bg: 'bg-surface-high' },
  output: { icon: Sparkles, color: 'text-neon-primary', bg: 'bg-neon-primary/10' },
  deployment: { icon: Rocket, color: 'text-neon-secondary', bg: 'bg-neon-secondary/10' },
  fix: { icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  audit: { icon: ShieldCheck, color: 'text-neon-tertiary', bg: 'bg-neon-tertiary/10' },
  pr: { icon: GitPullRequest, color: 'text-neon-primary', bg: 'bg-neon-primary/10' },
  sync: { icon: RefreshCw, color: 'text-neon-secondary', bg: 'bg-neon-secondary/10' },
};

const statusBadgeConfig = {
  success: { color: 'text-neon-primary', bg: 'bg-neon-primary/10', icon: CheckCircle2 },
  warning: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle },
  info: { color: 'text-neon-secondary', bg: 'bg-neon-secondary/10', icon: Info },
};

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-neon-tertiary/20 text-neon-tertiary px-0.5 rounded shadow-[0_0_8px_rgba(216,180,254,0.3)] border border-neon-tertiary/30">
            {part}
          </span>
        ) : (
          part
        )
      ))}
    </>
  );
};

export function MemoryTimeline() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return timelineData;
    const lowerQuery = searchQuery.toLowerCase();
    return timelineData.filter(event => 
      event.title.toLowerCase().includes(lowerQuery) || 
      event.description.toLowerCase().includes(lowerQuery) ||
      event.type.toLowerCase().includes(lowerQuery) ||
      (event.meta && event.meta.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery]);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(timelineData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'zq-memory-timeline.json');
    linkElement.click();
    setIsExportOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Timestamp', 'Title', 'Description', 'Meta', 'Status'];
    const rows = timelineData.map(event => [
      event.type,
      event.timestamp,
      `"${event.title.replace(/"/g, '""')}"`,
      `"${event.description.replace(/"/g, '""')}"`,
      event.meta || '',
      event.status || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'zq-memory-timeline.csv');
    link.click();
    setIsExportOpen(false);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0 bg-void relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.03)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <div className="px-10 pt-10 pb-6 max-w-5xl relative z-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light text-on-void/90 tracking-tighter mb-2">
            Operational <span className="text-neon-tertiary font-medium">Memory Timeline</span>
          </h1>
          <p className="text-on-void-muted text-sm leading-relaxed max-w-2xl">
            A persistent chronological record of all system operations, AI reasoning cycles, and deployment events.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-void-muted" />
            <input 
              type="text" 
              placeholder="Filter timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface-low border border-ghost-border rounded-lg pl-9 pr-4 py-2 text-xs text-on-void focus:border-neon-tertiary/40 transition-all outline-none"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-surface-high border border-ghost-border rounded-lg text-xs font-bold text-on-void hover:bg-surface-highest transition-all group"
            >
              <Download size={14} className="text-on-void-muted group-hover:text-neon-tertiary" />
              Export
              <ChevronDown size={12} className={cn("text-on-void-muted transition-transform", isExportOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {isExportOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-surface-high border border-ghost-border rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    <button 
                      onClick={exportToJSON}
                      className="w-full px-4 py-3 text-left text-xs font-medium text-on-void hover:bg-surface-highest transition-colors border-b border-ghost-border flex items-center justify-between"
                    >
                      Export as JSON
                      <span className="text-[9px] font-mono text-on-void-muted">.json</span>
                    </button>
                    <button 
                      onClick={exportToCSV}
                      className="w-full px-4 py-3 text-left text-xs font-medium text-on-void hover:bg-surface-highest transition-colors flex items-center justify-between"
                    >
                      Export as CSV
                      <span className="text-[9px] font-mono text-on-void-muted">.csv</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button className="p-2 border border-ghost-border rounded-lg text-on-void-muted hover:text-on-void transition-colors">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar relative z-10 border-t border-ghost-border/30 mt-4 bg-void/10">
        <div className="max-w-5xl relative">
          {/* Vertical Line */}
          <div className="absolute left-[21px] top-4 bottom-4 w-px bg-gradient-to-b from-neon-tertiary/40 via-ghost-border to-transparent" />
          
          <div className="space-y-12">
            {filteredData.map((event, i) => {
              const config = typeConfig[event.type as keyof typeof typeConfig];
              return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative pl-12 group"
                >
                  {/* Event Marker */}
                  <div className={cn(
                    "absolute left-0 top-1 w-11 h-11 rounded-xl border border-ghost-border flex items-center justify-center z-10 shadow-lg group-hover:scale-110 transition-transform bg-surface-mid",
                    config.color
                  )}>
                    <config.icon size={18} />
                    {event.status === 'warning' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-void" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div 
                    onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                    className={cn(
                      "bg-surface-high/40 border border-ghost-border/50 rounded-2xl p-5 hover:bg-surface-high/60 transition-all backdrop-blur-sm cursor-pointer group-hover:border-neon-tertiary/20",
                      expandedEventId === event.id && "border-neon-tertiary/40 bg-surface-high/80"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] font-mono font-bold text-on-void-muted uppercase tracking-widest opacity-60">
                           {event.type}
                         </span>
                         <span className="w-1 h-1 rounded-full bg-on-void-muted opacity-30" />
                         <span className="text-[10px] font-mono text-on-void-muted italic">
                           {event.timestamp}
                         </span>
                       </div>
                       <div className="flex items-center gap-2">
                        {event.meta && (
                          <span className="text-[9px] font-mono bg-void/50 px-2 py-1 rounded border border-ghost-border text-on-void-muted">
                            {highlightText(event.meta, searchQuery)}
                          </span>
                        )}
                        <ChevronDown 
                          size={14} 
                          className={cn(
                            "text-on-void-muted transition-transform duration-300",
                            expandedEventId === event.id && "rotate-180 text-neon-tertiary"
                          )} 
                        />
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-on-void font-bold text-sm group-hover:text-neon-tertiary transition-colors">
                        {highlightText(event.title, searchQuery)}
                      </h3>
                      {event.algaReport && (
                        <div className={cn(
                          "px-1.5 py-0.5 rounded text-[8px] font-bold border flex items-center gap-1",
                          event.algaReport.decision === 'ACCEPT' ? "border-neon-primary bg-neon-primary/10 text-neon-primary" : 
                          event.algaReport.decision === 'QUARANTINE' ? "border-amber-500 bg-amber-500/10 text-amber-500" :
                          "border-red-500 bg-red-500/10 text-red-500"
                        )}>
                          ALGA: {event.algaReport.composite.toFixed(1)}
                        </div>
                      )}
                      {event.status && (
                        <div className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1",
                          statusBadgeConfig[event.status].color.replace('text-', 'border-'),
                          statusBadgeConfig[event.status].bg,
                          statusBadgeConfig[event.status].color
                        )}>
                          {React.createElement(statusBadgeConfig[event.status].icon, { size: 10 })}
                          {event.status.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="text-on-void-muted text-xs leading-relaxed max-w-2xl">
                      {highlightText(event.description, searchQuery)}
                    </p>

                    <AnimatePresence>
                      {expandedEventId === event.id && event.details && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 pt-6 border-t border-ghost-border space-y-6">
                            {/* ALGA Detailed Report */}
                            {event.algaReport && (
                              <div className="bg-void/40 p-4 rounded-xl border border-ghost-border/30 space-y-4 shadow-inner">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-neon-tertiary flex items-center gap-2">
                                    <ShieldCheck size={12} />
                                    ALGA Policy Verification
                                  </h4>
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                                    event.algaReport.decision === 'ACCEPT' ? "text-neon-primary bg-neon-primary/10 border-neon-primary/20" : 
                                    event.algaReport.decision === 'QUARANTINE' ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
                                    "text-red-500 bg-red-500/10 border-red-500/20"
                                  )}>
                                    DECISION: {event.algaReport.decision}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  {[
                                    { label: 'Composite', val: event.algaReport.composite },
                                    { label: 'Accuracy', val: event.algaReport.accuracy },
                                    { label: 'Logic', val: event.algaReport.logic },
                                    { label: 'Governance', val: event.algaReport.governance },
                                    { label: 'Alignment', val: event.algaReport.alignment }
                                  ].map(item => (
                                    <div key={item.label} className="space-y-1">
                                      <div className="text-[8px] uppercase text-on-void-muted font-mono">{item.label}</div>
                                      <div className="h-1 bg-void rounded-full overflow-hidden">
                                        <motion.div 
                                          initial={{ width: 0 }}
                                          animate={{ width: `${item.val}%` }}
                                          className={cn(
                                            "h-full rounded-full transition-all",
                                            item.val >= 90 ? "bg-neon-primary" : 
                                            item.val >= 70 ? "bg-amber-500" : "bg-red-500"
                                          )}
                                        />
                                      </div>
                                      <div className="text-[10px] font-bold text-on-void text-right">{item.val}%</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                             {/* Metrics Grid */}
                            {event.details.metrics && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(event.details.metrics).map(([label, value]) => (
                                  <div key={label} className="bg-void/40 p-3 rounded-xl border border-ghost-border/30">
                                    <div className="text-[9px] uppercase tracking-tighter text-on-void-muted mb-1 font-mono">{label}</div>
                                    <div className="text-xs font-bold text-on-void">{value}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Logs Section */}
                            <div className="space-y-3">
                              <h4 className="text-[10px] uppercase tracking-widest font-bold text-neon-tertiary flex items-center gap-2">
                                <History size={12} />
                                Operational Logs
                              </h4>
                              <div className="bg-void/60 rounded-xl p-4 font-mono text-[10px] space-y-1.5 border border-ghost-border/50">
                                {event.details.logs.map((log, li) => (
                                  <div key={li} className="flex gap-3">
                                    <span className="text-on-void-muted shrink-0">[{li.toString().padStart(2, '0')}]</span>
                                    <span className="text-on-void/70">{log}</span>
                                  </div>
                                ))}
                                <motion.div 
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.8, repeat: Infinity }}
                                  className="inline-block w-1.5 h-3 bg-neon-tertiary translate-y-0.5 ml-1" 
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
            
            {filteredData.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-on-void-muted">
                <Search size={40} className="opacity-20 mb-4" />
                <p className="text-sm">No matching operational records found.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-neon-tertiary text-xs font-bold uppercase tracking-widest hover:brightness-125"
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
