import { Prisma, PrismaClient } from "@prisma/client";
import { BloqClass } from "../models/bloq.js";
import { generateId } from "../utils/utils.js";
import { prisma as defaultPrisma } from "../utils/prisma/prisma.js";
import { LockerClass } from "../models/locker.js";

/**
 * Service class for managing Bloq operations in the Bloqit system.
 * Handles CRUD operations and relationships between Bloqs and Lockers.
 */
export class BloqService {
  private prisma: PrismaClient;

  /**
   * Creates a new BloqService instance
   * @param prisma - PrismaClient instance for database operations
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Creates a new Bloq with the specified title and address
   * @param title - The title of the Bloq
   * @param address - The physical address of the Bloq
   * @returns Promise resolving to the newly created BloqClass instance
   * @throws {Prisma.PrismaClientKnownRequestError} If unique constraint violation occurs, will retry with new ID
   * @throws {Error} If database operation fails for other reasons
   */
  async createBloqService(title: string, address: string): Promise<BloqClass> {
    try {
      const bloq = await this.prisma.bloq.create({
        data: {
          id: generateId(),
          title,
          address,
        },
      });
      return new BloqClass(bloq.id, bloq.title, bloq.address);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const bloq = await this.prisma.bloq.create({
          data: {
            id: generateId(),
            title,
            address,
          },
        });
        return new BloqClass(bloq.id, bloq.title, bloq.address);
      }
      throw error;
    }
  }

  /**
   * Retrieves a specific Bloq by ID, including its associated lockers
   * @param id - The unique identifier of the Bloq
   * @returns Promise resolving to BloqClass instance if found, null otherwise
   */
  async getBloqByIdService(id: string): Promise<BloqClass | null> {
    const bloq = await this.prisma.bloq.findUnique({
      where: { id },
      include: {
        lockers: true,
      },
    });

    if (!bloq) return null;

    const lockers = bloq.lockers.map(
      (locker) =>
        new LockerClass(
          locker.id,
          locker.bloqId,
          locker.status,
          locker.isOccupied
        )
    );

    return new BloqClass(bloq.id, bloq.title, bloq.address, lockers);
  }

  /**
   * Retrieves all Bloqs in the system, including their associated lockers
   * @returns Promise resolving to array of BloqClass instances
   */
  async getAllBloqsService(): Promise<BloqClass[]> {
    const bloqs = await this.prisma.bloq.findMany({
      include: {
        lockers: true,
      },
    });

    return bloqs.map((bloq) => {
      const lockers = bloq.lockers.map(
        (locker) =>
          new LockerClass(
            locker.id,
            locker.bloqId,
            locker.status,
            locker.isOccupied
          )
      );
      return new BloqClass(bloq.id, bloq.title, bloq.address, lockers);
    });
  }

  /**
   * Updates the title and address of a specific Bloq
   * @param id - The unique identifier of the Bloq
   * @param title - The new title
   * @param address - The new address
   * @returns Promise resolving to the updated BloqClass instance
   * @throws {Error} If Bloq with given ID is not found
   * @throws {Error} If database operation fails
   */
  async updateBloqService(
    id: string,
    title: string,
    address: string
  ): Promise<BloqClass> {
    const bloq = await this.prisma.bloq.update({
      where: { id },
      data: { title, address },
    });
    if (!bloq) throw new Error("Bloq not found");
    return new BloqClass(bloq.id, bloq.title, bloq.address);
  }

  /**
   * Deletes a specific Bloq from the system
   * @param id - The unique identifier of the Bloq to delete
   * @returns Promise resolving to the deleted BloqClass instance
   */
  async deleteBloqService(id: string): Promise<BloqClass> {
    const bloq = await this.prisma.bloq.delete({
      where: { id },
    });
    if (!bloq) throw new Error("Bloq not found");
    return new BloqClass(bloq.id, bloq.title, bloq.address);
  }

  /**
   * Associates an existing locker with a specific Bloq
   * @param id - The unique identifier of the Bloq
   * @param lockerId - The unique identifier of the Locker to associate
   * @returns Promise resolving to the updated BloqClass instance
   * @throws {Error} If Bloq or Locker with given ID is not found
   * @throws {Error} If database operation fails
   */
  async addLockerToBloqService(
    id: string,
    lockerId: string
  ): Promise<BloqClass> {
    const bloq = await this.prisma.bloq.update({
      where: { id },
      data: { lockers: { connect: { id: lockerId } } },
    });
    if (!bloq) throw new Error("Bloq not found");
    return new BloqClass(bloq.id, bloq.title, bloq.address);
  }
}
