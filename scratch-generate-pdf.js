import { jsPDF } from "jspdf";
import fs from "fs";

// Create PDF document
const doc = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4"
});

// Setup styles
const primaryColor = "#4f46e5"; // Indigo
const darkColor = "#0f172a"; // Slate-900
const grayColor = "#64748b"; // Slate-500

// Title Header
doc.setFont("Helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(darkColor);
doc.text("Zenelait HRMS - Voucher Documentation", 15, 25);

doc.setFont("Helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(grayColor);
doc.text("Official API Specifications & Role Permissions Matrix Report", 15, 31);

// Horizontal separator line
doc.setDrawColor(primaryColor);
doc.setLineWidth(0.8);
doc.line(15, 36, 195, 36);

// Roles Matrix Section
doc.setFont("Helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(darkColor);
doc.text("1. Role-Based Access Matrix", 15, 48);

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.text("Superadmin (System Administrator):", 15, 56);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(darkColor);
doc.text("- Provision tenant organizations and assign active configurations.", 20, 62);
doc.text("- Provision primary HR Admin accounts for tenants.", 20, 67);
doc.text("- Edit subscription plans and bypass registration locks.", 20, 72);

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.text("HR Admin (Tenant Administrator):", 15, 82);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("- Review, audit, approve or reject pending employee reimbursement requests.", 20, 88);
doc.text("- Provision employee accounts and assign role-based permissions (RBAC).", 20, 93);
doc.text("- Execute payroll payouts and clear expense claims.", 20, 98);

doc.setFont("Helvetica", "bold");
doc.setFontSize(11);
doc.text("Employee (Tenant Staff):", 15, 108);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("- File corporate expense claims, upload receipts, and track audit status.", 20, 114);
doc.text("- Preview, print, or download personal reimbursement vouchers in PDF format.", 20, 119);

// API Specs Section
doc.setFont("Helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(darkColor);
doc.text("2. API Specifications & Endpoints", 15, 134);

doc.setFont("Helvetica", "bold");
doc.setFontSize(10);
doc.text("GET /api/superadmin/hrs", 15, 142);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Description: Fetch list of active HR accounts across all organizations.", 15, 147);

doc.setFont("Helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(darkColor);
doc.text("POST /api/superadmin/hr", 15, 157);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Description: Create a new HR Administrator account for a tenant.", 15, 162);

doc.setFont("Helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(darkColor);
doc.text("PUT /api/superadmin/hr/{id}", 15, 172);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Description: Modify an HR Administrator account coordinates or password.", 15, 177);

doc.setFont("Helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(darkColor);
doc.text("DELETE /api/superadmin/hr/{id}", 15, 187);
doc.setFont("Helvetica", "normal");
doc.setFontSize(9);
doc.setTextColor(grayColor);
doc.text("Description: Permanently delete an HR Administrator profile.", 15, 192);

// Add Page for Visual layout details
doc.addPage();
doc.setFont("Helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(darkColor);
doc.text("3. Interface Layout & Printing Specifications", 15, 25);

doc.setFont("Helvetica", "normal");
doc.setFontSize(9.5);
doc.text("The Expense Voucher modal generates a printable document including:", 15, 33);
doc.text("- Organization Name and specialized serialized code format.", 20, 39);
doc.text("- Printable signature blocks for Employee Claimant, HR Admin, and Signatory.", 20, 44);
doc.text("- Embedded action triggers to prompt system save-to-pdf outputs.", 20, 49);

// Footer Page numbers
const pageCount = doc.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(grayColor);
  doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  doc.text("Zenelait HRMS Internal Document", 15, 285);
}

// Save document
const buffer = doc.output("arraybuffer");
fs.writeFileSync("public/voucher-documentation.pdf", Buffer.from(buffer));
console.log("SUCCESS: public/voucher-documentation.pdf generated successfully!");
