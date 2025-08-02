
import React, { useState, useEffect } from 'react';
import { ProjectTeamMember, User } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';
import { useCurrency } from '../hooks/useCurrency';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ProjectTeamMember, 'user'> & { userId: string }) => void;
  memberToEdit?: ProjectTeamMember | null;
  allUsers: User[];
  projectTeam: ProjectTeamMember[];
}

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm disabled:bg-surface-variant/50";


const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, onClose, onSave, memberToEdit, allUsers, projectTeam }) => {
    const [userId, setUserId] = useState('');
    const [projectRole, setProjectRole] = useState('');
    const [dailyWage, setDailyWage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const { getCurrencySymbol } = useCurrency();

    const usersNotInProject = allUsers.filter(u => !projectTeam.some(pt => pt.user.id === u.id));

    useEffect(() => {
        if (memberToEdit) {
            setUserId(memberToEdit.user.id);
            setProjectRole(memberToEdit.projectRole);
            setDailyWage(memberToEdit.dailyWage);
        } else {
            setUserId(usersNotInProject.length > 0 ? usersNotInProject[0].id : '');
            setProjectRole('');
            setDailyWage(0);
        }
    }, [memberToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;
        setIsLoading(true);
        await onSave({ userId, projectRole, dailyWage });
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
                            {memberToEdit ? 'Edit Team Member' : 'Add Team Member'}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <FormField id="user" label="User">
                            <select 
                                id="user" 
                                value={userId} 
                                onChange={e => setUserId(e.target.value)} 
                                className={inputClasses} 
                                disabled={!!memberToEdit || usersNotInProject.length === 0}
                            >
                                {memberToEdit && <option value={memberToEdit.user.id}>{memberToEdit.user.name}</option>}
                                {!memberToEdit && usersNotInProject.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                                {!memberToEdit && usersNotInProject.length === 0 && <option>No available users to add</option>}
                           </select>
                        </FormField>

                        <FormField id="projectRole" label="Project Role (e.g., Foreman, Mason)">
                            <input id="projectRole" type="text" value={projectRole} onChange={e => setProjectRole(e.target.value)} className={inputClasses} required />
                        </FormField>
                        
                        <FormField id="dailyWage" label="Daily Wage">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-on-surface-variant sm:text-sm">{getCurrencySymbol()}</span>
                                </div>
                                <input id="dailyWage" type="number" value={dailyWage} onChange={e => setDailyWage(Number(e.target.value))} className={`${inputClasses} pl-7`} required min="0" />
                            </div>
                        </FormField>
                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading} disabled={!userId}>
                            {memberToEdit ? 'Save Changes' : 'Add Member'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamMemberModal;
