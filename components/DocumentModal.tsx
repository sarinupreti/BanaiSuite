
import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../types';
import { Button } from './ui';
import { Icons } from './Icons';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (docData: { file: File, type?: Document['type'] }) => void;
  documentToUpdate?: Document | null;
}

const FormField = ({ id, label, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const inputClasses = "w-full rounded-lg border border-outline bg-surface-variant px-3 py-2 text-on-surface placeholder-on-surface-variant focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm disabled:bg-surface-variant/50 disabled:cursor-not-allowed";

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, onSave, documentToUpdate }) => {
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState<Document['type']>('PDF');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isUpdateMode = !!documentToUpdate;

    useEffect(() => {
        if (isOpen) {
            setFile(null); // Reset file on open
            if (isUpdateMode) {
                setType(documentToUpdate.type);
            } else {
                setType('PDF');
            }
        }
    }, [documentToUpdate, isOpen, isUpdateMode]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return; // Cannot save without a file

        setIsLoading(true);

        const dataToSave: { file: File, type?: Document['type'] } = { file };
        if (!isUpdateMode) {
            dataToSave.type = type;
        }

        await onSave(dataToSave);
        setIsLoading(false);
        onClose();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
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
                            {isUpdateMode ? `Upload New Version (v${documentToUpdate.version + 1})` : 'Upload New Document'}
                         </h3>
                         <button type="button" onClick={onClose} className="p-1 rounded-full text-on-surface-variant hover:bg-surface-variant">
                            <Icons.Error className="h-5 w-5" />
                         </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {isUpdateMode && (
                             <div className="p-3 bg-primary-container/30 rounded-lg text-sm text-on-primary-container">
                                 Updating document: <span className="font-semibold">{documentToUpdate.name}</span>
                             </div>
                        )}
                        
                        <FormField id="file" label="Document File">
                             <Button type="button" variant="outlined" onClick={() => fileInputRef.current?.click()} className="w-full">
                                <Icons.Upload className="h-4 w-4 mr-2"/>
                                {file ? 'Change File' : 'Choose File'}
                            </Button>
                            <input
                                id="file"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                required
                            />
                            {file && <p className="text-sm text-on-surface-variant mt-2 text-center">Selected: {file.name}</p>}
                        </FormField>

                        <FormField id="type" label="Document Type">
                           <select 
                                id="type" 
                                value={type} 
                                onChange={e => setType(e.target.value as Document['type'])} 
                                className={inputClasses}
                                disabled={isUpdateMode}
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="Drawing">Drawing / Plan</option>
                                <option value="Image">Image / Photo</option>
                                <option value="Permit">Permit / License</option>
                           </select>
                        </FormField>
                    </div>
                    
                    <div className="flex justify-end gap-4 p-4 border-t border-outline bg-surface-variant/30 rounded-b-2xl">
                         <Button type="button" variant="outlined" onClick={onClose}>Cancel</Button>
                         <Button type="submit" variant="filled" isLoading={isLoading} disabled={!file}>
                            {isUpdateMode ? 'Upload New Version' : 'Upload Document'}
                         </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DocumentModal;
