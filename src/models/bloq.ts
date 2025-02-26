import { LockerClass } from "./locker.js";

export class BloqClass {
  public id: string;
  public title: string;
  public address: string;
  public lockers: LockerClass[];

  constructor(
    id: string,
    title: string,
    address: string,
    lockers: LockerClass[] = []
  ) {
    this.id = id;
    this.title = title;
    this.address = address;
    this.lockers = lockers;
  }

  public updateTitle(title: string): void {
    this.title = title;
  }

  public updateAddress(address: string): void {
    this.address = address;
  }

  public addLocker(locker: LockerClass): void {
    this.lockers.push(locker);
  }

  public removeLocker(lockerId: string): void {
    this.lockers = this.lockers.filter((locker) => locker.id !== lockerId);
  }

  public getLockers(): LockerClass[] {
    return this.lockers;
  }
}
