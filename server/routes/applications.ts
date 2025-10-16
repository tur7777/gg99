import type { RequestHandler } from "express";
import { prisma } from "../lib/prisma";

export const applyToOffer: RequestHandler = async (req, res) => {
  try {
    const { offerId, freelancerAddress } = req.body;
    
    if (!offerId || !freelancerAddress) {
      return res.status(400).json({ error: "offerId and freelancerAddress required" });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: String(offerId) },
    });
    
    if (!offer) {
      return res.status(404).json({ error: "offer_not_found" });
    }

    const existing = await prisma.application.findUnique({
      where: {
        offerId_freelancerAddress: {
          offerId: String(offerId),
          freelancerAddress: String(freelancerAddress),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ error: "already_applied", application: existing });
    }

    const application = await prisma.application.create({
      data: {
        offerId: String(offerId),
        freelancerAddress: String(freelancerAddress),
        status: "pending",
      },
    });

    res.status(201).json({ application });
  } catch (e) {
    console.error("applyToOffer error:", e);
    res.status(500).json({ error: "internal_error" });
  }
};

export const getApplicationsByOffer: RequestHandler = async (req, res) => {
  try {
    const { offerId } = req.params;
    
    if (!offerId) {
      return res.status(400).json({ error: "offerId required" });
    }

    const applications = await prisma.application.findMany({
      where: { offerId: String(offerId) },
      orderBy: { createdAt: "desc" },
    });

    res.json({ applications });
  } catch (e) {
    console.error("getApplicationsByOffer error:", e);
    res.status(500).json({ error: "internal_error" });
  }
};

export const selectExecutor: RequestHandler = async (req, res) => {
  try {
    const { offerId, freelancerAddress } = req.body;
    
    if (!offerId || !freelancerAddress) {
      return res.status(400).json({ error: "offerId and freelancerAddress required" });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: String(offerId) },
      include: { creator: { select: { address: true } } },
    });
    
    if (!offer) {
      return res.status(404).json({ error: "offer_not_found" });
    }

    const makerAddress = offer.creator?.address || "";

    const application = await prisma.application.findUnique({
      where: {
        offerId_freelancerAddress: {
          offerId: String(offerId),
          freelancerAddress: String(freelancerAddress),
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: "application_not_found" });
    }

    await prisma.application.updateMany({
      where: { offerId: String(offerId) },
      data: { status: "rejected" },
    });

    const updatedApp = await prisma.application.update({
      where: { id: application.id },
      data: { status: "accepted" },
    });

    const order = await prisma.order.create({
      data: {
        title: offer.title,
        offerId: String(offerId),
        makerAddress,
        takerAddress: String(freelancerAddress),
        priceTON: offer.budgetTON,
        nPercent: 1,
        makerDeposit: offer.budgetTON * 1.01,
        takerStake: offer.budgetTON * 0.2,
        status: "created",
      },
    });

    res.json({ application: updatedApp, order });
  } catch (e) {
    console.error("selectExecutor error:", e);
    res.status(500).json({ error: "internal_error" });
  }
};

export const getApplicationsByFreelancer: RequestHandler = async (req, res) => {
  try {
    const { freelancerAddress } = req.query;
    
    if (!freelancerAddress) {
      return res.status(400).json({ error: "freelancerAddress required" });
    }

    const applications = await prisma.application.findMany({
      where: { freelancerAddress: String(freelancerAddress) },
      include: { offer: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({ applications });
  } catch (e) {
    console.error("getApplicationsByFreelancer error:", e);
    res.status(500).json({ error: "internal_error" });
  }
};
