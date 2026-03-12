import { useUserStats } from "@/hooks/api";
import { RatingStars } from "./RatingStars";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Award, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAddress } from "@/lib/tonAddress";

interface UserProfileProps {
  address: string;
  name?: string;
  bio?: string;
  skills?: string[];
  className?: string;
}

export function UserProfile({
  address,
  name,
  bio,
  skills,
  className,
}: UserProfileProps) {
  const { data: stats, isLoading } = useUserStats(address);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-white/10 bg-white/5 p-6", className)}>
      {/* Header with avatar and basic info */}
      <div className="flex gap-4">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/50 flex-shrink-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {(name?.[0] || address[2])?.toUpperCase()}
          </span>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">
            {name || "Anonymous"}
          </h2>
          <div className="text-sm text-white/60 font-mono mt-1">
            {formatAddress(address)}
          </div>
          {bio && <p className="text-sm text-white/80 mt-2">{bio}</p>}
        </div>
      </div>

      {/* Rating section */}
      {stats && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
          <div>
            <div className="text-xs text-white/60 uppercase tracking-wide mb-2">
              Rating
            </div>
            <div className="flex items-center gap-4">
              <RatingStars
                rating={stats.averageRating}
                totalReviews={stats.totalReviews}
                size="md"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <StatCard
              icon={<Briefcase size={20} />}
              label="Completed"
              value={stats.completedOrders.toString()}
            />
            <StatCard
              icon={<Award size={20} />}
              label="Reviews"
              value={stats.totalReviews.toString()}
            />
            <StatCard
              icon={<MessageSquare size={20} />}
              label="Avg Rating"
              value={stats.averageRating.toFixed(1)}
            />
          </div>
        </div>
      )}

      {/* Skills section */}
      {skills && skills.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="text-xs text-white/60 uppercase tracking-wide mb-3">
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white/5 p-3 text-center">
      <div className="flex justify-center text-white/60 mb-2">{icon}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
