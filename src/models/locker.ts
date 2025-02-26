export { LockerClass };
import { RentClass } from "./rent.js";
import { LockerStatus } from "@prisma/client";

class LockerClass {
  public id: string;
  public bloqId: string;
  public status: LockerStatus;
  public isOccupied: boolean;
  public rent?: RentClass;

  constructor(
    id: string,
    bloqId: string,
    status: LockerStatus,
    isOccupied: boolean,
    rent?: RentClass
  ) {
    this.id = id;
    this.bloqId = bloqId;
    this.status = status;
    this.isOccupied = isOccupied;
    this.rent = rent;
  }

  public open(): void {
    this.status = LockerStatus.OPEN;
  }

  public close(): void {
    this.status = LockerStatus.CLOSED;
  }

  public occupy(): void {
    this.isOccupied = true;
  }

  public vacate(): void {
    this.isOccupied = false;
  }

  public addRent(rent: RentClass): void {
    if (!this.rent) {
      this.rent = rent;
    }
  }

  public removeRent(): void {
    this.rent = undefined;
  }
}
