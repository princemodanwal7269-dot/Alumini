import {
  User,
  Connection,
  MentorshipRequest,
  EventItem,
  CareerOpportunity,
  JobApplication,
  Contribution,
  DirectMessage,
  NotificationItem,
  SystemStats,
  UserRole,
  MentorshipStatus,
  UserStatus,
  ApplicationStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CONNECTIONS,
  INITIAL_MENTORSHIP_REQUESTS,
  INITIAL_EVENTS,
  INITIAL_CAREER_OPPORTUNITIES,
  INITIAL_JOB_APPLICATIONS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const STORAGE_KEYS = {
  USERS: 'alumniconnect_users_v1',
  CONNECTIONS: 'alumniconnect_connections_v1',
  MENTORSHIP: 'alumniconnect_mentorship_v1',
  EVENTS: 'alumniconnect_events_v1',
  CAREERS: 'alumniconnect_careers_v1',
  APPLICATIONS: 'alumniconnect_applications_v1',
  CONTRIBUTIONS: 'alumniconnect_contributions_v1',
  MESSAGES: 'alumniconnect_messages_v1',
  NOTIFICATIONS: 'alumniconnect_notifications_v1',
  CURRENT_USER_ID: 'alumniconnect_current_user_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Failed reading ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed saving ${key} to localStorage`, e);
  }
}

export class StorageService {
  // Current logged in user
  static getCurrentUserId(): string {
    return loadFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user-student-1');
  }

  static setCurrentUserId(userId: string): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static getCurrentUser(): User {
    const uid = this.getCurrentUserId();
    const user = this.getUserById(uid);
    if (user) return user;
    const all = this.getUsers();
    return all[0] || INITIAL_USERS[0];
  }

  static switchRole(newRole: UserRole): User {
    const users = this.getUsers();
    let target = users.find((u) => u.role === newRole);
    if (!target) {
      target = users[0];
    }
    this.setCurrentUserId(target.id);
    return target;
  }

  static authenticateUser(email: string, password?: string): User | null {
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.setCurrentUserId(found.id);
      return found;
    }
    return null;
  }

  static registerUser(data: Partial<User>): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name || 'New Member',
      email: data.email || 'user@alumniconnect.com',
      role: data.role || 'ALUMNI',
      department: data.department || 'Computer Science & Engineering',
      graduationYear: data.graduationYear || 2024,
      university: 'National Institute of Technology & Engineering',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      status: data.role === 'ALUMNI' ? 'PENDING_APPROVAL' : 'ACTIVE',
      createdAt: new Date().toISOString(),
      company: data.company,
      jobTitle: data.jobTitle,
      skills: data.skills || ['Java', 'Spring Boot', 'Problem Solving'],
      rollNumber: data.rollNumber,
      isAvailableForMentoring: data.isAvailableForMentoring ?? true,
      bio: `Enthusiastic ${data.role} of NIT Engineering, passionate about collaborative technology.`,
    };
    users.unshift(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    this.setCurrentUserId(newUser.id);
    return newUser;
  }

  // Users
  static getUsers(): User[] {
    return loadFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static deleteUser(id: string): void {
    const users = this.getUsers().filter((u) => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static updateUserStatus(id: string, status: UserStatus): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      user.status = status;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updates);
      saveToStorage(STORAGE_KEYS.USERS, users);
      return user;
    }
    return null;
  }

  // Connections
  static getConnections(): Connection[] {
    return loadFromStorage<Connection[]>(STORAGE_KEYS.CONNECTIONS, INITIAL_CONNECTIONS);
  }

  static sendConnectionRequest(requesterId: string, receiverId: string): Connection {
    const connections = this.getConnections();
    const existing = connections.find(
      (c) =>
        (c.requesterId === requesterId && c.receiverId === receiverId) ||
        (c.requesterId === receiverId && c.receiverId === requesterId)
    );
    if (existing) return existing;

    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      requesterId,
      receiverId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    connections.push(newConn);
    saveToStorage(STORAGE_KEYS.CONNECTIONS, connections);

    const sender = this.getUserById(requesterId);
    this.createNotification({
      userId: receiverId,
      title: 'New Connection Request',
      message: `${sender?.name || 'Someone'} sent you a connection request.`,
      type: 'CONNECTION',
      actionLink: 'network',
    });

    return newConn;
  }

  static acceptConnectionRequest(connectionId: string): void {
    this.updateConnectionStatus(connectionId, 'ACCEPTED');
  }

  static rejectConnectionRequest(connectionId: string): void {
    this.updateConnectionStatus(connectionId, 'REJECTED');
  }

  static updateConnectionStatus(connectionId: string, status: 'ACCEPTED' | 'REJECTED'): void {
    const connections = this.getConnections();
    const conn = connections.find((c) => c.id === connectionId);
    if (conn) {
      conn.status = status;
      saveToStorage(STORAGE_KEYS.CONNECTIONS, connections);

      if (status === 'ACCEPTED') {
        const accepter = this.getUserById(conn.receiverId);
        this.createNotification({
          userId: conn.requesterId,
          title: 'Connection Accepted!',
          message: `${accepter?.name || 'A user'} accepted your connection request.`,
          type: 'CONNECTION',
          actionLink: 'network',
        });
      }
    }
  }

  static removeConnection(connectionId: string): void {
    const connections = this.getConnections().filter((c) => c.id !== connectionId);
    saveToStorage(STORAGE_KEYS.CONNECTIONS, connections);
  }

  // Mentorship
  static getMentorshipRequests(): MentorshipRequest[] {
    return loadFromStorage<MentorshipRequest[]>(STORAGE_KEYS.MENTORSHIP, INITIAL_MENTORSHIP_REQUESTS);
  }

  static sendMentorshipRequest(
    studentId: string,
    mentorId: string,
    category: any,
    message: string
  ): MentorshipRequest {
    const requests = this.getMentorshipRequests();
    const newReq: MentorshipRequest = {
      id: `ment-${Date.now()}`,
      studentId,
      mentorId,
      category,
      message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    requests.push(newReq);
    saveToStorage(STORAGE_KEYS.MENTORSHIP, requests);

    const student = this.getUserById(studentId);
    this.createNotification({
      userId: mentorId,
      title: 'New Mentorship Request',
      message: `${student?.name || 'A student'} requested mentorship in ${category}.`,
      type: 'MENTORSHIP',
      actionLink: 'mentorship',
    });

    return newReq;
  }

  static updateMentorshipStatus(requestId: string, status: MentorshipStatus, notes?: string): void {
    const requests = this.getMentorshipRequests();
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      req.status = status;
      if (notes) req.notes = notes;
      req.updatedAt = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.MENTORSHIP, requests);

      const mentor = this.getUserById(req.mentorId);
      this.createNotification({
        userId: req.studentId,
        title: `Mentorship ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: `${mentor?.name || 'Mentor'} has marked your mentorship request as ${status.toLowerCase()}.`,
        type: 'MENTORSHIP',
        actionLink: 'mentorship',
      });
    }
  }

  static reassignMentor(requestId: string, newMentorId: string): void {
    const requests = this.getMentorshipRequests();
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      req.mentorId = newMentorId;
      req.updatedAt = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.MENTORSHIP, requests);

      const newMentor = this.getUserById(newMentorId);
      this.createNotification({
        userId: req.studentId,
        title: 'Mentor Reassigned by Admin',
        message: `Your mentorship request has been reassigned to ${newMentor?.name || 'a new mentor'}.`,
        type: 'MENTORSHIP',
        actionLink: 'mentorship',
      });
      this.createNotification({
        userId: newMentorId,
        title: 'New Mentorship Assignment',
        message: `Administration has assigned you a student mentorship session.`,
        type: 'MENTORSHIP',
        actionLink: 'mentorship',
      });
    }
  }

  // Events
  static getEvents(): EventItem[] {
    return loadFromStorage<EventItem[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  }

  static createEvent(data: Partial<EventItem>): EventItem {
    const events = this.getEvents();
    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: data.title || 'Campus Event',
      description: data.description || '',
      date: data.date || '2026-11-20',
      time: data.time || '10:00 AM',
      venue: data.venue || 'Main Auditorium',
      type: data.type || 'Workshop',
      organizer: data.organizerName || 'University Faculty',
      organizerId: data.organizerId || 'admin-1',
      maxParticipants: data.maxParticipants || 100,
      registeredUserIds: data.registeredUserIds || [],
      bannerImage:
        data.bannerImage ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      status: 'UPCOMING',
    };
    events.unshift(newEvent);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  }

  static updateEvent(eventId: string, data: Partial<EventItem>): void {
    const events = this.getEvents();
    const ev = events.find((e) => e.id === eventId);
    if (ev) {
      Object.assign(ev, data);
      saveToStorage(STORAGE_KEYS.EVENTS, events);
    }
  }

  static saveEvent(event: EventItem): void {
    const events = this.getEvents();
    const index = events.findIndex((e) => e.id === event.id);
    if (index >= 0) {
      events[index] = event;
    } else {
      events.push(event);
    }
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  }

  static deleteEvent(id: string): void {
    const events = this.getEvents().filter((e) => e.id !== id);
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  }

  static registerForEvent(eventId: string, userId: string): boolean {
    const events = this.getEvents();
    const event = events.find((e) => e.id === eventId);
    if (!event) return false;

    if (event.registeredUserIds.includes(userId)) {
      return true;
    }
    if (event.registeredUserIds.length >= event.maxParticipants) {
      return false;
    }

    event.registeredUserIds.push(userId);
    saveToStorage(STORAGE_KEYS.EVENTS, events);

    this.createNotification({
      userId,
      title: 'Event Registration Confirmed!',
      message: `You are confirmed for "${event.title}" on ${event.date}.`,
      type: 'EVENT',
      actionLink: 'events',
    });

    return true;
  }

  static cancelEventRegistration(eventId: string, userId: string): void {
    const events = this.getEvents();
    const event = events.find((e) => e.id === eventId);
    if (event) {
      event.registeredUserIds = event.registeredUserIds.filter((id) => id !== userId);
      saveToStorage(STORAGE_KEYS.EVENTS, events);
    }
  }

  // Career Opportunities
  static getCareers(): CareerOpportunity[] {
    return loadFromStorage<CareerOpportunity[]>(STORAGE_KEYS.CAREERS, INITIAL_CAREER_OPPORTUNITIES);
  }

  static getOpportunities(): CareerOpportunity[] {
    return this.getCareers();
  }

  static createOpportunity(data: Partial<CareerOpportunity>): CareerOpportunity {
    const careers = this.getCareers();
    const newOpportunity: CareerOpportunity = {
      id: `career-${Date.now()}`,
      title: data.title || 'Software Role',
      company: data.company || 'Tech Corp',
      location: data.location || 'Remote',
      type: data.type || 'Full-time Job',
      experienceLevel: data.experienceLevel || '0-2 years',
      experienceRequired: data.experienceLevel || '0-2 years',
      salaryRange: data.salaryRange || 'Competitive',
      deadline: data.deadline || '2026-12-31',
      description: data.description || '',
      requirements: data.requirements || '',
      skillsRequired: data.skillsRequired || ['Java', 'SQL'],
      postedById: data.postedById || 'alumni-1',
      postedByName: data.postedByName || 'Alumni Lead',
      postedByRole: 'ALUMNI',
      createdAt: new Date().toISOString(),
      applicantIds: [],
    };
    careers.unshift(newOpportunity);
    saveToStorage(STORAGE_KEYS.CAREERS, careers);
    return newOpportunity;
  }

  static saveCareer(opportunity: CareerOpportunity): void {
    const careers = this.getCareers();
    const index = careers.findIndex((c) => c.id === opportunity.id);
    if (index >= 0) {
      careers[index] = opportunity;
    } else {
      careers.unshift(opportunity);
    }
    saveToStorage(STORAGE_KEYS.CAREERS, careers);
  }

  static deleteCareer(id: string): void {
    const careers = this.getCareers().filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CAREERS, careers);
  }

  // Job Applications
  static getApplications(): JobApplication[] {
    return loadFromStorage<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_JOB_APPLICATIONS);
  }

  static applyForOpportunity(
    opportunityId: string,
    applicantId: string,
    coverNote: string,
    portfolioUrl?: string
  ): JobApplication {
    const apps = this.getApplications();
    const user = this.getUserById(applicantId);
    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      opportunityId,
      applicantId,
      applicantName: user?.name || 'Applicant',
      applicantEmail: user?.email || '',
      coverNote,
      resumeNote: coverNote,
      portfolioUrl,
      appliedAt: new Date().toISOString(),
      appliedDate: new Date().toISOString(),
      status: 'Applied',
    };
    apps.push(newApp);
    saveToStorage(STORAGE_KEYS.APPLICATIONS, apps);

    const job = this.getCareers().find((j) => j.id === opportunityId);
    if (job) {
      if (!job.applicantIds) job.applicantIds = [];
      job.applicantIds.push(applicantId);
      this.saveCareer(job);

      this.createNotification({
        userId: applicantId,
        title: 'Application Submitted!',
        message: `Your application for "${job.title}" at ${job.company} was submitted successfully.`,
        type: 'CAREER',
        actionLink: 'careers',
      });
      this.createNotification({
        userId: job.postedById,
        title: 'New Job Applicant',
        message: `${user?.name || 'A candidate'} applied for "${job.title}".`,
        type: 'CAREER',
        actionLink: 'careers',
      });
    }

    return newApp;
  }

  static updateApplicationStatus(appId: string, status: ApplicationStatus): void {
    const apps = this.getApplications();
    const app = apps.find((a) => a.id === appId);
    if (app) {
      app.status = status;
      saveToStorage(STORAGE_KEYS.APPLICATIONS, apps);
    }
  }

  static applyForJob(opportunityId: string, applicantId: string, resumeNote: string): JobApplication {
    return this.applyForOpportunity(opportunityId, applicantId, resumeNote);
  }

  // Contributions
  static getContributions(): Contribution[] {
    return loadFromStorage<Contribution[]>(STORAGE_KEYS.CONTRIBUTIONS, INITIAL_CONTRIBUTIONS);
  }

  static pledgeContribution(data: Partial<Contribution>): Contribution {
    const list = this.getContributions();
    const newContrib: Contribution = {
      id: `contrib-${Date.now()}`,
      alumniId: data.alumniId || 'alumni-1',
      alumniName: data.alumniName || 'Distinguished Alumni',
      type: data.type || data.contributionType || 'Donation / Funds',
      contributionType: data.contributionType || data.type || 'Donation / Funds',
      amount: data.amount,
      description: data.description || 'Pledged institutional contribution',
      status: data.status || 'PENDING',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    list.unshift(newContrib);
    saveToStorage(STORAGE_KEYS.CONTRIBUTIONS, list);
    return newContrib;
  }

  static verifyContribution(id: string): void {
    const list = this.getContributions();
    const item = list.find((c) => c.id === id);
    if (item) {
      item.status = 'VERIFIED';
      saveToStorage(STORAGE_KEYS.CONTRIBUTIONS, list);
    }
  }

  static updateContributionStatus(id: string, status: 'VERIFIED' | 'PLEDGED' | 'COMPLETED' | 'PENDING'): void {
    const list = this.getContributions();
    const item = list.find((c) => c.id === id);
    if (item) {
      item.status = status;
      saveToStorage(STORAGE_KEYS.CONTRIBUTIONS, list);
    }
  }

  static deleteContribution(id: string): void {
    const list = this.getContributions().filter((c) => c.id !== id);
    saveToStorage(STORAGE_KEYS.CONTRIBUTIONS, list);
  }

  static saveContribution(contrib: Contribution): void {
    const list = this.getContributions();
    const index = list.findIndex((c) => c.id === contrib.id);
    if (index >= 0) {
      list[index] = contrib;
    } else {
      list.unshift(contrib);
    }
    saveToStorage(STORAGE_KEYS.CONTRIBUTIONS, list);
  }

  // Messages
  static getMessages(): DirectMessage[] {
    return loadFromStorage<DirectMessage[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  }

  static sendMessage(senderId: string, receiverId: string, content: string): DirectMessage {
    const messages = this.getMessages();
    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    messages.push(newMsg);
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);

    const sender = this.getUserById(senderId);
    this.createNotification({
      userId: receiverId,
      title: 'New Message',
      message: `${sender?.name || 'Someone'} sent you a direct message: "${content.slice(0, 45)}..."`,
      type: 'MESSAGE',
      actionLink: 'messages',
    });

    return newMsg;
  }

  static markMessagesAsRead(currentUserId: string, otherUserId: string): void {
    const messages = this.getMessages();
    let changed = false;
    messages.forEach((m) => {
      if (m.receiverId === currentUserId && m.senderId === otherUserId && !m.isRead) {
        m.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      saveToStorage(STORAGE_KEYS.MESSAGES, messages);
    }
  }

  static markMessagesRead(senderId: string, receiverId: string): void {
    this.markMessagesAsRead(receiverId, senderId);
  }

  // Notifications
  static getNotifications(): NotificationItem[] {
    return loadFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static createNotification(notif: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>): void {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ...notif,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    list.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  static markNotificationRead(id: string): void {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  static markAllNotificationsRead(userId: string): void {
    const list = this.getNotifications();
    list.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  // Statistics calculation
  static getSystemStats(): SystemStats {
    const users = this.getUsers();
    const connections = this.getConnections();
    const events = this.getEvents();
    const contributions = this.getContributions();
    const careers = this.getCareers();
    const mentorships = this.getMentorshipRequests();

    const totalStudents = users.filter((u) => u.role === 'STUDENT').length;
    const totalAlumni = users.filter((u) => u.role === 'ALUMNI').length;
    const totalFaculty = users.filter((u) => u.role === 'FACULTY').length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const activeMentors = users.filter((u) => u.role === 'ALUMNI' && u.isAvailableForMentoring).length;
    const acceptedConnections = connections.filter((c) => c.status === 'ACCEPTED').length;
    const totalDonations = contributions.reduce((acc, c) => acc + (c.amount || 0), 0);

    return {
      totalStudents,
      totalAlumni,
      totalFaculty,
      activeUsers,
      totalConnections: acceptedConnections,
      activeMentors,
      totalEvents: events.length,
      totalContributions: contributions.length,
      totalDonationAmount: totalDonations,
      totalJobs: careers.length,
      totalMentorshipEngagements: mentorships.length,
    };
  }

  // Recommendation engine
  static calculateRecommendationScore(student: User, alumni: User): { score: number; reasons: string[] } {
    if (!alumni.skills || alumni.skills.length === 0) return { score: 40, reasons: ['General university alumni'] };

    let score = 40;
    const reasons: string[] = [];

    if (student.department && alumni.department && student.department === alumni.department) {
      score += 20;
      reasons.push(`Same Department: ${student.department}`);
    }

    const studentSkills = (student.skills || []).map((s) => s.toLowerCase());
    const alumniSkills = (alumni.skills || []).map((s) => s.toLowerCase());
    const matchedSkills: string[] = [];

    studentSkills.forEach((sSkill) => {
      if (alumniSkills.some((aSkill) => aSkill.includes(sSkill) || sSkill.includes(aSkill))) {
        matchedSkills.push(sSkill);
      }
    });

    if (matchedSkills.length > 0) {
      const skillBonus = Math.min(35, matchedSkills.length * 12);
      score += skillBonus;
      reasons.push(`Shared Skills (${matchedSkills.slice(0, 3).join(', ')})`);
    }

    if (alumni.isAvailableForMentoring) {
      score += 5;
      reasons.push('Verified active mentor');
    }

    const finalScore = Math.min(95, Math.max(50, score));
    return { score: finalScore, reasons };
  }
}
