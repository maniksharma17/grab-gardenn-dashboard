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
import { ArrowLeft, ImageIcon, Plus, Trash } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import Image from "next/image";
import { uploadToS3 } from "@/lib/upload";

// Define the form schema
const productSchema = z.object({
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
  price: z.array(z.number()).min(1, "At least one price is required"),
  cutoffPrice: z
    .array(z.number())
    .min(1, "At least one cutoff price is required"),
  benefits: z.array(z.string()).min(1, "At least one benefit is required"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required"),
  instructions: z.array(z.string()),
  storage: z.string().min(1, "Storage information is required"),
  stock: z.number(),
  dimensions: z.array(
    z.object({
      length: z.number(),
      breadth: z.number(),
      height: z.number(),
    })
  ),
  images: z.array(z.string()),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Category {
  _id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const { id } = params;

  // Tab management
  const [tab, setTab] = useState("basic");

  // Handle form state for arrays
  const [product, setProduct] = useState<Partial<ProductFormValues>>({});
  const [variantFields, setVariantFields] = useState([
    { display: "", value: 0 },
  ]);
  const [dimensionFields, setDimensionFields] = useState([
    { length: 0, breadth: 0, height: 0 },
  ]);
  const [priceFields, setPriceFields] = useState<any[]>([]);
  const [cutoffPriceFields, setCutoffPriceFields] = useState<any[]>([]);
  const [benefitFields, setBenefitFields] = useState([""]);
  const [ingredientFields, setIngredientFields] = useState([""]);
  const [instructionFields, setInstructionFields] = useState([""]);
  const [imageUrls, setImageUrls] = useState([""]);

  // Fetch Product Details
  useEffect(() => {
    const fetchProduct = async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/dashboard/${id}`
      );
      setProduct(response.data.product);

      if (response.data.product) {
        const product = response.data.product;
        setVariantFields(product.variants);
        setPriceFields(product.price);
        setCutoffPriceFields(product.cutoffPrice);
        setDimensionFields(product.dimensions);
        setBenefitFields(product.benefits);
        setIngredientFields(product.ingredients);
        setInstructionFields(product.instructions);
        setImageUrls(product.images);
      }
    };

    fetchProduct();
  }, [id]);

  // Initialize form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      hindiName: "",
      description: "",
      category: "",
      variants: [{ display: "", value: 0 }],
      price: [],
      cutoffPrice: [],
      benefits: [],
      ingredients: [""],
      instructions: [""],
      storage: "",
      stock: 0,
      dimensions: [
        {
          length: 0,
          breadth: 0,
          height: 0,
        },
      ],
      images: [],
    },
  });

  console.log("Form values:", form.getValues());

  // Populate form when product is loaded
  useEffect(() => {
    if (product && product.name) {
      form.reset({
        name: product.name || "",
        hindiName: product.hindiName || "",
        description: product.description || "",
        category: product.category || "",
        variants: product.variants || [{ display: "", value: 0 }],
        price: product.price || [],
        cutoffPrice: product.cutoffPrice || [],
        benefits: product.benefits || [""],
        ingredients: product.ingredients || [""],
        instructions: product.instructions || [""],
        storage: product.storage || "",
        stock: product.stock || 0,
        dimensions: product.dimensions || [],
        images: product.images || [],
      });
    }
  }, [product, form]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories`
        );
        setCategories(data.data);
      } catch (error) {
        console.error("Error loading categories:", error);
        // Fallback mock data
        setCategories([
          { _id: "1", name: "Millets" },
          { _id: "2", name: "Rice" },
          { _id: "3", name: "Sugar" },
          { _id: "4", name: "Spices" },
        ]);
      }
    };

    loadCategories();
  }, []);

  // Form submission handler
  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);

    // Convert price and cutoffPrice to numbers
    const numericPrices = values.price.map((p) =>
      typeof p === "string" ? parseFloat(p) : p
    );
    const numericCutoffPrices = values.cutoffPrice.map((p) =>
      typeof p === "string" ? parseFloat(p) : p
    );

    // Convert variant values to numbers
    const numericVariants = values.variants.map((variant) => ({
      display: variant.display,
      value:
        typeof variant.value === "string"
          ? parseFloat(variant.value)
          : variant.value,
    }));

    // Convert dimensions to numbers
    const numericDimensions = values.dimensions.map((dim) => ({
      length:
        typeof dim.length === "string" ? parseFloat(dim.length) : dim.length,
      breadth:
        typeof dim.breadth === "string" ? parseFloat(dim.breadth) : dim.breadth,
      height:
        typeof dim.height === "string" ? parseFloat(dim.height) : dim.height,
    }));

    // Convert stock to number if it's a string
    const numericStock =
      typeof values.stock === "string"
        ? parseFloat(values.stock)
        : values.stock;

    // Clean up empty strings from arrays
    const cleanedBenefits = values.benefits.filter(
      (item) => item.trim() !== ""
    );
    const cleanedIngredients = values.ingredients.filter(
      (item) => item.trim() !== ""
    );
    const cleanedInstructions = values.instructions.filter(
      (item) => item.trim() !== ""
    );
    const cleanedImages = values.images.filter((img) => img.trim() !== "");

    // Construct clean data object
    const productData = {
      ...values,
      price: numericPrices,
      cutoffPrice: numericCutoffPrices,
      variants: numericVariants,
      dimensions: numericDimensions,
      stock: numericStock,
      benefits: cleanedBenefits,
      ingredients: cleanedIngredients,
      instructions: cleanedInstructions,
      images: cleanedImages,
    };

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
        productData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast({
        title: "Product updated",
        description: "Your product has been successfully updated.",
      });
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Field array management functions
  const addVariant = () => {
    const newValue = variantFields.length;
    setVariantFields([...variantFields, { display: "", value: 0 }]);
    setDimensionFields([
      ...dimensionFields,
      { length: 0, breadth: 0, height: 0 },
    ]);
    setPriceFields([...priceFields, 0]);
    setCutoffPriceFields([...cutoffPriceFields, 0]);
    form.setValue("variants", [
      ...form.getValues("variants"),
      { display: "", value: newValue },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variantFields.length > 1) {
      const updatedFields = [...variantFields];
      updatedFields.splice(index, 1);
      setVariantFields(updatedFields);

      const updatedValues = [...form.getValues("variants")];
      form.setValue("variants", updatedValues.slice(0, updatedFields.length));

      // Also update prices and cutoff prices
      setPriceFields(priceFields.slice(0, updatedFields.length));
      setCutoffPriceFields(cutoffPriceFields.slice(0, updatedFields.length));
      setDimensionFields(dimensionFields.slice(0, updatedFields.length));

      form.setValue(
        "price",
        form.getValues("price").slice(0, updatedFields.length)
      );
      form.setValue(
        "cutoffPrice",
        form.getValues("cutoffPrice").slice(0, updatedFields.length)
      );
      form.setValue(
        "dimensions",
        form.getValues("dimensions").slice(0, updatedFields.length)
      );
    }
  };

  // Generic add/remove functions for array fields
  const addField = (
    getter: any[],
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    formField: string
  ) => {
    const updated = [...getter, ""];
    setter(updated);
    form.setValue(formField as any, updated);
  };

  const removeField = (
    index: number,
    getter: any[],
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    formField: string
  ) => {
    const updated = [...getter];
    updated.splice(index, 1);
    setter(updated);
    form.setValue(formField as any, updated);
  };

  // Handle field changes
  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...variantFields];
    if (field === "display") {
      updated[index] = { ...updated[index], display: value };
    } else if (field === "value") {
      updated[index] = { ...updated[index], value: parseFloat(value) };
    }
    setVariantFields(updated);

    const formValues = [...form.getValues("variants")];
    formValues[index] = {
      ...formValues[index],
      [field]: field === "value" ? parseFloat(value) : value,
    };
    form.setValue("variants", formValues);
  };

  const handleArrayFieldChange = (
    index: number,
    value: string,
    getter: any[],
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    formField: string
  ) => {
    const updated = [...getter];
    updated[index] =
      formField === "price" || formField === "cutoffPrice"
        ? parseFloat(value)
        : value.toString();
    setter(updated);

    const formValues = [...form.getValues(formField as any)];
    formValues[index] =
      formField === "price" || formField === "cutoffPrice"
        ? parseFloat(value)
        : value.toString();
    form.setValue(formField as any, formValues);
  };

  const handleDimensionFieldChange = (
    index: number,
    value: string,
    getter: { length: number; breadth: number; height: number }[],
    setter: React.Dispatch<
      React.SetStateAction<
        { length: number; breadth: number; height: number }[]
      >
    >,
    formField: string,
    field: "length" | "breadth" | "height"
  ) => {
    const updated = [...getter];
    updated[index] = {
      ...updated[index],
      [field]: Number(value),
    };
    setter(updated);

    const formValues = [...form.getValues(formField as any)];
    formValues[index] = {
      ...formValues[index],
      [field]: Number(value),
    };
    form.setValue(formField as any, formValues);
  };

  function sanitizeProductData(values: ProductFormValues) {
    return {
      ...values,

      // Convert price arrays to numbers
      price: values.price.map((p) =>
        typeof p === "string" ? parseFloat(p) : p
      ),
      cutoffPrice: values.cutoffPrice.map((p) =>
        typeof p === "string" ? parseFloat(p) : p
      ),

      // Ensure variants have numeric values
      variants: values.variants.map((variant) => ({
        display: variant.display,
        value:
          typeof variant.value === "string"
            ? parseFloat(variant.value)
            : variant.value,
      })),

      // Ensure dimensions are numbers
      dimensions: values.dimensions.map((dim) => ({
        length:
          typeof dim.length === "string" ? parseFloat(dim.length) : dim.length,
        breadth:
          typeof dim.breadth === "string"
            ? parseFloat(dim.breadth)
            : dim.breadth,
        height:
          typeof dim.height === "string" ? parseFloat(dim.height) : dim.height,
      })),

      // Convert stock to number
      stock:
        typeof values.stock === "string"
          ? parseFloat(values.stock)
          : values.stock,

      // Clean empty strings from arrays
      benefits: values.benefits.filter((b) => b.trim() !== ""),
      ingredients: values.ingredients.filter((i) => i.trim() !== ""),
      instructions: values.instructions.filter((i) => i.trim() !== ""),
      images: values.images.filter((img) => img.trim() !== ""),
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/products">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(
          (data: ProductFormValues) => {
            const sanitizedData = sanitizeProductData(data);
            onSubmit(sanitizedData);
          },
          (errors) => {
            console.error("Validation errors:", errors);
          }
        )}
      >
        <Tabs value={tab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Variants</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the core details of your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name (English)*</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Organic Bajra"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hindiName">Product Name (Hindi)</Label>
                    <Input
                      id="hindiName"
                      placeholder="e.g., जैविक बाजरा"
                      {...form.register("hindiName")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail..."
                    rows={5}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                </div>

                {product && categories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <Select
                      onValueChange={(value) =>
                        form.setValue("category", value)
                      }
                      value={form.watch("category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity*</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    {...form.register("stock", { valueAsNumber: true })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/dashboard/products")}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={() => setTab("pricing")}>
                  Next: Pricing & Variants
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Pricing & Variants Tab */}
          <TabsContent value="pricing" id="pricing-tab">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Variants</CardTitle>
                <CardDescription>
                  Set up product variants and their prices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Variants & Prices*</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariant}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Variant</span>
                    </Button>
                  </div>

                  {variantFields.map((field, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`variant-${index}`}>Variant Name</Label>
                        <Input
                          id={`variant-${index}`}
                          placeholder="e.g., 450g, 1kg"
                          value={field.display}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "display",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`variant-${index}`}>
                          Weight Value (kgs)
                        </Label>
                        <Input
                          id={`variant-${index}`}
                          placeholder="0.45, 1.0"
                          value={field.value || ""}
                          type="number"
                          step={0.1}
                          onChange={(e) =>
                            handleVariantChange(index, "value", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`price-${index}`}>
                          Selling Price (₹)
                        </Label>
                        <Input
                          id={`price-${index}`}
                          placeholder="e.g., 199"
                          value={priceFields[index] || ""}
                          type="number"
                          onChange={(e) =>
                            handleArrayFieldChange(
                              index,
                              e.target.value,
                              priceFields,
                              setPriceFields,
                              "price"
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`cutoff-price-${index}`}>MRP (₹)</Label>
                        <Input
                          id={`cutoff-price-${index}`}
                          placeholder="e.g., 249"
                          value={cutoffPriceFields[index] || ""}
                          type="number"
                          onChange={(e) =>
                            handleArrayFieldChange(
                              index,
                              e.target.value,
                              cutoffPriceFields,
                              setCutoffPriceFields,
                              "cutoffPrice"
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`dimension-length-${index}`}>
                          Length (Inch)
                        </Label>
                        <Input
                          id={`dimension-${index}`}
                          placeholder="12"
                          value={dimensionFields[index].length || ""}
                          type="number"
                          onChange={(e) =>
                            handleDimensionFieldChange(
                              index,
                              e.target.value,
                              dimensionFields,
                              setDimensionFields,
                              "dimensions",
                              "length"
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`dimension-breadth-${index}`}>
                          Breadth (Inch)
                        </Label>
                        <Input
                          id={`dimension-${index}`}
                          placeholder="8"
                          value={dimensionFields[index].breadth || ""}
                          type="number"
                          onChange={(e) =>
                            handleDimensionFieldChange(
                              index,
                              e.target.value,
                              dimensionFields,
                              setDimensionFields,
                              "dimensions",
                              "breadth"
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`dimension-height-${index}`}>
                          Height (Inch)
                        </Label>
                        <Input
                          id={`dimension-${index}`}
                          placeholder="2"
                          value={dimensionFields[index].height || ""}
                          type="number"
                          onChange={(e) =>
                            handleDimensionFieldChange(
                              index,
                              e.target.value,
                              dimensionFields,
                              setDimensionFields,
                              "dimensions",
                              "height"
                            )
                          }
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                          disabled={variantFields.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {form.formState.errors.variants && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.variants.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setTab("basic")}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setTab("details")}>
                  Next: Product Details
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" id="details-tab">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Provide additional information about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Benefits*</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addField(benefitFields, setBenefitFields, "benefits")
                      }
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Benefit</span>
                    </Button>
                  </div>

                  {benefitFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., High in protein"
                        value={benefitFields[index] || ""}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            index,
                            e.target.value,
                            benefitFields,
                            setBenefitFields,
                            "benefits"
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeField(
                            index,
                            benefitFields,
                            setBenefitFields,
                            "benefits"
                          )
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Ingredients*</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addField(
                          ingredientFields,
                          setIngredientFields,
                          "ingredients"
                        )
                      }
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Ingredient</span>
                    </Button>
                  </div>

                  {ingredientFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Organic Bajra"
                        value={field}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            index,
                            e.target.value,
                            ingredientFields,
                            setIngredientFields,
                            "ingredients"
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeField(
                            index,
                            ingredientFields,
                            setIngredientFields,
                            "ingredients"
                          )
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Usage Instructions*</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        addField(
                          instructionFields,
                          setInstructionFields,
                          "instructions"
                        )
                      }
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Instruction</span>
                    </Button>
                  </div>

                  {instructionFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="e.g., Soak overnight before cooking"
                        value={field}
                        onChange={(e) =>
                          handleArrayFieldChange(
                            index,
                            e.target.value,
                            instructionFields,
                            setInstructionFields,
                            "instructions"
                          )
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeField(
                            index,
                            instructionFields,
                            setInstructionFields,
                            "instructions"
                          )
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage">Storage Information*</Label>
                  <Textarea
                    id="storage"
                    placeholder="e.g., Store in a cool, dry place away from direct sunlight"
                    rows={3}
                    {...form.register("storage")}
                  />
                  {form.formState.errors.storage && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.storage.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setTab("pricing")}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setTab("images")}>
                  Next: Images
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" id="images-tab">
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Add images for your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Product Images</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageUrls([...imageUrls, ""]);
                        form.setValue("images", [
                          ...form.getValues("images"),
                          "",
                        ]);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Image URL</span>
                    </Button>
                  </div>

                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border p-4 rounded-md"
                    >
                      <div className="space-y-2 md:col-span-3">
                        <Label htmlFor={`image-${index}`}>
                          Image URL {index + 1}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id={`image-${index}`}
                            placeholder="https://example.com/image.jpg"
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...imageUrls];
                              newUrls[index] = e.target.value;
                              setImageUrls(newUrls);

                              const formImages = [...form.getValues("images")];
                              formImages[index] = e.target.value;
                              form.setValue("images", formImages);
                            }}
                          />

                          {/* Upload Button */}
                          <Input
                            type="file"
                            accept="image/*"
                            id={`upload-${index}`}
                            className=""
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              try {
                                const uploadedUrl = await uploadToS3(file);
                                const newUrls = [...imageUrls];
                                newUrls[index] = uploadedUrl;
                                setImageUrls(newUrls);

                                const formImages = [
                                  ...form.getValues("images"),
                                ];
                                formImages[index] = uploadedUrl;
                                form.setValue("images", formImages);
                              } catch (err) {
                                console.error("Upload failed", err);
                                alert("Image upload failed");
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {url ? (
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            <Image
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="h-full w-full object-cover"
                              width={100}
                              height={100}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/100x100?text=Error";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (imageUrls.length > 1) {
                              const newUrls = [...imageUrls];
                              newUrls.splice(index, 1);
                              setImageUrls(newUrls);

                              const formImages = [...form.getValues("images")];
                              formImages.splice(index, 1);
                              form.setValue("images", formImages);
                            }
                          }}
                          disabled={imageUrls.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setTab("details")}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Editing..." : "Edit Product"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
