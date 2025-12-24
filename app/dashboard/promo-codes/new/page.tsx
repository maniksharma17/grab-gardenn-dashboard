'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type PromoMode = 'PERCENT' | 'FLAT' | 'BUNDLE';

export default function NewPromoCodePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    code: '',
    description: '',
    promoMode: 'FLAT' as PromoMode,

    value: '',
    maxDiscount: '',

    bundleMinItems: '',
    bundlePrice: '',

    minimumOrder: '',
    expiryDate: '',
    maxUses: '',
    oneTimeUsePerUser: false,
    active: true
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        code: form.code.toUpperCase(),
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

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code`,
        payload
      );

      toast({
        title: 'Promo code created',
        description: 'Promo code has been created successfully.'
      });

      router.push('/dashboard/promo-codes');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to create promo code',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/promo-codes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h2 className="text-3xl font-bold">New Promo Code</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Promo Code</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Code */}
            <div className="grid gap-2">
              <Label>Code</Label>
              <Input
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="uppercase"
              />
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

            {/* Common Fields */}
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
                    setForm(p => ({ ...p, oneTimeUsePerUser: checked }))
                  }
                />
                <Label>One-time per user</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.active}
                  onCheckedChange={checked =>
                    setForm(p => ({ ...p, active: checked }))
                  }
                />
                <Label>Active</Label>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Promo Code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
