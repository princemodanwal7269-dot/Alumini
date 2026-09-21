import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
  Building,
  Check,
  ExternalLink,
} from 'lucide-react';
import { User, EventItem, EventType } from '../types';
import { StorageService } from '../services/storageService';

interface EventsManagementProps {
  currentUser: User;
  users: User[];
  events: EventItem[];
  onRefreshData: () => void;
}

export const EventsManagement: React.FC<EventsManagementProps> = ({
  currentUser,
  users,
  events,
  onRefreshData,
}) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Attendees modal
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState<EventItem | null>(null);

  // Create/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('Alumni Meet');
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('10:00 AM - 04:00 PM');
  const [venue, setVenue] = useState('University Main Auditorium');
  const [bannerImage, setBannerImage] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  );
  const [maxParticipants, setMaxParticipants] = useState(150);

  const canManageEvents = currentUser.role === 'ADMIN' || currentUser.role === 'FACULTY';

  const eventTypes: EventType[] = [
    'Alumni Meet',
    'Webinar',
    'Workshop',
    'Career Fair',
    'Networking Event',
    'Guest Lecture',
    'Reunion',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q);

      const matchesType = selectedType === 'ALL' || ev.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [events, searchQuery, selectedType]);

  const handleRegister = (eventId: string) => {
    const success = StorageService.registerForEvent(eventId, currentUser.id);
    if (!success) {
      alert('Event has reached maximum seat capacity.');
    }
    onRefreshData();
  };

  const handleCancelRegistration = (eventId: string) => {
    StorageService.cancelEventRegistration(eventId, currentUser.id);
    onRefreshData();
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to cancel and delete this event?')) {
      StorageService.deleteEvent(eventId);
      onRefreshData();
    }
  };

  const handleOpenCreate = () => {
    setEditingEventId(null);
    setTitle('');
    setDescription('');
    setType('Alumni Meet');
    setDate('2026-11-20');
    setTime('10:00 AM - 04:00 PM');
    setVenue('University Main Auditorium');
    setBannerImage('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
    setMaxParticipants(100);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditingEventId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description);
    setType(ev.type);
    setDate(ev.date);
    setTime(ev.time);
    setVenue(ev.venue);
    setBannerImage(ev.bannerImage || '');
    setMaxParticipants(ev.maxParticipants);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingEventId) {
      StorageService.updateEvent(editingEventId, {
        title,
        description,
        type,
        date,
        time,
        venue,
        bannerImage,
        maxParticipants: Number(maxParticipants),
      });
    } else {
      StorageService.createEvent({
        title,
        description,
        type,
        date,
        time,
        venue,
        bannerImage,
        maxParticipants: Number(maxParticipants),
        registeredUserIds: [],
        organizerId: currentUser.id,
        organizerName: currentUser.name,
        status: 'UPCOMING',
      });
    }

    setIsModalOpen(false);
    onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-bold text-xs">Campus &amp; Virtual</span>
            <span className="text-xs text-slate-500 font-medium">• {events.length} Scheduled Gatherings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Events &amp; Alumni Meets</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Discover milestone reunions, technical workshops, alumni guest lectures, and career fairs.
          </p>
        </div>

        {canManageEvents && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search events by title, venue, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedType === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {eventTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedType === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Events Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or category filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isRegistered = ev.registeredUserIds.includes(currentUser.id);
            const seatsLeft = ev.maxParticipants - ev.registeredUserIds.length;
            const isFull = seatsLeft <= 0;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {ev.bannerImage && (
                    <div className="relative h-44 w-full overflow-hidden">
                      <img
                        src={ev.bannerImage}
                        alt={ev.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider">
                          {ev.type}
                        </span>
                      </div>
                      {isRegistered && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold flex items-center shadow-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Registered
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{ev.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ev.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{ev.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                        <span>Seat Capacity</span>
                        <span className={seatsLeft <= 10 ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                          {seatsLeft > 0 ? `${seatsLeft} seats left` : 'Housefull'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            seatsLeft <= 10 ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (ev.registeredUserIds.length / ev.maxParticipants) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-3 text-xs">
                  <button
                    onClick={() => setViewingAttendeesEvent(ev)}
                    className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Attendees ({ev.registeredUserIds.length})
                  </button>

                  <div className="flex items-center space-x-2">
                    {canManageEvents && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(ev)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {isRegistered ? (
                      <button
                        onClick={() => handleCancelRegistration(ev.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                      >
                        Cancel Ticket
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(ev.id)}
                        disabled={isFull}
                        className={`px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                          isFull
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isFull ? 'Sold Out' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW ATTENDEES MODAL */}
      {viewingAttendeesEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Event Attendees</h3>
                <p className="text-xs text-slate-500 truncate max-w-xs">{viewingAttendeesEvent.title}</p>
              </div>
              <button
                onClick={() => setViewingAttendeesEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
              {viewingAttendeesEvent.registeredUserIds.length === 0 ? (
                <p className="p-6 text-center text-slate-400">No attendees registered yet.</p>
              ) : (
                viewingAttendeesEvent.registeredUserIds.map((userId) => {
                  const attendee = users.find((u) => u.id === userId);
                  if (!attendee) return null;
                  return (
                    <div key={userId} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={attendee.avatar}
                          alt={attendee.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <h5 className="font-bold text-slate-900">{attendee.name}</h5>
                          <span className="text-[10px] text-slate-500">
                            {attendee.role} • {attendee.department}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Confirmed
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setViewingAttendeesEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingEventId ? 'Edit Event Details' : 'Create New University Event'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Annual Alumni Homecoming &amp; Gala 2026"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Event Category *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time Range *</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                    placeholder="10:00 AM - 04:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Venue / Location / Zoom URL *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                  placeholder="e.g. University Main Auditorium or Google Meet URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Seat Capacity *</label>
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    required
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Banner Image URL</label>
                  <input
                    type="url"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500"
                  placeholder="Outline the agenda, keynote speakers, and participating alumni batches..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {editingEventId ? 'Update Event' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
