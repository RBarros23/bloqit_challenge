import { Router } from "express";
import { BloqController } from "../controllers/bloqController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  createBloqSchema,
  updateBloqSchema,
  getBloqSchema,
  addLockerToBloqSchema,
} from "../middleware/bloqValidateSchema.js";

export const createBloqRouter = (bloqController: BloqController) => {
  const router = Router();

  /**
   * Creates a new bloq with title and address
   * @route POST /api/bloqs
   * @param {string} title.body.required - The title of the bloq
   * @param {string} address.body.required - The address of the bloq
   * @returns {Object} 201 - Created bloq object
   * @returns {Error} 400 - Invalid title or address format
   * @returns {Error} 500 - Server error
   */
  router.post(
    "/",
    validateRequest(createBloqSchema),
    bloqController.createBloq.bind(bloqController)
  );

  /**
   * Retrieves a specific bloq by ID
   * @route GET /api/bloqs/:id
   * @param {string} id.path.required - The ID of the bloq to retrieve
   * @returns {Object} 200 - Bloq object with associated lockers
   * @returns {Error} 404 - Bloq not found
   * @returns {Error} 400 - Invalid bloq ID format
   * @returns {Error} 500 - Server error
   */
  router.get(
    "/:id",
    validateRequest(getBloqSchema),
    bloqController.getBloqById.bind(bloqController)
  );

  /**
   * Updates a bloq's title and address
   * @route PUT /api/bloqs/:id
   * @param {string} id.path.required - The ID of the bloq to update
   * @param {string} title.body.required - The new title
   * @param {string} address.body.required - The new address
   * @returns {Object} 200 - Updated bloq object
   * @returns {Error} 404 - Bloq not found
   * @returns {Error} 400 - Invalid bloq ID format or invalid title/address
   * @returns {Error} 500 - Server error
   */
  router.put(
    "/:id",
    validateRequest(updateBloqSchema),
    bloqController.updateBloq.bind(bloqController)
  );

  /**
   * Deletes a bloq by ID
   * @route DELETE /api/bloqs/:id
   * @param {string} id.path.required - The ID of the bloq to delete
   * @returns {Object} 200 - Success message
   * @returns {Error} 404 - Bloq not found
   * @returns {Error} 400 - Invalid bloq ID format
   * @returns {Error} 500 - Server error
   */
  router.delete(
    "/:id",
    validateRequest(getBloqSchema),
    bloqController.deleteBloq.bind(bloqController)
  );

  /**
   * Retrieves all bloqs
   * @route GET /api/bloqs
   * @returns {Array} 200 - Array of bloq objects
   * @returns {Error} 500 - Server error
   */
  router.get("/", bloqController.getAllBloqs.bind(bloqController));

  /**
   * Associates a locker with a bloq
   * @route POST /api/bloqs/:id/lockers
   * @param {string} id.path.required - The ID of the bloq
   * @param {string} lockerId.body.required - The ID of the locker to associate
   * @returns {Object} 200 - Updated bloq object with new locker
   * @returns {Error} 404 - Bloq or locker not found
   * @returns {Error} 400 - Invalid bloq ID or locker ID format
   * @returns {Error} 500 - Server error
   */
  router.post(
    "/:id/lockers",
    validateRequest(addLockerToBloqSchema),
    bloqController.addLockerToBloq.bind(bloqController)
  );

  return router;
};
