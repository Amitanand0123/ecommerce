'use client';
import Link from 'next/link';
import { Search, ShoppingCart, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="w-full">
      {/* Top Section - Help, Orders & Returns, User Info */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center py-2 text-sm space-x-4 sm:space-x-6">
            <Link href="#" className="hover:text-gray-700 text-xs sm:text-sm">Help</Link>
            <Link href="#" className="hover:text-gray-700 text-xs sm:text-sm whitespace-nowrap">Orders & Returns</Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hover:bg-transparent p-0 h-auto text-xs sm:text-sm">
                    <span className="whitespace-nowrap">Hi, {user.name.split(' ')[0]}</span>
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
      <div className="bg-white border-b w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <Link href="/" className="text-lg sm:text-xl lg:text-2xl font-bold flex-shrink-0">
              ECOMMERCE
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm flex-1 justify-center">
              <Link href="#" className="hover:text-gray-700 whitespace-nowrap">Categories</Link>
              <Link href="#" className="hover:text-gray-700 whitespace-nowrap">Sale</Link>
              <Link href="#" className="hover:text-gray-700 whitespace-nowrap">Clearance</Link>
              <Link href="#" className="hover:text-gray-700 whitespace-nowrap">New stock</Link>
              <Link href="#" className="hover:text-gray-700 whitespace-nowrap">Trending</Link>
            </nav>
            
            <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
              <Search size={18} className="text-gray-600 cursor-pointer hover:text-gray-800 sm:w-5 sm:h-5" />
              <ShoppingCart size={18} className="text-gray-600 cursor-pointer hover:text-gray-800 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gray-100 text-center py-2 text-xs sm:text-sm w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <ChevronLeft size={14} className="text-gray-600 sm:w-4 sm:h-4" />
            <span className="mx-2 whitespace-nowrap">Get 10% off on business sign up</span>
            <ChevronRight size={14} className="text-gray-600 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}