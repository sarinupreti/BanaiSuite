import { supabase } from './supabase';
import { Task } from '../types';

export const taskService = {
    async getTasksForUser(userId: string): Promise<Task[]> {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects (id, name)
            `)
            .eq('assignee_id', userId);

        if (error) throw error;
        return data || [];
    },

    async createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
        const { data, error } = await supabase
            .from('tasks')
            .update(taskData)
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTask(taskId: string): Promise<void> {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) throw error;
    }
};
