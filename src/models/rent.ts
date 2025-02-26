import { RentStatus, RentSize } from "@prisma/client";

// export type Rent = {
//   id: String;
//   lockerId: string;
//   weight: number;
//   size: RentSize;
//   status: RentStatus;
// };

export class RentClass {
  public id: string;
  public lockerId: string;
  public weight: number;
  public size: RentSize;
  public status: RentStatus;
  public droppedOffAt?: Date;
  public pickedUpAt?: Date;

  constructor(
    id: string,
    lockerId: string,
    weight: number,
    size: RentSize,
    status: RentStatus,
    droppedOffAt?: Date,
    pickedUpAt?: Date
  ) {
    this.id = id;
    this.lockerId = lockerId;
    this.weight = weight;
    this.size = size;
    this.status = status;
    this.droppedOffAt = droppedOffAt;
    this.pickedUpAt = pickedUpAt;
  }

  /**
   * Marks the rent as ready for drop-off
   * @throws Error if status transition is invalid
   */
  public markForDropoff(): void {
    if (this.status !== RentStatus.CREATED) {
      throw new Error("Can only mark for dropoff from CREATED status");
    }
    this.status = RentStatus.WAITING_DROPOFF;
  }

  /**
   * Records a parcel drop-off
   * @throws Error if status transition is invalid
   */
  public recordDropoff(): void {
    if (this.status !== RentStatus.WAITING_DROPOFF) {
      throw new Error("Can only record dropoff when waiting for dropoff");
    }
    this.status = RentStatus.WAITING_PICKUP;
    this.droppedOffAt = new Date();
  }

  /**
   * Records a parcel pickup
   * @throws Error if status transition is invalid
   */
  public recordPickup(): void {
    if (this.status !== RentStatus.WAITING_PICKUP) {
      throw new Error("Can only record pickup when waiting for pickup");
    }
    this.status = RentStatus.DELIVERED;
    this.pickedUpAt = new Date();
  }

  /**
   * Checks if the rent is in a specific status
   * @param status The status to check against
   * @returns boolean indicating if the rent is in the specified status
   */
  public isInStatus(status: RentStatus): boolean {
    return this.status === status;
  }

  /**
   * Checks if the rent has been dropped off
   * @returns boolean indicating if the rent has been dropped off
   */
  public isDroppedOff(): boolean {
    return this.droppedOffAt !== undefined;
  }

  /**
   * Checks if the rent has been picked up
   * @returns boolean indicating if the rent has been picked up
   */
  public isPickedUp(): boolean {
    return this.pickedUpAt !== undefined;
  }

  /**
   * Gets the duration since drop-off in milliseconds
   * @returns number of milliseconds since drop-off, or undefined if not dropped off
   */
  public getDropoffDuration(): number | undefined {
    if (!this.droppedOffAt) return undefined;
    return Date.now() - this.droppedOffAt.getTime();
  }

  /**
   * Gets the total rental duration in milliseconds
   * @returns number of milliseconds between drop-off and pickup, or undefined if not completed
   */
  public getTotalDuration(): number | undefined {
    if (!this.droppedOffAt || !this.pickedUpAt) return undefined;
    return this.pickedUpAt.getTime() - this.droppedOffAt.getTime();
  }
}
