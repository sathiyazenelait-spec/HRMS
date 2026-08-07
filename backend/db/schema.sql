-- Create database if not exists
CREATE DATABASE IF NOT EXISTS zenelait_hrms;
USE zenelait_hrms;


-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    org_type VARCHAR(50) NOT NULL, -- IT, MARKETING, SALES, CORPORATE, MANUFACTURING
    org_code VARCHAR(50) NOT NULL UNIQUE, -- e.g. HRMS202612345
    owner_gmail VARCHAR(255) NOT NULL,
    owner_mobile VARCHAR(20) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- STANDARD, MIDLEVEL, ENTERPRISE
    otp_code VARCHAR(10) NOT NULL,
    attendance_mode VARCHAR(50),
    work_mode VARCHAR(50),
    modules_active VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    gmail VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPERADMIN, ADMIN, EMPLOYEE
    organization_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- Seed Initial Superadmin (password is stored directly for demonstration or hashed if BCrypt is used)
-- For demonstration and matching user requested credentials: username='superadmin', password='superadmin123'
INSERT INTO users (username, gmail, mobile, password, role, organization_id)
SELECT 'superadmin', 'superadmin@zenelait.com', '1234567890', 'superadmin123', 'SUPERADMIN', NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'superadmin');

INSERT INTO organizations (id, name, org_type, org_code, owner_gmail, owner_mobile, plan_type, otp_code, attendance_mode, work_mode, modules_active)
VALUES 
(1, 'Initech', 'IT', 'HRMS202611111', 'initech.owner@gmail.com', '9876543210', 'STANDARD', '123456', 'CLOCK_IN_OUT', 'TASK_BASED', 'ATTENDANCE,PAYROLL,SPRINTS,TICKETS'),
(2, 'AdVenture Inc', 'MARKETING', 'HRMS202622222', 'adventure.owner@gmail.com', '9876543211', 'MIDLEVEL', '654321', 'CLOCK_IN_OUT', 'TASK_BASED', 'ATTENDANCE,PAYROLL,SPRINTS,TICKETS'),
(3, 'ACme temp', 'IT', 'HRMS202633333', 'acme.owner@gmail.com', '9876543212', 'ENTERPRISE', '999999', 'CLOCK_IN_OUT', 'SPRINT_BASED', 'ATTENDANCE,PAYROLL,SPRINTS,TICKETS')
ON DUPLICATE KEY UPDATE name = name;

-- Seed Sample HR Users & Employees
INSERT INTO users (username, gmail, mobile, password, role, organization_id)
VALUES
('initech_hr', 'hr@initech.com', '9998887776', 'hr123', 'ADMIN', 1),
('adventure_hr', 'hr@adventure.com', '9998887777', 'hr123', 'ADMIN', 2),
('acme_hr', 'hr@acme.com', '9998887778', 'hr123', 'ADMIN', 3),
('baluacme', 'baluacme@gmail.com', '8976876542', 'password123', 'EMPLOYEE', 3),
('bobjohnson', 'bob.johnson@yahoo.com', '8978987650', 'password123', 'EMPLOYEE', 3),
('alicesmith', 'alice.smith@gmail.com', '8978987651', 'password123', 'EMPLOYEE', 3),
('charliebrown', 'charlie.b@gmail.com', '8978987652', 'password123', 'EMPLOYEE', 3),
('dianaprince', 'diana.p@amazon.com', '8978987653', 'password123', 'EMPLOYEE', 3),
('evanwright', 'evan.w@gmail.com', '8978987654', 'password123', 'EMPLOYEE', 3)
ON DUPLICATE KEY UPDATE username = username;

-- Job Requisitions Table
CREATE TABLE IF NOT EXISTS job_requisitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Open',
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    stage VARCHAR(50) NOT NULL DEFAULT 'Applied',
    job_requisition_id BIGINT NOT NULL,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_requisition_id) REFERENCES job_requisitions(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Job Requisitions
INSERT INTO job_requisitions (id, title, department, status, organization_id)
VALUES
(1, 'Senior Java Developer', 'Engineering', 'Open', 3),
(2, 'Frontend React Engineer', 'Engineering', 'Open', 3),
(3, 'HR Coordinator', 'Human Resources', 'Open', 3),
(4, 'DevOps Architect', 'Engineering', 'Open', 1)
ON DUPLICATE KEY UPDATE title = title;

-- Seed Candidates
INSERT INTO candidates (id, name, email, stage, job_requisition_id, organization_id)
VALUES
(1, 'Alice Smith', 'alice.smith@gmail.com', 'Applied', 1, 3),
(2, 'Bob Johnson', 'bob.johnson@yahoo.com', 'Screening', 1, 3),
(3, 'Charlie Brown', 'charlie.b@gmail.com', 'Interview', 2, 3),
(4, 'Diana Prince', 'diana.p@amazon.com', 'Offered', 2, 3),
(5, 'Evan Wright', 'evan.w@gmail.com', 'Hired', 3, 3),
(6, 'Fiona Gallagher', 'fiona.g@outlook.com', 'Rejected', 1, 3),
(7, 'George Costanza', 'george@vandelay.com', 'Interview', 4, 1)
ON DUPLICATE KEY UPDATE name = name;

-- Onboarding Tasks Table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- DOCUMENTS, PROVISIONING, ASSETS, PAYROLL, TEAM, WELCOME
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Onboarding Checklists
INSERT INTO onboarding_tasks (id, username, task_name, category, completed, organization_id)
VALUES
(1, 'baluacme', 'Submit W-4 tax declaration documents', 'DOCUMENTS', true, 3),
(2, 'baluacme', 'Provision corporate GSuite routing email', 'PROVISIONING', true, 3),
(3, 'baluacme', 'Assign company development laptop (MacBook Pro)', 'ASSETS', true, 3),
(4, 'baluacme', 'Register direct deposit bank details', 'PAYROLL', true, 3),
(5, 'baluacme', 'Meet team lead & review project sprint boards', 'TEAM', false, 3),
(6, 'baluacme', 'Day 1 onboarding welcome buddy coffee sync', 'WELCOME', false, 3),
(7, 'bobjohnson', 'Submit W-4 tax declaration documents', 'DOCUMENTS', false, 3),
(8, 'bobjohnson', 'Provision corporate GSuite routing email', 'PROVISIONING', false, 3),
(9, 'bobjohnson', 'Assign company development laptop (MacBook Pro)', 'ASSETS', false, 3),
(10, 'bobjohnson', 'Register direct deposit bank details', 'PAYROLL', false, 3),
(11, 'bobjohnson', 'Meet team lead & review project sprint boards', 'TEAM', false, 3),
(12, 'bobjohnson', 'Day 1 onboarding welcome buddy coffee sync', 'WELCOME', false, 3)
ON DUPLICATE KEY UPDATE task_name = task_name;

-- Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_tag VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    assignee VARCHAR(100) NOT NULL DEFAULT 'Unassigned',
    status VARCHAR(50) NOT NULL DEFAULT 'In Stock', -- In Stock, Allocated, Maintenance, Retired
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Assets
INSERT INTO assets (id, asset_tag, name, assignee, status, organization_id)
VALUES
(1, 'AST-101', 'Apple MacBook Pro M3 (16-inch)', 'baluacme', 'Allocated', 3),
(2, 'AST-102', 'Apple MacBook Pro M3 (14-inch)', 'bobjohnson', 'Allocated', 3),
(3, 'AST-103', 'Dell XPS 15 9530', 'alicesmith', 'Allocated', 3),
(4, 'AST-104', 'Lenovo ThinkPad T14 Gen 4', 'Unassigned', 'In Stock', 3),
(5, 'AST-105', 'iPhone 15 Pro (128GB)', 'dianaprince', 'Allocated', 3),
(6, 'AST-106', 'Secure Access Card (Card key)', 'Unassigned', 'In Stock', 3),
(7, 'AST-107', 'Apple MacBook Air M2', 'Unassigned', 'Maintenance', 3),
(8, 'AST-108', 'Secure Access Card (Card key)', 'initech_hr', 'Allocated', 1)
ON DUPLICATE KEY UPDATE name = name;

-- Performance Reviews Table
CREATE TABLE IF NOT EXISTS performance_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    period VARCHAR(50) NOT NULL, -- e.g., H1 2026, Q2 2026, Annual 2026
    goals_score DOUBLE NOT NULL, -- 1.0 to 5.0
    sprint_score DOUBLE NOT NULL, -- 1.0 to 5.0
    attendance_score DOUBLE NOT NULL, -- 1.0 to 5.0
    overall_score DOUBLE NOT NULL, -- 1.0 to 5.0
    feedback TEXT,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Performance Reviews
INSERT INTO performance_reviews (id, username, period, goals_score, sprint_score, attendance_score, overall_score, feedback, organization_id)
VALUES
(1, 'baluacme', 'H1 2026', 4.5, 4.2, 4.8, 4.5, 'Excellent contribution to the core platform sprint releases. Strong attendance and goal completion rate.', 3),
(2, 'bobjohnson', 'H1 2026', 3.8, 4.0, 4.5, 4.1, 'Solid Java developments. Ready to take on more complex microservices integration tasks in Q3.', 3),
(3, 'alicesmith', 'H1 2026', 4.0, 4.5, 4.2, 4.2, 'Great work leading frontend React component guidelines.', 3),
(4, 'initech_hr', 'H1 2026', 4.8, 4.8, 4.9, 4.8, 'Flawless administration during organization transitions.', 1)
ON DUPLICATE KEY UPDATE overall_score = overall_score;

DROP TABLE IF EXISTS course_progress, courses;

-- Learning Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL, -- Duration in hours
    target_role VARCHAR(100) NOT NULL, -- e.g., All, IT, HR
    description TEXT,
    drive_link VARCHAR(1000),
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Course Progress Table
CREATE TABLE IF NOT EXISTS course_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    course_id BIGINT NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0, -- 0 to 100 percentage
    status VARCHAR(50) NOT NULL DEFAULT 'Not Started', -- Not Started, In Progress, Completed
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Courses
INSERT INTO courses (id, title, duration, target_role, description, drive_link, organization_id)
VALUES
(1, 'React Frontend State Management & Hooks', 12, 'IT', 'Deep dive into standard React hooks, custom state providers, and performance optimizations.', 'https://drive.google.com/drive/folders/mock-react-state', 3),
(2, 'Spring Boot & JPA MySQL Architectures', 20, 'IT', 'Advanced microservices design using Spring Data JPA, transactions, and performance tuning.', 'https://drive.google.com/drive/folders/mock-springboot', 3),
(3, 'Corporate Cybersecurity Guidelines', 2, 'All', 'Mandatory security course covering phishing, access cards, credentials safety, and device policies.', 'https://drive.google.com/drive/folders/mock-cybersec', 3),
(4, 'Effective Team Management & OKR Cascade', 8, 'HR', 'HR strategies to design and cascade quarterly goals and performance reviews.', 'https://drive.google.com/drive/folders/mock-okrs', 3),
(5, 'Corporate Cybersecurity Guidelines', 2, 'All', 'Mandatory security course covering credentials safety.', 'https://drive.google.com/drive/folders/mock-cybersec-1', 1)
ON DUPLICATE KEY UPDATE title = title;

-- Seed Sample Progress Tracker
INSERT INTO course_progress (id, username, course_id, progress, status, organization_id)
VALUES
(1, 'baluacme', 1, 100, 'Completed', 3),
(2, 'baluacme', 2, 60, 'In Progress', 3),
(3, 'baluacme', 3, 100, 'Completed', 3),
(4, 'bobjohnson', 2, 100, 'Completed', 3),
(5, 'bobjohnson', 3, 0, 'Not Started', 3),
(6, 'alicesmith', 1, 100, 'Completed', 3),
(7, 'initech_hr', 5, 100, 'Completed', 1)
ON DUPLICATE KEY UPDATE progress = progress;

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    manager_username VARCHAR(100),
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Squads (Teams) Table
CREATE TABLE IF NOT EXISTS squads (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id BIGINT NOT NULL,
    lead_username VARCHAR(100),
    skills_matrix VARCHAR(500), -- comma-separated list of required skills (e.g. React, Spring Boot, JUnit)
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Squad Memberships Table
CREATE TABLE IF NOT EXISTS squad_memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    squad_id BIGINT NOT NULL,
    username VARCHAR(100) NOT NULL,
    role_title VARCHAR(100) NOT NULL, -- e.g. Senior Frontend Engineer, HR Coordinator
    allocation_percentage INTEGER NOT NULL DEFAULT 100, -- e.g. 50%, 100%
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Departments
INSERT INTO departments (id, name, description, manager_username, organization_id)
VALUES
(1, 'Engineering', 'Core software development, architecture, QA, and platform DevOps.', 'baluacme', 3),
(2, 'Human Resources', 'Recruitment, onboarding, payroll processing, and operations.', 'initech_hr', 3),
(3, 'Operations & Sales', 'Client engagement, invoice audit, and resource billing.', 'initech_hr', 3)
ON DUPLICATE KEY UPDATE name = name;

-- Seed Sample Squads
INSERT INTO squads (id, name, department_id, lead_username, skills_matrix, organization_id)
VALUES
(1, 'Core Platform Squad', 1, 'alicesmith', 'React, Typescript, Tailwind, Spring Boot', 3),
(2, 'Microservices Squad', 1, 'bobjohnson', 'Java, Spring Boot, MySQL, Docker', 3),
(3, 'Talent Acquisition Team', 2, 'initech_hr', 'ATS, Sourcing, Onboarding, Payroll', 3)
ON DUPLICATE KEY UPDATE name = name;

-- Seed Sample Squad Memberships
INSERT INTO squad_memberships (id, squad_id, username, role_title, allocation_percentage, organization_id)
VALUES
(1, 1, 'alicesmith', 'Lead Frontend Engineer', 100, 3),
(2, 1, 'baluacme', 'Fullstack Architect', 50, 3),
(3, 2, 'bobjohnson', 'Senior Java Developer', 100, 3),
(4, 2, 'dianaprince', 'Java API Developer', 100, 3),
(5, 3, 'initech_hr', 'HR Director', 100, 3)
ON DUPLICATE KEY UPDATE role_title = role_title;

-- Work Logs Table
CREATE TABLE IF NOT EXISTS work_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    log_date DATE NOT NULL,
    what_done TEXT NOT NULL,
    what_next TEXT NOT NULL,
    blockers TEXT,
    hours_spent DOUBLE NOT NULL,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Work Logs
INSERT INTO work_logs (id, username, log_date, what_done, what_next, blockers, hours_spent, organization_id)
VALUES
(1, 'baluacme', '2026-08-05', 'Completed onboarding documents collection, finished W-4 submit verification. Built React form stubs.', 'Start implementing dynamic teams hierarchy and org directories in router.', 'None. Waiting on API definitions approval.', 8.0, 3),
(2, 'bobjohnson', '2026-08-05', 'Integrated Spring Security with OAuth2 login profiles. Seeded database tables.', 'Configure CORS headers and SSL certificates for dev environment.', 'Database port was blocked by local firewall, resolved.', 7.5, 3),
(3, 'alicesmith', '2026-08-05', 'Polished Tailwind styling elements and designed page metrics layouts.', 'Implement drag-n-drop candidates pipeline cards.', 'None.', 8.0, 3),
(4, 'initech_hr', '2026-08-05', 'Processed monthly direct deposit payroll registries.', 'Approve maternity policy requests.', 'Waiting for bank confirmation file.', 6.0, 1)
ON DUPLICATE KEY UPDATE what_done = what_done;

-- Expense Claims Table
CREATE TABLE IF NOT EXISTS expense_claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- e.g. Travel, Meals, Software, Hardware, Other
    amount DOUBLE NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Reimbursed
    merchant VARCHAR(255) NOT NULL,
    claim_date DATE NOT NULL,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Expense Claims
INSERT INTO expense_claims (id, username, title, category, amount, currency, status, merchant, claim_date, organization_id)
VALUES
(1, 'baluacme', 'GSuite Monthly corporate email routing configuration routing fee', 'Software', 45.0, 'USD', 'Approved', 'Google LLC', '2026-08-04', 3),
(2, 'baluacme', 'Day 1 onboarding welcome coffee sync for team lead', 'Meals', 18.5, 'USD', 'Pending', 'Starbucks', '2026-08-05', 3),
(3, 'bobjohnson', 'MacBook Pro replacement USB-C charger hub', 'Hardware', 79.99, 'USD', 'Reimbursed', 'Apple Store', '2026-08-01', 3),
(4, 'initech_hr', 'Corporate recruitment job boards promotion campaign listing', 'Marketing', 299.00, 'USD', 'Approved', 'LinkedIn Corp', '2026-08-03', 1)
ON DUPLICATE KEY UPDATE title = title;

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    target_audience VARCHAR(100) NOT NULL, -- All, IT, HR, Sales
    category VARCHAR(100) NOT NULL, -- News, Event, Holiday, Policy
    publish_date DATE NOT NULL,
    author VARCHAR(100) NOT NULL,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Announcements
INSERT INTO announcements (id, title, content, target_audience, category, publish_date, author, organization_id)
VALUES
(1, 'H1 2026 Strategy Review & All Hands Meeting', 'Join us on Friday, August 8 at 10 AM EST for our quarterly strategy review and organization updates. Link will be shared in the calendar invite.', 'All', 'Event', '2026-08-05', 'acme_hr', 3),
(2, 'Independence Day Corporate Holiday Schedule', 'Please note that the corporate offices will remain closed on Monday, August 17, 2026, in observance of the upcoming national holiday.', 'All', 'Holiday', '2026-08-04', 'acme_hr', 3),
(3, 'Production Database Migration Schedule', 'IT team members: Core PostgreSQL & MySQL databases will undergo maintenance migration on Saturday at midnight. Expect 15 mins of sandbox API downtime.', 'IT', 'News', '2026-08-06', 'baluacme', 3),
(4, 'Zenelait Suite Transition Guidelines', 'Initech members: Welcome to the new dynamic Zenelait HRMS suite deployment. Please configure your profile checklists and verify your bank payout direct deposits.', 'All', 'Policy', '2026-08-05', 'initech_hr', 1)
ON DUPLICATE KEY UPDATE title = title;

-- Exit Requests Table
CREATE TABLE IF NOT EXISTS exit_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    resignation_date DATE NOT NULL,
    last_working_day DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Completed
    department_clearance VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Cleared
    it_clearance VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Cleared
    finance_clearance VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Cleared
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Exit Requests
INSERT INTO exit_requests (id, username, reason, resignation_date, last_working_day, status, department_clearance, it_clearance, finance_clearance, organization_id)
VALUES
(1, 'bobjohnson', 'Accepted an offer at another organization for a senior technology role.', '2026-08-01', '2026-08-31', 'Approved', 'Cleared', 'Pending', 'Pending', 3),
(2, 'alicesmith', 'Relocating to a different state for personal family reasons.', '2026-08-05', '2026-09-05', 'Pending', 'Pending', 'Pending', 'Pending', 3),
(3, 'initech_hr', 'Resigning due to career transition opportunities.', '2026-08-03', '2026-09-03', 'Completed', 'Cleared', 'Cleared', 'Cleared', 1)
ON DUPLICATE KEY UPDATE reason = reason;

-- Timesheets Table
CREATE TABLE IF NOT EXISTS timesheets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    task_description VARCHAR(255) NOT NULL,
    hours_logged DOUBLE NOT NULL,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    week_start_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Timesheets
INSERT INTO timesheets (id, username, project_name, task_description, hours_logged, billable, week_start_date, status, organization_id)
VALUES
(1, 'baluacme', 'Corporate Portal', 'Developed JPA entity definitions and configured MySQL mappings.', 32.5, TRUE, '2026-08-03', 'Approved', 3),
(2, 'baluacme', 'Zenelait Core', 'Refactored state machine loops and cache configurations.', 8.0, TRUE, '2026-08-03', 'Pending', 3),
(3, 'bobjohnson', 'Internal Tools', 'Set up build systems and docker configurations.', 40.0, FALSE, '2026-08-03', 'Approved', 3),
(4, 'alicesmith', 'Corporate Portal', 'Designed responsive React routes and form widgets.', 35.0, TRUE, '2026-08-03', 'Pending', 3),
(5, 'initech_hr', 'Audit Checklists', 'Calculated compliance checklist ratios.', 12.0, FALSE, '2026-08-03', 'Approved', 1)
ON DUPLICATE KEY UPDATE project_name = project_name;

-- Helpdesk Tickets Table
CREATE TABLE IF NOT EXISTS helpdesk_tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- HR, IT, Finance
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium', -- Low, Medium, High
    status VARCHAR(50) NOT NULL DEFAULT 'Open', -- Open, In Progress, Resolved
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Helpdesk Tickets
INSERT INTO helpdesk_tickets (id, username, title, description, category, priority, status, organization_id)
VALUES
(1, 'baluacme', 'GSuite corporate login locked', 'I am unable to access my corporate baluacme email inbox. Need administrator verification password bypass.', 'IT', 'High', 'Open', 3),
(2, 'bobjohnson', 'Form W-4 details update request', 'Need to adjust my tax allowances for the next direct deposit payroll cycle.', 'HR', 'Medium', 'In Progress', 3),
(3, 'alicesmith', 'Incorrect deductions in August payslip', 'My salary statement lists a deduction of $500 which does not match my active leave allocations.', 'Finance', 'High', 'Resolved', 3),
(4, 'initech_hr', 'Hardware procurement request', 'Need to request developer MacBook replacement chargers.', 'IT', 'Low', 'Open', 1)
ON DUPLICATE KEY UPDATE title = title;

-- Travel Requests Table
CREATE TABLE IF NOT EXISTS travel_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_cost DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Pending, Approved, Rejected, Settled
    advance_disbursement DOUBLE NOT NULL DEFAULT 0.0,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Seed Sample Travel Requests
INSERT INTO travel_requests (id, username, destination, purpose, start_date, end_date, estimated_cost, status, advance_disbursement, organization_id)
VALUES
(1, 'baluacme', 'San Francisco, CA', 'Annual tech conference & integration sync workshops.', '2026-08-20', '2026-08-25', 1850.0, 'Approved', 500.0, 3),
(2, 'bobjohnson', 'London, UK', 'Strategic partner alignment meetings for client core portal rollout.', '2026-09-02', '2026-09-08', 3400.0, 'Pending', 0.0, 3),
(3, 'initech_hr', 'Austin, TX', 'Corporate HR convention & recruiting event representation.', '2026-08-15', '2026-08-18', 1200.0, 'Settled', 1200.0, 1)
ON DUPLICATE KEY UPDATE destination = destination;

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL, -- SUPERADMIN, ADMIN, FINANCE, PM, TEAMLEAD, EMPLOYEE, RECRUITER, IT, QA, AUDITOR
    module_name VARCHAR(100) NOT NULL, -- e.g. Attendance, Payroll, Performance, Learning, Assets, Projects, Teams, Expenses, Helpdesk, Exit
    can_read BOOLEAN NOT NULL DEFAULT TRUE,
    can_write BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE KEY uq_role_module_org (role_name, module_name, organization_id)
);

-- Seed Sample Role Permissions
INSERT INTO role_permissions (role_name, module_name, can_read, can_write, can_delete, organization_id)
VALUES
('ADMIN', 'Attendance', TRUE, TRUE, TRUE, 3),
('ADMIN', 'Payroll', TRUE, TRUE, TRUE, 3),
('ADMIN', 'Performance', TRUE, TRUE, TRUE, 3),
('ADMIN', 'Helpdesk', TRUE, TRUE, TRUE, 3),
('EMPLOYEE', 'Attendance', TRUE, FALSE, FALSE, 3),
('EMPLOYEE', 'Payroll', TRUE, FALSE, FALSE, 3),
('EMPLOYEE', 'Performance', TRUE, FALSE, FALSE, 3),
('EMPLOYEE', 'Helpdesk', TRUE, TRUE, FALSE, 3),
('FINANCE', 'Payroll', TRUE, TRUE, FALSE, 3),
('FINANCE', 'Expenses', TRUE, TRUE, TRUE, 3),
('IT', 'Assets', TRUE, TRUE, TRUE, 3),
('IT', 'Helpdesk', TRUE, TRUE, FALSE, 3),
('RECRUITER', 'Employees', TRUE, TRUE, FALSE, 3),
('QA', 'Projects', TRUE, TRUE, FALSE, 3)
ON DUPLICATE KEY UPDATE can_read = can_read;

