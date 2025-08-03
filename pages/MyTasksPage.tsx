import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { taskService } from '../services/tasks';
import { Task, TaskStatus, User } from '../types';
import TaskModal from '../components/TaskModal';
import { Button } from '../components/ui';
import { Icons } from '../components/Icons';
import { Link } from 'react-router-dom';

type UserTask = Task & { project: { id: string, name: string } };

const getStatusPillColor = (status: TaskStatus) => {
    switch (status) {
        case TaskStatus.DONE:
            return 'bg-green-100 text-green-800';
        case TaskStatus.IN_PROGRESS:
            return 'bg-blue-100 text-blue-800';
        case TaskStatus.BLOCKED:
            return 'bg-red-100 text-red-800';
        case TaskStatus.TODO:
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const TaskCard: React.FC<{ task: UserTask, onEdit: (task: UserTask) => void }> = ({ task, onEdit }) => {
    return (
        <div className="bg-surface rounded-lg border border-outline p-4 flex flex-col space-y-3">
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-on-surface">{task.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusPillColor(task.status)}`}>
                    {task.status}
                </span>
            </div>
            <p className="text-sm text-on-surface-variant flex-grow">{task.description}</p>
            <div className="text-xs text-on-surface-variant space-y-1 pt-2 border-t border-outline">
                 <div className="flex items-center gap-2">
                    <Icons.Project className="h-4 w-4" />
                    <span>Project: <Link to={`/project/${task.project.id}`} className="font-medium text-primary-500 hover:underline">{task.project.name}</Link></span>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.User className="h-4 w-4" />
                    <span>Assignee: {task.assignee?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Icons.Calendar className="h-4 w-4" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button variant="outlined" size="sm" onClick={() => onEdit(task)}>
                    <Icons.Edit className="h-4 w-4 mr-2" />
                    View / Edit
                </Button>
            </div>
        </div>
    );
};


const MyTasksPage: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<UserTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const userTasks = await taskService.getTasksForUser(user.id);
                    setTasks(userTasks as UserTask[]);
                    // TODO: Fetch all users for the assignee dropdown
                    // const allUsers = await profileService.getProfiles();
                    // setAllUsers(allUsers);
                } catch(error) {
                    console.error("Failed to fetch tasks", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [user]);

    const handleEditTask = (task: UserTask) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleSaveTask = async (taskData: Omit<Task, 'id' | 'dependencies' | 'startDate'>) => {
        if (selectedTask) {
            const updatedTask = await taskService.updateTask(selectedTask.id, taskData);
            setTasks(prevTasks => prevTasks.map(t => t.id === selectedTask.id ? { ...t, ...updatedTask } : t));
        }
        // NOTE: Creating a new task is not supported from this page as we need project context.
        // The modal will only be used for editing.
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-on-surface">My Tasks</h1>
            </div>

            {tasks.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-outline rounded-lg">
                    <Icons.Tasks className="mx-auto h-12 w-12 text-on-surface-variant" />
                    <h3 className="mt-2 text-lg font-medium text-on-surface">No tasks assigned to you</h3>
                    <p className="mt-1 text-sm text-on-surface-variant">
                        Tasks assigned to you across all projects will appear here.
                    </p>
                </div>
            )}

            {selectedTask && (
                <TaskModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveTask}
                    taskToEdit={selectedTask}
                    teamMembers={allUsers}
                />
            )}
        </div>
    );
};

export default MyTasksPage;
