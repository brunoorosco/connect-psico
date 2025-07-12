import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
};

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageButtons = 3,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pageButtons = [];

  // Primeira página
  pageButtons.push(
    <Button
      key={1}
      variant={currentPage === 1 ? "default" : "ghost"}
      size="sm"
      onClick={() => onPageChange(1)}
      disabled={currentPage === 1}
    >
      1
    </Button>
  );

  const startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2));

  if (startPage > 2) {
    pageButtons.push(
      <span key="start-ellipsis" className="px-2 select-none text-muted-foreground">
        ...
      </span>
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    pageButtons.push(
      <Button
        key={i}
        variant={currentPage === i ? "default" : "ghost"}
        size="sm"
        onClick={() => onPageChange(i)}
        disabled={currentPage === i}
      >
        {i}
      </Button>
    );
  }

  if (endPage < totalPages - 1) {
    pageButtons.push(
      <span key="end-ellipsis" className="px-2 select-none text-muted-foreground">
        ...
      </span>
    );
  }

  if (totalPages > 1) {
    pageButtons.push(
      <Button
        key={totalPages}
        variant={currentPage === totalPages ? "default" : "ghost"}
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        {totalPages}
      </Button>
    );
  }

  return (
    <nav className="flex items-center justify-center space-x-1 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Primeira página"
      >
        <ChevronLeft className="h-4 w-4" />Primeira
      </Button>

      {pageButtons}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Última página"
      >
        Última<ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};

export default PaginationControls;
