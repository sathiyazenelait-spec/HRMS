import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { apiService } from "../lib/api-service";
import {
  Sparkles,
  Users,
  Wallet,
  Rocket,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Activity,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Check,
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zenelait HRMS · Next-Gen Workforce OS" },
      {
        name: "description",
        content: "Unified HRMS, payroll, and agile delivery platform for modern companies.",
      },
      { property: "og:title", content: "Zenelait HRMS · Next-Gen Workforce OS" },
      {
        property: "og:description",
        content: "Unified HRMS, payroll, and agile delivery platform for modern companies.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const [schema] = useState(() => apiService.getLandingPageSchema());
  const [activeTab, setActiveTab] = useState<"hr" | "payroll" | "delivery">("hr");
  const [employeeCount, setEmployeeCount] = useState<number>(25);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");

  // Auth modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Login Form States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register Form States
  const [regUsername, setRegUsername] = useState("");
  const [regGmail, setRegGmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regOrgName, setRegOrgName] = useState("");
  const [regOrgCode, setRegOrgCode] = useState("");
  const [regOtp, setRegOtp] = useState("");
  const [regAccept, setRegAccept] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const user = await apiService.login(loginUsername, loginPassword);
      if (user.role === "SUPERADMIN") {
        window.location.href = "/superadmin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    }
  };

  // Forgot Password / Reset States
  const [loginStep, setLoginStep] = useState<"login" | "forgot" | "reset">("login");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  // Contact Form States
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess("");
    setContactError("");
    setContactLoading(true);
    try {
      await apiService.submitContactQuery(contactName, contactEmail, contactMessage);
      setContactSuccess("Message sent successfully! Our Super Admin team will review it shortly.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err: any) {
      setContactError(err.message || "Failed to send message. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");
    try {
      await apiService.forgotPassword(forgotUsername);
      setForgotSuccess("Reset request submitted! Please notify your HR to approve it. Once approved, you can reset your password using the 'Reset Password (If Approved)' button.");
    } catch (err: any) {
      setForgotError(err.message || "Request failed");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    if (resetPasswordVal !== resetConfirmPasswordVal) {
      setResetError("Passwords do not match");
      return;
    }
    try {
      await apiService.resetPassword(forgotUsername, resetPasswordVal);
      setResetSuccess("Password reset successfully! You can now log in with your new password.");
      setResetPasswordVal("");
      setResetConfirmPasswordVal("");
      setTimeout(() => {
        setLoginStep("login");
        setLoginUsername(forgotUsername);
        setLoginPassword("");
        setResetSuccess("");
      }, 2000);
    } catch (err: any) {
      setResetError(err.message || "Reset failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");

    if (!regAccept) {
      setRegError("You must accept the terms & conditions");
      return;
    }

    try {
      await apiService.registerUser({
        username: regUsername,
        gmail: regGmail,
        mobile: regMobile,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        orgName: regOrgName,
        orgCode: regOrgCode,
        otp: regOtp,
      });

      setRegSuccess("User registered successfully! Redirecting to login...");
      setRegUsername("");
      setRegGmail("");
      setRegMobile("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegOrgName("");
      setRegOrgCode("");
      setRegOtp("");
      setRegAccept(false);

      setTimeout(() => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
        setRegSuccess("");
      }, 2000);
    } catch (err: any) {
      setRegError(err.message || "Registration failed");
    }
  };

  // Calculate pricing based on interactive inputs
  const pricePerUser = billingCycle === "annually" ? 6 : 8;
  const basePrice = 49;
  const calculatedTotal = basePrice + employeeCount * pricePerUser;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[10%] right-10 w-[450px] h-[450px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[60%] left-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Zenelait <span className="text-indigo-400 font-semibold">HRMS</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              Register
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Render layout schema blocks dynamically */}
      {schema.map((block) => {
        if (!block.visible) return null;

        switch (block.type) {
          case "hero":
            return (
              <section key={block.id} className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
                  <Zap className="h-3 w-3 text-indigo-400" />
                  <span>The Next-Generation HR & Agile Workspace</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
                  {block.title}
                </h1>

                <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg lg:text-xl leading-relaxed mb-10">
                  {block.subtitle}
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-16">
                  <Link
                    to="/dashboard"
                    className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-base shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-[1.03] flex items-center gap-2"
                  >
                    {block.ctaText || "Launch Platform Now"}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <a
                    href="#preview"
                    className="px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 font-semibold text-slate-300 hover:text-white transition-all duration-300 flex items-center gap-2"
                  >
                    Interactive Sandbox
                  </a>
                </div>

                {/* Hero Interactive App Window Mockup */}
                <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-900/40 p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600/20 text-indigo-400 text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full border border-indigo-500/30">
                    Preview Environment
                  </div>
                  {block.imageUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-800 h-[380px] shadow-inner relative bg-slate-950">
                      <img src={block.imageUrl} alt="Zenelait HRMS Preview" className="w-full h-full object-cover opacity-85" />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner flex flex-col h-[500px]">
                      {/* Window bar */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-900 bg-slate-950/80">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
                        </div>
                        <div className="text-xs text-slate-500 font-medium select-none bg-slate-900/50 px-8 py-1 rounded-md border border-slate-800/50">
                          app.zenelait.com/dashboard
                        </div>
                        <div className="w-12" />
                      </div>
                      <div className="flex-1 flex items-center justify-center p-8 bg-slate-900/10">
                        <div className="text-slate-500 text-xs flex flex-col items-center gap-4">
                          <LayoutDashboard className="h-12 w-12 text-slate-700 animate-bounce" />
                          <span>Console Sandbox ready. Log in to explore HR, Sprints and Payroll modules.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );

          case "features":
            return (
              <section key={block.id} id="features" className="py-24 border-t border-slate-900 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">{block.title}</h2>
                  <p className="max-w-xl mx-auto text-slate-400 text-sm sm:text-base">
                    {block.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {block.contentList && block.contentList.map((item, idx) => {
                    const icons = [Users, Wallet, Rocket, Zap];
                    const SelectedIcon = icons[idx % icons.length];
                    const colors = [
                      "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
                      "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
                      "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30",
                      "from-amber-500/20 to-orange-500/20 border-amber-500/30",
                    ];
                    const selectedColor = colors[idx % colors.length];

                    const parts = item.split(" - ");
                    const titleStr = parts[0];
                    const descStr = parts.slice(1).join(" - ");

                    return (
                      <div
                        key={idx}
                        className={`p-8 rounded-2xl border bg-gradient-to-br ${selectedColor} hover:scale-[1.02] transition-all duration-300 flex flex-col gap-4 group`}
                      >
                        <div className="h-12 w-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                          <SelectedIcon className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">{titleStr}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{descStr || "Out-of-the-box system integration support."}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          case "pricing":
            return (
              <section key={block.id} id="pricing" className="py-24 border-t border-slate-900 bg-slate-950/20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="text-left flex flex-col gap-6">
                    <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Transparent Cost</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">{block.title}</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {block.subtitle}
                    </p>

                    <div className="flex flex-col gap-3 mt-4">
                      {block.contentList && block.contentList.map((feat) => (
                        <div key={feat} className="flex items-center gap-2 text-xs text-slate-350">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-md flex flex-col gap-8 text-left shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-[10px] font-bold text-white uppercase tracking-wider px-4 py-1.5 rounded-bl-xl">
                      Instant Pricing Calculator
                    </div>

                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs text-slate-500 font-medium">Base System License</span>
                        <span className="font-semibold text-slate-300">$49/month</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 font-medium">Seat License ({employeeCount} users)</span>
                        <span className="font-semibold text-slate-300">${employeeCount * pricePerUser}/month</span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-slate-300">How many team members?</span>
                        <span className="text-indigo-400 font-semibold">{employeeCount} employees</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="500"
                        value={employeeCount}
                        onChange={(e) => setEmployeeCount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                      />
                      <div className="flex justify-between text-[10px] text-slate-650 mt-1">
                        <span>5 seats</span>
                        <span>250 seats</span>
                        <span>500 seats</span>
                      </div>
                    </div>

                    {/* Cycle Toggle */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 justify-between">
                      <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                          billingCycle === "monthly" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Monthly billing
                      </button>
                      <button
                        onClick={() => setBillingCycle("annually")}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                          billingCycle === "annually" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Annually (Save 25%)
                      </button>
                    </div>

                    <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 text-xs block">Estimated Total Cost</span>
                        <span className="text-4xl font-extrabold text-indigo-400">${calculatedTotal} / mo</span>
                      </div>
                      <Link
                        to="/dashboard"
                        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-md shadow-indigo-600/10 transition-colors flex items-center gap-1"
                      >
                        Start Sandbox
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            );

          case "testimonials":
            return (
              <section key={block.id} className="py-24 border-t border-slate-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-slate-950/10">
                <div className="max-w-xl mx-auto flex flex-col gap-4 mb-16">
                  <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Client Success</span>
                  <h2 className="text-3xl sm:text-4xl font-bold">{block.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed">{block.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                  {block.contentList && block.contentList.map((testStr, idx) => {
                    const parts = testStr.split(": ");
                    const author = parts[0];
                    const quote = parts.slice(1).join(": ");

                    return (
                      <div key={idx} className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl relative">
                        <div className="text-4xl text-indigo-500/20 font-serif absolute top-4 right-4">“</div>
                        <p className="text-sm text-slate-350 leading-relaxed italic mb-4">
                          {quote ? quote.trim() : testStr}
                        </p>
                        <div className="flex items-center gap-2 border-t border-slate-900/60 pt-4">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                            {author.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">{author}</div>
                            <div className="text-[10px] text-slate-500">Verified Organization Admin</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );

          default:
            return null;
        }
      })}

      {/* Interactive Tabbed Product Sandbox */}
      <section id="preview" className="py-24 border-t border-slate-900 bg-slate-950 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Test Drive Zenelait HRMS</h2>
            <p className="max-w-xl mx-auto text-slate-400 text-sm">
              Toggle the core modules below to see how our interfaces render data and simplify operations.
            </p>
          </div>

          {/* Sandbox Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {[
              { id: "hr", label: "Core People", icon: Users },
              { id: "payroll", label: "Global Payroll", icon: Wallet },
              { id: "delivery", label: "Agile Sprints", icon: Rocket },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-900/60 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Sandbox Panel */}
          <div className="bg-slate-900/30 border border-slate-850/80 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto min-h-[320px] backdrop-blur-sm">
            {activeTab === "hr" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-lg text-indigo-400">Employee Directory</h4>
                  <span className="text-xs text-slate-500">Quick Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: "Ava Reyes", role: "Super Admin", status: "Active", dept: "Executive" },
                    { name: "Marcus Chen", role: "Principal Engineer", status: "Active", dept: "Engineering" },
                    { name: "Sarah Jenkins", role: "Lead Product Designer", status: "Active", dept: "Design" },
                  ].map((emp) => (
                    <div key={emp.name} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                          {emp.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{emp.name}</div>
                          <div className="text-[11px] text-slate-500">{emp.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-2 border-t border-slate-900 text-[10px]">
                        <span className="text-slate-450">{emp.dept}</span>
                        <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{emp.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "payroll" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-lg text-emerald-400">Smart Payslip Configurator</h4>
                  <span className="text-xs text-slate-500">Simulate earnings & tax deductions</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                    <span className="text-xs font-semibold text-slate-400">Monthly Compensation</span>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Base Salary</span>
                        <span className="font-bold text-emerald-400">$8,500/mo</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "85%" }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Provident Fund (Retirement)</span>
                        <span className="font-bold text-slate-350">$510/mo</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: "20%" }} /></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">TDS / Income Tax Estimate</span>
                        <span className="font-bold text-rose-450">$1,275/mo</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5"><div className="bg-rose-500 h-1.5 rounded-full" style={{ width: "40%" }} /></div>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <span className="text-slate-500 text-xs">Estimated Take-home Salary</span>
                      <div className="text-3xl font-extrabold text-white mt-1">$6,715 <span className="text-xs font-medium text-slate-500">/ net month</span></div>
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-900 pt-4 mt-4">
                      Tax deduction calculations are synced dynamically with the employee's localized region configurations.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-lg text-purple-400">Sprint Tracking Board</h4>
                  <span className="text-xs text-slate-500">Sprint 12 (Active)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">To Do (2)</span>
                    <div className="flex flex-col gap-2.5 mt-3">
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                        <div className="font-semibold">Implement OAuth login flow</div>
                        <div className="text-[10px] text-slate-500 mt-1">PM-102 · Employee Portal</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-semibold text-indigo-400">In Progress (1)</span>
                    <div className="flex flex-col gap-2.5 mt-3">
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                        <div className="font-semibold">Kafka message channel consumer</div>
                        <div className="text-[10px] text-indigo-400 mt-1">PM-105 · Infrastructure</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/80">
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-semibold text-emerald-450">Done (4)</span>
                    <div className="flex flex-col gap-2.5 mt-3">
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs line-through opacity-60">
                        <div className="font-semibold">Configure virtual thread pools</div>
                        <div className="text-[10px] text-slate-500 mt-1">PM-82 · Server Config</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Security & Reliability Section */}
      <section id="why-us" className="py-24 border-t border-slate-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-xl mx-auto flex flex-col gap-4 mb-16">
          <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">Compliance & Security</span>
          <h2 className="text-3xl sm:text-4xl font-bold">Built for Enterprise Integrity</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Rest easy knowing your workforce, compliance registry, database storage, and payroll archives are secured under advanced encryption protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "GDPR & SOC2 Ready", desc: "Data access logs are audited hourly to guarantee secure transmission of sensitive staff profiles." },
            { icon: Activity, title: "99.99% Node Uptime", desc: "Our server clusters deploy on cloudflare edge instances ensuring rapid response times." },
            { icon: BarChart3, title: "Immutable Audit Trails", desc: "Every payroll adjustment, timesheet approval, and leave balance update registers in a clean, immutable log." },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/20 border border-slate-900 p-6 rounded-2xl flex flex-col gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 mb-2">
                <item.icon className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-200">{item.title}</h4>
              <p className="text-xs text-slate-505 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-us" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 relative text-center">
        <div className="space-y-4 max-w-lg mx-auto mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Get in touch
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Have questions about customized plans, billing options, or operational modules? Send a query straight to our Superadmin console.
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 max-w-xl mx-auto shadow-xl text-left">
          {contactSuccess && (
            <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-450 font-semibold flex items-center gap-2">
              <span>{contactSuccess}</span>
            </div>
          )}
          {contactError && (
            <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-450 font-semibold flex items-center gap-2">
              <span>{contactError}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Message</label>
              <textarea
                required
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 outline-none transition-colors"
                placeholder="Describe your inquiry..."
              />
            </div>

            <button
              type="submit"
              disabled={contactLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.01] cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              {contactLoading ? "Sending inquiry..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* Final CTA Footer */}
      <footer className="py-16 border-t border-slate-900 bg-slate-950 px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold">Reimagine Workforce Management</h3>
          <p className="max-w-md text-slate-400 text-xs sm:text-sm">
            Launch the Zenelait HRMS sandbox container now to explore all premium tools with mock datasets.
          </p>

          <Link
            to="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-transform duration-300 hover:scale-[1.02] flex items-center gap-1.5"
          >
            Launch Platform Sandbox
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="text-slate-500 text-[10px] mt-8 flex justify-center gap-6 border-t border-slate-900/60 pt-8 w-full max-w-lg">
            <span>© 2026 Zenelait HRMS. All rights reserved.</span>
            <a href="#features" className="hover:text-slate-450 transition-colors">Documentation</a>
            <a href="#why-us" className="hover:text-slate-450 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsLoginOpen(false);
                setLoginStep("login");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {loginStep === "login" && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold">Login to Zenelait</span>
                </div>

                {loginError && (
                  <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-450">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-slate-400 font-semibold">Password</label>
                      <button
                        type="button"
                        onClick={() => setLoginStep("forgot")}
                        className="text-xs text-indigo-400 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    Sign In
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setIsLoginOpen(false);
                      setIsRegisterOpen(true);
                    }}
                    className="text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Register Organization Owner
                  </button>
                </div>
              </>
            )}

            {loginStep === "forgot" && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold">Request Password Reset</span>
                </div>

                {forgotError && (
                  <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-450">
                    {forgotError}
                  </div>
                )}
                {forgotSuccess && (
                  <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 leading-relaxed">
                    {forgotSuccess}
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    Submit Reset Request
                  </button>
                </form>

                <div className="mt-4 flex flex-col gap-2.5 text-center text-xs">
                  <button
                    onClick={() => setLoginStep("reset")}
                    className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Reset Password (If Approved)
                  </button>
                  <button
                    onClick={() => setLoginStep("login")}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )}

            {loginStep === "reset" && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold">Set New Password</span>
                </div>

                {resetError && (
                  <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-455">
                    {resetError}
                  </div>
                )}
                {resetSuccess && (
                  <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-semibold">
                    {resetSuccess}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Username</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={resetPasswordVal}
                        onChange={(e) => setResetPasswordVal(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-semibold">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={resetConfirmPasswordVal}
                        onChange={(e) => setResetConfirmPasswordVal(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    Reset Password
                  </button>
                </form>

                <div className="mt-4 text-center text-xs">
                  <button
                    onClick={() => setLoginStep("forgot")}
                    className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Back to Request Reset
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">Register Admin User</span>
            </div>

            {regError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-450">
                {regError}
              </div>
            )}
            {regSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-semibold">
                {regSuccess}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-650 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Gmail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={regGmail}
                      onChange={(e) => setRegGmail(e.target.value)}
                      placeholder="owner@gmail.com"
                      className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-650 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-655 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-655 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-655 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 my-1 pt-3">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-2">Organization Authentication</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Organization Name (case-insensitive)</label>
                  <input
                    type="text"
                    required
                    value={regOrgName}
                    onChange={(e) => setRegOrgName(e.target.value)}
                    placeholder="Enter Organization Name"
                    className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 px-3 text-xs text-slate-100 placeholder:text-slate-655 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-semibold">Organization Code</label>
                  <input
                    type="text"
                    required
                    value={regOrgCode}
                    onChange={(e) => setRegOrgCode(e.target.value)}
                    placeholder="e.g. HRMS202612345"
                    className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 px-3 text-xs text-slate-100 placeholder:text-slate-655 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-slate-400 font-semibold">OTP Code (generated by superadmin)</label>
                <input
                  type="text"
                  required
                  value={regOtp}
                  onChange={(e) => setRegOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full rounded-lg border border-slate-850 bg-slate-950 py-1.5 px-3 text-xs text-slate-100 placeholder:text-slate-655 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-start gap-2 mt-2">
                <input
                  type="checkbox"
                  required
                  id="regAccept"
                  checked={regAccept}
                  onChange={(e) => setRegAccept(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="regAccept" className="text-xs text-slate-400 cursor-pointer select-none">
                  I accept the Terms of Service and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
              >
                Register and Join Org
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsRegisterOpen(false);
                  setIsLoginOpen(true);
                }}
                className="text-indigo-400 hover:underline font-medium cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
