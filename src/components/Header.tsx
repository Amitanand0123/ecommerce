'use client';
import Link from 'next/link';
import { Search, ShoppingCart, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 md:px-0">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            ECOMMERCE
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link href="#" className="hover:text-gray-700">Categories</Link>
            <Link href="#" className="hover:text-gray-700">Sale</Link>
            <Link href="#" className="hover:text-gray-700">Clearance</Link>
            <Link href="#" className="hover:text-gray-700">New stock</Link>
            <Link href="#" className="hover:text-gray-700">Trending</Link>
          </nav>
          <div className="flex items-center space-x-4 text-sm">
            <Link href="#" className="hover:text-gray-700 hidden md:block">Help</Link>
            <Link href="#" className="hover:text-gray-700 hidden md:block">Orders & Returns</Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-transparent">
                    <span className="hidden md:block">Hi, {user.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              !isLoading && <Link href="/login" className="hover:text-gray-700">Login</Link>
            )}
            <Search size={20} className="text-gray-600 cursor-pointer" />
            <ShoppingCart size={20} className="text-gray-600 cursor-pointer" />
          </div>
        </div>
      </div>
      <div className="bg-gray-100 text-center py-2 text-sm">
        <div className="container mx-auto flex items-center justify-center">
          <ChevronLeft size={16} className="text-gray-600" />
          <span className="mx-2">Get 10% off on business sign up</span>
          <ChevronRight size={16} className="text-gray-600" />
        </div>
      </div>
    </header>
  );
}