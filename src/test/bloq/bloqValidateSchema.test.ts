import {
  createBloqSchema,
  updateBloqSchema,
  getBloqSchema,
  addLockerToBloqSchema,
} from "../../middleware/bloqValidateSchema.js";

describe("Bloq Validation Schemas", () => {
  describe("createBloqSchema", () => {
    it("validates correct bloq creation data", () => {
      const validData = {
        body: {
          title: "Test Bloq",
          address: "123 Main St",
        },
      };
      const result = createBloqSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects missing title", () => {
      const invalidData = {
        body: {
          title: "",
          address: "123 Main St",
        },
      };
      const result = createBloqSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Title is required");
      }
    });

    it("rejects missing address", () => {
      const invalidData = {
        body: {
          title: "Test Bloq",
          address: "",
        },
      };
      const result = createBloqSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Address is required");
      }
    });
  });

  describe("updateBloqSchema", () => {
    it("validates correct bloq update data", () => {
      const validData = {
        params: {
          id: "123e4567-e89b-12d3-a456-426614174000",
        },
        body: {
          title: "Updated Bloq",
          address: "456 New St",
        },
      };
      const result = updateBloqSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects invalid UUID format", () => {
      const invalidData = {
        params: {
          id: "invalid-uuid",
        },
        body: {
          title: "Updated Bloq",
          address: "456 New St",
        },
      };
      const result = updateBloqSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid bloq ID");
      }
    });
  });
});
