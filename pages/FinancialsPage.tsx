
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, Expense } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import ExpenseModal from '../components/ExpenseModal';
import { useAuth } from '../App';
import { useCurrency } from '../hooks/useCurrency';

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

const ExpenseRow: React.FC<{ expense: Expense; onEdit: () => void; }> = ({ expense, onEdit }) => {
    const { formatCurrency } = useCurrency();
    return (
        <tr className="border-b border-outline hover:bg-surface-variant/50 cursor-pointer" onClick={onEdit}>
            <td className="p-4 font-medium">{expense.description}</td>
            <td className="p-4">{expense.category}</td>
            <td className="p-4 text-right font-mono">
                <span className="text-red-400">-{formatCurrency(expense.amount)}</span>
            </td>
            <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
            <td className="p-4">{expense.submittedBy.name}</td>
            <td className="p-4 text-center">
                {expense.receiptUrl && <Icons.Receipt className="h-5 w-5 text-primary-400 mx-auto" />}
            </td>
        </tr>
    );
};

const FinancialsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { formatCurrency } = useCurrency();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

    const fetchProject = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const projectData = await mockDataService.getProject(id);
            setProject(projectData);
        } catch (error) {
            console.error("Failed to fetch project financials:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleOpenModal = (expense: Expense | null) => {
        setExpenseToEdit(expense);
        setIsExpenseModalOpen(true);
    };

    const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'submittedBy'>) => {
        if (!id || !user) return;

        if (expenseToEdit) {
            await mockDataService.updateExpense(id, { ...expenseToEdit, ...expenseData });
        } else {
            await mockDataService.createExpense(id, { ...expenseData, submittedBy: user });
        }
        fetchProject();
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project) {
        return <div className="text-center text-red-400">Project not found.</div>;
    }

    const netProfit = project.revenue - project.actualCost;
    const profitColor = netProfit >= 0 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="space-y-6">
            <div>
                <Link to={`/project/${id}`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Project Overview
                </Link>
                 <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
                        <p className="text-on-surface-variant">Project: {project.name}</p>
                    </div>
                     <Button variant="tonal" onClick={() => navigate(`/project/${id}/invoices`)}>
                        <Icons.ClientInvoice className="mr-2 h-5 w-5" />
                        Client Invoices
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={Icons.Budget} title="Total Budget" value={formatCurrency(project.budget, { compact: true })} />
                 <StatCard icon={Icons.Financials} title="Actual Cost" value={formatCurrency(project.actualCost, { compact: true })} />
                 <StatCard icon={Icons.Revenue} title="Total Revenue" value={formatCurrency(project.revenue, { compact: true })} />
                 <StatCard icon={Icons.Reports} title="Net Profit" value={
                     <span className={profitColor}>{formatCurrency(netProfit, { compact: true })}</span>
                 } />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-on-surface">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                <tr>
                                    <th scope="col" className="p-4">Description</th>
                                    <th scope="col" className="p-4">Category</th>
                                    <th scope="col" className="p-4 text-right">Amount</th>
                                    <th scope="col" className="p-4">Date</th>
                                    <th scope="col" className="p-4">Submitted By</th>
                                    <th scope="col" className="p-4 text-center">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.expenses.map(exp => <ExpenseRow key={exp.id} expense={exp} onEdit={() => handleOpenModal(exp)} />)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ExpenseModal 
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={handleSaveExpense}
                expenseToEdit={expenseToEdit}
            />

             <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => handleOpenModal(null)}>
                <Icons.Add className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">Log New Expense</span>
            </Button>
        </div>
    );
}

export default FinancialsPage;