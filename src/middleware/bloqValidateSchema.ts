import { z } from "zod";

export const createBloqSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    address: z.string().min(1, "Address is required"),
  }),
});

export const updateBloqSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid bloq ID"),
  }),
  body: z.object({
    title: z.string().min(1, "Title is required"),
    address: z.string().min(1, "Address is required"),
  }),
});

export const getBloqSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid bloq ID"),
  }),
});

export const addLockerToBloqSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid bloq ID"),
  }),
  body: z
    .object({
      lockerId: z.string().uuid("Invalid locker ID"),
    })
    .strict(),
});
