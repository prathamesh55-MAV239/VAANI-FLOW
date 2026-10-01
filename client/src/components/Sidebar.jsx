import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, LogOut, Check, X, Mic } from 'lucide-react';
import { useConversation } from '../hooks/useConversation';
import { useAuth } from '../hooks/useAuth';

export function Sidebar({ isOpen, onClose }) {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createConversation,
    renameConversation,
    deleteConversation,
    isLoadingConversations,
  } = useConversation();
  const { user, logout } = useAuth();

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conv, e) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = async (convId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(convId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (convId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(convId);
    }
  };

  // Group conversations by Today, Yesterday, Older
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups = {
    today: [],
    yesterday: [],
    older: [],
  };

  conversations.forEach((conv) => {
    const convDate = new Date(conv.updated_at || conv.created_at);
    if (convDate >= today) {
      groups.today.push(conv);
    } else if (convDate >= yesterday) {
      groups.yesterday.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  const renderGroup = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="px-3 text-[11px] font-mono tracking-wider uppercase text-vf-muted dark:text-zinc-500 mb-2 font-semibold">
          {title}
        </h3>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  selectConversation(conv.id);
                  if (onClose) onClose();
                }}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-vf-accent/10 dark:bg-vf-accent/20 text-vf-accent font-medium border border-vf-accent/30'
                    : 'text-vf-text dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-vf-accent' : 'text-vf-muted'}`} />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white dark:bg-zinc-800 text-xs px-2 py-1 rounded border border-vf-accent outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveEdit(conv.id, e)}
                        className="p-1 hover:text-green-500"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 hover:text-red-500"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleStartEdit(conv, e)}
                        className="p-1 text-vf-muted hover:text-vf-text dark:hover:text-white transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="p-1 text-vf-muted hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-vf-surface dark:bg-vf-darkSurface border-r border-vf-border dark:border-vf-darkBorder flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header: Brand & New Chat */}
        <div className="p-4 border-b border-vf-border dark:border-vf-darkBorder flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-vf-text dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Mic className="w-4 h-4 text-vf-accent" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-vf-text dark:text-white">
              VaaniFlow
            </span>
          </div>

          <button
            onClick={() => {
              createConversation('New Conversation');
              if (onClose) onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-vf-accent text-white font-medium text-xs hover:bg-vf-accent-hover transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Scrollable Conversation History */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoadingConversations && conversations.length === 0 ? (
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 bg-black/5 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-8 h-8 text-vf-muted dark:text-zinc-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-vf-muted dark:text-zinc-500">
                No past conversations yet. Tap "New" to start speaking.
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Today', groups.today)}
              {renderGroup('Yesterday', groups.yesterday)}
              {renderGroup('Previous', groups.older)}
            </>
          )}
        </div>

        {/* Bottom User Profile */}
        <div className="p-3 border-t border-vf-border dark:border-vf-darkBorder flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-vf-accent/15 text-vf-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-vf-text dark:text-white truncate">
                {user?.name || 'Guest User'}
              </div>
              <div className="text-[10px] text-vf-muted dark:text-zinc-500 truncate">
                {user?.email || 'Multilingual Session'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-vf-muted hover:text-red-500 rounded-lg hover:bg-black/5 dark:hover:bg-zinc-800 transition-colors"
            title="Log Out"
            aria-label="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
