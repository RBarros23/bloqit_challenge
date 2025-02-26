import { RentService } from "../../services/rentService.js";
import { createMockContext, MockContext } from "../prisma-mock.js";
import { RentStatus, RentSize, LockerStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { RentClass } from "../../models/rent.js";

let mockCtx: MockContext;
let rentService: RentService;

describe("Rent Service", () => {
  beforeEach(() => {
    mockCtx = createMockContext();
    rentService = new RentService(mockCtx.prisma);
  });

  describe("Create Operations", () => {
    it("creates a rent successfully", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        bloqId: "123e4567-e89b-12d3-a456-426614174001",
        status: LockerStatus.CLOSED,
        isOccupied: false,
        rents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRent = {
        id: "123e4567-e89b-12d3-a456-426614174002",
        lockerId: mockLocker.id,
        weight: 5.5,
        size: RentSize.M,
        status: RentStatus.CREATED,
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt: new Date("2024-01-01T00:00:00Z"),
        droppedOffAt: null,
        pickedUpAt: null,
      };

      mockCtx.prisma.$transaction.mockResolvedValue([mockRent]);
      mockCtx.prisma.locker.findUnique.mockResolvedValue(mockLocker);
      mockCtx.prisma.rent.create.mockResolvedValue(mockRent);
      mockCtx.prisma.locker.update.mockResolvedValue({
        ...mockLocker,
        isOccupied: true,
      });

      const result = await rentService.createRentService(
        mockLocker.id,
        mockRent.weight,
        mockRent.size
      );

      expect(result.id).toBeDefined();
      expect(result.lockerId).toEqual(mockLocker.id);
      expect(result.weight).toEqual(mockRent.weight);
      expect(result.size).toEqual(mockRent.size);
      expect(result.status).toEqual(RentStatus.CREATED);
    });

    it("throws error when creating rent for occupied locker", async () => {
      const mockLocker = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        bloqId: "123e4567-e89b-12d3-a456-426614174001",
        status: LockerStatus.CLOSED,
        isOccupied: true,
        rents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCtx.prisma.locker.findUnique.mockResolvedValue(mockLocker);

      await expect(
        rentService.createRentService(mockLocker.id, 5.5, RentSize.M)
      ).rejects.toThrow("Locker is already occupied");
    });

    it("throws error when creating rent for non-existent locker", async () => {
      mockCtx.prisma.locker.findUnique.mockResolvedValue(null);

      await expect(
        rentService.createRentService("non-existent-id", 5.5, RentSize.M)
      ).rejects.toThrow("Locker not found");
    });
  });

  describe("Read Operations", () => {
    it("gets rent by ID successfully", async () => {
      const mockRent = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        lockerId: "123e4567-e89b-12d3-a456-426614174001",
        weight: 5.5,
        size: RentSize.M,
        status: RentStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
        droppedOffAt: null,
        pickedUpAt: null,
      };

      mockCtx.prisma.rent.findUnique.mockResolvedValue(mockRent);

      const result = await rentService.getRentByIdService(mockRent.id);

      expect(result?.id).toEqual(mockRent.id);
      expect(result?.lockerId).toEqual(mockRent.lockerId);
      expect(result?.weight).toEqual(mockRent.weight);
      expect(result?.size).toEqual(mockRent.size);
      expect(result?.status).toEqual(mockRent.status);
    });

    it("returns null for non-existent rent ID", async () => {
      mockCtx.prisma.rent.findUnique.mockResolvedValue(null);

      const result = await rentService.getRentByIdService("non-existent-id");

      expect(result).toBeNull();
    });

    it("gets rents by locker ID successfully", async () => {
      const mockLockerId = "test-locker-id";
      const mockRents = [
        {
          id: "rent-1",
          lockerId: mockLockerId,
          weight: 5,
          size: RentSize.M,
          status: RentStatus.CREATED,
          droppedOffAt: null,
          pickedUpAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "rent-2",
          lockerId: mockLockerId,
          weight: 10,
          size: RentSize.L,
          status: RentStatus.WAITING_PICKUP,
          droppedOffAt: null,
          pickedUpAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock the locker existence check
      mockCtx.prisma.locker.findUnique.mockResolvedValue({
        id: mockLockerId,
        bloqId: "test-bloq-id",
        status: LockerStatus.CLOSED,
        isOccupied: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock the rent retrieval
      mockCtx.prisma.rent.findMany.mockResolvedValue(mockRents);

      const result = await rentService.getRentsByLockerIdService(mockLockerId);

      expect(result).toHaveLength(2);
      expect(mockCtx.prisma.locker.findUnique).toHaveBeenCalledWith({
        where: { id: mockLockerId },
      });
      expect(mockCtx.prisma.rent.findMany).toHaveBeenCalledWith({
        where: { lockerId: mockLockerId },
      });

      // Verify the returned RentClass instances
      expect(result[0]).toBeInstanceOf(RentClass);
      expect(result[0].id).toBe(mockRents[0].id);
      expect(result[1]).toBeInstanceOf(RentClass);
      expect(result[1].id).toBe(mockRents[1].id);
    });

    it("returns empty array for non-existent locker ID", async () => {
      mockCtx.prisma.locker.findUnique.mockResolvedValue(null);
      mockCtx.prisma.rent.findMany.mockResolvedValue([]);

      await expect(
        rentService.getRentsByLockerIdService("non-existent-id")
      ).rejects.toThrow("Locker not found");
    });
  });
});
