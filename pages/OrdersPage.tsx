
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/projects';
import { orderService } from '../services/orders';
import { Project, Order, OrderStatus, Role } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import OrderModal from '../components/OrderModal';
import { useAuth } from '../App';

const statusMap = {
    [OrderStatus.PENDING]: { icon: Icons.Pending, color: 'text-yellow-400', label: 'Pending' },
    [OrderStatus.APPROVED]: { icon: Icons.Approve, color: 'text-cyan-400', label: 'Approved' },
    [OrderStatus.SENT]: { icon: Icons.Send, color: 'text-blue-400', label: 'Sent' },
    [OrderStatus.RECEIVED]: { icon: Icons.Success, color: 'text-green-400', label: 'Received' },
    [OrderStatus.REJECTED]: { icon: Icons.Error, color: 'text-red-400', label: 'Rejected' },
};

const OrderRow: React.FC<{ order: Order; onSelect: () => void; userRole: Role | undefined }> = ({ order, onSelect, userRole }) => {
    const { icon: Icon, color, label } = statusMap[order.status];
    const isPendingApproval = order.status === OrderStatus.PENDING && userRole === Role.PROJECT_MANAGER;
    return (
        <tr 
            className={`border-b border-outline hover:bg-surface-variant/50 cursor-pointer ${isPendingApproval ? 'bg-primary-950/50' : ''}`} 
            onClick={onSelect}
        >
            <td className="p-4 font-medium">#{order.id.slice(0, 8)}...</td>
            <td className="p-4">
                <ul className="list-disc list-inside text-sm">
                    {order.items.map((item, index) => <li key={index}>{item.quantity} {item.unit} of {item.name}</li>)}
                </ul>
            </td>
             <td className="p-4">
                <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                </div>
            </td>
            <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
            <td className="p-4 text-sm">{order.requestedBy.name}</td>
            <td className="p-4 text-center">
                {order.invoiceUrl ? (
                    <Icons.Invoice className="h-5 w-5 text-green-400 mx-auto" />
                ) : (
                    <span className="text-xs text-on-surface-variant">-</span>
                )}
            </td>
        </tr>
    );
};


const OrdersPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);

    const fetchProjectAndOrders = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const projectData = await projectService.getProject(id);
            setProject(projectData);
            if (projectData) {
                const orderData = await orderService.getOrders(projectData.id);
                setOrders(orderData);
            }
        } catch (error) {
            console.error("Failed to fetch project and orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectAndOrders();
    }, [id]);

    const handleOpenModal = (order: Order | null) => {
        setOrderToEdit(order);
        setIsModalOpen(true);
    };
    
    const handleSaveOrder = async (orderData: any) => {
        if (!id || !user) return;
        
        if (orderToEdit || orderData.id) {
            const updatedOrder = await orderService.updateOrder(orderData.id, orderData);
            setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        } else {
            const newOrder = await orderService.createOrder({ ...orderData, project_id: id, requested_by: user.id });
            setOrders([...orders, newOrder]);
        }
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
                 <Link to={`/project/${id}/inventory`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Inventory
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Material Orders</h1>
                    <p className="text-on-surface-variant">Project: {project.name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Order Requests</CardTitle>
                </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-on-surface">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                <tr>
                                    <th scope="col" className="p-4">Order ID</th>
                                    <th scope="col" className="p-4">Items</th>
                                    <th scope="col" className="p-4">Status</th>
                                    <th scope="col" className="p-4">Request Date</th>
                                    <th scope="col" className="p-4">Requested By</th>
                                    <th scope="col" className="p-4 text-center">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.orders.map(order => <OrderRow key={order.id} order={order} onSelect={() => handleOpenModal(order)} userRole={user?.role} />)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
                <OrderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveOrder}
                    orderToEdit={orderToEdit}
                    inventoryItems={project.inventory}
                    userRole={user?.role}
                />
            )}

            <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => handleOpenModal(null)}>
                <Icons.Add className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">New Material Request</span>
            </Button>
        </div>
    )
}

export default OrdersPage;