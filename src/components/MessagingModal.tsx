import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Users, Search, CheckCheck } from 'lucide-react';
import { User, DirectMessage, Connection } from '../types';
import { StorageService } from '../services/storageService';

interface MessagingModalProps {
  currentUser: User;
  users: User[];
  connections: Connection[];
  messages: DirectMessage[];
  initialTargetUserId?: string;
  onClose: () => void;
  onRefreshData: () => void;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  currentUser,
  users,
  connections,
  messages,
  initialTargetUserId,
  onClose,
  onRefreshData,
}) => {
  // Find connected user IDs
  const connectedUserIds = useMemo(() => {
    return connections
      .filter((c) => c.status === 'ACCEPTED' && (c.requesterId === currentUser.id || c.receiverId === currentUser.id))
      .map((c) => (c.requesterId === currentUser.id ? c.receiverId : c.requesterId));
  }, [connections, currentUser.id]);

  // List of connected users to chat with (or include initialTargetUserId if provided)
  const chatPartners = useMemo(() => {
    const list = users.filter((u) => connectedUserIds.includes(u.id));
    if (initialTargetUserId && !list.some((u) => u.id === initialTargetUserId)) {
      const targetUser = users.find((u) => u.id === initialTargetUserId);
      if (targetUser) list.unshift(targetUser);
    }
    return list;
  }, [users, connectedUserIds, initialTargetUserId]);

  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    initialTargetUserId || chatPartners[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Active chat conversation
  const currentConversation = useMemo(() => {
    if (!selectedPartnerId) return [];
    return messages
      .filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === selectedPartnerId) ||
          (m.senderId === selectedPartnerId && m.receiverId === currentUser.id)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, currentUser.id, selectedPartnerId]);

  const selectedPartner = users.find((u) => u.id === selectedPartnerId);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (selectedPartnerId) {
      StorageService.markMessagesRead(selectedPartnerId, currentUser.id);
      onRefreshData();
    }
  }, [selectedPartnerId, currentUser.id]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartnerId) return;

    StorageService.sendMessage(currentUser.id, selectedPartnerId, inputText.trim());
    setInputText('');
    onRefreshData();
  };

  const filteredPartners = chatPartners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[620px] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">University Internal Messenger</h3>
              <p className="text-[11px] text-slate-400">Authenticated peer-to-peer communication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Left Sidebar Partners, Right Chat Box */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-72 sm:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-3 border-b border-slate-200">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredPartners.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No connected members found. Connect with alumni in the Directory to start chatting.
                </div>
              ) : (
                filteredPartners.map((partner) => {
                  const isSelected = partner.id === selectedPartnerId;
                  const unreadCount = messages.filter(
                    (m) => m.senderId === partner.id && m.receiverId === currentUser.id && !m.isRead
                  ).length;

                  return (
                    <button
                      key={partner.id}
                      onClick={() => setSelectedPartnerId(partner.id)}
                      className={`w-full p-3 flex items-center space-x-3 text-left transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/80 border-r-2 border-blue-600' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={partner.avatar}
                          alt={partner.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        {partner.status === 'ACTIVE' && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{partner.name}</h5>
                          {unreadCount > 0 && (
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{partner.jobTitle || partner.department}</p>
                        <span className="text-[10px] text-slate-400">{partner.company}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Chat Thread */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedPartner ? (
              <>
                {/* Active Partner Sub-header */}
                <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedPartner.avatar}
                      alt={selectedPartner.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{selectedPartner.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {selectedPartner.jobTitle} • {selectedPartner.company}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {selectedPartner.role}
                  </span>
                </div>

                {/* Messages Bubbles list */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/20">
                  {currentConversation.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-xs">Start a conversation with {selectedPartner.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Say hello, ask for mentorship advice, or discuss campus opportunities.
                      </p>
                    </div>
                  ) : (
                    currentConversation.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md px-3.5 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-xs'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.content}</p>
                          </div>
                          <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-400 px-1">
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Send Input Bar */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Type message to ${selectedPartner.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-2 rounded-lg text-white font-semibold cursor-pointer ${
                      inputText.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                Select a member on the left to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
