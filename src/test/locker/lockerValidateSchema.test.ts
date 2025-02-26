import {
  createLockerSchema,
  updateLockerSchema,
  updateLockerStatusSchema,
  getLockerByIdSchema,
  occupyLockerSchema,
} from "../../middleware/lockerValidateSchema.js";

describe("Locker Validation Schemas", () => {
  describe("createLockerSchema", () => {
    it("validates correct locker creation data", () => {
      const validData = {
        params: {
          bloqId: "123e4567-e89b-12d3-a456-426614174000",
        },
      };
      const result = createLockerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid bloq ID format", () => {
      const invalidData = {
        params: {
          bloqId: "invalid-uuid",
        },
      };
      const result = createLockerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid bloq ID");
      }
    });
  });

  describe("updateLockerSchema", () => {
    it("validates correct locker update data", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: "OPEN",
          isOccupied: false,
        },
      };
      const result = updateLockerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid status value", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: "INVALID_STATUS",
          isOccupied: false,
        },
      };
      const result = updateLockerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("rejects invalid isOccupied type", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: "OPEN",
          isOccupied: "true", // Should be boolean
        },
      };
      const result = updateLockerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateLockerStatusSchema", () => {
    it("validates correct status update data", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: "OPEN",
        },
      };
      const result = updateLockerStatusSchema.safeParse(validData);
      expect(result.success).toBe(true);
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
      const result = updateLockerStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "Status must be either 'OPEN' or 'CLOSED'"
        );
      }
    });

    it("rejects extra properties in body", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          status: "OPEN",
          extraProp: "value",
        },
      };
      const result = updateLockerStatusSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("getLockerByIdSchema", () => {
    it("validates correct locker ID format", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
      };
      const result = getLockerByIdSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid locker ID format", () => {
      const invalidData = {
        params: {
          id: "invalid-id",
        },
      };
      const result = getLockerByIdSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid locker ID");
      }
    });
  });

  describe("occupyLockerSchema", () => {
    it("validates correct occupation data", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          isOccupied: true,
        },
      };
      const result = occupyLockerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing isOccupied field", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {},
      };
      const result = occupyLockerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("isOccupied is required");
      }
    });

    it("rejects invalid isOccupied type", () => {
      const invalidData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          isOccupied: "true", // Should be boolean
        },
      };
      const result = occupyLockerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe(
          "isOccupied must be a boolean"
        );
      }
    });
  });
});
