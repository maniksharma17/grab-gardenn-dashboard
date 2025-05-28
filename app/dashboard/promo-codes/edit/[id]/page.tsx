'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';

interface PromoCodeFormData {
  code: string;
  description?: string;
  type: 'percent' | 'flat';
  value: number;
  minimumOrder: number;
  expiryDate: string;
  maxUses?: number;
  oneTimeUsePerUser?: boolean;
  active: boolean;
}

export default function EditPromoCodePage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PromoCodeFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPromoCode = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`);
        setFormData(response.data[0]);
      } catch (error) {
        console.error('Failed to fetch promo code:', error);
        toast({
          title: 'Error',
          description: 'Failed to load promo code details.',
          variant: 'destructive',
        });
      }
    };

    if (id) fetchPromoCode();
  }, [id, toast]);

  const handleChange = (field: keyof PromoCodeFormData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/promo-code/${id}`, formData);
      toast({
        title: 'Updated Successfully',
        description: 'Promo code updated successfully.',
      });
      router.push('/dashboard/promo-codes');
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update promo code.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Edit Promo Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label>Code</Label>
            <Input
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              required
              disabled
            />
          </div>

          <div className="grid gap-2">
              <Label htmlFor="code">Short Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
                className=""
              />
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Type</Label>
              <select
                className="w-full border rounded-md h-10 px-2"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => handleChange('value', Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Order</Label>
              <Input
                type="number"
                value={formData.minimumOrder}
                onChange={(e) => handleChange('minimumOrder', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Max Uses</Label>
              <Input
                type="number"
                value={formData.maxUses ?? ''}
                onChange={(e) => handleChange('maxUses', Number(e.target.value) || undefined)}
              />
            </div>
          </div>

          <div>
            <Label>Expiry Date</Label>
            <Input
              type="date"
              value={formData.expiryDate.split('T')[0]} // Only date part
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.oneTimeUsePerUser || false}
              onCheckedChange={(checked) => handleChange('oneTimeUsePerUser', checked)}
            />
            <Label>One-time use per user</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) => handleChange('active', checked)}
            />
            <Label>Active</Label>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
