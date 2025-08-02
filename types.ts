
export enum Role {
  SUPER_ADMIN = 'Super Admin',
  PROJECT_MANAGER = 'Project Manager',
  SITE_ENGINEER = 'Site Engineer',
  STORE_KEEPER = 'Store Keeper',
  ACCOUNTANT = 'Accountant',
  CLIENT = 'Client',
  VENDOR = 'Vendor',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
}

export interface ProjectTeamMember {
    user: User;
    projectRole: string;
    dailyWage: number;
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  BLOCKED = 'Blocked',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee?: User;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  dependencies: string[]; // array of task IDs
}

export enum OrderStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  SENT = 'Sent',
  RECEIVED = 'Received',
  REJECTED = 'Rejected',
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

export interface Order {
  id: string;
  items: { name: string; quantity: number; unit: string }[];
  status: OrderStatus;
  requestedBy: User;
  approvedBy?: User;
  createdAt: string;
  receivedAt?: string;
  invoiceUrl?: string;
}

export enum ExpenseCategory {
    LABOR = 'Labor',
    MATERIAL = 'Material',
    FUEL = 'Fuel',
    EQUIPMENT_RENTAL = 'Equipment Rental',
    SUBCONTRACTOR = 'Subcontractor',
    OVERHEAD = 'Overhead',
    MISC = 'Miscellaneous'
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  submittedBy: User;
  receiptUrl?: string;
}

export interface Log {
  id: string;
  user: User;
  action: string;
  timestamp: string;
  details: string;
}

export interface Equipment {
    id: string;
    name: string;
    type: string; // e.g., 'Excavator', 'Truck'
    status: 'Idle' | 'In Use' | 'Maintenance';
    fuelConsumptionRate: number; // liters per hour
}

export interface Document {
    id: string;
    name: string;
    url: string;
    type: 'Drawing' | 'PDF' | 'Image' | 'Permit';
    version: number;
    uploadedBy: User;
    uploadedAt: string;
}

export enum AttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent',
    HALF_DAY = 'Half Day',
}

export interface AttendanceRecord {
    date: string; // YYYY-MM-DD
    memberId: string; // Corresponds to User.id
    status: AttendanceStatus;
}


export interface SiteInstruction {
    id: string;
    instruction: string;
    issuedBy: User;
    issuedTo: User;
    date: string;
    isCompleted: boolean;
}

export interface MaterialConsumption {
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    date: string;
    loggedBy: User;
}

export enum InvoiceStatus {
    DRAFT = 'Draft',
    SENT = 'Sent',
    PAID = 'Paid',
    OVERDUE = 'Overdue',
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  lineItems: InvoiceLineItem[];
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
}

export enum ProjectStatus {
    ACTIVE = 'Active',
    ARCHIVED = 'Archived',
    COMPLETED = 'Completed',
}

export interface LaborReportEntry {
    member: ProjectTeamMember;
    presentDays: number;
    absentDays: number;
    halfDays: number;
    totalWages: number;
}

export interface LaborReportData {
    entries: LaborReportEntry[];
    totalWages: number;
    totalPresentDays: number;
    totalAbsentDays: number;
    totalHalfDays: number;
}

export interface FinancialReportData {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    expenseBreakdown: { category: ExpenseCategory, amount: number }[];
    revenueItems: ClientInvoice[];
    expenseItems: Expense[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: ProjectStatus;
  actualCost: number;
  revenue: number;
  progress: number;
  tasks: Task[];
  team: ProjectTeamMember[];
  inventory: InventoryItem[];
  orders: Order[];
  expenses: Expense[];
  clientInvoices: ClientInvoice[];
  logs: Log[];
  equipment: Equipment[];
  documents: Document[];
  attendance: AttendanceRecord[];
  siteInstructions: SiteInstruction[];
  consumptionHistory: MaterialConsumption[];
}
