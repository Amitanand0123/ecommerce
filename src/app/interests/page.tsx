// src/app/interests/page.tsx
'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// ICategory is a Mongoose Document. We need a type for the plain object.
// import { ICategory } from '@/server/db/models/Category'; // Keep for reference if needed elsewhere
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// Define a type for the plain category object as returned by your tRPC endpoint
interface PlainCategory {
  _id: string; // Because you convert it to string in the backend
  name: string;
  // Add other properties if your tRPC endpoint returns them and you use them
  createdAt?: string; // Or Date, depending on serialization
  updatedAt?: string; // Or Date
}

export default function InterestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const itemsPerPage = 6;

  // categoriesData will implicitly get its type from the tRPC router definition
  const { data: categoriesData } = trpc.category.getCategories.useQuery({ page: currentPage, limit: itemsPerPage });

  const { data: userInterestsData, refetch: refetchUserInterests } = trpc.category.getUserInterests.useQuery(undefined, {
    retry: false
  });

  const updateInterestsMutation = trpc.category.updateUserInterests.useMutation({
    onSuccess: () => {
      refetchUserInterests();
    },
    onError: (error) => {
      console.error("Failed to update interests:", error);
      alert(`Error updating interests: ${error.message}`);
    }
  });

  useEffect(() => {
    if (userInterestsData) {
      setSelectedInterests(new Set(userInterestsData));
    }
  }, [userInterestsData]);

  const handleCheckboxChange = (categoryId: string) => {
    const newSet = new Set(selectedInterests);
    if (newSet.has(categoryId)) newSet.delete(categoryId);
    else newSet.add(categoryId);
    setSelectedInterests(newSet);
    updateInterestsMutation.mutate({ categoryIds: Array.from(newSet) });
  };

  // Explicitly type `categories` using the PlainCategory type
  const categories: PlainCategory[] = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;

  const renderPagination = () => {
    const buttons: React.ReactElement[] = [];
    // ... (rest of pagination logic remains the same)
    let startPage: number, endPage: number;

    if (currentPage <= 3) {
      startPage = 1;
      endPage = Math.min(3, totalPages);
    } else if (currentPage >= totalPages - 1) {
      startPage = Math.max(1, totalPages - 2);
      endPage = totalPages;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }

    if (totalPages > 1) {
      buttons.push(
        <Button key="first" variant="ghost" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>,
        <Button key="prev" variant="ghost" size="sm" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      );
    }

    if (startPage > 1) {
      buttons.push(
        <button key={1} className="px-2 py-1 text-gray-500" onClick={() => setCurrentPage(1)}>1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`px-2 py-1 ${i === currentPage ? 'text-black font-semibold' : 'text-gray-500'}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis" className="px-2">...</span>);
      }
      buttons.push(
        <button key={totalPages} className="px-2 py-1 text-gray-500" onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    if (totalPages > 1) {
      buttons.push(
        <Button key="next" variant="ghost" size="sm" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>,
        <Button key="last" variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      );
    }

    return <div className="flex items-center justify-center space-x-1 mt-6">{buttons}</div>;
  };


  return (
    <div className="flex justify-center items-start pt-10 min-h-screen">
      <Card className="w-full max-w-lg min-h-[550px]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mt-4">Please mark your interests!</CardTitle>
          <CardDescription className="text-black mt-4">We will keep you notified.</CardDescription>
          <hr className="w-full border-t border-gray-200" />
        </CardHeader>
        <CardContent className='ml-4'>
          <h3 className="text-xl font-semibold mb-4 pt-4">My saved interests!</h3>
          {categories.length === 0 && !categoriesData && (
            <p>Loading categories...</p>
          )}
          {/* Removed the 'npm run seed' part to avoid unescaped entities, as it was also an ESLint issue before */}
          {categoriesData && categories.length === 0 && (
            <p>No categories found.</p>
          )}
          <div className="space-y-3 pb-6">
            {/* Now the type of `category` in the map callback should correctly be `PlainCategory` */}
            {categories.map((category: PlainCategory) => (
              <div key={category._id} className="flex items-center space-x-3 mt-6 rounded hover:bg-gray-50">
                <Checkbox
                  id={category._id} // _id is already a string
                  checked={selectedInterests.has(category._id)}
                  onCheckedChange={() => handleCheckboxChange(category._id)}
                  disabled={updateInterestsMutation.isPending}
                  className="cursor-pointer size-6"
                />
                <Label htmlFor={category._id} className="text-base cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
          {totalPages > 1 && renderPagination()}
        </CardContent>
      </Card>
    </div>
  );
}