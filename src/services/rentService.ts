import { Prisma, PrismaClient } from "@prisma/client";
import { RentClass } from "../models/rent.js";
import { prisma as defaultPrisma } from "../utils/prisma/prisma.js";
import { generateId } from "../utils/utils.js";
import { RentStatus, RentSize } from "@prisma/client";
/**
 * Service class for managing rent operations in the Bloqit system.
 * Handles CRUD operations and state management for rents, including their relationship
 * with lockers. Manages the lifecycle of a rent from creation through delivery,
 * including status transitions and timestamp tracking for dropoffs and pickups.
 */
export class RentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new rent for a specific locker
   * @param lockerId - The ID of the locker to create the rent in
   * @param weight - The weight of the parcel in kilograms
   * @param size - The size category of the parcel (XS, S, M, L, XL)
   * @returns Promise resolving to the newly created RentClass instance
   * @throws {Error} If locker is not found or is already occupied
   */
  async createRentService(
    lockerId: string,
    weight: number,
    size: RentSize
  ): Promise<RentClass> {
    // First check if locker exists and is available
    const locker = await this.prisma.locker.findUnique({
      where: { id: lockerId },
      include: {
        rents: true,
      },
    });

    if (!locker) {
      throw new Error("Locker not found");
    }

    if (locker.isOccupied) {
      throw new Error("Locker is already occupied");
    }

    // Create rent and update locker in a transaction
    const rentId = generateId();
    const [rent] = await this.prisma.$transaction([
      this.prisma.rent.create({
        data: {
          id: rentId,
          lockerId,
          weight,
          size,
          status: RentStatus.CREATED,
        },
      }),
      this.prisma.locker.update({
        where: { id: lockerId },
        data: {
          isOccupied: true,
        },
      }),
    ]);

    return new RentClass(
      rent.id,
      rent.lockerId,
      rent.weight,
      rent.size,
      rent.status,
      rent.droppedOffAt ?? undefined,
      rent.pickedUpAt ?? undefined
    );
  }

  /**
   * Retrieves a specific rent by ID
   * @param id - The unique identifier of the rent
   * @returns Promise resolving to RentClass instance if found, null otherwise
   */
  async getRentByIdService(id: string): Promise<RentClass | null> {
    const rent = await this.prisma.rent.findUnique({
      where: { id },
    });

    if (!rent) {
      return null;
    }

    return new RentClass(
      rent.id,
      rent.lockerId,
      rent.weight,
      rent.size,
      rent.status,
      rent.droppedOffAt ?? undefined,
      rent.pickedUpAt ?? undefined
    );
  }

  /**
   * Retrieves all rents associated with a specific locker
   * @param lockerId - The ID of the locker
   * @returns Promise resolving to array of RentClass instances
   */
  async getRentsByLockerIdService(lockerId: string): Promise<RentClass[]> {
    const locker = await this.prisma.locker.findUnique({
      where: { id: lockerId },
    });

    if (!locker) {
      throw new Error("Locker not found");
    }

    const rents = await this.prisma.rent.findMany({
      where: { lockerId },
    });

    return rents.map(
      (rent) =>
        new RentClass(
          rent.id,
          rent.lockerId,
          rent.weight,
          rent.size,
          rent.status,
          rent.droppedOffAt ?? undefined,
          rent.pickedUpAt ?? undefined
        )
    );
  }

  /**
   * Updates the status of a specific rent
   * @param id - The unique identifier of the rent
   * @param status - The new status to set (CREATED, WAITING_DROPOFF, WAITING_PICKUP, DELIVERED)
   * @returns Promise resolving to the updated RentClass instance
   * @throws {Error} If rent with given ID is not found
   */
  async updateRentStatusService(
    id: string,
    status: RentStatus
  ): Promise<RentClass> {
    const rent = await this.prisma.rent.update({
      where: { id },
      data: { status },
    });

    return new RentClass(
      rent.id,
      rent.lockerId,
      rent.weight,
      rent.size,
      rent.status,
      rent.droppedOffAt ?? undefined,
      rent.pickedUpAt ?? undefined
    );
  }

  /**
   * Records a dropoff for a specific rent
   * @param id - The unique identifier of the rent
   * @returns Promise resolving to the updated RentClass instance with dropoff timestamp
   * @throws {Error} If rent with given ID is not found
   */
  async recordDropoffService(id: string): Promise<RentClass> {
    const rent = await this.prisma.rent.update({
      where: { id },
      data: {
        status: RentStatus.WAITING_PICKUP,
        droppedOffAt: new Date(),
      },
    });

    return new RentClass(
      rent.id,
      rent.lockerId,
      rent.weight,
      rent.size,
      rent.status,
      rent.droppedOffAt ?? undefined,
      rent.pickedUpAt ?? undefined
    );
  }

  /**
   * Records a pickup for a specific rent
   * @param id - The unique identifier of the rent
   * @returns Promise resolving to the updated RentClass instance with pickup timestamp
   * @throws {Error} If rent with given ID is not found
   */
  async recordPickupService(id: string): Promise<RentClass> {
    const rent = await this.prisma.rent.update({
      where: { id },
      data: {
        status: RentStatus.DELIVERED,
        pickedUpAt: new Date(),
      },
    });

    return new RentClass(
      rent.id,
      rent.lockerId,
      rent.weight,
      rent.size,
      rent.status,
      rent.droppedOffAt ?? undefined,
      rent.pickedUpAt ?? undefined
    );
  }
}
