import { NextResponse } from 'next/server';
import { DashboardStats } from '@/types/dashboard';

export async function GET() {
  // Mock data for demonstration - replace with actual database queries
  const mockStats: DashboardStats = {
    totalOrders: 150,
    totalRevenue: 15000,
    averageOrderValue: 100,
    totalCustomers: 75,
    recentOrders: [
      {
        id: '1',
        customerName: 'John Doe',
        amount: 150,
        status: 'completed',
        date: new Date().toISOString(),
      },
      {
        id: '2',
        customerName: 'Jane Smith',
        amount: 200,
        status: 'pending',
        date: new Date().toISOString(),
      },
    ],
    topProducts: [
      {
        id: '1',
        name: 'Product A',
        sales: 50,
        revenue: 5000,
      },
      {
        id: '2',
        name: 'Product B',
        sales: 30,
        revenue: 3000,
      },
    ],
  };

  return NextResponse.json(mockStats);
}