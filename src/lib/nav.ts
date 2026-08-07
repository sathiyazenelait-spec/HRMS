import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Clock,
  CalendarDays,
  Wallet,
  Target,
  GraduationCap,
  Laptop,
  FolderKanban,
  Building2,
  Rocket,
  ListTodo,
  Ticket,
  NotebookPen,
  GaugeCircle,
  Timer,
  Receipt,
  Plane,
  Megaphone,
  LifeBuoy,
  DoorOpen,
  BarChart3,
  UserCircle,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  desc: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, desc: "Company-wide KPIs, charts and activity." },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Employees", url: "/employees", icon: Users, desc: "Personal, contact, employment, bank and documents." },
      { title: "Recruitment", url: "/recruitment", icon: UserPlus, desc: "Requisitions, postings, candidates, interviews, offers." },
      { title: "Onboarding", url: "/onboarding", icon: ClipboardList, desc: "Documents, accounts, assets, payroll setup." },
      { title: "Attendance", url: "/attendance", icon: Clock, desc: "Biometric, face, GPS, QR, shifts, overtime, holidays." },
      { title: "Leave", url: "/leave", icon: CalendarDays, desc: "CL, SL, EL, WFH, comp-off, LOP with approvals." },
      { title: "Payroll", url: "/payroll", icon: Wallet, desc: "Earnings, deductions, payslips, tax, bonuses." },
      { title: "Performance", url: "/performance", icon: Target, desc: "KPI/KRA, reviews, goals, composite scores." },
      { title: "Learning", url: "/learning", icon: GraduationCap, desc: "Courses, exams, certifications." },
      { title: "Assets", url: "/assets", icon: Laptop, desc: "Assign, maintain and return company assets." },
    ],
  },
  {
    label: "Delivery",
    items: [
      { title: "Projects", url: "/projects", icon: FolderKanban, desc: "Projects, budgets, teams, managers." },
      { title: "Teams", url: "/teams", icon: Building2, desc: "Departments, skills, resource allocation." },
      { title: "Sprints", url: "/sprints", icon: Rocket, desc: "Create sprints, goals, dates, status." },
      { title: "Backlog", url: "/backlog", icon: ListTodo, desc: "Epics, stories, bugs, improvements." },
      { title: "Tickets", url: "/tickets", icon: Ticket, desc: "Backlog → To Do → In Progress → Review → QA → Done." },
      { title: "Work Log", url: "/worklog", icon: NotebookPen, desc: "Daily work, hours, blockers." },
      { title: "Sprint Dashboard", url: "/sprint-dashboard", icon: GaugeCircle, desc: "Velocity, burndown, workload, completion." },
      { title: "Timesheets", url: "/timesheets", icon: Timer, desc: "Daily, weekly, monthly billable hours." },
    ],
  },
  {
    label: "Workplace",
    items: [
      { title: "Expenses", url: "/expenses", icon: Receipt, desc: "Travel, food, hotel claims and approvals." },
      { title: "Travel", url: "/travel", icon: Plane, desc: "Requests, booking, settlement." },
      { title: "Announcements", url: "/announcements", icon: Megaphone, desc: "News, events, company holidays." },
      { title: "Help Desk", url: "/helpdesk", icon: LifeBuoy, desc: "HR, IT and Finance support tickets." },
      { title: "Exit", url: "/exit", icon: DoorOpen, desc: "Resignation, clearance, full & final settlement." },
    ],
  },
  {
    label: "Insights & Admin",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3, desc: "Attendance, payroll, recruitment, projects, sprints." },
      { title: "Self-Service", url: "/self-service", icon: UserCircle, desc: "Profile, leave, payslips, attendance, tasks." },
      { title: "Admin", url: "/admin", icon: Settings, desc: "Settings, roles, holidays, workflows, integrations." },
      { title: "Roles & Access", url: "/rbac", icon: ShieldCheck, desc: "Super Admin, HR, Finance, PM, TL, Employee, IT, QA." },
    ],
  },
];

export const flatNav: NavItem[] = navGroups.flatMap((g) => g.items);