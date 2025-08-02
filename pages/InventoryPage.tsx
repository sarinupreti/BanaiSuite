
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDataService, mockAuthService } from '../services/mockData';
import { Project, InventoryItem, MaterialConsumption, User, Order } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import InventoryModal from '../components/InventoryModal';
import ConsumptionModal from '../components/ConsumptionModal';
import OrderModal from '../components/OrderModal';
import { useAuth } from '../App';

const InventoryRow: React.FC<{ item: InventoryItem, onEdit: () => void, onRequest: () => void }> = ({ item, onEdit, onRequest }) => {
    const isLowStock = item.quantity <= item.threshold;
    return (
        <tr className="border-b border-outline hover:bg-surface-variant/50 cursor-pointer" onClick={onEdit}>
            <td className="p-4 font-medium">{item.name}</td>
            <td className="p-4">{item.quantity.toLocaleString()} {item.unit}</td>
            <td className="p-4">{item.threshold.toLocaleString()} {item.unit}</td>
            <td className="p-4">
                {isLowStock ? (
                    <span className="flex items-center gap-2 text-sm text-red-400">
                        <Icons.Alert className="h-4 w-4" />
                        Low Stock
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-sm text-green-400">
                        <Icons.Success className="h-4 w-4" />
                        In Stock
                    </span>
                )}
            </td>
             <td className="p-4 text-right">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRequest(); }}>Request</Button>
            </td>
        </tr>
    )
}

const InventoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
    const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [initialOrderItems, setInitialOrderItems] = useState<{name: string, quantity: number, unit: string}[]>([]);


    const fetchProject = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const projectData = await mockDataService.getProject(id);
            setProject(projectData);
        } catch (error) {
            console.error("Failed to fetch project:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);
    
    const handleOpenItemModal = (item: InventoryItem | null) => {
        setItemToEdit(item);
        setIsItemModalOpen(true);
    };

    const handleSaveItem = async (itemData: Omit<InventoryItem, 'id' | 'quantity'>) => {
        if (!id) return;

        if (itemToEdit) {
            await mockDataService.updateInventoryItem(id, { ...itemToEdit, ...itemData });
        } else {
            await mockDataService.createInventoryItem(id, itemData);
        }
        fetchProject(); // Refetch to show changes
    };

    const handleSaveConsumption = async (consumptionData: Omit<MaterialConsumption, 'id' | 'itemName' | 'unit' | 'loggedBy'>) => {
        const currentUser = await mockAuthService.getLoggedInUser();
        if (!id || !currentUser) return;

        await mockDataService.logMaterialConsumption(id, { ...consumptionData, loggedBy: currentUser });
        fetchProject();
    };

    const handleRequestItem = (item: InventoryItem) => {
        setInitialOrderItems([{ name: item.name, quantity: 1, unit: item.unit }]);
        setIsOrderModalOpen(true);
    };

    const handleSaveOrder = async (orderData: { items: { name: string; quantity: number; unit: string; }[]; }) => {
        if (!id || !user) return;
        await mockDataService.createOrder(id, { items: orderData.items, requestedBy: user });
        setIsOrderModalOpen(false);
        navigate(`/project/${id}/orders`);
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
                 <Link to={`/project/${id}`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Project Overview
                </Link>
                <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                        <p className="text-on-surface-variant">Project: {project.name}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="tonal" onClick={() => navigate(`/project/${id}/consumption`)}>
                            <Icons.ConsumptionHistory className="mr-2 h-5 w-5" />
                            Consumption History
                        </Button>
                        <Button variant="tonal" onClick={() => navigate(`/project/${id}/orders`)}>
                            <Icons.Orders className="mr-2 h-5 w-5" />
                            View All Orders
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Current Stock</CardTitle>
                        <Button variant="outlined" size="sm" onClick={() => handleOpenItemModal(null)}>
                           <Icons.Add className="h-4 w-4 mr-2" />
                           Add Stock Item
                        </Button>
                    </div>
                </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-on-surface">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                <tr>
                                    <th scope="col" className="p-4">Item Name</th>
                                    <th scope="col" className="p-4">In Stock</th>
                                    <th scope="col" className="p-4">Low Stock Threshold</th>
                                    <th scope="col" className="p-4">Status</th>
                                    <th scope="col" className="p-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.inventory.map(item => <InventoryRow key={item.id} item={item} onEdit={() => handleOpenItemModal(item)} onRequest={() => handleRequestItem(item)} />)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            
            <InventoryModal 
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                onSave={handleSaveItem}
                itemToEdit={itemToEdit}
            />
            
            <ConsumptionModal
                isOpen={isConsumptionModalOpen}
                onClose={() => setIsConsumptionModalOpen(false)}
                onSave={handleSaveConsumption}
                inventoryItems={project.inventory}
            />

            {isOrderModalOpen && (
                 <OrderModal
                    isOpen={isOrderModalOpen}
                    onClose={() => setIsOrderModalOpen(false)}
                    onSave={handleSaveOrder}
                    inventoryItems={project.inventory}
                    userRole={user?.role}
                    initialItems={initialOrderItems}
                />
            )}

            <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => setIsConsumptionModalOpen(true)}>
                <Icons.LogUsage className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">Log Material Usage</span>
            </Button>
        </div>
    )
}

export default InventoryPage;