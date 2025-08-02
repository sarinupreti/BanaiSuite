
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDataService, mockAuthService } from '../services/mockData';
import { Project, ProjectTeamMember, User, AttendanceRecord, AttendanceStatus } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import { useCurrency } from '../hooks/useCurrency';
import TeamMemberModal from '../components/TeamMemberModal';

type Tab = 'members' | 'attendance';

const TeamPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('members');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const { formatCurrency } = useCurrency();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<ProjectTeamMember | null>(null);


    const fetchProjectAndUsers = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [projectData, usersData] = await Promise.all([
                mockDataService.getProject(id),
                mockAuthService.getAllUsers()
            ]);
            setProject(projectData);
            setAllUsers(usersData);
        } catch (error) {
            console.error("Failed to fetch project team:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchProjectAndUsers();
    }, [id]);

    const handleOpenModal = (member: ProjectTeamMember | null) => {
        setMemberToEdit(member);
        setIsModalOpen(true);
    };

    const handleSaveMember = async (data: Omit<ProjectTeamMember, 'user'> & { userId: string }) => {
        if (!id) return;
        if (memberToEdit) {
            const user = allUsers.find(u => u.id === data.userId);
            if(user) {
               await mockDataService.updateTeamMember(id, { user, projectRole: data.projectRole, dailyWage: data.dailyWage });
            }
        } else {
            await mockDataService.addTeamMember(id, data);
        }
        fetchProjectAndUsers();
    };
    
    const handleRemoveMember = async (memberId: string) => {
        if (!id || !window.confirm("Are you sure you want to remove this member from the project?")) return;
        await mockDataService.removeTeamMember(id, memberId);
        fetchProjectAndUsers();
    };

    const handleUpdateAttendance = async (memberId: string, status: AttendanceStatus) => {
        if (!id) return;
        const record: AttendanceRecord = { date: selectedDate, memberId, status };
        // Optimistically update UI
        setProject(prev => {
            if (!prev) return null;
            const newAttendance = [...prev.attendance];
            const recordIndex = newAttendance.findIndex(a => a.date === selectedDate && a.memberId === memberId);
            if (recordIndex !== -1) {
                newAttendance[recordIndex].status = status;
            } else {
                newAttendance.push(record);
            }
            return { ...prev, attendance: newAttendance };
        });
        await mockDataService.updateAttendance(id, record);
        // No need to refetch due to optimistic update
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project) {
        return <div className="text-center text-red-400">Project not found.</div>;
    }

    const attendanceForDate = project.attendance.filter(a => a.date === selectedDate);
    const getMemberStatus = (memberId: string): AttendanceStatus | undefined => {
        return attendanceForDate.find(a => a.memberId === memberId)?.status;
    };
    
    const statusClasses = {
        [AttendanceStatus.PRESENT]: 'bg-green-500 hover:bg-green-600',
        [AttendanceStatus.ABSENT]: 'bg-red-500 hover:bg-red-600',
        [AttendanceStatus.HALF_DAY]: 'bg-yellow-500 hover:bg-yellow-600',
    };

    return (
        <div className="space-y-6">
            <div>
                <Link to={`/project/${id}`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Project Overview
                </Link>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Labor & Team</h1>
                        <p className="text-on-surface-variant">Project: {project.name}</p>
                    </div>
                </div>
            </div>

            <div className="border-b border-outline flex space-x-2">
                <button onClick={() => setActiveTab('members')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'members' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Members
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'attendance' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Attendance
                </button>
            </div>

            {activeTab === 'members' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-on-surface">
                                <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                    <tr>
                                        <th scope="col" className="p-4">Name</th>
                                        <th scope="col" className="p-4">Project Role</th>
                                        <th scope="col" className="p-4">System Role</th>
                                        <th scope="col" className="p-4 text-right">Daily Wage</th>
                                        <th scope="col" className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.team.map(member => (
                                        <tr key={member.user.id} className="border-b border-outline hover:bg-surface-variant/50">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src={member.user.avatarUrl} alt={member.user.name} className="h-9 w-9 rounded-full" />
                                                <span className="font-medium">{member.user.name}</span>
                                            </td>
                                            <td className="p-4">{member.projectRole}</td>
                                            <td className="p-4">{member.user.role}</td>
                                            <td className="p-4 text-right font-mono">{formatCurrency(member.dailyWage)}</td>
                                            <td className="p-4 text-center">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(member)}>Edit</Button>
                                                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleRemoveMember(member.user.id)}>Remove</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'attendance' && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Daily Attendance</CardTitle>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full max-w-xs rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"/>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                         <div className="overflow-x-auto">
                            <table className="w-full text-left text-on-surface">
                                <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                    <tr>
                                        <th scope="col" className="p-4">Name</th>
                                        <th scope="col" className="p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.team.map(member => {
                                        const status = getMemberStatus(member.user.id);
                                        return (
                                            <tr key={member.user.id} className="border-b border-outline">
                                                <td className="p-4 flex items-center gap-3">
                                                    <img src={member.user.avatarUrl} alt={member.user.name} className="h-9 w-9 rounded-full" />
                                                    <span className="font-medium">{member.user.name}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {(Object.values(AttendanceStatus) as AttendanceStatus[]).map(s => (
                                                            <Button 
                                                                key={s}
                                                                onClick={() => handleUpdateAttendance(member.user.id, s)}
                                                                size="sm"
                                                                className={`transition-all ${status === s ? statusClasses[s] : 'bg-surface-variant text-on-surface-variant hover:bg-gray-500'}`}
                                                            >
                                                                {s}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {isModalOpen && (
                 <TeamMemberModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveMember}
                    memberToEdit={memberToEdit}
                    allUsers={allUsers}
                    projectTeam={project.team}
                />
            )}

            <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => handleOpenModal(null)}>
                <Icons.Add className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">Add Member</span>
            </Button>
        </div>
    );
};

export default TeamPage;
