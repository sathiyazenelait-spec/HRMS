import { jsPDF } from "jspdf";
import fs from "fs";

// Create a landscape PDF document (A4 size: 297mm x 210mm)
const doc = new jsPDF({
  orientation: "landscape",
  unit: "mm",
  format: "a4"
});

// Theme Colors
const colors = {
  primary: "#4f46e5",    // Indigo
  accent: "#ef4444",     // Red
  dark: "#0f172a",       // Slate-900
  gray: "#475569",       // Slate-600
  lightGray: "#f8fafc",  // Slate-50
  border: "#cbd5e1",     // Slate-300
  white: "#ffffff",

  // Flow Node Colors
  roleBg: "#fffbeb",      // Amber-50
  roleBorder: "#f59e0b",  // Amber-500
  roleText: "#78350f",    // Amber-900

  frontBg: "#eff6ff",     // Blue-50
  frontBorder: "#3b82f6", // Blue-500
  frontText: "#1e3a8a",   // Blue-900

  backBg: "#faf5ff",      // Purple-50
  backBorder: "#a855f7",  // Purple-500
  backText: "#581c87",    // Purple-900

  dbBg: "#ecfdf5",        // Emerald-50
  dbBorder: "#10b981",    // Emerald-500
  dbText: "#064e3b"       // Emerald-900
};

// Header and footer draw helper
const drawPageTemplate = (pageNum, title) => {
  doc.setPage(pageNum);
  
  // Header Logo Text
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(colors.dark);
  doc.text("ZENELAIT INFO TECH", 15, 12);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(colors.gray);
  doc.text("H R M S   E N T E R P R I S E   W O R K F L O W S", 15, 15.5);
  
  // Header line
  doc.setDrawColor(colors.border);
  doc.setLineWidth(0.3);
  doc.line(15, 18, 282, 18);
  
  // Footer
  doc.line(15, 195, 282, 195);
  doc.setFontSize(8);
  doc.setTextColor(colors.gray);
  doc.text(`Zenelait HRMS Technical Roster | ${title}`, 15, 201);
  
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(colors.accent);
  doc.text(`Page ${pageNum} of 9`, 265, 201);
};

// Section Header Helper
const drawSectionHeader = (title, subtitle) => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(colors.dark);
  doc.text(title, 15, 28);
  doc.setFontSize(9);
  doc.setTextColor(colors.gray);
  doc.text(subtitle, 15, 33);
};

// Flowchart Node Drawer Helper
const drawFlowNode = (doc, title, desc, x, y, w, h, bgHex, borderHex, textHex) => {
  doc.setDrawColor(borderHex);
  doc.setFillColor(bgHex);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");

  // Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(textHex);
  doc.text(title, x + 2.5, y + 4.5);

  // Description
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(textHex);
  const splitText = doc.splitTextToSize(desc, w - 5);
  doc.text(splitText, x + 2.5, y + 9);
};

// Flowchart Connector Arrow Helper
const drawConnector = (doc, x1, y1, x2, y2, col) => {
  doc.setDrawColor(col);
  doc.setLineWidth(0.35);
  doc.line(x1, y1, x2, y2);
  
  // Arrowhead drawing
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowSize = 1.8;
  const xLeft = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
  const yLeft = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
  const xRight = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
  const yRight = y2 - arrowSize * Math.sin(angle + Math.PI / 6);
  
  doc.setFillColor(col);
  doc.triangle(x2, y2, xLeft, yLeft, xRight, yRight, "F");
};

// Draw Flowchart Columns Labels
const drawColumnLabels = (y) => {
  const cols = [
    { label: "USER ROLE / ACTION TRIGGER", x: 15, w: 55, bg: colors.roleBg, border: colors.roleBorder, text: colors.roleText },
    { label: "FRONTEND ROUTE / CLIENT UI", x: 82, w: 55, bg: colors.frontBg, border: colors.frontBorder, text: colors.frontText },
    { label: "BACKEND API / CONTROLLER", x: 149, w: 55, bg: colors.backBg, border: colors.backBorder, text: colors.backText },
    { label: "RELATIONAL DATABASE ENTITY", x: 216, w: 66, bg: colors.dbBg, border: colors.dbBorder, text: colors.dbText }
  ];

  cols.forEach(col => {
    doc.setFillColor(col.bg);
    doc.setDrawColor(col.border);
    doc.roundedRect(col.x, y, col.w, 6, 1, 1, "FD");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(col.text);
    // center text
    const txtW = doc.getTextWidth(col.label);
    const offset = (col.w - txtW) / 2;
    doc.text(col.label, col.x + offset, y + 4.2);
  });
};

// ==========================================
// PAGE 1: COVER PAGE
// ==========================================
doc.setFont("Helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(colors.dark);
doc.text("ZENELAIT INFO TECH PRIVATE LIMITED", 15, 30);
doc.setFont("Helvetica", "bold");
doc.setFontSize(8.5);
doc.setTextColor(colors.accent);
doc.text("ENTERPRISE HRMS SPECIFICATION MANUAL - VOL. 2", 15, 34);

doc.setFont("Helvetica", "bold");
doc.setFontSize(38);
doc.setTextColor(colors.dark);
doc.text("ZENELAIT HRMS FLOWCHARTS", 15, 75);

doc.setFont("Helvetica", "bold");
doc.setFontSize(13);
doc.setTextColor(colors.accent);
doc.text("PACKAGE-WISE ROLE WORKFLOW MATRIX & TRANSACTION PATHWAYS", 15, 87);

doc.setDrawColor(colors.accent);
doc.setLineWidth(0.6);
doc.line(15, 93, 282, 93);

doc.setFont("Helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(colors.gray);
doc.text("An exhaustive technical document detailing every functional package and endpoint within Zenelait HRMS.", 15, 102);
doc.text("Maps each of the three enterprise user roles (Super Admin, HR Admin, and Employee) to their corresponding", 15, 107);
doc.text("frontend client views, backend API controllers, and relational database schemas.", 15, 112);

doc.setDrawColor(colors.border);
doc.setLineWidth(0.3);
doc.line(15, 135, 282, 135);

// Left Block
doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(colors.dark);
doc.text("ROLES COVERED", 15, 147);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(colors.gray);
doc.text("• SUPERADMIN - Systems administrator, tenant provider & auditor.", 15, 154);
doc.text("• ADMIN (HR Admin) - Tenant workforce manager, recruiter, payroll & project lead.", 15, 160);
doc.text("• EMPLOYEE (Staff) - Self-service timekeeper, claimant, ticket requester & learner.", 15, 166);

// Right Block
doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(colors.dark);
doc.text("TECHNICAL PACKAGES INTEGRATED", 150, 147);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(colors.gray);
doc.text("• Core Services: Auth, Onboarding, Roster, Exit, Dashboard", 150, 154);
doc.text("• Logistics & Time: Attendance, Timesheets, Leaves, Travel, Expenses", 150, 160);
doc.text("• Business & Operations: Projects, Sprints, Worklogs, Payroll, Assets, Tickets, Invoices", 150, 166);
doc.text("• Corporate Growth: Recruitment, Appraisals, Course Learning, Announcements", 150, 172);

// Footer
doc.setFont("Helvetica", "normal");
doc.setFontSize(8.5);
doc.setTextColor(colors.gray);
doc.text("v2.6 Enterprise Edition Specification", 15, 187);
doc.text("© 2026 Zenelait InfoTech Pvt. Ltd. All rights reserved.", 218, 187);
drawPageTemplate(1, "Cover Page");


// ==========================================
// PAGE 2: TABLE OF CONTENTS & LEGEND
// ==========================================
doc.addPage();
drawSectionHeader("TABLE OF CONTENTS & SYSTEM LEGEND", "REPORT INDEX & VISUAL DATA FLOW MAPPING GUIDES");

// TOC columns
doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(colors.dark);
doc.text("REPORT PAGES INDEX", 15, 45);

const tocItems = [
  { p: "Page 1", title: "Cover Page & Document Purpose" },
  { p: "Page 2", title: "Table of Contents & Flowchart Legend Guide" },
  { p: "Page 3", title: "Super Admin Role Flowchart (System Operations & Organization Control)" },
  { p: "Page 4", title: "HR Admin Role Flowchart - Part I (Onboarding, Directory, & Recruitment)" },
  { p: "Page 5", title: "HR Admin Role Flowchart - Part II (Attendance, Leaves, & Sprint Projects)" },
  { p: "Page 6", title: "HR Admin Role Flowchart - Part III (Expenses, Payroll, Invoices, & Assets)" },
  { p: "Page 7", title: "Employee Role Flowchart - Part I (Auth, Dashboards, Clocking, & Leaves)" },
  { p: "Page 8", title: "Employee Role Flowchart - Part II (Sprints, Travel, Appraisals, & Helpdesk)" },
  { p: "Page 9", title: "Relational Architecture Matrix & Comprehensive Package Schema Mapping" }
];

let yIdx = 53;
tocItems.forEach(item => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(colors.primary);
  doc.text(item.p, 15, yIdx);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(colors.dark);
  doc.text(`—  ${item.title}`, 30, yIdx);
  yIdx += 8;
});

// Legend Guide Block
doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(colors.dark);
doc.text("FLOWCHART COLOR LEGEND & PIPELINE DIRECTIONS", 150, 45);

// Draw Legend Cards
const legendCards = [
  { name: "ROLE / SYSTEM INITIATOR", desc: "User triggers actions (credentials entry, form submissions) inside their specific account scope.", bg: colors.roleBg, border: colors.roleBorder, text: colors.roleText, x: 150, y: 52 },
  { name: "FRONTEND CLIENT VIEW", desc: "The React/Vite dashboard client UI routes, pages, and modular layouts accessed by users.", bg: colors.frontBg, border: colors.frontBorder, text: colors.frontText, x: 150, y: 70 },
  { name: "BACKEND API CONTROLLER", desc: "The Java Spring Boot REST controllers mapping the incoming JSON requests and executing validations.", bg: colors.backBg, border: colors.backBorder, text: colors.backText, x: 150, y: 88 },
  { name: "DATABASE RELATIONAL ENTITY", desc: "MySQL / TiDB tables storing transactional ledgers, organization mappings, logs, and rosters.", bg: colors.dbBg, border: colors.dbBorder, text: colors.dbText, x: 150, y: 106 }
];

legendCards.forEach(c => {
  doc.setFillColor(c.bg);
  doc.setDrawColor(c.border);
  doc.setLineWidth(0.4);
  doc.roundedRect(c.x, c.y, 45, 14, 1.5, 1.5, "FD");
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(c.text);
  doc.text(c.name, c.x + 3, c.y + 4.5);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(6.8);
  const splitText = doc.splitTextToSize(c.desc, 80);
  doc.text(splitText, c.x + 50, c.y + 4.5);
});

// Instructions note
doc.setFillColor(colors.lightGray);
doc.rect(15, 155, 267, 28, "F");
doc.setDrawColor(colors.border);
doc.rect(15, 155, 267, 28, "S");
doc.setFont("Helvetica", "bold");
doc.setFontSize(8.5);
doc.setTextColor(colors.dark);
doc.text("DOCUMENT READ INSTRUCTIONS:", 18, 161);
doc.setFont("Helvetica", "normal");
doc.setFontSize(8);
doc.setTextColor(colors.gray);
doc.text("1. All flowcharts are mapped horizontally from Left to Right: User Context -> Frontend Client View -> Spring Boot REST Controller -> Relational Database Table.", 18, 167);
doc.text("2. Connections indicate REST API operations (GET, POST, PUT, DELETE) and events dispatched to Kafka topics.", 18, 172);
doc.text("3. Every controller class from the `com.zenelait.hrms.controller` Java package is accounted for in the flow diagrams.", 18, 177);

drawPageTemplate(2, "Table of Contents & Legend");


// ==========================================
// PAGE 3: SUPER ADMIN FLOWCHART
// ==========================================
doc.addPage();
drawSectionHeader("SUPER ADMIN WORKFLOW FLOWCHART", "SYSTEM-LEVEL TENANT PROVISIONING AND CORE AUDIT LEDGER MATRIX");
drawColumnLabels(38);

// Flow Grid Coordinates:
// Col 1: X: 15, W: 55  (Center X: 42.5)
// Col 2: X: 82, W: 55  (Center X: 109.5)
// Col 3: X: 149, W: 55 (Center X: 176.5)
// Col 4: X: 216, W: 66 (Center X: 249)
// Row 1 Y: 48, Row 2 Y: 85, Row 3 Y: 122, Row 4 Y: 159. H: 28

let rY1 = 48, rY2 = 85, rY3 = 122, rY4 = 159;
let nW1 = 55, nW2 = 55, nW3 = 55, nW4 = 66, nH = 28;

// Row 1: Super Admin Login / Authentication (AuthController)
drawFlowNode(doc, "SA-1: Auth Gateway", "Superadmin accesses special terminal portal, entering security admin keys.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /login/superadmin", "Renders specialized system-level credential inputs and captcha gateway.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "AuthController.java", "POST /api/auth/login\nVerifies root passwords & returns high-security JWT Bearer context token.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: User.java", "Table: `users`\nChecks password hashes and scans `role = 'SUPERADMIN'` flag parameters.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Tenant Provisioning (SuperAdminController)
drawFlowNode(doc, "SA-2: Provision Tenant", "Superadmin creates a new tenant organization profile and HR Admin account.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /superadmin/orgs", "Dashboard console showing tenant details, active statuses, and billing configurations.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "SuperAdminController.java", "POST /api/superadmin/organization\nGenerates random Org Code and maps primary billing details.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Organization.java", "Table: `organizations`\nStores newly created tenant record along with standard 6-digit access OTP codes.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Security & Subscription Plan Tuning (RolePermissionController)
drawFlowNode(doc, "SA-3: Tier Tuning", "Superadmin updates subscription plans or alters access filters.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /superadmin/billing", "Subscription details manager. Configures tiers: Standard, Mid-Level, Enterprise.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "RolePermissionController.java", "PUT /api/permissions/{role}/matrix\nAlters standard user role actions and overrides active tenant configurations.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: SubscriptionPlan.java", "Table: `subscription_plans` / `role_permissions` \nUpdates system locks and unlocks custom modules.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: System Operations & Audit (SystemOperationController)
drawFlowNode(doc, "SA-4: System Health", "Superadmin audits background system activity logs & connection configurations.", 15, rY4, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /superadmin/health", "Live visualization of CPU parameters, Redis caches, and active Kafka streams.", 82, rY4, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "SystemOperationController.java", "GET /api/system/operations/metrics\nFetches operational status, cache sizes, and thread pools.", 149, rY4, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: RoleAuditLog.java", "Table: `role_audit_logs` / Kafka Log\nAppends transaction tracing events to Kafka queue & audit database logs.", 216, rY4, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY4 + nH/2, 82, rY4 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY4 + nH/2, 149, rY4 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY4 + nH/2, 216, rY4 + nH/2, colors.backBorder);

drawPageTemplate(3, "Super Admin Control Flows");


// ==========================================
// PAGE 4: HR ADMIN FLOWCHART - PART I
// ==========================================
doc.addPage();
drawSectionHeader("HR ADMIN WORKFLOW FLOWCHART - PART I", "ONBOARDING LOGISTICS, EMPLOYEE ROSTERS, AND CANDIDATE PIPELINES");
drawColumnLabels(38);

// Row 1: Tenant Gateway Unlock & Admin Login (AuthController)
drawFlowNode(doc, "HRA-1: Login Gateway", "HR Admin logs in using the verified Organization code & credentials.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /login/admin", "Verification screen. Resolves Org configuration from localStorage.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "AuthController.java", "POST /api/auth/login\nValidates Admin profile mapping and checks organizational constraints.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: User.java", "Table: `users` & `organizations`\nVerifies user profile mapped with `role = 'ADMIN'` coordinates.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Roster & Team Setup (TeamController)
drawFlowNode(doc, "HRA-2: Setup Roster", "Admin registers employees and maps team departments/squads.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/roster", "Roster editor. Add new profiles, modify departments, assign squads.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "TeamController.java", "POST /api/teams/squad-membership\nBinds employee records to departments & sets reporting structures.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Department.java", "Table: `departments`, `squads`\nStores departmental rosters and organizational structures.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Onboarding Checklist Tasks (OnboardingController)
drawFlowNode(doc, "HRA-3: Setup Onboarding", "Admin assigns onboarding tasks and tracks new hire progress.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/onboarding", "Interactive tasks manager. Tracks completion statuses of new employees.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "OnboardingController.java", "POST /api/onboarding/tasks\nCreates required credentials checklist tasks for onboarding profiles.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: OnboardingTask.java", "Table: `onboarding_tasks`\nMaintains verification status of assigned workspace tasks.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: Recruitment & Candidate Pipelines (RecruitmentController)
drawFlowNode(doc, "HRA-4: Manage Jobs", "Admin designs job requisitions and audits candidate profiles.", 15, rY4, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/recruitment", "Job portal pipeline monitor. Shows candidates grouped by recruitment stages.", 82, rY4, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "RecruitmentController.java", "GET /api/recruitment/candidates\nQueries active requisitions and pushes candidates to next stage.", 149, rY4, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: JobRequisition.java", "Table: `job_requisitions` & `candidates`\nStores job parameters and logs candidate profile details.", 216, rY4, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY4 + nH/2, 82, rY4 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY4 + nH/2, 149, rY4 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY4 + nH/2, 216, rY4 + nH/2, colors.backBorder);

drawPageTemplate(4, "HR Admin: Core Directory Flows");


// ==========================================
// PAGE 5: HR ADMIN FLOWCHART - PART II
// ==========================================
doc.addPage();
drawSectionHeader("HR ADMIN WORKFLOW FLOWCHART - PART II", "WORKFORCE TIMEKEEPING, LEAVE APPROVALS, AND SPRINTS / PROJECTS");
drawColumnLabels(38);

// Row 1: Attendance Ledger Auditing (AttendanceController & TimesheetController)
drawFlowNode(doc, "HRA-5: Audit Timesheets", "Admin monitors daily attendance logs and approves timesheet submissions.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/attendance", "Comprehensive ledger overview. Visualizes clock logs and timesheets.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "AttendanceController.java", "GET /api/attendance/summary\nRetrieves work logs, total hours, clock discrepancies and reports.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Attendance.java", "Table: `attendances` & `timesheets`\nPersists clock-in/out timestamps and monthly status flags.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Leave Request Approvals (LeaveRequestController)
drawFlowNode(doc, "HRA-6: Approve Leaves", "Admin reviews pending leave claims, balances, and overlapping requests.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/leaves", "Decision dashboard. Click buttons to approve or reject leave requests.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "LeaveRequestController.java", "PUT /api/leaves/{id}/approve\nRuns compliance logic, updates leave balances, and notifies claimant.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: LeaveRequest.java", "Table: `leave_requests`\nUpdates status values (APPROVED, REJECTED) and logs comments.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Project Portfolio Allocation (ProjectController)
drawFlowNode(doc, "HRA-7: Assign Projects", "Admin creates client portfolios, assigns squad leads, and tracks milestones.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/projects", "Project grid listing team allocations, target release, and Gantt charts.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "ProjectController.java", "POST /api/projects\nSaves project settings and assigns a budget code mapping details.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Project.java", "Table: `projects`\nStores project codes, descriptions, budgets, and status structures.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: Scrum Sprint Velocities & Worklogs (SprintController & WorkLogController)
drawFlowNode(doc, "HRA-8: Track Sprints", "Admin creates sprints, assigns ticket backlogs, and checks worklogs.", 15, rY4, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/sprints", "Sprint task board containing columns: To-Do, In-Progress, QA, Closed.", 82, rY4, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "SprintController.java", "POST /api/sprints\nCreates a new sprint cycle and fetches aggregated sprint ticket hours.", 149, rY4, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Sprint.java", "Table: `sprints` & `work_logs`\nPersists sprint deadlines and registers completed work hour logs.", 216, rY4, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY4 + nH/2, 82, rY4 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY4 + nH/2, 149, rY4 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY4 + nH/2, 216, rY4 + nH/2, colors.backBorder);

drawPageTemplate(5, "HR Admin: Time & Operations");


// ==========================================
// PAGE 6: HR ADMIN FLOWCHART - PART III
// ==========================================
doc.addPage();
drawSectionHeader("HR ADMIN WORKFLOW FLOWCHART - PART III", "EXPENSE LEDGERS, ENTERPRISE PAYROLL, INVOICING, AND HELP TICKET AUDITS");
drawColumnLabels(38);

// Row 1: Expense Claims & Travel Auditing (ExpenseController & TravelController)
drawFlowNode(doc, "HRA-9: Audit Expenses", "Admin audits travel requests, verifies receipts, and approves claims.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/expenses", "Expense review screen. Displays receipts and expense breakdown metrics.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "ExpenseController.java", "PUT /api/expenses/{id}/status\nApproves claim and schedules payment in organization financial ledgers.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: ExpenseClaim.java", "Table: `expense_claims`, `travel_requests`\nUpdates status and maps transaction details to budgeting tables.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Payroll Processing & Wage Vouchers (PayrollController)
drawFlowNode(doc, "HRA-10: Run Payroll", "Admin processes monthly employee payrolls and publishes wage vouchers.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/payroll", "Payroll matrix dashboard. Calculates tax deductions and net payouts.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "PayrollController.java", "POST /api/payroll/calculate\nRuns tax calculations and formats wage voucher details into printable files.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Payroll.java", "Table: `payrolls`\nStores salary breakdowns, deductions, and payment status parameters.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Invoice Management & Receivables (InvoiceController)
drawFlowNode(doc, "HRA-11: Manage Invoices", "Admin drafts client billing invoices and monitors outstanding balances.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/invoices", "Invoice builder interface. Send invoices, track receipts, set terms.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "InvoiceController.java", "POST /api/invoices\nGenerates custom invoice codes and updates account receivables.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Invoice.java", "Table: `invoices`\nMaintains invoice details, pricing structures, and status parameters.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: Corporate Assets & Support Helpdesks (AssetController & TicketController)
drawFlowNode(doc, "HRA-12: Asset Helpdesk", "Admin tracks hardware inventory assets and resolves employee tickets.", 15, rY4, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /admin/helpdesk", "Ticketing console. Assign tickets to IT squads, adjust inventory items.", 82, rY4, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "TicketController.java", "PUT /api/tickets/{id}/assign\nAssigns ticket owner and sends notifications about asset status changes.", 149, rY4, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Asset.java", "Table: `assets` & `tickets`\nTracks hardware allocations and logs details of submitted IT tickets.", 216, rY4, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY4 + nH/2, 82, rY4 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY4 + nH/2, 149, rY4 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY4 + nH/2, 216, rY4 + nH/2, colors.backBorder);

drawPageTemplate(6, "HR Admin: Finance & Assets");


// ==========================================
// PAGE 7: EMPLOYEE FLOWCHART - PART I
// ==========================================
doc.addPage();
drawSectionHeader("EMPLOYEE WORKFLOW FLOWCHART - PART I", "PORTAL LOCK BYPASS, PERSONAL DASHBOARDS, WORKCLOCK LOGS, AND LEAVE APPLICATIONS");
drawColumnLabels(38);

// Row 1: Access Portal Unlock & Employee Login (AuthController)
drawFlowNode(doc, "EMP-1: Portal Access", "Employee accesses portal, enters organization verification and logins.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /login/employee", "Gateway verification screen. Sets tenant environment details.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "AuthController.java", "POST /api/auth/login\nVerifies employee password credentials and generates access token.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: User.java", "Table: `users`\nChecks password hash and validates the `role = 'EMPLOYEE'` parameters.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Self-Service Onboarding Checklist & Profile (OnboardingController & DashboardController)
drawFlowNode(doc, "EMP-2: Core Profile", "Employee completes onboarding checklist tasks and views dashboard status.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /profile / dashboard", "Onboarding checklist wizard UI and metrics overview charts.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "OnboardingController.java", "PUT /api/onboarding/tasks/{id}/complete\nUpdates employee checklist item progress and verifies documents.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: OnboardingTask.java", "Table: `onboarding_tasks`\nUpdates completion status value to TRUE for the profile task record.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Daily Clock-In/Out & Timesheets (AttendanceController & TimesheetController)
drawFlowNode(doc, "EMP-3: Clock In/Out", "Employee triggers clock status changes or logs monthly timesheet hours.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /attendance", "Interactive clock widgets with daily registers and calendar grids.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "AttendanceController.java", "POST /api/attendance/clock-in\nRegisters current timestamp coordinates, IP address, and status.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Attendance.java", "Table: `attendances` & `timesheets`\nCreates new clock record for the user containing exact GPS metadata.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: Leave Requests & Balance Checks (LeaveRequestController)
drawFlowNode(doc, "EMP-4: File Leave", "Employee requests time off, specifying leave category and duration details.", 15, rY4, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /leaves", "Leave planner dashboard. Displays active balances and request lists.", 82, rY4, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "LeaveRequestController.java", "POST /api/leaves\nValidates that requested days do not exceed available balance values.", 149, rY4, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: LeaveRequest.java", "Table: `leave_requests`\nInserts new leave row initialized with status set to PENDING.", 216, rY4, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY4 + nH/2, 82, rY4 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY4 + nH/2, 149, rY4 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY4 + nH/2, 216, rY4 + nH/2, colors.backBorder);

drawPageTemplate(7, "Employee: Core Self-Service");


// ==========================================
// PAGE 8: EMPLOYEE FLOWCHART - PART II
// ==========================================
doc.addPage();
drawSectionHeader("EMPLOYEE WORKFLOW FLOWCHART - PART II", "SPRINT TICKETS, TRAVEL CLAIMS, KPI PERFORMANCE, HELPDESK TICKETS, AND TRAINING");
drawColumnLabels(38);

// Row 1: Scrum Sprints & Worklogs (SprintController & WorkLogController)
drawFlowNode(doc, "EMP-5: Work Logs", "Employee logs work hours on sprint tasks and updates ticket status.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /sprints", "Sprint task interface showing current assignee details and ticket cards.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "WorkLogController.java", "POST /api/work-logs\nSubmits completed work log hours against selected ticket reference.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: WorkLog.java", "Table: `work_logs`\nAppends task duration details and updates ticket progress parameters.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Expense Claims & Travel Requests (ExpenseController & TravelController)
drawFlowNode(doc, "EMP-6: Claim Expense", "Employee files reimbursement claim and uploads supporting expense receipts.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /expenses / travel", "Claim submission forms featuring secure file attachment selectors.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "ExpenseController.java", "POST /api/expenses\nSaves claim metadata details and assigns a unique claim number tracking ID.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: ExpenseClaim.java", "Table: `expense_claims` & `travel_requests`\nStores invoice totals, receipt links, and default status code variables.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Performance Reviews & Self-Appraisals (PerformanceController)
drawFlowNode(doc, "EMP-7: Appraisals", "Employee completes self-appraisal form and reviews KPI ratings.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /performance", "Review dashboard UI displays scores, manager notes, and goals.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "PerformanceController.java", "POST /api/performance/self-appraisal\nRegisters employee self-rating scores and feedback comments.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: PerformanceReview.java", "Table: `performance_reviews`\nStores appraisal answers, overall scoring levels, and target goals.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: Support Ticket Request (HelpdeskController)
drawFlowNode(doc, "EMP-8: Submit Ticket", "Employee submits IT support tickets or requests equipment assets.", 15, rY4, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /helpdesk", "Ticket submission form containing issue priority selections.", 82, rY4, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "HelpdeskController.java", "POST /api/helpdesk/tickets\nCreates support ticket record and sends notification alerts to IT teams.", 149, rY4, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: HelpdeskTicket.java", "Table: `helpdesk_tickets`\nStores ticket tags, priority mappings, and status log histories.", 216, rY4, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY4 + nH/2, 82, rY4 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY4 + nH/2, 149, rY4 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY4 + nH/2, 216, rY4 + nH/2, colors.backBorder);

drawPageTemplate(8, "Employee: Tasks & Tickets");


// ==========================================
// PAGE 9: REMAINING UTILITIES & MAPS
// ==========================================
doc.addPage();
drawSectionHeader("REMAINING PACKAGES & ARCHITECTURE MATRIX", "LEARNING SYNC, EXIT LOGISTICS, ANNOUNCEMENTS, AND SYSTEM WIDE DATA PATHS");

// Columns labels for remaining items
drawColumnLabels(38);

// Row 1: Learning System (LearningController)
drawFlowNode(doc, "EMP-9: Training Portal", "Employee takes active training modules and records course progress.", 15, rY1, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /learning", "Training catalog layout. Select courses, complete units, review cards.", 82, rY1, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "LearningController.java", "PUT /api/learning/progress\nUpdates progress metrics, logs unit checks, and updates scores.", 149, rY1, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Course.java", "Table: `courses` & `course_progress`\nRegisters completed modules, timestamps, and certification states.", 216, rY1, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY1 + nH/2, 82, rY1 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY1 + nH/2, 149, rY1 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY1 + nH/2, 216, rY1 + nH/2, colors.backBorder);

// Row 2: Exit Logistics (ExitController)
drawFlowNode(doc, "EMP-10: Exit Request", "Employee submits resignation or Admin schedules exit checklist.", 15, rY2, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /exit", "Checklist dashboard tracking exit clearance, assets return status.", 82, rY2, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "ExitController.java", "POST /api/exits/request\nTriggers offboarding workflow and updates system assets registry.", 149, rY2, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: ExitRequest.java", "Table: `exit_requests`\nMaintains exit status parameters, comments, and task checklists.", 216, rY2, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY2 + nH/2, 82, rY2 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY2 + nH/2, 149, rY2 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY2 + nH/2, 216, rY2 + nH/2, colors.backBorder);

// Row 3: Corporate Announcements (AnnouncementController)
drawFlowNode(doc, "EMP-11: Corporate News", "User reads corporate-wide announcements and notifications.", 15, rY3, nW1, nH, colors.roleBg, colors.roleBorder, colors.roleText);
drawFlowNode(doc, "Route: /dashboard / news", "News carousel and announcement alerts overlay panels.", 82, rY3, nW2, nH, colors.frontBg, colors.frontBorder, colors.frontText);
drawFlowNode(doc, "AnnouncementController.java", "GET /api/announcements\nQueries system announcements matching user department permissions.", 149, rY3, nW3, nH, colors.backBg, colors.backBorder, colors.backText);
drawFlowNode(doc, "Entity: Announcement.java", "Table: `announcements` & `notifications`\nStores corporate notifications, expiration dates, and priority flags.", 216, rY3, nW4, nH, colors.dbBg, colors.dbBorder, colors.dbText);

drawConnector(doc, 15 + nW1, rY3 + nH/2, 82, rY3 + nH/2, colors.roleBorder);
drawConnector(doc, 82 + nW2, rY3 + nH/2, 149, rY3 + nH/2, colors.frontBorder);
drawConnector(doc, 149 + nW3, rY3 + nH/2, 216, rY3 + nH/2, colors.backBorder);

// Row 4: Relational Security & Organization Boundary checks (Visual Summary block)
doc.setFillColor(colors.lightGray);
doc.rect(15, rY4, 267, nH, "F");
doc.setDrawColor(colors.border);
doc.rect(15, rY4, 267, nH, "S");
doc.setFont("Helvetica", "bold");
doc.setFontSize(8.5);
doc.setTextColor(colors.dark);
doc.text("CORE RELATIONAL SYSTEM CONSTRAINTS:", 18, rY4 + 6);
doc.setFont("Helvetica", "normal");
doc.setFontSize(7.5);
doc.setTextColor(colors.gray);
doc.text("• Tenant Isolation: Every database transaction queries where `organization_id = {user.org.id}` matching credentials.", 18, rY4 + 12);
doc.text("• Asynchronous Event Brokerage: System operations audit events are sent to Kafka topics asynchronously, avoiding database lock delays.", 18, rY4 + 18);
doc.text("• Redis Cache Synchronization: User session permission matrices are stored in memory and cleared on password resets or profile updates.", 18, rY4 + 24);

drawPageTemplate(9, "Remaining Utilities & Maps");


// ==========================================
// RENDER & SAVE TO public/role-workflows-flowchart.pdf
// ==========================================
const buffer = doc.output("arraybuffer");
fs.writeFileSync("public/role-workflows-flowchart.pdf", Buffer.from(buffer));
console.log("SUCCESS: public/role-workflows-flowchart.pdf generated successfully!");
