
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockDataService } from '../services/mockData';
import { Project, Document } from '../types';
import { Icons } from '../components/Icons';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Button } from '../components/ui';
import DocumentModal from '../components/DocumentModal';
import { useAuth } from '../App';

const typeIconMap: { [key in Document['type']]: React.ElementType } = {
    Drawing: Icons.Ruler,
    PDF: Icons.Documents,
    Image: Icons.FileImage,
    Permit: Icons.Award,
};

const DocumentRow: React.FC<{ doc: Document; onNewVersion: () => void; onDelete: () => void }> = ({ doc, onNewVersion, onDelete }) => {
    const TypeIcon = typeIconMap[doc.type] || Icons.Documents;

    return (
        <tr className="border-b border-outline hover:bg-surface-variant/50">
            <td className="p-4 font-medium">
                <div className="flex items-center gap-3">
                    <TypeIcon className="h-6 w-6 text-primary-400 shrink-0" />
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.name}</a>
                </div>
            </td>
            <td className="p-4 text-sm text-center">v{doc.version}</td>
            <td className="p-4 text-sm">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
            <td className="p-4 text-sm">
                <div className="flex items-center gap-2">
                    <img src={doc.uploadedBy.avatarUrl} alt={doc.uploadedBy.name} className="h-7 w-7 rounded-full" />
                    <span>{doc.uploadedBy.name}</span>
                </div>
            </td>
            <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Button as="a" href={doc.url} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm"><Icons.Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={onNewVersion}><Icons.Upload className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={onDelete}><Icons.Trash className="h-4 w-4" /></Button>
                </div>
            </td>
        </tr>
    );
};

const DocumentsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docToUpdate, setDocToUpdate] = useState<Document | null>(null);

    const fetchProject = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const projectData = await mockDataService.getProject(id);
            setProject(projectData);
        } catch (error) {
            console.error("Failed to fetch project documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleOpenModal = (doc: Document | null) => {
        setDocToUpdate(doc);
        setIsModalOpen(true);
    };

    const handleSaveDocument = async (docData: { file: File, type?: Document['type'] }) => {
        if (!id || !user) return;

        if (docToUpdate) {
            // Updating an existing document (new version)
            await mockDataService.updateDocumentVersion(id, docToUpdate.id, { file: docData.file, uploadedBy: user });
        } else {
            // Creating a new document
            if (docData.type) {
                await mockDataService.addDocument(id, { file: docData.file, type: docData.type, uploadedBy: user });
            }
        }
        
        await fetchProject();
        setIsModalOpen(false);
    };
    
    const handleDeleteDocument = async (docId: string) => {
        if (!id || !user || !window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
        
        await mockDataService.deleteDocument(id, docId, user);
        await fetchProject();
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Documents</h1>
                    <p className="text-on-surface-variant">Project: {project.name}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Documents</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-on-surface">
                            <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30">
                                <tr>
                                    <th scope="col" className="p-4">File Name</th>
                                    <th scope="col" className="p-4 text-center">Version</th>
                                    <th scope="col" className="p-4">Last Updated</th>
                                    <th scope="col" className="p-4">Uploaded By</th>
                                    <th scope="col" className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {project.documents.length > 0 ? (
                                    project.documents.map(doc => 
                                        <DocumentRow 
                                            key={doc.id} 
                                            doc={doc} 
                                            onNewVersion={() => handleOpenModal(doc)}
                                            onDelete={() => handleDeleteDocument(doc.id)}
                                        />)
                                ) : (
                                     <tr>
                                        <td colSpan={5}>
                                            <div className="text-center py-16 px-4">
                                                <Icons.Documents className="mx-auto h-12 w-12 text-gray-500" />
                                                <h3 className="mt-4 text-lg font-semibold text-on-surface">No Documents Found</h3>
                                                <p className="mt-1 text-sm text-on-surface-variant">Upload your first document to get started.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <DocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDocument}
                documentToUpdate={docToUpdate}
            />

            <Button variant="filled" size="lg" className="fab rounded-2xl shadow-lg" onClick={() => handleOpenModal(null)}>
                <Icons.Add className="h-6 w-6" />
                <span className="ml-2 hidden sm:inline">Upload Document</span>
            </Button>
        </div>
    );
};

export default DocumentsPage;
