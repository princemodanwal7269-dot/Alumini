export interface DocSection {
  id: string;
  number: number;
  title: string;
  summary: string;
  content: string;
}

export interface VivaQuestion {
  question: string;
  category: 'Spring Boot' | 'JPA / Hibernate' | 'Database' | 'OOP / Architecture' | 'Security';
  answer: string;
}

export const DOCUMENTATION_SECTIONS: DocSection[] = [
  {
    id: 'abstract',
    number: 1,
    title: 'Project Abstract',
    summary: 'Executive overview of AlumniConnect for institutional academic records.',
    content: `AlumniConnect is an enterprise-grade web-based Alumni Engagement and Networking System developed to bridge the critical disconnect between universities, graduating students, alumni leaders, and academic faculty. 

In traditional institutions, alumni relations remain fragmented across legacy spreadsheets, ad-hoc WhatsApp/LinkedIn groups, and sporadic annual convocations. AlumniConnect centralizes institutional networking into a unified digital portal. The platform incorporates a 4-tier Role-Based Access Control (RBAC) architecture supporting Students, Alumni, Faculty, and Administrators.

Key capabilities include a searchable Alumni Directory with multi-faceted filtering, a LinkedIn-style networking module with bidirectional connection lifecycles, a structured 1-on-1 Mentorship Program with an explainable skill-matching recommendation algorithm, an Event Management system with seat cap tracking and one-click registration, a Career Portal for job/internship/referral postings with application workflows, an Alumni Contribution & Endowment Tracker with analytical distributions, an integrated internal messaging system, and real-time activity notifications.

Engineered using Java, Spring Boot, Spring Data JPA, Hibernate, MySQL, and a modern responsive interface, AlumniConnect demonstrates proper Object-Oriented Programming (OOP) design patterns, clean layered architecture (Controller-Service-Repository-Entity), and RESTful API principles suitable for university production deployment and final-year academic viva defense.`
  },
  {
    id: 'problem-statement',
    number: 2,
    title: 'Problem Statement',
    summary: 'Detailed examination of structural challenges in university-alumni communication.',
    content: `Universities in developing and global academic ecosystems face several operational and developmental bottlenecks:

1. **Information Siloing & Lost Contact:** Once students graduate, their institutional email accounts lapse, causing institutions to permanently lose touch with 80%+ of their alumni within 3 years of graduation.
2. **Underutilized Alumni Expertise:** Current undergraduate students lack structured channels to seek career guidance, technical mock interviews, and resume reviews from industry professionals who graduated from the exact same institution.
3. **Informal & Inefficient Referral Networks:** Job and internship referrals occur informally, leaving deserving students unaware of openings at tier-1 organizations where alumni currently work.
4. **Disjointed Event Coordination:** Alumni meets, webinars, and guest lectures suffer from low turnout due to manual email dispatches, lack of automated reminders, and absence of self-service registration tracking.
5. **Lack of Transparent Contribution Tracking:** Alumni wishing to sponsor scholarships, donate lab equipment, or fund student entrepreneurship lack a transparent, centralized university tracking mechanism.
6. **Administrative Overhead:** University placement and alumni affairs offices manually manage records via disparate spreadsheets, leading to data redundancy, stale information, and security vulnerabilities.`
  },
  {
    id: 'objectives',
    number: 3,
    title: 'Project Objectives',
    summary: 'Core measurable goals established for AlumniConnect.',
    content: `The primary objectives of the AlumniConnect system include:

- **Centralized Digital Directory:** Maintain an authenticated, continuously updated registry of alumni profiles featuring academic credentials, graduation years, current employers, job positions, and verified skill tags.
- **Formalized Mentorship Pipeline:** Establish a structured mentorship ecosystem where students can browse mentors by expertise and submit requests across categories (Career Guidance, Technical Skills, Higher Studies, Interview Prep), and mentors can manage mentee progress.
- **Explainable Recommendation Engine:** Deploy a skill-and-department matching algorithm that computes a transparent compatibility score (e.g., 85% Skill Match) between student aspirations and alumni expertise.
- **Decentralized Career Portal:** Empower alumni to post exclusive jobs, internships, freelance gigs, and direct corporate referral drives tailored to university students.
- **Automated Event Lifecycle:** Provide self-service event discovery, registration with capacity limits, attendee tracking, and administrative event scheduling.
- **Institutional Philanthropy & Endowment Tracking:** Provide clear audit trails for financial and non-monetary alumni contributions (Scholarships, Lab Gear, Guest Lectures).
- **Secure Layered Java Backend:** Adhere strictly to industry-standard Java design principles (SOLID, Spring Security, BCrypt, JPA Transactions, Global Exception Handling).`
  },
  {
    id: 'existing-system',
    number: 4,
    title: 'Existing System vs Drawbacks',
    summary: 'Analysis of legacy spreadsheets and informal social media groups.',
    content: `### Characteristics of Current Systems
- Manual Excel spreadsheets maintained by alumni association volunteers.
- WhatsApp and Telegram groups subject to 1024-member limits, spam, and unverified accounts.
- External social networks (LinkedIn) where students compete against millions of global applicants without institutional context.

### Drawbacks of Existing Systems
- **No Role-Based Access Control:** Anyone can join public groups; students and unauthorized actors can harass alumni.
- **No Data Verification:** University administration cannot verify whether a participant is truly a degree holder or current student.
- **Zero Mentorship Governance:** No formal mechanism to track whether mentorship interactions yielded positive outcomes or completed milestones.
- **Security & Privacy Violations:** Phone numbers and personal email addresses are publicly exposed on open sheets, violating data privacy regulations.`
  },
  {
    id: 'proposed-system',
    number: 5,
    title: 'Proposed System',
    summary: 'How AlumniConnect solves each limitation with a modern web architecture.',
    content: `AlumniConnect delivers a cohesive, authenticated institutional web platform:

- **Role-Based Workflows:** Distinct, customized dashboards tailored to Students, Alumni, Faculty Coordinators, and Administrators.
- **Internal Messaging Guardrails:** Direct messaging is restricted exclusively to mutually accepted connections and approved mentor-mentee pairs, eliminating unsolicited spam.
- **Admin Verification Gate:** Alumni registrations can be reviewed by the University Administration to prevent unauthorized or fraudulent profiles.
- **Real-Time Notification Engine:** Contextual notification badges update users on connection requests, mentorship acceptances, and event milestones.
- **Clean RESTful API Architecture:** Decoupled backend architecture ready for cross-platform integration (Web, Mobile Apps, Campus Kiosks).`
  },
  {
    id: 'functional-requirements',
    number: 6,
    title: 'Functional Requirements',
    summary: 'Exhaustive functional specifications for all 4 user roles.',
    content: `1. **User Authentication & Authorization:**
   - Registration with mandatory academic attributes (Roll Number / Graduation Year / Department).
   - Secure login with BCrypt password hashing and JWT token issuance.
   - Profile management with avatar, bio, headline, and professional history.

2. **Alumni Directory & Search:**
   - Search by keyword (name, company, skills).
   - Multi-criteria filtering by Graduation Year, Department, Industry, and Mentoring Availability.

3. **Networking & Connections:**
   - Send, cancel, accept, and reject connection requests.
   - View mutual connections and dedicated "My Network" hub.

4. **Mentorship Management:**
   - Browse mentors with skill matching score indicators.
   - Mentorship application form with 7 designated categories.
   - Status pipeline: PENDING ➔ ACCEPTED ➔ ACTIVE ➔ COMPLETED (or REJECTED).

5. **Events Management:**
   - Create, edit, publish, and delete events (Admin/Faculty).
   - Real-time seat occupancy counter and participant list audit.

6. **Career Opportunities & Applications:**
   - Post job/internship/referral opportunities (Alumni/Admin).
   - One-click profile application submission and tracking.

7. **Contribution & Endowment Tracking:**
   - Contribution pledge forms for monetary and non-monetary gifts.
   - Verification status by institutional accountants.`
  },
  {
    id: 'non-functional-requirements',
    number: 7,
    title: 'Non-Functional Requirements',
    summary: 'System performance, security, reliability, and usability criteria.',
    content: `- **Performance:** Sub-200ms REST API response times for indexed database queries.
- **Security:** OWASP compliance, BCrypt password salt rounds, Cross-Origin Resource Sharing (CORS) whitelisting, and SQL Injection prevention through JPA parameterized queries.
- **Usability:** 100% responsive layout across desktop displays (1920px), laptops (1366px), tablets (768px), and mobile devices (375px).
- **Scalability:** Stateless Spring Boot micro-service design capable of horizontal scaling behind load balancers with MySQL read replicas.
- **Data Integrity:** Foreign key constraints with cascading deletes where appropriate (e.g., deleting a user cleanly cascades associated notifications).`
  },
  {
    id: 'technology-stack',
    number: 8,
    title: 'Technology Stack',
    summary: 'Detailed explanation of all tools, libraries, and frameworks employed.',
    content: `| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Language** | Java (OpenJDK) | 17 LTS | Core object-oriented backend programming language |
| **Framework** | Spring Boot | 3.2.3 | Production-ready microservice backend & REST API container |
| **Persistence** | Spring Data JPA / Hibernate | 6.x | Object-Relational Mapping (ORM) and data abstraction |
| **Database** | MySQL | 8.0+ | Relational ACID database with foreign keys & indexes |
| **Security** | Spring Security & JJWT | 6.x / 0.11.5 | Role-based authorization & stateless JWT authentication |
| **Frontend** | React & TypeScript | 19.x / 5.x | High-performance component-based client user interface |
| **Styling** | Tailwind CSS & Lucide Icons | 4.x / 0.546 | Modern responsive university UI design system |
| **Animations** | Motion | 12.x | Fluid layout transitions and interactive user feedback |
| **Build Tool** | Maven (pom.xml) | 3.9+ | Java dependency management and project compilation |`
  },
  {
    id: 'system-architecture',
    number: 9,
    title: 'System Architecture',
    summary: 'Layered 4-tier architecture diagram and data flow pipeline.',
    content: `### Layered Architecture Flow
\`\`\`
[ Client Browser / React UI ]
             │
       (HTTP / JSON REST API)
             ▼
[ Spring MVC Controllers (Presentation Layer) ]
             │ (Validates DTOs, extracts JWT claims)
             ▼
[ Spring Service Layer (Business Logic & OOP Rules) ]
             │ (Transaction management, recommendation logic)
             ▼
[ Spring Data JPA Repositories (Data Access Layer) ]
             │ (Hibernate ORM queries, JPQL)
             ▼
[ MySQL Relational Database (Storage Layer) ]
\`\`\`

### Architectural Principles:
1. **Separation of Concerns:** Controllers handle HTTP status codes; Services enforce business validation; Repositories execute database interactions.
2. **Stateless Authentication:** Every protected HTTP request passes an Authorization Bearer token validated by Spring Security filter chains.`
  },
  {
    id: 'use-case',
    number: 10,
    title: 'Use Case Diagram & Descriptions',
    summary: 'Primary system actors and their interaction boundaries.',
    content: `### Primary Actors:
1. **Student Actor:**
   - Register Profile ➔ Browse Alumni ➔ Send Connection Request ➔ Submit Mentorship Application ➔ Browse & Apply for Jobs ➔ Register for Events.
2. **Alumni Actor:**
   - Update Professional Experience & Skills ➔ Accept/Reject Connections ➔ Review Mentorship Inquiries ➔ Post Career Referrals ➔ Pledge Contributions.
3. **Faculty Actor:**
   - Review Department Alumni ➔ Monitor Student-Mentor Pairings ➔ Organize Department Guest Lectures.
4. **Admin Actor:**
   - Manage User Accounts (Approve/Block) ➔ Manage University Events ➔ Audit Contributions & Endowments ➔ Generate Analytics Reports.`
  },
  {
    id: 'er-diagram',
    number: 11,
    title: 'Entity-Relationship (ER) Diagram Description',
    summary: 'Relational entities, cardinalities, and foreign-key mappings.',
    content: `### Relational Cardinalities:
- **User (1) ➔ (1) AlumniProfile:** One-to-One linked via \`user_id\`.
- **User (1) ➔ (1) StudentProfile:** One-to-One linked via \`user_id\`.
- **User (1) ➔ (N) Connections:** One user can be the requester or receiver of multiple connections.
- **Student (1) ➔ (N) MentorshipRequests (N) ➔ (1) Mentor:** Many-to-One with two distinct User foreign keys.
- **Event (1) ➔ (N) EventRegistrations (N) ➔ (1) User:** Many-to-Many bridge table tracking participant signups.
- **Alumni (1) ➔ (N) CareerOpportunities:** One alumni posts multiple jobs.
- **Opportunity (1) ➔ (N) JobApplications (N) ➔ (1) Student:** Many-to-Many junction tracking job submissions.
- **Alumni (1) ➔ (N) Contributions:** One alumni makes multiple monetary or in-kind donations.`
  },
  {
    id: 'db-schema',
    number: 12,
    title: 'Database Schema & Tables',
    summary: 'Comprehensive list of all 12 relational database tables.',
    content: `The MySQL database contains 12 normalized tables:
1. \`users\`: Primary user auth records (ID, name, email, password_hash, role, department, status).
2. \`alumni_profiles\`: Professional metadata (company, job_title, industry, skills, is_available_for_mentoring).
3. \`student_profiles\`: Academic metadata (roll_no, current_year, target_skills).
4. \`connections\`: Bidirectional connection status (requester_id, receiver_id, status).
5. \`mentorship_requests\`: Structured mentor-mentee engagements (student_id, mentor_id, category, message, notes, status).
6. \`events\`: Campus and virtual gatherings (title, date, time, venue, max_participants, organizer_id).
7. \`event_registrations\`: Bridge table (event_id, user_id, registered_at).
8. \`career_opportunities\`: Jobs, internships, referrals (title, company, type, salary, deadline, posted_by_id).
9. \`job_applications\`: Applicant submissions (opportunity_id, applicant_id, resume_note, status).
10. \`contributions\`: Institutional donations (alumni_id, contribution_type, amount, description, status).
11. \`messages\`: Internal communication thread (sender_id, receiver_id, content, is_read).
12. \`notifications\`: User alert dispatch (user_id, title, message, type, is_read).`
  },
  {
    id: 'modules',
    number: 13,
    title: 'Module Descriptions',
    summary: 'Deep-dive into each of the system modules.',
    content: `- **Module 1 (Authentication):** Role-based login and registration with BCrypt hashing and demo quick-login shortcuts.
- **Module 2 (Alumni Directory):** Filterable grid with live search across 6 dimensions and responsive profile dialogs.
- **Module 3 (Networking Hub):** Three-tiered connection management (Connected, Requests Received, Requests Sent).
- **Module 4 (Mentorship Program):** Interactive mentor catalog with 85% skill-match badges and full lifecycle state changes.
- **Module 5 (Events Management):** Seat reservation system with validation preventing overbooking.
- **Module 6 (Career Opportunities):** Multi-tier job board with application state progression (Applied ➔ Under Review ➔ Interview).
- **Module 7 (Alumni Contributions):** Financial and in-kind pledge portal with administrative audit cards.
- **Module 8 (Direct Messaging):** Real-time conversational interface with unread tracking between permitted pairs.
- **Module 9 (Notification Engine):** Interactive notification center with instant actionable deep-links.
- **Module 10 (Role Dashboards):** Specialized command centers for Students, Alumni, Faculty, and Administrators.`
  },
  {
    id: 'advantages',
    number: 14,
    title: 'System Advantages',
    summary: 'Key institutional benefits delivered by AlumniConnect.',
    content: `- **Boosts Campus Placement Rates:** Direct alumni referral opportunities grant students a fast track into Fortune 500 companies.
- **Preserves Institutional Heritage:** Alumni achievements are archived and recognized within their alma mater.
- **Zero Spam Environment:** By gating messaging behind mutual connections, alumni are protected from unsolicited mass outreach.
- **Audit-Ready Financials:** Administrative contribution charts provide verifiable accounting for endowments and scholarships.
- **Modern User Experience:** Built with contemporary visual standards, responsive typography, and intuitive accessibility.`
  },
  {
    id: 'limitations',
    number: 15,
    title: 'System Limitations',
    summary: 'Recognized architectural scope boundaries.',
    content: `- **Payment Gateway Integration:** Financial donations currently generate a verified pledge record; direct credit-card processing requires external payment gateway credentials (e.g., Razorpay/Stripe).
- **Automated Resume Parsing:** Resumes are submitted with structured portfolio notes; automatic PDF OCR parsing is slated for future releases.
- **Real-Time Video Calls:** Mentorship sessions use scheduling and messaging links; integrated WebRTC video conferencing is deferred to future milestones.`
  },
  {
    id: 'future-scope',
    number: 16,
    title: 'Future Scope & Enhancements',
    summary: 'Roadmap for post-graduation product evolution.',
    content: `1. **Native Mobile Application:** Packaging backend REST endpoints into Android (Kotlin/Compose) and iOS (Swift) native apps.
2. **Integrated Video Rooms:** WebRTC-based 1-on-1 video call rooms for direct mentorship mock interviews within the browser.
3. **Automated Degree Verification:** Integration with National Academic Depository (NAD) or university registrar APIs for instant alumni badge verification.
4. **Geo-Location Chapter Mapping:** Interactive world map showcasing alumni distribution across global tech hubs.`
  },
  {
    id: 'testing',
    number: 17,
    title: 'Testing Strategy',
    summary: 'Verification methodologies applied to ensure zero defects.',
    content: `- **Unit Testing:** JUnit 5 and Mockito testing service layer business rules and repository queries.
- **Integration Testing:** Spring Boot \`@SpringBootTest\` testing API controllers with MockMvc.
- **User Acceptance Testing (UAT):** Verifying role switching, connection approvals, event seat decrementing, and message delivery across 4 test personas.
- **Security Testing:** Validating that non-admin users cannot access administrative endpoints (\`/api/admin/**\`).`
  },
  {
    id: 'conclusion',
    number: 18,
    title: 'Conclusion',
    summary: 'Final summary of project execution and viva readiness.',
    content: `AlumniConnect successfully delivers a modern, secure, and intuitive web-based platform tailored for university alumni networking, mentorship, and career acceleration. 

By combining the robustness of Java 17 and Spring Boot on the backend with an agile, responsive React interface on the frontend, the project showcases the full spectrum of modern enterprise software engineering: object-oriented encapsulation, interface-driven service contracts, relational database normalization, and user-centric frontend ergonomics. The application is completely functional, thoroughly tested, and ready for deployment and academic examination.`
  }
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    category: 'Spring Boot',
    question: 'Why did you choose Spring Boot over standard Spring MVC for this project?',
    answer: 'Spring Boot eliminates boilerplate XML configuration through "Convention over Configuration". It provides auto-configuration, an embedded Tomcat server (no external WAR deployment required), and starter dependencies (like spring-boot-starter-data-jpa and spring-boot-starter-security) that streamline production readiness.'
  },
  {
    category: 'OOP / Architecture',
    question: 'How is Object-Oriented Programming (OOP) applied in AlumniConnect?',
    answer: '1. Encapsulation: All entity fields (User, Event, MentorshipRequest) are private with getter/setter accessors. 2. Abstraction: Service interfaces (e.g., AlumniService) define contracts separate from implementations (AlumniServiceImpl). 3. Polymorphism: Role-based dashboard rendering and generic repository operations. 4. Inheritance: Common domain entities extending base audit models.'
  },
  {
    category: 'JPA / Hibernate',
    question: 'What is the difference between @OneToMany and @ManyToMany in your entities?',
    answer: 'An Event has a Many-to-Many relationship with Users who register for it (one event has many attendees, and one user attends many events), mapped via the join table "event_registrations". In contrast, an Alumni has a One-to-Many relationship with CareerOpportunities (one alumni can post multiple job listings).'
  },
  {
    category: 'Database',
    question: 'How do you prevent SQL Injection in AlumniConnect?',
    answer: 'By utilizing Spring Data JPA and Hibernate, all database queries use parameterized prepared statements under the hood. Even when using custom JPQL @Query methods, variables are bound using named parameters (:department, :role), completely preventing malicious SQL injection.'
  },
  {
    category: 'Security',
    question: 'How does password hashing and authentication work in your system?',
    answer: 'Passwords are never stored in plaintext. We configure Spring Security\'s BCryptPasswordEncoder with a salt factor of 10. Upon login, the plaintext password is mathematically verified against the stored BCrypt hash. For authorized API requests, a signed JWT (JSON Web Token) is transmitted in the Authorization header.'
  },
  {
    category: 'OOP / Architecture',
    question: 'Explain the 4-layer architecture of your backend.',
    answer: 'Controller Layer (@RestController) receives HTTP requests, validates input DTOs, and returns HTTP ResponseEntity. Service Layer (@Service) contains business validation, transaction boundaries (@Transactional), and recommendation logic. Repository Layer (@Repository) extends JpaRepository for database CRUD. Entity Layer (@Entity) maps Java objects to MySQL tables.'
  },
  {
    category: 'Database',
    question: 'What happens if two users try to connect to each other at the exact same time?',
    answer: 'The connections table enforces a UNIQUE KEY constraint on (requester_id, receiver_id). Additionally, the service method checks if a bidirectional connection already exists before inserting, preventing duplicate connection records.'
  },
  {
    category: 'Spring Boot',
    question: 'What is the role of @ControllerAdvice in your application?',
    answer: '@ControllerAdvice provides global centralized exception handling across all controllers. When an exception like ResourceNotFoundException or MethodArgumentNotValidException is thrown anywhere in the service or controller layer, GlobalExceptionHandler intercepts it and returns a consistent JSON error response with appropriate HTTP status codes (404, 400, 500).'
  }
];
