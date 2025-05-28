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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Package, Search, MoreVertical, Plus, Edit, Trash, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchProducts, deleteProduct } from '@/lib/api';
import axios from "axios";
import Image from 'next/image';

interface ProductData {
  _id: string;
  name: string;
  hindiName?: string;
  category: {
    _id: string;
    name: string;
  };
  price: number[];
  variants: Array<{
    display: string;
    value: number;
  }>;
  stock: number;
  images: string[];
  createdAt: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const productsPerPage = 10;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`);
        setProducts(data.data.products);
        setFilteredProducts(data.data.products);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [toast]);

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          (product.hindiName && product.hindiName.toLowerCase().includes(query)) ||
          product.category.name.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, products]);

  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`);
      
      // Update local state
      setProducts(products.filter(product => product._id !== id));
      setFilteredProducts(filteredProducts.filter(product => product._id !== id));
      
      toast({
        title: 'Product deleted',
        description: 'The product has been deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Generate pagination numbers
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(i);
  }

  // Mock data when API is not available
  const mockProducts: ProductData[] = [
    {
      _id: '1',
      name: 'Organic Bajra',
      hindiName: 'जैविक बाजरा',
      category: { _id: 'c1', name: 'Millets' },
      price: [99, 199, 499],
      variants: [
        { display: '500g', value: 0 },
        { display: '1kg', value: 1 },
        { display: '3kg', value: 2 }
      ],
      stock: 25,
      images: ['https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
      createdAt: '2023-05-15T12:30:00Z'
    },
    {
      _id: '2',
      name: 'Brown Sugar',
      hindiName: 'भूरी चीनी',
      category: { _id: 'c2', name: 'Sugar' },
      price: [149, 299],
      variants: [
        { display: '500g', value: 0 },
        { display: '1kg', value: 1 }
      ],
      stock: 40,
      images: ['https://images.pexels.com/photos/5946083/pexels-photo-5946083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
      createdAt: '2023-05-16T10:15:00Z'
    },
    {
      _id: '3',
      name: 'Basmati Rice',
      hindiName: 'बासमती चावल',
      category: { _id: 'c3', name: 'Rice' },
      price: [399, 799, 1199],
      variants: [
        { display: '1kg', value: 0 },
        { display: '2kg', value: 1 },
        { display: '5kg', value: 2 }
      ],
      stock: 15,
      images: ['https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
      createdAt: '2023-05-17T14:45:00Z'
    },
    {
      _id: '4',
      name: 'Organic Jowar',
      hindiName: 'जैविक ज्वार',
      category: { _id: 'c1', name: 'Millets' },
      price: [129, 249, 599],
      variants: [
        { display: '500g', value: 0 },
        { display: '1kg', value: 1 },
        { display: '3kg', value: 2 }
      ],
      stock: 30,
      images: ['https://images.pexels.com/photos/1537169/pexels-photo-1537169.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
      createdAt: '2023-05-18T11:20:00Z'
    },
    {
      _id: '5',
      name: 'Palm Sugar',
      hindiName: 'ताड़ की चीनी',
      category: { _id: 'c2', name: 'Sugar' },
      price: [199, 389],
      variants: [
        { display: '500g', value: 0 },
        { display: '1kg', value: 1 }
      ],
      stock: 22,
      images: ['https://images.pexels.com/photos/6412919/pexels-photo-6412919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'],
      createdAt: '2023-05-19T09:10:00Z'
    }
  ];

  // Use mock data if no products loaded
  const displayProducts = currentProducts.length > 0 ? currentProducts : mockProducts;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Products</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading products...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayProducts.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell>
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                height={100}
                                width={100}
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            {product.name}
                            {product.hindiName && (
                              <div className="text-sm text-muted-foreground">
                                {product.hindiName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category.name}</Badge>
                        </TableCell>
                        <TableCell>
                          {product.price.length > 0 ? (
                            <div>
                              <span>₹{product.price[0]}</span>
                              {product.price.length > 1 && (
                                <span className="text-muted-foreground text-xs"> - ₹{product.price[product.price.length - 1]}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No price set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.stock > 10 ? "default" : product.stock > 0 ? "outline" : "destructive"}
                            className={product.stock > 10 ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300" : ""}
                          >
                            {product.stock > 0 ? product.stock : "Out of stock"}
                          </Badge>
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
                              <Link href={`https://grabgardenn.com/products/${product._id}`}>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/dashboard/products/edit/${product._id}`}>
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
                                      This will permanently delete the product. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteProduct(product._id)}
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
                    ))}
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