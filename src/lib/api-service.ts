// api-service.ts
// Handles API requests to the Spring Boot backend (http://localhost:8080/api)
// with automatic fallback to localStorage if the backend is down.

export interface LandingPageBlock {
  id: string;
  type: "hero" | "features" | "pricing" | "testimonials";
  title: string;
  subtitle: string;
  ctaText?: string;
  visible: boolean;
  contentList?: string[];
  imageUrl?: string;
}

const defaultLandingPageSchema: LandingPageBlock[] = [
  {
    id: "hero-1",
    type: "hero",
    title: "Zenelait Workforce Network",
    subtitle: "A next-generation HRM system built with virtual threads, Redis caching, and Kafka audit streams for zero load latency.",
    ctaText: "Get Started Now",
    visible: true,
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "features-1",
    type: "features",
    title: "Powerful Enterprise Modules",
    subtitle: "Engineered for heavy concurrency and multi-tenant isolation.",
    visible: true,
    contentList: [
      "Custom Tenant Provisioning (IT, Marketing, Sales, Corporate)",
      "Redis Cache Serialization for high-speed API data fetch",
      "Kafka Messaging Audit for real-time creation logs",
      "Java Virtual Thread-per-task concurrency execution",
    ],
  },
  {
    id: "pricing-1",
    type: "pricing",
    title: "Flexible Subscriptions",
    subtitle: "Select the plan type that matches your company scale.",
    visible: true,
    contentList: [
      "Standard Plan - Up to 150 members, default KPIs",
      "Midlevel Plan - Up to 500 members, advanced tracking",
      "Enterprise Plan - Unlimited members, dedicated cluster support",
    ],
  },
  {
    id: "testimonials-1",
    type: "testimonials",
    title: "Client Feedback",
    subtitle: "Read what organization administrators say about Zenelait.",
    visible: true,
    contentList: [
      "Initech: 'The IT dashboard gives us precise sprint velocity and resource details.'",
      "AdVenture Inc: 'The Marketing dashboard's ROAS tracking completely replaced our spreadsheets.'",
    ],
  },
];

export interface Organization {
  id: number;
  name: string;
  orgType: "IT" | "MARKETING" | "SALES" | "CORPORATE" | "MANUFACTURING";
  orgCode: string;
  ownerGmail: string;
  ownerMobile: string;
  planType: "STANDARD" | "MIDLEVEL" | "ENTERPRISE";
  otpCode: string;
  createdAt?: string;
  workMode?: "TASK_BASED" | "SPRINT_BASED";
  attendanceMode?: "CLOCK_IN_OUT" | "EXCEL_GRID";
  modulesActive?: string;
}

export interface User {
  id?: number;
  username: string;
  gmail: string;
  mobile?: string;
  role: "SUPERADMIN" | "ADMIN" | "EMPLOYEE";
  organization?: Organization | null;
}

export interface Project {
  id?: number;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  owner: string;
  status: "GREEN" | "AMBER" | "RED";
  teamMembers?: string;
  milestones?: string;
  organizationId: number;
}

export interface LeaveRequest {
  id?: number;
  username: string;
  type: string;
  duration: number;
  status: string;
  requestedAt?: string;
  organizationId: number;
}

const BACKEND_URL = "http://localhost:8080/api";

// Initialize Local Mock DB if not present in localStorage
const initializeLocalMockDB = () => {
  if (typeof window === "undefined") return;

  if (!localStorage.getItem("mock_organizations")) {
    const defaultOrgs: Organization[] = [
      {
        id: 1,
        name: "Initech",
        orgType: "IT",
        orgCode: "HRMS202611111",
        ownerGmail: "initech.owner@gmail.com",
        ownerMobile: "9876543210",
        planType: "STANDARD",
        otpCode: "123456",
        workMode: "TASK_BASED",
        attendanceMode: "CLOCK_IN_OUT",
      },
      {
        id: 2,
        name: "AdVenture Inc",
        orgType: "MARKETING",
        orgCode: "HRMS202622222",
        ownerGmail: "adventure.owner@gmail.com",
        ownerMobile: "9876543211",
        planType: "MIDLEVEL",
        otpCode: "654321",
        workMode: "TASK_BASED",
        attendanceMode: "CLOCK_IN_OUT",
      },
      {
        id: 3,
        name: "Zenith Retail",
        orgType: "SALES",
        orgCode: "HRMS202633333",
        ownerGmail: "zenith.owner@gmail.com",
        ownerMobile: "9876543212",
        planType: "ENTERPRISE",
        otpCode: "789012",
        workMode: "TASK_BASED",
        attendanceMode: "CLOCK_IN_OUT",
      },
    ];
    localStorage.setItem("mock_organizations", JSON.stringify(defaultOrgs));
  }

  if (!localStorage.getItem("mock_users")) {
    const defaultUsers = [
      {
        username: "superadmin",
        password: "superadmin123",
        gmail: "superadmin@zenelait.com",
        mobile: "1234567890",
        role: "SUPERADMIN",
        organization: null,
      },
      {
        username: "initech_hr",
        password: "hr123",
        gmail: "hr@initech.com",
        mobile: "9998887776",
        role: "ADMIN",
        organization: {
          id: 1,
          name: "Initech",
          orgType: "IT",
          orgCode: "HRMS202611111",
          ownerGmail: "initech.owner@gmail.com",
          ownerMobile: "9876543210",
          planType: "STANDARD",
          otpCode: "123456",
          workMode: "TASK_BASED",
          attendanceMode: "CLOCK_IN_OUT",
        },
      },
      {
        username: "adventure_hr",
        password: "hr123",
        gmail: "hr@adventure.com",
        mobile: "9998887777",
        role: "ADMIN",
        organization: {
          id: 2,
          name: "AdVenture Inc",
          orgType: "MARKETING",
          orgCode: "HRMS202622222",
          ownerGmail: "adventure.owner@gmail.com",
          ownerMobile: "9876543211",
          planType: "MIDLEVEL",
          otpCode: "654321",
          workMode: "TASK_BASED",
          attendanceMode: "CLOCK_IN_OUT",
        },
      },
    ];
    localStorage.setItem("mock_users", JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem("mock_sprints")) {
    const defaultSprints = [
      { id: "sprint-1", name: "Sprint 1: Core Setup", goal: "Deploy basic platform infrastructure", status: "Completed", orgId: 1, startDate: "2026-07-01", endDate: "2026-07-14" },
      { id: "sprint-2", name: "Sprint 2: Agile Board integration", goal: "Add kanban board and ticket drag-drop", status: "Active", orgId: 1, startDate: "2026-07-15", endDate: "2026-07-28" }
    ];
    localStorage.setItem("mock_sprints", JSON.stringify(defaultSprints));
  }

  if (!localStorage.getItem("mock_tickets")) {
    const defaultTickets = [
      { id: "tick-101", title: "Configure MySQL connection pooling", desc: "Setup HikariCP pool properties in application.yml", points: 3, status: "Done", assignee: "initech_hr", sprintId: "sprint-1", orgId: 1, priority: "High", dueDate: "2026-07-10" },
      { id: "tick-102", title: "Implement swipe attendance Excel grid", desc: "HR editable sheet for bulk attendance entry", points: 5, status: "In Progress", assignee: "test_employee", sprintId: "sprint-2", orgId: 1, priority: "High", dueDate: "2026-07-22" },
      { id: "tick-103", title: "Add client invoice pdf download support", desc: "Simulate client invoice download triggers", points: 8, status: "To Do", assignee: "initech_hr", sprintId: "sprint-2", orgId: 1, priority: "Medium", dueDate: "2026-07-26" }
    ];
    localStorage.setItem("mock_tickets", JSON.stringify(defaultTickets));
  }

  if (!localStorage.getItem("mock_invoices")) {
    const defaultInvoices = [
      { id: "INV-001", client: "Wayne Enterprises", amount: 12500, dueDate: "2026-08-15", status: "Paid", orgId: 1 },
      { id: "INV-002", client: "LexCorp", amount: 34000, dueDate: "2026-09-01", status: "Unpaid", orgId: 1 }
    ];
    localStorage.setItem("mock_invoices", JSON.stringify(defaultInvoices));
  }

  if (!localStorage.getItem("mock_attendance_logs")) {
    const defaultAttendance = [
      { username: "initech_hr", date: "2026-08-01", status: "Present", orgId: 1 },
      { username: "initech_hr", date: "2026-08-02", status: "Present", orgId: 1 },
      { username: "initech_hr", date: "2026-08-03", status: "Present", orgId: 1 },
      { username: "test_employee", date: "2026-08-01", status: "Present", orgId: 1 },
      { username: "test_employee", date: "2026-08-02", status: "Absent", orgId: 1 },
      { username: "test_employee", date: "2026-08-03", status: "Present", orgId: 1 }
    ];
    localStorage.setItem("mock_attendance_logs", JSON.stringify(defaultAttendance));
  }

  if (!localStorage.getItem("mock_payroll")) {
    const defaultPayroll = [
      { username: "test_employee", basic: 4500, allowance: 1200, deductions: 650, status: "Processed", orgId: 1 },
      { username: "initech_hr", basic: 6000, allowance: 1500, deductions: 850, status: "Draft", orgId: 1 }
    ];
    localStorage.setItem("mock_payroll", JSON.stringify(defaultPayroll));
  }

  if (!localStorage.getItem("mock_projects")) {
    const defaultProjects = [
      { id: 1, name: "Cloud Migration", description: "Migrating standard data clusters to AWS instances.", budget: 45000, spent: 12000, owner: "initech_hr", status: "GREEN", teamMembers: "test_employee,initech_hr", milestones: "Charter,Scope,Design", organizationId: 1 },
      { id: 2, name: "Mobile App v2", description: "Upgrading corporate workforce network apps.", budget: 85000, spent: 48000, owner: "initech_hr", status: "AMBER", teamMembers: "test_employee", milestones: "Charter,Design", organizationId: 1 }
    ];
    localStorage.setItem("mock_projects", JSON.stringify(defaultProjects));
  }

  if (!localStorage.getItem("mock_leaves")) {
    const defaultLeaves = [
      { id: 1, username: "initech_hr", type: "Casual Leave", duration: 3, status: "APPROVED", requestedAt: "2026-07-12", organizationId: 1 },
      { id: 2, username: "initech_hr", type: "Sick Leave", duration: 1, status: "APPROVED", requestedAt: "2026-07-20", organizationId: 1 },
      { id: 3, username: "initech_hr", type: "WFH Request", duration: 2, status: "PENDING", requestedAt: "2026-08-02", organizationId: 1 }
    ];
    localStorage.setItem("mock_leaves", JSON.stringify(defaultLeaves));
  }
};

// Safe JSON Parse Helper
const getLocalStorageItem = (key: string): any[] => {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : [];
};

// Initialize the database on startup
if (typeof window !== "undefined") {
  initializeLocalMockDB();
}

export const apiService = {
  // Check active session
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem("hrms_user_session");
    return session ? JSON.parse(session) : null;
  },

  // Perform user login
  async login(username: string, password: string): Promise<User> {
    try {
      // Try hitting the Spring Boot backend
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Invalid credentials");
      }

      const user = await response.json();
      localStorage.setItem("hrms_user_session", JSON.stringify(user));
      return user;

    } catch (e: any) {
      // Offline fallback: Check local mock storage
      console.warn("Backend offline, falling back to local database. Error:", e.message);

      const users = getLocalStorageItem("mock_users");
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (!user) {
        throw new Error("Invalid username or password");
      }

      const userSession: User = {
        username: user.username,
        gmail: user.gmail,
        mobile: user.mobile,
        role: user.role,
        organization: user.organization,
      };

      localStorage.setItem("hrms_user_session", JSON.stringify(userSession));
      return userSession;
    }
  },

  // Perform user logout
  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("hrms_user_session");
  },

  // Register new organization tenant
  async registerUser(requestData: {
    username: string;
    gmail: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    orgName: string;
    orgCode: string;
    otp: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Registration failed");
      }

      const user = await response.json();
      return user;

    } catch (e: any) {
      console.warn("Backend offline, validating registration locally. Error:", e.message);

      const { username, gmail, mobile, password, confirmPassword, orgName, orgCode, otp } = requestData;

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const users = getLocalStorageItem("mock_users");
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error("Username already exists");
      }

      const organizations = getLocalStorageItem("mock_organizations");
      // Find organization by name (case-insensitive)
      const org = organizations.find(
        (o) => o.name.trim().toLowerCase() === orgName.trim().toLowerCase()
      );

      if (!org) {
        throw new Error("Organization name not found");
      }

      if (org.orgCode.toLowerCase() !== orgCode.toLowerCase().trim()) {
        throw new Error("Invalid organization code");
      }

      if (org.otpCode !== otp.trim()) {
        throw new Error("Invalid registration OTP code");
      }

      // Add user to mock database
      const newUser = {
        username,
        gmail,
        mobile,
        password,
        role: "ADMIN",
        organization: org,
      };

      users.push(newUser);
      localStorage.setItem("mock_users", JSON.stringify(users));

      return {
        username,
        gmail,
        mobile,
        role: "ADMIN",
        organization: org,
      };
    }
  },

  // Create an organization (Superadmin workflow)
  async createOrganization(orgData: {
    name: string;
    orgType: string;
    ownerGmail: string;
    ownerMobile: string;
    planType: string;
  }): Promise<Organization> {
    try {
      const response = await fetch(`${BACKEND_URL}/superadmin/organization`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create organization");
      }

      return await response.json();

    } catch (e: any) {
      console.warn("Backend offline, saving organization locally. Error:", e.message);

      const { name, orgType, ownerGmail, ownerMobile, planType } = orgData;

      const orgs = getLocalStorageItem("mock_organizations");
      if (orgs.some((o) => o.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Organization name already exists");
      }

      // Generate organization code: HRMS[Year][5-digit random]
      const currentYear = new Date().getFullYear();
      const random5Digits = Math.floor(10000 + Math.random() * 90000);
      const orgCode = `HRMS${currentYear}${random5Digits}`;

      // Generate 6-digit OTP
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));

      const newOrg: Organization = {
        id: orgs.length + 1,
        name,
        orgType: orgType.toUpperCase() as any,
        orgCode,
        ownerGmail,
        ownerMobile,
        planType: planType.toUpperCase() as any,
        otpCode,
      };

      orgs.push(newOrg);
      localStorage.setItem("mock_organizations", JSON.stringify(orgs));

      return newOrg;
    }
  },

  // Fetch all organizations (Superadmin workflow)
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/superadmin/organizations`);
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, loading cached local organizations. Error:", e.message);
      return getLocalStorageItem("mock_organizations");
    }
  },

  // Update an organization
  async updateOrganization(id: number, payload: Partial<Organization>): Promise<Organization> {
    try {
      const response = await fetch(`${BACKEND_URL}/superadmin/organization/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update organization");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, updating local mock organization. Error:", e.message);
      const orgs = getLocalStorageItem("mock_organizations") as Organization[];
      const idx = orgs.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error("Organization not found");
      orgs[idx] = { ...orgs[idx], ...payload };
      localStorage.setItem("mock_organizations", JSON.stringify(orgs));
      return orgs[idx];
    }
  },

  // Delete an organization
  async deleteOrganization(id: number): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/superadmin/organization/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to delete organization");
      }
    } catch (e: any) {
      console.warn("Backend offline, deleting local mock organization. Error:", e.message);
      const orgs = getLocalStorageItem("mock_organizations") as Organization[];
      const filtered = orgs.filter((o) => o.id !== id);
      localStorage.setItem("mock_organizations", JSON.stringify(filtered));
    }
  },

  // Get landing page layout schema
  getLandingPageSchema(): LandingPageBlock[] {
    if (typeof window === "undefined") return defaultLandingPageSchema;
    const data = localStorage.getItem("landing_page_schema");
    return data ? JSON.parse(data) : defaultLandingPageSchema;
  },

  // Save landing page layout schema
  saveLandingPageSchema(schema: LandingPageBlock[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("landing_page_schema", JSON.stringify(schema));
  },

  // Fetch users in same organization
  async getUsers(orgId: number): Promise<User[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/users?orgId=${orgId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, fetching local organization users. Error:", e.message);
      const users = getLocalStorageItem("mock_users");
      return users.filter((u) => u.organization && u.organization.id === orgId);
    }
  },

  // Create user account (HR workflow)
  async createUser(userData: {
    username: string;
    gmail: string;
    password: string;
    mobile?: string;
    role: string;
    orgId: number;
  }): Promise<User> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create user");
      }

      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, saving user locally. Error:", e.message);

      const users = getLocalStorageItem("mock_users");
      const { username, gmail, password, mobile, role, orgId } = userData;

      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error("Username already exists");
      }

      const organizations = getLocalStorageItem("mock_organizations");
      const org = organizations.find((o) => o.id === orgId) || null;

      const newUser = {
        username,
        password,
        gmail,
        mobile: mobile || "",
        role: role.toUpperCase(),
        organization: org,
      };

      users.push(newUser);
      localStorage.setItem("mock_users", JSON.stringify(users));

      return {
        username,
        gmail,
        mobile: mobile || "",
        role: role as any,
        organization: org,
      };
    }
  },

  // User submits a forgot password reset request
  async forgotPassword(username: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Request failed");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, submitting reset request locally. Error:", e.message);

      const users = getLocalStorageItem("mock_users");
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        throw new Error("Username not found");
      }

      if (!localStorage.getItem("mock_reset_requests")) {
        localStorage.setItem("mock_reset_requests", JSON.stringify([]));
      }

      const requests = getLocalStorageItem("mock_reset_requests");
      const existingIdx = requests.findIndex((r) => r.username.toLowerCase() === username.toLowerCase());

      const newRequest = {
        id: existingIdx !== -1 ? requests[existingIdx].id : requests.length + 1,
        username: user.username,
        status: "PENDING",
        organization: user.organization,
        createdAt: new Date().toISOString(),
      };

      if (existingIdx !== -1) {
        requests[existingIdx] = newRequest;
      } else {
        requests.push(newRequest);
      }

      localStorage.setItem("mock_reset_requests", JSON.stringify(requests));
      return { message: "Reset request submitted to HR (offline)" };
    }
  },

  // Fetch pending reset requests for HR
  async getResetRequests(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-requests?orgId=${orgId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reset requests");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, fetching local reset requests. Error:", e.message);
      const requests = getLocalStorageItem("mock_reset_requests");
      return requests.filter((r) => r.organization && r.organization.id === orgId && r.status === "PENDING");
    }
  },

  // HR approves reset request
  async approveReset(requestId: number): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/approve-reset/${requestId}`, {
        method: "POST",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Approval failed");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, approving reset request locally. Error:", e.message);
      const requests = getLocalStorageItem("mock_reset_requests");
      const idx = requests.findIndex((r) => r.id === requestId);
      if (idx === -1) {
        throw new Error("Reset request not found");
      }
      requests[idx].status = "APPROVED";
      localStorage.setItem("mock_reset_requests", JSON.stringify(requests));
      return { message: "Reset request approved (offline)" };
    }
  },

  // User resets password (finalizes workflow)
  async resetPassword(username: string, newPassword: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Reset failed");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend offline, resetting password locally. Error:", e.message);

      const requests = getLocalStorageItem("mock_reset_requests");
      const req = requests.find(
        (r) => r.username.toLowerCase() === username.toLowerCase() && r.status === "APPROVED"
      );

      if (!req) {
        throw new Error("No approved password reset request found. Please contact your HR.");
      }

      const users = getLocalStorageItem("mock_users");
      const userIdx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
      if (userIdx === -1) {
        throw new Error("User not found");
      }

      // Update password
      users[userIdx].password = newPassword;
      localStorage.setItem("mock_users", JSON.stringify(users));

      // Mark request completed or remove it
      const filteredRequests = requests.filter((r) => r.id !== req.id);
      localStorage.setItem("mock_reset_requests", JSON.stringify(filteredRequests));

      return { message: "Password reset successfully (offline)" };
    }
  },

  // System Availability endpoint
  async getSystemStatus(): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/system-status`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend system status offline simulation active");
    }
    return {
      javaVersion: "21.0.12+8",
      processors: 8,
      freeMemory: "184 MB",
      totalMemory: "512 MB",
      activeProfile: "mock-services",
      redisCache: "Disabled/Mocked (Simple Cache)",
      kafkaBroker: "Disabled/Mocked (Console Logger)"
    };
  },

  // Update Org Settings endpoint
  async updateOrgSettings(orgId: number, workMode: string, attendanceMode: string): Promise<Organization> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/organization/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, workMode, attendanceMode }),
      });
      if (response.ok) {
        const updatedOrg = await response.json();
        const user = this.getCurrentUser();
        if (user && user.organization && user.organization.id === orgId) {
          user.organization = updatedOrg;
          localStorage.setItem("current_user", JSON.stringify(user));
        }
        return updatedOrg;
      }
    } catch (e) {
      console.warn("Backend update settings offline simulation active");
    }

    const orgs = getLocalStorageItem("mock_organizations");
    const idx = orgs.findIndex((o) => o.id === orgId);
    if (idx !== -1) {
      orgs[idx].workMode = workMode as any;
      orgs[idx].attendanceMode = attendanceMode as any;
      localStorage.setItem("mock_organizations", JSON.stringify(orgs));

      const user = this.getCurrentUser();
      if (user && user.organization && user.organization.id === orgId) {
        user.organization = orgs[idx];
        localStorage.setItem("current_user", JSON.stringify(user));
        const mockUsers = getLocalStorageItem("mock_users");
        const uIdx = mockUsers.findIndex((mu) => mu.username.toLowerCase() === user.username.toLowerCase());
        if (uIdx !== -1) {
          mockUsers[uIdx].organization = orgs[idx];
          localStorage.setItem("mock_users", JSON.stringify(mockUsers));
        }
      }
      return orgs[idx];
    }
    throw new Error("Organization not found");
  },

  // Invoices APIs
  async getInvoices(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/invoices?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend invoices offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_invoices");
    return list.filter((i) => i.orgId === orgId);
  },

  async createInvoice(orgId: number, invoice: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/invoices/create?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createInvoice offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_invoices");
    const newInv = { ...invoice, id: `INV-${Date.now().toString().slice(-4)}`, orgId };
    list.push(newInv);
    localStorage.setItem("mock_invoices", JSON.stringify(list));
    return newInv;
  },

  async autoGenerateInvoices(orgId: number): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/invoices/auto-generate?orgId=${orgId}`, {
        method: "POST"
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend autoGenerateInvoices offline, using mock generator");
    }
    const projects = getLocalStorageItem("mock_projects").filter((p) => p.orgId === orgId);
    const list = getLocalStorageItem("mock_invoices");
    const generated: any[] = [];
    projects.forEach((proj) => {
      if (!proj.spent || proj.spent <= 0) return;
      const clientName = `Client of ${proj.name}`;
      const exists = list.some((i) => i.client === clientName && Math.abs(i.amount - proj.spent) < 0.01 && i.status === "Unpaid" && i.orgId === orgId);
      if (!exists) {
        const newInv = {
          id: `INV-${Date.now().toString().slice(-4)}`,
          invoiceCode: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          client: clientName,
          amount: proj.spent,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "Unpaid",
          orgId
        };
        list.push(newInv);
        generated.push(newInv);
      }
    });
    if (generated.length > 0) {
      localStorage.setItem("mock_invoices", JSON.stringify(list));
    }
    return { count: generated.length, invoices: generated };
  },

  async updateInvoiceStatus(orgId: number, invoiceId: string, status: "Paid" | "Unpaid"): Promise<any> {
    try {
      const numericId = parseInt(invoiceId.replace("INV-", ""));
      const response = await fetch(`${BACKEND_URL}/invoices/status?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: isNaN(numericId) ? invoiceId : numericId, status }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend updateInvoiceStatus offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_invoices");
    const idx = list.findIndex((i) => i.id === invoiceId && i.orgId === orgId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem("mock_invoices", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Invoice not found");
  },

  // Attendance APIs
  async getAttendanceLogs(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/attendance?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend attendance offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_attendance_logs");
    return list.filter((a) => a.orgId === orgId);
  },

  async saveAttendanceLogs(orgId: number, logs: any[]): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/attendance/save?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logs),
      });
      if (response.ok) return;
    } catch (e) {
      console.warn("Backend saveAttendance offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_attendance_logs");
    const rest = list.filter((a) => a.orgId !== orgId);
    const updated = [...rest, ...logs.map(l => ({ ...l, orgId }))];
    localStorage.setItem("mock_attendance_logs", JSON.stringify(updated));
  },

  async clockInOut(username: string, status: "IN" | "OUT", orgId: number): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/attendance/clock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, status, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend clockInOut offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_attendance_logs");
    const today = new Date().toISOString().split("T")[0];
    const logIdx = list.findIndex((a) => a.username === username && a.date === today && a.orgId === orgId);
    
    if (logIdx !== -1) {
      list[logIdx].status = status === "IN" ? "Present" : "Left";
    } else {
      list.push({ username, date: today, status: "Present", orgId });
    }
    localStorage.setItem("mock_attendance_logs", JSON.stringify(list));
    return { status: "Success", todayLog: status };
  },

  // Payroll APIs
  async getPayrollSheets(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/payroll?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend payroll offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_payroll");
    return list.filter((p) => p.orgId === orgId);
  },

  async processPayroll(orgId: number, payrollData: any[]): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/payroll/process?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payrollData),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend processPayroll offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_payroll");
    const rest = list.filter((p) => p.orgId !== orgId);
    const updated = [...rest, ...payrollData.map(p => ({ ...p, orgId }))];
    localStorage.setItem("mock_payroll", JSON.stringify(updated));
    return { status: "Processed" };
  },

  async calculatePayroll(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/payroll/calculate?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend calculatePayroll offline, using mock generator");
    }
    const users = getLocalStorageItem("mock_users").filter((u) => u.orgId === orgId);
    const logs = getLocalStorageItem("mock_attendance_logs").filter((a) => a.orgId === orgId);
    return users.map((u) => {
      const absentCount = logs.filter((a) => a.username === u.username && a.status === "Absent").length;
      const baseBasic = u.role === "ADMIN" ? 50000 : 25000;
      const baseAllowance = u.role === "ADMIN" ? 10000 : 5000;
      const deductions = Math.round((baseBasic / 30) * absentCount);
      return {
        username: u.username,
        basic: baseBasic,
        allowance: baseAllowance,
        deductions,
        status: "Processed"
      };
    });
  },

  // Sprints & Agile APIs
  async getSprints(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/sprints?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend sprints offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_sprints");
    return list.filter((s) => s.orgId === orgId);
  },

  async createSprint(orgId: number, sprint: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/sprints/create?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sprint),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createSprint offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_sprints");
    const newSprint = { ...sprint, id: `sprint-${Date.now().toString().slice(-4)}`, orgId };
    list.push(newSprint);
    localStorage.setItem("mock_sprints", JSON.stringify(list));
    return newSprint;
  },

  async getTickets(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/tickets?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend tickets offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_tickets");
    return list.filter((t) => t.orgId === orgId);
  },

  async createTicket(orgId: number, ticket: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/tickets/create?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createTicket offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_tickets");
    const newTicket = { ...ticket, id: `tick-${Date.now().toString().slice(-4)}`, orgId };
    list.push(newTicket);
    localStorage.setItem("mock_tickets", JSON.stringify(list));
    return newTicket;
  },

  async updateTicketStatus(orgId: number, ticketId: string, status: string): Promise<any> {
    try {
      const numericId = parseInt(ticketId.replace("tick-", ""));
      const response = await fetch(`${BACKEND_URL}/tickets/status?orgId=${orgId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: isNaN(numericId) ? ticketId : numericId, status }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend updateTicketStatus offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_tickets");
    const idx = list.findIndex((t) => t.id === ticketId && t.orgId === orgId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem("mock_tickets", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Ticket not found");
  },

  // System Operations APIs
  async createSubscriptionPlan(name: string, price: number, maxUsers: number, allowedModules: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, maxUsers, allowedModules }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createSubscriptionPlan offline fallback active");
    }
    const plans = getLocalStorageItem("mock_subscription_plans");
    const newPlan = { id: Date.now(), name: name.toUpperCase(), price, maxUsers, allowedModules };
    plans.push(newPlan);
    localStorage.setItem("mock_subscription_plans", JSON.stringify(plans));
    return newPlan;
  },

  async getSubscriptionPlans(): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/plans`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getSubscriptionPlans offline fallback active");
    }
    if (!localStorage.getItem("mock_subscription_plans")) {
      const defaults = [
        { id: 1, name: "STANDARD", price: 49, maxUsers: 10, allowedModules: "ATTENDANCE" },
        { id: 2, name: "MIDLEVEL", price: 99, maxUsers: 50, allowedModules: "ATTENDANCE,PAYROLL" },
        { id: 3, name: "ENTERPRISE", price: 249, maxUsers: 500, allowedModules: "ATTENDANCE,PAYROLL,SPRINTS,TICKETS" },
      ];
      localStorage.setItem("mock_subscription_plans", JSON.stringify(defaults));
    }
    return getLocalStorageItem("mock_subscription_plans");
  },

  async toggleOrgModules(orgId: number, modulesActive: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/modules/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, modulesActive }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend toggleOrgModules offline fallback active");
    }
    const orgs = getLocalStorageItem("mock_organizations");
    const idx = orgs.findIndex((o) => o.id === orgId);
    if (idx !== -1) {
      orgs[idx].modulesActive = modulesActive;
      localStorage.setItem("mock_organizations", JSON.stringify(orgs));
      return orgs[idx];
    }
    throw new Error("Organization not found");
  },

  async submitContactQuery(name: string, email: string, message: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend submitContactQuery offline fallback active");
    }
    const list = getLocalStorageItem("mock_contact_queries");
    const newQuery = { id: Date.now(), name, email, message, status: "PENDING", createdAt: new Date().toISOString() };
    list.push(newQuery);
    localStorage.setItem("mock_contact_queries", JSON.stringify(list));
    return newQuery;
  },

  async getContactQueries(): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/contact`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getContactQueries offline fallback active");
    }
    return getLocalStorageItem("mock_contact_queries");
  },

  async sendSystemNotification(title: string, content: string, targetOrgId: number | null): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, targetOrgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend sendSystemNotification offline fallback active");
    }
    const list = getLocalStorageItem("mock_system_notifications");
    const newNotification = { id: Date.now(), title, content, targetOrgId, isRead: false, createdAt: new Date().toISOString() };
    list.push(newNotification);
    localStorage.setItem("mock_system_notifications", JSON.stringify(list));
    return newNotification;
  },

  async getSystemNotifications(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/system-ops/notifications?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getSystemNotifications offline fallback active");
    }
    const list = getLocalStorageItem("mock_system_notifications");
    return list.filter((n) => n.targetOrgId === null || n.targetOrgId === orgId);
  },

  async getDashboardStats(orgId: number): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/dashboard/stats?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getDashboardStats offline fallback active");
    }
    const orgs = getLocalStorageItem("mock_organizations");
    const employees = getLocalStorageItem("mock_employees").filter((e) => e.orgId === orgId);
    const attendance = getLocalStorageItem("mock_attendance_logs").filter((a) => a.orgId === orgId);
    const payrollList = getLocalStorageItem("mock_payroll").filter((p) => p.orgId === orgId);
    const tickets = getLocalStorageItem("mock_tickets").filter((t) => t.orgId === orgId);
    const sprints = getLocalStorageItem("mock_sprints").filter((s) => s.orgId === orgId);

    const totalEmployees = employees.length;
    const today = new Date().toISOString().split("T")[0];
    const todayLogs = attendance.filter((a) => a.date === today);
    const presentToday = todayLogs.filter((a) => a.status === "Present" || a.status === "IN").length;
    const leaveToday = todayLogs.filter((a) => a.status === "Leave").length;
    const activeEmployees = Math.max(0, totalEmployees - leaveToday);

    const totalPayrollCost = payrollList.reduce((acc, p) => acc + (p.basic || 0) + (p.allowance || 0) - (p.deductions || 0), 0);
    const processedPayroll = payrollList.filter((p) => p.status === "Processed").length;

    const activeSprintsCount = sprints.filter((s) => s.status === "Active").length;
    const pendingTicketsCount = tickets.filter((t) => t.status !== "Done").length;

    const velocityList = sprints.map((s) => {
      const sprintTickets = tickets.filter((t) => t.sprintId === s.id);
      const planned = sprintTickets.reduce((acc, t) => acc + (t.points || 0), 0);
      const done = sprintTickets.filter((t) => t.status === "Done").reduce((acc, t) => acc + (t.points || 0), 0);
      return { s: s.name, planned, done };
    });
    if (velocityList.length === 0) {
      velocityList.push({ s: "Sprint 1", planned: 40, done: 35 });
    }

    const payrollTrend = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m, i) => {
      const factor = 0.8 + (i * 0.04);
      return { m, cost: parseFloat(((totalPayrollCost * factor) / 1000000).toFixed(2)) };
    });

    const employeeGrowth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m, i) => {
      const factor = 0.7 + (i * 0.042);
      const headcount = Math.max(1, Math.round(totalEmployees * factor));
      return { m, employees: headcount, joiners: Math.round(headcount * 0.08) + 1, exits: Math.round(headcount * 0.02) };
    });

    return {
      totalEmployees,
      activeEmployees,
      newJoiners: Math.max(1, Math.round(totalEmployees * 0.05)),
      resigned: totalEmployees > 10 ? 1 : 0,
      attendanceRate: todayLogs.length > 0 ? (presentToday * 100) / todayLogs.length : 95.0,
      leaveRequests: leaveToday,
      payrollCost: totalPayrollCost,
      activeProjects: sprints.length > 0 ? sprints.length * 2 : 3,
      activeSprints: activeSprintsCount,
      pendingTickets: pendingTicketsCount,
      velocity: velocityList,
      pipeline: [
        { stage: "Applied", count: totalEmployees * 3 + 12 },
        { stage: "Screen", count: totalEmployees * 2 + 5 },
        { stage: "Interview", count: totalEmployees + 2 },
        { stage: "Offer", count: Math.max(1, Math.round(totalEmployees * 0.05)) + 1 },
        { stage: "Hired", count: Math.max(1, Math.round(totalEmployees * 0.05)) }
      ],
      recentActivity: [
        { who: "System", what: "initialized workspace container successfully", when: "Just now" }
      ],
      payrollCostTrend: payrollTrend,
      growth: employeeGrowth,
      leaves: [
        { name: "Casual", value: Math.round(totalEmployees * 0.15) + 2 },
        { name: "Sick", value: Math.round(totalEmployees * 0.08) + 1 },
        { name: "Earned", value: Math.round(totalEmployees * 0.22) + 3 },
        { name: "WFH", value: Math.round(totalEmployees * 0.25) + 4 },
        { name: "Comp-off", value: Math.round(totalEmployees * 0.05) + 1 }
      ],
      attendanceTrend: [
        { d: "Mon", present: 92, remote: 5, absent: 3 },
        { d: "Tue", present: 94, remote: 4, absent: 2 },
        { d: "Wed", present: 93, remote: 5, absent: 2 },
        { d: "Thu", present: 95, remote: 3, absent: 2 },
        { d: "Fri", present: 90, remote: 7, absent: 3 },
        { d: "Sat", present: 40, remote: 2, absent: 58 }
      ],
      payrollProcessed: processedPayroll,
      payrollOnHold: payrollList.filter((p) => p.status === "Hold").length,
      payrollExceptions: 0
    };
  },

  async getProjects(orgId: number): Promise<Project[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/projects?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getProjects offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_projects");
    return list.filter((p) => p.organizationId === orgId);
  },

  async saveProject(project: Project): Promise<Project> {
    try {
      const response = await fetch(`${BACKEND_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveProject offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_projects");
    if (project.id) {
      const idx = list.findIndex((p) => p.id === project.id);
      if (idx !== -1) {
        list[idx] = project;
      }
    } else {
      project.id = Date.now();
      list.push(project);
    }
    localStorage.setItem("mock_projects", JSON.stringify(list));
    return project;
  },

  async deleteProject(id: number): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/projects/${id}`, {
        method: "DELETE",
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend deleteProject offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_projects");
    const filtered = list.filter((p) => p.id !== id);
    localStorage.setItem("mock_projects", JSON.stringify(filtered));
    return { message: "Project deleted successfully" };
  },

  async getLeaves(orgId: number, username?: string): Promise<LeaveRequest[]> {
    try {
      const url = username 
        ? `${BACKEND_URL}/leaves?orgId=${orgId}&username=${username}`
        : `${BACKEND_URL}/leaves?orgId=${orgId}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getLeaves offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_leaves");
    return list.filter((l) => l.organizationId === orgId && (!username || l.username === username));
  },

  async submitLeaveRequest(leave: LeaveRequest): Promise<LeaveRequest> {
    try {
      const response = await fetch(`${BACKEND_URL}/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leave),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend submitLeaveRequest offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_leaves");
    leave.id = Date.now();
    leave.status = "PENDING";
    leave.requestedAt = new Date().toISOString().split("T")[0];
    list.push(leave);
    localStorage.setItem("mock_leaves", JSON.stringify(list));
    return leave;
  },

  async approveLeave(orgId: number, id: number, status: "APPROVED" | "REJECTED"): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/leaves/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend approveLeave offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_leaves");
    const idx = list.findIndex((l) => l.id === id && l.organizationId === orgId);
    if (idx !== -1) {
      list[idx].status = status;
      localStorage.setItem("mock_leaves", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Leave request not found");
  },

  async changePassword(username: string, currentPwd: string, newPwd: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, currentPassword: currentPwd, newPassword: newPwd }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update password");
      }
      return await response.json();
    } catch (e: any) {
      console.warn("Backend changePassword offline, using localStorage fallback");
      const users = getLocalStorageItem("mock_users");
      const idx = users.findIndex((u) => u.username.toLowerCase() === username.toLowerCase());
      if (idx === -1) throw new Error("User not found");
      if (users[idx].password !== currentPwd) throw new Error("Incorrect current password");
      users[idx].password = newPwd;
      localStorage.setItem("mock_users", JSON.stringify(users));
      return { message: "Password changed successfully" };
    }
  },

  async getEmployeeDashboardStats(orgId: number, username: string): Promise<any> {
    try {
      const leaves = await this.getLeaves(orgId, username);
      const approvedDays = leaves
        .filter((l) => l.status.toUpperCase() === "APPROVED")
        .reduce((sum, l) => sum + l.duration, 0);
      const remainingLeaveBalance = Math.max(0, 18 - approvedDays);

      let attendanceRate = 98.2;
      try {
        const response = await fetch(`${BACKEND_URL}/attendance?orgId=${orgId}`);
        if (response.ok) {
          const records: any[] = await response.json();
          const userRecords = records.filter((r) => r.username === username);
          if (userRecords.length > 0) {
            const present = userRecords.filter((r) => r.status === "Present" || r.status === "Left").length;
            attendanceRate = Math.round((present * 100) / userRecords.length);
          }
        }
      } catch (e) {
        const records = getLocalStorageItem("mock_attendance_logs");
        const userRecords = records.filter((r) => r.username === username && r.orgId === orgId);
        if (userRecords.length > 0) {
          const present = userRecords.filter((r) => r.status === "Present" || r.status === "Left").length;
          attendanceRate = Math.round((present * 100) / userRecords.length);
        }
      }

      let pendingTasks = 4;
      try {
        const response = await fetch(`${BACKEND_URL}/tickets?orgId=${orgId}`);
        if (response.ok) {
          const tickets: any[] = await response.json();
          pendingTasks = tickets.filter((t) => t.assignee === username && t.status !== "DONE").length;
        }
      } catch (e) {
        const tickets = getLocalStorageItem("mock_tickets");
        pendingTasks = tickets.filter((t) => t.assignee === username && t.status !== "DONE" && t.orgId === orgId).length;
      }

      return {
        remainingLeave: remainingLeaveBalance,
        attendanceRate: attendanceRate,
        pendingTasks: pendingTasks,
        holidayDate: "15 Aug",
        holidayName: "Independence Day"
      };
    } catch (e) {
      return {
        remainingLeave: 12,
        attendanceRate: 98.2,
        pendingTasks: 4,
        holidayDate: "15 Aug",
        holidayName: "Independence Day"
      };
    }
  },

  // Recruitment APIs
  async getJobs(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/recruitment/jobs?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getJobs offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_recruitment_jobs");
    if (list.length === 0) {
      const initial = [
        { id: 1, title: "Senior Java Developer", department: "Engineering", status: "Open", organizationId: orgId },
        { id: 2, title: "Frontend React Engineer", department: "Engineering", status: "Open", organizationId: orgId },
        { id: 3, title: "HR Coordinator", department: "Human Resources", status: "Open", organizationId: orgId }
      ];
      localStorage.setItem("mock_recruitment_jobs", JSON.stringify(initial));
      return initial;
    }
    return list.filter((j) => j.organizationId === orgId);
  },

  async createJob(orgId: number, jobData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/recruitment/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...jobData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createJob offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_recruitment_jobs");
    const newJob = { ...jobData, id: Date.now(), organizationId: orgId, status: "Open" };
    list.push(newJob);
    localStorage.setItem("mock_recruitment_jobs", JSON.stringify(list));
    return newJob;
  },

  async getCandidates(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/recruitment/candidates?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getCandidates offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_recruitment_candidates");
    if (list.length === 0) {
      const initial = [
        { id: 1, name: "Alice Smith", email: "alice.smith@gmail.com", stage: "Applied", jobRequisitionId: 1, organizationId: orgId },
        { id: 2, name: "Bob Johnson", email: "bob.johnson@yahoo.com", stage: "Screening", jobRequisitionId: 1, organizationId: orgId },
        { id: 3, name: "Charlie Brown", email: "charlie.b@gmail.com", stage: "Interview", jobRequisitionId: 2, organizationId: orgId },
        { id: 4, name: "Diana Prince", email: "diana.p@amazon.com", stage: "Offered", jobRequisitionId: 2, organizationId: orgId },
        { id: 5, name: "Evan Wright", email: "evan.w@gmail.com", stage: "Hired", jobRequisitionId: 3, organizationId: orgId },
        { id: 6, name: "Fiona Gallagher", email: "fiona.g@outlook.com", stage: "Rejected", jobRequisitionId: 1, organizationId: orgId }
      ];
      localStorage.setItem("mock_recruitment_candidates", JSON.stringify(initial));
      return initial;
    }
    return list.filter((c) => c.organizationId === orgId);
  },

  async createCandidate(orgId: number, candidateData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/recruitment/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...candidateData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createCandidate offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_recruitment_candidates");
    const newCandidate = { ...candidateData, id: Date.now(), organizationId: orgId, stage: "Applied" };
    list.push(newCandidate);
    localStorage.setItem("mock_recruitment_candidates", JSON.stringify(list));
    return newCandidate;
  },

  async updateCandidateStage(orgId: number, candidateId: number, newStage: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/recruitment/candidates/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, stage: newStage }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend updateCandidateStage offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_recruitment_candidates");
    const idx = list.findIndex((c) => c.id === candidateId && c.organizationId === orgId);
    if (idx !== -1) {
      list[idx].stage = newStage;
      localStorage.setItem("mock_recruitment_candidates", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Candidate not found");
  },

  // Onboarding APIs
  async getOnboardingTasks(orgId: number, username?: string): Promise<any[]> {
    try {
      const url = username 
        ? `${BACKEND_URL}/onboarding?orgId=${orgId}&username=${username}`
        : `${BACKEND_URL}/onboarding?orgId=${orgId}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getOnboardingTasks offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_onboarding_tasks");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", taskName: "Submit W-4 tax declaration documents", category: "DOCUMENTS", completed: true, organizationId: orgId },
        { id: 2, username: "baluacme", taskName: "Provision corporate GSuite routing email", category: "PROVISIONING", completed: true, organizationId: orgId },
        { id: 3, username: "baluacme", taskName: "Assign company development laptop (MacBook Pro)", category: "ASSETS", completed: true, organizationId: orgId },
        { id: 4, username: "baluacme", taskName: "Register direct deposit bank details", category: "PAYROLL", completed: true, organizationId: orgId },
        { id: 5, username: "baluacme", taskName: "Meet team lead & review project sprint boards", category: "TEAM", completed: false, organizationId: orgId },
        { id: 6, username: "baluacme", taskName: "Day 1 onboarding welcome buddy coffee sync", category: "WELCOME", completed: false, organizationId: orgId }
      ];
      localStorage.setItem("mock_onboarding_tasks", JSON.stringify(initial));
      return username ? initial.filter(t => t.username === username) : initial;
    }
    const filtered = list.filter((t) => t.organizationId === orgId);
    return username ? filtered.filter((t) => t.username === username) : filtered;
  },

  async createOnboardingTask(orgId: number, taskData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...taskData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend createOnboardingTask offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_onboarding_tasks");
    const newTask = { ...taskData, id: Date.now(), organizationId: orgId, completed: false };
    list.push(newTask);
    localStorage.setItem("mock_onboarding_tasks", JSON.stringify(list));
    return newTask;
  },

  async toggleOnboardingTask(orgId: number, taskId: number, completed: boolean): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/onboarding/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, completed }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend toggleOnboardingTask offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_onboarding_tasks");
    const idx = list.findIndex((t) => t.id === taskId && t.organizationId === orgId);
    if (idx !== -1) {
      list[idx].completed = completed;
      localStorage.setItem("mock_onboarding_tasks", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Task not found");
  },

  async seedOnboardingChecklist(orgId: number, username: string): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/onboarding/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend seedOnboardingChecklist offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_onboarding_tasks");
    const defaultTasks = [
      { taskName: "Submit W-4 tax declaration documents", category: "DOCUMENTS" },
      { taskName: "Provision corporate GSuite routing email", category: "PROVISIONING" },
      { taskName: "Assign company development laptop (MacBook Pro)", category: "ASSETS" },
      { taskName: "Register direct deposit bank details", category: "PAYROLL" },
      { taskName: "Meet team lead & review project sprint boards", category: "TEAM" },
      { taskName: "Day 1 onboarding welcome buddy coffee sync", category: "WELCOME" }
    ];
    const seeded: any[] = [];
    defaultTasks.forEach((def, i) => {
      const task = {
        id: Date.now() + i,
        username,
        taskName: def.taskName,
        category: def.category,
        completed: false,
        organizationId: orgId
      };
      list.push(task);
      seeded.push(task);
    });
    localStorage.setItem("mock_onboarding_tasks", JSON.stringify(list));
    return seeded;
  },

  // Assets APIs
  async getAssets(orgId: number, username?: string): Promise<any[]> {
    try {
      const url = username 
        ? `${BACKEND_URL}/assets?orgId=${orgId}&username=${username}`
        : `${BACKEND_URL}/assets?orgId=${orgId}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getAssets offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_assets");
    if (list.length === 0) {
      const initial = [
        { id: 1, assetTag: "AST-101", name: "Apple MacBook Pro M3 (16-inch)", assignee: "baluacme", status: "Allocated", organizationId: orgId },
        { id: 2, assetTag: "AST-102", name: "Apple MacBook Pro M3 (14-inch)", assignee: "bobjohnson", status: "Allocated", organizationId: orgId },
        { id: 3, assetTag: "AST-103", name: "Dell XPS 15 9530", assignee: "alicesmith", status: "Allocated", organizationId: orgId },
        { id: 4, assetTag: "AST-104", name: "Lenovo ThinkPad T14 Gen 4", assignee: "Unassigned", status: "In Stock", organizationId: orgId },
        { id: 5, assetTag: "AST-105", name: "iPhone 15 Pro (128GB)", assignee: "dianaprince", status: "Allocated", organizationId: orgId },
        { id: 6, assetTag: "AST-106", name: "Secure Access Card (Card key)", assignee: "Unassigned", status: "In Stock", organizationId: orgId },
        { id: 7, assetTag: "AST-107", name: "Apple MacBook Air M2", assignee: "Unassigned", status: "Maintenance", organizationId: orgId }
      ];
      localStorage.setItem("mock_assets", JSON.stringify(initial));
      return username ? initial.filter(a => a.assignee === username) : initial;
    }
    const filtered = list.filter((a) => a.organizationId === orgId);
    return username ? filtered.filter((a) => a.assignee === username) : filtered;
  },

  async saveAsset(orgId: number, assetData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...assetData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveAsset offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_assets");
    if (assetData.id) {
      const idx = list.findIndex((a) => a.id === assetData.id && a.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...assetData };
        localStorage.setItem("mock_assets", JSON.stringify(list));
        return list[idx];
      }
    }
    const newAsset = { ...assetData, id: Date.now(), organizationId: orgId, assignee: assetData.assignee || "Unassigned", status: assetData.status || "In Stock" };
    list.push(newAsset);
    localStorage.setItem("mock_assets", JSON.stringify(list));
    return newAsset;
  },

  async assignAsset(orgId: number, assetId: number, assignee: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/assets/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, assignee, status }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend assignAsset offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_assets");
    const idx = list.findIndex((a) => a.id === assetId && a.organizationId === orgId);
    if (idx !== -1) {
      list[idx].assignee = assignee;
      list[idx].status = status;
      localStorage.setItem("mock_assets", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Asset not found");
  },

  // Performance APIs
  async getPerformanceReviews(orgId: number, username?: string): Promise<any[]> {
    try {
      const url = username 
        ? `${BACKEND_URL}/performance?orgId=${orgId}&username=${username}`
        : `${BACKEND_URL}/performance?orgId=${orgId}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getPerformanceReviews offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_performance_reviews");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", period: "H1 2026", goalsScore: 4.5, sprintScore: 4.2, attendanceScore: 4.8, overallScore: 4.5, feedback: "Excellent contribution to the core platform sprint releases. Strong attendance and goal completion rate.", organizationId: orgId },
        { id: 2, username: "bobjohnson", period: "H1 2026", goalsScore: 3.8, sprintScore: 4.0, attendanceScore: 4.5, overallScore: 4.1, feedback: "Solid Java developments. Ready to take on more complex microservices integration tasks in Q3.", organizationId: orgId },
        { id: 3, username: "alicesmith", period: "H1 2026", goalsScore: 4.0, sprintScore: 4.5, attendanceScore: 4.2, overallScore: 4.2, feedback: "Great work leading frontend React component guidelines.", organizationId: orgId }
      ];
      localStorage.setItem("mock_performance_reviews", JSON.stringify(initial));
      return username ? initial.filter(r => r.username === username) : initial;
    }
    const filtered = list.filter((r) => r.organizationId === orgId);
    return username ? filtered.filter((r) => r.username === username) : filtered;
  },

  async savePerformanceReview(orgId: number, reviewData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/performance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reviewData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend savePerformanceReview offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_performance_reviews");
    const avg = (reviewData.goalsScore + reviewData.sprintScore + reviewData.attendanceScore) / 3.0;
    const overall = Math.round(avg * 10.0) / 10.0;
    if (reviewData.id) {
      const idx = list.findIndex((r) => r.id === reviewData.id && r.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...reviewData, overallScore: overall };
        localStorage.setItem("mock_performance_reviews", JSON.stringify(list));
        return list[idx];
      }
    }
    const newReview = { ...reviewData, id: Date.now(), organizationId: orgId, overallScore: overall };
    list.push(newReview);
    localStorage.setItem("mock_performance_reviews", JSON.stringify(list));
    return newReview;
  },

  // Learning APIs
  async getCourses(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/learning/courses?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getCourses offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_courses");
    if (list.length === 0) {
      const initial = [
        { id: 1, title: "React Frontend State Management & Hooks", duration: 12, targetRole: "IT", description: "Deep dive into standard React hooks, custom state providers, and performance optimizations.", driveLink: "https://drive.google.com/drive/folders/mock-react-state", organizationId: orgId },
        { id: 2, title: "Spring Boot & JPA MySQL Architectures", duration: 20, targetRole: "IT", description: "Advanced microservices design using Spring Data JPA, transactions, and performance tuning.", driveLink: "https://drive.google.com/drive/folders/mock-springboot", organizationId: orgId },
        { id: 3, title: "Corporate Cybersecurity Guidelines", duration: 2, targetRole: "All", description: "Mandatory security course covering phishing, access cards, credentials safety, and device policies.", driveLink: "https://drive.google.com/drive/folders/mock-cybersec", organizationId: orgId },
        { id: 4, title: "Effective Team Management & OKR Cascade", duration: 8, targetRole: "HR", description: "HR strategies to design and cascade quarterly goals and performance reviews.", driveLink: "https://drive.google.com/drive/folders/mock-okrs", organizationId: orgId }
      ];
      localStorage.setItem("mock_courses", JSON.stringify(initial));
      return initial;
    }
    return list.filter((c) => c.organizationId === orgId);
  },

  async saveCourse(orgId: number, courseData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/learning/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...courseData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveCourse offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_courses");
    const newCourse = { ...courseData, id: Date.now(), organizationId: orgId };
    list.push(newCourse);
    localStorage.setItem("mock_courses", JSON.stringify(list));
    return newCourse;
  },

  async getCourseProgress(orgId: number, username: string): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/learning/progress?orgId=${orgId}&username=${username}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getCourseProgress offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_course_progress");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", courseId: 1, progress: 100, status: "Completed", organizationId: orgId },
        { id: 2, username: "baluacme", courseId: 2, progress: 60, status: "In Progress", organizationId: orgId },
        { id: 3, username: "baluacme", courseId: 3, progress: 100, status: "Completed", organizationId: orgId }
      ];
      localStorage.setItem("mock_course_progress", JSON.stringify(initial));
      return initial.filter(p => p.username === username);
    }
    return list.filter((p) => p.organizationId === orgId && p.username === username);
  },

  async updateCourseProgress(orgId: number, username: string, courseId: number, progress: number): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/learning/progress/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, courseId, progress, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend updateCourseProgress offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_course_progress");
    const status = progress >= 100 ? "Completed" : progress <= 0 ? "Not Started" : "In Progress";
    const idx = list.findIndex((p) => p.username === username && p.courseId === courseId && p.organizationId === orgId);
    if (idx !== -1) {
      list[idx].progress = Math.min(100, Math.max(0, progress));
      list[idx].status = status;
      localStorage.setItem("mock_course_progress", JSON.stringify(list));
      return list[idx];
    }
    const newProgress = { id: Date.now(), username, courseId, progress, status, organizationId: orgId };
    list.push(newProgress);
    localStorage.setItem("mock_course_progress", JSON.stringify(list));
    return newProgress;
  },

  // Teams / Org Chart APIs
  async getDepartments(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/teams/departments?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getDepartments offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_departments");
    if (list.length === 0) {
      const initial = [
        { id: 1, name: "Engineering", description: "Core software development, architecture, QA, and platform DevOps.", managerUsername: "baluacme", organizationId: orgId },
        { id: 2, name: "Human Resources", description: "Recruitment, onboarding, payroll processing, and operations.", managerUsername: "initech_hr", organizationId: orgId },
        { id: 3, name: "Operations & Sales", description: "Client engagement, invoice audit, and resource billing.", managerUsername: "initech_hr", organizationId: orgId }
      ];
      localStorage.setItem("mock_departments", JSON.stringify(initial));
      return initial;
    }
    return list.filter((d) => d.organizationId === orgId);
  },

  async saveDepartment(orgId: number, deptData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/teams/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...deptData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveDepartment offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_departments");
    const newDept = { ...deptData, id: Date.now(), organizationId: orgId };
    list.push(newDept);
    localStorage.setItem("mock_departments", JSON.stringify(list));
    return newDept;
  },

  async getSquads(orgId: number, departmentId?: number): Promise<any[]> {
    try {
      const url = departmentId 
        ? `${BACKEND_URL}/teams/squads?orgId=${orgId}&departmentId=${departmentId}`
        : `${BACKEND_URL}/teams/squads?orgId=${orgId}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getSquads offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_squads");
    if (list.length === 0) {
      const initial = [
        { id: 1, name: "Core Platform Squad", departmentId: 1, leadUsername: "alicesmith", skillsMatrix: "React, Typescript, Tailwind, Spring Boot", organizationId: orgId },
        { id: 2, name: "Microservices Squad", departmentId: 1, leadUsername: "bobjohnson", skillsMatrix: "Java, Spring Boot, MySQL, Docker", organizationId: orgId },
        { id: 3, name: "Talent Acquisition Team", departmentId: 2, leadUsername: "initech_hr", skillsMatrix: "ATS, Sourcing, Onboarding, Payroll", organizationId: orgId }
      ];
      localStorage.setItem("mock_squads", JSON.stringify(initial));
      return departmentId ? initial.filter(s => s.departmentId === departmentId) : initial;
    }
    const filtered = list.filter((s) => s.organizationId === orgId);
    return departmentId ? filtered.filter((s) => s.departmentId === departmentId) : filtered;
  },

  async saveSquad(orgId: number, squadData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/teams/squads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...squadData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveSquad offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_squads");
    const newSquad = { ...squadData, id: Date.now(), organizationId: orgId };
    list.push(newSquad);
    localStorage.setItem("mock_squads", JSON.stringify(list));
    return newSquad;
  },

  async getSquadMemberships(orgId: number, squadId?: number, username?: string): Promise<any[]> {
    try {
      let url = `${BACKEND_URL}/teams/memberships?orgId=${orgId}`;
      if (squadId) url += `&squadId=${squadId}`;
      if (username) url += `&username=${username}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getSquadMemberships offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_squad_memberships");
    if (list.length === 0) {
      const initial = [
        { id: 1, squadId: 1, username: "alicesmith", roleTitle: "Lead Frontend Engineer", allocationPercentage: 100, organizationId: orgId },
        { id: 2, squadId: 1, username: "baluacme", roleTitle: "Fullstack Architect", allocationPercentage: 50, organizationId: orgId },
        { id: 3, squadId: 2, username: "bobjohnson", roleTitle: "Senior Java Developer", allocationPercentage: 100, organizationId: orgId },
        { id: 4, squadId: 2, username: "dianaprince", roleTitle: "Java API Developer", allocationPercentage: 100, organizationId: orgId },
        { id: 5, squadId: 3, username: "initech_hr", roleTitle: "HR Director", allocationPercentage: 100, organizationId: orgId }
      ];
      localStorage.setItem("mock_squad_memberships", JSON.stringify(initial));
      return initial.filter(m => (!squadId || m.squadId === squadId) && (!username || m.username === username));
    }
    const filtered = list.filter((m) => m.organizationId === orgId);
    return filtered.filter(m => (!squadId || m.squadId === squadId) && (!username || m.username === username));
  },

  async saveSquadMembership(orgId: number, memData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/teams/memberships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...memData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveSquadMembership offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_squad_memberships");
    if (memData.id) {
      const idx = list.findIndex(m => m.id === memData.id && m.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...memData };
        localStorage.setItem("mock_squad_memberships", JSON.stringify(list));
        return list[idx];
      }
    }
    const newMem = { ...memData, id: Date.now(), organizationId: orgId };
    list.push(newMem);
    localStorage.setItem("mock_squad_memberships", JSON.stringify(list));
    return newMem;
  },

  // Work Logs APIs
  async getWorkLogs(orgId: number, username?: string): Promise<any[]> {
    try {
      let url = `${BACKEND_URL}/worklogs?orgId=${orgId}`;
      if (username) url += `&username=${username}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getWorkLogs offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_work_logs");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", logDate: "2026-08-05", whatDone: "Completed onboarding documents collection, finished W-4 submit verification. Built React form stubs.", whatNext: "Start implementing dynamic teams hierarchy and org directories in router.", blockers: "None. Waiting on API definitions approval.", hoursSpent: 8.0, organizationId: orgId },
        { id: 2, username: "bobjohnson", logDate: "2026-08-05", whatDone: "Integrated Spring Security with OAuth2 login profiles. Seeded database tables.", whatNext: "Configure CORS headers and SSL certificates for dev environment.", blockers: "Database port was blocked by local firewall, resolved.", hoursSpent: 7.5, organizationId: orgId },
        { id: 3, username: "alicesmith", logDate: "2026-08-05", whatDone: "Polished Tailwind styling elements and designed page metrics layouts.", whatNext: "Implement drag-n-drop candidates pipeline cards.", blockers: "None.", hoursSpent: 8.0, organizationId: orgId }
      ];
      localStorage.setItem("mock_work_logs", JSON.stringify(initial));
      return username ? initial.filter(w => w.username === username) : initial;
    }
    const filtered = list.filter((w) => w.organizationId === orgId);
    return username ? filtered.filter((w) => w.username === username) : filtered;
  },

  async saveWorkLog(orgId: number, logData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/worklogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...logData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveWorkLog offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_work_logs");
    const newLog = { ...logData, id: Date.now(), organizationId: orgId };
    list.push(newLog);
    localStorage.setItem("mock_work_logs", JSON.stringify(list));
    return newLog;
  },

  // Expense Claims APIs
  async getExpenseClaims(orgId: number, username?: string): Promise<any[]> {
    try {
      let url = `${BACKEND_URL}/expenses?orgId=${orgId}`;
      if (username) url += `&username=${username}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getExpenseClaims offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_expense_claims");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", title: "GSuite Monthly corporate email routing configuration routing fee", category: "Software", amount: 45.0, currency: "USD", status: "Approved", merchant: "Google LLC", claimDate: "2026-08-04", organizationId: orgId },
        { id: 2, username: "baluacme", title: "Day 1 onboarding welcome coffee sync for team lead", category: "Meals", amount: 18.5, currency: "USD", status: "Pending", merchant: "Starbucks", claimDate: "2026-08-05", organizationId: orgId },
        { id: 3, username: "bobjohnson", title: "MacBook Pro replacement USB-C charger hub", category: "Hardware", amount: 79.99, currency: "USD", status: "Reimbursed", merchant: "Apple Store", claimDate: "2026-08-01", organizationId: orgId }
      ];
      localStorage.setItem("mock_expense_claims", JSON.stringify(initial));
      return username ? initial.filter(e => e.username === username) : initial;
    }
    const filtered = list.filter((e) => e.organizationId === orgId);
    return username ? filtered.filter((e) => e.username === username) : filtered;
  },

  async saveExpenseClaim(orgId: number, claimData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...claimData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveExpenseClaim offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_expense_claims");
    if (claimData.id) {
      const idx = list.findIndex(c => c.id === claimData.id && c.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...claimData };
        localStorage.setItem("mock_expense_claims", JSON.stringify(list));
        return list[idx];
      }
    }
    const newClaim = { ...claimData, id: Date.now(), status: "Pending", organizationId: orgId };
    list.push(newClaim);
    localStorage.setItem("mock_expense_claims", JSON.stringify(list));
    return newClaim;
  },

  // Announcements APIs
  async getAnnouncements(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/announcements?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getAnnouncements offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_announcements");
    if (list.length === 0) {
      const initial = [
        { id: 1, title: "H1 2026 Strategy Review & All Hands Meeting", content: "Join us on Friday, August 8 at 10 AM EST for our quarterly strategy review and organization updates. Link will be shared in the calendar invite.", targetAudience: "All", category: "Event", publishDate: "2026-08-05", author: "acme_hr", organizationId: orgId },
        { id: 2, title: "Independence Day Corporate Holiday Schedule", content: "Please note that the corporate offices will remain closed on Monday, August 17, 2026, in observance of the upcoming national holiday.", targetAudience: "All", category: "Holiday", publishDate: "2026-08-04", author: "acme_hr", organizationId: orgId },
        { id: 3, title: "Production Database Migration Schedule", content: "IT team members: Core PostgreSQL & MySQL databases will undergo maintenance migration on Saturday at midnight. Expect 15 mins of sandbox API downtime.", targetAudience: "IT", category: "News", publishDate: "2026-08-06", author: "baluacme", organizationId: orgId }
      ];
      localStorage.setItem("mock_announcements", JSON.stringify(initial));
      return initial;
    }
    return list.filter((a) => a.organizationId === orgId);
  },

  async saveAnnouncement(orgId: number, annData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/announcements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...annData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveAnnouncement offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_announcements");
    const newAnn = { ...annData, id: Date.now(), organizationId: orgId };
    list.push(newAnn);
    localStorage.setItem("mock_announcements", JSON.stringify(list));
    return newAnn;
  },

  // Exit Management APIs
  async getExitRequests(orgId: number, username?: string): Promise<any[]> {
    try {
      let url = `${BACKEND_URL}/exit?orgId=${orgId}`;
      if (username) url += `&username=${username}`;
      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getExitRequests offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_exit_requests");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "bobjohnson", reason: "Accepted an offer at another organization for a senior technology role.", resignationDate: "2026-08-01", lastWorkingDay: "2026-08-31", status: "Approved", departmentClearance: "Cleared", itClearance: "Pending", financeClearance: "Pending", organizationId: orgId },
        { id: 2, username: "alicesmith", reason: "Relocating to a different state for personal family reasons.", resignationDate: "2026-08-05", lastWorkingDay: "2026-09-05", status: "Pending", departmentClearance: "Pending", itClearance: "Pending", financeClearance: "Pending", organizationId: orgId }
      ];
      localStorage.setItem("mock_exit_requests", JSON.stringify(initial));
      return username ? initial.filter(r => r.username === username) : initial;
    }
    const filtered = list.filter((r) => r.organizationId === orgId);
    return username ? filtered.filter((r) => r.username === username) : filtered;
  },

  async saveExitRequest(orgId: number, reqData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/exit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reqData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveExitRequest offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_exit_requests");
    if (reqData.id) {
      const idx = list.findIndex(r => r.id === reqData.id && r.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...reqData };
        if (list[idx].departmentClearance === "Cleared" &&
            list[idx].itClearance === "Cleared" &&
            list[idx].financeClearance === "Cleared") {
          list[idx].status = "Completed";
        }
        localStorage.setItem("mock_exit_requests", JSON.stringify(list));
        return list[idx];
      }
    }
    const newReq = { 
      ...reqData, 
      id: Date.now(), 
      status: "Pending", 
      departmentClearance: "Pending",
      itClearance: "Pending",
      financeClearance: "Pending",
      organizationId: orgId 
    };
    list.push(newReq);
    localStorage.setItem("mock_exit_requests", JSON.stringify(list));
    return newReq;
  },

  // Timesheets APIs
  async getTimesheets(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/timesheets?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getTimesheets offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_timesheets");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", projectName: "Corporate Portal", taskDescription: "Developed JPA entity definitions and configured MySQL mappings.", hoursLogged: 32.5, billable: true, weekStartDate: "2026-08-03", status: "Approved", organizationId: orgId },
        { id: 2, username: "baluacme", projectName: "Zenelait Core", taskDescription: "Refactored state machine loops and cache configurations.", hoursLogged: 8.0, billable: true, weekStartDate: "2026-08-03", status: "Pending", organizationId: orgId },
        { id: 3, username: "bobjohnson", projectName: "Internal Tools", taskDescription: "Set up build systems and docker configurations.", hoursLogged: 40.0, billable: false, weekStartDate: "2026-08-03", status: "Approved", organizationId: orgId }
      ];
      localStorage.setItem("mock_timesheets", JSON.stringify(initial));
      return initial;
    }
    return list.filter((t) => t.organizationId === orgId);
  },

  async saveTimesheet(orgId: number, sheetData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/timesheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sheetData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveTimesheet offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_timesheets");
    if (sheetData.id) {
      const idx = list.findIndex(t => t.id === sheetData.id && t.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...sheetData };
        localStorage.setItem("mock_timesheets", JSON.stringify(list));
        return list[idx];
      }
    }
    const newSheet = { ...sheetData, id: Date.now(), status: "Pending", organizationId: orgId };
    list.push(newSheet);
    localStorage.setItem("mock_timesheets", JSON.stringify(list));
    return newSheet;
  },

  // Helpdesk APIs
  async getHelpdeskTickets(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/helpdesk?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getHelpdeskTickets offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_helpdesk_tickets");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", title: "GSuite corporate login locked", description: "I am unable to access my corporate baluacme email inbox. Need administrator verification password bypass.", category: "IT", priority: "High", status: "Open", organizationId: orgId },
        { id: 2, username: "bobjohnson", title: "Form W-4 details update request", description: "Need to adjust my tax allowances for the next direct deposit payroll cycle.", category: "HR", priority: "Medium", status: "In Progress", organizationId: orgId },
        { id: 3, username: "alicesmith", title: "Incorrect deductions in August payslip", description: "My salary statement lists a deduction of $500 which does not match my active leave allocations.", category: "Finance", priority: "High", status: "Resolved", organizationId: orgId }
      ];
      localStorage.setItem("mock_helpdesk_tickets", JSON.stringify(initial));
      return initial;
    }
    return list.filter((t) => t.organizationId === orgId);
  },

  async saveHelpdeskTicket(orgId: number, ticketData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/helpdesk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ticketData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveHelpdeskTicket offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_helpdesk_tickets");
    if (ticketData.id) {
      const idx = list.findIndex(t => t.id === ticketData.id && t.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...ticketData };
        localStorage.setItem("mock_helpdesk_tickets", JSON.stringify(list));
        return list[idx];
      }
    }
    const newTicket = { ...ticketData, id: Date.now(), status: "Open", organizationId: orgId };
    list.push(newTicket);
    localStorage.setItem("mock_helpdesk_tickets", JSON.stringify(list));
    return newTicket;
  },

  // Travel APIs
  async getTravelRequests(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/travel?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getTravelRequests offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_travel_requests");
    if (list.length === 0) {
      const initial = [
        { id: 1, username: "baluacme", destination: "San Francisco, CA", purpose: "Annual tech conference & integration sync workshops.", startDate: "2026-08-20", endDate: "2026-08-25", estimatedCost: 1850.0, status: "Approved", advanceDisbursement: 500.0, organizationId: orgId },
        { id: 2, username: "bobjohnson", destination: "London, UK", purpose: "Strategic partner alignment meetings for client core portal rollout.", startDate: "2026-09-02", endDate: "2026-09-08", estimatedCost: 3400.0, status: "Pending", advanceDisbursement: 0.0, organizationId: orgId }
      ];
      localStorage.setItem("mock_travel_requests", JSON.stringify(initial));
      return initial;
    }
    return list.filter((t) => t.organizationId === orgId);
  },

  async saveTravelRequest(orgId: number, travelData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/travel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...travelData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveTravelRequest offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_travel_requests");
    if (travelData.id) {
      const idx = list.findIndex(t => t.id === travelData.id && t.organizationId === orgId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...travelData };
        localStorage.setItem("mock_travel_requests", JSON.stringify(list));
        return list[idx];
      }
    }
    const newTravel = { ...travelData, id: Date.now(), status: "Pending", advanceDisbursement: 0.0, organizationId: orgId };
    list.push(newTravel);
    localStorage.setItem("mock_travel_requests", JSON.stringify(list));
    return newTravel;
  },

  // RBAC Role Permissions APIs
  async getRolePermissions(orgId: number): Promise<any[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/rbac/permissions?orgId=${orgId}`);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend getRolePermissions offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_role_permissions");
    if (list.length === 0) {
      const initial = [
        { id: 1, roleName: "ADMIN", moduleName: "Attendance", canRead: true, canWrite: true, canDelete: true, organizationId: orgId },
        { id: 2, roleName: "ADMIN", moduleName: "Payroll", canRead: true, canWrite: true, canDelete: true, organizationId: orgId },
        { id: 3, roleName: "ADMIN", moduleName: "Performance", canRead: true, canWrite: true, canDelete: true, organizationId: orgId },
        { id: 4, roleName: "EMPLOYEE", moduleName: "Attendance", canRead: true, canWrite: false, canDelete: false, organizationId: orgId },
        { id: 5, roleName: "EMPLOYEE", moduleName: "Payroll", canRead: true, canWrite: false, canDelete: false, organizationId: orgId },
        { id: 6, roleName: "EMPLOYEE", moduleName: "Performance", canRead: true, canWrite: false, canDelete: false, organizationId: orgId }
      ];
      localStorage.setItem("mock_role_permissions", JSON.stringify(initial));
      return initial;
    }
    return list.filter((p) => p.organizationId === orgId);
  },

  async saveRolePermission(orgId: number, permissionData: any): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/rbac/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...permissionData, organizationId: orgId }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("Backend saveRolePermission offline, using localStorage fallback");
    }
    const list = getLocalStorageItem("mock_role_permissions");
    const idx = list.findIndex(p => p.roleName === permissionData.roleName && p.moduleName === permissionData.moduleName && p.organizationId === orgId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...permissionData };
      localStorage.setItem("mock_role_permissions", JSON.stringify(list));
      return list[idx];
    }
    const newPerm = { ...permissionData, id: Date.now(), organizationId: orgId };
    list.push(newPerm);
    localStorage.setItem("mock_role_permissions", JSON.stringify(list));
    return newPerm;
  },
};

