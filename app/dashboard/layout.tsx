"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Package,
  ShoppingCart,
  Tag,
  FileText,
  ArrowLeftRight,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { checkAuth, logoutAdmin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Authentication check
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = true;
      if (!isAuthenticated) {
        router.push("/auth/login");
      }
    };

    verifyAuth();
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    document.cookie = "isLoggedIn=; Max-Age=0; path=/";
    router.push("/auth/login");
  };

  const navItems = [
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/categories", label: "Categories", icon: Tag },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
    { href: "/dashboard/promo-codes", label: "Promo Codes", icon: Ticket },
    { href: "/dashboard/blogs", label: "Blogs", icon: FileText },
  ];

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-card">
        <div className="p-6 border-b">
          <Link href="/dashboard/products" className="flex items-center gap-2">
            <Image
              src={"/new-logo.png"}
              alt="GrabGardenn Logo"
              width={200}
              height={100}
            />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 my-1 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center px-4 md:px-6 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between py-4 border-b mb-4">
                    <Link
                      href="/dashboard/products"
                      className="flex items-center gap-2"
                    >
                      <Image
                        src={"/new-logo.png"}
                        alt="GrabGardenn Logo"
                        width={200}
                        height={100}
                      />
                    </Link>
                    
                  </div>
                  <nav className="flex-1">
                    {navItems.map((item) => {
                      const IconComponent = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-3 my-1 rounded-md transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="py-4 border-t mt-auto">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 ml-2"
            >
              <Image
              src={'/new-logo.png'}
              alt="GrabGardenn Logo"
              width={130}
              height={100}
            />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/avatar.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">
                  grabgardenn@gmail.com
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
