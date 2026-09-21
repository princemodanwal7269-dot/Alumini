export type UserRole = 'STUDENT' | 'ALUMNI' | 'FACULTY' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'BLOCKED';

export type Department =
  | 'Computer Science & Engineering'
  | 'Electronics & Communication'
  | 'Information Science & Engineering'
  | 'Mechanical Engineering'
  | 'Electrical Engineering'
  | string;

export type MentorshipCategory =
  | 'Career Guidance'
  | 'Technical Skills'
  | 'Interview Preparation'
  | 'Higher Studies'
  | 'Entrepreneurship'
  | 'Resume Review'
  | 'Industry Guidance';

export type MentorshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';

export type ConnectionStatus = 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';

export type EventType =
  | 'Alumni Meet'
  | 'Webinar'
  | 'Workshop'
  | 'Career Fair'
  | 'Networking Event'
  | 'Guest Lecture'
  | 'Reunion';

export type OpportunityType = 'Full-time Job' | 'Internship' | 'Freelance' | 'Referral';
export type JobType = OpportunityType;

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'SELECTED'
  | 'REJECTED';

export type ContributionType =
  | 'Donation'
  | 'Scholarship'
  | 'Mentorship'
  | 'Guest Lecture'
  | 'Internship'
  | 'Job Referral'
  | 'Event Sponsorship'
  | 'Equipment/Resources'
  | 'Donation / Funds'
  | 'Scholarship Sponsor'
  | 'Internship / Job Referral'
  | 'Equipment / Resources';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar: string;
  department: string;
  graduationYear?: number;
  university: string;
  headline?: string;
  bio?: string;
  location?: string;
  status: UserStatus;
  createdAt: string;

  // Specific role attributes
  company?: string;
  jobTitle?: string;
  industry?: string;
  skills?: string[];
  linkedinUrl?: string;
  isAvailableForMentoring?: boolean;
  degree?: string;
  studentRollNo?: string;
  rollNumber?: string;
  semester?: string;
  cgpa?: number;
  githubUrl?: string;
  resumeUrl?: string;
  careerInterests?: string[];
  facultyDesignation?: string;
  yearsOfExperience?: number;
  highestDegree?: string;
  mentorshipTopics?: string[];
  achievements?: string[];
}

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  studentId: string;
  mentorId: string;
  category: MentorshipCategory;
  message: string;
  status: MentorshipStatus;
  notes?: string;
  sessionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  type: EventType;
  organizer: string;
  organizerId: string;
  organizerName?: string;
  maxParticipants: number;
  registeredUserIds: string[];
  registrationDeadline?: string;
  bannerImage?: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

export interface CareerOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: OpportunityType;
  experienceRequired?: string;
  experienceLevel?: string;
  skillsRequired: string[];
  salaryRange: string;
  deadline: string;
  applicationLink?: string;
  description: string;
  requirements?: string;
  postedById: string;
  postedByName: string;
  postedByRole?: UserRole;
  applicantIds?: string[];
  createdAt?: string;
}

export interface JobApplication {
  id: string;
  opportunityId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resumeNote?: string;
  coverNote?: string;
  portfolioUrl?: string;
  appliedDate?: string;
  appliedAt?: string;
  status: ApplicationStatus;
}

export interface Contribution {
  id: string;
  alumniId: string;
  alumniName: string;
  type?: ContributionType;
  contributionType?: ContributionType;
  amount?: number;
  description: string;
  date?: string;
  createdAt?: string;
  status: 'VERIFIED' | 'PLEDGED' | 'COMPLETED' | 'PENDING';
}

export type AlumniContribution = Contribution;

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'CONNECTION' | 'MENTORSHIP' | 'EVENT' | 'CAREER' | 'MESSAGE' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  actionLink?: string;
}

export interface SystemStats {
  totalStudents: number;
  totalAlumni: number;
  totalFaculty: number;
  activeUsers: number;
  totalConnections: number;
  activeMentors: number;
  totalEvents: number;
  totalContributions: number;
  totalDonationAmount: number;
  totalJobs: number;
  totalMentorshipEngagements?: number;
}
