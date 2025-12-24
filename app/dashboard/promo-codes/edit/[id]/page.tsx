"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { ArrowLeft, Trash } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type PromoMode = "FLAT" | "PERCENT" | "BUNDLE";

type ProductType = {
  _id: string;
  name: string;
  images?: string[];
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function EditPromoCodePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);

  const [form, setForm] = useState({
    code: "",
    description: "",
    promoMode: "FLAT" as PromoMode,

    value: "",
    maxDiscount: "",

    bundleMinItems: "",
    bundlePrice: "",

    minimumOrder: "",
    expiryDate: "",
    maxUses: "",
    oneTimeUsePerUser: false,
    active: true,
  });

  /* -------------------------------------------------------------------------- */
  /*                               FETCH PRODUCTS                               */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?limit=200`)
      .then((res) => setAllProducts(res.data.products || []))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        })
      );
  }, [toast]);

  /* -------------------------------------------------------------------------- */
  /*                               FETCH PROMO                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`
        );

        const promo = res.data[0];

        setForm({
          code: promo.code,
          description: promo.description || "",
          promoMode: promo.promoMode,

          value: promo.value || "",
          maxDiscount: promo.maxDiscount || "",

          bundleMinItems: promo.bundle?.minItems || "",
          bundlePrice: promo.bundle?.bundlePrice || "",

          minimumOrder: promo.minimumOrder || "",
          expiryDate: promo.expiryDate.split("T")[0],
          maxUses: promo.maxUses || "",
          oneTimeUsePerUser: promo.oneTimeUsePerUser || false,
          active: promo.active,
        });

        // Map eligible product IDs → full product objects
        if (promo.eligibleProducts?.length) {
          const mapped = allProducts.filter((p) =>
            promo.eligibleProducts.includes(p._id)
          );
          setSelectedProducts(mapped);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load promo code",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (allProducts.length) fetchPromo();
  }, [id, allProducts, toast]);

  /* -------------------------------------------------------------------------- */
  /*                              MODE CLEANUP                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (form.promoMode !== "BUNDLE") {
      setSelectedProducts([]);
      setForm((p) => ({
        ...p,
        bundleMinItems: "",
        bundlePrice: "",
      }));
    }

    if (form.promoMode === "FLAT") {
      setForm((p) => ({ ...p, maxDiscount: "" }));
    }
  }, [form.promoMode]);

  /* -------------------------------------------------------------------------- */
  /*                                  HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.promoMode === "BUNDLE" && selectedProducts.length === 0) {
      toast({
        title: "Select products",
        description: "Please select eligible products for bundle promo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        description: form.description,
        promoMode: form.promoMode,
        expiryDate: form.expiryDate,
        minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        oneTimeUsePerUser: form.oneTimeUsePerUser,
        active: form.active,
      };

      if (form.promoMode === "FLAT") {
        payload.value = Number(form.value);
      }

      if (form.promoMode === "PERCENT") {
        payload.value = Number(form.value);
        payload.maxDiscount = form.maxDiscount
          ? Number(form.maxDiscount)
          : undefined;
      }

      if (form.promoMode === "BUNDLE") {
        payload.bundle = {
          minItems: Number(form.bundleMinItems),
          bundlePrice: Number(form.bundlePrice),
        };
        payload.eligibleProducts = selectedProducts.map((p) => p._id);
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`,
        payload
      );

      toast({
        title: "Promo updated",
        description: "Promo code updated successfully",
      });

      router.push("/dashboard/promo-codes");
    } catch {
      toast({
        title: "Error",
        description: "Failed to update promo code",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/promo-codes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">Edit Promo Code</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Promo Code</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Code (read-only) */}
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input value={form.code} disabled className="uppercase" />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {/* Promo Mode */}
            <div className="grid gap-2">
              <Label>Promo Type</Label>
              <select
                name="promoMode"
                value={form.promoMode}
                onChange={handleChange}
                className="border rounded-md p-2"
              >
                <option value="FLAT">Flat Discount (₹)</option>
                <option value="PERCENT">Percentage Discount (%)</option>
                <option value="BUNDLE">Bundle Pricing</option>
              </select>
            </div>

            {/* Conditional fields – IDENTICAL to create page */}
            {form.promoMode === "PERCENT" && (
              <>
                <Input
                  name="value"
                  type="number"
                  placeholder="Discount Percentage"
                  value={form.value}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="maxDiscount"
                  type="number"
                  placeholder="Max Discount (₹)"
                  value={form.maxDiscount}
                  onChange={handleChange}
                />
              </>
            )}

            {form.promoMode === "FLAT" && (
              <Input
                name="value"
                type="number"
                placeholder="Flat Discount Amount (₹)"
                value={form.value}
                onChange={handleChange}
                required
              />
            )}

            {form.promoMode === "BUNDLE" && (
              <>
                <Input
                  name="bundleMinItems"
                  type="number"
                  placeholder="Exact number of items"
                  value={form.bundleMinItems}
                  onChange={handleChange}
                  required
                />
                <Input
                  name="bundlePrice"
                  type="number"
                  placeholder="Bundle Price (₹)"
                  value={form.bundlePrice}
                  onChange={handleChange}
                  required
                />

                {/* Eligible Products */}
                <div className="space-y-2">
                  <Label>Eligible Products</Label>

                  <select
                    className="border rounded-md p-2 w-full"
                    onChange={(e) => {
                      const product = allProducts.find(
                        (p) => p._id === e.target.value
                      );
                      if (
                        product &&
                        !selectedProducts.some(
                          (p) => p._id === product._id
                        )
                      ) {
                        setSelectedProducts([...selectedProducts, product]);
                      }
                    }}
                  >
                    <option value="">Select product</option>
                    {allProducts.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>

                  {selectedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between border p-2 rounded-md"
                    >
                      <span className="text-sm">{product.name}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setSelectedProducts((prev) =>
                            prev.filter(
                              (p) => p._id !== product._id
                            )
                          )
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Common fields */}
            <Input
              name="minimumOrder"
              type="number"
              placeholder="Minimum Order Amount (₹)"
              value={form.minimumOrder}
              onChange={handleChange}
            />

            <Input
              name="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange}
              required
            />

            <Input
              name="maxUses"
              type="number"
              placeholder="Maximum Uses (optional)"
              value={form.maxUses}
              onChange={handleChange}
            />

            {/* Toggles */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.oneTimeUsePerUser}
                  onCheckedChange={(checked) =>
                    setForm((p) => ({
                      ...p,
                      oneTimeUsePerUser: checked,
                    }))
                  }
                />
                <Label>One-time per user</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) =>
                    setForm((p) => ({ ...p, active: checked }))
                  }
                />
                <Label>Active</Label>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
