import { supabase } from './supabase';
import { InventoryItem } from '../types';

export const inventoryService = {
    async getInventory(projectId: string): Promise<InventoryItem[]> {
        const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('project_id', projectId);

        if (error) throw error;
        return data || [];
    },

    async createInventoryItem(itemData: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('inventory_items')
            .insert([itemData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateInventoryItem(itemId: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
        const { data, error } = await supabase
            .from('inventory_items')
            .update(itemData)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteInventoryItem(itemId: string): Promise<void> {
        const { error } = await supabase
            .from('inventory_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
    }
};
