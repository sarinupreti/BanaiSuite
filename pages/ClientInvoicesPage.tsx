
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, ClientInvoice, InvoiceStatus } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import ClientInvoiceModal from '../components/ClientInvoiceModal';
import { useCurrency } from '../hooks/useCurrency';

const statusMap = {
    [InvoiceStatus.DRAFT]: { icon: Icons.Tasks, color: 'text-gray-400', label: 'Draft' },
    [InvoiceStatus.SENT]: { icon: Icons.Send, color: 'text-blue-400', label: 'Sent' },
    [InvoiceStatus.PAID]: { icon: Icons.Success, color: 'text-green-400', label: 'Paid' },
    [InvoiceStatus.OVERDUE]: { icon: Icons.Alert, color: 'text-red-400', label: 'Overdue' },
};

const InvoiceRow: React.FC<{ invoice: ClientInvoice; onEdit: () => void; onView: () => void; }> = ({ invoice, onEdit, onView }) => {
    const { formatCurrency } = useCurrency();
    const { icon: Icon, color, label } = statusMap[invoice.status];
    return (
        <tr className="border-b border-outline hover:bg-surface-variant/50 cursor-pointer" onClick={onEdit}>
            <td className="p-4 font-medium">{invoice.invoiceNumber}</td>
            <td className="p-4">{invoice.title}</td>
            <td className="p-4 text-right font-mono">{formatCurrency(invoice.amount)}</td>
            <td className="p-4">{new Date(invoice.issueDate).toLocaleDateString()}</td>
            <td className="p-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
            <td className="p-4">
                 <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </div>
            </td>
            <td className="p-4 text-center">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(); }}>
                    <Icons.Printer className="h-4 w-4 mr-2" />
                    View & Print
                </Button>
            </td>
        </tr>
    );
};

const ClientInvoicesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceToEdit, setInvoiceToEdit] = useState<ClientInvoice | null>(null);

    const fetchProject = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const projectData = await mockDataService.getProject(id);
            setProject(projectData);
        } catch (error) {
            console.error("Failed to fetch project invoices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleOpenModal = (invoice: ClientInvoice | null) => {
        setInvoiceToEdit(invoice);
        setIsModalOpen(true);
    };
    
    const handleSaveInvoice = async (invoiceData: any) => {
        if (!id) return;
        if(invoiceToEdit) {
            await mockDataService.updateClientInvoice(id, invoiceData);
        } else {
            await mockDataService.createClientInvoice(id, invoiceData);
        }
        fetchProject();
    };

    const handleViewInvoice = (invoiceId: string) => {
        navigate(`/project/${id}/invoice/${invoiceId}`);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project) {
        return <div className="text-center text-red-400">Project not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                 <Link to={`/project/${id}/financials`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Financials
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Invoices</h1>
                    <p className="text-on-surface-variant">Project: {project.name}</p>
                </div>
            </div>
            
            <Card>
                <CardHeader><CardTitle>All Invoices</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-on-surface">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                <tr>
                                    <th scope="col" className="p-4">Invoice #</th>
                                    <th scope="col" className="p-4">Title</th>
                                    <th scope="col" className="p-4 text-right">Amount</th>
                                    <th scope="col" className="p-4">Issue Date</th>
                                    <th scope="col" className="p-4">Due Date</th>
                                    <th scope="col" className="p-4">Status</th>
                                    <th scope="col" className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.clientInvoices.length > 0 ? (
                                    project.clientInvoices.map(inv => <InvoiceRow key={inv.id} invoice={inv} onEdit={() => handleOpenModal(inv)} onView={() => handleViewInvoice(inv.id)} />)
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center p-8 text-on-surface-variant">
                                            No client invoices have been created for this project yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ClientInvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveInvoice}
                invoiceToEdit={invoiceToEdit}
            />

            <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => handleOpenModal(null)}>
                <Icons.Add className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">Create Invoice</span>
            </Button>
        </div>
    )
}

export default ClientInvoicesPage;