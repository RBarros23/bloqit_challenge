import { z } from "zod";

/**
 * Schema for creating a new locker in a specific bloq
 * Validates the bloq ID parameter
 */
export const createLockerSchema = z.object({
  params: z.object({
    bloqId: z.string().uuid("Invalid bloq ID"),
  }),
});

/**
 * Schema for updating a locker's properties
 * Validates locker ID parameter and both status and occupation status in body
 */
export const updateLockerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid locker ID"),
  }),
  body: z.object({
    status: z.enum(["OPEN", "CLOSED"]),
    isOccupied: z.boolean(),
  }),
});

/**
 * Schema for updating only a locker's status
 * Validates locker ID parameter and ensures status is either 'OPEN' or 'CLOSED'
 * Uses strict mode to prevent additional properties in the body
 */
export const updateLockerStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid locker ID"),
  }),
  body: z
    .object({
      status: z.enum(["OPEN", "CLOSED"], {
        errorMap: () => ({
          message: "Status must be either 'OPEN' or 'CLOSED'",
        }),
      }),
    })
    .strict(),
});

/**
 * Schema for retrieving a locker by ID
 * Validates the locker ID parameter
 */
export const getLockerByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid locker ID"),
  }),
});

/**
 * Schema for retrieving all lockers in a specific bloq
 * Validates the bloq ID parameter
 */
export const getLockersByBloqIdSchema = z.object({
  params: z.object({
    bloqId: z.string().uuid("Invalid bloq ID"),
  }),
});

/**
 * Schema for checking a locker's occupation status
 * Validates the locker ID parameter
 */
export const isOccupiedLockerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid locker ID"),
  }),
});

/**
 * Schema for updating a locker's occupation status
 * Validates locker ID parameter and ensures isOccupied is a boolean
 * Uses strict mode to prevent additional properties in the body
 */
export const occupyLockerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid locker ID"),
  }),
  body: z
    .object({
      isOccupied: z.boolean({
        required_error: "isOccupied is required",
        invalid_type_error: "isOccupied must be a boolean",
      }),
    })
    .strict(),
});
