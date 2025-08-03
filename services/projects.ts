import { supabase } from './supabase';
import { Project, ProjectStatus } from '../types';

export const projectService = {
    async getProjects(): Promise<Project[]> {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('status', 'Active');

        if (error) throw error;
        return data || [];
    },

    async getProject(id: string): Promise<Project | null> {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                tasks ( * ),
                project_members ( *, profiles ( * ) ),
                inventory_items ( * ),
                orders ( * ),
                expenses ( * ),
                documents ( * )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Project | null;
    },

    // ... other project functions will be added here
};
