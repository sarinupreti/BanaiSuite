
import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderStatus, InventoryItem, Role } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';
import { useAuth } from '../App';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: any) => void;
  orderToEdit?: Order | null;
  inventoryItems: InventoryItem[];
  userRole?: Role;
  initialItems?: OrderItem[];
}

type OrderItem = { name: string, quantity: number, unit: string };

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm disabled:opacity-50";

const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, onSave, orderToEdit, inventoryItems, userRole, initialItems }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (orderToEdit) {
            setItems(orderToEdit.items);
            setStatus(orderToEdit.status);
        } else {
            setItems(initialItems || []);
            setStatus(OrderStatus.PENDING);
        }
    }, [orderToEdit, isOpen, initialItems]);

    if (!isOpen) return null;

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleAddItem = () => {
        const firstItem = inventoryItems[0];
        if (!firstItem) return;
        setItems([...items, { name: firstItem.name, quantity: 1, unit: firstItem.unit }]);
    };
    
    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemSelection = (index, selectedName) => {
        const selectedItem = inventoryItems.find(i => i.name === selectedName);
        if (!selectedItem) return;
        const newItems = [...items];
        newItems[index].name = selectedItem.name;
        newItems[index].unit = selectedItem.unit;
        setItems(newItems);
    }
    
    const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !orderToEdit) return;

        setIsUploading(true);
        await new Promise(res => setTimeout(res, 1000)); // Simulate upload time
        
        // In a real app, you would upload to a service and get a URL.
        // For this mock, we'll just create a fake path.
        const fakeUrl = `/invoices/${orderToEdit.id}-${file.name}`;
        const updatedOrder = { ...orderToEdit, invoiceUrl: fakeUrl };

        await onSave(updatedOrder);
        setIsUploading(false);
    };

    const handleApprove = async () => {
        if (!orderToEdit || !user) return;
        setIsLoading(true);
        const approvedOrder = { ...orderToEdit, status: OrderStatus.APPROVED, approvedBy: user };
        await onSave(approvedOrder);
        setIsLoading(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const dataToSave = orderToEdit 
            ? { ...orderToEdit, status }
            : { items: items.filter(i => i.quantity > 0) };
            
        if (!orderToEdit && dataToSave.items.length === 0) {
            setIsLoading(false);
            return;
        }

        await onSave(dataToSave);
        setIsLoading(false);
        onClose();
    };

    const isCreateMode = !orderToEdit;
    const canApprove = userRole === Role.PROJECT_MANAGER && orderToEdit?.status === OrderStatus.PENDING;
    const isStatusLocked = orderToEdit?.status === OrderStatus.PENDING && userRole !== Role.PROJECT_MANAGER;

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
                            {isCreateMode ? 'Create Material Request' : `Order Details #${orderToEdit?.id.slice(0,8)}`}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {isCreateMode ? (
                           <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                        <select 
                                            value={item.name} 
                                            onChange={(e) => handleItemSelection(index, e.target.value)} 
                                            className={`${inputClasses} col-span-6`}
                                        >
                                           {inventoryItems.map(invItem => <option key={invItem.id} value={invItem.name}>{invItem.name}</option>)}
                                        </select>
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} 
                                            className={`${inputClasses} col-span-3`}
                                            min="1"
                                        />
                                        <span className="col-span-2 text-sm text-on-surface-variant">{item.unit}</span>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)} className="text-red-400">
                                            <Icons.Error className="h-5 w-5"/>
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="tonal" onClick={handleAddItem} disabled={inventoryItems.length === 0}>
                                    <Icons.Add className="h-4 w-4 mr-2" /> Add Item
                                </Button>
                           </div>
                        ) : (
                            <div className="space-y-4">
                                <ul className="list-disc list-inside space-y-1 p-3 bg-surface-variant/30 rounded-lg">
                                    {items.map((item, index) => (
                                        <li key={index} className="text-on-surface">
                                            Request for <span className="font-semibold">{item.quantity} {item.unit}</span> of <span className="font-semibold">{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                
                                {canApprove && (
                                    <Button type="button" onClick={handleApprove} className="w-full" isLoading={isLoading}>
                                        <Icons.Approve className="mr-2 h-5 w-5"/>
                                        Approve Request
                                    </Button>
                                )}

                                <FormField id="status" label="Update Order Status">
                                    <select id="status" value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className={inputClasses} disabled={isStatusLocked || isLoading}>
                                        {Object.values(OrderStatus).map(s => {
                                            if (s === OrderStatus.APPROVED && userRole !== Role.PROJECT_MANAGER) return null;
                                            return <option key={s} value={s}>{s}</option>
                                        })}
                                    </select>
                                    {isStatusLocked && <p className="text-xs text-yellow-400 mt-1">A Project Manager must approve this request before the status can be updated.</p>}
                                </FormField>
                                
                                <div className="p-3 bg-surface-variant/30 rounded-lg">
                                    <h4 className="text-sm font-medium text-on-surface-variant mb-2">Invoice Management</h4>
                                    {orderToEdit.invoiceUrl ? (
                                        <div className="flex items-center justify-between">
                                            <a href={orderToEdit.invoiceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-400 hover:underline text-sm font-medium">
                                                <Icons.Invoice className="h-4 w-4" />
                                                <span>View Uploaded Invoice</span>
                                            </a>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                                Replace
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button type="button" variant="tonal" onClick={() => fileInputRef.current?.click()} isLoading={isUploading} className="w-full">
                                            <Icons.Upload className="mr-2 h-4 w-4" />
                                            Upload Bill / Invoice
                                        </Button>
                                    )}
                                    <input type="file" ref={fileInputRef} onChange={handleInvoiceUpload} className="hidden" accept="image/*,.pdf"/>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose} disabled={isLoading}>Cancel</Button>
                         {!canApprove && (
                            <Button type="submit" variant="filled" isLoading={isLoading} disabled={isStatusLocked}>
                               {isCreateMode ? 'Submit Request' : 'Save Changes'}
                            </Button>
                         )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;