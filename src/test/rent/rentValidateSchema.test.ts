import {
  createRentSchema,
  updateRentStatusSchema,
  getRentByIdSchema,
  getRentsByLockerIdSchema,
} from "../../middleware/rentValidateSchema.js";
import { RentSize, RentStatus } from "@prisma/client";

describe("Rent Validation Schemas", () => {
  describe("createRentSchema", () => {
    it("validates correct rent creation data", () => {
      const validData = {
        params: {
          lockerId: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          weight: 5.5,
          size: RentSize.M,
        },
      };
      const result = createRentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid locker ID format", () => {
      const invalidData = {
        params: {
          lockerId: "invalid-uuid",
        },
        body: {
          weight: 5.5,
          size: RentSize.M,
        },
      };
      const result = createRentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid locker ID");
      }
    });

    it("rejects negative weight", () => {
      const invalidData = {
        params: {
          lockerId: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          weight: -5,
          size: RentSize.M,
        },
      };
      const result = createRentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Weight must be a positive number"
        );
      }
    });

    it("rejects invalid size enum", () => {
      const invalidData = {
        params: {
          lockerId: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          weight: 5.5,
          size: "INVALID_SIZE",
        },
      };
      const result = createRentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Size must be one of: XS, S, M, L, XL"
        );
      }
    });
  });

  describe("updateRentStatusSchema", () => {
    it("validates correct status update data", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: RentStatus.WAITING_PICKUP,
        },
      };
      const result = updateRentStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid rent ID format", () => {
      const invalidData = {
        params: {
          id: "invalid-uuid",
        },
        body: {
          status: RentStatus.WAITING_PICKUP,
        },
      };
      const result = updateRentStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid rent ID");
      }
    });

    it("rejects invalid status value", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: "INVALID_STATUS",
        },
      };
      const result = updateRentStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Status must be one of: CREATED, WAITING_DROPOFF, WAITING_PICKUP, DELIVERED"
        );
      }
    });

    it("rejects extra properties in body", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: RentStatus.WAITING_PICKUP,
          extraProp: "value",
        },
      };
      const result = updateRentStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("getRentByIdSchema", () => {
    it("validates correct rent ID format", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
      };
      const result = getRentByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid rent ID format", () => {
      const invalidData = {
        params: {
          id: "invalid-id",
        },
      };
      const result = getRentByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid rent ID");
      }
    });
  });

  describe("getRentsByLockerIdSchema", () => {
    it("validates correct locker ID format", () => {
      const validData = {
        params: {
          lockerId: "123e4567-e89b-12d3-a456-426614174000",
        },
      };
      const result = getRentsByLockerIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid locker ID format", () => {
      const invalidData = {
        params: {
          lockerId: "invalid-id",
        },
      };
      const result = getRentsByLockerIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid locker ID");
      }
    });
  });
});
