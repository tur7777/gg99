import { useEffect, useState } from "react";
import WalletGate from "@/components/WalletGate";
import { useWalletAddress } from "@/hooks/useTon";
import { apiUrl } from "@/lib/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  title: string;
  status: string;
  makerAddress: string;
  takerAddress?: string | null;
  createdAt: string;
  offerId?: string;
  priceTON?: number;
}

interface Offer {
  id: string;
  title: string;
  budgetTON: number;
  description?: string;
  status: string;
  creatorId?: string;
  createdAt: string;
}

interface Application {
  id: string;
  offerId: string;
  freelancerAddress: string;
  status: string;
  createdAt: string;
  offer?: Offer;
}

interface Candidate {
  id: string;
  freelancerAddress: string;
  status: string;
  createdAt: string;
}

export default function Profile() {
  const address = useWalletAddress();
  const [ordersAsExecutor, setOrdersAsExecutor] = useState<Order[]>([]);
  const [ordersAsClient, setOrdersAsClient] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOfferForCandidates, setSelectedOfferForCandidates] = useState<
    Offer | null
  >(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectingExecutor, setSelectingExecutor] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!address) return;
    let mounted = true;

    async function loadOrders() {
      try {
        setLoading(true);
        const r = await fetch(
          apiUrl(`/api/orders?address=${encodeURIComponent(address)}&role=any`),
        );
        if (!mounted) return;
        const data = await r.json();
        const orders = data.items || [];

        const asExecutor = orders.filter(
          (o: Order) => o.takerAddress === address,
        );
        const asClient = orders.filter(
          (o: Order) => o.makerAddress === address,
        );

        setOrdersAsExecutor(asExecutor);
        setOrdersAsClient(asClient);
      } catch (e) {
        console.error("Error loading orders:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [address]);

  const loadCandidates = async (offerId: string) => {
    try {
      setLoadingCandidates(true);
      const r = await fetch(
        apiUrl(`/api/applications/offer/${encodeURIComponent(offerId)}`),
      );
      if (r.ok) {
        const data = await r.json();
        setCandidates(
          data.applications || []
        );
      }
    } catch (e) {
      console.error("Error loading candidates:", e);
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleShowCandidates = async (offer: Offer) => {
    setSelectedOfferForCandidates(offer);
    await loadCandidates(offer.id);
  };

  const handleSelectExecutor = async (candidateAddress: string) => {
    if (!selectedOfferForCandidates) return;

    try {
      setSelectingExecutor(candidateAddress);
      const r = await fetch(apiUrl("/api/applications/select"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: selectedOfferForCandidates.id,
          freelancerAddress: candidateAddress,
        }),
      });

      if (!r.ok) {
        throw new Error("Failed to select executor");
      }

      toast({
        title: "Success",
        description: "Executor selected! Order created.",
      });

      setSelectedOfferForCandidates(null);
      setCandidates([]);

      const refreshR = await fetch(
        apiUrl(`/api/orders?address=${encodeURIComponent(address)}&role=any`),
      );
      const refreshData = await refreshR.json();
      const orders = refreshData.items || [];
      const asClient = orders.filter(
        (o: Order) => o.makerAddress === address,
      );
      setOrdersAsClient(asClient);
    } catch (e) {
      console.error("Error selecting executor:", e);
      toast({
        title: "Error",
        description: "Failed to select executor",
        variant: "destructive",
      });
    } finally {
      setSelectingExecutor(null);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-[hsl(217,33%,9%)] text-white">
      <div className="mx-auto w-full max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-bold">Profile</h1>
        <WalletGate>
          <p className="mt-2 text-white/70">
            Manage your identity, skills, and past work. Connect a TON wallet to
            get paid.
          </p>

          <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <div>
              <div className="text-xs text-white/60">
                Wallet Address (friendly)
              </div>
              <div className="font-mono break-all text-sm">
                {address || "Not connected"}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60">Nickname</div>
              <div className="font-mono break-all text-sm">
                {address || "Not connected"}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Orders as Executor</h2>
            {loading && <div className="text-white/70">Loading...</div>}
            {!loading && ordersAsExecutor.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/70">
                No orders yet. Browse offers and click "I'm ready" to apply!
              </div>
            )}
            {!loading && ordersAsExecutor.length > 0 && (
              <div className="space-y-3">
                {ordersAsExecutor.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <Link
                      to={`/chat/${order.id}`}
                      className="block hover:underline"
                    >
                      <div className="font-medium text-primary">
                        {order.title}
                      </div>
                    </Link>
                    <div className="mt-1 text-xs text-white/60">
                      {order.priceTON} TON • {order.status}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Orders as Client</h2>
            {loading && <div className="text-white/70">Loading...</div>}
            {!loading && ordersAsClient.length === 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/70">
                No orders yet. Create an offer to start hiring!
              </div>
            )}
            {!loading && ordersAsClient.length > 0 && (
              <div className="space-y-3">
                {ordersAsClient.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <Link
                      to={`/chat/${order.id}`}
                      className="block hover:underline"
                    >
                      <div className="font-medium text-primary">
                        {order.title}
                      </div>
                    </Link>
                    <div className="mt-1 text-xs text-white/60">
                      {order.priceTON} TON • {order.status}
                    </div>
                    <div className="mt-1 text-xs text-white/50">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    {order.offerId && order.status === "created" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 text-xs"
                        onClick={() => {
                          const offer: Offer = {
                            id: order.offerId!,
                            title: order.title,
                            budgetTON: order.priceTON || 0,
                            status: "open",
                            createdAt: order.createdAt,
                          };
                          handleShowCandidates(offer);
                        }}
                      >
                        Show all candidates
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </WalletGate>
      </div>

      {selectedOfferForCandidates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-[hsl(217,33%,9%)] p-6 text-white">
            <h3 className="text-xl font-bold">
              Candidates for "{selectedOfferForCandidates.title}"
            </h3>
            <p className="mt-2 text-sm text-white/60">
              {selectedOfferForCandidates.budgetTON} TON
            </p>

            {loadingCandidates && (
              <div className="mt-4 text-white/70">Loading candidates...</div>
            )}

            {!loadingCandidates && candidates.length === 0 && (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3 text-white/70">
                No applications yet.
              </div>
            )}

            {!loadingCandidates && candidates.length > 0 && (
              <div className="mt-4 space-y-2">
                {candidates
                  .filter((c) => c.status === "pending")
                  .map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-sm break-all">
                          {candidate.freelancerAddress}
                        </div>
                        <div className="mt-1 text-xs text-white/60">
                          Applied {new Date(candidate.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="ml-2 whitespace-nowrap bg-primary text-primary-foreground"
                        disabled={selectingExecutor === candidate.freelancerAddress}
                        onClick={() =>
                          handleSelectExecutor(candidate.freelancerAddress)
                        }
                      >
                        {selectingExecutor === candidate.freelancerAddress
                          ? "Selecting..."
                          : "Select"}
                      </Button>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedOfferForCandidates(null);
                  setCandidates([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
