import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LotteryBall } from "./LotteryBall";
import { LotteryHistoryResponse, formatCurrency, formatDate } from "@/lib/lottery-types";
import { LotteryInfo } from "@/lib/lotteries";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HistoryListProps {
  lottery: LotteryInfo;
  history: LotteryHistoryResponse | null;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function HistoryList({
  lottery,
  history,
  isLoading,
  currentPage,
  onPageChange,
}: HistoryListProps) {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Histórico de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!history || history.results.length === 0) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Histórico de Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Nenhum resultado encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { results, pagination } = history;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Histórico de Resultados
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {pagination.totalItems} resultados
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: Cards compactos */}
        {isMobile ? (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.contestNumber}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold">#{result.contestNumber}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatDate(result.date)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(result.estimatedPrize)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.numbers.slice(0, 10).map((num, index) => (
                    <LotteryBall
                      key={index}
                      number={num}
                      color={lottery.color}
                      size="sm"
                    />
                  ))}
                  {result.numbers.length > 10 && (
                    <span className="text-xs text-muted-foreground self-center ml-1">
                      +{result.numbers.length - 10}
                    </span>
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {result.prizes[0]?.winners > 0 
                    ? `${result.prizes[0].winners} ganhador(es)` 
                    : "Acumulou"}
                  {" • "}
                  {result.location.city} - {result.location.state}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop: Tabela com mais detalhes */
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Concurso</TableHead>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead>Números</TableHead>
                  <TableHead className="w-[150px]">Local</TableHead>
                  <TableHead className="w-[150px] text-right">Prêmio</TableHead>
                  <TableHead className="w-[120px] text-right">Ganhadores</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow 
                    key={result.contestNumber}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      #{result.contestNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(result.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {result.numbers.slice(0, 10).map((num, index) => (
                          <LotteryBall
                            key={index}
                            number={num}
                            color={lottery.color}
                            size="xs"
                          />
                        ))}
                        {result.numbers.length > 10 && (
                          <span className="text-xs text-muted-foreground self-center ml-1">
                            +{result.numbers.length - 10}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {result.location.city} - {result.location.state}
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(result.estimatedPrize)}
                    </TableCell>
                    <TableCell className="text-right">
                      {result.prizes[0]?.winners > 0 ? (
                        <span>{result.prizes[0].winners}</span>
                      ) : (
                        <span className="text-warning font-medium">Acumulou</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            {isMobile ? (
              /* Mobile: Simple prev/next buttons */
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : (
              /* Desktop: Full pagination */
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => onPageChange(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < pagination.totalPages && onPageChange(currentPage + 1)}
                      className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
