'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type PromoMode = 'PERCENT' | 'FLAT' | 'BUNDLE';

interface PromoFormState {
  code: string;
  description: string;
  promoMode: PromoMode;

  value: string;
  maxDiscount: string;

  bundleMinItems: string;
  bundlePrice: string;

  minimumOrder: string;
  expiryDate: string;
  maxUses: string;

  oneTimeUsePerUser: boolean;
  active: boolean;
}

export default function EditPromoCodePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<PromoFormState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                               FETCH PROMO                                  */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!id) return;

    const fetchPromo = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`
        );

        const promo = res.data;

        setForm({
          code: promo.code,
          description: promo.description || '',
          promoMode: promo.promoMode,

          value: promo.value?.toString() || '',
          maxDiscount: promo.maxDiscount?.toString() || '',

          bundleMinItems: promo.bundle?.minItems?.toString() || '',
          bundlePrice: promo.bundle?.bundlePrice?.toString() || '',

          minimumOrder: promo.minimumOrder?.toString() || '',
          expiryDate: promo.expiryDate.split('T')[0],
          maxUses: promo.maxUses?.toString() || '',

          oneTimeUsePerUser: promo.oneTimeUsePerUser || false,
          active: promo.active
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'Failed to load promo code',
          variant: 'destructive'
        });
      }
    };

    fetchPromo();
  }, [id, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => (prev ? { ...prev, [name]: value } : prev));
  };

  /* -------------------------------------------------------------------------- */
  /*                                 SUBMIT                                     */
  /* -------------------------------------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setIsSubmitting(true);

    try {
      const payload: any = {
        description: form.description,
        promoMode: form.promoMode,
        expiryDate: form.expiryDate,
        minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        oneTimeUsePerUser: form.oneTimeUsePerUser,
        active: form.active
      };

      if (form.promoMode === 'PERCENT') {
        payload.value = Number(form.value);
        payload.maxDiscount = form.maxDiscount
          ? Number(form.maxDiscount)
          : undefined;
      }

      if (form.promoMode === 'FLAT') {
        payload.value = Number(form.value);
      }

      if (form.promoMode === 'BUNDLE') {
        payload.bundle = {
          minItems: Number(form.bundleMinItems),
          bundlePrice: Number(form.bundlePrice)
        };
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`,
        payload
      );

      toast({
        title: 'Promo updated',
        description: 'Promo code updated successfully'
      });

      router.push('/dashboard/promo-codes');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update promo code',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form) {
    return <div className="p-8">Loading promo code...</div>;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UI                                       */
  /* -------------------------------------------------------------------------- */

  return (
    <Card className="max-w-2xl mx-auto mt-8">
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

          {/* Conditional Fields */}
          {form.promoMode === 'PERCENT' && (
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

          {form.promoMode === 'FLAT' && (
            <Input
              name="value"
              type="number"
              placeholder="Flat Discount Amount (₹)"
              value={form.value}
              onChange={handleChange}
              required
            />
          )}

          {form.promoMode === 'BUNDLE' && (
            <>
              <Input
                name="bundleMinItems"
                type="number"
                placeholder="Minimum Items"
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
            </>
          )}

          {/* Common */}
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
                onCheckedChange={checked =>
                  setForm(p => ({ ...p!, oneTimeUsePerUser: checked }))
                }
              />
              <Label>One-time per user</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.active}
                onCheckedChange={checked =>
                  setForm(p => ({ ...p!, active: checked }))
                }
              />
              <Label>Active</Label>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
