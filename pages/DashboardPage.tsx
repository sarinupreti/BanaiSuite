
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import { useCurrency } from '../hooks/useCurrency';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; subtext: string; }> = ({ icon: Icon, title, value, subtext }) => (
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

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const { formatCurrency } = useCurrency();
    const progressColor = project.progress < 30 ? 'bg-red-500' : project.progress < 70 ? 'bg-yellow-500' : 'bg-green-500';

    return (
        <Card as={Link} to={`/project/${project.id}`} className="hover:border-primary-500 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group">
            <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle className="group-hover:text-primary-400 transition-colors">{project.name}</CardTitle>
                  <p className="text-sm text-on-surface-variant mt-1">{project.location}</p>
                </div>
                <Icons.Project className="h-6 w-6 text-on-surface-variant"/>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
                <div>
                    <div className="flex justify-between items-center mb-1 text-sm">
                        <span className="font-medium text-on-surface-variant">Progress</span>
                        <span className="font-bold text-on-surface">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2">
                        <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-outline text-xs text-on-surface-variant flex justify-between">
                    <span>Budget: <span className="font-semibold text-on-surface">{formatCurrency(project.budget, { maximumFractionDigits: 0})}</span></span>
                    <span>Client: <span className="font-semibold text-on-surface">{project.client}</span></span>
                </div>
            </CardContent>
        </Card>
    );
};


const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const projectList = await mockDataService.getProjects();
        setProjects(projectList);
      } catch (err: any) {
        setError("Failed to load projects.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" />
        </div>
    );
  }

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Icons.Project} title="Active Projects" value={projects.length.toString()} subtext="Managed across all sites" />
            <StatCard icon={Icons.Budget} title="Total Budget" value={formatCurrency(totalBudget, { compact: true })} subtext="Across all projects" />
            <StatCard icon={Icons.Alert} title="Alerts" value="3" subtext="Requires attention" />
            <StatCard icon={Icons.Team} title="Personnel" value="124" subtext="Active on sites" />
        </div>
      
        <h2 className="text-2xl font-bold tracking-tight pt-4">My Projects</h2>

        {error && (
            <Card>
                <CardContent className="flex items-center gap-3 text-red-300">
                    <Icons.Alert className="h-5 w-5"/>
                    <p>{error}</p>
                </CardContent>
            </Card>
        )}

        {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        ) : !error && (
             <div className="text-center py-16 px-4 bg-surface rounded-2xl border-2 border-dashed border-outline">
                <Icons.Project className="mx-auto h-12 w-12 text-gray-500" />
                <h3 className="mt-4 text-lg font-semibold text-on-surface">No Projects Found</h3>
                <p className="mt-1 text-sm text-on-surface-variant">Get started by creating a new project.</p>
                <Button variant="tonal" className="mt-6">
                    <Icons.Add className="mr-2 h-5 w-5" />
                    Create Project
                </Button>
            </div>
        )}
        <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg">
            <Icons.Add className="h-6 w-6" />
            <span className="ml-2 hidden sm:inline">New Project</span>
        </Button>
    </div>
  );
};

export default DashboardPage;