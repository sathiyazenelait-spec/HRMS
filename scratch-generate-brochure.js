import { jsPDF } from "jspdf";
import fs from "fs";

// Create PDF document
const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4"
});

// Branding Guidelines
const primaryColor = "#4f46e5"; // Indigo-600
const accentColor = "#ef4444"; // Red-500
const darkColor = "#0f172a"; // Slate-900
const grayColor = "#475569"; // Slate-600
const lightGray = "#f8fafc"; // Slate-50

// Helper to draw headers & footers
const drawPageTemplate = (pageNum, title) => {
  doc.setPage(pageNum);
  
  // Header Logo Text
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(darkColor);
  doc.text("ZENELAIT", 15, 12);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(grayColor);
  doc.text("I N F O  T E C H", 15, 15);
  
  // Header line
  doc.setDrawColor("#e2e8f0");
  doc.setLineWidth(0.4);
  doc.line(15, 17, 195, 17);
  
  // Footer
  doc.line(15, 275, 195, 275);
  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.text(`Zenelait HRMS Enterprise Manual | ${title}`, 15, 281);
  
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(accentColor);
  doc.text(`Page ${pageNum} of 20`, 175, 281);
};

// Common Layout Helpers
const drawSectionHeader = (title, subtitle) => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(darkColor);
  doc.text(title, 15, 30);
  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  doc.text(subtitle, 15, 35);
};

const drawSubTitle = (title, y) => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkColor);
  doc.text(title, 15, y);
};

const drawBullet = (label, desc, x, y, width = 175) => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(darkColor);
  doc.text(`• ${label}:`, x, y);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(grayColor);
  const textX = x + doc.getTextWidth(`• ${label}: `);
  const splitText = doc.splitTextToSize(desc, width - (textX - x));
  doc.text(splitText, textX, y);
};

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(darkColor);
doc.text("ZENELAIT INFO TECH", 15, 30);
doc.setFont("Helvetica", "bold");
doc.setFontSize(8);
doc.setTextColor(accentColor);
doc.text("CORPORATE BROCHURE & HRMS REFERENCE MANUAL", 15, 34);

doc.setFont("Helvetica", "bold");
doc.setFontSize(36);
doc.setTextColor(darkColor);
doc.text("ZENELAIT HRMS", 15, 75);

doc.setFont("Helvetica", "bold");
doc.setFontSize(13);
doc.setTextColor(accentColor);
doc.text("COMPREHENSIVE ROLE-BASED ENTERPRISE MANUAL", 15, 87);

doc.setDrawColor(accentColor);
doc.setLineWidth(0.6);
doc.line(15, 93, 195, 93);

doc.setFont("Helvetica", "normal");
doc.setFontSize(10.5);
doc.setTextColor(grayColor);
doc.text("An all-inclusive, tier-scoped platform designed for modern workforce management. Built by Zenelait", 15, 102);
doc.text("InfoTech Private Limited to streamline workflows from onboarding logistics to real-time payroll analytics.", 15, 107);

doc.setDrawColor("#e2e8f0");
doc.setLineWidth(0.3);
doc.line(15, 135, 195, 135);

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(darkColor);
doc.text("CORPORATE PROFILE", 15, 147);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Zenelait InfoTech is a leading software engineering firm", 15, 153);
doc.text("dedicated to building next-generation enterprise", 15, 158);
doc.text("applications. We specialize in designing customizable SaaS", 15, 163);
doc.text("platforms that integrate HRMS, CRM, and supply chain", 15, 168);
doc.text("networks into unified hubs.", 15, 173);

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(darkColor);
doc.text("ZENELAIT HRMS VISION", 110, 147);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Zenelait HRMS enables multi-tenant organizations to achieve", 110, 153);
doc.text("100% data transparency. Our platform bridges the gap", 110, 158);
doc.text("between manual attendance logs and corporate auditing,", 110, 163);
doc.text("delivering automated compliance checks and high-resolution", 110, 168);
doc.text("PDF expense voucher compilations.", 110, 173);

doc.setDrawColor("#e2e8f0");
doc.line(15, 195, 195, 195);

doc.setFont("Helvetica", "bold");
doc.setFontSize(9);
doc.setTextColor(darkColor);
doc.text("OFFICIAL CONTACT & SECURITY NOTICE", 15, 207);
doc.setFont("Helvetica", "normal");
doc.setFontSize(8.5);
doc.setTextColor(grayColor);
doc.text("This document is proprietary information of Zenelait InfoTech Private Limited. Unauthorized reproduction or distribution of this", 15, 213);
doc.text("manual is strictly prohibited. All system configurations, database connections, and REST API paths are subject to security audits.", 15, 218);

doc.setFontSize(8);
doc.text("v2.5 Enterprise Edition", 15, 255);
doc.text("© 2026 Zenelait InfoTech Pvt. Ltd.", 145, 255);
drawPageTemplate(1, "Cover Page");

// ==========================================
// PAGE 2: TABLE OF CONTENTS
// ==========================================
doc.addPage();
drawSectionHeader("TABLE OF CONTENTS", "DOCUMENT NAVIGATION INDEX");

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Detailed page distribution index mapping all 20 functional modules and roles within the Zenelait HRMS ecosystem:", 15, 45);

const tocItems = [
  { index: "1. Cover Page & Corporate Vision", page: "Page 1" },
  { index: "2. Table of Contents & Navigation Index", page: "Page 2" },
  { index: "3. System Architecture & Relational Gateway", page: "Page 3" },
  { index: "4. Subscription Tier System & Pricing Mappings", page: "Page 4" },
  { index: "5. Access Security, OTP Lifecycles & Login Portals", page: "Page 5" },
  { index: "6. Super Admin Console & Tenant Provisioning", page: "Page 6" },
  { index: "7. HR Admin: Employee Roster Management", page: "Page 7" },
  { index: "8. Recruitment Module: Job Requisitions Manager", page: "Page 8" },
  { index: "9. Recruitment Module: Candidate Pipeline Stages", page: "Page 9" },
  { index: "10. Attendance Ledger & Timekeeping Clocks", page: "Page 10" },
  { index: "11. Leave Requests Approval Decision Trees", page: "Page 11" },
  { index: "12. Project Portfolios & Gantt Baselines", page: "Page 12" },
  { index: "13. Scrum Sprints & Backlog Ticket Queues", page: "Page 13" },
  { index: "14. Payroll Calculations & Tax Processing", page: "Page 14" },
  { index: "15. Expense Ledgers & Printable Wage Vouchers", page: "Page 15" },
  { index: "16. Invoices Management & Accounts Receivables", page: "Page 16" },
  { index: "17. Performance Review Appraisals & KPIs", page: "Page 17" },
  { index: "18. Corporate Assets Inventory & Helpdesk Tickets", page: "Page 18" },
  { index: "19. Employee Self-Service, Worklogs & Passwords", page: "Page 19" },
  { index: "20. API Developer Mappings & Database Schemas", page: "Page 20" }
];

let yPos = 52;
tocItems.forEach((item) => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor);
  doc.text(item.index, 15, yPos);
  
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(accentColor);
  doc.text(item.page, 175, yPos);
  
  doc.setDrawColor("#e2e8f0");
  doc.setLineWidth(0.2);
  doc.line(15, yPos + 2, 195, yPos + 2);
  
  yPos += 10;
});

// Callout
doc.setFillColor(lightGray);
doc.rect(15, 252, 180, 16, "F");
doc.setFont("Helvetica", "italic");
doc.setFontSize(8);
doc.setTextColor(darkColor);
doc.text("Technical Note: The system utilizes asynchronous Kafka event logs and Redis serialization to ensure zero-latency routing.", 18, 261);

drawPageTemplate(2, "Table of Contents");

// ==========================================
// PAGE 3: SYSTEM ARCHITECTURE
// ==========================================
doc.addPage();
drawSectionHeader("SYSTEM ARCHITECTURE", "BACKEND REST APIS, FRONTEND ROUTING, AND AUDIT PIPELINES");

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Zenelait HRMS employs a highly scalable, decoupled client-server architecture model. The client-side dashboard", 15, 45);
doc.text("runs on Next.js 14 / Vite, connecting to a multi-threaded Java Spring Boot 3 enterprise backend and a high-performance", 15, 50);
doc.text("MySQL/TiDB Cloud relational storage.", 15, 55);

drawSubTitle("TECHNICAL STACK DETAILS", 68);

// Table Header
doc.setFillColor("#1e293b");
doc.rect(15, 74, 180, 8, "F");
doc.setFont("Helvetica", "bold");
doc.setFontSize(8.5);
doc.setTextColor("#ffffff");
doc.text("Layer", 18, 79.5);
doc.text("Technology", 60, 79.5);
doc.text("Responsibility", 110, 79.5);

// Table Rows
const rows = [
  { layer: "Frontend Client", tech: "Next.js 14, React, TS, Tailwind CSS", resp: "Role Dashboards, Real-time Charts, Responsive Layouts" },
  { layer: "Java Backend", tech: "Spring Boot 3, Java 21, Hibernate JPA", resp: "Business Logic, Multi-tenant Data APIs, Security Filters" },
  { layer: "Messaging Queue", tech: "Apache Kafka (Port 9092)", resp: "Asynchronous Audit Logging & Event-driven Logs" },
  { layer: "Cache Broker", tech: "Redis Cache (Port 6379)", resp: "Performance Optimization & API Response Serialization" },
  { layer: "Database", tech: "MySQL / TiDB Cloud (Port 4000)", resp: "Transactional Ledgers, User Accounts, Registry" }
];

let rowY = 82;
rows.forEach((row, index) => {
  doc.setFillColor(index % 2 === 0 ? "#ffffff" : lightGray);
  doc.rect(15, rowY, 180, 9, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(darkColor);
  doc.text(row.layer, 18, rowY + 6);
  
  doc.setFont("Helvetica", "normal");
  doc.text(row.tech, 60, rowY + 6);
  doc.text(row.resp, 110, rowY + 6);
  
  doc.setDrawColor("#e2e8f0");
  doc.setLineWidth(0.2);
  doc.line(15, rowY + 9, 195, rowY + 9);
  
  rowY += 9;
});

drawSubTitle("SECURITY FILTER CHAIN & DECOUPLING", 142);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("All network interactions use JSON-encoded requests. Spring Security handles endpoint protection, verifying signature", 15, 148);
doc.text("validation keys encoded in client-header HTTP bearer authentication tokens on every dispatch.", 15, 153);
doc.text("The backend employs database connection pools (HikariCP) to interact with relational schemas, ensuring fast", 15, 160);
doc.text("transactional speeds during high-concurrency workforce attendance logging.", 15, 165);

drawPageTemplate(3, "System Architecture");

// ==========================================
// PAGE 4: SUBSCRIPTION TIERS
// ==========================================
doc.addPage();
drawSectionHeader("SUBSCRIPTION TIERS", "MODULAR CONTROL AND PRICING PLAN MAPPINGS");

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("To provide flexible enterprise SaaS packages, Zenelait HRMS employs an active subscription mapping engine. The features,", 15, 45);
doc.text("dashboards, and role dropdowns rendered on login screens are toggled dynamically based on the active client subscription tier.", 15, 50);

const plans = [
  { name: "GROWTH PLAN", color: "#10b981", desc: "Designed for small operations. Unlocks employee clock-in/out registers and self-service. Excludes deep financial ledger control." },
  { name: "PREMIUM PLAN", color: "#3b82f6", desc: "Adds middle-tier control. Unlocks full HR Manager control panels, Sprint velocity trackers, custom timesheets, and basic payroll metrics." },
  { name: "ENTERPRISE PLAN", color: "#8b5cf6", desc: "Full platform access. Enables the Super Admin console, multi-tenant custom organization settings, Kafka audit streams, and Redis cache tuning." }
];

let planY = 70;
plans.forEach((plan) => {
  doc.setFillColor(plan.color);
  doc.rect(15, planY, 40, 7, "F");
  
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor("#ffffff");
  doc.text(plan.name, 18, planY + 5);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  
  const splitText = doc.splitTextToSize(plan.desc, 130);
  doc.text(splitText, 60, planY + 5);
  
  planY += 22;
});

drawSubTitle("DATABASE CONFIGURATION & VERIFICATION", 145);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.text("The `organizations` table stores subscription levels under the `plan_type` column (STANDARD, MIDLEVEL, ENTERPRISE).", 15, 151);
doc.text("When a user authenticates, the handler queries `GET /api/superadmin/organizations` to fetch their tenant context,", 15, 156);
doc.text("parsing the subscription plan type to dynamically configure permission matrices on the frontend client.", 15, 161);

drawPageTemplate(4, "Subscription Tiers");

// ==========================================
// PAGE 5: ACCESS SECURITY & OTP LIFECYCLES
// ==========================================
doc.addPage();
drawSectionHeader("ACCESS SECURITY", "OTP LIFECYCLES, PORTAL SELECTION, AND AUTH FLOWS");

drawSubTitle("1. THE FIREWALL PORTAL SELECTOR GATE", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Access control starts at the landing page. Before hitting the authentication pages, the portal selection panel", 15, 54);
doc.text("remains locked behind an organization name, code, and OTP verification modal. This acts as a primary firewall.", 15, 59);

drawSubTitle("2. OTP LIFECYCLE", 72);
drawBullet("Step A", "The user inputs their corresponding organization name, which queries `GET /api/superadmin/organizations`.", 15, 78);
drawBullet("Step B", "The system verifies the organization code and requires the 6-digit OTP code corresponding to the tenant.", 15, 86);
drawBullet("Step C", "On verification, organization configurations (ID, Plan Tier, Code) are committed to client localStorage, unlocking role portals.", 15, 94);

drawSubTitle("3. LOGIN GATEWAYS", 112);
doc.setFont("Helvetica", "normal");
doc.text("Once unlocked, users are directed to role-specific login interfaces: `/login/superadmin`, `/login/admin`, or `/login/employee`.", 15, 118);
doc.text("All forms submit username and password details via `POST /api/auth/login`, returning authenticated user models.", 15, 123);

drawPageTemplate(5, "Access Security");

// ==========================================
// PAGE 6: SUPER ADMIN CONSOLE
// ==========================================
doc.addPage();
drawSectionHeader("SUPER ADMIN CONSOLE", "TENANT PROVISIONING, SUBSCRIPTION BILLING & HEALTH STATUS");

drawSubTitle("1. TENANT PROVISIONING", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("The Super Admin is the primary systems manager. Using the provision form, they register new organizations into MySQL.", 15, 54);
doc.text("The system automatically generates a unique Organization Code (e.g. HRMS2026xxxxx) and a 6-digit OTP code.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/superadmin/organizations", "Fetches the complete registry of active tenant companies.", 15, 78);
drawBullet("POST /api/superadmin/organization", "Submits organization configuration payload (name, type, owner contact, billing plan).", 15, 86);
drawBullet("PUT /api/superadmin/organization/{id}", "Updates active tier specifications or details.", 15, 94);
drawBullet("DELETE /api/superadmin/organization/{id}", "Removes a tenant from the registry.", 15, 102);

drawSubTitle("3. KAFKA EVENT QUEUES", 120);
doc.setFont("Helvetica", "normal");
doc.text("Every organization creation triggers a Kafka message to `organization-creation-events` detailing ID, name, code and OTP.", 15, 126);

drawPageTemplate(6, "Super Admin Console");

// ==========================================
// PAGE 7: EMPLOYEE ROSTER MANAGEMENT
// ==========================================
doc.addPage();
drawSectionHeader("EMPLOYEE ROSTER MANAGEMENT", "HR ADMIN CONTROL OF DIRECTORIES AND ACCOUNT CREATIONS");

drawSubTitle("1. THE HR ROSTER INTERFACE", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("HR Administrators (Tenant Admins) manage the active roster for their organization. The screen presents a creation", 15, 54);
doc.text("form and an active roster grid containing user profile coordinates.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/auth/users?orgId={id}", "Fetches employee records registered under the Admin's organization.", 15, 78);
drawBullet("POST /api/auth/create-user", "Creates a new employee account in MySQL, setting username, password, email, and mobile.", 15, 86);
drawBullet("PUT /api/auth/users/{id}/role", "Modifies an employee's role level (e.g. Admin, Employee).", 15, 94);

drawSubTitle("3. SECURITY NOTICE", 112);
doc.setFont("Helvetica", "normal");
doc.text("New registrations default to role `EMPLOYEE` or `ADMIN`, automatically bound to the parent organization ID.", 15, 118);

drawPageTemplate(7, "Roster Management");

// ==========================================
// PAGE 8: RECRUITMENT MODULE (JOB OPENINGS)
// ==========================================
doc.addPage();
drawSectionHeader("RECRUITMENT: JOB REQUISITIONS", "CREATING OPENINGS, ASSIGNING TARGET DEPARTMENTS");

drawSubTitle("1. THE JOB REGISTER SCREEN", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("The recruitment module starts with job requisitions. HR Managers can create and track positions across departments", 15, 54);
doc.text("like Engineering, Sales, and Human Resources. Status toggles indicate open or closed pipelines.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/recruitment/jobs?orgId={id}", "Fetches all job requisitions for the organization.", 15, 78);
drawBullet("POST /api/recruitment/jobs", "Submits a new job opening specifying title, target department, and initial status.", 15, 86);

drawSubTitle("3. DATABASE PERSISTENCE", 104);
doc.setFont("Helvetica", "normal");
doc.text("Job requisitions are stored in the `job_requisitions` table, establishing relations with candidate records.", 15, 110);

drawPageTemplate(8, "Job Requisitions");

// ==========================================
// PAGE 9: RECRUITMENT MODULE (CANDIDATES PIPELINE)
// ==========================================
doc.addPage();
drawSectionHeader("RECRUITMENT: CANDIDATES PIPELINE", "MANAGING APPLICATIONS AND PIPELINE PIPELINES");

drawSubTitle("1. THE INTERACTIVE PIPELINE BOARD", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("The Candidate Pipeline presents a visual board layout where applicants are categorized into columns representing stages:", 15, 54);
doc.text("Applied, Screening, Interview, Offered, Hired, and Rejected. Drag-and-drop operations trigger updates.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/recruitment/candidates?orgId={id}", "Loads all candidate profiles registered under the organization.", 15, 78);
drawBullet("POST /api/recruitment/candidates", "Adds a new candidate record mapped to a specific job requisition.", 15, 86);
drawBullet("POST /api/recruitment/candidates/stage", "Updates the candidate's stage status in MySQL when moved in the board layout.", 15, 94);

drawSubTitle("3. PRE-SEEDED DATA MAPPING", 112);
doc.setFont("Helvetica", "normal");
doc.text("Profiles like Alice Smith (Applied), Bob Johnson (Screening), and Charlie Brown (Interview) are persisted in `candidates` table.", 15, 118);

drawPageTemplate(9, "Candidate Pipeline");

// ==========================================
// PAGE 10: ATTENDANCE LEDGER & TIMEKEEPING
// ==========================================
doc.addPage();
drawSectionHeader("ATTENDANCE & TIMEKEEPING", "CLOCK-IN/OUT LIFECYCLE AND LOG AUDITING");

drawSubTitle("1. CLOCK TRIGGERS", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Employees log work time on their dashboard using the 'Clock In' and 'Clock Out' button. The action registers exact", 15, 54);
doc.text("times, calculating daily duration and compliance metrics automatically.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/attendance?orgId={id}", "Fetches the full company log history (Admin view).", 15, 78);
drawBullet("POST /api/attendance/clock", "Submits clock-in or clock-out timestamp events for the current user.", 15, 86);
drawBullet("POST /api/attendance/save?orgId={id}", "Bulk saves manual grid entry adjustments made by HR.", 15, 94);

drawSubTitle("3. METRICS AND CHARTS", 112);
doc.setFont("Helvetica", "normal");
doc.text("Daily active employee stats and monthly attendance rates are graphed on the leadership dashboards.", 15, 118);

drawPageTemplate(10, "Attendance Logs");

// ==========================================
// PAGE 11: LEAVE REQUESTS & APPROVALS
// ==========================================
doc.addPage();
drawSectionHeader("LEAVE MANAGEMENT", "SUBMITTING CLAIMS, BALANCE TRACKING, AND APPROVAL TREE");

drawSubTitle("1. THE LEAVE WORKFLOW", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Employees can submit requests for Casual, Sick, or WFH leaves. HR Admins view all pending requests in an approval tree,", 15, 54);
doc.text("allowing them to accept or reject them, which updates the employee's remaining leave balance.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/leaves?username={name}", "Loads historical leave requests and balances for the logged-in user.", 15, 78);
drawBullet("POST /api/leaves", "Creates a new leave request (date, duration, type).", 15, 86);
drawBullet("POST /api/leaves/approve", "Submits approval or rejection state update for a pending ID.", 15, 94);

drawSubTitle("3. DATABASE SCHEMA", 112);
doc.setFont("Helvetica", "normal");
doc.text("Leaves are persisted in `leave_requests` table. Remaining balances are calculated dynamically from approved durations.", 15, 118);

drawPageTemplate(11, "Leave Management");

// ==========================================
// PAGE 12: PROJECT PORTFOLIO & GANTT BASELINES
// ==========================================
doc.addPage();
drawSectionHeader("PROJECT PORTFOLIO", "PROJECT REGISTRY AND PORTFOLIO CONTROL");

drawSubTitle("1. PORTFOLIO MONITORING", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Zenelait HRMS tracks project portfolios. Managers register projects, allocate budgets, assign team owners, and evaluate", 15, 54);
doc.text("status flags (Green, Amber, Red). Visual Gantt schedules display milestones.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/projects?orgId={id}", "Loads the registry of projects mapped to the organization.", 15, 78);
drawBullet("POST /api/projects", "Creates a new project record, storing name, budget limit, and initial status.", 15, 86);
drawBullet("PUT /api/projects/{id}", "Updates project parameters or tracks financial spend.", 15, 94);

drawSubTitle("3. DATA ENTITY", 112);
doc.setFont("Helvetica", "normal");
doc.text("Data mapping connects the `projects` table directly to financial gauges displayed on the management dashboards.", 15, 118);

drawPageTemplate(12, "Project Portfolio");

// ==========================================
// PAGE 13: SCRUM SPRINTS & BACKLOG TICKETS
// ==========================================
doc.addPage();
drawSectionHeader("SPRINTS & SCRUM BACKLOG", "SPRINT LIFECYCLES, SCRUM TICKETS AND VELOCITY BOARDS");

drawSubTitle("1. SPRINT LIFECYCLE", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Teams organize engineering tasks into Sprints. The Backlog interface displays scrum tickets categorized by status:", 15, 54);
doc.text("To Do, In Progress, In Review, and Done. Team members can move tickets to track daily velocity.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/sprints?orgId={id}", "Fetches sprint milestones and active timelines.", 15, 78);
drawBullet("POST /api/sprints/create?orgId={id}", "Creates a new sprint cycle.", 15, 86);
drawBullet("GET /api/tickets?orgId={id}", "Loads all scrum task tickets for the active sprint.", 15, 94);
drawBullet("POST /api/tickets/create?orgId={id}", "Submits a new ticket, setting title, description, points, and assignee.", 15, 102);

drawSubTitle("3. SPRINT BOARDS", 120);
doc.setFont("Helvetica", "normal");
doc.text("Dragging tickets automatically updates active project completion indicators in the database.", 15, 126);

drawPageTemplate(13, "Sprint Backlog");

// ==========================================
// PAGE 14: PAYROLL CALCULATIONS
// ==========================================
doc.addPage();
drawSectionHeader("PAYROLL CALCULATIONS", "PROCESSING PAYROLL LOGS AND GENERATING STATEMENTS");

drawSubTitle("1. PAYROLL PROCESSING", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("HR Admins execute payroll calculations at the end of each payment cycle. The system evaluates active employee logs,", 15, 54);
doc.text("calculates gross salary, applies tax deductions, and generates printable payroll registers.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/payroll?orgId={id}", "Loads historical payroll statements.", 15, 78);
drawBullet("GET /api/payroll/calculate?orgId={id}", "Simulates active wage runs, applying tax rules and deduction formulas.", 15, 86);
drawBullet("POST /api/payroll/process?orgId={id}", "Locks and records the payroll run into the `payroll` database table.", 15, 94);

drawSubTitle("3. KAFKA EVENT PIPELINE", 112);
doc.setFont("Helvetica", "normal");
doc.text("Successful payroll runs trigger asynchronous transaction logs dispatched to the system auditing pipeline.", 15, 118);

drawPageTemplate(14, "Payroll Processing");

// ==========================================
// PAGE 15: CORPORATE EXPENSES & PDF VOUCHERS
// ==========================================
doc.addPage();
drawSectionHeader("CORPORATE EXPENSES & VOUCHERS", "SUBMITTING REIMBURSEMENTS AND DYNAMIC PDF GENERATION");

drawSubTitle("1. THE VOUCHER GENERATOR", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Employees submit claims for business expenses (travel, meals, assets). The Expense ledger contains an overlay panel", 15, 54);
doc.text("to preview, compile, and download high-resolution, pixel-perfect PDF vouchers with signature blocks.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/expenses?orgId={id}", "Loads all submitted expense reimbursement claims.", 15, 78);
drawBullet("POST /api/expenses", "Submits a new claim, attaching receipt URL links and category descriptions.", 15, 86);
drawBullet("PUT /api/expenses/{id}/status", "Approves or rejects claims (HR Admin control).", 15, 94);

drawSubTitle("3. PDF COMPILER TECH", 112);
doc.setFont("Helvetica", "normal");
doc.text("The client utilizes html2canvas and jspdf to capture the DOM template at scale: 2 for clean, print-ready document output.", 15, 118);

drawPageTemplate(15, "Expense Vouchers");

// ==========================================
// PAGE 16: INVOICES & RECEIVABLES
// ==========================================
doc.addPage();
drawSectionHeader("INVOICES & RECEIVABLES", "CLIENT BILLINGS, AUTO-GENERATION AND AGING MATRIX");

drawSubTitle("1. BILLING AND INVOICING", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("The Invoices ledger tracks accounts receivables from corporate clients. HR Admins can manually register invoices", 15, 54);
doc.text("or trigger auto-generation schedules based on contract targets. Status flags trace payment delays.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/invoices?orgId={id}", "Loads the registry of client invoices from the database.", 15, 78);
drawBullet("POST /api/invoices/create?orgId={id}", "Creates a manual invoice record in MySQL.", 15, 86);
drawBullet("POST /api/invoices/auto-generate?orgId={id}", "Runs automated contract target evaluations.", 15, 94);

drawSubTitle("3. RECEIVABLES ENGINE", 112);
doc.setFont("Helvetica", "normal");
doc.text("Payment records update cash position charts mapped on the Finance dashboard.", 15, 118);

drawPageTemplate(16, "Invoices Register");

// ==========================================
// PAGE 17: PERFORMANCE APPRAISALS
// ==========================================
doc.addPage();
drawSectionHeader("PERFORMANCE APPRAISALS", "CREATING REVIEW CARDS AND AUDITING RATING MATRICES");

drawSubTitle("1. PERFORMANCE MANAGEMENT", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Managers evaluate employee performance. Review dashboards display appraisale cards mapping key metrics:", 15, 54);
doc.text("Technical proficiency, communication skills, delivery rates, and overall manager recommendations.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/performance?orgId={id}", "Fetches review cards logged for organization employees.", 15, 78);
drawBullet("POST /api/performance", "Creates a review record, storing employee ID, rating points, and text feedback.", 15, 86);

drawSubTitle("3. PERFORMANCE AUDITING", 104);
doc.setFont("Helvetica", "normal");
doc.text("Average ratings are calculated in the backend, updating active performance indexes on the dashboard.", 15, 110);

drawPageTemplate(17, "Performance Appraisals");

// ==========================================
// PAGE 18: CORPORATE ASSETS & HELPDESK
// ==========================================
doc.addPage();
drawSectionHeader("ASSETS & HELPDESK", "ASSET ALLOCATIONS AND SUPPORT TICKETS PORTAL");

drawSubTitle("1. CORPORATE ASSETS INVENTORY", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Employees can request corporate hardware (laptops, monitors). HR tracks hardware inventory statuses: Allocated, Available, Pending.", 15, 54);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/assets?orgId={id}", "Fetches hardware asset list from the database.", 15, 78);
drawBullet("POST /api/assets/request", "Submits a device request from an employee profile.", 15, 86);
drawBullet("GET /api/helpdesk?orgId={id}", "Loads support tickets logged by employees.", 15, 94);
drawBullet("POST /api/helpdesk/create", "Logs a technical issue (setting description, category, and priority).", 15, 102);

drawSubTitle("3. SUPPORT QUEUES", 120);
doc.setFont("Helvetica", "normal");
doc.text("Helpdesk tickets are routed to support queue lines in the `helpdesk_tickets` table.", 15, 126);

drawPageTemplate(18, "Assets & Helpdesk");

// ==========================================
// PAGE 19: EMPLOYEE SELF-SERVICE
// ==========================================
doc.addPage();
drawSectionHeader("EMPLOYEE SELF-SERVICE", "DASHBOARD CONTROLS, WORK LOGS AND PASSWORD RESETS");

drawSubTitle("1. THE SELF-SERVICE SCREEN", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Employees log daily work details via the Self-Service interface. From their personal command console, they", 15, 54);
doc.text("register attendance, review salary history, track task logs, and submit password reset requests.", 15, 59);

drawSubTitle("2. ACTIONS INVOLVED", 72);
drawBullet("GET /api/worklogs?username={name}", "Loads daily task details logged by the user.", 15, 78);
drawBullet("POST /api/worklogs", "Submits a daily log entry (hours, task description).", 15, 86);
drawBullet("POST /api/auth/forgot-password", "Dispatches password reset request to HR queue.", 15, 94);

drawSubTitle("3. SYSTEM SECURITY", 112);
doc.setFont("Helvetica", "normal");
doc.text("Users change credentials using `POST /api/auth/change-password`, requiring current password verification.", 15, 118);

drawPageTemplate(19, "Self-Service");

// ==========================================
// PAGE 20: DEVELOPER REGISTRY
// ==========================================
doc.addPage();
drawSectionHeader("DEVELOPER REGISTRY", "CORE BACKEND REST APIS AND DATABASE CONSTRAINTS");

drawSubTitle("1. DATABASE ENTITIES REFERENCE", 48);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("The schema database contains 31 JPA entity tables with foreign keys mapping multi-tenant organization IDs.", 15, 54);
doc.text("Auto-generating columns match Java serialVersionUID specifications for secure database transactions.", 15, 59);

drawSubTitle("2. CORE API ENDPOINTS MAPPING", 72);
drawBullet("GET /api/superadmin/organizations", "System-wide tenant registries query.", 15, 78);
drawBullet("POST /api/auth/login", "User login credentials verification endpoint.", 15, 86);
doc.text("• GET /api/recruitment/candidates: Recruitment pipeline details query.", 15, 94);
doc.text("• GET /api/attendance: Daily work log attendance queries.", 15, 99);
doc.text("• GET /api/leaves: Leaves balance and application registers.", 15, 104);

drawSubTitle("3. RELATIONAL INTEGRITY Constraints", 112);
doc.setFont("Helvetica", "normal");
doc.text("User mappings enforce cascade exclusions to prevent tenant data leakage. Every transaction updates MySQL.", 15, 118);

drawPageTemplate(20, "Developer Registry");

// Save document
const buffer = doc.output("arraybuffer");
fs.writeFileSync("public/hrmss-brochure.pdf", Buffer.from(buffer));
console.log("SUCCESS: public/hrmss-brochure.pdf compiled successfully!");
