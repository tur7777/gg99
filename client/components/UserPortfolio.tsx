import { Order } from "@shared/api";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserPortfolioProps {
  orders: Order[];
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function UserPortfolio({
  orders,
  isLoading,
  title = "Portfolio",
  emptyMessage = "No completed projects yet",
  className,
}: UserPortfolioProps) {
  const completedOrders = orders.filter((o) => o.status === "completed");

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-white/5 border border-white/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (completedOrders.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

      <div className="space-y-3">
        {completedOrders.map((order) => (
          <div
            key={order.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{order.title}</p>
                <div className="mt-2 text-xs text-white/60 space-y-1">
                  <p>
                    {order.priceTON} TON •{" "}
                    {new Date(order.completedAt || order.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    Status:{" "}
                    <StatusBadge
                      status={order.status as any}
                      className="ml-1"
                    />
                  </p>
                </div>
              </div>
              <Link
                to={`/chat?orderId=${order.id}`}
                className="text-xs px-3 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 whitespace-nowrap transition-colors"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "in_progress" | "completed" | "cancelled" | "created" | string;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles: Record<string, string> = {
    completed: "bg-green-500/20 text-green-300",
    in_progress: "bg-blue-500/20 text-blue-300",
    cancelled: "bg-red-500/20 text-red-300",
    created: "bg-yellow-500/20 text-yellow-300",
  };

  return (
    <Badge
      className={cn(statusStyles[status] || "bg-gray-500/20 text-gray-300", className)}
      variant="secondary"
    >
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
