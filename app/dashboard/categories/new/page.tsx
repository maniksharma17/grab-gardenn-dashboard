"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash } from "lucide-react";
import { uploadToS3 } from "@/lib/upload";
import { useRouter } from "next/navigation";
import { error } from "console";
import { create } from "domain";

// Schema
const CategorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  image: z.string().optional(),
  description: z.string().optional(),
  products: z.array(z.string()).optional(),
  _id: z.string(),
  createdAt: z.string()
});

type CategoryFormValues = z.infer<typeof CategorySchema>;

type ProductType = {
  _id: string;
  name: string;
  images: string[];
};

export default function AddCategoryPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const router = useRouter();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      image: "",
      products: [],
    },
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products`
        );
        setAllProducts(response.data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (values: CategoryFormValues) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`,
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
      <div className="flex items-center gap-2">
        <Link href="/dashboard/categories">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Add New Category</h2>
      </div>

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
        }
      )}>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Fill in the basic information about the category.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div>
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Category Name"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Category Description"
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
              <Label htmlFor="product-select">Add Products to Category</Label>
              <Select
                onValueChange={(productId) => {
                  const selected = allProducts.find((p) => p._id === productId);
                  if (
                    selected &&
                    !selectedProducts.some((p) => p._id === selected._id)
                  ) {
                    const updated = [...selectedProducts, selected];
                    setSelectedProducts(updated);
                    form.setValue(
                      "products",
                      updated.map((p) => p._id)
                    );
                  }
                }}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select product to add" />
                </SelectTrigger>
                <SelectContent>
                  {allProducts.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProducts.length > 0 && (
              <div className="space-y-2 mt-4">
                <Label>Selected Products</Label>
                {selectedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={product.images[0] || ""}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                      <span>{product.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              Create Category
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
