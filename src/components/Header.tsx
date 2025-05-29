'use client';
import Link from 'next/link';
import { Search, ShoppingCart, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header >
      {/* Top Section - Help, Orders & Returns, User Info */}
      <div className="bg-white border-b border-gray-200 mx-4">
        <div className="container mx-auto px-4 md:px-0">
          <div className="flex justify-end items-center py-2 text-sm space-x-6">
            <Link href="#" className="hover:text-gray-700">Help</Link>
            <Link href="#" className="hover:text-gray-700">Orders & Returns</Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-transparent p-0 h-auto">
                    <span>Hi, {user.name.split(' ')[0]}</span>
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
              null
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Section */}
      <div className="bg-white border-b mx-4">
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
            
            <div className="flex items-center space-x-4">
              <Search size={20} className="text-gray-600 cursor-pointer hover:text-gray-800" />
              <ShoppingCart size={20} className="text-gray-600 cursor-pointer hover:text-gray-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
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