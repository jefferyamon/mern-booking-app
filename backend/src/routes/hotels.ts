import express, { Request, Response } from "express";
import Hotel from "../models/hotels";
import { BookingType, HotelSearchResponse } from "../shared/types";
import { param, validationResult } from "express-validator";
const router = express.Router();
import Stripe from "stripe";
import verifyToken from "../middleware/auth";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOption = {};

    switch (req.query.sortOption) {
      case "starRating":
        sortOption = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOption = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOption = { pricePerNight: -1 };
        break;
      case "types":
        sortOption = { types: 1 }; // Adjust as needed
        break;
      case "facilities":
        sortOption = { facilities: 1 }; // Adjust as needed
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;
    const hotels = await Hotel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);
    const total = await Hotel.countDocuments(query);
    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };
    res.json(response);
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(500).json({ errors: errors.array() });
      return;
    }
    const id = req.params.id.toString();
    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.error("Error fetching hotel: ", error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    const { numberOfNights } = req.body;
    if (typeof numberOfNights !== "number" || numberOfNights <= 0) {
      return res.status(400).json({ message: "Invalid number of nights" });
    }
    const hotelId = req.params.hotelId;

    try {
      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(400).json({ message: "Hotel not found" });
      }
      const totalCost = (hotel.pricePerNight || 0) * numberOfNights;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCost * 100,
        currency: "usd",
        metadata: {
          hotelId,
          userId: req.userId,
        },
      });
      if (!paymentIntent.client_secret) {
        return res
          .status(500)
          .json({ message: "Error creating payment intent" });
      }
      const response = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        totalCost,
      };
      res.send(response);
    } catch (error) {
      console.log("Error creating payment intent: ", error);
      res.status(500).json({ message: "Error creating payment intent" });
    }
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const paymentIntentId = req.body.paymentIntentId;
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );
      if (!paymentIntent) {
        return res.status(400).json({ message: "Payment intent not found" });
      }
      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "Payment intent mismatch" });
      }
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `Payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }
      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
      };
      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.hotelId },
        { $push: { bookings: newBooking } },
        { new: true }
      );
      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }
      await hotel.save();
      res.status(200).json({ message: "Booking successful" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }
);

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};
  if (queryParams.destination) {
    constructedQuery.$or = [
      { city: new RegExp(queryParams.destination, "i") },
      { country: new RegExp(queryParams.destination, "i") },
    ];
  }
  if (queryParams.adultCount) {
    constructedQuery.adultCount = {
      $gte: parseInt(queryParams.adultCount),
    };
  }
  if (queryParams.childCount) {
    constructedQuery.childCount = {
      $gte: parseInt(queryParams.childCount),
    };
  }

  // if (queryParams.facilities) {
  //   constructedQuery.facilities = {
  //     $all: Array.isArray(queryParams.facilities)
  //       ? queryParams.facilities
  //       : [queryParams.facilities],
  //   };
  // }

  if (queryParams.facilities) {
    constructedQuery.facilities = {
      $all: Array.isArray(queryParams.facilities)
        ? queryParams.facilities.map(
            (facility: string) => new RegExp(facility, "i")
          )
        : [new RegExp(queryParams.facilities, "i")],
    };
  }

  if (queryParams.types) {
    constructedQuery.types = {
      $in: Array.isArray(queryParams.types)
        ? queryParams.types
        : [queryParams.types],
    };
  }

  if (queryParams.stars) {
    const starRatings = Array.isArray(queryParams.stars)
      ? queryParams.stars.map((star: string) => parseInt(star))
      : parseInt(queryParams.stars);

    constructedQuery.starRating = { $eq: starRatings };
  }

  if (queryParams.maxPrice) {
    constructedQuery.pricePerNight = {
      $lte: parseInt(queryParams.maxPrice).toString(),
    };
  }

  return constructedQuery;
};

export default router;
