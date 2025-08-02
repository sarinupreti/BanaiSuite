import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, MaterialConsumption } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';

const ConsumptionRow: React.FC<{ log: MaterialConsumption }> = ({ log }) => (
    <tr className="border-b border-outline hover:bg-surface-variant/50">
        <td className="p-4 font-medium">{log.itemName}</td>
        <td className="p-4">{log.quantity.toLocaleString()} {log.unit}</td>
        <td className="p-4">
            <div className="flex items-center gap-2">
                <img src={log.loggedBy.avatarUrl} alt={log.loggedBy.name} className="h-7 w-7 rounded-full" />
                <span className="text-sm">{log.loggedBy.name}</span>
            </div>
        </td>
        <td className="p-4 text-sm">{new Date(log.date).toLocaleDateString()}</td>
    </tr>
);

const ConsumptionHistoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchProject = async () => {
            setIsLoading(true);
            try {
                const projectData = await mockDataService.getProject(id);
                // Sort consumption history by most recent date
                projectData?.consumptionHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setProject(projectData);
            } catch (error) {
                console.error("Failed to fetch project consumption history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProject();
    }, [id]);

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
                    <h1 className="text-3xl font-bold tracking-tight">Material Consumption History</h1>
                    <p className="text-on-surface-variant">Project: {project.name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Consumption Logs</CardTitle>
                </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-on-surface">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                <tr>
                                    <th scope="col" className="p-4">Item Name</th>
                                    <th scope="col" className="p-4">Quantity Used</th>
                                    <th scope="col" className="p-4">Logged By</th>
                                    <th scope="col" className="p-4">Date of Use</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.consumptionHistory.length > 0 ? (
                                    project.consumptionHistory.map(log => <ConsumptionRow key={log.id} log={log} />)
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-8 text-on-surface-variant">
                                            No material consumption has been logged for this project yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default ConsumptionHistoryPage;
