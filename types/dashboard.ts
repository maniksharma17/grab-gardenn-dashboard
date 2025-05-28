export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: string;
  }>;
  salesData: Array<{
    name: string;
    sales: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
}