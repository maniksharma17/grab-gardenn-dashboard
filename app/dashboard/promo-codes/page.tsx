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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, MoreVertical, Plus, Edit, Trash } from 'lucide-react';
import { fetchPromoCodes, togglePromoCodeStatus, deletePromoCode } from '@/lib/api';
import axios from 'axios';

interface PromoCodeData {
  _id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  active: boolean;
  expiryDate: string;
  minimumOrder: number;
  maxUses?: number;
  usedCount: number;
  oneTimeUsePerUser?: boolean;
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCodeData[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<PromoCodeData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const codesPerPage = 10;

  useEffect(() => {
    const loadPromoCodes = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/dashboard/get`);
        setPromoCodes(response.data);
        setFilteredCodes(response.data);
      } catch (error) {
        console.error('Failed to load promo codes:', error);
        // Use mock data when API fails
        const mockCodes = getMockPromoCodes();
        setPromoCodes(mockCodes);
        setFilteredCodes(mockCodes);
      } finally {
        setIsLoading(false);
      }
    };

    loadPromoCodes();
  }, []);

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCodes(promoCodes);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = promoCodes.filter(
        (code) => code.code.toLowerCase().includes(query)
      );
      setFilteredCodes(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, promoCodes]);

  // Toggle promo code status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/status/${id}`, {
        active: !currentStatus
      });

      if(res.data.success){
        const updatedCodes = promoCodes.map(code => 
          code._id === id ? { ...code, active: !currentStatus } : code
        );
        setPromoCodes(updatedCodes);
        setFilteredCodes(
          filteredCodes.map(code => code._id === id ? { ...code, active: !currentStatus } : code)
        );
        
        toast({
          title: 'Status updated',
          description: `Promo code ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        });
      }
      
    } catch (error) {
      console.error('Failed to update promo code status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle promo code deletion
  const handleDeletePromoCode = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`);
      
      // Update local state
      setPromoCodes(promoCodes.filter(code => code._id !== id));
      setFilteredCodes(filteredCodes.filter(code => code._id !== id));
      
      toast({
        title: 'Promo code deleted',
        description: 'The promo code has been deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete promo code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promo code. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Pagination
  const indexOfLastCode = currentPage * codesPerPage;
  const indexOfFirstCode = indexOfLastCode - codesPerPage;
  const currentCodes = filteredCodes.slice(indexOfFirstCode, indexOfLastCode);
  const totalPages = Math.ceil(filteredCodes.length / codesPerPage);

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

  // Check if a promo code is expired
  const isExpired = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promo Codes</h2>
          <p className="text-muted-foreground">Manage discount codes for your customers</p>
        </div>
        <Link href="/dashboard/promo-codes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Promo Code
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Promo Codes</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search codes..."
                className="pl-8 w-full md:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading promo codes...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Min. Order</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCodes.length > 0 ? (
                      currentCodes.map((code) => (
                        <TableRow key={code._id}>
                          <TableCell className="font-medium uppercase">{code.code}</TableCell>
                          <TableCell>
                            {code.type === 'percent' ? `${code.value}% off` : `₹${code.value} off`}
                          </TableCell>
                          <TableCell>
                            {code.minimumOrder > 0 ? `₹${code.minimumOrder}` : 'None'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{formatDate(code.expiryDate)}</span>
                              {isExpired(code.expiryDate) && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 mt-1 w-fit">
                                  Expired
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {code.maxUses ? `${code.usedCount}/${code.maxUses}` : code.usedCount}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={code.active}
                              onCheckedChange={() => handleToggleStatus(code._id, code.active)}
                              disabled={isExpired(code.expiryDate)}
                            />
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
                                <Link href={`/dashboard/promo-codes/edit/${code._id}`}>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the promo code &quot;{code.code}&quot;. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeletePromoCode(code._id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No promo codes found.
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

// Mock data for promo codes
function getMockPromoCodes(): PromoCodeData[] {
  return [
    {
      _id: '1',
      code: 'WELCOME10',
      type: 'percent',
      value: 10,
      active: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      minimumOrder: 500,
      maxUses: 100,
      usedCount: 42,
      oneTimeUsePerUser: true
    },
    {
      _id: '2',
      code: 'SUMMER25',
      type: 'percent',
      value: 25,
      active: true,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      minimumOrder: 1000,
      usedCount: 89
    },
    {
      _id: '3',
      code: 'FLAT200',
      type: 'flat',
      value: 200,
      active: true,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      minimumOrder: 1500,
      maxUses: 50,
      usedCount: 23
    },
    {
      _id: '4',
      code: 'SPECIAL15',
      type: 'percent',
      value: 15,
      active: false,
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      minimumOrder: 800,
      usedCount: 112
    }
  ];
}