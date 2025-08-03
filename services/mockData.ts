import { Project, User, Role, Task, TaskStatus, OrderStatus, ExpenseCategory, InventoryItem, Order, Expense, Log, MaterialConsumption, ClientInvoice, InvoiceStatus, InvoiceLineItem, ProjectTeamMember, AttendanceStatus, AttendanceRecord, Document, ProjectStatus, FinancialReportData, LaborReportData } from '../types';
import { faker } from '@faker-js/faker';

// --- MOCK USERS ---
const users: User[] = [
    { id: '1', name: 'Sanjay Sharma', email: 'manager@banaisuite.com', role: Role.PROJECT_MANAGER, avatarUrl: faker.image.avatar() },
    { id: '2', name: 'Rina Dahal', email: 'engineer@banaisuite.com', role: Role.SITE_ENGINEER, avatarUrl: faker.image.avatar() },
    { id: '3', name: 'Anil Mehta', email: 'accountant@banaisuite.com', role: Role.ACCOUNTANT, avatarUrl: faker.image.avatar() },
    { id: '4', name: 'Bikash Rai', email: 'storekeeper@banaisuite.com', role: Role.STORE_KEEPER, avatarUrl: faker.image.avatar() },
    { id: '5', name: 'Sunita Joshi', email: 'client@banaisuite.com', role: Role.CLIENT, avatarUrl: faker.image.avatar() },
    { id: '6', name: 'Hari Bahadur', role: Role.SITE_ENGINEER, email: 'hari@banaisuite.com', avatarUrl: faker.image.avatar() },
    { id: '7', name: 'Gita Thapa', role: Role.SITE_ENGINEER, email: 'gita@banaisuite.com', avatarUrl: faker.image.avatar() }
];

const generateTeam = (teamUsers: User[]): ProjectTeamMember[] => {
    return teamUsers.map(user => ({
        user,
        projectRole: faker.helpers.arrayElement(['Foreman', 'Carpenter', 'Mason', 'Electrician', 'Plumber', 'Operator']),
        dailyWage: faker.number.int({ min: 800, max: 3500 })
    }));
};

const generateTasks = (count: number, team: ProjectTeamMember[]): Task[] => Array.from({ length: count }, (_, i) => ({
    id: faker.string.uuid(),
    title: faker.hacker.phrase().replace(/^./, (letter) => letter.toUpperCase()),
    description: faker.lorem.sentence(),
    assignee: faker.helpers.arrayElement(team.map(tm => tm.user)),
    status: faker.helpers.arrayElement(Object.values(TaskStatus)),
    startDate: faker.date.recent({ days: 30 }).toISOString(),
    dueDate: faker.date.future({ days: 60 }).toISOString(),
    dependencies: [],
}));

const generateInventory = (): InventoryItem[] => [
    { id: 'inv1', name: 'Cement (OPC)', quantity: 500, unit: 'bags', threshold: 100 },
    { id: 'inv2', name: 'Steel Rebar (12mm)', quantity: 2500, unit: 'kg', threshold: 500 },
    { id: 'inv3', name: 'Sand', quantity: 120, unit: 'cubic meters', threshold: 5 },
    { id: 'inv4', name: 'Diesel', quantity: 800, unit: 'liters', threshold: 200 },
    { id: 'inv5', name: 'PVC pipe', quantity: 0, unit: 'kg', threshold: 200 },
];

const generateOrders = (team: ProjectTeamMember[]): Order[] => [
    { id: 'ord1', items: [{ name: 'Cement (OPC)', quantity: 200, unit: 'bags' }], status: OrderStatus.RECEIVED, requestedBy: team[1].user, approvedBy: team[0].user, createdAt: faker.date.recent({ days: 10 }).toISOString(), receivedAt: faker.date.recent({ days: 2 }).toISOString(), invoiceUrl: '/invoices/sample-invoice.pdf' },
    { id: 'ord2', items: [{ name: 'Diesel', quantity: 500, unit: 'liters' }], status: OrderStatus.SENT, requestedBy: team[3].user, approvedBy: team[0].user, createdAt: faker.date.recent({ days: 5 }).toISOString() },
    { id: 'ord3', items: [{ name: 'Steel Rebar (12mm)', quantity: 1000, unit: 'kg' }], status: OrderStatus.PENDING, requestedBy: team[1].user, createdAt: faker.date.recent({ days: 1 }).toISOString() },
    { id: 'ord4', items: [{ name: 'Sand', quantity: 50, unit: 'cubic meters' }], status: OrderStatus.APPROVED, requestedBy: team[1].user, approvedBy: team[0].user, createdAt: faker.date.recent({ days: 3 }).toISOString() },
];

const generateExpenses = (team: ProjectTeamMember[]): Expense[] => [
    { id: 'exp1', description: 'Labor payment for week 4', amount: 150000, category: ExpenseCategory.LABOR, date: faker.date.recent({ days: 7 }).toISOString(), submittedBy: team[2].user, receiptUrl: '/receipts/sample.pdf' },
    { id: 'exp2', description: 'Purchase of safety helmets', amount: 8000, category: ExpenseCategory.MATERIAL, date: faker.date.recent({ days: 15 }).toISOString(), submittedBy: team[1].user },
    { id: 'exp3', description: 'Fuel for excavator', amount: 12000, category: ExpenseCategory.FUEL, date: faker.date.recent({ days: 3 }).toISOString(), submittedBy: team[3].user },
];

const generateLineItems = (count: number): { lineItems: InvoiceLineItem[], total: number } => {
    const items: InvoiceLineItem[] = Array.from({ length: count }, () => {
        const quantity = faker.number.int({ min: 10, max: 100 });
        const unitPrice = faker.number.int({ min: 50, max: 500 });
        return {
            id: faker.string.uuid(),
            description: faker.commerce.productName(),
            quantity,
            unitPrice,
        };
    });
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return { lineItems: items, total };
}

const generateClientInvoices = (): ClientInvoice[] => {
    const inv1Data = generateLineItems(2);
    const inv2Data = generateLineItems(3);
    const inv3Data = generateLineItems(1);
    
    return [
        { id: 'ci1', invoiceNumber: 'INV-2024-001', title: 'Mobilization Advance', lineItems: inv1Data.lineItems, amount: inv1Data.total, status: InvoiceStatus.PAID, issueDate: faker.date.past({ years: 1 }).toISOString(), dueDate: faker.date.past({ years: 1 }).toISOString() },
        { id: 'ci2', invoiceNumber: 'INV-2024-002', title: 'First Running Bill', lineItems: inv2Data.lineItems, amount: inv2Data.total, status: InvoiceStatus.PAID, issueDate: faker.date.recent({ days: 60 }).toISOString(), dueDate: faker.date.recent({ days: 30 }).toISOString() },
        { id: 'ci3', invoiceNumber: 'INV-2024-003', title: 'Second Running Bill', lineItems: inv3Data.lineItems, amount: inv3Data.total, status: InvoiceStatus.SENT, issueDate: faker.date.recent({ days: 10 }).toISOString(), dueDate: faker.date.future({ days: 20 }).toISOString() },
    ];
};

const generateLogs = (team: ProjectTeamMember[]): Log[] => [
    { id: 'log1', user: team[1].user, action: 'Task Status Update', timestamp: faker.date.recent({ days: 1 }).toISOString(), details: `Updated task "<strong>Foundation Excavation</strong>" to <i>In Progress</i>` },
    { id: 'log2', user: team[3].user, action: 'Inventory Request', timestamp: faker.date.recent({ days: 2 }).toISOString(), details: `Requested <strong>200 bags</strong> of Cement (OPC)` },
    { id: 'log3', user: team[2].user, action: 'Expense Logged', timestamp: faker.date.recent({ days: 3 }).toISOString(), details: `Logged an expense of <strong>CURRENCY[12000]</strong> for 'Fuel'` },
    { id: 'log4', user: team[0].user, action: 'Budget Adjustment', timestamp: faker.date.recent({ days: 5 }).toISOString(), details: `Increased project budget by <strong>5%</strong>` },
];

const generateAttendance = (team: ProjectTeamMember[]): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) { // last 30 days
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];

        team.forEach(member => {
            records.push({
                date: dateString,
                memberId: member.user.id,
                status: faker.helpers.arrayElement(Object.values(AttendanceStatus))
            });
        });
    }
    return records;
};

const generateDocuments = (team: ProjectTeamMember[]): Document[] => [
    {
        id: faker.string.uuid(),
        name: 'Foundation Blueprint v2.pdf',
        url: '/docs/foundation.pdf',
        type: 'Drawing',
        version: 2,
        uploadedBy: team[1].user,
        uploadedAt: faker.date.recent({ days: 20 }).toISOString()
    },
    {
        id: faker.string.uuid(),
        name: 'Electrical Permit E-101.pdf',
        url: '/docs/permit.pdf',
        type: 'Permit',
        version: 1,
        uploadedBy: team[0].user,
        uploadedAt: faker.date.recent({ days: 45 }).toISOString()
    },
    {
        id: faker.string.uuid(),
        name: 'Site-Photo-Week-4.jpg',
        url: faker.image.urlLoremFlickr({ category: 'construction' }),
        type: 'Image',
        version: 1,
        uploadedBy: team[1].user,
        uploadedAt: faker.date.recent({ days: 5 }).toISOString()
    }
];



// --- MOCK SERVICES ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Mock Auth Service
export const mockAuthService = {
  getLoggedInUser: async (): Promise<User | null> => {
    await delay(300);
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  },
  login: async (email: string, password?: string, name?: string): Promise<User | null> => {
    await delay(500);
    const user = users.find(u => u.email === email) || (name ? { id: faker.string.uuid(), name, email, role: Role.SITE_ENGINEER, avatarUrl: faker.image.avatar() } as User : null);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  },
  logout: () => {
    localStorage.removeItem('currentUser');
  },
  getAllUsers: async (): Promise<User[]> => {
    await delay(100);
    return users;
  }
};

// Mock Data Service
export const mockDataService = {
  logMaterialConsumption: async (projectId: string, consumptionData: { itemId: string; quantity: number; date: string; loggedBy: User; }) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const item = project.inventory.find(i => i.id === consumptionData.itemId);
    if (!item) throw new Error('Inventory item not found');

    // 1. Deduct from stock
    item.quantity -= consumptionData.quantity;

    // 2. Create consumption log
    const consumptionRecord: MaterialConsumption = {
        id: faker.string.uuid(),
        itemId: item.id,
        itemName: item.name,
        quantity: consumptionData.quantity,
        unit: item.unit,
        date: consumptionData.date,
        loggedBy: consumptionData.loggedBy,
    };
    project.consumptionHistory.unshift(consumptionRecord);
    
    // 3. Add to general project log
    const logEntry: Log = {
        id: faker.string.uuid(),
        user: consumptionData.loggedBy,
        action: 'Material Consumption',
        timestamp: new Date().toISOString(),
        details: `Logged usage of <strong>${consumptionData.quantity} ${item.unit}</strong> of <i>${item.name}</i>.`
    };
    project.logs.unshift(logEntry);

    return Promise.resolve();
  },

  // --- Financials ---
  createExpense: async (projectId: string, expenseData: Omit<Expense, 'id'>) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const newExpense: Expense = { id: faker.string.uuid(), ...expenseData };
    project.expenses.unshift(newExpense);
    
    // Recalculate actual cost
    project.actualCost = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Add log entry
    project.logs.unshift({
        id: faker.string.uuid(),
        user: expenseData.submittedBy,
        action: 'Expense Logged',
        timestamp: new Date().toISOString(),
        details: `Logged an expense of <strong>CURRENCY[${expenseData.amount}]</strong> for <i>${expenseData.description}</i>.`
    });
  },
  updateExpense: async (projectId: string, updatedExpense: Expense) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const expenseIndex = project.expenses.findIndex(e => e.id === updatedExpense.id);
    if (expenseIndex !== -1) {
        project.expenses[expenseIndex] = updatedExpense;
        project.actualCost = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    }
  },
  createClientInvoice: async (projectId: string, invoiceData: Omit<ClientInvoice, 'id' | 'invoiceNumber' | 'status' | 'amount'>) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const amount = invoiceData.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const newInvoice: ClientInvoice = {
        id: faker.string.uuid(),
        invoiceNumber: `INV-2024-${(project.clientInvoices.length + 1).toString().padStart(3, '0')}`,
        status: InvoiceStatus.DRAFT,
        ...invoiceData,
        amount,
    };
    project.clientInvoices.unshift(newInvoice);
  },
  updateClientInvoice: async (projectId: string, updatedInvoice: ClientInvoice) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const invoiceIndex = project.clientInvoices.findIndex(i => i.id === updatedInvoice.id);
    if (invoiceIndex !== -1) {
        // Recalculate amount in case line items changed
        updatedInvoice.amount = updatedInvoice.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        project.clientInvoices[invoiceIndex] = updatedInvoice;
        // Recalculate revenue if status changed
        project.revenue = project.clientInvoices.filter(inv => inv.status === InvoiceStatus.PAID).reduce((sum, inv) => sum + inv.amount, 0);
    }
  },

  // --- Team and Labor ---
  addTeamMember: async (projectId: string, memberData: Omit<ProjectTeamMember, 'user'> & { userId: string }) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    const user = users.find(u => u.id === memberData.userId);
    if (project && user) {
        const newMember: ProjectTeamMember = {
            user,
            projectRole: memberData.projectRole,
            dailyWage: memberData.dailyWage,
        };
        project.team.push(newMember);
    }
  },
  updateTeamMember: async (projectId: string, updatedMemberData: ProjectTeamMember) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const memberIndex = project.team.findIndex(m => m.user.id === updatedMemberData.user.id);
        if (memberIndex !== -1) {
            project.team[memberIndex] = updatedMemberData;
        }
    }
  },
  removeTeamMember: async (projectId: string, memberId: string) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (project) {
        project.team = project.team.filter(m => m.user.id !== memberId);
    }
  },
  updateAttendance: async (projectId: string, record: AttendanceRecord) => {
    await delay(100);
    const project = projects.find(p => p.id === projectId);
    if (project) {
        const recordIndex = project.attendance.findIndex(a => a.date === record.date && a.memberId === record.memberId);
        if (recordIndex !== -1) {
            project.attendance[recordIndex] = record;
        } else {
            project.attendance.push(record);
        }
    }
  },

  // --- Documents ---
  addDocument: async (projectId: string, docData: { file: File; type: Document['type']; uploadedBy: User }) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const newDoc: Document = {
      id: faker.string.uuid(),
      name: docData.file.name,
      url: URL.createObjectURL(docData.file), // Create a temporary URL for the uploaded file
      type: docData.type,
      version: 1,
      uploadedBy: docData.uploadedBy,
      uploadedAt: new Date().toISOString()
    };
    project.documents.unshift(newDoc);

    project.logs.unshift({
        id: faker.string.uuid(),
        user: docData.uploadedBy,
        action: 'Document Upload',
        timestamp: new Date().toISOString(),
        details: `Uploaded a new document: <strong>${newDoc.name}</strong>`
    });

    return newDoc;
  },

  updateDocumentVersion: async (projectId: string, docId: string, docData: { file: File; uploadedBy: User }) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');
    
    const docIndex = project.documents.findIndex(d => d.id === docId);
    if (docIndex !== -1) {
        const oldDoc = project.documents[docIndex];
        project.documents[docIndex] = {
            ...oldDoc,
            name: docData.file.name,
            version: oldDoc.version + 1,
            uploadedBy: docData.uploadedBy,
            uploadedAt: new Date().toISOString(),
            url: URL.createObjectURL(docData.file), // Create a new URL for the new version
        };

        project.logs.unshift({
            id: faker.string.uuid(),
            user: docData.uploadedBy,
            action: 'Document Update',
            timestamp: new Date().toISOString(),
            details: `Uploaded a new version (v${oldDoc.version + 1}) for document: <strong>${docData.file.name}</strong>`
        });
    }
  },

  deleteDocument: async (projectId: string, docId: string, currentUser: User) => {
    await delay(300);
    const project = projects.find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const docToDelete = project.documents.find(d => d.id === docId);
    if (!docToDelete) return;

    project.documents = project.documents.filter(d => d.id !== docId);
    
    project.logs.unshift({
        id: faker.string.uuid(),
        user: currentUser,
        action: 'Document Deletion',
        timestamp: new Date().toISOString(),
        details: `Deleted document: <strong>${docToDelete.name}</strong> (v${docToDelete.version})`
    });

    return;
  },

  // --- Reports ---
  generateFinancialReport: async (projectId: string, startDate: string, endDate: string): Promise<FinancialReportData | null> => {
      await delay(400);
      const project = projects.find(p => p.id === projectId);
      if (!project) return null;

      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      const revenueItems = project.clientInvoices.filter(inv => {
          const issueDate = new Date(inv.issueDate);
          return inv.status === InvoiceStatus.PAID && issueDate >= start && issueDate <= end;
      });

      const expenseItems = project.expenses.filter(exp => {
          const expenseDate = new Date(exp.date);
          return expenseDate >= start && expenseDate <= end;
      });

      const totalRevenue = revenueItems.reduce((sum, inv) => sum + inv.amount, 0);
      const totalExpenses = expenseItems.reduce((sum, exp) => sum + exp.amount, 0);

      const expenseBreakdown = Object.values(ExpenseCategory).map(category => ({
          category,
          amount: expenseItems.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0)
      })).filter(item => item.amount > 0);

      return {
          startDate,
          endDate,
          totalRevenue,
          totalExpenses,
          netProfit: totalRevenue - totalExpenses,
          expenseBreakdown,
          revenueItems,
          expenseItems,
      };
  },

  generateLaborReport: async (projectId: string, startDate: string, endDate: string): Promise<LaborReportData | null> => {
    await delay(400);
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendanceInRange = project.attendance.filter(a => {
        const recordDate = new Date(a.date);
        return recordDate >= start && recordDate <= end;
    });

    const entries = project.team.map(member => {
        const memberAttendance = attendanceInRange.filter(a => a.memberId === member.user.id);
        const presentDays = memberAttendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
        const absentDays = memberAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
        const halfDays = memberAttendance.filter(a => a.status === AttendanceStatus.HALF_DAY).length;

        const totalWages = (presentDays * member.dailyWage) + (halfDays * member.dailyWage / 2);
        
        return {
            member,
            presentDays,
            absentDays,
            halfDays,
            totalWages
        };
    });

    const totalWages = entries.reduce((sum, e) => sum + e.totalWages, 0);
    const totalPresentDays = entries.reduce((sum, e) => sum + e.presentDays, 0);
    const totalAbsentDays = entries.reduce((sum, e) => sum + e.absentDays, 0);
    const totalHalfDays = entries.reduce((sum, e) => sum + e.halfDays, 0);

    return {
        entries,
        totalWages,
        totalPresentDays,
        totalAbsentDays,
        totalHalfDays,
    };
  },
};