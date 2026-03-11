import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useOffers } from "@/hooks/api";
import { Offer } from "@shared/api";
import { EmptyOffers, EmptySearch } from "@/components/EmptyState";
import { OfferGridSkeletonCards } from "@/components/OfferCardSkeleton";
import { OfferCard } from "@/components/OfferCard";

export default function Take() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data: offers = [], isLoading: loading } = useOffers(q);

  // Deduplicate offers (React Query handles caching, but API might return dupes)
  const deduplicatedOffers = useMemo(() => {
    const seen = new Set<string>();
    const result: Offer[] = [];
    for (let i = offers.length - 1; i >= 0; i--) {
      const offer = offers[i];
      if (seen.has(offer.id)) continue;
      seen.add(offer.id);
      result.unshift(offer);
    }
    return result;
  }, [offers]);

  return (
    <div className="min-h-screen bg-[hsl(217,33%,9%)] text-white">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6">
        <h1 className="text-3xl font-bold">Take</h1>
        <p className="mt-2 text-white/70">
          Browse and accept offers. Escrow-backed payments ensure risk‑free
          collaboration.
        </p>

        <div className="mt-6">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search offers"
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="mt-4 mb-16">
          {loading && <OfferGridSkeletonCards />}

          {!loading && deduplicatedOffers.length === 0 && q && (
            <EmptySearch query={q} />
          )}

          {!loading && deduplicatedOffers.length === 0 && !q && (
            <EmptyOffers onCreateOffer={() => navigate("/offer/new")} />
          )}

          {!loading && deduplicatedOffers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {deduplicatedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  creatorName="Freelancer"
                  onClick={() =>
                    navigate(`/offer/${offer.id}`, { state: { offer } })
                  }
                />
              ))}
            </div>
          )}
        </div>

        <div className="h-32"></div>
      </div>
    </div>
  );
}
