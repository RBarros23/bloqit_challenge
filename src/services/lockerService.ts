import { Prisma, PrismaClient } from "@prisma/client";
import { LockerClass } from "../models/locker.js";
import { RentClass } from "../models/rent.js";
import { generateId } from "../utils/utils.js";
import { LockerStatus } from "@prisma/client";

/**
 * Service class for managing locker operations in the Bloqit system.
 * Handles CRUD operations and state management for lockers, including their relationship
 * with bloqs and rents.
 */
export class LockerService {
  private prisma: PrismaClient;

  /**
   * Creates a new LockerService instance
   * @param prisma - Optional PrismaClient instance. Uses default if not provided
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new locker associated with a specific bloq
   * @param bloqId - The ID of the bloq to associate the locker with
   * @returns Promise resolving to the newly created LockerClass instance
   * @throws {Prisma.PrismaClientKnownRequestError} If there's a unique constraint violation
   */
  async createLockerService(bloqId: string): Promise<LockerClass> {
    try {
      // First check if bloq exists
      const bloq = await this.prisma.bloq.findUnique({
        where: { id: bloqId },
      });

      if (!bloq) {
        throw new Error("Bloq not found");
      }

      const lockerId = generateId();

      const locker = await this.prisma.locker.create({
        data: {
          id: lockerId,
          bloqId,
          status: LockerStatus.CLOSED,
          isOccupied: false,
        },
      });

      return new LockerClass(
        locker.id,
        locker.bloqId,
        locker.status,
        locker.isOccupied
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // Handle ID collision case
        const locker = await this.prisma.locker.create({
          data: {
            id: generateId(),
            bloqId,
            status: LockerStatus.CLOSED,
            isOccupied: false,
          },
        });
        return new LockerClass(
          locker.id,
          locker.bloqId,
          locker.status,
          locker.isOccupied
        );
      }
      throw error;
    }
  }

  /**
   * Retrieves a locker by its unique identifier, including associated bloq information
   * @param id - The unique identifier of the locker
   * @returns Promise resolving to LockerClass instance if found, null otherwise
   */
  async getLockerByIdService(id: string): Promise<LockerClass | null> {
    const locker = await this.prisma.locker.findUnique({
      where: { id },
      include: {
        bloq: true,
      },
    });
    if (!locker) return null;
    return new LockerClass(
      locker.id,
      locker.bloqId,
      locker.status,
      locker.isOccupied
    );
  }

  /**
   * Retrieves all lockers associated with a specific bloq
   * @param bloqId - The ID of the bloq to get lockers for
   * @returns Promise resolving to an array of LockerClass instances
   */
  async getLockersByBloqIdService(bloqId: string): Promise<LockerClass[]> {
    const lockers = await this.prisma.locker.findMany({
      where: { bloqId },
    });
    return lockers.map(
      (locker) =>
        new LockerClass(
          locker.id,
          locker.bloqId,
          locker.status,
          locker.isOccupied
        )
    );
  }

  /**
   * Updates the status of a locker (OPEN/CLOSED)
   * @param id - The unique identifier of the locker
   * @param status - The new LockerStatus to set
   * @returns Promise resolving to the updated LockerClass instance
   * @throws {Prisma.PrismaClientKnownRequestError} If locker with given ID doesn't exist
   */
  async updateStatusLockerService(
    id: string,
    status: LockerStatus
  ): Promise<LockerClass> {
    const locker = await this.prisma.locker.update({
      where: { id },
      data: { status },
    });
    return new LockerClass(
      locker.id,
      locker.bloqId,
      locker.status,
      locker.isOccupied
    );
  }

  /**
   * Checks if a locker is currently occupied
   * @param id - The unique identifier of the locker
   * @returns Promise resolving to boolean if locker found, null otherwise
   */
  async isOccupiedLockerService(id: string): Promise<boolean | null> {
    const locker = await this.getLockerByIdService(id);
    return locker ? locker.isOccupied : null;
  }

  /**
   * Updates the occupied status of a locker
   * @param id - The unique identifier of the locker
   * @param isOccupied - Boolean indicating whether the locker should be marked as occupied
   * @returns Promise resolving to the updated LockerClass instance
   * @throws {Prisma.PrismaClientKnownRequestError} If locker with given ID doesn't exist
   */
  async occupyLockerService(
    id: string,
    isOccupied: boolean
  ): Promise<LockerClass> {
    const locker = await this.prisma.locker.update({
      where: { id },
      data: { isOccupied: isOccupied },
    });
    return new LockerClass(
      locker.id,
      locker.bloqId,
      locker.status,
      locker.isOccupied
    );
  }

  /**
   * Retrieves all rents associated with a specific locker
   * @param id - The unique identifier of the locker
   * @returns Promise resolving to an array of RentClass instances
   * @throws {Error} If locker with given ID doesn't exist
   */
  async getRentsByLockerIdService(id: string): Promise<RentClass[]> {
    try {
      const locker = await this.prisma.locker.findUnique({
        where: { id },
      });
      if (!locker) {
        throw new Error("Locker not found");
      }
      const rents = await this.prisma.rent.findMany({
        where: { lockerId: id },
      });
      return rents.map(
        (rent) =>
          new RentClass(
            rent.id,
            rent.lockerId,
            rent.weight,
            rent.size,
            rent.status
          )
      );
    } catch (error) {
      throw error;
    }
  }

  async deleteLockerService(id: string): Promise<void> {
    try {
      await this.prisma.locker.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new Error("Locker not found");
      }
      throw error;
    }
  }
}
