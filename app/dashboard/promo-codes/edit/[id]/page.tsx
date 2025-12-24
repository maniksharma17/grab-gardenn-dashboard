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
  /*                              FETCH PRODUCTS                                */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?limit=300`)
      .then((res) => setAllProducts(res.data.products || []))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load products",
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

        // Map eligible product IDs → full objects
        if (promo.eligibleProducts?.length && allProducts.length) {
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
  /*                             MODE SWITCH RESET                               */
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
  /*                                 HANDLERS                                   */
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
        title: "Validation error",
        description: "Select at least one eligible product for bundle promo",
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

            <Label>Promo Type</Label>
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

            {/* Remaining UI unchanged logic-wise */}

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
