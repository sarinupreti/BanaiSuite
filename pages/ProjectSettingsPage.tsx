
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, ProjectStatus } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import { useCurrency } from '../hooks/useCurrency';

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm";


const ProjectSettingsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getCurrencySymbol } = useCurrency();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [client, setClient] = useState('');
    const [budget, setBudget] = useState(0);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');


    useEffect(() => {
        if (!id) return;
        const fetchProjectData = async () => {
            setIsLoading(true);
            try {
                const projectData = await mockDataService.getProject(id);
                setProject(projectData);
                if (projectData) {
                    setName(projectData.name);
                    setLocation(projectData.location);
                    setClient(projectData.client);
                    setBudget(projectData.budget);
                    setStartDate(new Date(projectData.startDate).toISOString().split('T')[0]);
                    setEndDate(new Date(projectData.endDate).toISOString().split('T')[0]);
                }
            } catch (error) {
                console.error("Failed to fetch project data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjectData();
    }, [id]);

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsSaving(true);
        const updatedDetails = { name, location, client, budget, startDate, endDate };
        await mockDataService.updateProjectDetails(id, updatedDetails);
        setIsSaving(false);
        // Maybe show a toast notification here
    };

    const handleArchiveProject = async () => {
        if (!id || !window.confirm("Are you sure you want to archive this project? It will be hidden from the main dashboard.")) return;
        await mockDataService.updateProjectDetails(id, { status: ProjectStatus.ARCHIVED });
        navigate('/');
    };
    
    const handleDeleteProject = async () => {
        if (!id || !window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) return;
        await mockDataService.deleteProject(id);
        navigate('/');
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
    }

    if (!project) {
        return <div className="text-center text-red-400">Project not found.</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                 <Link to={`/project/${id}`} className="text-sm text-primary-400 hover:underline flex items-center gap-1 mb-2">
                    <Icons.ChevronDown className="h-4 w-4 -rotate-90" /> Back to Project Overview
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
                <p className="text-on-surface-variant">Manage details for {project.name}</p>
            </div>
            
            <Card>
                <form onSubmit={handleSaveChanges}>
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField id="name" label="Project Name">
                            <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                        </FormField>
                        <FormField id="location" label="Location">
                            <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputClasses} required />
                        </FormField>
                         <FormField id="client" label="Client Name">
                            <input id="client" type="text" value={client} onChange={e => setClient(e.target.value)} className={inputClasses} required />
                        </FormField>
                         <FormField id="budget" label="Total Budget">
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-on-surface-variant sm:text-sm">{getCurrencySymbol()}</span>
                                </div>
                                <input id="budget" type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className={`${inputClasses} pl-7`} required min="0" />
                            </div>
                        </FormField>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField id="startDate" label="Start Date">
                                <input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                             <FormField id="endDate" label="Expected End Date">
                                <input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClasses} required />
                            </FormField>
                        </div>
                    </CardContent>
                    <div className="flex justify-end p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="submit" variant="filled" isLoading={isSaving}>
                            Save Changes
                         </Button>
                    </div>
                </form>
            </Card>

            <Card className="border-red-500/50">
                <CardHeader>
                    <CardTitle className="text-red-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-on-surface">Archive Project</h4>
                        <p className="text-sm text-on-surface-variant mb-2">Archived projects are hidden but not deleted.</p>
                        <Button variant="outlined" className="text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10" onClick={handleArchiveProject}>Archive This Project</Button>
                    </div>
                     <div>
                        <h4 className="font-semibold text-on-surface">Delete Project</h4>
                        <p className="text-sm text-on-surface-variant mb-2">This action is permanent and cannot be undone.</p>
                        <Button variant="filled" className="bg-red-500 hover:bg-red-600 focus:ring-red-500" onClick={handleDeleteProject}>Delete This Project</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default ProjectSettingsPage;
