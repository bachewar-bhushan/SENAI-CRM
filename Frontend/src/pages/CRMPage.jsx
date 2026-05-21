import { useEffect } from 'react';
import { FiMessageSquare, FiMail, FiPenTool } from 'react-icons/fi';
import { useCrmStore } from '../store/crmStore';
import { useContacts } from '../hooks/useContacts';
import { useThreads } from '../hooks/useThreads';
import { ContactSearch } from '../components/crm/ContactSearch';
import { ContactCard } from '../components/crm/ContactCard';
import { ThreadList } from '../components/crm/ThreadList';
import { EmailThread } from '../components/crm/EmailThread';
import { ReplyComposer } from '../components/crm/ReplyComposer';
import { ActionButtons } from '../components/crm/ActionButtons';
import { AgentDemo } from '../components/agent/AgentDemo';
import { AgentReasoningPanel } from '../components/crm/AgentReasoningPanel';
import { RAGContextPanel } from '../components/crm/RAGContextPanel';

export const CRMPage = () => {
  const { selectedEmail, contact, error } = useCrmStore();

  useContacts(selectedEmail);
  useThreads(selectedEmail);

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Customer Management</h1>
          <p className="text-slate-600">Manage contacts, threads, and communications from one workspace</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg mb-6 flex items-center gap-2">
            <FiMail size={20} />
            {error}
          </div>
        )}

        {/* Agent Demo - Full Width */}
        <div className="mb-8">
          <AgentDemo />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-4">
              <ContactSearch />
            </div>
            <ContactCard />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <FiMessageSquare className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Conversation Threads</h2>
              </div>
              <div className="p-6">
                <ThreadList />
              </div>
            </div>

            <div className="glass-panel overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <FiMail className="text-cyan-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Email Conversation</h2>
              </div>
              <div className="p-6">
                <EmailThread />
              </div>
            </div>

            <AgentReasoningPanel />

            <RAGContextPanel />

            <ActionButtons />

            <div className="glass-panel overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <FiPenTool className="text-green-600" size={24} />
                <h2 className="text-xl font-semibold text-slate-900">Compose Reply</h2>
              </div>
              <div className="p-6">
                <ReplyComposer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
