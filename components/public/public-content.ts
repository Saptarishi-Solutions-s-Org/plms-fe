import {
  Activity,
  BarChart3,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  ContactRound,
  Gift,
  Globe2,
  KeyRound,
  Layers3,
  LineChart,
  Mail,
  MapPin,
  Phone,
  PieChart,
  ShieldCheck,
  Target,
  UserCog,
  Users,
} from "lucide-react";

export const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

export const supportEmails = [
  "system.admin@saptarishi.tech",
  "info@saptarishi.tech",
];

export const platformModules = [
  {
    icon: Target,
    label: "Lead Capture",
    desc: "Create manual and imported leads with status, priority, source, and owner tracking.",
    color: "#047857",
    bg: "#ecfdf5",
  },
  {
    icon: Activity,
    label: "Follow-ups",
    desc: "Track calls, SMS, email, in-person visits, notes, outcomes, and next follow-up dates.",
    color: "#0f766e",
    bg: "#f0fdfa",
  },
  {
    icon: Gift,
    label: "Offers",
    desc: "Manage discounts, combo offers, validity windows, assignments, and offer status.",
    color: "#a16207",
    bg: "#fefce8",
  },
  {
    icon: UserCog,
    label: "Role Access",
    desc: "Use organization roles, modules, permissions, and overrides to keep access precise.",
    color: "#334155",
    bg: "#f1f5f9",
  },
  {
    icon: BarChart3,
    label: "Dashboards",
    desc: "Give managers and admins the pipeline visibility they need to move fast.",
    color: "#155e75",
    bg: "#ecfeff",
  },
  {
    icon: Globe2,
    label: "Locations",
    desc: "Support country, state, postal code, and organization-level operating context.",
    color: "#7f1d1d",
    bg: "#fef2f2",
  },
];

export const leadPipeline = [
  { label: "New", desc: "Lead enters the system", value: "01" },
  { label: "Contacted", desc: "Executive reaches out", value: "02" },
  { label: "Qualified", desc: "Need and fit confirmed", value: "03" },
  { label: "Converted or Lost", desc: "Outcome is recorded", value: "04" },
];

export const services = [
  {
    icon: Target,
    num: "01",
    title: "Lead Management",
    tagline: "A clean pipeline from first touch to final status.",
    color: "#047857",
    bg: "#ecfdf5",
    features: ["Manual and imported leads", "Status, priority, source, and owner", "Lead codes and contact details", "Manager-ready pipeline visibility"],
  },
  {
    icon: CalendarClock,
    num: "02",
    title: "Activity Tracking",
    tagline: "Every conversation stays attached to the lead.",
    color: "#0f766e",
    bg: "#f0fdfa",
    features: ["Call, SMS, email, and in-person logs", "Notes and call outcomes", "Next follow-up dates", "Executive activity history"],
  },
  {
    icon: CircleDollarSign,
    num: "03",
    title: "Offer Management",
    tagline: "Campaign-ready offers without scattered spreadsheets.",
    color: "#a16207",
    bg: "#fefce8",
    features: ["Fixed, percentage, combo, and conditional discounts", "Valid-from and valid-to controls", "Active, inactive, draft, and expired states", "User-level offer assignments"],
  },
  {
    icon: Building2,
    num: "04",
    title: "Organization Administration",
    tagline: "Keep each tenant structured and governed.",
    color: "#155e75",
    bg: "#ecfeff",
    features: ["Organizations with trial windows", "Users, managers, and executives", "State and country coverage", "Active/inactive controls"],
  },
  {
    icon: KeyRound,
    num: "05",
    title: "Roles And Permissions",
    tagline: "Access that matches real operating responsibility.",
    color: "#334155",
    bg: "#f1f5f9",
    features: ["Modules and permissions", "Organization role mapping", "Role module permission matrix", "Organization-level overrides"],
  },
  {
    icon: PieChart,
    num: "06",
    title: "Dashboards And Reporting",
    tagline: "Leaders see the work before it becomes a bottleneck.",
    color: "#7f1d1d",
    bg: "#fef2f2",
    features: ["Manager cards and status overview", "Executive performance context", "Lead and offer signals", "Operational snapshots"],
  },
];

export const contactCards = [
  {
    icon: Users,
    label: "Sales Ops",
    title: "Lead Operations",
    email: "system.admin@saptarishi.tech",
    desc: "For lead assignment, follow-up queues, activity history, and pipeline questions.",
    color: "#047857",
    bg: "#ecfdf5",
  },
  {
    icon: ShieldCheck,
    label: "Access",
    title: "Account Support",
    email: "system.admin@saptarishi.tech",
    desc: "For login, reset links, roles, permissions, organization modules, and locked accounts.",
    color: "#334155",
    bg: "#f1f5f9",
  },
  {
    icon: Gift,
    label: "Offers",
    title: "Campaign Support",
    email: "info@saptarishi.tech",
    desc: "For discount setup, offer validity, user assignment, and active campaign checks.",
    color: "#a16207",
    bg: "#fefce8",
  },
  {
    icon: Mail,
    label: "General",
    title: "General Queries",
    email: "info@saptarishi.tech",
    desc: "For anything else related to PLMS operations and internal support.",
    color: "#0f766e",
    bg: "#f0fdfa",
  },
];

export const officeDetails = [
  { icon: Building2, label: "Company", value: "Saptarishi Solutions Pvt. Ltd." },
  { icon: MapPin, label: "Location", value: "Hyderabad, Telangana, India" },
  { icon: Mail, label: "Email", value: "info@saptarishi.tech" },
  { icon: Phone, label: "Support", value: "Internal portal support" },
];

export const roleHighlights = [
  { icon: Layers3, title: "System Admin", desc: "Controls organizations, modules, and the global operating setup." },
  { icon: ClipboardList, title: "Admin", desc: "Handles organization users, offers, and operational governance." },
  { icon: LineChart, title: "Manager", desc: "Tracks lead status, executive performance, and follow-up discipline." },
  { icon: ContactRound, title: "Executive", desc: "Works assigned leads, records activities, and keeps follow-ups moving." },
];

export const legalSections = {
  privacy: [
    {
      title: "What PLMS Stores",
      body: "PLMS stores account details, organization metadata, role and permission settings, lead records, lead activities, offer assignments, and location references required to run project lead workflows.",
    },
    {
      title: "How Data Is Used",
      body: "Data is used to authenticate users, assign work, manage lead follow-ups, review pipeline status, apply offers, support dashboards, and keep access scoped to the correct organization and role.",
    },
    {
      title: "Session And Cookies",
      body: "The portal uses secure session cookies and refresh-token cookies to keep authorized users signed in and to route them to the correct organization dashboard.",
    },
    {
      title: "Access Controls",
      body: "Users only receive access intended for their organization, role, enabled modules, permissions, and organization-specific overrides.",
    },
    {
      title: "Lead And Activity Data",
      body: "Lead records may include contact details, address information, status, source, priority, assignee, and activity notes. Activity records may include call outcomes, free-text notes, and next follow-up dates.",
    },
    {
      title: "Offer And Campaign Data",
      body: "Offer data is used to manage discount types, validity windows, assignments, and offer status. These records help teams apply campaigns consistently and audit operational decisions.",
    },
    {
      title: "Retention And Review",
      body: "PLMS data is retained for business continuity, support, audit, and reporting needs. Administrators may review records when investigating access issues, lead ownership, offer assignment, or workflow errors.",
    },
    {
      title: "Support Requests",
      body: "When users contact support, the team may use organization code, user email, lead code, and error context to diagnose issues. Support information is used only to resolve portal and workflow problems.",
    },
  ],
  terms: [
    {
      title: "Authorized Use",
      body: "PLMS is intended for authorized Saptarishi and customer-organization users managing project lead operations. Credentials must not be shared.",
    },
    {
      title: "Data Accuracy",
      body: "Users are responsible for entering accurate lead, activity, offer, and contact information so managers and administrators can rely on the dashboard.",
    },
    {
      title: "Operational Conduct",
      body: "Lead notes, follow-up records, and offer assignments should be used only for legitimate business workflows and internal review.",
    },
    {
      title: "System Availability",
      body: "PLMS may enter maintenance mode for upgrades, fixes, or administrative work. Access can be limited during these windows.",
    },
    {
      title: "Credential Security",
      body: "Users are responsible for protecting their login credentials and must report suspected unauthorized access immediately. Accounts, sessions, and tokens may be revoked when misuse is suspected.",
    },
    {
      title: "Role Boundaries",
      body: "Users must not attempt to access organizations, modules, routes, leads, offers, or user information outside their assigned permissions.",
    },
    {
      title: "Lead And Offer Integrity",
      body: "Lead status, activity notes, offer validity, discount values, and assignments must reflect legitimate business activity. Misleading records may be corrected or audited by administrators.",
    },
    {
      title: "Changes To Terms",
      body: "These terms may be updated as PLMS evolves. Continued use of the portal after updates means the user accepts the revised operating terms.",
    },
  ],
};

export const heroSignals = [
  { icon: ShieldCheck, label: "Organization-scoped access" },
  { icon: Activity, label: "Follow-up discipline" },
  { icon: Gift, label: "Offer-ready workflows" },
];

export const faqs = [
  {
    category: "Getting Started",
    question: "What is PLMS?",
    answer:
      "PLMS is the Project Lead Management System used to manage organizations, users, leads, follow-up activities, offers, permissions, locations, and dashboard visibility.",
  },
  {
    category: "Getting Started",
    question: "Who should use PLMS?",
    answer:
      "System admins, organization admins, managers, and executives use PLMS to keep project lead operations structured from capture to follow-up and outcome.",
  },
  {
    category: "Access",
    question: "Can logged-in users still view public pages?",
    answer:
      "Yes. Home, About, Services, FAQs, Contact, Privacy Policy, and Terms remain visible even when a user has an active session.",
  },
  {
    category: "Access",
    question: "What happens if I open /login while already signed in?",
    answer:
      "The proxy reads the PLMS refresh cookie and organization hint, then redirects you to your organization dashboard.",
  },
  {
    category: "Access",
    question: "Why am I redirected to home when opening a dashboard link?",
    answer:
      "Dashboard routes require the PLMS refresh cookie. If it is missing or expired, the app sends you to the public home page.",
  },
  {
    category: "Roles",
    question: "Who can see leads and offers?",
    answer:
      "Visibility is controlled by organization roles, enabled modules, permissions, and organization-level overrides configured by admins.",
  },
  {
    category: "Roles",
    question: "How are managers and executives connected?",
    answer:
      "Executive users can be assigned to a reporting manager. This allows managers to review pipeline movement, lead status, and performance context for their team.",
  },
  {
    category: "Leads",
    question: "What information is stored for a lead?",
    answer:
      "A lead can include name, gender, code, date of birth, phone, email, status, priority, source, import type, assigned executive, address, country, state, and postal code.",
  },
  {
    category: "Leads",
    question: "Which lead statuses are supported?",
    answer:
      "The backend schema supports New, Contacted, Qualified, and Lost. These states help teams understand where every lead sits in the pipeline.",
  },
  {
    category: "Leads",
    question: "Can leads be imported?",
    answer:
      "Yes. PLMS distinguishes manual entry and imported leads, so teams can track how records entered the system.",
  },
  {
    category: "Activities",
    question: "What activity types can be tracked?",
    answer:
      "PLMS supports call, SMS, email, in-person, and other activity types. Notes, call status, free text, and next follow-up date can be attached to a lead activity.",
  },
  {
    category: "Activities",
    question: "Why is next follow-up date important?",
    answer:
      "Next follow-up dates help managers and executives prevent warm leads from going cold and keep the pipeline accountable.",
  },
  {
    category: "Offers",
    question: "What kinds of offers can PLMS manage?",
    answer:
      "PLMS supports fixed amount, percentage, combo, buy-one-get-one, conditional, and flag discount models with validity windows and statuses.",
  },
  {
    category: "Offers",
    question: "Can offers be assigned to users?",
    answer:
      "Yes. Offer assignments link an offer to users, helping admins control which team members or workflows can use active campaigns.",
  },
  {
    category: "Organizations",
    question: "Does PLMS support multiple organizations?",
    answer:
      "Yes. The schema supports organizations with code, contact details, active status, country, state, trial dates, users, roles, modules, and permission overrides.",
  },
  {
    category: "Security",
    question: "How does PLMS protect access?",
    answer:
      "The app uses session cookies, refresh tokens, password reset tokens, role mappings, module permissions, and organization-specific permission overrides.",
  },
  {
    category: "Security",
    question: "What happens during maintenance mode?",
    answer:
      "Maintenance mode can restrict normal access while administrators perform upgrades, fixes, or operational work.",
  },
  {
    category: "Support",
    question: "What should I include when asking for support?",
    answer:
      "Share your organization code, user email, lead code when relevant, and the action that failed so support can trace the correct workflow.",
  },
];
