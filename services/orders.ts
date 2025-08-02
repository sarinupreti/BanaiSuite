import { supabase } from './supabase';
import { Order } from '../types';

export const orderService = {
    async getOrders(projectId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                requested_by:profiles (*),
                approved_by:profiles (*)
            `)
            .eq('project_id', projectId);

        if (error) throw error;
        return data || [];
    },

    async createOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateOrder(orderId: string, orderData: Partial<Order>): Promise<Order> {
        const { data, error } = await supabase
            .from('orders')
            .update(orderData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
