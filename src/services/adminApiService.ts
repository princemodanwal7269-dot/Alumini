import {
  User,
  UserRole,
  UserStatus,
  EventItem,
  MentorshipRequest,
  MentorshipStatus,
  CareerOpportunity,
  Contribution,
  SystemStats,
} from '../types';
import { StorageService } from './storageService';
import { StudentApiService } from './studentApiService';

class AdminApiServiceImpl {
  /**
   * 1. USER MANAGEMENT: Update User Status (ACTIVE, BLOCKED, PENDING_APPROVAL)
   * Controller: com.alumniconnect.controller.AdminUserController
   * Endpoint: PUT /api/admin/users/{id}/status
   */
  public async updateUserStatus(userId: string, status: UserStatus, reason?: string): Promise<void> {
    const startTime = performance.now();
    StorageService.updateUserStatus(userId, status);
    const duration = Math.round(performance.now() - startTime + 52);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/users/${userId}/status`,
      controller: 'com.alumniconnect.controller.AdminUserController',
      javaMethod: 'public ResponseEntity<ApiResponse> updateUserStatus(@PathVariable String id, @RequestParam UserStatus status, @RequestParam(required=false) String reason)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { userId, status, reason },
      responsePayload: {
        success: true,
        userId,
        status,
        message: `Account status updated to ${status}. Notification dispatched.`,
      },
      sqlQuery: `UPDATE users SET status='${status}', updated_at=NOW() WHERE id='${userId}';`,
    });
  }

  /**
   * USER MANAGEMENT: Change User Role (STUDENT, ALUMNI, FACULTY, ADMIN)
   * Endpoint: PUT /api/admin/users/{id}/role
   */
  public async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const startTime = performance.now();
    StorageService.updateUser(userId, { role: newRole });
    const duration = Math.round(performance.now() - startTime + 60);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/users/${userId}/role`,
      controller: 'com.alumniconnect.controller.AdminUserController',
      javaMethod: 'public ResponseEntity<ApiResponse> updateUserRole(@PathVariable String id, @RequestBody RoleUpdateRequest req)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { userId, newRole },
      responsePayload: { success: true, userId, newRole, message: `User role reassigned to ${newRole}. Security authorities refreshed.` },
      sqlQuery: `UPDATE users SET role='${newRole}', updated_at=NOW() WHERE id='${userId}';`,
    });
  }

  /**
   * USER MANAGEMENT: Edit User Details
   * Endpoint: PUT /api/admin/users/{id}
   */
  public async updateUserDetails(userId: string, updates: Partial<User>): Promise<User> {
    const startTime = performance.now();
    const updated = StorageService.updateUser(userId, updates);
    const duration = Math.round(performance.now() - startTime + 65);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/users/${userId}`,
      controller: 'com.alumniconnect.controller.AdminUserController',
      javaMethod: 'public ResponseEntity<UserDTO> updateUserDetails(@PathVariable String id, @Valid @RequestBody AdminUserUpdateDTO dto)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: updates,
      responsePayload: { success: true, user: updated, message: 'Institutional record updated successfully.' },
      sqlQuery: `UPDATE users SET name='${updates.name || ''}', email='${updates.email || ''}', department='${updates.department || ''}', company='${updates.company || ''}', job_title='${updates.jobTitle || ''}' WHERE id='${userId}';`,
    });

    return updated!;
  }

  /**
   * USER MANAGEMENT: Create New User directly
   * Endpoint: POST /api/admin/users
   */
  public async createUser(data: Partial<User>): Promise<User> {
    const startTime = performance.now();
    const newUser = StorageService.registerUser(data);
    // If admin creates, mark active immediately
    if (data.status) {
      StorageService.updateUserStatus(newUser.id, data.status);
      newUser.status = data.status;
    } else {
      StorageService.updateUserStatus(newUser.id, 'ACTIVE');
      newUser.status = 'ACTIVE';
    }
    const duration = Math.round(performance.now() - startTime + 70);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: '/api/admin/users',
      controller: 'com.alumniconnect.controller.AdminUserController',
      javaMethod: 'public ResponseEntity<UserDTO> createUser(@Valid @RequestBody AdminCreateUserDTO dto)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: data,
      responsePayload: { success: true, userId: newUser.id, role: newUser.role, message: 'Account provisioned by Administrator.' },
      sqlQuery: `INSERT INTO users (id, name, email, role, department, status, created_at) VALUES ('${newUser.id}', '${newUser.name}', '${newUser.email}', '${newUser.role}', '${newUser.department}', 'ACTIVE', NOW());`,
    });

    return newUser;
  }

  /**
   * USER MANAGEMENT: Delete User Account
   * Endpoint: DELETE /api/admin/users/{id}
   */
  public async deleteUser(userId: string): Promise<void> {
    const startTime = performance.now();
    StorageService.deleteUser(userId);
    const duration = Math.round(performance.now() - startTime + 45);

    StudentApiService.recordCustomLog({
      method: 'DELETE',
      endpoint: `/api/admin/users/${userId}`,
      controller: 'com.alumniconnect.controller.AdminUserController',
      javaMethod: 'public ResponseEntity<ApiResponse> deleteUser(@PathVariable String id)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: { success: true, userId, message: 'User record purged from university schema.' },
      sqlQuery: `DELETE FROM users WHERE id='${userId}';`,
    });
  }

  /**
   * 2. ALUMNI APPROVAL: Approve Pending Alumnus
   * Controller: com.alumniconnect.controller.AlumniVerificationController
   * Endpoint: POST /api/admin/alumni/{id}/approve
   */
  public async approveAlumni(userId: string, remarks?: string): Promise<void> {
    const startTime = performance.now();
    StorageService.updateUserStatus(userId, 'ACTIVE');
    StorageService.createNotification({
      userId,
      title: 'Alumni Credentials Approved!',
      message: 'Your alumni registration and graduation credentials have been verified by the Dean of Alumni Affairs.',
      type: 'SYSTEM',
      actionLink: 'alumni',
    });
    const duration = Math.round(performance.now() - startTime + 58);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: `/api/admin/alumni/${userId}/approve`,
      controller: 'com.alumniconnect.controller.AlumniVerificationController',
      javaMethod: 'public ResponseEntity<ApiResponse> approveAlumni(@PathVariable String id, @RequestBody(required=false) VerificationRemarksDTO remarks)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { userId, remarks: remarks || 'Verified against student database records.' },
      responsePayload: {
        success: true,
        alumniId: userId,
        status: 'ACTIVE',
        verificationTimestamp: new Date().toISOString(),
        message: 'Alumni account approved & official alumni badge granted.',
      },
      sqlQuery: `UPDATE users SET status='ACTIVE', verified_by='DeanSwaminathan', verified_at=NOW() WHERE id='${userId}';`,
    });
  }

  /**
   * ALUMNI APPROVAL: Reject Pending Alumnus
   * Endpoint: POST /api/admin/alumni/{id}/reject
   */
  public async rejectAlumni(userId: string, reason: string): Promise<void> {
    const startTime = performance.now();
    StorageService.updateUserStatus(userId, 'BLOCKED');
    StorageService.createNotification({
      userId,
      title: 'Alumni Verification Rejected',
      message: `Your alumni verification could not be validated. Reason: ${reason}`,
      type: 'SYSTEM',
    });
    const duration = Math.round(performance.now() - startTime + 48);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: `/api/admin/alumni/${userId}/reject`,
      controller: 'com.alumniconnect.controller.AlumniVerificationController',
      javaMethod: 'public ResponseEntity<ApiResponse> rejectAlumni(@PathVariable String id, @Valid @RequestBody RejectionDTO dto)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { userId, reason },
      responsePayload: { success: true, alumniId: userId, status: 'BLOCKED', reason },
      sqlQuery: `UPDATE users SET status='BLOCKED', rejection_reason='${reason.replace(/'/g, "''")}', updated_at=NOW() WHERE id='${userId}';`,
    });
  }

  /**
   * ALUMNI APPROVAL: Batch Approve All Pending
   * Endpoint: POST /api/admin/alumni/batch-approve
   */
  public async batchApproveAlumni(userIds: string[]): Promise<number> {
    const startTime = performance.now();
    let count = 0;
    for (const uid of userIds) {
      StorageService.updateUserStatus(uid, 'ACTIVE');
      StorageService.createNotification({
        userId: uid,
        title: 'Alumni Status Approved!',
        message: 'Your alumni credentials were authenticated via bulk administrative verification.',
        type: 'SYSTEM',
        actionLink: 'alumni',
      });
      count++;
    }
    const duration = Math.round(performance.now() - startTime + 90);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: '/api/admin/alumni/batch-approve',
      controller: 'com.alumniconnect.controller.AlumniVerificationController',
      javaMethod: 'public ResponseEntity<BatchApprovalResponse> batchApprove(@RequestBody List<String> userIds)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { userIds },
      responsePayload: { success: true, approvedCount: count, totalProcessed: userIds.length },
      sqlQuery: `UPDATE users SET status='ACTIVE', verified_at=NOW() WHERE id IN (${userIds.map((id) => `'${id}'`).join(', ')});`,
    });

    return count;
  }

  /**
   * 3. EVENT MANAGEMENT: Create Institutional Event
   * Controller: com.alumniconnect.controller.AdminEventController
   * Endpoint: POST /api/admin/events
   */
  public async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    const startTime = performance.now();
    const newEvent = StorageService.createEvent(data);
    const duration = Math.round(performance.now() - startTime + 65);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: '/api/admin/events',
      controller: 'com.alumniconnect.controller.AdminEventController',
      javaMethod: 'public ResponseEntity<EventDTO> createInstitutionalEvent(@Valid @RequestBody EventCreateDTO dto)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: data,
      responsePayload: { success: true, event: newEvent, message: 'Campus event published to student and alumni calendars.' },
      sqlQuery: `INSERT INTO events (id, title, event_type, event_date, event_time, venue, max_participants, organizer, status) VALUES ('${newEvent.id}', '${newEvent.title}', '${newEvent.type}', '${newEvent.date}', '${newEvent.time}', '${newEvent.venue}', ${newEvent.maxParticipants}, '${newEvent.organizer}', 'UPCOMING');`,
    });

    return newEvent;
  }

  /**
   * EVENT MANAGEMENT: Update Event
   * Endpoint: PUT /api/admin/events/{id}
   */
  public async updateEvent(eventId: string, data: Partial<EventItem>): Promise<void> {
    const startTime = performance.now();
    StorageService.updateEvent(eventId, data);
    const duration = Math.round(performance.now() - startTime + 50);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/events/${eventId}`,
      controller: 'com.alumniconnect.controller.AdminEventController',
      javaMethod: 'public ResponseEntity<EventDTO> updateEvent(@PathVariable String id, @Valid @RequestBody EventUpdateDTO dto)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: data,
      responsePayload: { success: true, eventId, message: 'Event updated.' },
      sqlQuery: `UPDATE events SET title='${data.title || ''}', venue='${data.venue || ''}', status='${data.status || 'UPCOMING'}' WHERE id='${eventId}';`,
    });
  }

  /**
   * EVENT MANAGEMENT: Cancel Event
   * Endpoint: PUT /api/admin/events/{id}/cancel
   */
  public async cancelEvent(eventId: string, reason?: string): Promise<void> {
    const startTime = performance.now();
    StorageService.updateEvent(eventId, { status: 'CANCELLED' });
    const ev = StorageService.getEvents().find((e) => e.id === eventId);
    if (ev) {
      ev.registeredUserIds.forEach((uid) => {
        StorageService.createNotification({
          userId: uid,
          title: `Event Cancelled: ${ev.title}`,
          message: `The scheduled event "${ev.title}" has been cancelled by administration. Reason: ${reason || 'Administrative reschedule'}`,
          type: 'EVENT',
        });
      });
    }
    const duration = Math.round(performance.now() - startTime + 55);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/events/${eventId}/cancel`,
      controller: 'com.alumniconnect.controller.AdminEventController',
      javaMethod: 'public ResponseEntity<ApiResponse> cancelEvent(@PathVariable String id, @RequestParam(required=false) String reason)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { eventId, reason },
      responsePayload: { success: true, eventId, status: 'CANCELLED', attendeesNotified: ev?.registeredUserIds.length || 0 },
      sqlQuery: `UPDATE events SET status='CANCELLED', cancellation_reason='${reason || ''}', updated_at=NOW() WHERE id='${eventId}';`,
    });
  }

  /**
   * EVENT MANAGEMENT: Delete Event
   * Endpoint: DELETE /api/admin/events/{id}
   */
  public async deleteEvent(eventId: string): Promise<void> {
    const startTime = performance.now();
    StorageService.deleteEvent(eventId);
    const duration = Math.round(performance.now() - startTime + 42);

    StudentApiService.recordCustomLog({
      method: 'DELETE',
      endpoint: `/api/admin/events/${eventId}`,
      controller: 'com.alumniconnect.controller.AdminEventController',
      javaMethod: 'public ResponseEntity<ApiResponse> deleteEvent(@PathVariable String id)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: { success: true, eventId },
      sqlQuery: `DELETE FROM events WHERE id='${eventId}';`,
    });
  }

  /**
   * 4. MENTORSHIP MANAGEMENT: Override Mentorship Status
   * Controller: com.alumniconnect.controller.AdminMentorshipController
   * Endpoint: PUT /api/admin/mentorships/{id}/status
   */
  public async updateMentorshipStatus(reqId: string, status: MentorshipStatus, notes?: string): Promise<void> {
    const startTime = performance.now();
    StorageService.updateMentorshipStatus(reqId, status, notes);
    const duration = Math.round(performance.now() - startTime + 50);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/mentorships/${reqId}/status`,
      controller: 'com.alumniconnect.controller.AdminMentorshipController',
      javaMethod: 'public ResponseEntity<ApiResponse> updateStatus(@PathVariable String id, @RequestParam MentorshipStatus status, @RequestParam(required=false) String notes)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { reqId, status, notes },
      responsePayload: { success: true, reqId, status, message: 'Mentorship pair updated by administration.' },
      sqlQuery: `UPDATE mentorship_requests SET status='${status}', notes='${notes || ''}', updated_at=NOW() WHERE id='${reqId}';`,
    });
  }

  /**
   * MENTORSHIP MANAGEMENT: Reassign Mentor
   * Endpoint: PUT /api/admin/mentorships/{id}/reassign
   */
  public async reassignMentor(reqId: string, newMentorId: string): Promise<void> {
    const startTime = performance.now();
    StorageService.reassignMentor(reqId, newMentorId);
    const duration = Math.round(performance.now() - startTime + 56);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/mentorships/${reqId}/reassign`,
      controller: 'com.alumniconnect.controller.AdminMentorshipController',
      javaMethod: 'public ResponseEntity<ApiResponse> reassignMentor(@PathVariable String id, @RequestParam String newMentorId)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { reqId, newMentorId },
      responsePayload: { success: true, reqId, newMentorId, message: 'Mentorship reassigned successfully.' },
      sqlQuery: `UPDATE mentorship_requests SET mentor_id='${newMentorId}', status='ACCEPTED', updated_at=NOW() WHERE id='${reqId}';`,
    });
  }

  /**
   * 5. CAREER OPPORTUNITIES: Create University Placement Drive
   * Controller: com.alumniconnect.controller.AdminCareerController
   * Endpoint: POST /api/admin/careers
   */
  public async createCareerOpportunity(data: Partial<CareerOpportunity>): Promise<CareerOpportunity> {
    const startTime = performance.now();
    const opportunity = StorageService.createOpportunity({
      ...data,
      postedById: 'user-admin-1',
      postedByName: 'Campus Placement & Alumni Affairs Cell',
      postedByRole: 'ADMIN',
    });
    const duration = Math.round(performance.now() - startTime + 64);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: '/api/admin/careers',
      controller: 'com.alumniconnect.controller.AdminCareerController',
      javaMethod: 'public ResponseEntity<CareerDTO> createPlacementOpportunity(@Valid @RequestBody CareerCreateDTO dto)',
      status: 201,
      statusText: 'Created',
      durationMs: duration,
      requestPayload: data,
      responsePayload: { success: true, opportunity, message: 'Campus recruitment / referral opportunity published.' },
      sqlQuery: `INSERT INTO career_opportunities (id, title, company, location, type, salary_range, deadline, posted_by_id) VALUES ('${opportunity.id}', '${opportunity.title}', '${opportunity.company}', '${opportunity.location}', '${opportunity.type}', '${opportunity.salaryRange}', '${opportunity.deadline}', 'user-admin-1');`,
    });

    return opportunity;
  }

  /**
   * CAREER OPPORTUNITIES: Delete Job Listing
   * Endpoint: DELETE /api/admin/careers/{id}
   */
  public async deleteCareerOpportunity(id: string): Promise<void> {
    const startTime = performance.now();
    StorageService.deleteCareer(id);
    const duration = Math.round(performance.now() - startTime + 44);

    StudentApiService.recordCustomLog({
      method: 'DELETE',
      endpoint: `/api/admin/careers/${id}`,
      controller: 'com.alumniconnect.controller.AdminCareerController',
      javaMethod: 'public ResponseEntity<ApiResponse> deleteCareerOpportunity(@PathVariable String id)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: { success: true, opportunityId: id },
      sqlQuery: `DELETE FROM career_opportunities WHERE id='${id}';`,
    });
  }

  /**
   * 6. CONTRIBUTION TRACKING: Verify Philanthropic Contribution
   * Controller: com.alumniconnect.controller.AdminContributionController
   * Endpoint: PUT /api/admin/contributions/{id}/verify
   */
  public async verifyContribution(id: string): Promise<void> {
    const startTime = performance.now();
    StorageService.verifyContribution(id);
    const contrib = StorageService.getContributions().find((c) => c.id === id);
    if (contrib) {
      StorageService.createNotification({
        userId: contrib.alumniId,
        title: 'Contribution Verified & Receipt Available',
        message: `Your contribution of ₹${(contrib.amount || 0).toLocaleString()} for "${contrib.description}" was audited and verified.`,
        type: 'SYSTEM',
        actionLink: 'contributions',
      });
    }
    const duration = Math.round(performance.now() - startTime + 54);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/contributions/${id}/verify`,
      controller: 'com.alumniconnect.controller.AdminContributionController',
      javaMethod: 'public ResponseEntity<ApiResponse> verifyContribution(@PathVariable String id)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: { success: true, contributionId: id, status: 'VERIFIED', auditTimestamp: new Date().toISOString() },
      sqlQuery: `UPDATE contributions SET status='VERIFIED', verified_by='DeanSwaminathan', verified_at=NOW() WHERE id='${id}';`,
    });
  }

  /**
   * CONTRIBUTION TRACKING: Update Contribution Status
   * Endpoint: PUT /api/admin/contributions/{id}/status
   */
  public async updateContributionStatus(id: string, status: 'VERIFIED' | 'PLEDGED' | 'COMPLETED' | 'PENDING'): Promise<void> {
    const startTime = performance.now();
    StorageService.updateContributionStatus(id, status);
    const duration = Math.round(performance.now() - startTime + 46);

    StudentApiService.recordCustomLog({
      method: 'PUT',
      endpoint: `/api/admin/contributions/${id}/status`,
      controller: 'com.alumniconnect.controller.AdminContributionController',
      javaMethod: 'public ResponseEntity<ApiResponse> updateContributionStatus(@PathVariable String id, @RequestParam ContributionStatus status)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { id, status },
      responsePayload: { success: true, contributionId: id, status },
      sqlQuery: `UPDATE contributions SET status='${status}', updated_at=NOW() WHERE id='${id}';`,
    });
  }

  /**
   * CONTRIBUTION TRACKING: Generate Official 80G Tax Exemption Receipt
   * Endpoint: POST /api/admin/contributions/{id}/receipt
   */
  public async generateReceipt(id: string): Promise<{ receiptNumber: string; downloadUrl: string }> {
    const startTime = performance.now();
    const contrib = StorageService.getContributions().find((c) => c.id === id);
    const receiptNumber = `NITE-80G-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const duration = Math.round(performance.now() - startTime + 68);

    StudentApiService.recordCustomLog({
      method: 'POST',
      endpoint: `/api/admin/contributions/${id}/receipt`,
      controller: 'com.alumniconnect.controller.AdminContributionController',
      javaMethod: 'public ResponseEntity<TaxReceiptDTO> generate80GReceipt(@PathVariable String id)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      requestPayload: { contributionId: id },
      responsePayload: {
        success: true,
        receiptNumber,
        alumniName: contrib?.alumniName,
        amount: contrib?.amount,
        panUniversity: 'AAATN4582E',
        taxExemptionCode: '80G(5)(vi) of IT Act 1961',
        message: 'Cryptographically sealed institutional certificate generated.',
      },
      sqlQuery: `INSERT INTO donation_receipts (receipt_no, contribution_id, issue_date, status) VALUES ('${receiptNumber}', '${id}', NOW(), 'ISSUED');`,
    });

    return {
      receiptNumber,
      downloadUrl: `#receipt-${receiptNumber}`,
    };
  }

  /**
   * 7. ANALYTICS & REPORTS: Generate NAAC Criteria 5.4 Report
   * Controller: com.alumniconnect.controller.AccreditationReportController
   * Endpoint: GET /api/admin/reports/naac-criteria-5
   */
  public async generateNAACReport(): Promise<any> {
    const startTime = performance.now();
    const users = StorageService.getUsers();
    const contributions = StorageService.getContributions();
    const mentorships = StorageService.getMentorshipRequests();
    const events = StorageService.getEvents();
    const duration = Math.round(performance.now() - startTime + 85);

    const reportData = {
      criterion: '5.4 - Alumni Engagement (NAAC Manual for Universities)',
      institution: 'National Institute of Technology & Engineering',
      academicYear: '2025-2026',
      totalRegisteredAlumni: users.filter((u) => u.role === 'ALUMNI').length,
      activeMentors: users.filter((u) => u.role === 'ALUMNI' && u.isAvailableForMentoring).length,
      totalAlumniFinancialContributionINR: contributions.reduce((sum, c) => sum + (c.amount || 0), 0),
      totalMentorshipHoursLogged: mentorships.filter((m) => m.status === 'COMPLETED' || m.status === 'ACCEPTED').length * 15,
      alumniLedSeminarsAndWorkshops: events.filter((e) => e.type === 'Guest Lecture' || e.type === 'Workshop').length,
      complianceScore: 'A++ (3.82 / 4.00)',
      generatedAt: new Date().toISOString(),
    };

    StudentApiService.recordCustomLog({
      method: 'GET',
      endpoint: '/api/admin/reports/naac-criteria-5',
      controller: 'com.alumniconnect.controller.AccreditationReportController',
      javaMethod: 'public ResponseEntity<NAACReportDTO> getCriteria5Report(@RequestParam(defaultValue="2025-26") String academicYear)',
      status: 200,
      statusText: 'OK',
      durationMs: duration,
      responsePayload: reportData,
      sqlQuery: `SELECT COUNT(*) AS total_alumni, SUM(c.amount) AS total_donation, COUNT(m.id) AS mentorship_count FROM users u LEFT JOIN contributions c ON u.id = c.alumni_id LEFT JOIN mentorship_requests m ON u.id = m.mentor_id WHERE u.role='ALUMNI';`,
    });

    return reportData;
  }
}

export const AdminApiService = new AdminApiServiceImpl();
