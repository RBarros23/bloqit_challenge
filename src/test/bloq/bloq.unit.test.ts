import { BloqService } from "../../services/bloqService.js";
import { createMockContext, MockContext } from "../prisma-mock.js";
import { LockerStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

let mockCtx: MockContext;
let bloqService: BloqService;

describe("Bloq Service", () => {
  beforeEach(() => {
    mockCtx = createMockContext();
    bloqService = new BloqService(mockCtx.prisma);
  });

  describe("Create Operations", () => {
    it("creates a bloq successfully", async () => {
      const mockBloq = {
        id: "1",
        title: "Test Bloq",
        address: "123 Main St",
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockCtx.prisma.bloq.create.mockResolvedValue(mockBloq);

      const result = await bloqService.createBloqService(
        mockBloq.title,
        mockBloq.address
      );

      expect(result.id).toEqual(mockBloq.id);
      expect(result.title).toEqual(mockBloq.title);
      expect(result.address).toEqual(mockBloq.address);
      expect(mockCtx.prisma.bloq.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          title: mockBloq.title,
          address: mockBloq.address,
        },
      });
    });

    it("retries creation on ID collision", async () => {
      const mockBloq = {
        id: "1",
        title: "Test Bloq",
        address: "123 Main St",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First attempt fails with P2002 error (unique constraint violation)
      mockCtx.prisma.bloq.create
        .mockRejectedValueOnce(
          new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
            code: "P2002",
            clientVersion: "4.7.1",
          })
        )
        // Second attempt succeeds
        .mockResolvedValueOnce(mockBloq);

      const result = await bloqService.createBloqService(
        mockBloq.title,
        mockBloq.address
      );

      expect(result.id).toEqual(mockBloq.id);
      expect(mockCtx.prisma.bloq.create).toHaveBeenCalledTimes(2);
    });

    it("throws error on database failure", async () => {
      mockCtx.prisma.bloq.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        bloqService.createBloqService("Test Bloq", "123 Main St")
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("Read Operations", () => {
    it("gets bloq by ID successfully", async () => {
      const mockBloq = {
        id: "1",
        title: "Test Bloq",
        address: "123 Main St",
        lockers: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.bloq.findUnique.mockResolvedValue(mockBloq);

      const result = await bloqService.getBloqByIdService(mockBloq.id);

      expect(result?.id).toEqual(mockBloq.id);
      expect(result?.title).toEqual(mockBloq.title);
      expect(result?.address).toEqual(mockBloq.address);
    });

    it("returns null for non-existent bloq ID", async () => {
      mockCtx.prisma.bloq.findUnique.mockResolvedValue(null);

      const result = await bloqService.getBloqByIdService("non-existent-id");

      expect(result).toBeNull();
    });

    it("gets all bloqs successfully", async () => {
      const mockBloqs = [
        {
          id: "1",
          title: "Bloq 1",
          address: "Address 1",
          lockers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "2",
          title: "Bloq 2",
          address: "Address 2",
          lockers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCtx.prisma.bloq.findMany.mockResolvedValue(mockBloqs);

      const results = await bloqService.getAllBloqsService();

      expect(results).toHaveLength(2);
      expect(results[0].id).toEqual(mockBloqs[0].id);
      expect(results[1].id).toEqual(mockBloqs[1].id);
    });

    it("gets bloq with associated lockers", async () => {
      const mockBloq = {
        id: "1",
        title: "Test Bloq",
        address: "123 Main St",
        lockers: [
          {
            id: "L1",
            bloqId: "1",
            status: LockerStatus.CLOSED,
            isOccupied: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.bloq.findUnique.mockResolvedValue(mockBloq);

      const result = await bloqService.getBloqByIdService(mockBloq.id);

      expect(result?.lockers).toHaveLength(1);
      expect(result?.lockers[0].id).toEqual(mockBloq.lockers[0].id);
    });
  });

  describe("Update Operations", () => {
    it("updates bloq title successfully", async () => {
      const mockBloq = {
        id: "1",
        title: "Updated Title",
        address: "123 Main St",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.bloq.update.mockResolvedValue(mockBloq);

      const result = await bloqService.updateBloqService(
        mockBloq.id,
        mockBloq.title,
        mockBloq.address
      );

      expect(result.title).toEqual("Updated Title");
      expect(mockCtx.prisma.bloq.update).toHaveBeenCalledWith({
        where: { id: mockBloq.id },
        data: { address: mockBloq.address, title: mockBloq.title },
      });
    });

    it("throws error when updating non-existent bloq", async () => {
      mockCtx.prisma.bloq.update.mockRejectedValue(new Error("Bloq not found"));

      await expect(
        bloqService.updateBloqService(
          "non-existent-id",
          "New Title",
          "New Address"
        )
      ).rejects.toThrow("Bloq not found");
    });
  });

  describe("Delete Operations", () => {
    it("deletes existing bloq successfully", async () => {
      const mockBloq = {
        id: "1",
        title: "Test Bloq",
        address: "123 Main St",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.bloq.delete.mockResolvedValue(mockBloq);

      await bloqService.deleteBloqService(mockBloq.id);

      expect(mockCtx.prisma.bloq.delete).toHaveBeenCalledWith({
        where: { id: mockBloq.id },
      });
    });

    it("throws error when deleting non-existent bloq", async () => {
      mockCtx.prisma.bloq.delete.mockRejectedValue(new Error("Bloq not found"));

      await expect(
        bloqService.deleteBloqService("non-existent-id")
      ).rejects.toThrow("Bloq not found");
    });

    it("deletes bloq with associated lockers", async () => {
      const mockBloq = {
        id: "1",
        title: "Test Bloq",
        address: "123 Main St",
        lockers: [
          {
            id: "L1",
            bloqId: "1",
            status: LockerStatus.CLOSED,
            isOccupied: false,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.bloq.delete.mockResolvedValue(mockBloq);

      await bloqService.deleteBloqService(mockBloq.id);

      expect(mockCtx.prisma.bloq.delete).toHaveBeenCalledWith({
        where: { id: mockBloq.id },
      });
    });
  });
});
