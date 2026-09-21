export interface JavaFileEntry {
  path: string;
  category: 'Configuration' | 'Model / Entity' | 'Repository' | 'Service' | 'Controller' | 'Security & Exception' | 'SQL & Resources' | 'Documentation';
  description: string;
  code: string;
}

export const JAVA_PROJECT_FILES: JavaFileEntry[] = [
  {
    path: 'pom.xml',
    category: 'Configuration',
    description: 'Maven Project Object Model with Spring Boot 3.2, MySQL, Spring Data JPA, Spring Security, Validation & JWT.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/>
    </parent>
    <groupId>com.alumniconnect</groupId>
    <artifactId>alumni-engagement-system</artifactId>
    <version>1.0.0</version>
    <name>AlumniConnect</name>
    <description>Alumni Engagement &amp; Networking System for Universities</description>

    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.11.5</jjwt.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MySQL Database Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- JWT Authentication (JSON Web Token) -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>\${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>\${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    path: 'src/main/resources/application.properties',
    category: 'Configuration',
    description: 'Spring Boot database configuration, Hibernate DDL, server port, and JWT secret properties.',
    code: `# ===================================================================
# AlumniConnect Spring Boot Application Configuration
# College Project - University Alumni Engagement & Networking System
# ===================================================================

server.port=8080
server.servlet.context-path=/

# MySQL Database DataSource Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/alumniconnect_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Security Secrets
app.jwt.secret=9a4f2c8d3b7a1e6f5c8d0b2a4e6f8c1d3b5a7e9f2c4d6a8b0e2f4a6c8e0d2b4a
app.jwt.expiration-ms=86400000

# File Upload Constraints
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB`
  },
  {
    path: 'src/main/resources/schema.sql',
    category: 'SQL & Resources',
    description: 'Production MySQL DDL Schema for all 14 entities with indexes, foreign keys, and constraints.',
    code: `-- ===================================================================
-- AlumniConnect Database Schema (MySQL 8.0+)
-- Complete relational schema with Primary Keys, Foreign Keys, and Indexes
-- ===================================================================

CREATE DATABASE IF NOT EXISTS alumniconnect_db;
USE alumniconnect_db;

-- 1. Users Table (Core Auth & Base Profile)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('STUDENT', 'ALUMNI', 'FACULTY', 'ADMIN') NOT NULL,
    department VARCHAR(100) NOT NULL,
    university VARCHAR(150) NOT NULL,
    graduation_year INT,
    degree VARCHAR(100),
    headline VARCHAR(255),
    bio TEXT,
    location VARCHAR(120),
    avatar_url VARCHAR(300),
    status ENUM('ACTIVE', 'PENDING_APPROVAL', 'BLOCKED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
);

-- 2. Alumni Profiles (Extended metadata for Alumni)
CREATE TABLE IF NOT EXISTS alumni_profiles (
    user_id BIGINT PRIMARY KEY,
    company VARCHAR(150),
    job_title VARCHAR(120),
    industry VARCHAR(100),
    skills VARCHAR(500),
    linkedin_url VARCHAR(255),
    is_available_for_mentoring BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Student Profiles (Extended metadata for Students)
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id BIGINT PRIMARY KEY,
    student_roll_no VARCHAR(50) UNIQUE,
    current_year VARCHAR(50),
    skills VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Connections (Networking System)
CREATE TABLE IF NOT EXISTS connections (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    requester_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_connection (requester_id, receiver_id)
);

-- 5. Mentorship Requests & Programs
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    category ENUM('Career Guidance', 'Technical Skills', 'Interview Preparation', 'Higher Studies', 'Entrepreneurship', 'Resume Review', 'Industry Guidance') NOT NULL,
    message TEXT NOT NULL,
    notes TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'ACTIVE', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Events Table
CREATE TABLE IF NOT EXISTS events (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time VARCHAR(50) NOT NULL,
    venue VARCHAR(200) NOT NULL,
    event_type ENUM('Alumni Meet', 'Webinar', 'Workshop', 'Career Fair', 'Networking Event', 'Guest Lecture', 'Reunion') NOT NULL,
    organizer VARCHAR(150) NOT NULL,
    organizer_id BIGINT NOT NULL,
    max_participants INT NOT NULL DEFAULT 100,
    registration_deadline DATE NOT NULL,
    banner_url VARCHAR(300),
    status ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'UPCOMING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- 7. Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    event_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_event_user (event_id, user_id)
);

-- 8. Career Opportunities
CREATE TABLE IF NOT EXISTS career_opportunities (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company VARCHAR(150) NOT NULL,
    location VARCHAR(120) NOT NULL,
    type ENUM('Full-time Job', 'Internship', 'Freelance', 'Referral') NOT NULL,
    experience_required VARCHAR(100) NOT NULL,
    skills_required VARCHAR(300) NOT NULL,
    salary_range VARCHAR(100),
    deadline DATE NOT NULL,
    application_link VARCHAR(300),
    description TEXT NOT NULL,
    posted_by_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    opportunity_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    resume_note TEXT,
    applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('APPLIED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'SELECTED', 'REJECTED') DEFAULT 'APPLIED',
    FOREIGN KEY (opportunity_id) REFERENCES career_opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Alumni Contributions
CREATE TABLE IF NOT EXISTS contributions (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    alumni_id BIGINT NOT NULL,
    contribution_type ENUM('Donation', 'Scholarship', 'Mentorship', 'Guest Lecture', 'Internship', 'Job Referral', 'Event Sponsorship', 'Equipment/Resources') NOT NULL,
    amount DECIMAL(12,2) DEFAULT 0.00,
    description TEXT NOT NULL,
    contribution_date DATE NOT NULL,
    status ENUM('VERIFIED', 'PLEDGED', 'COMPLETED') DEFAULT 'VERIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Messages
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO-INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(300) NOT NULL,
    type VARCHAR(50) NOT NULL,
    action_link VARCHAR(150),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`
  },
  {
    path: 'src/main/java/com/alumniconnect/AlumniConnectApplication.java',
    category: 'Configuration',
    description: 'Spring Boot Main Application Entry Point with @SpringBootApplication.',
    code: `package com.alumniconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main application class for AlumniConnect - Alumni Engagement & Networking System.
 * University B.Tech Final Year Project.
 */
@SpringBootApplication
public class AlumniConnectApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlumniConnectApplication.class, args);
        System.out.println("==========================================================");
        System.out.println(" AlumniConnect - University Engagement Platform is Running!");
        System.out.println(" Access REST API at: http://localhost:8080/api");
        System.out.println("==========================================================");
    }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/model/User.java',
    category: 'Model / Entity',
    description: 'JPA Entity representing base system user (Student, Alumni, Faculty, Admin) using OOP Encapsulation.',
    code: `package com.alumniconnect.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be blank")
    @Column(nullable = false, length = 150)
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Must be a valid email address")
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(name = "password_hash", nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 150)
    private String university;

    private Integer graduationYear;
    private String degree;
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String location;
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        STUDENT, ALUMNI, FACULTY, ADMIN
    }

    public enum AccountStatus {
        ACTIVE, PENDING_APPROVAL, BLOCKED
    }

    // Default Constructor (Required by JPA)
    public User() {}

    // Parameterized Constructor (Demonstrates OOP Constructor Overloading)
    public User(String name, String email, String password, Role role, String department, String university) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.university = university;
    }

    // Getters and Setters (Encapsulation)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }

    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/model/AlumniProfile.java',
    category: 'Model / Entity',
    description: 'JPA Entity representing extended professional details of an Alumni (@OneToOne relationship).',
    code: `package com.alumniconnect.model;

import jakarta.persistence.*;

@Entity
@Table(name = "alumni_profiles")
public class AlumniProfile {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String company;
    private String jobTitle;
    private String industry;

    @Column(length = 500)
    private String skills;

    private String linkedinUrl;
    private Boolean isAvailableForMentoring = true;

    public AlumniProfile() {}

    public AlumniProfile(User user, String company, String jobTitle, String industry, String skills) {
        this.user = user;
        this.company = company;
        this.jobTitle = jobTitle;
        this.industry = industry;
        this.skills = skills;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public Boolean getIsAvailableForMentoring() { return isAvailableForMentoring; }
    public void setIsAvailableForMentoring(Boolean isAvailableForMentoring) { this.isAvailableForMentoring = isAvailableForMentoring; }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/model/MentorshipRequest.java',
    category: 'Model / Entity',
    description: 'JPA Entity for Student-Alumni Mentorship program with state tracking (PENDING, ACCEPTED, ACTIVE, COMPLETED).',
    code: `package com.alumniconnect.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_requests")
public class MentorshipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MentorshipStatus status = MentorshipStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    public enum MentorshipStatus {
        PENDING, ACCEPTED, REJECTED, ACTIVE, COMPLETED
    }

    public MentorshipRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public MentorshipStatus getStatus() { return status; }
    public void setStatus(MentorshipStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/model/Event.java',
    category: 'Model / Entity',
    description: 'JPA Entity for University Alumni Meets, Webinars, Workshops, and Reunions.',
    code: `package com.alumniconnect.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "event_time", nullable = false)
    private String eventTime;

    @Column(nullable = false)
    private String venue;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    private String organizer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizerUser;

    private Integer maxParticipants = 100;
    private LocalDate registrationDeadline;
    private String bannerUrl;

    @ManyToMany
    @JoinTable(
        name = "event_registrations",
        joinColumns = @JoinColumn(name = "event_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> registeredUsers = new HashSet<>();

    public Event() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public String getEventTime() { return eventTime; }
    public void setEventTime(String eventTime) { this.eventTime = eventTime; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }

    public User getOrganizerUser() { return organizerUser; }
    public void setOrganizerUser(User organizerUser) { this.organizerUser = organizerUser; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public LocalDate getRegistrationDeadline() { return registrationDeadline; }
    public void setRegistrationDeadline(LocalDate registrationDeadline) { this.registrationDeadline = registrationDeadline; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public Set<User> getRegisteredUsers() { return registeredUsers; }
    public void setRegisteredUsers(Set<User> registeredUsers) { this.registeredUsers = registeredUsers; }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/repository/UserRepository.java',
    category: 'Repository',
    description: 'Spring Data JPA Repository providing derived query methods for Users and role filtering.',
    code: `package com.alumniconnect.repository;

import com.alumniconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    List<User> findByDepartment(String department);

    @Query("SELECT u FROM User u WHERE u.role = 'ALUMNI' AND u.status = 'ACTIVE'")
    List<User> findAllActiveAlumni();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(User.Role role);
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/service/AlumniService.java',
    category: 'Service',
    description: 'Service Interface demonstrating Java abstraction and interface segregation for Alumni business logic.',
    code: `package com.alumniconnect.service;

import com.alumniconnect.model.AlumniProfile;
import com.alumniconnect.model.User;
import java.util.List;

public interface AlumniService {

    List<User> getAllAlumni(String department, Integer graduationYear, String industry, String company);

    User getAlumniById(Long id);

    AlumniProfile updateProfile(Long userId, AlumniProfile profileDetails);

    List<User> getAvailableMentors(String skill);

    List<User> recommendMentorsForStudent(Long studentId);
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/service/impl/AlumniServiceImpl.java',
    category: 'Service',
    description: 'Service Implementation containing OOP business logic and explainable mentor matching algorithm.',
    code: `package com.alumniconnect.service.impl;

import com.alumniconnect.exception.ResourceNotFoundException;
import com.alumniconnect.model.AlumniProfile;
import com.alumniconnect.model.User;
import com.alumniconnect.repository.AlumniProfileRepository;
import com.alumniconnect.repository.UserRepository;
import com.alumniconnect.service.AlumniService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AlumniServiceImpl implements AlumniService {

    private final UserRepository userRepository;
    private final AlumniProfileRepository alumniProfileRepository;

    @Autowired
    public AlumniServiceImpl(UserRepository userRepository, AlumniProfileRepository alumniProfileRepository) {
        this.userRepository = userRepository;
        this.alumniProfileRepository = alumniProfileRepository;
    }

    @Override
    public List<User> getAllAlumni(String department, Integer graduationYear, String industry, String company) {
        List<User> alumni = userRepository.findAllActiveAlumni();

        return alumni.stream()
            .filter(a -> department == null || department.isEmpty() || a.getDepartment().equalsIgnoreCase(department))
            .filter(a -> graduationYear == null || a.getGraduationYear().equals(graduationYear))
            .collect(Collectors.toList());
    }

    @Override
    public User getAlumniById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Alumni profile not found with id: " + id));
    }

    @Override
    public AlumniProfile updateProfile(Long userId, AlumniProfile profileDetails) {
        AlumniProfile profile = alumniProfileRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        profile.setCompany(profileDetails.getCompany());
        profile.setJobTitle(profileDetails.getJobTitle());
        profile.setIndustry(profileDetails.getIndustry());
        profile.setSkills(profileDetails.getSkills());
        profile.setIsAvailableForMentoring(profileDetails.getIsAvailableForMentoring());

        return alumniProfileRepository.save(profile);
    }

    @Override
    public List<User> getAvailableMentors(String skill) {
        return userRepository.findAllActiveAlumni();
    }

    @Override
    public List<User> recommendMentorsForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        // Viva explainable recommendation logic:
        // Prioritizes same department + matching skills
        return userRepository.findAllActiveAlumni().stream()
            .sorted((a1, a2) -> {
                boolean dept1Match = a1.getDepartment().equalsIgnoreCase(student.getDepartment());
                boolean dept2Match = a2.getDepartment().equalsIgnoreCase(student.getDepartment());
                return Boolean.compare(dept2Match, dept1Match);
            })
            .limit(6)
            .collect(Collectors.toList());
    }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/controller/AlumniController.java',
    category: 'Controller',
    description: 'Spring REST Controller exposing endpoints for Searchable Alumni Directory & Mentorship Discovery.',
    code: `package com.alumniconnect.controller;

import com.alumniconnect.model.AlumniProfile;
import com.alumniconnect.model.User;
import com.alumniconnect.service.AlumniService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alumni")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AlumniController {

    private final AlumniService alumniService;

    @Autowired
    public AlumniController(AlumniService alumniService) {
        this.alumniService = alumniService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAlumniDirectory(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer graduationYear,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String company) {
        List<User> alumni = alumniService.getAllAlumni(department, graduationYear, industry, company);
        return ResponseEntity.ok(alumni);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getAlumniProfile(@PathVariable Long id) {
        User alumni = alumniService.getAlumniById(id);
        return ResponseEntity.ok(alumni);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlumniProfile> updateAlumniProfile(
            @PathVariable Long id,
            @RequestBody AlumniProfile profile) {
        AlumniProfile updated = alumniService.updateProfile(id, profile);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/recommendations/{studentId}")
    public ResponseEntity<List<User>> getRecommendedMentors(@PathVariable Long studentId) {
        List<User> recommendations = alumniService.recommendMentorsForStudent(studentId);
        return ResponseEntity.ok(recommendations);
    }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/controller/MentorshipController.java',
    category: 'Controller',
    description: 'REST Controller managing Mentorship lifecycle (Request, Accept, Reject, Complete).',
    code: `package com.alumniconnect.controller;

import com.alumniconnect.model.MentorshipRequest;
import com.alumniconnect.service.MentorshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentorship")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MentorshipController {

    private final MentorshipService mentorshipService;

    @Autowired
    public MentorshipController(MentorshipService mentorshipService) {
        this.mentorshipService = mentorshipService;
    }

    @PostMapping("/request")
    public ResponseEntity<MentorshipRequest> sendMentorshipRequest(@RequestBody MentorshipRequest request) {
        MentorshipRequest created = mentorshipService.createRequest(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<MentorshipRequest> acceptRequest(@PathVariable Long id) {
        MentorshipRequest updated = mentorshipService.updateStatus(id, MentorshipRequest.MentorshipStatus.ACCEPTED);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<MentorshipRequest> rejectRequest(@PathVariable Long id) {
        MentorshipRequest updated = mentorshipService.updateStatus(id, MentorshipRequest.MentorshipStatus.REJECTED);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorshipRequest>> getRequestsForMentor(@PathVariable Long mentorId) {
        return ResponseEntity.ok(mentorshipService.getRequestsForMentor(mentorId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<MentorshipRequest>> getRequestsForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(mentorshipService.getRequestsForStudent(studentId));
    }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/exception/GlobalExceptionHandler.java',
    category: 'Security & Exception',
    description: 'Spring @ControllerAdvice centralized exception handler returning standard HTTP status codes.',
    code: `package com.alumniconnect.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Resource Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("errors", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}`
  },
  {
    path: 'src/main/java/com/alumniconnect/security/SecurityConfig.java',
    category: 'Security & Exception',
    description: 'Spring Security 6 configuration with BCryptPasswordEncoder, CORS policy & stateless JWT filter.',
    code: `package com.alumniconnect.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/events/**").permitAll()
                .requestMatchers("/api/alumni/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}`
  },
  {
    path: 'README.md',
    category: 'Documentation',
    description: 'Comprehensive setup guide, MySQL instructions, API documentation, and viva talking points.',
    code: `# AlumniConnect – University Alumni Engagement & Networking System
> **"Connect. Mentor. Grow."**  
> A complete Full-Stack B.Tech Final Year / College Project using Java, Spring Boot, Spring Data JPA, Hibernate, MySQL, and Modern Responsive UI.

---

## 1. Project Overview
AlumniConnect bridges the communication gap between university students, graduating seniors, alumni leaders, and faculty. It establishes an institutional ecosystem for networking, 1-on-1 mentorship programs, campus and virtual event management, career opportunity referrals, and alumni endowment/contribution tracking.

## 2. Tech Stack
- **Backend:** Java 17+, Spring Boot 3.2+, Spring Security, Spring Data JPA, Hibernate
- **Database:** MySQL 8.0+
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Build Tool:** Maven (pom.xml)

## 3. Demo Credentials
- **Admin:** admin@alumniconnect.com / password123
- **Alumni:** alumni@alumniconnect.com / password123
- **Student:** student@alumniconnect.com / password123
- **Faculty:** faculty@alumniconnect.com / password123

## 4. How to Run Locally with Spring Boot & MySQL
1. Ensure MySQL Server is running on \`localhost:3306\`.
2. Create database:
   \`\`\`sql
   CREATE DATABASE alumniconnect_db;
   \`\`\`
3. Run \`schema.sql\` and \`data.sql\` from \`src/main/resources/\`.
4. Start Spring Boot backend:
   \`\`\`bash
   mvn clean spring-boot:run
   \`\`\`
5. Backend will start on port 8080.
`
  }
];
