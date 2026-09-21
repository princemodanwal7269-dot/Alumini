import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Building,
  GraduationCap,
  Search,
} from 'lucide-react';
import { User, Connection } from '../types';
import { StorageService } from '../services/storageService';

interface MyNetworkProps {
  currentUser: User;
  users: User[];
  connections: Connection[];
  onRefreshData: () => void;
  onOpenMessages: (targetUserId: string) => void;
  onViewProfile: (user: User) => void;
}

export const MyNetwork: React.FC<MyNetworkProps> = ({
  currentUser,
  users,
  connections,
  onRefreshData,
  onOpenMessages,
  onViewProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'connections' | 'received' | 'sent'>('connections');
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Accepted Connections
  const acceptedConnectionUserIds = useMemo(() => {
    return connections
      .filter((c) => c.status === 'ACCEPTED' && (c.requesterId === currentUser.id || c.receiverId === currentUser.id))
      .map((c) => (c.requesterId === currentUser.id ? c.receiverId : c.requesterId));
  }, [connections, currentUser.id]);

  const acceptedConnections = useMemo(() => {
    return users.filter((u) => acceptedConnectionUserIds.includes(u.id));
  }, [users, acceptedConnectionUserIds]);

  // 2. Received Requests (pending)
  const receivedRequests = useMemo(() => {
    const pendingConns = connections.filter((c) => c.status === 'PENDING' && c.receiverId === currentUser.id);
    return pendingConns.map((c) => {
      const requester = users.find((u) => u.id === c.requesterId);
      return {
        connection: c,
        requester: requester || null,
      };
    });
  }, [connections, currentUser.id, users]);

  // 3. Sent Requests (pending)
  const sentRequests = useMemo(() => {
    const pendingConns = connections.filter((c) => c.status === 'PENDING' && c.requesterId === currentUser.id);
    return pendingConns.map((c) => {
      const receiver = users.find((u) => u.id === c.receiverId);
      return {
        connection: c,
        receiver: receiver || null,
      };
    });
  }, [connections, currentUser.id, users]);

  // 4. Smart Suggested Connections (Users not connected, not pending)
  const suggestions = useMemo(() => {
    const connectedOrPendingIds = new Set<string>([currentUser.id]);
    connections.forEach((c) => {
      if (c.requesterId === currentUser.id) connectedOrPendingIds.add(c.receiverId);
      if (c.receiverId === currentUser.id) connectedOrPendingIds.add(c.requesterId);
    });

    const candidates = users.filter((u) => !connectedOrPendingIds.has(u.id) && u.status === 'ACTIVE');

    return candidates
      .map((candidate) => {
        const { score, reasons } = StorageService.calculateRecommendationScore(currentUser, candidate);
        return {
          user: candidate,
          score,
          reasons,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [users, connections, currentUser]);

  // Actions
  const handleAccept = (connectionId: string) => {
    StorageService.acceptConnectionRequest(connectionId);
    onRefreshData();
  };

  const handleReject = (connectionId: string) => {
    StorageService.rejectConnectionRequest(connectionId);
    onRefreshData();
  };

  const handleCancelSent = (connectionId: string) => {
    StorageService.removeConnection(connectionId);
    onRefreshData();
  };

  const handleRemoveConnection = (otherUserId: string) => {
    const conn = connections.find(
      (c) =>
        c.status === 'ACCEPTED' &&
        ((c.requesterId === currentUser.id && c.receiverId === otherUserId) ||
          (c.requesterId === otherUserId && c.receiverId === currentUser.id))
    );
    if (conn && window.confirm('Are you sure you want to remove this connection?')) {
      StorageService.removeConnection(conn.id);
      onRefreshData();
    }
  };

  const handleSendConnection = (targetUserId: string) => {
    StorageService.sendConnectionRequest(currentUser.id, targetUserId);
    onRefreshData();
  };

  // Filtered connections
  const filteredAccepted = acceptedConnections.filter((u) => {
    const q = searchFilter.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.company && u.company.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-bold text-xs">Networking Hub</span>
          <span className="text-xs text-slate-500 font-medium">• {acceptedConnections.length} Active Connections</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">My Professional Network</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your university connections, incoming requests, and discover peers with high skill alignment.
        </p>
      </div>

      {/* Main Grid: Left Tabs / Main Content, Right Sidebar: Smart Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Col 1 & 2: Tabs and Connection lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab buttons */}
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'connections' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Connections ({acceptedConnections.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'received' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Received ({receivedRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'sent' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Sent Requests ({sentRequests.length})</span>
            </button>
          </div>

          {/* TAB 1: ACCEPTED CONNECTIONS */}
          {activeTab === 'connections' && (
            <div className="space-y-4">
              {acceptedConnections.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search in your connections..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              {filteredAccepted.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">No Connections Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {acceptedConnections.length === 0
                      ? 'You have not connected with anyone yet. Explore the Alumni Directory or smart suggestions on the right.'
                      : 'No connections match your search query.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAccepted.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{user.name}</h4>
                          <p className="text-[11px] font-semibold text-blue-700 truncate">{user.jobTitle}</p>
                          <p className="text-[11px] text-slate-500 truncate flex items-center">
                            <Building className="w-3 h-3 mr-1 text-slate-400" />
                            {user.company}
                          </p>
                          <span className="text-[10px] text-slate-400">Class of {user.graduationYear}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleRemoveConnection(user.id)}
                          className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Remove
                        </button>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onViewProfile(user)}
                            className="px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => onOpenMessages(user.id)}
                            className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RECEIVED REQUESTS */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">No Pending Requests</h3>
                  <p className="text-xs text-slate-500 mt-1">You are all caught up with connection invites.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map(({ connection, requester }) => {
                    if (!requester) return null;
                    return (
                      <div
                        key={connection.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={requester.avatar}
                            alt={requester.name}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{requester.name}</h4>
                            <p className="text-[11px] text-blue-700 font-semibold truncate">
                              {requester.jobTitle} @ {requester.company}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {requester.department} • Class of {requester.graduationYear}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleReject(connection.id)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAccept(connection.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Accept
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SENT REQUESTS */}
          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">No Pending Sent Requests</h3>
                  <p className="text-xs text-slate-500 mt-1">All your sent requests have been answered.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map(({ connection, receiver }) => {
                    if (!receiver) return null;
                    return (
                      <div
                        key={connection.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={receiver.avatar}
                            alt={receiver.name}
                            className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{receiver.name}</h4>
                            <p className="text-[11px] text-blue-700 font-semibold truncate">
                              {receiver.jobTitle} @ {receiver.company}
                            </p>
                            <span className="text-[10px] text-amber-600 font-medium">Pending Response</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCancelSent(connection.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Cancel Request
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Col 3: Smart Recommendations (Explainable AI / Algorithm) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Suggested Connections</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ranked by departmental relevance and shared technical skills.
            </p>

            <div className="space-y-4">
              {suggestions.map(({ user, score, reasons }) => (
                <div key={user.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{user.name}</h5>
                        <p className="text-[10px] text-blue-600 font-medium truncate max-w-[130px]">
                          {user.company || user.department}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {score}% Match
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight">
                    {reasons.slice(0, 1).join(', ')}
                  </p>

                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onViewProfile(user)}
                      className="text-[11px] text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleSendConnection(user.id)}
                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
