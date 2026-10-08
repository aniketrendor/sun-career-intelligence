Build a production-ready web application called “Career Intelligence ERP”.

The application is an institutional career intelligence and student development platform. Its purpose is to help educational institutions assess students through structured psychometric, behavioral, aptitude, interest, work-preference, and career-simulation assessments, identify suitable career domains, identify skill gaps, recommend career roles and learning paths, and allow counselors and institutional leadership to manage students and career development programs.

Do not build this as a simple quiz website. Build it as a modular ERP-style SaaS application with role-based access control, database-driven workflows, analytics, assessment scoring, referral-based enrollment, counselor intervention, and institutional dashboards.

Use a clean, professional, modern enterprise UI. The system should feel suitable for a university or business school.

TECHNOLOGY STACK

Use this stack unless there is a strong technical reason to change it:

Frontend:
Next.js with App Router
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
Lucide icons
Recharts for charts

Backend:
Next.js server actions and/or API routes
Supabase PostgreSQL
Supabase Auth
Supabase Row Level Security
Supabase Storage where required

Authentication:
Google OAuth
Email + Password
Email verification
Forgot password
Secure session handling

Database:
PostgreSQL through Supabase

Deployment target:
Vercel

Code quality:
TypeScript strict mode
Reusable components
Service-layer architecture
Schema validation
Error handling
Loading states
Empty states
Responsive layouts
Accessible UI
Secure authorization

GENERAL PRODUCT PRINCIPLE

Authentication and authorization must be separate.

Authentication answers:
Who is this user?

Authorization answers:
What is this user allowed to access or modify?

There are exactly three application roles:

1. STUDENT
2. COUNSELOR
3. DEAN_HOD

Do not allow the frontend alone to enforce permissions. All important permissions must also be protected at the database/API level.

GLOBAL AUTHENTICATION

Create one common authentication system for all users.

Login page:

Career Intelligence ERP

Continue with Google

OR

Email
Password

Login

Forgot Password
Create Account

Use Google OAuth and email/password through Supabase Auth.

After login, determine the application role from the users/profile data and redirect accordingly.

Routes:

/student/dashboard
/counselor/dashboard
/dean/dashboard

Do not create separate authentication databases for each role.

USER ACCOUNT MODEL

Create a users table or equivalent application profile structure with:

id
auth_user_id
full_name
email
phone
avatar_url
role
status
created_at
updated_at
last_login_at

Role values:

STUDENT
COUNSELOR
DEAN_HOD

Status values:

ACTIVE
PENDING
SUSPENDED
INACTIVE

Do not let normal users change their own role.

STUDENT REGISTRATION FLOW

Students can register with Google or email/password.

After authentication, show a student onboarding flow.

Step 1:
Basic profile

Full Name
PRN / Student ID
Mobile Number
Gender, optional
Date of Birth, optional
Institution
School / Department
Current Program
Current Semester
Academic Year

Step 2:
Referral code

The student must enter a valid referral code.

Do not allow the student to manually choose a program/class if a valid referral code is required.

Referral code should determine:

Institution
School/Department
Program
Class
Academic Year

After entering the code, provide a Verify Referral Code button.

If valid, show:

Referral Verified
Institution
School
Program
Class
Academic Year
Code expiry
Remaining capacity, when applicable

Then show:

Join Program

After confirmation, enroll the student automatically into the program and class associated with the referral code.

If the code is expired, disabled, invalid, or has reached its usage limit, prevent enrollment and show a clear error.

STUDENT REFERRAL RULE

The student should not be able to manipulate the program/class IDs from the browser.

The backend must derive the program and class from the verified referral code.

DEAN/HOD REGISTRATION

Dean/HOD users can sign up using Google or email.

However, Dean/HOD registration must not immediately grant administrative access.

Flow:

Registration
→ Role request = DEAN_HOD
→ Account status = PENDING
→ Counselor reviews request
→ Counselor approves or rejects
→ Approved account becomes ACTIVE
→ User gains Dean/HOD dashboard access

While pending, the user should only see a pending approval page.

Dean/HOD registration information:

Full Name
Email
Phone
Institution
School/Department
Designation
Employee ID, optional
Requested Role
Program/Department association

COUNSELOR ACCESS

Counselors use the same Google/email login system.

Counselor accounts should be provisioned/activated by an existing authorized counselor or an initial bootstrap mechanism.

Do not allow random visitors to self-register as an active counselor.

Counselor permissions include:

Dean/HOD approval
Dean/HOD assignment
Student management
Student assignment
Career assessment oversight
Counseling management
Career intervention
Institutional analytics
Assessment management, depending on permission
System activity monitoring

ROLE HIERARCHY

Implement this institutional relationship:

COUNSELOR
↓
Approves / manages
↓
DEAN/HOD
↓
Creates
↓
PROGRAMS
↓
CLASSES
↓
REFERRAL CODES
↓
STUDENTS
↓
ASSESSMENTS
↓
CAREER RESULTS
↓
COUNSELING / DEVELOPMENT

COUNSELOR DASHBOARD

Create a professional dashboard for counselors.

Overview cards:

Total Students
Active Students
Pending Dean/HOD Approvals
Assessment Completion Rate
Students Requiring Counseling
Active Programs
Active Classes

Sections:

Pending Approvals
Students Requiring Intervention
Recently Assigned Students
Assessment Activity
Career Domain Distribution
Skill Gap Distribution
Recent System Activity

COUNSELOR MODULES

1. Dean/HOD Management

List Dean/HOD users.

Columns:

Name
Email
Institution
Department
Requested Role
Status
Registered Date
Actions

Actions:

View
Approve
Reject
Suspend
Activate
Assign Department
Assign Institution

2. Student Management

Counselors can search/filter students.

Filters:

Institution
School
Program
Class
Semester
Assessment status
Career domain
Counseling status

Student details should include:

Profile
Academic information
Assessment history
Psychometric profile
Aptitude results
Career domains
Skill gaps
Recommended roles
Career roadmap
Counseling records
Action plans
Activity history

3. Counselor Assignment

Allow counselors to assign students to counselors when the institution has multiple counselors.

Create:

student_counselor_assignments

Fields:

id
student_id
counselor_id
assigned_at
assigned_by
status
notes

4. Counseling Management

Counselor should be able to create counseling records.

Fields:

student_id
counselor_id
session_date
discussion_summary
identified_concerns
recommended_actions
follow_up_date
status

Statuses:

OPEN
FOLLOW_UP
RESOLVED

DEAN/HOD DASHBOARD

Dean/HOD should see information limited to their institution, school, department, programs, and classes.

Dashboard cards:

Total Students
Active Programs
Active Classes
Referral Codes
Assessment Completion
Average Career Readiness
Students Requiring Counseling

Charts:

Career Domain Distribution
Program-wise Student Count
Class-wise Student Count
Assessment Completion
Skill Gap Distribution
Semester Distribution

DEAN/HOD MODULES

1. Program Management

Dean/HOD can create programs.

Program fields:

Program Name
Program Code
Description
Institution
School/Department
Academic Year
Duration
Status

Example:

MBA Business Analytics
MBA-BA
2026-27

2. Class Management

Classes belong to programs.

Class fields:

Class Name
Class Code
Program
Semester
Division
Academic Year
Faculty/Coordinator
Student Capacity
Status

Example:

MBA-BA Sem 3 A
MBA3A

3. Referral Code Management

Dean/HOD can create referral codes for programs and classes.

Referral code object:

id
code
program_id
class_id
created_by
created_at
expires_at
max_uses
usage_count
status

Status:

ACTIVE
DISABLED
EXPIRED
FULL

Capabilities:

Generate Code
Copy Code
View Code
Disable Code
Enable Code
Set Expiry
Set Usage Limit
Regenerate

Generate unique codes automatically.

Prefer secure random codes.

Example:

MBA3A-7XK92

Do not rely on readable predictable IDs as the only security control.

Referral code validation must occur server-side.

4. Student Enrollment View

Dean/HOD should see:

Student
PRN
Program
Class
Enrollment date
Referral code
Assessment status
Career domain
Counseling status

STUDENT DASHBOARD

After enrollment, students see:

Welcome card
Program
Class
Academic year
Assessment progress
Career profile status
Top career domains
Skill gaps
Recommended roles
Career roadmap
Upcoming counseling/follow-up
Recent assessment activity

Main student navigation:

Dashboard
My Profile
Career Assessment
My Career Profile
Career Domains
Career Roles
Skill Gap
Learning Roadmap
Career Simulations
Counseling
Reports
Settings

STUDENT PROFILE

Profile page:

Personal Information
Academic Information
Program/Class
Skills
Certifications
Projects
Interests
Career Goals

Allow the student to update permitted profile fields.

Do not allow changing institution/program/class directly after enrollment without an approved workflow.

CAREER ASSESSMENT ENGINE

The assessment system is the core product.

Do not hard-code questions directly into frontend components.

Create a database-driven assessment framework.

Assessment entities:

assessment_templates
assessment_versions
sections
questions
question_options
traits
domains
domain_trait_weights
responses
assessment_attempts
trait_scores
domain_scores

ASSESSMENT TYPES

Create support for:

1. Interest Assessment
2. Behavioral Assessment
3. Work Preference Assessment
4. Psychometric Assessment
5. Aptitude Assessment
6. Business Reasoning
7. Logical Reasoning
8. Numerical Reasoning
9. Data Interpretation
10. Career Simulation

Start the MVP with:

Psychometric + Interest + Behavioral + Work Preference

Design architecture so aptitude and simulations can be added later.

PSYCHOMETRIC MATRIX

Create a trait library.

Initial traits:

Analytical Thinking
Quantitative Thinking
Problem Solving
Creativity
Communication
Leadership
Persuasion
People Orientation
Technology Orientation
Planning
Risk Orientation
Attention to Detail
Business Thinking
Adaptability
Structured Thinking

Each question should be linked to one or more traits through configurable weights.

QUESTION MODEL

Question fields:

id
section_id
question_text
question_type
difficulty
trait_id or mapping
weight
order_index
is_required
status

Support question types:

SINGLE_CHOICE
MULTIPLE_CHOICE
LIKERT_SCALE
SCENARIO
NUMERICAL
TEXT
TRUE_FALSE

For the psychometric MVP, include Likert questions.

Example:

“When solving a business problem, I prefer to examine data before forming a conclusion.”

Scale:

1 = Strongly Disagree
2 = Disagree
3 = Neutral
4 = Agree
5 = Strongly Agree

TRAIT SCORING

Do not use random scoring.

Each response should contribute to the mapped trait(s).

Example:

Question response = 5

Question weight = 1.0

Trait weight = 0.8

Trait contribution = response × question_weight × trait_weight

Normalize trait scores to 0–100.

Handle reverse-scored questions.

For reverse-scored Likert questions:

normalized response = max_scale + 1 - response

Store scoring logic in reusable services.

CAREER DOMAIN LIBRARY

Create initial career domains:

Data Analytics
Business Intelligence
Finance
Marketing
Human Resources
Operations
Product Management
Strategy & Consulting
Entrepreneurship
Technology
Risk Analytics
Research

Do not claim that the system guarantees a specific career.

Present results as career-domain alignment.

CAREER DOMAIN MAPPING

Each career domain should have configurable weights for traits.

Example:

Data Analytics:
Analytical Thinking: High
Quantitative Thinking: High
Problem Solving: High
Technology Orientation: High
Attention to Detail: High
Communication: Medium

Marketing:
Creativity: High
Communication: High
Persuasion: High
People Orientation: High
Business Thinking: High

Finance:
Quantitative Thinking: High
Analytical Thinking: High
Attention to Detail: High
Risk Orientation: Medium
Business Thinking: High

Product Management:
Problem Solving: High
Communication: High
Business Thinking: High
Leadership: Medium
Technology Orientation: Medium

Do not hard-code the final weights. Store them in the database.

DOMAIN SCORE

Implement a scoring engine such as:

domain_score =
sum(trait_score × domain_trait_weight)

Normalize to 0–100.

Show:

Primary Domain Alignment
Secondary Domain Alignment
Additional Relevant Domains

Do not display the output as a deterministic career decision.

Use language such as:

“Strong alignment”
“Moderate alignment”
“Emerging alignment”
“Explore further”

Avoid statements such as:

“You must become a Data Analyst.”

CAREER RESULT PAGE

Create a polished report-style student career result page.

Sections:

Career Profile
Top Career Domains
Why These Domains Match
Strongest Traits
Development Areas
Recommended Roles
Skill Gaps
Recommended Learning
Career Roadmap
Suggested Simulations
Counselor Notes, when authorized

Example:

Primary Domain:
Data Analytics

Evidence:

High analytical reasoning
Strong quantitative preference
Strong structured problem-solving
High attention to detail

Development areas:

Business storytelling
Communication
Advanced statistics

Recommended roles:

Data Analyst
Business Analyst
BI Analyst
Operations Analyst
Marketing Analyst

CAREER PROFILE

Generate a profile such as:

Analytical Business Problem Solver

This is a descriptive profile based on assessment results.

The system should derive this from the student's strongest trait combinations using configurable labels.

Do not use medical or clinical personality diagnoses.

SKILL GAP ENGINE

Create:

skills
role_skills
student_skills
skill_gap_results

Each career role should have associated skills.

Example Business Analyst:

Excel
SQL
Power BI
Statistics
Business Communication
Requirements Analysis
Problem Solving
Data Visualization

Compare student skill levels against role requirements.

Display:

Current Level
Target Level
Gap
Recommended Learning

SKILL SCALE

Use:

0 = Not Assessed
1 = Beginner
2 = Elementary
3 = Intermediate
4 = Advanced
5 = Expert

Convert to percentages for visualizations where appropriate.

CAREER ROLE LIBRARY

Create role mapping.

Data Analytics:

Data Analyst
Business Analyst
BI Analyst
Operations Analyst
Marketing Analyst

Finance:

Financial Analyst
Risk Analyst
FP&A Analyst
Investment Analyst

Marketing:

Marketing Analyst
Digital Marketing Analyst
Market Research Analyst
Brand Analyst

Product:

Product Analyst
Associate Product Manager
Product Operations Analyst

Consulting:

Business Analyst
Strategy Analyst
Consulting Analyst

Store these in the database so future administrators can modify them.

LEARNING ROADMAP

After the skill-gap analysis, create a structured learning roadmap.

Example:

Target Role:
Business Analyst

Phase 1:
Excel
Statistics

Phase 2:
SQL
Power BI

Phase 3:
Business Case Analysis

Phase 4:
Portfolio Project

Phase 5:
Interview Preparation

Allow roadmap items to have:

title
description
skill
priority
estimated_days
resource_url
status

Statuses:

NOT_STARTED
IN_PROGRESS
COMPLETED

CAREER SIMULATION MODULE

Architect this as a future-ready module even if the first version contains only a basic implementation.

Simulation categories:

Data Analytics
Marketing
Finance
HR
Operations
Product
Consulting

A simulation can contain:

scenario
business_context
task
data
questions
expected_reasoning
scoring_rules

Record:

simulation_attempts
simulation_scores

Eventually incorporate simulation performance into the student's career profile.

REPORT GENERATION

Create a downloadable career report.

Include:

Student information
Institution/program/class
Assessment date
Assessment summary
Trait scores
Career-domain alignment
Recommended roles
Skill gaps
Learning roadmap
Counselor recommendations

Do not expose internal scoring weights unnecessarily to the student.

The report should look professional and suitable for academic counseling.

ANALYTICS

Implement charts using Recharts.

Student analytics:

Trait profile
Domain profile
Skill gaps
Roadmap progress

Counselor analytics:

Students by domain
Students requiring counseling
Assessment completion
Skill gaps
Program-level distribution

Dean/HOD analytics:

Students by program
Students by class
Career domain distribution
Assessment completion
Skill-gap trends
Counseling status
Referral code usage

INSTITUTION DATA ISOLATION

Dean/HOD must only access authorized institution/program/class information.

Counselors can access their authorized student population.

Students can access their own records.

Implement Supabase Row Level Security wherever appropriate.

Never trust client-side role values.

AUDIT LOGGING

Create an audit_logs table.

Track important events:

Login
Logout
Role approval
Role rejection
Program creation
Class creation
Referral code creation
Referral code disabled
Student enrollment
Assessment started
Assessment completed
Career result generated
Counselor assignment
Counseling record created
Profile changes

Fields:

id
actor_user_id
action
entity_type
entity_id
metadata
created_at

Do not store sensitive passwords or authentication secrets in audit logs.

NOTIFICATIONS

Create an internal notification framework.

Notifications for:

Dean/HOD approval
Dean/HOD rejection
Student enrollment
Assessment completion
Counselor assignment
Counseling follow-up
Referral code expiration
Program/class updates

Start with in-app notifications.

Design architecture so email notifications can be added later.

SEARCH AND FILTERING

All major ERP tables should support:

Search
Filtering
Sorting
Pagination

Student search:

Name
Email
PRN
Program
Class
Domain
Assessment status

Referral search:

Code
Program
Class
Status

PROGRAM MANAGEMENT

Provide:

Create
Edit
View
Activate
Deactivate

Prevent deletion where records are already associated with students. Prefer soft deletion or deactivation.

CLASS MANAGEMENT

Same principle.

Do not physically delete classes containing enrollment records.

SECURITY

Implement:

Supabase Auth
Row Level Security
Server-side authorization
Input validation with Zod
Rate limiting where practical
CSRF-safe patterns where relevant
Secure environment variables
No secrets in frontend source
No hard-coded admin credentials
No service-role key exposed in browser
Sanitize user-generated content
Audit logging

Do not expose assessment answer keys to the client before submission.

Do not expose hidden scoring weights through public APIs unnecessarily.

ASSESSMENT INTEGRITY

Implement:

One active attempt at a time
Assessment start timestamp
Assessment completion timestamp
Submission locking after completion
Optional time limits
Resume capability where appropriate
Prevent duplicate completed attempts unless a retake is explicitly allowed
Assessment versioning

Assessment results should be linked to the assessment version used.

ASSESSMENT VERSIONING

This is mandatory.

When questions or scoring change, create a new assessment version instead of modifying old results.

Example:

Career Assessment v1.0
Career Assessment v1.1

Old student results must remain reproducible.

SEED DATA

Create development seed data.

Include:

1 counselor
3 Dean/HOD users in pending/active states
10 students
3 programs
5 classes
10 referral codes
15 traits
12 career domains
20+ career roles
30+ skills
Sample assessment sections
Sample questions
Sample trait mappings
Sample domain mappings

Clearly mark seeded accounts as development accounts.

DO NOT use real people's credentials.

UI DESIGN

Use a clean enterprise design.

Style direction:

Professional
Minimal
Modern
Academic
Data-oriented

Use:

Cards
Tabs
Tables
Charts
Progress bars
Badges
Dialogs
Drawers
Breadcrumbs
Command search
Responsive sidebar

Avoid:

Excessive gradients
Overly decorative UI
Gaming-style design
Huge empty spaces
Unreadable charts
Excessive animations

Color usage should be restrained and consistent.

Use accessible contrast.

RESPONSIVE DESIGN

The system must work on:

Desktop
Laptop
Tablet
Mobile

The core ERP dashboards should prioritize desktop but remain usable on smaller screens.

GLOBAL LAYOUT

Desktop:

Sidebar
Top navigation
Breadcrumb
Main content
Notifications
Profile menu

Mobile:

Collapsible navigation
Responsive cards
Horizontal-scroll tables where needed
Mobile-friendly assessment questions

STUDENT ASSESSMENT UX

The assessment interface should feel focused and distraction-free.

Show:

Assessment title
Section
Question number
Progress
Question
Answer options
Previous
Next
Save/Continue
Submit

Example:

Question 17 of 60

Progress 28%

“When working on a difficult business problem, I prefer...”

[Strongly Disagree]
[Disagree]
[Neutral]
[Agree]
[Strongly Agree]

Do not let accidental navigation destroy answers.

CAREER DOMAIN VISUALIZATION

Use horizontal bars or radial/radar visualizations.

Example:

Data Analytics       86
Strategy              81
Finance               74
Product               72
Operations            65

Also show the underlying trait explanation.

Do not represent the score as scientific certainty.

ERROR HANDLING

Every important operation needs:

Loading state
Success state
Failure state
Empty state

Use meaningful messages.

Examples:

“Referral code has expired.”
“Referral code has reached its maximum enrollment limit.”
“You do not have permission to access this program.”
“Assessment submission failed. Your answers are still saved.”

DATABASE SCHEMA

Create migrations for at least these tables or equivalent normalized entities:

users
student_profiles
counselor_profiles
dean_hod_profiles
institutions
departments
programs
classes
enrollments
referral_codes
student_counselor_assignments
assessment_templates
assessment_versions
assessment_sections
questions
question_options
traits
question_trait_weights
career_domains
domain_trait_weights
career_roles
role_skills
student_skills
assessment_attempts
assessment_responses
trait_scores
domain_scores
career_profiles
skill_gap_results
learning_roadmaps
roadmap_items
career_simulations
simulation_attempts
counseling_sessions
notifications
audit_logs

Use foreign keys.

Add indexes for frequently queried fields.

Use created_at and updated_at consistently.

Use UUIDs for primary keys where appropriate.

Do not use business-readable referral codes as primary keys.

ENROLLMENT DATA MODEL

A student should be enrolled through a relationship table rather than storing program/class only inside the user record.

Use:

enrollments

Fields:

id
student_id
program_id
class_id
referral_code_id
academic_year
status
enrolled_at
created_at

This supports future multiple-program participation.

REFERRAL VALIDATION LOGIC

When a student submits a referral code:

1. Find the active referral code.
2. Verify expiry.
3. Verify usage limit.
4. Verify code status.
5. Retrieve program and class.
6. Verify program and class are active.
7. Create enrollment.
8. Increment usage safely.
9. Log the enrollment.
10. Notify authorized parties when required.

Use a transaction or equivalent safe database operation to prevent race conditions.

PERMISSION MATRIX

Student:

Can edit own profile
Can view own enrollment
Can take assigned assessments
Can view own assessment results
Can view own career profile
Can view own skill gaps
Can view own roadmap
Can view own counseling information allowed to students
Cannot access other students
Cannot create programs
Cannot create classes
Cannot create referral codes
Cannot approve Dean/HOD
Cannot change role

Counselor:

Can manage assigned institutions where authorized
Can approve/reject Dean/HOD
Can assign Dean/HOD
Can view authorized students
Can assign counselors
Can view assessment results
Can create counseling records
Can monitor interventions
Can access analytics
Can manage assessment configuration if granted
Cannot impersonate users
Cannot change their own role

Dean/HOD:

Can manage authorized institution/program structures
Can create programs
Can create classes
Can create referral codes
Can view enrolled students within authorized scope
Can view institutional analytics
Cannot approve themselves
Cannot approve another user as counselor
Cannot change their role

ROUTING PROTECTION

Implement protected route middleware.

Example logic:

if unauthenticated:
redirect to /login

if authenticated and role = STUDENT:
allow /student/*

if role = COUNSELOR:
allow /counselor/*

if role = DEAN_HOD:
allow /dean/*

If a user manually enters another role's URL, return unauthorized or redirect to the correct dashboard.

ADMIN BOOTSTRAP

Since there are only three application roles, implement a secure initial counselor bootstrap process.

Do not hard-code a password in source code.

Use environment configuration or a protected initialization script to designate the initial counselor account.

After initialization, the counselor manages further authorized access.

DEVELOPMENT EXPERIENCE

First inspect the repository.

Do not overwrite existing work blindly.

Before implementation:

1. Understand current project structure.
2. Identify existing components.
3. Reuse existing infrastructure where appropriate.
4. Create a clear architecture.
5. Create database migrations.
6. Create seed data.
7. Implement authentication.
8. Implement RBAC.
9. Implement institutional hierarchy.
10. Implement referral enrollment.
11. Implement assessment engine.
12. Implement scoring.
13. Implement career profile.
14. Implement dashboards.
15. Implement reporting.
16. Add tests.
17. Run lint/build/test.
18. Fix all blocking errors.

Use reusable components instead of duplicating UI.

Create services such as:

authService
userService
programService
classService
referralService
enrollmentService
assessmentService
scoringService
careerService
skillGapService
counselingService
notificationService
auditService

Do not put all business logic inside page components.

API DESIGN

Use clear API/server-action boundaries.

Example endpoints or server actions:

auth/profile
dean-hod/approve
dean-hod/reject
program/create
program/update
class/create
class/update
referral/create
referral/verify
enrollment/create
student/profile
assessment/start
assessment/save-response
assessment/submit
assessment/result
career/profile
skill-gap/analyze
roadmap/update
counseling/create
analytics/institution

Use Zod validation for all external input.

TESTING

Create tests for critical business logic.

At minimum:

Referral code validation
Referral expiry
Referral usage limit
Duplicate enrollment prevention
Role authorization
Assessment scoring
Reverse scoring
Domain calculation
Skill gap calculation
Dean/HOD approval
Student access isolation
Counselor access isolation

Add integration tests for the main workflow:

Dean/HOD creation
→ Counselor approval
→ Dean/HOD login
→ Program creation
→ Class creation
→ Referral creation
→ Student registration
→ Referral verification
→ Enrollment
→ Assessment
→ Career result

SEED USER WORKFLOW

Make it easy to demonstrate the application.

Demo flow:

1. Counselor logs in.
2. Counselor approves a pending Dean/HOD.
3. Dean/HOD logs in.
4. Dean/HOD creates a program.
5. Dean/HOD creates a class.
6. Dean/HOD generates a referral code.
7. Student signs up with Google/email.
8. Student enters referral code.
9. Student is automatically assigned to program/class.
10. Student completes assessment.
11. System calculates trait scores.
12. System calculates career-domain alignment.
13. System generates career profile.
14. System calculates skill gaps.
15. Student sees roadmap.
16. Counselor views student result.
17. Dean/HOD sees aggregated analytics.

IMPORTANT PRODUCT RULES

Do not build a fake AI demo.

Do not hard-code career recommendations.

Do not hard-code program/class assignment.

Do not allow client-side role spoofing.

Do not put database service credentials in browser code.

Do not make the psychometric assessment appear to diagnose a psychological condition.

Do not claim scientific validity unless validation data exists.

Use configurable database-driven mappings.

Keep assessment versions immutable after results are generated.

Keep the architecture extensible.

AI LAYER

Design an AI service abstraction but do not make AI responsible for the fundamental score calculation.

Core score calculation must be deterministic.

AI may be used later for:

Career report explanation
Personalized learning plans
Counselor summaries
Student Q&A
Simulation generation
Natural-language interpretation

The AI must receive structured assessment results as input.

Do not ask the LLM to independently determine career scores.

FUTURE FEATURES TO KEEP ARCHITECTURE READY FOR

Attendance integration
Placement readiness
Resume analysis
Mock interviews
Internship tracking
Certification tracking
Portfolio tracking
Faculty dashboard
Parent/guardian access
Institution benchmarking
Multi-institution support
Email notifications
WhatsApp notifications
Advanced AI career assistant
Career simulation engine
Job-role recommendation
Skill recommendation based on live job-market data

MVP PRIORITY

Build the product in this order:

PHASE 1
Authentication
Google login
Email login
Role handling
Protected routes

PHASE 2
Institution
Department
Program
Class
Dean/HOD approval
Counselor management

PHASE 3
Referral code system
Referral verification
Student enrollment

PHASE 4
Student profile
Assessment framework
Question bank
Traits
Psychometric matrix

PHASE 5
Scoring engine
Trait scores
Career-domain mapping
Career profile

PHASE 6
Skill-gap analysis
Career roles
Learning roadmap

PHASE 7
Student dashboard
Counselor dashboard
Dean/HOD dashboard

PHASE 8
Counseling
Notifications
Audit logs
Reports

PHASE 9
Career simulations
Aptitude tests
AI explanation layer

DEFINITION OF DONE

The project is considered complete only when:

A new student can register using Google or email.

A Dean/HOD can request access but remains pending until approved by a counselor.

A counselor can approve the Dean/HOD.

An approved Dean/HOD can create programs.

A Dean/HOD can create classes under programs.

A Dean/HOD can generate referral codes.

A student can enter a referral code.

The system validates the code securely.

The student is automatically enrolled into the correct program and class.

The student can complete the career assessment.

Responses are stored securely.

Trait scores are calculated deterministically.

Career-domain alignment is calculated from configurable mappings.

Career roles are recommended from structured data.

Skill gaps are calculated.

A learning roadmap is generated.

The student can view their career profile.

A counselor can view authorized students and counseling information.

The Dean/HOD can view authorized institutional analytics.

Unauthorized users cannot access protected data.

Database RLS policies work.

Critical workflows are tested.

There are no TypeScript, build, or blocking runtime errors.

The UI is responsive and professional.

FINAL IMPLEMENTATION INSTRUCTION

Do not stop after creating the UI.

Build the actual working application, database schema, authentication, permissions, business logic, seed data, dashboards, scoring engine, and main workflows.

When there are multiple implementation choices, favor maintainability, security, modularity, and scalability.

Keep the first version functional end-to-end before adding decorative features.

At the end, provide:

1. Project architecture
2. Database schema summary
3. Environment variables required
4. Authentication setup steps
5. Supabase setup steps
6. Seed/demo accounts
7. Main routes
8. Implemented features
9. Test results
10. Remaining limitations

Do not claim a feature is implemented unless it works end-to-end.
