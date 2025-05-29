'use client';
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ICategory } from '@/server/db/models/Category';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function InterestsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const itemsPerPage = 6;

  const { data: categoriesData } = trpc.category.getCategories.useQuery({ page: currentPage, limit: itemsPerPage });

  const { data: userInterestsData, refetch: refetchUserInterests } = trpc.category.getUserInterests.useQuery(undefined, {
    onSuccess: (data) => {
      setSelectedInterests(new Set(data || []));
    },
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

  const categories = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;

  const renderPagination = () => {
    const buttons: JSX.Element[] = [];
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
          <CardDescription className="mt-2 text-black mt-4">We will keep you notified.</CardDescription>
          <hr className="w-full border-t border-gray-200" />
        </CardHeader>
        <CardContent className='ml-4'>
          <h3 className="text-xl font-semibold mb-4 pt-4">My saved interests!</h3>
          {categories.length === 0 && (
            <p>No categories found.</p>
          )}
          <div className="space-y-3 pb-6">
            {categories.map((category: ICategory) => (
              <div key={category._id.toString()} className="flex items-center space-x-3 mt-6 rounded hover:bg-gray-50">
                <Checkbox
                  id={category._id.toString()}
                  checked={selectedInterests.has(category._id.toString())}
                  onCheckedChange={() => handleCheckboxChange(category._id.toString())}
                  disabled={updateInterestsMutation.isPending}
                  className="cursor-pointer size-6"
                />
                <Label htmlFor={category._id.toString()} className="text-base cursor-pointer">
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
