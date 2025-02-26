import { Request, Response } from "express";
import { LockerService } from "../services/lockerService.js";

import { prisma } from "../utils/prisma/prisma.js";

/**
 * Controller class handling locker-related HTTP requests.
 * Manages operations for creating, retrieving, updating, and managing lockers in the Bloqit system.
 */
export class LockerController {
  private lockerService: LockerService;

  /**
   * Creates a new LockerController instance
   * @param lockerService - Optional LockerService instance. Creates new instance if not provided
   */
  constructor(lockerService: LockerService) {
    this.lockerService = lockerService;
  }

  /**
   * Creates a new locker in a specific bloq
   * @param req - Express request object containing bloqId in params
   * @param res - Express response object
   * @returns 201 with created locker data or 500 if creation fails
   */
  async createLocker(req: Request, res: Response) {
    try {
      const { bloqId } = req.params;
      const locker = await this.lockerService.createLockerService(bloqId);
      return res.status(201).json(locker);
    } catch (error) {
      if (error instanceof Error && error.message === "Bloq not found") {
        return res.status(404).json({ error: "Bloq not found" });
      }
      return res.status(500).json({ error: "Failed to create locker" });
    }
  }

  /**
   * Retrieves a specific locker by ID
   * @param req - Express request object containing locker ID in params
   * @param res - Express response object
   * @returns {Object} 200 - Locker data
   * @returns {Error} 404 - If locker not found
   * @returns {Error} 500 - If retrieval fails
   */
  async getLockerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const locker = await this.lockerService.getLockerByIdService(id);
      if (!locker) {
        return res.status(404).json({ error: "Locker not found" });
      }
      return res.status(201).json(locker);
    } catch (error) {
      console.error("Error getting locker by id:", error);
      return res.status(500).json({ error: "Failed to get locker by id" });
    }
  }

  /**
   * Retrieves all lockers associated with a specific bloq
   * @param req - Express request object containing bloqId in params
   * @param res - Express response object
   * @returns 200 with array of lockers, 404 if none found, or 500 if retrieval fails
   */
  async getLockersByBloqId(req: Request, res: Response) {
    try {
      const { bloqId } = req.params;
      const lockers = await this.lockerService.getLockersByBloqIdService(
        bloqId
      );
      if (lockers.length === 0) {
        return res.status(404).json({ error: "No lockers found" });
      }
      return res.status(200).json(lockers);
    } catch (error) {
      console.error("Error getting lockers by bloq id:", error);
      return res
        .status(500)
        .json({ error: "Failed to get lockers by bloq id" });
    }
  }

  /**
   * Updates the status (OPEN/CLOSED) of a specific locker
   * @param req - Express request object containing locker ID in params and status in body
   * @param res - Express response object
   * @returns 200 with updated locker data or 500 if update fails
   */
  async updateStatusLocker(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const locker = await this.lockerService.updateStatusLockerService(
        id,
        status
      );
      return res.status(200).json(locker);
    } catch (error) {
      console.error("Error updating locker status:", error);
      return res.status(500).json({ error: "Failed to update locker status" });
    }
  }

  /**
   * Checks if a specific locker is currently occupied
   * @param req - Express request object containing locker ID in params
   * @param res - Express response object
   * @returns 200 with occupation status, 404 if not found, or 500 if check fails
   */
  async isOccupiedLocker(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const locker = await this.lockerService.isOccupiedLockerService(id);
      if (locker === null) {
        return res.status(404).json({ error: "Locker not found" });
      }
      return res.status(200).json(locker);
    } catch (error) {
      console.error("Error checking if locker is occupied:", error);
      return res
        .status(500)
        .json({ error: "Failed to check if locker is occupied" });
    }
  }

  /**
   * Updates the occupation status of a specific locker
   * @param req - Express request object containing locker ID in params and isOccupied in body
   * @param res - Express response object
   * @returns 200 with updated locker data or 500 if update fails
   */
  async occupyLocker(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isOccupied } = req.body;
      const locker = await this.lockerService.occupyLockerService(
        id,
        isOccupied
      );
      return res.status(200).json(locker);
    } catch (error) {
      console.error("Error occupying locker:", error);
      return res.status(500).json({ error: "Failed to occupy locker" });
    }
  }

  /**
   * Retrieves all rents associated with a specific locker
   * @param req - Express request object containing locker ID in params
   * @param res - Express response object
   * @returns {Array} 200 - Array of rent objects associated with the locker
   * @returns {Error} 404 - If locker not found
   * @returns {Error} 500 - If retrieval fails
   */
  async getRentsByLockerId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rents = await this.lockerService.getRentsByLockerIdService(id);
      return res.status(200).json(rents);
    } catch (error) {
      if (error instanceof Error && error.message === "Locker not found") {
        return res.status(404).json({ error: "Locker not found" });
      }
      return res
        .status(500)
        .json({ error: "Failed to get rents by locker id" });
    }
  }

  /**
   * Deletes a specific locker
   * @param req - Express request object containing locker ID in params
   * @param res - Express response object
   * @returns {Object} 200 - Success message if deletion successful
   * @returns {Error} 404 - If locker not found
   * @returns {Error} 500 - If deletion fails
   */
  async deleteLocker(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.lockerService.deleteLockerService(id);
      return res.status(200).json({ message: "Locker deleted successfully" });
    } catch (error) {
      if (error instanceof Error && error.message === "Locker not found") {
        return res.status(404).json({ error: "Locker not found" });
      }
      console.error("Error deleting locker:", error);
      return res.status(500).json({ error: "Failed to delete locker" });
    }
  }
}
