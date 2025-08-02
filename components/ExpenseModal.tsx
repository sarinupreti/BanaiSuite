
import React, { useState, useEffect, useRef } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';
import { useCurrency } from '../hooks/useCurrency';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'submittedBy'>) => void;
  expenseToEdit?: Expense | null;
}

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";


const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave, expenseToEdit }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.MISC);
    const [date, setDate] = useState('');
    const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { getCurrencySymbol } = useCurrency();

    useEffect(() => {
        if (expenseToEdit) {
            setDescription(expenseToEdit.description);
            setAmount(expenseToEdit.amount);
            setCategory(expenseToEdit.category);
            setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
            setReceiptUrl(expenseToEdit.receiptUrl);
        } else {
            // Reset form for new expense
            setDescription('');
            setAmount(0);
            setCategory(ExpenseCategory.MISC);
            setDate(new Date().toISOString().split('T')[0]);
            setReceiptUrl(undefined);
        }
    }, [expenseToEdit, isOpen]);

    if (!isOpen) return null;
    
    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Mock upload
        await new Promise(res => setTimeout(res, 500));
        const fakeUrl = `/receipts/receipt-${Date.now()}.${file.name.split('.').pop()}`;
        setReceiptUrl(fakeUrl);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSave({ description, amount, category, date, receiptUrl });
        setIsLoading(false);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-2xl shadow-2xl border border-outline w-full max-w-lg m-4"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b border-outline">
                         <h3 className="text-lg font-semibold text-on-surface">
                            {expenseToEdit ? 'Edit Expense' : 'Log New Expense'}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <FormField id="description" label="Description">
                            <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} required />
                        </FormField>
                        
                        <FormField id="category" label="Category">
                           <select id="category" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)} className={inputClasses}>
                                {Object.values(ExpenseCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                           </select>
                        </FormField>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField id="amount" label="Amount">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-on-surface-variant sm:text-sm">{getCurrencySymbol()}</span>
                                    </div>
                                    <input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className={`${inputClasses} pl-7`} required min="0" />
                                </div>
                            </FormField>
                            <FormField id="date" label="Date of Expense">
                                <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                        </div>

                         <FormField id="receipt" label="Receipt">
                            <div className="flex items-center gap-4">
                               <Button type="button" variant="outlined" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <Icons.Upload className="h-4 w-4 mr-2" /> Upload
                               </Button>
                               {receiptUrl && (
                                   <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:underline flex items-center gap-1">
                                        <Icons.Receipt className="h-4 w-4" />
                                        {receiptUrl.split('/').pop()}
                                   </a>
                               )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleReceiptUpload} className="hidden" accept="image/*,.pdf"/>
                        </FormField>

                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading}>
                            {expenseToEdit ? 'Save Changes' : 'Log Expense'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseModal;