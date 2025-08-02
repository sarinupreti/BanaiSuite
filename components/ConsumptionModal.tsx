import React, { useState, useEffect } from 'react';
import { MaterialConsumption, InventoryItem } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';

interface ConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (consumptionData: Omit<MaterialConsumption, 'id' | 'itemName' | 'unit' | 'loggedBy'>) => void;
  inventoryItems: InventoryItem[];
}

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";


const ConsumptionModal: React.FC<ConsumptionModalProps> = ({ isOpen, onClose, onSave, inventoryItems }) => {
    const [itemId, setItemId] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset form when opening
            if (inventoryItems.length > 0) {
                setItemId(inventoryItems[0].id);
            }
            setQuantity(1);
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, inventoryItems]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemId) return; // Can't save without an item
        setIsLoading(true);
        await onSave({ itemId, quantity, date });
        setIsLoading(false);
        onClose();
    };
    
    const selectedItem = inventoryItems.find(i => i.id === itemId);

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
                            Log Material Consumption
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <FormField id="item" label="Material Item">
                           <select 
                                id="item" 
                                value={itemId} 
                                onChange={e => setItemId(e.target.value)} 
                                className={inputClasses}
                                disabled={inventoryItems.length === 0}
                            >
                               {inventoryItems.length === 0 ? (
                                    <option>No items in inventory</option>
                               ) : (
                                    inventoryItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} (In Stock: {item.quantity})</option>
                                    ))
                               )}
                           </select>
                        </FormField>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField id="quantity" label="Quantity Used">
                                <input 
                                    id="quantity" 
                                    type="number" 
                                    value={quantity} 
                                    onChange={e => setQuantity(Number(e.target.value))} 
                                    className={inputClasses}
                                    min="1"
                                    max={selectedItem?.quantity || 1}
                                    required 
                                />
                            </FormField>
                             <FormField id="date" label="Date of Use">
                                <input 
                                    id="date" 
                                    type="date" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)} 
                                    className={inputClasses}
                                    required 
                                />
                            </FormField>
                        </div>
                         {selectedItem && <p className="text-xs text-on-surface-variant">Unit: {selectedItem.unit}</p>}
                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading} disabled={!itemId}>
                            Log Usage
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsumptionModal;