import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizeMap = {
    sm: "py-6",
    md: "py-12",
    lg: "py-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeMap[size],
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-white/40 flex justify-center">{icon}</div>
      )}

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

      <p className="text-sm text-white/60 max-w-md mb-6">{description}</p>

      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Pre-built empty states
import {
  Package,
  MessageSquare,
  Search,
  Inbox,
  Zap,
} from "lucide-react";

interface EmptyOfferProps {
  onCreateOffer?: () => void;
}

export function EmptyOffers({ onCreateOffer }: EmptyOfferProps) {
  return (
    <EmptyState
      icon={<Package size={48} />}
      title="No offers yet"
      description="Create your first offer and start collaborating with freelancers"
      actionLabel={onCreateOffer ? "Create Offer" : undefined}
      onAction={onCreateOffer}
      size="lg"
    />
  );
}

interface EmptyApplicationsProps {
  onBrowseOffers?: () => void;
}

export function EmptyApplications({
  onBrowseOffers,
}: EmptyApplicationsProps) {
  return (
    <EmptyState
      icon={<Zap size={48} />}
      title="No applications yet"
      description="Apply to offers and showcase your skills to potential employers"
      actionLabel={onBrowseOffers ? "Browse Offers" : undefined}
      onAction={onBrowseOffers}
      size="lg"
    />
  );
}

interface EmptyMessagesProps {
  onBrowseOffers?: () => void;
}

export function EmptyMessages({ onBrowseOffers }: EmptyMessagesProps) {
  return (
    <EmptyState
      icon={<MessageSquare size={48} />}
      title="No conversations yet"
      description="When you create or receive orders, conversations will appear here"
      actionLabel={onBrowseOffers ? "Browse Offers" : undefined}
      onAction={onBrowseOffers}
      size="lg"
    />
  );
}

interface EmptySearchProps {
  query: string;
}

export function EmptySearch({ query }: EmptySearchProps) {
  return (
    <EmptyState
      icon={<Search size={48} />}
      title="No results found"
      description={`We couldn't find any offers matching "${query}". Try different keywords or browse all offers.`}
      size="lg"
    />
  );
}

interface EmptyInboxProps {
  onBrowseOffers?: () => void;
}

export function EmptyInbox({ onBrowseOffers }: EmptyInboxProps) {
  return (
    <EmptyState
      icon={<Inbox size={48} />}
      title="Inbox is empty"
      description="Your notifications and messages will appear here"
      actionLabel={onBrowseOffers ? "Browse Offers" : undefined}
      onAction={onBrowseOffers}
      size="lg"
    />
  );
}
