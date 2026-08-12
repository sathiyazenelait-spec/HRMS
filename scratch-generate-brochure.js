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
  doc.text("Zenelait HRMS Enterprise Reference Manual", 15, 281);
  
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(accentColor);
  doc.text(`Page ${pageNum} of 5`, 175, 281);
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

// Horizontal line
doc.setDrawColor("#e2e8f0");
doc.setLineWidth(0.3);
doc.line(15, 135, 195, 135);

// Two columns at the bottom
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

// Footer details page 1
doc.setFontSize(8);
doc.text("v2.5 Enterprise Edition", 15, 255);
doc.text("© 2026 Zenelait InfoTech Pvt. Ltd.", 145, 255);
drawPageTemplate(1, "Cover Page");

// ==========================================
// PAGE 2: TABLE OF CONTENTS
// ==========================================
doc.addPage();
doc.setFont("Helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(darkColor);
doc.text("TABLE OF CONTENTS", 15, 30);
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("DOCUMENT NAVIGATION INDEX", 15, 35);

doc.setFont("Helvetica", "normal");
doc.setFontSize(10);
doc.text("Detailed page distribution index mapping all sections and roles within the Zenelait HRMS ecosystem:", 15, 45);

const tocItems = [
  { index: "1. System Architecture & Multi-Tenant Databases", page: "Page 3" },
  { index: "2. Landing Page, OTP Gateway & Access Controls", page: "Page 3" },
  { index: "3. Super Admin Portal (Tenant Configurations & Health)", page: "Page 4" },
  { index: "4. Subscription Tier System (Modular Control & Active Plans)", page: "Page 4" },
  { index: "5. HR Admin Portal (Directories, Recruitment & Appraisals)", page: "Page 5" },
  { index: "6. Expense Ledger (Reimbursements & Printable PDF Vouchers)", page: "Page 5" },
  { index: "7. Attendance & Worklog Tracker (Timekeeping & Task Logs)", page: "Page 5" }
];

let yPos = 58;
tocItems.forEach((item) => {
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(darkColor);
  doc.text(item.index, 15, yPos);
  
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(accentColor);
  doc.text(item.page, 175, yPos);
  
  // Dotted line separator
  doc.setDrawColor("#cbd5e1");
  doc.setLineWidth(0.25);
  doc.line(15, yPos + 3, 195, yPos + 3);
  
  yPos += 14;
});

// Security note callout box
doc.setFillColor(lightGray);
doc.rect(15, 170, 180, 25, "F");
doc.setDrawColor(accentColor);
doc.setLineWidth(1.2);
doc.line(15, 170, 15, 195);

doc.setFont("Helvetica", "italic");
doc.setFontSize(8.5);
doc.setTextColor(darkColor);
doc.text("Security Note: User role configurations are validated dynamically at database query compile-time.", 20, 180);
doc.text("Any role modification requests are routed via Spring Security filters and strict JPA constraint guards.", 20, 185);

drawPageTemplate(2, "Table of Contents");

// ==========================================
// PAGE 3: SYSTEM ARCHITECTURE
// ==========================================
doc.addPage();
doc.setFont("Helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(darkColor);
doc.text("SYSTEM ARCHITECTURE", 15, 30);
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("BACKEND REST APIS, FRONTEND ROUTING, AND AUDIT PIPELINES", 15, 35);

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Zenelait HRMS employs a highly scalable, decoupled client-server architecture model. The client-side dashboard", 15, 45);
doc.text("runs on Next.js 14 / Vite, connecting to a multi-threaded Java Spring Boot 3 enterprise backend and a high-performance", 15, 50);
doc.text("MySQL/TiDB Cloud relational storage.", 15, 55);

// Technical Stack Table
doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(darkColor);
doc.text("TECHNICAL STACK DETAILS", 15, 68);

// Table Header
doc.setFillColor("#1e293b"); // Dark slate
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

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(darkColor);
doc.text("SECURITY FILTER CHAIN & DECOUPLING", 15, 142);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("All network interactions use JSON-encoded requests. Spring Security handles endpoint protection, verifying signature", 15, 148);
doc.text("validation keys encoded in client-header HTTP bearer authentication tokens on every dispatch.", 15, 153);
doc.text("The backend employs database connection pools (HikariCP) to interact with relational schemas, ensuring fast", 15, 160);
doc.text("transactional speeds during high-concurrency workforce attendance logging.", 15, 165);

drawPageTemplate(3, "System Architecture");

// ==========================================
// PAGE 4: SUBSCRIPTION TIER SYSTEM
// ==========================================
doc.addPage();
doc.setFont("Helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(darkColor);
doc.text("SUBSCRIPTION TIERS", 15, 30);
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("MODULAR CONTROL AND PRICING PLAN MAPPINGS", 15, 35);

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("To provide flexible enterprise SaaS packages, Zenelait HRMS employs an active subscription mapping engine.", 15, 45);
doc.text("The modules, dashboards, and role dropdowns rendered on login screens are toggled dynamically based on the", 15, 50);
doc.text("tenant organization's active subscription tier.", 15, 55);

// Tiers Mappings
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
  
  // Wrap and print description
  const splitText = doc.splitTextToSize(plan.desc, 130);
  doc.text(splitText, 60, planY + 5);
  
  planY += 22;
});

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(darkColor);
doc.text("DATABASE CONFIGURATION & VERIFICATION", 15, 145);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.text("The `organizations` table stores subscription levels under the `plan_type` column (STANDARD, MIDLEVEL, ENTERPRISE).", 15, 151);
doc.text("When a user authenticates, the handler queries `GET /api/superadmin/organizations` to fetch their tenant context,", 15, 156);
doc.text("parsing the subscription plan type to dynamically configure permission matrices on the frontend client.", 15, 161);

drawPageTemplate(4, "Subscription Tiers");

// ==========================================
// PAGE 5: ROLE MAPPINGS & LEADERSHIP ROLES
// ==========================================
doc.addPage();
doc.setFont("Helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(darkColor);
doc.text("ROLE-BASED ACCESS", 15, 30);
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("ROLE MAPPING MATRIX AND PERMISSIONS CONTROL", 15, 35);

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("Zenelait HRMS provides strict role-based access control (RBAC) to ensure multi-tenant security isolation. Users", 15, 45);
doc.text("are assigned to one of three primary system roles, each unlocking a dedicated set of system controls:", 15, 50);

const roles = [
  { role: "SUPERADMIN", desc: "Accesses the platform console. Creates tenant organizations, configures active modules, assigns subscription plan tiers, and provisions primary HR Administrator accounts. Bypasses standard organization scope limits." },
  { role: "ADMIN (HR MANAGER)", desc: "Manages the organization roster. Approves or rejects leave requests, schedules project sprints and backlogs, uploads client invoices, processes employee payroll, and updates individual employee matrix keys." },
  { role: "EMPLOYEE (TENANT STAFF)", desc: "Maintains attendance clocks, logs timesheets against active projects, files reimbursement expense claims, uploads receipts, and downloads certified PDF payment vouchers." }
];

let roleY = 65;
roles.forEach((role) => {
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(darkColor);
  doc.text(role.role, 15, roleY);
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(grayColor);
  
  const splitText = doc.splitTextToSize(role.desc, 175);
  doc.text(splitText, 15, roleY + 5);
  
  roleY += 25;
});

// Final callout line
doc.setDrawColor(primaryColor);
doc.setLineWidth(0.5);
doc.line(15, 155, 195, 155);

doc.setFont("Helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(primaryColor);
doc.text("Zenelait HRMS - Secure. Compliant. Scalable.", 15, 163);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Enterprise software architecture engineered to optimize modern corporate workforce networks.", 15, 169);

drawPageTemplate(5, "Role Mappings");

// Save document
const buffer = doc.output("arraybuffer");
fs.writeFileSync("public/hrms-brochure.pdf", Buffer.from(buffer));
console.log("SUCCESS: public/hrms-brochure.pdf compiled successfully!");
