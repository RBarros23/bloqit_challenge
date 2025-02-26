import { z } from "zod";
import { RentSize, RentStatus } from "@prisma/client";

export const createRentSchema = z.object({
  params: z.object({
    lockerId: z.string().uuid("Invalid locker ID"),
  }),
  body: z
    .object({
      weight: z.number().positive("Weight must be a positive number"),
      size: z.enum(
        [RentSize.XS, RentSize.S, RentSize.M, RentSize.L, RentSize.XL],
        {
          errorMap: () => ({
            message: "Size must be one of: XS, S, M, L, XL",
          }),
        }
      ),
    })
    .strict(),
});

export const updateRentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid rent ID"),
  }),
  body: z
    .object({
      status: z.enum(
        [
          RentStatus.CREATED,
          RentStatus.WAITING_DROPOFF,
          RentStatus.WAITING_PICKUP,
          RentStatus.DELIVERED,
        ],
        {
          errorMap: () => ({
            message:
              "Status must be one of: CREATED, WAITING_DROPOFF, WAITING_PICKUP, DELIVERED",
          }),
        }
      ),
    })
    .strict(),
});

export const getRentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid rent ID"),
  }),
});

export const getRentsByLockerIdSchema = z.object({
  params: z.object({
    lockerId: z.string().uuid("Invalid locker ID"),
  }),
});
