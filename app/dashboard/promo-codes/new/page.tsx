'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';

export default function NewPromoCodePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'flat',
    value: '',
    minimumOrder: '',
    expiryDate: '',
    maxUses: '',
    oneTimeUsePerUser: false,
    active: true,
  });

  console.log("form data:", form);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code`, {
        ...form,
        value: parseFloat(form.value),
        minimumOrder: parseFloat(form.minimumOrder),
        maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
      });

      toast({
        title: 'Promo code created',
        description: 'Your new promo code has been saved successfully.',
      });

      router.push('/dashboard/promo-codes');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to create promo code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/promo-codes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">New Promo Code</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Promo Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                className="uppercase"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code">Short Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                className=""
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Discount Type</Label>
              <select
                name="type"
                id="type"
                value={form.type}
                onChange={handleChange}
                className="border rounded-md p-2"
              >
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">Discount Value</Label>
              <Input
                type="number"
                id="value"
                name="value"
                value={form.value}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minimumOrder">Minimum Order Amount</Label>
              <Input
                type="number"
                id="minimumOrder"
                name="minimumOrder"
                value={form.minimumOrder}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxUses">Maximum Uses (optional)</Label>
              <Input
                type="number"
                id="maxUses"
                name="maxUses"
                value={form.maxUses}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="oneTimeUsePerUser"
                  name="oneTimeUsePerUser"
                  checked={form.oneTimeUsePerUser}
                  onCheckedChange={(checked) =>
                    setForm(prev => ({ ...prev, oneTimeUsePerUser: checked }))
                  }
                />
                <Label htmlFor="oneTimeUsePerUser">One-time use per user</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  name="active"
                  checked={form.active}
                  onCheckedChange={(checked) =>
                    setForm(prev => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="active">Active</Label>
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
