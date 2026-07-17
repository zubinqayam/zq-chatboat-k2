/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { RightPanel } from './components/layout/RightPanel';
import { ChatArea } from './components/workspace/ChatArea';
import { MemoryTimeline } from './components/workspace/MemoryTimeline';
import { AgentsDashboard } from './components/workspace/AgentsDashboard';
import { ProjectsDashboard } from './components/workspace/ProjectsDashboard';
import { VaultDashboard } from './components/workspace/VaultDashboard';
import { WorkspaceDashboard } from './components/workspace/WorkspaceDashboard';
import { NewBranchModal } from './components/ui/NewBranchModal';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('workspace');

  const renderView = () => {
    switch (activeView) {
      case 'memory':
        return <MemoryTimeline />;
      case 'agents':
        return <AgentsDashboard />;
      case 'projects':
        return <ProjectsDashboard />;
      case 'vault':
        return <VaultDashboard />;
      case 'integrations':
        return <WorkspaceDashboard />;
      case 'workspace':
      default:
        return <ChatArea />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-void selection:bg-neon-primary selection:text-void">
      <TopNav />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          onNewBranch={() => setIsModalOpen(true)} 
          activeView={activeView}
          onNavigate={setActiveView}
        />
        {renderView()}
        <RightPanel />
      </div>
      
      <NewBranchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Surface Overlays */}
      <div className="fixed inset-0 scanline opacity-[0.03] pointer-events-none z-[60]" />
      <div className="fixed inset-0 pointer-events-none z-[60] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
      <div className="fixed inset-0 pointer-events-none z-[59] border-[24px] border-void opacity-40 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
