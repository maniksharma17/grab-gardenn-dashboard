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
  CardFooter,
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
  images: string[];
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function EditPromoCodePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<any>({
    code: "",
    description: "",
    promoMode: "FLAT",

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
    const fetchProducts = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?limit=200`
      );
      setAllProducts(res.data.products || []);
    };
    fetchProducts();
  }, []);

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

        setSelectedProducts(promo.eligibleProducts || []);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load promo code",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPromo();
  }, [id, toast]);

  /* -------------------------------------------------------------------------- */
  /*                                  HANDLERS                                  */
  /* -------------------------------------------------------------------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        description: form.description,
        promoMode: form.promoMode,
        expiryDate: form.expiryDate,
        minimumOrder: Number(form.minimumOrder) || 0,
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
    } catch (err) {
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
          <CardTitle>{form.code}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <Textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <select
              name="promoMode"
              value={form.promoMode}
              onChange={handleChange}
              className="border rounded-md p-2"
            >
              <option value="FLAT">Flat</option>
              <option value="PERCENT">Percent</option>
              <option value="BUNDLE">Bundle</option>
            </select>

            {form.promoMode !== "BUNDLE" && (
              <Input
                name="value"
                type="number"
                placeholder="Discount Value"
                value={form.value}
                onChange={handleChange}
              />
            )}

            {form.promoMode === "PERCENT" && (
              <Input
                name="maxDiscount"
                type="number"
                placeholder="Max Discount (₹)"
                value={form.maxDiscount}
                onChange={handleChange}
              />
            )}

            {form.promoMode === "BUNDLE" && (
              <>
                <Input
                  name="bundleMinItems"
                  type="number"
                  placeholder="Exact items required"
                  value={form.bundleMinItems}
                  onChange={handleChange}
                />
                <Input
                  name="bundlePrice"
                  type="number"
                  placeholder="Bundle price"
                  value={form.bundlePrice}
                  onChange={handleChange}
                />

                {/* Product Selector */}
                <select
                  className="border rounded-md p-2"
                  onChange={(e) => {
                    const product = allProducts.find(
                      (p) => p._id === e.target.value
                    );
                    if (
                      product &&
                      !selectedProducts.some((p) => p._id === product._id)
                    ) {
                      setSelectedProducts([...selectedProducts, product]);
                    }
                  }}
                >
                  <option value="">Add eligible product</option>
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {selectedProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between border p-2 rounded"
                  >
                    <span>{p.name}</span>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        setSelectedProducts((prev) =>
                          prev.filter((x) => x._id !== p._id)
                        )
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </>
            )}

            <CardFooter className="p-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
