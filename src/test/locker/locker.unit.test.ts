import { LockerService } from "../../services/lockerService.js";
import { createMockContext, MockContext } from "../prisma-mock.js";
import { LockerStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

let mockCtx: MockContext;
let lockerService: LockerService;

describe("Locker Service", () => {
  beforeEach(() => {
    mockCtx = createMockContext();
    lockerService = new LockerService(mockCtx.prisma);
  });

  describe("Create Operations", () => {
    it("creates a locker successfully", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        bloqId: "123e4567-e89b-12d3-a456-426614174001",
        status: LockerStatus.CLOSED,
        isOccupied: false,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
      };

      mockCtx.prisma.bloq.findUnique.mockResolvedValue({
        id: mockLocker.bloqId,
        title: "Test Bloq",
        address: "Test Address",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockCtx.prisma.bloq.update.mockResolvedValue({} as any);
      mockCtx.prisma.locker.create.mockResolvedValue(mockLocker);

      const result = await lockerService.createLockerService(mockLocker.bloqId);

      expect(result.id).toBeDefined();
      expect(result.bloqId).toEqual(mockLocker.bloqId);
      expect(result.status).toEqual(LockerStatus.CLOSED);
      expect(result.isOccupied).toBeFalsy();
    });

    it("handles unique constraint violation", async () => {
      const mockError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          clientVersion: "5.0.0",
        }
      );

      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174002",
        bloqId: "123e4567-e89b-12d3-a456-426614174003",
        status: LockerStatus.CLOSED,
        isOccupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.bloq.findUnique.mockResolvedValue({
        id: mockLocker.bloqId,
        title: "Test Bloq",
        address: "Test Address",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockCtx.prisma.bloq.update.mockRejectedValueOnce(mockError);
      mockCtx.prisma.locker.create.mockResolvedValue(mockLocker);
      mockCtx.prisma.bloq.update.mockResolvedValueOnce({} as any);

      const result = await lockerService.createLockerService(mockLocker.bloqId);

      expect(result.id).toBeDefined();
      expect(result.bloqId).toEqual(mockLocker.bloqId);
    });
  });

  describe("Update Operations", () => {
    it("updates locker status successfully", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174004",
        bloqId: "123e4567-e89b-12d3-a456-426614174005",
        status: LockerStatus.OPEN,
        isOccupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.locker.update.mockResolvedValue(mockLocker);

      const result = await lockerService.updateStatusLockerService(
        mockLocker.id,
        LockerStatus.OPEN
      );

      expect(result.status).toEqual(LockerStatus.OPEN);
      expect(mockCtx.prisma.locker.update).toHaveBeenCalledWith({
        where: { id: mockLocker.id },
        data: { status: LockerStatus.OPEN },
      });
    });
  });

  describe("Status Operations", () => {
    it("updates locker occupancy status", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174008",
        bloqId: "123e4567-e89b-12d3-a456-426614174009",
        status: LockerStatus.CLOSED,
        isOccupied: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.locker.update.mockResolvedValue(mockLocker);

      const result = await lockerService.occupyLockerService(
        mockLocker.id,
        true
      );

      expect(result.isOccupied).toBeTruthy();
      expect(mockCtx.prisma.locker.update).toHaveBeenCalledWith({
        where: { id: mockLocker.id },
        data: { isOccupied: true },
      });
    });

    it("throws error when updating non-existent locker", async () => {
      mockCtx.prisma.locker.update.mockRejectedValue(
        new Error("Locker not found")
      );

      await expect(
        lockerService.updateStatusLockerService(
          "non-existent-id",
          LockerStatus.OPEN
        )
      ).rejects.toThrow("Locker not found");
    });
  });

  describe("Read Operations", () => {
    it("gets locker by ID successfully", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174006",
        bloqId: "123e4567-e89b-12d3-a456-426614174007",
        status: LockerStatus.CLOSED,
        isOccupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.locker.findUnique.mockResolvedValue(mockLocker);

      const result = await lockerService.getLockerByIdService(mockLocker.id);

      expect(result?.id).toEqual(mockLocker.id);
      expect(result?.status).toEqual(mockLocker.status);
    });

    it("gets lockers by bloq ID", async () => {
      const mockLockers = [
        {
          id: "123e4567-e89b-12d3-a456-426614174010",
          bloqId: "123e4567-e89b-12d3-a456-426614174011",
          status: LockerStatus.CLOSED,
          isOccupied: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174012",
          bloqId: "123e4567-e89b-12d3-a456-426614174011",
          status: LockerStatus.OPEN,
          isOccupied: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCtx.prisma.locker.findMany.mockResolvedValue(mockLockers);

      const results = await lockerService.getLockersByBloqIdService(
        mockLockers[0].bloqId
      );

      expect(results).toHaveLength(2);
      expect(results[0].id).toEqual(mockLockers[0].id);
      expect(results[1].id).toEqual(mockLockers[1].id);
    });

    it("returns empty array for non-existent bloq ID", async () => {
      mockCtx.prisma.locker.findMany.mockResolvedValue([]);

      const results = await lockerService.getLockersByBloqIdService(
        "non-existent-bloq-id"
      );

      expect(results).toHaveLength(0);
    });
  });

  describe("Delete Operations", () => {
    it("deletes locker successfully", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174013",
        bloqId: "123e4567-e89b-12d3-a456-426614174014",
        status: LockerStatus.CLOSED,
        isOccupied: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.locker.delete.mockResolvedValue(mockLocker);

      await lockerService.deleteLockerService(mockLocker.id);

      expect(mockCtx.prisma.locker.delete).toHaveBeenCalledWith({
        where: { id: mockLocker.id },
      });
    });

    it("throws error when deleting non-existent locker", async () => {
      mockCtx.prisma.locker.delete.mockRejectedValue(
        new Error("Locker not found")
      );

      await expect(
        lockerService.deleteLockerService("non-existent-id")
      ).rejects.toThrow("Locker not found");
    });
  });
});
