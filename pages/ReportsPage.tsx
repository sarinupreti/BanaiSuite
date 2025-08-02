
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, FinancialReportData, LaborReportData, ExpenseCategory, ClientInvoice, Expense } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import { useCurrency } from '../hooks/useCurrency';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type ReportType = 'financial' | 'labor';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: React.ReactNode; }> = ({ icon: Icon, title, value }) => (
    <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-container rounded-full">
                 <Icon className="h-6 w-6 text-on-primary-container" />
            </div>
            <div>
                <p className="text-2xl font-bold text-on-surface">{value}</p>
                <p className="text-sm text-on-surface-variant">{title}</p>
            </div>
        </CardContent>
    </Card>
);

const ReportsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportType>('financial');
    
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const [startDate, setStartDate] = useState(lastMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [financialReport, setFinancialReport] = useState<FinancialReportData | null>(null);
    const [laborReport, setLaborReport] = useState<LaborReportData | null>(null);

    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (!id) return;
        const fetchProjectData = async () => {
            setIsLoading(true);
            try {
                const projectData = await mockDataService.getProject(id);
                setProject(projectData);
            } catch (error) {
                console.error("Failed to fetch project data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjectData();
    }, [id]);

    const handleGenerateReport = async () => {
        if (!id) return;
        setIsGenerating(true);
        if (activeTab === 'financial') {
            setLaborReport(null);
            const report = await mockDataService.generateFinancialReport(id, startDate, endDate);
            setFinancialReport(report);
        } else {
            setFinancialReport(null);
            const report = await mockDataService.generateLaborReport(id, startDate, endDate);
            setLaborReport(report);
        }
        setIsGenerating(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project) {
        return <div className="text-center text-red-400">Project not found.</div>;
    }

    const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];
    const netProfit = financialReport ? financialReport.netProfit : 0;
    const profitColor = netProfit >= 0 ? 'text-green-400' : 'text-red-400';

    const renderFinancialReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={Icons.Revenue} title="Total Revenue" value={formatCurrency(financialReport!.totalRevenue)} />
                <StatCard icon={Icons.Financials} title="Total Expenses" value={formatCurrency(financialReport!.totalExpenses)} />
                <StatCard icon={Icons.Reports} title="Net Profit / Loss" value={<span className={profitColor}>{formatCurrency(netProfit)}</span>} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={financialReport!.expenseBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                    if (percent === 0) return null;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                    return <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>;
                                }}>
                                    {financialReport!.expenseBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
                    <CardContent>
                        <h3 className="text-base font-semibold text-on-surface mb-2">Revenue Items (Paid Invoices)</h3>
                        <div className="overflow-auto max-h-40 mb-4 text-sm">
                           {financialReport!.revenueItems.length > 0 ? financialReport!.revenueItems.map(item => (
                                <div key={item.id} className="flex justify-between p-2 border-b border-outline">
                                    <span>{item.invoiceNumber}: {item.title}</span>
                                    <span className="font-mono text-green-400">{formatCurrency(item.amount)}</span>
                                </div>
                            )) : <p className="text-on-surface-variant text-xs">No revenue in this period.</p>}
                        </div>
                        <h3 className="text-base font-semibold text-on-surface mb-2">Expense Items</h3>
                        <div className="overflow-auto max-h-40 text-sm">
                           {financialReport!.expenseItems.length > 0 ? financialReport!.expenseItems.map(item => (
                                <div key={item.id} className="flex justify-between p-2 border-b border-outline">
                                    <span>{item.description} ({item.category})</span>
                                    <span className="font-mono text-red-400">-{formatCurrency(item.amount)}</span>
                                </div>
                            )) : <p className="text-on-surface-variant text-xs">No expenses in this period.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
    
    const renderLaborReport = () => (
         <Card>
            <CardHeader>
                <CardTitle>Labor Summary</CardTitle>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center">
                    <div className="p-3 bg-surface-variant rounded-lg"><p className="text-xl font-bold">{formatCurrency(laborReport!.totalWages)}</p><p className="text-xs text-on-surface-variant">Total Wages Paid</p></div>
                    <div className="p-3 bg-surface-variant rounded-lg"><p className="text-xl font-bold">{laborReport!.totalPresentDays}</p><p className="text-xs text-on-surface-variant">Total Present Days</p></div>
                    <div className="p-3 bg-surface-variant rounded-lg"><p className="text-xl font-bold">{laborReport!.totalAbsentDays}</p><p className="text-xs text-on-surface-variant">Total Absent Days</p></div>
                    <div className="p-3 bg-surface-variant rounded-lg"><p className="text-xl font-bold">{laborReport!.totalHalfDays}</p><p className="text-xs text-on-surface-variant">Total Half Days</p></div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-on-surface">
                        <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                            <tr>
                                <th className="p-4">Team Member</th>
                                <th className="p-4 text-center">Present</th>
                                <th className="p-4 text-center">Absent</th>
                                <th className="p-4 text-center">Half Day</th>
                                <th className="p-4 text-right">Wages Earned</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laborReport!.entries.map(entry => (
                                <tr key={entry.member.user.id} className="border-b border-outline">
                                    <td className="p-4 font-medium">{entry.member.user.name} ({entry.member.projectRole})</td>
                                    <td className="p-4 text-center font-mono">{entry.presentDays}</td>
                                    <td className="p-4 text-center font-mono">{entry.absentDays}</td>
                                    <td className="p-4 text-center font-mono">{entry.halfDays}</td>
                                    <td className="p-4 text-right font-mono">{formatCurrency(entry.totalWages)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    main { padding: 0 !important; }
                    .print-container { padding: 1rem; }
                    .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
                    .print-bg-surface { background-color: #f8fafc !important; }
                }
            `}</style>
            <div className="no-print">
                <Link to={`/project/${id}`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Project Overview
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Project Reports</h1>
                <p className="text-on-surface-variant">Project: {project.name}</p>
            </div>
            
            <Card className="no-print">
                <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full max-w-xs rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"/>
                        <span>to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full max-w-xs rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"/>
                    </div>
                     <div className="flex gap-2">
                         <Button variant="tonal" onClick={handleGenerateReport} isLoading={isGenerating}>
                             <Icons.Reports className="mr-2 h-4 w-4" /> Generate Report
                         </Button>
                         <Button variant="filled" onClick={() => window.print()} disabled={!financialReport && !laborReport}>
                             <Icons.Printer className="mr-2 h-4 w-4" /> Print Report
                         </Button>
                     </div>
                </CardContent>
                 <div className="border-b border-outline flex space-x-2 px-4">
                    <button onClick={() => { setActiveTab('financial'); setFinancialReport(null); setLaborReport(null); }} className={`px-4 py-2 text-sm font-medium ${activeTab === 'financial' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-on-surface-variant hover:text-on-surface'}`}>
                        Financial Report
                    </button>
                    <button onClick={() => { setActiveTab('labor'); setFinancialReport(null); setLaborReport(null); }} className={`px-4 py-2 text-sm font-medium ${activeTab === 'labor' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-on-surface-variant hover:text-on-surface'}`}>
                        Labor Report
                    </button>
                </div>
            </Card>

            <div className="print-container">
                {(financialReport || laborReport) && (
                    <div className="print-header mb-4 hidden print:block">
                        <h1 className="text-2xl font-bold">{project.name} - {activeTab === 'financial' ? 'Financial Report' : 'Labor Report'}</h1>
                        <p className="text-sm">Period: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</p>
                    </div>
                )}
                {isGenerating && <div className="flex justify-center items-center h-40"><Icons.Spinner className="h-8 w-8 animate-spin text-primary-500" /></div>}
                
                {activeTab === 'financial' && financialReport && renderFinancialReport()}
                {activeTab === 'labor' && laborReport && renderLaborReport()}

                {!isGenerating && !financialReport && !laborReport && (
                    <div className="text-center py-16 px-4 bg-surface rounded-2xl border-2 border-dashed border-outline no-print">
                        <Icons.Reports className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-4 text-lg font-semibold text-on-surface">Generate a Report</h3>
                        <p className="mt-1 text-sm text-on-surface-variant">Select a date range and click "Generate Report" to view data.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
