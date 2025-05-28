'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Search, MoreVertical, Eye } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '@/lib/api';
import axios from 'axios';

interface OrderData {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
    };
    quantity: number;
    price: number;
    variant: {
      display: string;
      value: number;
    };
  }>;
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  type: 'prepaid' | 'cod';
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const ordersPerPage = 10;

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
        setOrders(response.data.orders);
        setFilteredOrders(response.data.orders);
      } catch (error) {
        console.error('Failed to load orders:', error);
        // Use mock data when API fails
        const mockOrders = getMockOrders();
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = orders;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        order => 
          order._id.toLowerCase().includes(query) ||
          order.user.name.toLowerCase().includes(query) ||
          order.user.email.toLowerCase().includes(query) ||
          order.shippingAddress.name.toLowerCase().includes(query) ||
          order.shippingAddress.phone.includes(query)
      );
    }
    
    setFilteredOrders(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchQuery, statusFilter, orders]);

  // Update order status
  const handleStatusUpdate = async (id: string, newStatus: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/update-status/${id}`, { status: newStatus });
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order._id === id ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(
        filteredOrders.map(order => 
          order._id === id ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: 'Status updated',
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Generate pagination numbers
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(i);
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-full md:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading orders...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-medium">{order._id}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{order.shippingAddress.name}</span>
                              <span className="text-xs text-muted-foreground">{order.user?.email || ''}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell>{order.items.length}</TableCell>
                          <TableCell>₹{order.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              order.type === 'prepaid'
                                ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            }>
                              {order.type === 'prepaid' ? 'Prepaid' : 'COD'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select 
                              defaultValue={order.status}
                              onValueChange={(value) => handleStatusUpdate(
                                order._id, 
                                value as 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
                              )}
                            >
                              <SelectTrigger className={`w-[130px] h-8 ${getStatusBadge(order.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/dashboard/orders/${order._id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No orders found matching the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {paginationItems.map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Mock data for orders
function getMockOrders(): OrderData[] {
  return [
    {
      _id: 'ORD-001',
      user: {
        _id: 'user1',
        name: 'Rahul Singh',
        email: 'rahul@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod1',
            name: 'Organic Bajra'
          },
          quantity: 2,
          price: 399,
          variant: {
            display: '1kg',
            value: 1
          }
        },
        {
          product: {
            _id: 'prod2',
            name: 'Brown Sugar'
          },
          quantity: 1,
          price: 149,
          variant: {
            display: '500g',
            value: 0
          }
        }
      ],
      total: 947,
      status: 'delivered',
      type: 'prepaid',
      shippingAddress: {
        name: 'Rahul Singh',
        street: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        phone: '9876543210'
      },
      createdAt: '2023-06-01T10:30:00Z'
    },
    {
      _id: 'ORD-002',
      user: {
        _id: 'user2',
        name: 'Priya Sharma',
        email: 'priya@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod3',
            name: 'Basmati Rice'
          },
          quantity: 1,
          price: 799,
          variant: {
            display: '2kg',
            value: 1
          }
        }
      ],
      total: 799,
      status: 'processing',
      type: 'cod',
      shippingAddress: {
        name: 'Priya Sharma',
        street: '456 Park Avenue',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        phone: '8765432109'
      },
      createdAt: '2023-06-02T14:15:00Z'
    },
    {
      _id: 'ORD-003',
      user: {
        _id: 'user3',
        name: 'Amit Kumar',
        email: 'amit@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod1',
            name: 'Organic Bajra'
          },
          quantity: 1,
          price: 399,
          variant: {
            display: '1kg',
            value: 1
          }
        },
        {
          product: {
            _id: 'prod4',
            name: 'Organic Jowar'
          },
          quantity: 2,
          price: 249,
          variant: {
            display: '1kg',
            value: 1
          }
        },
        {
          product: {
            _id: 'prod5',
            name: 'Palm Sugar'
          },
          quantity: 1,
          price: 199,
          variant: {
            display: '500g',
            value: 0
          }
        }
      ],
      total: 1096,
      status: 'shipped',
      type: 'prepaid',
      shippingAddress: {
        name: 'Amit Kumar',
        street: '789 Lake View',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        phone: '7654321098'
      },
      createdAt: '2023-06-03T09:45:00Z'
    },
    {
      _id: 'ORD-004',
      user: {
        _id: 'user4',
        name: 'Neha Patel',
        email: 'neha@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod2',
            name: 'Brown Sugar'
          },
          quantity: 2,
          price: 149,
          variant: {
            display: '500g',
            value: 0
          }
        }
      ],
      total: 298,
      status: 'confirmed',
      type: 'cod',
      shippingAddress: {
        name: 'Neha Patel',
        street: '101 Hill Road',
        city: 'Ahmedabad',
        state: 'Gujarat',
        zipCode: '380001',
        phone: '6543210987'
      },
      createdAt: '2023-06-04T16:20:00Z'
    },
    {
      _id: 'ORD-005',
      user: {
        _id: 'user5',
        name: 'Vikram Joshi',
        email: 'vikram@example.com'
      },
      items: [
        {
          product: {
            _id: 'prod3',
            name: 'Basmati Rice'
          },
          quantity: 1,
          price: 799,
          variant: {
            display: '2kg',
            value: 1
          }
        },
        {
          product: {
            _id: 'prod5',
            name: 'Palm Sugar'
          },
          quantity: 1,
          price: 199,
          variant: {
            display: '500g',
            value: 0
          }
        }
      ],
      total: 998,
      status: 'cancelled',
      type: 'prepaid',
      shippingAddress: {
        name: 'Vikram Joshi',
        street: '202 River Side',
        city: 'Kolkata',
        state: 'West Bengal',
        zipCode: '700001',
        phone: '5432109876'
      },
      createdAt: '2023-06-05T11:10:00Z'
    }
  ];
}