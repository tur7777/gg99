import { RequestHandler } from "express";
import { prisma } from "../lib/prisma";
import {
  CreateReviewRequest,
  ListReviewsResponse,
  GetUserStatsResponse,
  Review,
} from "@shared/api";

/**
 * POST /api/reviews
 * Create a new review for a user after completing an order
 */
export const createReview: RequestHandler = async (req, res) => {
  try {
    const data = req.body as CreateReviewRequest;

    // Validate request
    if (!data.orderId || !data.rating || !data.revieweeAddress) {
      return res.status(400).json({
        error: "Missing required fields: orderId, rating, revieweeAddress",
      });
    }

    if (data.rating < 1 || data.rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    // Get author address from wallet signature (simplified - in production use real auth)
    const authorAddress = (req.headers as any)["x-user-address"] || "unknown";

    // Create review
    const review = await prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        offerId: data.orderId, // Using offerId field to store orderId for now
        authorId: null, // Can be linked to user later if needed
        revieweeId: null,
        createdAt: new Date(),
        date: new Date(),
      },
    });

    res.status(201).json({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      orderId: data.orderId,
      authorAddress,
      revieweeAddress: data.revieweeAddress,
      createdAt: review.createdAt.toISOString(),
    } as Review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

/**
 * GET /api/reviews/:address
 * Get all reviews for a user
 */
export const getReviewsByAddress: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: null, // Placeholder - in production, filter by revieweeAddress
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    const mapped = reviews.map(
      (r) =>
        ({
          id: r.id,
          rating: r.rating,
          comment: r.comment || undefined,
          orderId: r.offerId || "",
          authorAddress: "unknown", // Would need to fetch from user relation
          revieweeAddress: address,
          createdAt: r.createdAt.toISOString(),
        }) as Review
    );

    res.json({ items: mapped } as ListReviewsResponse);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

/**
 * GET /api/users/:address/stats
 * Get user statistics including average rating
 */
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // Get all reviews for user
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: null, // Placeholder filter
      },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    res.json({
      address,
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews,
      completedOrders: 0, // Would calculate from orders
    } as GetUserStatsResponse);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
};
