import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  HardDrive, 
  FileText, 
  FileSpreadsheet, 
  CheckSquare, 
  Folder, 
  File, 
  Plus, 
  Trash2, 
  Search, 
  User, 
  ChevronRight, 
  RefreshCw, 
  ArrowLeft, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  LogOut,
  Send,
  Calendar,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from '../../context/FirebaseContext';

// Define TS Interfaces for Google API structures
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

interface TaskList {
  id: string;
  title: string;
  updated?: string;
}

interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
}

export function WorkspaceDashboard() {
  const { user, accessToken, signIn, signOut, setAccessToken } = useFirebase();
  const [activeSubTab, setActiveSubTab] = useState<'drive' | 'docs' | 'sheets' | 'tasks'>('drive');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Search / Filters ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Drive State ---
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [folderHistory, setFolderHistory] = useState<{ id: string; name: string }[]>([{ id: 'root', name: 'Drive Root' }]);

  // --- Docs State ---
  const [docList, setDocList] = useState<DriveFile[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedDocData, setSelectedDocData] = useState<{ title: string; content: string } | null>(null);
  const [newDocText, setNewDocText] = useState('');

  // --- Sheets State ---
  const [sheetsList, setSheetsList] = useState<DriveFile[]>([]);
  const [selectedSheetId, setSelectedSheetId] = useState<string | null>(null);
  const [selectedSheetData, setSelectedSheetData] = useState<{ title: string; values: string[][] } | null>(null);
  const [newRowCols, setNewRowCols] = useState<string[]>(['', '', '', '']);

  // --- Tasks State ---
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null);
  const [taskListTasks, setTaskListTasks] = useState<GoogleTask[]>([]);
  const [newTaskListTitle, setNewTaskListTitle] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // --- Custom Confirmation Modal State ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    confirmText?: string;
    type?: 'info' | 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
    confirmText: 'Confirm',
    type: 'info'
  });

  // --- Creators modals / forms ---
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'doc' | 'sheet' | 'text'>('doc');

  // Trigger modal confirmation
  const requestConfirmation = (
    title: string, 
    message: string, 
    action: () => Promise<void>, 
    confirmText = 'Confirm',
    type: 'info' | 'danger' | 'warning' = 'info'
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      action: async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
          await action();
        } catch (err: any) {
          setErrorMsg(err?.message || 'Action failed.');
        } finally {
          setIsLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      },
      confirmText,
      type
    });
  };

  // Safe Google API fetcher wrapping that handles token expiration
  const googleFetch = async (url: string, options: RequestInit = {}) => {
    if (!accessToken) {
      throw new Error('Access token unavailable. Please authorize again.');
    }
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      // Clear token and prompt reauth
      setAccessToken(null);
      throw new Error('Google authorization expired. Please log in again.');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Google API error: ${response.status}`);
    }
    
    return response;
  };

  // --- API CALLS ---

  // 1. Fetch Drive Files
  const fetchDriveFiles = async (folderId = currentFolderId) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const query = `'${folderId}' in parents and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&orderBy=folder,name`;
      const res = await googleFetch(url);
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch Drive files.');
    } finally {
      setIsLoading(false);
    }
  };

  // Search Drive files broadly
  const searchBroadFiles = async () => {
    if (!searchQuery.trim()) {
      fetchDriveFiles();
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const query = `name contains '${searchQuery.replace(/'/g, "\\'")}' and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime,webViewLink)&pageSize=30`;
      const res = await googleFetch(url);
      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to search files.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Drive: Create Folder (Mutating - Confirmation Guarded)
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const action = async () => {
      const body = {
        name: newFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [currentFolderId]
      };
      await googleFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      await fetchDriveFiles();
    };

    requestConfirmation(
      'Create New Folder',
      `Create folder "${newFolderName}" under the current directory in Google Drive?`,
      action,
      'Create Folder',
      'info'
    );
  };

  // 3. Drive: Create File (Doc/Sheet/Text) (Mutating - Confirmation Guarded)
  const handleCreateFile = async () => {
    if (!newFileName.trim()) return;
    
    const action = async () => {
      let mimeType = 'text/plain';
      if (newFileType === 'doc') mimeType = 'application/vnd.google-apps.document';
      if (newFileType === 'sheet') mimeType = 'application/vnd.google-apps.spreadsheet';

      const body = {
        name: newFileName,
        mimeType,
        parents: [currentFolderId]
      };
      
      await googleFetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      setNewFileName('');
      setIsCreateFileOpen(false);
      await fetchDriveFiles();
      // Reload sub-tabs
      if (newFileType === 'doc') await fetchDocsList();
      if (newFileType === 'sheet') await fetchSheetsList();
    };

    requestConfirmation(
      'Create New File',
      `Generate a new ${newFileType === 'doc' ? 'Google Document' : newFileType === 'sheet' ? 'Google Spreadsheet' : 'Text File'} named "${newFileName}" in Google Drive?`,
      action,
      'Create File',
      'info'
    );
  };

  // 4. Drive: Delete File (Mutating - Confirmation Guarded)
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    const action = async () => {
      await googleFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE'
      });
      await fetchDriveFiles();
      // Reset selected items if deleted
      if (fileId === selectedDocId) {
        setSelectedDocId(null);
        setSelectedDocData(null);
      }
      if (fileId === selectedSheetId) {
        setSelectedSheetId(null);
        setSelectedSheetData(null);
      }
    };

    requestConfirmation(
      'Delete File / Folder',
      `Permanently delete "${fileName}" from Google Drive? This action cannot be undone.`,
      action,
      'Delete Permanently',
      'danger'
    );
  };

  // 5. Docs: Fetch Doc List
  const fetchDocsList = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const query = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=15`;
      const res = await googleFetch(url);
      const data = await res.json();
      setDocList(data.files || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch document lists.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Docs: Fetch Single Document Content
  const fetchDocContent = async (docId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleFetch(`https://www.googleapis.com/docs/v1/documents/${docId}`);
      const data = await res.json();
      
      // Extract structural text content
      let text = '';
      if (data?.body?.content) {
        data.body.content.forEach((el: any) => {
          if (el.paragraph?.elements) {
            el.paragraph.elements.forEach((pe: any) => {
              if (pe.textRun?.content) {
                text += pe.textRun.content;
              }
            });
          }
        });
      }
      
      setSelectedDocData({
        title: data.title || 'Untitled Document',
        content: text || 'Empty Document'
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to read document contents.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Docs: Append Text (Mutating - Confirmation Guarded)
  const handleAppendDocText = async () => {
    if (!selectedDocId || !newDocText.trim()) return;

    const action = async () => {
      const body = {
        requests: [
          {
            insertText: {
              text: `\n\n${newDocText}`,
              endOfSegmentLocation: {}
            }
          }
        ]
      };
      await googleFetch(`https://www.googleapis.com/docs/v1/documents/${selectedDocId}:batchUpdate`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      setNewDocText('');
      await fetchDocContent(selectedDocId);
    };

    requestConfirmation(
      'Append Text to Google Doc',
      `Append the written note to the document "${selectedDocData?.title}"?`,
      action,
      'Append Note',
      'info'
    );
  };

  // 8. Sheets: Fetch Sheets List
  const fetchSheetsList = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const query = "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false";
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=15`;
      const res = await googleFetch(url);
      const data = await res.json();
      setSheetsList(data.files || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch spreadsheet files.');
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Sheets: Read Spreadsheet Values
  const fetchSheetContent = async (sheetId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // First, get sheet title and metadata to discover the first sheet name
      const metaRes = await googleFetch(`https://www.googleapis.com/sheets/v4/spreadsheets/${sheetId}`);
      const metaData = await metaRes.json();
      const firstSheetName = metaData.sheets?.[0]?.properties?.title || 'Sheet1';
      
      // Load grid values (retrieve top 40 rows and columns A-G)
      const range = `${encodeURIComponent(firstSheetName)}!A1:G40`;
      const valuesRes = await googleFetch(`https://www.googleapis.com/sheets/v4/spreadsheets/${sheetId}/values/${range}`);
      const valuesData = await valuesRes.json();
      
      setSelectedSheetData({
        title: metaData.properties?.title || 'Untitled Spreadsheet',
        values: valuesData.values || [['No data']]
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to read spreadsheet contents.');
    } finally {
      setIsLoading(false);
    }
  };

  // 10. Sheets: Append Spreadsheet Row (Mutating - Confirmation Guarded)
  const handleAppendSheetRow = async () => {
    if (!selectedSheetId || !selectedSheetData) return;
    
    // Filter out blank trailing values but keep standard array
    const rowValues = newRowCols.map(v => v.trim());
    if (rowValues.every(v => v === '')) return;

    const action = async () => {
      const range = 'Sheet1!A1'; // Let Google automatically append at the end of Sheet1
      const body = {
        values: [rowValues]
      };
      
      await googleFetch(`https://www.googleapis.com/sheets/v4/spreadsheets/${selectedSheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      setNewRowCols(['', '', '', '']);
      await fetchSheetContent(selectedSheetId);
    };

    requestConfirmation(
      'Append Rows in Google Sheet',
      `Append the custom row values [${rowValues.filter(Boolean).join(', ')}] into spreadsheet "${selectedSheetData.title}"?`,
      action,
      'Append Row',
      'info'
    );
  };

  // 11. Tasks: Fetch Task Lists
  const fetchTaskLists = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleFetch('https://www.googleapis.com/tasks/v1/users/@default/lists');
      const data = await res.json();
      setTaskLists(data.items || []);
      if (data.items?.length > 0 && !selectedTaskListId) {
        setSelectedTaskListId(data.items[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load task lists.');
    } finally {
      setIsLoading(false);
    }
  };

  // 12. Tasks: Fetch Tasks in selected list
  const fetchTasks = async (listId: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await googleFetch(`https://www.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`);
      const data = await res.json();
      setTaskListTasks(data.items || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to fetch tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  // 13. Tasks: Create Custom Task List (Mutating - Confirmation Guarded)
  const handleCreateTaskList = async () => {
    if (!newTaskListTitle.trim()) return;

    const action = async () => {
      const res = await googleFetch('https://www.googleapis.com/tasks/v1/users/@default/lists', {
        method: 'POST',
        body: JSON.stringify({ title: newTaskListTitle })
      });
      const data = await res.json();
      setNewTaskListTitle('');
      await fetchTaskLists();
      if (data.id) {
        setSelectedTaskListId(data.id);
      }
    };

    requestConfirmation(
      'Create Google Task List',
      `Create a new Google Tasks category list named "${newTaskListTitle}"?`,
      action,
      'Create List',
      'info'
    );
  };

  // 14. Tasks: Add Task (Mutating - Confirmation Guarded)
  const handleAddTask = async () => {
    if (!selectedTaskListId || !newTaskTitle.trim()) return;

    const action = async () => {
      const body: any = {
        title: newTaskTitle
      };
      if (newTaskNotes.trim()) body.notes = newTaskNotes;
      if (newTaskDueDate.trim()) {
        body.due = new Date(newTaskDueDate).toISOString();
      }

      await googleFetch(`https://www.googleapis.com/tasks/v1/lists/${selectedTaskListId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDueDate('');
      await fetchTasks(selectedTaskListId);
    };

    requestConfirmation(
      'Add Task to Google Tasks',
      `Add task "${newTaskTitle}" to your selected Google Task list?`,
      action,
      'Add Task',
      'info'
    );
  };

  // 15. Tasks: Toggle Completion (Mutating - Confirmation Guarded)
  const handleToggleTaskStatus = async (task: GoogleTask) => {
    if (!selectedTaskListId) return;
    const nextStatus = task.status === 'completed' ? 'needsAction' : 'completed';

    const action = async () => {
      await googleFetch(`https://www.googleapis.com/tasks/v1/lists/${selectedTaskListId}/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          id: task.id,
          status: nextStatus
        })
      });
      await fetchTasks(selectedTaskListId);
    };

    requestConfirmation(
      'Toggle Task Status',
      `Mark the task "${task.title}" as ${nextStatus === 'completed' ? 'Completed' : 'Active'}?`,
      action,
      'Toggle Status',
      'warning'
    );
  };

  // 16. Tasks: Delete Task (Mutating - Confirmation Guarded)
  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!selectedTaskListId) return;

    const action = async () => {
      await googleFetch(`https://www.googleapis.com/tasks/v1/lists/${selectedTaskListId}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      await fetchTasks(selectedTaskListId);
    };

    requestConfirmation(
      'Delete Google Task',
      `Permanently delete the task "${taskTitle}"? This cannot be undone.`,
      action,
      'Delete Task',
      'danger'
    );
  };

  // Trigger loading when tab changes or selection changes
  useEffect(() => {
    if (!accessToken) return;
    
    if (activeSubTab === 'drive') {
      fetchDriveFiles();
    } else if (activeSubTab === 'docs') {
      fetchDocsList();
    } else if (activeSubTab === 'sheets') {
      fetchSheetsList();
    } else if (activeSubTab === 'tasks') {
      fetchTaskLists();
    }
  }, [activeSubTab, accessToken, currentFolderId]);

  useEffect(() => {
    if (accessToken && selectedTaskListId) {
      fetchTasks(selectedTaskListId);
    }
  }, [selectedTaskListId, accessToken]);

  // Navigate folder helper
  const enterFolder = (folderId: string, folderName: string) => {
    setFolderHistory(prev => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
  };

  const navigateToHistoryIndex = (idx: number) => {
    const nextHistory = folderHistory.slice(0, idx + 1);
    const target = nextHistory[nextHistory.length - 1];
    setFolderHistory(nextHistory);
    setCurrentFolderId(target.id);
  };

  // Check if fully authorized
  if (!user || !accessToken) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center bg-void relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03)_0%,transparent_50%)]" />
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col items-center gap-8 relative z-10 text-center px-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-surface-high border border-ghost-border flex items-center justify-center text-neon-primary shadow-[0_0_40px_rgba(16,185,129,0.1)]">
            <Share2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-void tracking-tight mb-2 uppercase font-display italic">Workspace Integration</h1>
            <p className="text-on-void-muted text-sm leading-relaxed px-4">
              Authorize secure Google Workspace connection to synchronise with <span className="text-neon-primary font-bold">Google Tasks</span>, <span className="text-neon-primary font-bold">Drive</span>, <span className="text-neon-primary font-bold">Docs</span>, and <span className="text-neon-primary font-bold">Sheets</span> APIs.
            </p>
          </div>
          
          <button 
            onClick={signIn}
            className="w-full py-4 bg-neon-primary text-void rounded-xl font-bold uppercase tracking-[0.2em] text-xs shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Authenticate Workspace Access
          </button>
          
          <div className="flex flex-col items-center gap-1 opacity-40">
            <p className="text-[10px] font-mono text-on-void-muted uppercase tracking-wider italic font-bold">Direct Client API Handshake Secure</p>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-void text-on-void font-sans overflow-hidden">
      {/* Header Panel */}
      <header className="px-6 py-4 bg-surface-low border-b border-ghost-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-high border border-ghost-border flex items-center justify-center text-neon-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Share2 size={20} />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-on-void uppercase font-display italic">Workspace Core</h1>
            <p className="text-[10px] text-neon-primary font-mono uppercase tracking-wider">Synchronised Handshake Active</p>
          </div>
        </div>

        {/* User Identity widget */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-high/60 px-3 py-1.5 rounded-lg border border-ghost-border/40 text-xs text-on-void-muted">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || ''} className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <User size={12} className="text-neon-primary" />
            )}
            <span className="font-mono text-[10px] text-on-void max-w-[120px] truncate">{user.email}</span>
          </div>
          <button 
            onClick={signOut}
            className="p-2 hover:bg-surface-high text-on-void-muted hover:text-red-400 rounded-lg border border-transparent hover:border-ghost-border transition-all"
            title="Disconnect Google"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Main Body with tabs */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation side column */}
        <aside className="w-56 bg-surface-low border-r border-ghost-border flex flex-col p-3 gap-1 shrink-0">
          <div className="text-[9px] font-mono text-on-void-muted uppercase tracking-wider px-3 mb-2 font-bold">Workspace Nodes</div>
          
          <button
            onClick={() => setActiveSubTab('drive')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeSubTab === 'drive' 
                ? 'bg-surface-high text-on-void border-l-2 border-neon-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
            }`}
          >
            <HardDrive size={14} className={activeSubTab === 'drive' ? 'text-neon-primary' : ''} />
            <span>Drive Explorer</span>
          </button>

          <button
            onClick={() => setActiveSubTab('docs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeSubTab === 'docs' 
                ? 'bg-surface-high text-on-void border-l-2 border-neon-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
            }`}
          >
            <FileText size={14} className={activeSubTab === 'docs' ? 'text-neon-primary' : ''} />
            <span>Doc Reader</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sheets')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeSubTab === 'sheets' 
                ? 'bg-surface-high text-on-void border-l-2 border-neon-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
            }`}
          >
            <FileSpreadsheet size={14} className={activeSubTab === 'sheets' ? 'text-neon-primary' : ''} />
            <span>Sheets Grid</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
              activeSubTab === 'tasks' 
                ? 'bg-surface-high text-on-void border-l-2 border-neon-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
            }`}
          >
            <CheckSquare size={14} className={activeSubTab === 'tasks' ? 'text-neon-primary' : ''} />
            <span>Tasks Planner</span>
          </button>

          {/* Quick Stats Panel */}
          <div className="mt-auto bg-surface-high/30 border border-ghost-border/30 rounded-xl p-3">
            <span className="text-[8px] font-mono text-neon-primary uppercase tracking-widest block mb-1">Logic Status</span>
            <div className="space-y-1 text-[10px] font-mono text-on-void-muted">
              <div className="flex justify-between">
                <span>API Network</span>
                <span className="text-neon-primary font-bold">Online</span>
              </div>
              <div className="flex justify-between">
                <span>SSL Encrypted</span>
                <span className="text-neon-primary">Active</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Display area */}
        <section className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Top error / success feedback drawer */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-950/70 border-b border-red-500/30 text-red-300 text-xs py-3 px-6 flex items-center justify-between z-20"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="hover:text-red-100 font-bold uppercase text-[10px] font-mono tracking-wider ml-4"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LOADING COVER OVERLAY */}
          {isLoading && (
            <div className="absolute inset-0 bg-void/50 backdrop-blur-[1px] flex items-center justify-center z-30 pointer-events-none">
              <div className="flex items-center gap-3 bg-surface-high border border-ghost-border px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <RefreshCw size={14} className="animate-spin text-neon-primary" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-on-void">Transmitting...</span>
              </div>
            </div>
          )}

          {/* 1. DRIVE EXPLORER SUB-TAB */}
          {activeSubTab === 'drive' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Path and Actions Bar */}
              <div className="px-6 py-3 bg-surface-low/50 border-b border-ghost-border flex flex-wrap items-center justify-between gap-3 shrink-0">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-1.5 text-xs text-on-void-muted overflow-x-auto py-1">
                  {folderHistory.map((folder, idx) => (
                    <React.Fragment key={folder.id}>
                      {idx > 0 && <ChevronRight size={12} className="text-ghost-border shrink-0" />}
                      <button
                        onClick={() => navigateToHistoryIndex(idx)}
                        className={`hover:text-neon-primary font-mono transition-colors shrink-0 ${
                          idx === folderHistory.length - 1 ? 'text-on-void font-bold' : ''
                        }`}
                      >
                        {folder.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Main Operations */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreateFolderOpen(true)}
                    className="px-3 py-1.5 bg-surface-high border border-ghost-border hover:border-neon-primary/50 text-on-void rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Folder size={12} className="text-neon-primary" />
                    <span>New Folder</span>
                  </button>
                  <button
                    onClick={() => setIsCreateFileOpen(true)}
                    className="px-3 py-1.5 bg-neon-primary text-void hover:brightness-110 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  >
                    <Plus size={12} />
                    <span>New File</span>
                  </button>
                </div>
              </div>

              {/* Broad Search & Local Filter bar */}
              <div className="px-6 py-2 bg-surface-low/30 border-b border-ghost-border/40 flex items-center gap-3 shrink-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 text-on-void-muted" size={13} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchBroadFiles()}
                    placeholder="Search folder or press Enter to search entire Drive..."
                    className="w-full pl-9 pr-4 py-1.5 bg-surface-high border border-ghost-border/60 focus:border-neon-primary rounded-lg text-xs outline-none text-on-void placeholder-on-void-muted/60 font-mono transition-colors"
                  />
                </div>
                <button
                  onClick={searchBroadFiles}
                  className="px-3 py-1.5 bg-surface-high border border-ghost-border text-on-void-muted hover:text-on-void rounded-lg text-xs font-semibold transition-all"
                >
                  Search
                </button>
                <button
                  onClick={() => { setSearchQuery(''); fetchDriveFiles(); }}
                  className="p-1.5 bg-surface-high border border-ghost-border text-on-void-muted hover:text-on-void rounded-lg transition-all"
                  title="Reload folder"
                >
                  <RefreshCw size={13} />
                </button>
              </div>

              {/* Folder list contents */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="bg-surface-low border border-ghost-border/60 rounded-xl overflow-hidden shadow-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-high/50 border-b border-ghost-border text-on-void-muted uppercase font-mono tracking-wider text-[10px]">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Mime Type</th>
                        <th className="py-3 px-4 text-right">Size</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ghost-border/40 font-mono">
                      {driveFiles.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-on-void-muted">
                            Empty folder or no search results found.
                          </td>
                        </tr>
                      ) : (
                        driveFiles.map(file => {
                          const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                          return (
                            <tr key={file.id} className="hover:bg-surface-high/30 transition-colors">
                              <td className="py-3 px-4 flex items-center gap-3">
                                {isFolder ? (
                                  <Folder size={14} className="text-neon-primary shrink-0" />
                                ) : (
                                  <File size={14} className="text-on-void-muted shrink-0" />
                                )}
                                {isFolder ? (
                                  <button
                                    onClick={() => enterFolder(file.id, file.name)}
                                    className="text-on-void font-semibold text-left hover:text-neon-primary hover:underline transition-all"
                                  >
                                    {file.name}
                                  </button>
                                ) : (
                                  <span className="text-on-void font-medium">{file.name}</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-on-void-muted text-[10px] max-w-[200px] truncate">
                                {file.mimeType.replace('application/', '').replace('vnd.google-apps.', '')}
                              </td>
                              <td className="py-3 px-4 text-right text-on-void-muted text-[10px]">
                                {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : '—'}
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                {file.webViewLink && (
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noreferrer referrer"
                                    className="p-1 hover:bg-surface-high/60 hover:text-neon-primary text-on-void-muted inline-flex items-center rounded transition-all"
                                    title="Open directly in Google Workspace"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteFile(file.id, file.name)}
                                  className="p-1 hover:bg-surface-high/60 text-on-void-muted hover:text-red-400 inline-flex items-center rounded transition-all"
                                  title="Delete permanently"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. DOCS TAB (DOCUMENT SELECTION AND MUTATIONS) */}
          {activeSubTab === 'docs' && (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Document Lists panel */}
              <div className="w-72 bg-surface-low border-r border-ghost-border flex flex-col overflow-hidden">
                <div className="p-4 border-b border-ghost-border flex items-center justify-between shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-void-muted">Recent Docs</span>
                  <button 
                    onClick={fetchDocsList} 
                    className="p-1 text-on-void-muted hover:text-on-void rounded"
                    title="Refresh List"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {docList.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => { setSelectedDocId(doc.id); fetchDocContent(doc.id); }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-start gap-2.5 ${
                        selectedDocId === doc.id 
                          ? 'bg-surface-high border-l-2 border-neon-primary text-on-void' 
                          : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
                      }`}
                    >
                      <FileText size={13} className="mt-0.5 text-neon-primary shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">{doc.name}</p>
                        <p className="text-[9px] text-on-void-muted/60 mt-0.5">
                          {doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </button>
                  ))}
                  {docList.length === 0 && (
                    <p className="text-center text-xs text-on-void-muted py-6">No Google Documents found.</p>
                  )}
                </div>
              </div>

              {/* Main Document View & Editor */}
              <div className="flex-1 flex flex-col overflow-hidden p-6">
                {selectedDocId && selectedDocData ? (
                  <div className="flex-1 flex flex-col overflow-hidden bg-surface-low border border-ghost-border rounded-xl">
                    {/* Doc Title header */}
                    <div className="px-6 py-4 bg-surface-high/50 border-b border-ghost-border flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-on-void flex items-center gap-2">
                          <FileText size={16} className="text-neon-primary" />
                          <span>{selectedDocData.title}</span>
                        </h2>
                        <span className="text-[8px] font-mono text-on-void-muted uppercase tracking-widest">Document Workspace</span>
                      </div>
                      <a
                        href={`https://docs.google.com/document/d/${selectedDocId}/edit`}
                        target="_blank"
                        rel="noreferrer referrer"
                        className="px-2.5 py-1.5 bg-surface-high border border-ghost-border text-on-void-muted hover:text-on-void rounded-lg text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink size={11} />
                        <span>Open in Google Docs</span>
                      </a>
                    </div>

                    {/* Doc Content Box */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-surface-high/10 text-xs font-sans text-on-void-muted leading-relaxed whitespace-pre-wrap select-text">
                      {selectedDocData.content || 'No text content available in document.'}
                    </div>

                    {/* Append Tool Box (Mutating) */}
                    <div className="p-4 border-t border-ghost-border bg-surface-low/80 space-y-3">
                      <div>
                        <span className="text-[9px] font-mono text-neon-primary uppercase tracking-widest font-bold">Append Document Node</span>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          rows={2}
                          value={newDocText}
                          onChange={(e) => setNewDocText(e.target.value)}
                          placeholder="Type notes or sections to securely append at the end of this Google Document..."
                          className="flex-1 bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-lg p-2 text-on-void placeholder-on-void-muted/60"
                        />
                        <button
                          onClick={handleAppendDocText}
                          className="px-4 bg-neon-primary text-void hover:brightness-110 font-bold uppercase text-[10px] tracking-widest rounded-lg flex flex-col items-center justify-center gap-1 transition-all shrink-0"
                        >
                          <Send size={12} />
                          <span>Append</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-ghost-border/60 rounded-xl bg-surface-low/30">
                    <FileText size={48} className="text-on-void-muted/30 mb-4 animate-pulse" />
                    <p className="text-xs text-on-void-muted">Select a Google Document from the panel to read and append notes.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. SHEETS TAB (GRID RENDERER AND ADD ROW MUTATION) */}
          {activeSubTab === 'sheets' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Sheets list panel */}
              <div className="w-72 bg-surface-low border-r border-ghost-border flex flex-col overflow-hidden">
                <div className="p-4 border-b border-ghost-border flex items-center justify-between shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-void-muted">Recent Sheets</span>
                  <button 
                    onClick={fetchSheetsList} 
                    className="p-1 text-on-void-muted hover:text-on-void rounded"
                    title="Refresh List"
                  >
                    <RefreshCw size={12} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {sheetsList.map(sheet => (
                    <button
                      key={sheet.id}
                      onClick={() => { setSelectedSheetId(sheet.id); fetchSheetContent(sheet.id); }}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-start gap-2.5 ${
                        selectedSheetId === sheet.id 
                          ? 'bg-surface-high border-l-2 border-neon-primary text-on-void' 
                          : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
                      }`}
                    >
                      <FileSpreadsheet size={13} className="mt-0.5 text-neon-primary shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate">{sheet.name}</p>
                        <p className="text-[9px] text-on-void-muted/60 mt-0.5">
                          {sheet.modifiedTime ? new Date(sheet.modifiedTime).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </button>
                  ))}
                  {sheetsList.length === 0 && (
                    <p className="text-center text-xs text-on-void-muted py-6">No Google Spreadsheets found.</p>
                  )}
                </div>
              </div>

              {/* Sheet Grid content */}
              <div className="flex-1 flex flex-col overflow-hidden p-6">
                {selectedSheetId && selectedSheetData ? (
                  <div className="flex-1 flex flex-col overflow-hidden bg-surface-low border border-ghost-border rounded-xl">
                    {/* Sheets Header */}
                    <div className="px-6 py-4 bg-surface-high/50 border-b border-ghost-border flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-bold text-on-void flex items-center gap-2">
                          <FileSpreadsheet size={16} className="text-neon-primary" />
                          <span>{selectedSheetData.title}</span>
                        </h2>
                        <span className="text-[8px] font-mono text-on-void-muted uppercase tracking-widest">Interactive Sheets Grid</span>
                      </div>
                      <a
                        href={`https://docs.google.com/spreadsheet/ccc?key=${selectedSheetId}`}
                        target="_blank"
                        rel="noreferrer referrer"
                        className="px-2.5 py-1.5 bg-surface-high border border-ghost-border text-on-void-muted hover:text-on-void rounded-lg text-[10px] uppercase font-mono tracking-wider flex items-center gap-1.5 transition-all"
                      >
                        <ExternalLink size={11} />
                        <span>Open in Google Sheets</span>
                      </a>
                    </div>

                    {/* Spreadsheet cells grid */}
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-surface-high/10">
                      <div className="inline-block min-w-full align-middle border border-ghost-border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-ghost-border/40 text-[11px] font-mono">
                          <tbody className="bg-surface-low divide-y divide-ghost-border/20">
                            {selectedSheetData.values.map((row, rowIdx) => (
                              <tr key={rowIdx} className={rowIdx === 0 ? 'bg-surface-high/60 font-bold border-b border-ghost-border text-neon-primary' : 'hover:bg-surface-high/20'}>
                                {/* Row index indicator */}
                                <td className="px-2 py-1.5 border-r border-ghost-border/30 bg-surface-high/30 text-[9px] text-on-void-muted text-center w-8 shrink-0">
                                  {rowIdx === 0 ? 'H' : rowIdx}
                                </td>
                                {row.map((cell, colIdx) => (
                                  <td key={colIdx} className="px-3 py-1.5 border-r border-ghost-border/10 text-on-void-muted min-w-[110px] max-w-[200px] truncate select-text">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Append Row tool */}
                    <div className="p-4 border-t border-ghost-border bg-surface-low/80 space-y-3">
                      <div>
                        <span className="text-[9px] font-mono text-neon-primary uppercase tracking-widest font-bold">Append Spreadsheet Record</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 grid grid-cols-4 gap-2">
                          {newRowCols.map((val, colIdx) => (
                            <input
                              key={colIdx}
                              type="text"
                              value={val}
                              onChange={(e) => {
                                const next = [...newRowCols];
                                next[colIdx] = e.target.value;
                                setNewRowCols(next);
                              }}
                              placeholder={`Column ${String.fromCharCode(65 + colIdx)}`}
                              className="bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-[11px] font-mono outline-none rounded-lg p-2 text-on-void placeholder-on-void-muted/60"
                            />
                          ))}
                        </div>
                        <button
                          onClick={handleAppendSheetRow}
                          className="px-4 py-2 bg-neon-primary text-void hover:brightness-110 font-bold uppercase text-[10px] tracking-widest rounded-lg flex items-center gap-1.5 transition-all"
                        >
                          <Plus size={12} />
                          <span>Add Row</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-ghost-border/60 rounded-xl bg-surface-low/30">
                    <FileSpreadsheet size={48} className="text-on-void-muted/30 mb-4 animate-pulse" />
                    <p className="text-xs text-on-void-muted">Select a Google Spreadsheet from the panel to view cell grids & append data rows.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. TASKS ORGANIZER TAB */}
          {activeSubTab === 'tasks' && (
            <div className="flex-1 flex overflow-hidden">
              {/* Task list sub-panel */}
              <div className="w-64 bg-surface-low border-r border-ghost-border flex flex-col overflow-hidden">
                <div className="p-4 border-b border-ghost-border space-y-3 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-void-muted">Task lists</span>
                  
                  {/* Create New Task List form */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newTaskListTitle}
                      onChange={(e) => setNewTaskListTitle(e.target.value)}
                      placeholder="New List Title..."
                      className="flex-1 bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-md px-2 py-1 text-on-void placeholder-on-void-muted/50"
                    />
                    <button
                      onClick={handleCreateTaskList}
                      className="p-1 bg-neon-primary text-void hover:brightness-110 rounded-md"
                      title="Create task list"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {taskLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedTaskListId(list.id)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                        selectedTaskListId === list.id 
                          ? 'bg-surface-high border-l-2 border-neon-primary text-on-void font-bold' 
                          : 'text-on-void-muted hover:bg-surface-high/30 hover:text-on-void'
                      }`}
                    >
                      <span className="truncate">{list.title}</span>
                      <ChevronRight size={12} className="opacity-50" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected List Task details */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {selectedTaskListId ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {/* Add Task creator bar */}
                    <div className="p-4 bg-surface-low/50 border-b border-ghost-border space-y-2.5 shrink-0">
                      <span className="text-[9px] font-mono text-neon-primary uppercase tracking-widest font-bold">Deploy New Task Node</span>
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Task title (e.g. Sync API payload validation)..."
                          className="flex-1 min-w-[200px] bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-lg px-3 py-2 text-on-void placeholder-on-void-muted/60 font-mono"
                        />
                        <input
                          type="text"
                          value={newTaskNotes}
                          onChange={(e) => setNewTaskNotes(e.target.value)}
                          placeholder="Task details/notes..."
                          className="flex-1 min-w-[150px] bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-lg px-3 py-2 text-on-void placeholder-on-void-muted/60 font-mono"
                        />
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-lg px-3 py-2 text-on-void-muted placeholder-on-void-muted/60 font-mono w-36 shrink-0"
                        />
                        <button
                          onClick={handleAddTask}
                          className="px-4 py-2 bg-neon-primary text-void hover:brightness-110 font-bold uppercase text-[10px] tracking-widest rounded-lg flex items-center gap-1.5 transition-all"
                        >
                          <Plus size={12} />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>

                    {/* Task list container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                      {taskListTasks.length === 0 ? (
                        <p className="text-center text-xs text-on-void-muted py-8">No tasks in this list. Create one above!</p>
                      ) : (
                        taskListTasks.map(task => {
                          const isCompleted = task.status === 'completed';
                          return (
                            <div 
                              key={task.id} 
                              className={`p-3 bg-surface-low border rounded-xl flex items-start justify-between gap-4 transition-all ${
                                isCompleted 
                                  ? 'border-ghost-border/30 opacity-60' 
                                  : 'border-ghost-border hover:border-neon-primary/40'
                              }`}
                            >
                              <div className="flex items-start gap-3 overflow-hidden">
                                <button
                                  onClick={() => handleToggleTaskStatus(task)}
                                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                    isCompleted 
                                      ? 'bg-neon-primary border-neon-primary text-void' 
                                      : 'border-ghost-border hover:border-neon-primary'
                                  }`}
                                >
                                  {isCompleted && <Check size={10} strokeWidth={3} />}
                                </button>
                                <div className="overflow-hidden">
                                  <p className={`text-xs font-mono font-semibold ${isCompleted ? 'line-through text-on-void-muted/70' : 'text-on-void'}`}>
                                    {task.title}
                                  </p>
                                  {task.notes && (
                                    <p className="text-[10px] text-on-void-muted leading-normal mt-1 font-sans">
                                      {task.notes}
                                    </p>
                                  )}
                                  {task.due && (
                                    <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase font-bold text-neon-primary/70 mt-2 bg-neon-primary/5 px-2 py-0.5 rounded border border-neon-primary/10">
                                      <Calendar size={8} />
                                      <span>Due {new Date(task.due).toLocaleDateString()}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteTask(task.id, task.title)}
                                className="p-1 hover:bg-surface-high/60 text-on-void-muted hover:text-red-400 rounded transition-all shrink-0"
                                title="Delete task permanently"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-ghost-border/60 rounded-xl m-6 bg-surface-low/30">
                    <CheckSquare size={48} className="text-on-void-muted/30 mb-4" />
                    <p className="text-xs text-on-void-muted">Select a Google Task list to view tasks and plan items.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </section>
      </div>

      {/* ========================================================================= */}
      {/* 5. OVERLAYS & MODALS */}

      {/* A. NEW FOLDER DIALOG */}
      {isCreateFolderOpen && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-surface-low border border-ghost-border rounded-xl shadow-2xl p-6"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-on-void mb-3 flex items-center gap-2">
              <Folder size={16} className="text-neon-primary" />
              <span>Create Folder</span>
            </h3>
            <p className="text-xs text-on-void-muted mb-4 leading-relaxed font-sans">Enter directory name to create inside the current Google Drive node.</p>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder Name (e.g. Code Assets)"
              className="w-full bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-lg p-3 text-on-void mb-5 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 justify-end text-xs">
              <button 
                onClick={() => setIsCreateFolderOpen(false)}
                className="px-4 py-2 bg-surface-high border border-ghost-border hover:text-on-void text-on-void-muted rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-neon-primary text-void hover:brightness-110 font-bold rounded-lg uppercase tracking-wide text-[10px]"
              >
                Create Folder
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* B. NEW FILE DIALOG */}
      {isCreateFileOpen && (
        <div className="fixed inset-0 bg-void/80 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-surface-low border border-ghost-border rounded-xl shadow-2xl p-6 space-y-4"
          >
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-on-void flex items-center gap-2">
                <File size={16} className="text-neon-primary" />
                <span>Create New File</span>
              </h3>
              <p className="text-xs text-on-void-muted mt-1 leading-relaxed font-sans">Configure name and node type to deploy to Google Drive.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-on-void-muted uppercase tracking-widest font-bold">File Name</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Filename (e.g. sprint_review)"
                className="w-full bg-surface-high border border-ghost-border/80 focus:border-neon-primary text-xs outline-none rounded-lg p-3 text-on-void font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-mono text-on-void-muted uppercase tracking-widest font-bold block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setNewFileType('doc')}
                  className={`py-2 rounded-lg text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all ${
                    newFileType === 'doc' 
                      ? 'bg-neon-primary/10 border-neon-primary text-on-void' 
                      : 'border-ghost-border/60 hover:border-ghost-border text-on-void-muted hover:text-on-void bg-surface-high/30'
                  }`}
                >
                  <FileText size={14} />
                  <span className="text-[10px]">Google Doc</span>
                </button>
                <button
                  onClick={() => setNewFileType('sheet')}
                  className={`py-2 rounded-lg text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all ${
                    newFileType === 'sheet' 
                      ? 'bg-neon-primary/10 border-neon-primary text-on-void' 
                      : 'border-ghost-border/60 hover:border-ghost-border text-on-void-muted hover:text-on-void bg-surface-high/30'
                  }`}
                >
                  <FileSpreadsheet size={14} />
                  <span className="text-[10px]">Google Sheet</span>
                </button>
                <button
                  onClick={() => setNewFileType('text')}
                  className={`py-2 rounded-lg text-center text-xs font-semibold flex flex-col items-center justify-center gap-1 border transition-all ${
                    newFileType === 'text' 
                      ? 'bg-neon-primary/10 border-neon-primary text-on-void' 
                      : 'border-ghost-border/60 hover:border-ghost-border text-on-void-muted hover:text-on-void bg-surface-high/30'
                  }`}
                >
                  <File size={14} />
                  <span className="text-[10px]">Text File</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 justify-end text-xs pt-2">
              <button 
                onClick={() => setIsCreateFileOpen(false)}
                className="px-4 py-2 bg-surface-high border border-ghost-border hover:text-on-void text-on-void-muted rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFile}
                className="px-4 py-2 bg-neon-primary text-void hover:brightness-110 font-bold rounded-lg uppercase tracking-wide text-[10px]"
              >
                Create File
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* C. GENERAL SYSTEM CONFIRMATION MODAL (MANDATORY ACTION BOUNDARY) */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-void/90 backdrop-blur-[3px] flex items-center justify-center z-[110] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-surface-low border border-ghost-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    confirmModal.type === 'danger' 
                      ? 'bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                      : confirmModal.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'bg-neon-primary/10 border-neon-primary text-neon-primary shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                  }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono tracking-widest text-on-void-muted">Security Sanction</h3>
                    <h2 className="text-sm font-bold text-on-void">{confirmModal.title}</h2>
                  </div>
                </div>
                <p className="text-xs text-on-void-muted leading-relaxed font-sans">{confirmModal.message}</p>
              </div>
              
              <div className="px-6 py-4 bg-surface-high/30 border-t border-ghost-border flex justify-end gap-2 text-xs">
                <button 
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 bg-surface-high border border-ghost-border hover:text-on-void text-on-void-muted rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmModal.action}
                  className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] shadow-sm transition-all ${
                    confirmModal.type === 'danger' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : confirmModal.type === 'warning'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-neon-primary hover:brightness-110 text-void'
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}
