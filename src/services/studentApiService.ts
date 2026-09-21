import {
  User,
  Connection,
  MentorshipRequest,
  EventItem,
  CareerOpportunity,
  JobApplication,
  MentorshipCategory,
} from '../types';
import { StorageService } from './storageService';

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  controller: string;
  javaMethod: string;
  status: number;
  statusText: string;
  durationMs: number;
  requestPayload?: any;
  responsePayload?: any;
  sqlQuery?: string;
}

type ApiLogListener = (log: ApiLogEntry) => void;

class StudentApiServiceImpl {
  private listeners: ApiLogListener[] = [];
  private logs: ApiLogEntry[] = [];

  // Register listener for live API inspection
  public subscribe(listener: ApiLogListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getRecentLogs(): ApiLogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public recordCustomLog(entry: Omit<ApiLogEntry, 'id' | 'timestamp'>): void {
    this.recordLog(entry);
  }

  private recordLog(entry: Omit<ApiLogEntry, 'id' | 'timestamp'>): void {
    const fullEntry: ApiLogEntry = {
      id: `api-log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      ...entry,
    };
    this.logs.unshift(fullEntry);
    if (this.logs.length > 50) this.logs.pop();
    this.listeners.forEach((l) => l(fullEntry));
  }

  /**
   * 1. Student Registration
   * Spring Controller: AuthController.java -> @PostMapping("/api/auth/register")
   */
  public async registerStudent(data: {
    name: string;
    email: string;
    password?: string;
    rollNumber: string;
    department: string;
    graduationYear: number;
    semester?: string;
    skills?: string[];
    careerInterests?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    bio?: string;
  }): Promise<{ user: User; token: string; message: string }> {
    const startTime = performance.now();

    // Persist via storage service
    const newUser = StorageService.registerUser({
      name: data.name,
      email: data.email,
      role: 'STUDENT',
      rollNumber: data.rollNumber,
      studentRollNo: data.rollNumber,
      department: data.department,
      graduationYear: data.graduationYear,
      semester: data.semester || '6th Semester',
      skills: data.skills || ['Java', 'Data Structures', 'Spring Boot'],
      careerInterests: data.careerInterests || ['Software Development', 'Cloud Computing'],
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl,
      bio: data.bio || 'Computer Science undergrad seeking mentorship and career opportunities.',
      status: 'ACTIVE',
    });

    const duration = Math.round(performance.now() - startTime + 80);
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: newUser.email, role: 'ROLE_STUDENT', id: newUser.id })
    )}.springSecSig`;

    this.recordLog({
      method: 'POST',
      endpoint: '/api/auth/register',
      controller: 'com.alumniconnect.controller.AuthController',
      javaMethod: 'public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest req)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: { ...data, password: '[PROTECTED_BCRYPT]' },
      responsePayload: {
        success: true,
        message: 'Student registered successfully in university records',
        token: `${mockJwt.slice(0, 32)}...`,
        user: { id: newUser.id, name: newUser.name, rollNumber: newUser.rollNumber, role: 'STUDENT' },
      },
      sqlQuery: `INSERT INTO users (id, name, email, role, roll_number, department, grad_year, status) VALUES ('${newUser.id}', '${newUser.name}', '${newUser.email}', 'STUDENT', '${data.rollNumber}', '${data.department}', ${data.graduationYear}, 'ACTIVE');`,
    });

    return { user: newUser, token: mockJwt, message: 'Registration completed successfully.' };
  }

  /**
   * 2. Student Authentication / Login
   * Spring Controller: AuthController.java -> @PostMapping("/api/auth/login")
   */
  public async loginStudent(email: string, password?: string): Promise<{ user: User; token: string }> {
    const startTime = performance.now();
    const user = StorageService.authenticateUser(email, password);

    const duration = Math.round(performance.now() - startTime + 65);

    if (!user) {
      this.recordLog({
        method: 'POST',
        endpoint: '/api/auth/login',
        controller: 'com.alumniconnect.controller.AuthController',
        javaMethod: 'public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest req)',
        status: 401,
        statusText: 'Unauthorized',
        durationMs: duration,
        requestPayload: { email, password: '[PROTECTED]' },
        responsePayload: { error: 'BadCredentialsException', message: 'Invalid student credentials.' },
        sqlQuery: `SELECT * FROM users WHERE email = '${email}' LIMIT 1;`,
      });
      throw new Error('Invalid email or password.');
    }

    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ sub: user.email, role: user.role, id: user.id })
    )}.springSecSig`;

    this.recordLog({
      method: 'POST',
      endpoint: '/api/auth/login',
      controller: 'com.alumniconnect.controller.AuthController',
      javaMethod: 'public ResponseEntity<JwtResponse> authenticateUser(@RequestBody LoginRequest req)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { email, password: '[PROTECTED]' },
      responsePayload: {
        token: `${mockJwt.slice(0, 30)}...`,
        type: 'Bearer',
        id: user.id,
        role: user.role,
        name: user.name,
      },
      sqlQuery: `SELECT u.*, r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = '${email}';`,
    });

    return { user, token: mockJwt };
  }

  /**
   * 3. Student Profile View & Update
   * Spring Controller: StudentController.java -> @PutMapping("/api/students/profile")
   */
  public async updateStudentProfile(userId: string, updates: Partial<User>): Promise<User> {
    const startTime = performance.now();
    const currentUser = StorageService.getUserById(userId);
    if (!currentUser) throw new Error('Student not found');

    const updatedUser: User = {
      ...currentUser,
      ...updates,
    };

    StorageService.saveUser(updatedUser);

    const duration = Math.round(performance.now() - startTime + 50);

    this.recordLog({
      method: 'PUT',
      endpoint: `/api/students/profile/${userId}`,
      controller: 'com.alumniconnect.controller.StudentController',
      javaMethod: 'public ResponseEntity<StudentDTO> updateProfile(@PathVariable Long id, @RequestBody StudentUpdateDTO dto)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: updates,
      responsePayload: {
        success: true,
        updatedStudent: {
          id: updatedUser.id,
          name: updatedUser.name,
          rollNumber: updatedUser.rollNumber,
          skills: updatedUser.skills,
          headline: updatedUser.headline,
        },
      },
      sqlQuery: `UPDATE users SET headline='${updates.headline || ''}', bio='${updates.bio || ''}', roll_number='${updates.rollNumber || ''}' WHERE id='${userId}';`,
    });

    return updatedUser;
  }

  /**
   * 4. Alumni Search & Filter
   * Spring Controller: AlumniController.java -> @GetMapping("/api/alumni/search")
   */
  public async searchAlumni(params: {
    keyword?: string;
    department?: string;
    company?: string;
    skills?: string;
    isAvailableForMentoring?: boolean;
  }): Promise<User[]> {
    const startTime = performance.now();
    const allUsers = StorageService.getUsers();
    let alumni = allUsers.filter((u) => u.role === 'ALUMNI');

    if (params.keyword && params.keyword.trim()) {
      const q = params.keyword.toLowerCase().trim();
      alumni = alumni.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.company && u.company.toLowerCase().includes(q)) ||
          (u.jobTitle && u.jobTitle.toLowerCase().includes(q)) ||
          (u.headline && u.headline.toLowerCase().includes(q)) ||
          (u.skills && u.skills.some((s) => s.toLowerCase().includes(q)))
      );
    }

    if (params.department && params.department !== 'ALL') {
      alumni = alumni.filter((u) => u.department === params.department);
    }

    if (params.company && params.company !== 'ALL') {
      alumni = alumni.filter((u) => u.company === params.company);
    }

    if (params.isAvailableForMentoring) {
      alumni = alumni.filter((u) => u.isAvailableForMentoring);
    }

    const duration = Math.round(performance.now() - startTime + 40);

    this.recordLog({
      method: 'GET',
      endpoint: `/api/alumni/search?keyword=${encodeURIComponent(params.keyword || '')}&dept=${encodeURIComponent(
        params.department || ''
      )}&mentoring=${params.isAvailableForMentoring ?? ''}`,
      controller: 'com.alumniconnect.controller.AlumniController',
      javaMethod: 'public ResponseEntity<List<AlumniSummaryDTO>> searchAlumni(@RequestParam Map<String, String> params)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: params,
      responsePayload: { count: alumni.length, resultsSample: alumni.slice(0, 3).map((a) => a.name) },
      sqlQuery: `SELECT * FROM users WHERE role='ALUMNI' AND (:keyword IS NULL OR LOWER(name) LIKE :keyword) AND (:dept IS NULL OR department = :dept);`,
    });

    return alumni;
  }

  /**
   * 5. Networking Connection Request
   * Spring Controller: ConnectionController.java -> @PostMapping("/api/connections/request")
   */
  public async sendConnectionRequest(studentId: string, alumniId: string): Promise<Connection> {
    const startTime = performance.now();
    const conn = StorageService.sendConnectionRequest(studentId, alumniId);
    const duration = Math.round(performance.now() - startTime + 55);

    this.recordLog({
      method: 'POST',
      endpoint: '/api/connections/request',
      controller: 'com.alumniconnect.controller.ConnectionController',
      javaMethod: 'public ResponseEntity<ConnectionDTO> sendRequest(@RequestBody ConnectionRequestDTO dto)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: { requesterId: studentId, receiverId: alumniId },
      responsePayload: { connectionId: conn.id, status: 'PENDING', message: 'Connection request dispatched.' },
      sqlQuery: `INSERT INTO connections (id, requester_id, receiver_id, status, created_at) VALUES ('${conn.id}', '${studentId}', '${alumniId}', 'PENDING', NOW());`,
    });

    return conn;
  }

  /**
   * Cancel or Remove Connection
   * Spring Controller: ConnectionController.java -> @DeleteMapping("/api/connections/{id}")
   */
  public async removeConnection(connectionId: string): Promise<void> {
    const startTime = performance.now();
    StorageService.removeConnection(connectionId);
    const duration = Math.round(performance.now() - startTime + 45);

    this.recordLog({
      method: 'DELETE',
      endpoint: `/api/connections/${connectionId}`,
      controller: 'com.alumniconnect.controller.ConnectionController',
      javaMethod: 'public ResponseEntity<?> deleteConnection(@PathVariable String id)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: { success: true, message: 'Connection successfully deleted from database.' },
      sqlQuery: `DELETE FROM connections WHERE id = '${connectionId}';`,
    });
  }

  /**
   * 6. Mentorship Request
   * Spring Controller: MentorshipController.java -> @PostMapping("/api/mentorship/request")
   */
  public async requestMentorship(
    studentId: string,
    mentorId: string,
    category: MentorshipCategory,
    message: string
  ): Promise<MentorshipRequest> {
    const startTime = performance.now();
    const req = StorageService.sendMentorshipRequest(studentId, mentorId, category, message);
    const duration = Math.round(performance.now() - startTime + 60);

    this.recordLog({
      method: 'POST',
      endpoint: '/api/mentorship/request',
      controller: 'com.alumniconnect.controller.MentorshipController',
      javaMethod: 'public ResponseEntity<MentorshipRequestDTO> submitMentorshipRequest(@Valid @RequestBody MentorshipSubmissionDTO dto)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: { studentId, mentorId, category, message },
      responsePayload: {
        id: req.id,
        status: 'PENDING',
        category: req.category,
        message: 'Mentorship proposal routed to alumni mentor.',
      },
      sqlQuery: `INSERT INTO mentorship_requests (id, student_id, mentor_id, category, message, status, created_at) VALUES ('${req.id}', '${studentId}', '${mentorId}', '${category}', '${message.slice(0, 30)}...', 'PENDING', NOW());`,
    });

    return req;
  }

  /**
   * 7. Event Registration / RSVP
   * Spring Controller: EventController.java -> @PostMapping("/api/events/{id}/register")
   */
  public async registerForEvent(eventId: string, studentId: string): Promise<boolean> {
    const startTime = performance.now();
    const success = StorageService.registerForEvent(eventId, studentId);
    const duration = Math.round(performance.now() - startTime + 50);

    this.recordLog({
      method: 'POST',
      endpoint: `/api/events/${eventId}/register`,
      controller: 'com.alumniconnect.controller.EventController',
      javaMethod: 'public ResponseEntity<?> registerUserForEvent(@PathVariable String eventId, @AuthenticationPrincipal UserDetails user)',
      status: success ? 200 : 400,
      statusText: success ? 'OK' : 'Bad Request (Event Full)',
      durationMs: duration,
      requestPayload: { eventId, studentId },
      responsePayload: {
        success,
        message: success ? 'Student RSVP confirmed in MySQL events table.' : 'Event capacity exceeded.',
      },
      sqlQuery: `INSERT INTO event_registrations (event_id, user_id, registered_at) VALUES ('${eventId}', '${studentId}', NOW());`,
    });

    return success;
  }

  /**
   * Cancel Event Registration
   * Spring Controller: EventController.java -> @DeleteMapping("/api/events/{id}/register")
   */
  public async cancelEventRegistration(eventId: string, studentId: string): Promise<void> {
    const startTime = performance.now();
    StorageService.cancelEventRegistration(eventId, studentId);
    const duration = Math.round(performance.now() - startTime + 45);

    this.recordLog({
      method: 'DELETE',
      endpoint: `/api/events/${eventId}/register`,
      controller: 'com.alumniconnect.controller.EventController',
      javaMethod: 'public ResponseEntity<?> cancelRegistration(@PathVariable String eventId, @AuthenticationPrincipal UserDetails user)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { eventId, studentId },
      responsePayload: { success: true, message: 'Event reservation cancelled.' },
      sqlQuery: `DELETE FROM event_registrations WHERE event_id='${eventId}' AND user_id='${studentId}';`,
    });
  }

  /**
   * 8. Apply for Career / Internship Opportunity
   * Spring Controller: JobController.java -> @PostMapping("/api/jobs/{id}/apply")
   */
  public async applyForJob(
    opportunityId: string,
    studentId: string,
    coverNote: string,
    portfolioUrl?: string
  ): Promise<JobApplication> {
    const startTime = performance.now();
    const app = StorageService.applyForOpportunity(opportunityId, studentId, coverNote, portfolioUrl);
    const duration = Math.round(performance.now() - startTime + 70);

    this.recordLog({
      method: 'POST',
      endpoint: `/api/jobs/${opportunityId}/apply`,
      controller: 'com.alumniconnect.controller.JobOpportunityController',
      javaMethod: 'public ResponseEntity<JobApplicationDTO> submitApplication(@PathVariable String id, @RequestBody ApplicationPayload payload)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: { opportunityId, studentId, coverNote, portfolioUrl },
      responsePayload: {
        applicationId: app.id,
        status: app.status,
        message: 'Application recorded and routed to alumni job poster.',
      },
      sqlQuery: `INSERT INTO job_applications (id, opportunity_id, applicant_id, cover_note, portfolio_url, status, applied_at) VALUES ('${app.id}', '${opportunityId}', '${studentId}', '${coverNote.slice(0, 30)}...', '${portfolioUrl || ''}', 'Applied', NOW());`,
    });

    return app;
  }
}

export const StudentApiService = new StudentApiServiceImpl();
