import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, Task, TaskStatus } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import TaskModal from '../components/TaskModal';
import { useCurrency } from '../hooks/useCurrency';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; subtext?: string; }> = ({ icon: Icon, title, value, subtext }) => (
    <Card>
        <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary-container rounded-full">
                 <Icon className="h-6 w-6 text-on-primary-container" />
            </div>
            <div>
                <p className="text-2xl font-bold text-on-surface">{value}</p>
                <p className="text-sm text-on-surface-variant">{title}</p>
            </div>
        </CardContent>
    </Card>
);

const TaskRow: React.FC<{ task: Task; onEdit: () => void; }> = ({ task, onEdit }) => {
    const statusMap = {
        [TaskStatus.TODO]: { icon: Icons.Pending, color: 'text-gray-400' },
        [TaskStatus.IN_PROGRESS]: { icon: Icons.Spinner, color: 'text-yellow-400 animate-spin' },
        [TaskStatus.DONE]: { icon: Icons.Success, color: 'text-green-400' },
        [TaskStatus.BLOCKED]: { icon: Icons.Error, color: 'text-red-400' },
    };
    const { icon: Icon, color } = statusMap[task.status];
    return (
        <tr className="border-b border-outline hover:bg-surface-variant/50 cursor-pointer" onClick={onEdit}>
            <td className="p-4 font-medium">{task.title}</td>
            <td className="p-4">
                {task.assignee ? (
                    <div className="flex items-center gap-2">
                        <img src={task.assignee.avatarUrl} alt={task.assignee.name} className="h-7 w-7 rounded-full" />
                        <span className="text-sm">{task.assignee.name}</span>
                    </div>
                ) : <span className="text-sm text-on-surface-variant">Unassigned</span>}
            </td>
            <td className="p-4">
                <div className={`flex items-center gap-2 text-sm ${color}`}>
                    <Icon className="h-4 w-4" />
                    <span>{task.status}</span>
                </div>
            </td>
            <td className="p-4 text-sm">{new Date(task.dueDate).toLocaleDateString()}</td>
        </tr>
    );
};

const ModuleCard: React.FC<{ icon: React.ElementType, title: string, path: string }> = ({ icon: Icon, title, path }) => {
    const navigate = useNavigate();
    return (
        <Card onClick={() => navigate(path)} className="cursor-pointer hover:border-primary-400 group transition-all">
            <CardContent className="flex flex-col items-center justify-center text-center h-32">
                 <Icon className="h-8 w-8 text-on-surface-variant group-hover:text-primary-400 transition-colors"/>
                 <p className="mt-2 font-semibold text-on-surface">{title}</p>
            </CardContent>
        </Card>
    )
}

const ProjectPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const { formatCurrency } = useCurrency();

    const fetchProject = async () => {
        if (!id) return;
        try {
            setIsLoading(true);
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

    const handleOpenModal = (task: Task | null) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id' | 'dependencies' | 'startDate'>) => {
        if (!project) return;
        if (taskToEdit) {
            await mockDataService.updateTask(project.id, { ...taskToEdit, ...taskData });
        } else {
            await mockDataService.createTask(project.id, taskData);
        }
        // Instead of a full refetch, we could update state locally
        // but for mock data, a refetch is simple and effective.
        const updatedProject = await mockDataService.getProject(project.id);
        setProject(updatedProject);
    };

    if (isLoading && !project) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project) {
        return <div className="text-center text-red-400">Project not found. <Link to="/" className="underline">Go back to dashboard</Link></div>;
    }

    const budgetData = [{
        name: project.name,
        Budget: project.budget,
        'Actual Cost': project.actualCost,
    }];
    
    const projectModules = [
        { icon: Icons.Inventory, title: "Order & Inventory", path: `/project/${id}/inventory`},
        { icon: Icons.Financials, title: "Financials", path: `/project/${id}/financials`},
        { icon: Icons.Team, title: "Labor & Team", path: `/project/${id}/team`},
        { icon: Icons.Documents, title: "Documents", path: `/project/${id}/documents`},
        { icon: Icons.Reports, title: "Reports", path: `/project/${id}/reports`},
        { icon: Icons.Settings, title: "Project Settings", path: `/project/${id}/settings`},
    ];

    return (
        <div className="space-y-6">
            <div>
                <Link to="/" className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-on-surface-variant">{project.location}</p>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Icons.Project} title="Progress" value={`${project.progress}%`} />
                <StatCard icon={Icons.Budget} title="Budget" value={formatCurrency(project.budget, { compact: true })} />
                <StatCard icon={Icons.Alert} title="Actual Cost" value={formatCurrency(project.actualCost, { compact: true })} />
                <StatCard icon={Icons.Team} title="Team Size" value={`${project.team.length}`} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {projectModules.map(mod => <ModuleCard key={mod.title} {...mod} />)}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Upcoming Tasks</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-on-surface">
                                <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                    <tr>
                                        <th scope="col" className="p-4">Task</th>
                                        <th scope="col" className="p-4">Assignee</th>
                                        <th scope="col" className="p-4">Status</th>
                                        <th scope="col" className="p-4">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.tasks.slice(0,5).map(task => <TaskRow key={task.id} task={task} onEdit={() => handleOpenModal(task)} />)}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" />
                                <XAxis dataKey="name" stroke="var(--color-on-surface-variant)" fontSize={12} />
                                <YAxis 
                                    stroke="var(--color-on-surface-variant)" 
                                    fontSize={12} 
                                    tickFormatter={(value) => formatCurrency(Number(value), { compact: true, maximumFractionDigits: 0 })}
                                />
                                <Tooltip
                                    cursor={{fill: 'var(--color-surface-variant)'}}
                                    contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-outline)', color: 'var(--color-on-surface)' }}
                                    labelStyle={{ color: 'var(--color-on-surface)' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                                <Bar dataKey="Budget" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Actual Cost" fill="#f56565" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                     <CardContent>
                         <ul className="space-y-4">
                            {project.logs.slice(0,5).map((log) => (
                                <li key={log.id} className="flex items-start gap-3">
                                    <img src={log.user.avatarUrl} alt={log.user.name} className="h-9 w-9 rounded-full mt-1" />
                                    <div>
                                        <p className="text-sm leading-tight" dangerouslySetInnerHTML={{__html: log.details.replace(/CURRENCY\[(\d+)\]/g, (_, amount) => formatCurrency(parseInt(amount, 10)))}}></p>
                                        <p className="text-xs text-on-surface-variant mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                </li>
                            ))}
                         </ul>
                    </CardContent>
                </Card>
            </div>
            
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTask}
                taskToEdit={taskToEdit}
                teamMembers={project.team.map(tm => tm.user)}
            />

            <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => handleOpenModal(null)}>
                <Icons.Add className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">Add Task</span>
            </Button>
        </div>
    );
};

export default ProjectPage;