
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'quantity'>) => void;
  itemToEdit?: InventoryItem | null;
}

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";


const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [threshold, setThreshold] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (itemToEdit) {
            setName(itemToEdit.name);
            setUnit(itemToEdit.unit);
            setThreshold(itemToEdit.threshold);
        } else {
            setName('');
            setUnit('');
            setThreshold(0);
        }
    }, [itemToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await onSave({ name, unit, threshold });
        setIsLoading(false);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-surface rounded-2xl shadow-2xl border border-outline w-full max-w-md m-4"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b border-outline">
                         <h3 className="text-lg font-semibold text-on-surface">
                            {itemToEdit ? 'Edit Stock Item' : 'Add New Stock Item'}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <FormField id="name" label="Item Name">
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <FormField id="unit" label="Unit (e.g., bags, kg, liters)">
                                <input id="unit" type="text" value={unit} onChange={e => setUnit(e.target.value)} className={inputClasses} required />
                            </FormField>
                            <FormField id="threshold" label="Low Stock Threshold">
                                <input id="threshold" type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className={inputClasses} required />
                            </FormField>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading}>
                            {itemToEdit ? 'Save Changes' : 'Add Item'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventoryModal;
