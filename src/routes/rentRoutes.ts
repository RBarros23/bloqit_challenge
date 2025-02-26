import { Router } from "express";
import { RentController } from "../controllers/rentController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createRentSchema,
  updateRentStatusSchema,
  getRentByIdSchema,
  getRentsByLockerIdSchema,
} from "../middleware/rentValidateSchema.js";

export const createRentRouter = (rentController: RentController) => {
  const router = Router();

  /**
   * Creates a new rent for a specific locker
   * @route POST /api/rents/locker/:lockerId
   * @param {string} lockerId.path.required - The ID of the locker to create the rent in
   * @param {number} weight.body.required - The weight of the parcel in kilograms
   * @param {string} size.body.required - The size category of the parcel (XS, S, M, L, XL)
   * @returns {Object} 201 - Created rent object
   * @returns {Error} 404 - Locker not found
   * @returns {Error} 400 - Invalid parameters or locker is already occupied
   * @returns {Error} 500 - Server error
   */
  router.post(
    "/locker/:lockerId",
    validateRequest(createRentSchema),
    rentController.createRent.bind(rentController)
  );

  /**
   * Retrieves a specific rent by ID
   * @route GET /api/rents/:id
   * @param {string} id.path.required - The ID of the rent to retrieve
   * @returns {Object} 200 - Rent object
   * @returns {Error} 404 - Rent not found
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/:id",
    validateRequest(getRentByIdSchema),
    rentController.getRentById.bind(rentController)
  );

  /**
   * Retrieves all rents for a specific locker
   * @route GET /api/rents/locker/:lockerId
   * @param {string} lockerId.path.required - The ID of the locker to get rents from
   * @returns {Array} 200 - Array of rent objects
   * @returns {Error} 404 - No rents found
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/locker/:lockerId",
    validateRequest(getRentsByLockerIdSchema),
    rentController.getRentsByLockerId.bind(rentController)
  );

  /**
   * Updates the status of a rent
   * @route PUT /api/rents/:id/status
   * @param {string} id.path.required - The ID of the rent to update
   * @param {string} status.body.required - The new status (CREATED/WAITING_DROPOFF/WAITING_PICKUP/DELIVERED)
   * @returns {Object} 200 - Updated rent object
   * @returns {Error} 404 - Rent not found
   * @returns {Error} 400 - Invalid status transition or rent ID format
   * @returns {Error} 500 - Server error
   */
  router.put(
    "/:id/status",
    validateRequest(updateRentStatusSchema),
    rentController.updateRentStatus.bind(rentController)
  );

  /**
   * Records a dropoff for a rent
   * @route PUT /api/rents/:id/dropoff
   * @param {string} id.path.required - The ID of the rent
   * @returns {Object} 200 - Updated rent object with dropoff timestamp and WAITING_PICKUP status
   * @returns {Error} 404 - Rent not found
   * @returns {Error} 400 - Invalid rent ID format or rent not in WAITING_DROPOFF status
   * @returns {Error} 500 - Server error
   */
  router.put(
    "/:id/dropoff",
    validateRequest(getRentByIdSchema),
    rentController.recordDropoff.bind(rentController)
  );

  /**
   * Records a pickup for a rent
   * @route PUT /api/rents/:id/pickup
   * @param {string} id.path.required - The ID of the rent
   * @returns {Object} 200 - Updated rent object with pickup timestamp and DELIVERED status
   * @returns {Error} 404 - Rent not found
   * @returns {Error} 400 - Invalid rent ID format or rent not in WAITING_PICKUP status
   * @returns {Error} 500 - Server error
   */
  router.put(
    "/:id/pickup",
    validateRequest(getRentByIdSchema),
    rentController.recordPickup.bind(rentController)
  );

  return router;
};
