import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCreateOffer } from "@/hooks/api";
import { useToast } from "@/hooks/use-toast";
import WalletGate from "@/components/WalletGate";
import { useIsWalletConnected, useWalletAddress } from "@/hooks/useTon";
import { useFormValidation } from "@/hooks/useFormValidation";
import { CreateOfferSchema } from "@shared/validators";
import { FieldError, FormError } from "@/components/FormError";

export default function CreateOffer() {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("1");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();
  const connected = useIsWalletConnected();
  const address = useWalletAddress();
  const { toast } = useToast();
  const createOfferMutation = useCreateOffer();
  const { errors, validate, clearError } = useFormValidation(CreateOfferSchema);

  useEffect(() => {
    if (connected && address) {
      fetch("/api/users/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      }).catch(console.error);
    }
  }, [connected, address]);

  async function submit() {
    if (!connected) {
      setSubmitError("Please connect your TON wallet");
      return;
    }

    // Validate form
    const validationResult = await validate({
      title,
      description,
      budgetTON: Number(budget),
      stack: stack ? stack.split(",").map((s) => s.trim()) : [],
      deadline,
    });

    if (!validationResult.valid) {
      setSubmitError("Please fix the validation errors");
      return;
    }

    setSubmitError(null);

    try {
      await createOfferMutation.mutateAsync(validationResult.data!);
      toast({
        title: "Offer created",
        description: "Your offer has been published successfully",
      });
      navigate("/take");
    } catch (e) {
      const errorMsg = (e as Error).message || "Failed to create offer";
      setSubmitError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    }
  }

  return (
    <div className="min-h-[calc(100dvh-160px)] bg-[hsl(217,33%,9%)] text-white">
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-6">
        <h1 className="text-3xl font-bold">Create a New Offer</h1>
        <WalletGate>
          <p className="mt-2 text-white/70">
            Define the title and budget in TON. Escrow and on-chain actions
            подключим позже.
          </p>

          <div className="mt-6 space-y-4">
            {submitError && <FormError message={submitError} />}

            <div>
              <label className="mb-2 block text-sm text-white/70">Title</label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
                placeholder="Landing page design"
                className="bg-white/5 text-white border-white/10"
              />
              <FieldError error={errors.title} />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  clearError("description");
                }}
                placeholder="Describe the scope, deliverables, and milestones"
                className="min-h-28 w-full rounded-md bg-white/5 text-white border border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <FieldError error={errors.description} />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Stack (comma-separated)
              </label>
              <Input
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                placeholder="e.g. React, Node.js, TON"
                className="bg-white/5 text-white border-white/10"
              />
              <div className="mt-1 text-xs text-white/50">
                Separate skills with commas
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Budget (TON)
              </label>
              <Input
                type="number"
                step="0.1"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  clearError("budgetTON");
                }}
                className="bg-white/5 text-white border-white/10"
              />
              <FieldError error={errors.budgetTON} />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Deadline (optional)
              </label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-white/5 text-white border-white/10"
              />
              <div className="mt-1 text-xs text-white/50">
                When the work should be completed
              </div>
            </div>

            <Button
              onClick={submit}
              disabled={createOfferMutation.isPending || !title || !description}
              className="bg-primary text-primary-foreground"
            >
              {createOfferMutation.isPending ? "Creating..." : "Create Offer"}
            </Button>

            <div className="text-xs text-white/50">
              All fields can be edited later.
            </div>
          </div>
        </WalletGate>
      </div>
    </div>
  );
}
