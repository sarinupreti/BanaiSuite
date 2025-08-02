
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, ClientInvoice, InvoiceStatus } from '../types';
import { Icons } from '../components/Icons';
import { Button } from '../components/ui';
import { useCurrency } from '../hooks/useCurrency';

const InvoicePage: React.FC = () => {
    const { id, invoiceId } = useParams<{ id: string; invoiceId: string }>();
    const navigate = useNavigate();
    const { formatCurrency } = useCurrency();
    const [project, setProject] = useState<Project | null>(null);
    const [invoice, setInvoice] = useState<ClientInvoice | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!id || !invoiceId) return;
            setIsLoading(true);
            try {
                const projectData = await mockDataService.getProject(id);
                if (projectData) {
                    setProject(projectData);
                    const specificInvoice = projectData.clientInvoices.find(inv => inv.id === invoiceId);
                    setInvoice(specificInvoice || null);
                }
            } catch (error) {
                console.error("Failed to fetch invoice:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInvoice();
    }, [id, invoiceId]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-background"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project || !invoice) {
        return <div className="text-center text-red-400 p-8 bg-background">Invoice not found.</div>;
    }
    
    const statusMap = {
        [InvoiceStatus.DRAFT]: { bg: 'bg-gray-700', text: 'text-gray-200' },
        [InvoiceStatus.SENT]: { bg: 'bg-blue-900', text: 'text-blue-200' },
        [InvoiceStatus.PAID]: { bg: 'bg-green-900', text: 'text-green-200' },
        [InvoiceStatus.OVERDUE]: { bg: 'bg-red-900', text: 'text-red-200' },
    };

    return (
        <>
        <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .no-print {
                    display: none !important;
                }
                .print-bg-surface {
                     background-color: #f8fafc !important; 
                }
                .print-text-surface {
                    color: #0f172a !important; 
                }
                 .print-border-outline {
                    border-color: #cbd5e1 !important;
                 }
                 .invoice-page {
                    background-color: white !important;
                    color: black !important;
                 }
            }
        `}</style>
        <div className="invoice-page bg-background min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-lg border border-outline p-8 sm:p-12 print-bg-surface print-border-outline">
                 {/* Header and Actions */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-on-surface">INVOICE</h1>
                        <p className="text-on-surface-variant">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary-400">BanaiSuite Construction</p>
                        <p className="text-sm text-on-surface-variant">123 Construction Ave, Kathmandu</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-block px-4 py-1 text-sm font-bold rounded-full mb-8 ${statusMap[invoice.status].bg} ${statusMap[invoice.status].text}`}>
                    {invoice.status.toUpperCase()}
                </div>

                {/* Bill To and Dates */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-2">BILL TO</h2>
                        <p className="font-bold text-on-surface text-lg">{project.client}</p>
                        <p className="text-on-surface-variant">{project.location}</p>
                    </div>
                    <div className="text-left md:text-right">
                        <div className="mb-2">
                             <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Issue Date: </span>
                             <span className="font-medium text-on-surface">{new Date(invoice.issueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                             <span className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Due Date: </span>
                             <span className="font-medium text-on-surface">{new Date(invoice.dueDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full text-left">
                        <thead className="border-b-2 border-outline print-border-outline">
                            <tr>
                                <th className="py-2 text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Description</th>
                                <th className="py-2 text-sm font-semibold text-on-surface-variant uppercase tracking-wider text-center">Quantity</th>
                                <th className="py-2 text-sm font-semibold text-on-surface-variant uppercase tracking-wider text-right">Unit Price</th>
                                <th className="py-2 text-sm font-semibold text-on-surface-variant uppercase tracking-wider text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems.map(item => (
                                <tr key={item.id} className="border-b border-outline print-border-outline">
                                    <td className="py-4 font-medium text-on-surface">{item.description}</td>
                                    <td className="py-4 text-center text-on-surface-variant">{item.quantity}</td>
                                    <td className="py-4 text-right text-on-surface-variant">{formatCurrency(item.unitPrice)}</td>
                                    <td className="py-4 font-medium text-right text-on-surface">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {/* Total */}
                 <div className="flex justify-end">
                     <div className="w-full md:w-1/3">
                         <div className="flex justify-between items-center py-4 border-t-2 border-outline print-border-outline">
                             <span className="text-lg font-bold text-on-surface uppercase">Total Amount</span>
                             <span className="text-2xl font-bold text-on-surface">{formatCurrency(invoice.amount)}</span>
                         </div>
                     </div>
                 </div>
                 
                {/* Notes */}
                <div className="mt-12 text-xs text-on-surface-variant">
                    <p className="font-bold">Notes:</p>
                    <p>Please make all payments to BanaiSuite Construction. Thank you for your business!</p>
                </div>
            </div>

            {/* Actions */}
            <div className="no-print max-w-4xl mx-auto mt-6 flex justify-end gap-4">
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
                <Button variant="filled" onClick={() => window.print()}>
                    <Icons.Printer className="mr-2 h-5 w-5" />
                    Print Invoice
                </Button>
            </div>
        </div>
        </>
    );
};

export default InvoicePage;