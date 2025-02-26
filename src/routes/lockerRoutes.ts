import { Router } from "express";
import { LockerController } from "../controllers/lockerController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createLockerSchema,
  updateLockerStatusSchema,
  getLockerByIdSchema,
  getLockersByBloqIdSchema,
  isOccupiedLockerSchema,
  occupyLockerSchema,
} from "../middleware/lockerValidateSchema.js";

export const createLockerRouter = (lockerController: LockerController) => {
  const router = Router();

  /**
   * Creates a new locker in a specific bloq
   * @route POST /api/lockers/bloq/:bloqId
   * @param {string} bloqId.path.required - The ID of the bloq to create the locker in
   * @returns {Object} 201 - Created locker object
   * @returns {Error} 400 - Invalid bloq ID format
   * @returns {Error} 500 - Server error
   */
  router.post(
    "/bloq/:bloqId",
    validateRequest(createLockerSchema),
    lockerController.createLocker.bind(lockerController)
  );

  /**
   * Retrieves a specific locker by ID
   * @route GET /api/lockers/:id
   * @param {string} id.path.required - The ID of the locker to retrieve
   * @returns {Object} 200 - Locker object
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid locker ID format
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/:id",
    validateRequest(getLockerByIdSchema),
    lockerController.getLockerById.bind(lockerController)
  );

  /**
   * Retrieves all lockers in a specific bloq
   * @route GET /api/lockers/bloq/:bloqId
   * @param {string} bloqId.path.required - The ID of the bloq to get lockers from
   * @returns {Array} 200 - Array of locker objects
   * @returns {Error} 404 - No lockers found
   * @returns {Error} 400 - Invalid bloq ID format
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/bloq/:bloqId",
    validateRequest(getLockersByBloqIdSchema),
    lockerController.getLockersByBloqId.bind(lockerController)
  );

  /**
   * Updates the status (OPEN/CLOSED) of a specific locker
   * @route PUT /api/lockers/:id/status
   * @param {string} id.path.required - The ID of the locker to update
   * @param {string} status.body.required - The new status (OPEN or CLOSED)
   * @returns {Object} 200 - Updated locker object
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid status or locker ID format
   * @returns {Error} 500 - Server error
   */
  router.put(
    "/:id/status",
    validateRequest(updateLockerStatusSchema),
    lockerController.updateStatusLocker.bind(lockerController)
  );

  /**
   * Checks if a specific locker is currently occupied
   * @route GET /api/lockers/:id/is-occupied
   * @param {string} id.path.required - The ID of the locker to check
   * @returns {Object} 200 - Occupation status object
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid locker ID format
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/:id/is-occupied",
    validateRequest(isOccupiedLockerSchema),
    lockerController.isOccupiedLocker.bind(lockerController)
  );

  /**
   * Updates the occupation status of a specific locker
   * @route PUT /api/lockers/:id/occupy
   * @param {string} id.path.required - The ID of the locker to update
   * @param {boolean} isOccupied.body.required - The new occupation status
   * @returns {Object} 200 - Updated locker object
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid locker ID format or occupation status
   * @returns {Error} 500 - Server error
   */
  router.put(
    "/:id/occupy",
    validateRequest(occupyLockerSchema),
    lockerController.occupyLocker.bind(lockerController)
  );

  /**
   * Retrieves all rents associated with a specific locker
   * @route GET /api/lockers/:id/rents
   * @param {string} id.path.required - The ID of the locker to get rents from
   * @returns {Array} 200 - Array of rent objects
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid locker ID format
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/:id/rents",
    validateRequest(getLockerByIdSchema),
    lockerController.getRentsByLockerId.bind(lockerController)
  );

  /**
   * Deletes a specific locker
   * @route DELETE /api/lockers/:id
   * @param {string} id.path.required - The ID of the locker to delete
   * @returns {Object} 200 - Success message
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid locker ID format
   * @returns {Error} 500 - Server error
   */
  router.delete(
    "/:id",
    validateRequest(getLockerByIdSchema),
    lockerController.deleteLocker.bind(lockerController)
  );
  return router;
};
