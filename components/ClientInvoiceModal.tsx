
import React, { useState, useEffect } from 'react';
import { ClientInvoice, InvoiceStatus, InvoiceLineItem } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';
import { faker } from 'https://esm.sh/@faker-js/faker@9.0.0-rc.1';
import { useCurrency } from '../hooks/useCurrency';

interface ClientInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: any) => void;
  invoiceToEdit?: ClientInvoice | null;
}

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";


const ClientInvoiceModal: React.FC<ClientInvoiceModalProps> = ({ isOpen, onClose, onSave, invoiceToEdit }) => {
    const [title, setTitle] = useState('');
    const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
    const [issueDate, setIssueDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.DRAFT);
    const [isLoading, setIsLoading] = useState(false);
    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (invoiceToEdit) {
            setTitle(invoiceToEdit.title);
            setLineItems(invoiceToEdit.lineItems);
            setIssueDate(new Date(invoiceToEdit.issueDate).toISOString().split('T')[0]);
            setDueDate(new Date(invoiceToEdit.dueDate).toISOString().split('T')[0]);
            setStatus(invoiceToEdit.status);
        } else {
            setTitle('');
            setLineItems([{ id: faker.string.uuid(), description: '', quantity: 1, unitPrice: 0 }]);
            setIssueDate(new Date().toISOString().split('T')[0]);
            setDueDate('');
            setStatus(InvoiceStatus.DRAFT);
        }
    }, [invoiceToEdit, isOpen]);

    if (!isOpen) return null;

    const handleLineItemChange = (index: number, field: keyof Omit<InvoiceLineItem, 'id'>, value: string | number) => {
        const updatedLineItems = [...lineItems];
        updatedLineItems[index] = { ...updatedLineItems[index], [field]: value };
        setLineItems(updatedLineItems);
    };

    const addLineItem = () => {
        setLineItems([...lineItems, { id: faker.string.uuid(), description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };
    
    const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const data = { title, lineItems, issueDate, dueDate, status };
        
        if (invoiceToEdit) {
            await onSave({ ...invoiceToEdit, ...data });
        } else {
            await onSave(data);
        }
        
        setIsLoading(false);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-2xl shadow-2xl border border-outline w-full max-w-2xl m-4"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b border-outline">
                         <h3 className="text-lg font-semibold text-on-surface">
                            {invoiceToEdit ? `Edit Invoice #${invoiceToEdit.invoiceNumber}` : 'Create New Client Invoice'}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <FormField id="title" label="Invoice Title">
                            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required />
                        </FormField>

                        <div className="space-y-3">
                             <label className="block text-sm font-medium text-on-surface-variant">Line Items</label>
                             {lineItems.map((item, index) => (
                                 <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                     <input
                                        type="text"
                                        placeholder="Description"
                                        value={item.description}
                                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                                        className={`${inputClasses} col-span-6`}
                                     />
                                     <input
                                        type="number"
                                        placeholder="Qty"
                                        value={item.quantity}
                                        onChange={(e) => handleLineItemChange(index, 'quantity', Number(e.target.value))}
                                        className={`${inputClasses} col-span-2`}
                                        min="0"
                                     />
                                     <input
                                        type="number"
                                        placeholder="Price"
                                        value={item.unitPrice}
                                        onChange={(e) => handleLineItemChange(index, 'unitPrice', Number(e.target.value))}
                                        className={`${inputClasses} col-span-3`}
                                        min="0"
                                     />
                                     <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)} className="text-red-400 col-span-1">
                                        <Icons.Error className="h-5 w-5"/>
                                     </Button>
                                 </div>
                             ))}
                             <Button type="button" variant="tonal" size="sm" onClick={addLineItem}>
                                <Icons.Add className="mr-2 h-4 w-4" /> Add Line
                             </Button>
                        </div>

                         <div className="text-right font-semibold text-on-surface text-lg pt-2">
                             Total: {formatCurrency(totalAmount)}
                         </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField id="issueDate" label="Issue Date">
                                <input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                            <FormField id="dueDate" label="Due Date">
                                <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                        </div>
                        
                        {invoiceToEdit && (
                            <FormField id="status" label="Status">
                                <select id="status" value={status} onChange={e => setStatus(e.target.value as InvoiceStatus)} className={inputClasses}>
                                    {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </FormField>
                        )}

                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading}>
                            {invoiceToEdit ? 'Save Changes' : 'Create Invoice'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientInvoiceModal;