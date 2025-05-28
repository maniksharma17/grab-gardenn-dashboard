"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import axios from "axios";
import Image from "next/image";

export interface Product {
  name: string;
  hindiName?: string;
  description: string;
  category: string;
  variants: {
    display: string;
    value: number;
  }[];
  price: number[];
  cutoffPrice: number[];
  benefits: string[];
  ingredients: string[];
  instructions: string[];
  storage: string;
  stock: number;
  dimensions: {
    length: number;
    breadth: number;
    height: number;
  }[];
  images: string[];
}


export interface Order {
  _id: string;
  user: string;
  items: {
    product: Product[];
    quantity: number;
    price: number;
    variant: {
      display: string;
      value: number;
    };
    dimensions: {
      length: number;
      breadth: number;
      height: number;
    };
  }[];
  total: number;
  type: "prepaid" | "cod";
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  cancellationReason?: string;
  shippingAddress: {
    street?: string;
    streetOptional?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    name?: string;
    phone?: string;
  };
  paymentId?: string;
  paymentOrderId?: string;
  shiprocketOrderId?: string;
  deliveryRate?: number;
  freeShipping?: boolean;
  promoCode?: string;
  promoCodeDiscount?: number;
  createdAt: string; // ISO string format (or Date if you're parsing it)
}

const STATUS_COLORS = {
  confirmed: "bg-blue-500",
  processing: "bg-yellow-500",
  shipped: "bg-indigo-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

const OrderDetailsPage = () => {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState<Order>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/dashboard/${orderId}`
        );
        setOrder(res.data.order);
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  const subtotal = order?.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = order?.promoCodeDiscount || 0;
  const deliveryRate = order?.freeShipping ? 0 : order?.deliveryRate || 0;
  const total = (subtotal ?? 0) - discount + deliveryRate;

  if (!order) {
    return <div className="p-6 text-red-500">Order not found.</div>;
  }

  return (
  <ScrollArea className="p-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Order Header */}
    <Card className="md:col-span-2 bg-primary/5 border-primary/10">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Order #{order._id}</h2>
          <Badge className={STATUS_COLORS[order.status] || "bg-gray-500"}>
            {order.status}
          </Badge>
        </div>
        {order.createdAt && (
          <p className="text-xs text-muted-foreground">
            Placed on {format(new Date(order.createdAt), "PPP")}
          </p>
        )}
      </CardContent>
    </Card>

    {/* Shipping Address */}
    <Card className="bg-secondary/5">
      <CardContent className="p-4 space-y-1 text-sm">
        <h3 className="text-base font-semibold mb-1">Shipping Address</h3>
        <p>{order.shippingAddress.name}</p>
        <p>
          {order.shippingAddress.street} {order.shippingAddress.streetOptional}
        </p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
        </p>
        <p>{order.shippingAddress.country}</p>
        <p>Phone: {order.shippingAddress.phone}</p>
      </CardContent>
    </Card>

    {/* Payment Info */}
    <Card className="bg-secondary/5">
      <CardContent className="p-4 space-y-1 text-sm">
        <h3 className="text-base font-semibold mb-1">Payment & Summary</h3>
        <p>
          Payment Type: <Badge className="mx-2">{order.type}</Badge>
        </p>
        <p>Payment ID: {order.paymentId || "—"}</p>
        <p>Payment Order ID: {order.paymentOrderId || "—"}</p>
        <p>Shiprocket Order ID: {order.shiprocketOrderId || "—"}</p>
        <p>Delivery Rate: ₹{order.deliveryRate?.toFixed(2)}</p>
        <p>Free Shipping: {order.freeShipping ? "Yes" : "No"}</p>
        <p>
          Promo Code: {order.promoCode || "—"} ({order.promoCodeDiscount || 0}%)
        </p>
        <p className="font-bold text-sm">Total: ₹{order.total}</p>
      </CardContent>
    </Card>

    {/* Order Summary */}
    <Card className="md:col-span-2">
      <CardContent className="p-4 space-y-3 text-sm">
        <h3 className="text-base font-semibold">Order Summary</h3>
        <Separator />
        <div>
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>₹{subtotal?.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1 text-red-500">
              <span>Promo Discount</span>
              <span>- ₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span>Delivery</span>
            <span>{order.freeShipping ? "Free" : `₹${deliveryRate.toFixed(2)}`}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Cancellation Reason */}
    {order.status === "cancelled" && order.cancellationReason && (
      <Card className="md:col-span-2 dark:bg-red-900 border-red-300 bg-red-50">
        <CardContent className="p-4">
          <h3 className="text-base dark:text-red-300 font-semibold text-red-600 mb-1">Cancellation Reason</h3>
          <p className="text-sm dark:text-white">{order.cancellationReason}</p>
        </CardContent>
      </Card>
    )}

    {/* Order Items */}
    <Card className="md:col-span-2">
      <CardContent className="p-4 space-y-3">
        <h3 className="text-base font-semibold">Order Items</h3>
        <Separator />
        {order.items.map((item, idx) => {
          const product = item.product as any;
          return (
            <div
              key={idx}
              className="py-3 border-b flex gap-4 items-start last:border-none"
            >
              <div className="w-20 h-20 relative flex-shrink-0 rounded-md overflow-hidden">
                <Image
                  src={product.images[0] || "/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-0.5 text-sm">
                <p className="font-medium text-base leading-tight">{product.name}</p>
                {product.hindiName && (
                  <p className="text-muted-foreground text-xs">{product.hindiName}</p>
                )}
                <p className="text-muted-foreground text-xs">{product.category}</p>
                <p>
                  <span className="font-medium">Quantity:</span> {item.quantity}
                </p>
                <p>
                  <span className="font-medium">Price:</span> ₹{item.price}
                </p>
                <p>
                  <span className="font-medium">Variant:</span> {item.variant.display} ({item.variant.value})
                </p>
                <p>
                  <span className="font-medium">Dimensions:</span> {item.dimensions.length} x {item.dimensions.breadth} x {item.dimensions.height} in
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </div>
</ScrollArea>

);

};

export default OrderDetailsPage;
