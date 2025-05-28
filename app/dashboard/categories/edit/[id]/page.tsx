"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/lib/api";
import { ArrowLeft, ImageIcon, Plus, Trash } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { set } from "date-fns";
import { uploadToS3 } from "@/lib/upload";

// Define the form schema
const productSchema = z.object({
  _id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  hindiName: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  variants: z
    .array(
      z.object({
        display: z.string().min(1, "Variant name is required"),
        value: z.number(),
      })
    )
    .min(1, "At least one variant is required"),
  price: z.array(z.string()).min(1, "At least one price is required"),
  cutoffPrice: z
    .array(z.string())
    .min(1, "At least one cutoff price is required"),
  benefits: z.array(z.string()).min(1, "At least one benefit is required"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  instructions: z
    .array(z.string())
    .min(1, "At least one instruction is required"),
  storage: z.string().min(1, "Storage information is required"),
  stock: z.string().transform((val) => parseInt(val, 10) || 0),
  dimensions: z.object({
    length: z.string().transform((val) => parseFloat(val) || 0),
    breadth: z.string().transform((val) => parseFloat(val) || 0),
    height: z.string().transform((val) => parseFloat(val) || 0),
  }),
  images: z.array(z.string()),
});

const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
  image: z.string().optional(),
  description: z.string().optional(),
  products: z.array(z.string()),
  createdAt: z.string(),
});

type CategoryFormValues = z.infer<typeof CategorySchema>;
type ProductType = z.infer<typeof productSchema>;

export default function EditCategoryPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  // Handle form state for arrays
  const [category, setCategory] = useState<any>({});
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  // Fetch Product Details
  useEffect(() => {
    const fetchCategory = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${id}`
      );
      setCategory(response.data.category[0]);
    };

    fetchCategory();
  }, [id]);

  // Initialize form
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      products: [],
    },
  });

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`
      );
      setAllProducts(response.data.products);
    };
    fetchProducts();
  }, []);

  // Populate form when product is loaded
  useEffect(() => {
    if (category && category.name) {
      form.reset({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        products: category.products?.map((p: any) => p._id) || [],
        _id: category._id || "",
        createdAt: category.createdAt || "",
      });
      setSelectedProducts(category.products || []);
    }
  }, [category, form, allProducts]);

  // Form submission handler
  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories/${form.getValues("_id")}`,
        values
      );
      toast({ title: "Category created successfully" });
      router.push("/dashboard/categories");
      form.reset();
      setSelectedProducts([]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/categories">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Edit Category</h2>
        </div>
      </div>
      {category && (
        <div className="p-4 flex flex-row items-center gap-10 rounded-lg border border-gray-300">
          {category.image && (
            <div className="mt-2">
              <Image
                src={category.image}
                alt={category.name as string}
                width={100}
                height={100}
                className="rounded-md"
              />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold">Category: {category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={form.handleSubmit(
        (data) => {
          onSubmit(data);
        }, 
        (errors) => {
          console.error("Form errors:", errors);
          toast({
            title: "Error",
            description: "Please fix the errors in the form",
            variant: "destructive",
          });
      })}>
        
        <div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Fill in the basic information about the product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Product Name"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Product Description"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    {...form.register("image")}
                    placeholder="Image URL"
                    disabled={isLoading}
                  />
                  {/* Upload Button */}
                  <Input
                    type="file"
                    accept="image/*"
                    id={`upload-image`}
                    className=""
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        const uploadedUrl = await uploadToS3(file);
                        form.setValue("image", uploadedUrl);
                      } catch (err) {
                        console.error("Upload failed", err);
                        alert("Image upload failed");
                      }
                    }}
                  />
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    <Image
                      src={form.watch("image") || ""}
                      alt={`Preview image`}
                      className="h-full w-full object-cover"
                      width={100}
                      height={100}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://placehold.co/100x100?text=Error";
                      }}
                    />
                  </div>
                </div>


                <div>
                  <Label htmlFor="product-select">
                    Add Product to Category
                  </Label>
                  <Select
                    onValueChange={(productId) => {
                      const productToAdd = allProducts.find(
                        (p) => p._id === productId
                      );
                      if (
                        productToAdd &&
                        !selectedProducts.some(
                          (p) => p._id === productToAdd._id
                        )
                      ) {
                        const updated = [...selectedProducts, productToAdd];
                        setSelectedProducts(updated);
                        form.setValue(
                          "products",
                          updated.map((p) => p._id)
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select a product to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts &&
                        allProducts.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Selected Products</Label>
                    {selectedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center">
                          <Image
                            src={product.images[0] as string}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded-md mr-2"
                          />
                          <span className="font-semibold">{product.name}</span>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const updated = selectedProducts.filter(
                              (p) => p._id !== product._id
                            );
                            setSelectedProducts(updated);
                            form.setValue(
                              "products",
                              updated.map((p) => p._id)
                            );
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add more fields as needed */}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
