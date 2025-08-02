
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, User } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'dependencies' | 'startDate'>) => void;
  taskToEdit?: Task | null;
  teamMembers: User[];
}

// A reusable input field component for the modal form
const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit, teamMembers }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [dueDate, setDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setAssigneeId(taskToEdit.assignee?.id);
            setStatus(taskToEdit.status);
            setDueDate(new Date(taskToEdit.dueDate).toISOString().split('T')[0]);
        } else {
            // Reset form for new task
            setTitle('');
            setDescription('');
            setAssigneeId(undefined);
            setStatus(TaskStatus.TODO);
            setDueDate('');
        }
    }, [taskToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const assignee = teamMembers.find(u => u.id === assigneeId);
        await onSave({ title, description, assignee, status, dueDate });
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
                className="bg-surface rounded-2xl shadow-2xl border border-outline w-full max-w-lg m-4"
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-4 border-b border-outline">
                         <h3 className="text-lg font-semibold text-on-surface">
                            {taskToEdit ? 'Edit Task' : 'Create New Task'}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <FormField id="title" label="Task Title">
                            <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required />
                        </FormField>
                        <FormField id="description" label="Description">
                            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className={inputClasses} rows={3}></textarea>
                        </FormField>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField id="assignee" label="Assign To">
                                 <select id="assignee" value={assigneeId || ''} onChange={e => setAssigneeId(e.target.value)} className={inputClasses}>
                                    <option value="">Unassigned</option>
                                    {teamMembers.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                 </select>
                            </FormField>
                             <FormField id="status" label="Status">
                                 <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className={inputClasses}>
                                    {Object.values(TaskStatus).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                 </select>
                            </FormField>
                        </div>
                        <FormField id="dueDate" label="Due Date">
                            <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClasses} required />
                        </FormField>
                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading}>
                            {taskToEdit ? 'Save Changes' : 'Create Task'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
