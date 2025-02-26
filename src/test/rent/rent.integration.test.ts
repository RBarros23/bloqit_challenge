import { RentController } from "../../controllers/rentController.js";
import { LockerController } from "../../controllers/lockerController.js";
import { BloqController } from "../../controllers/bloqController.js";
import { RentService } from "../../services/rentService.js";
import { LockerService } from "../../services/lockerService.js";
import { BloqService } from "../../services/bloqService.js";
import { testPrismaInstance } from "../config/testConfig.js";
import { RentStatus, RentSize, LockerStatus } from "@prisma/client";
import request from "supertest";
import express from "express";
import { createRentRouter } from "../../routes/rentRoutes.js";
import { createLockerRouter } from "../../routes/lockerRoutes.js";
import { createBloqRouter } from "../../routes/bloqRoutes.js";

const app = express();
app.use(express.json());

const testPrisma = testPrismaInstance(
  process.env.DATABASE_TEST_RENT_URL as string
);

// Initialize services
const rentService = new RentService(testPrisma);
const lockerService = new LockerService(testPrisma);
const bloqService = new BloqService(testPrisma);

// Initialize controllers
const rentController = new RentController(rentService);
const lockerController = new LockerController(lockerService);
const bloqController = new BloqController(bloqService);

// Set up routes
app.use("/api/rents", createRentRouter(rentController));
app.use("/api/lockers", createLockerRouter(lockerController));
app.use("/api/bloqs", createBloqRouter(bloqController));

// Helper function to create test data
async function createTestRent() {
  // Create a bloq
  const bloq = await request(app).post("/api/bloqs").send({
    title: "Test Bloq",
    address: "123 Test St",
  });

  // Create a locker
  const locker = await request(app).post(`/api/lockers/bloq/${bloq.body.id}`);

  // Create a rent
  const rent = await request(app)
    .post(`/api/rents/locker/${locker.body.id}`)
    .send({
      weight: 5.5,
      size: RentSize.M,
    });

  return rent;
}

describe("Rent Integration Tests", () => {
  beforeEach(async () => {
    await testPrisma.rent.deleteMany();
    await testPrisma.locker.deleteMany();
    await testPrisma.bloq.deleteMany();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe("Service + Database Integration", () => {
    it("should create and retrieve a rent", async () => {
      // Create a bloq and locker first
      const bloq = await request(app).post("/api/bloqs").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await request(app).post(
        `/api/lockers/bloq/${bloq.body.id}`
      );

      // Create a rent
      const response = await request(app)
        .post(`/api/rents/locker/${locker.body.id}`)
        .send({
          weight: 5.5,
          size: RentSize.M,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.lockerId).toBe(locker.body.id);
      expect(response.body.status).toBe(RentStatus.CREATED);

      // Verify rent was created in database
      const rent = await testPrisma.rent.findUnique({
        where: { id: response.body.id },
      });
      expect(rent).not.toBeNull();
      expect(rent?.weight).toBe(5.5);
    });

    it("should handle rent status updates", async () => {
      // Create initial test data using helper
      const rent = await createTestRent();

      // Test dropoff
      const dropoffResponse = await request(app)
        .put(`/api/rents/${rent.body.id}/dropoff`)
        .send();

      expect(dropoffResponse.status).toBe(200);
      expect(dropoffResponse.body.status).toBe(RentStatus.WAITING_PICKUP);
      expect(dropoffResponse.body.droppedOffAt).not.toBeNull();

      // Test pickup
      const pickupResponse = await request(app)
        .put(`/api/rents/${rent.body.id}/pickup`)
        .send();

      expect(pickupResponse.status).toBe(200);
      expect(pickupResponse.body.status).toBe(RentStatus.DELIVERED);
      expect(pickupResponse.body.pickedUpAt).not.toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle creation with non-existent locker", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const response = await request(app)
        .post(`/api/rents/locker/${nonExistentId}`)
        .send({
          weight: 5.5,
          size: RentSize.M,
        });
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
    it("should handle creation with occupied locker", async () => {
      // Create initial test data using helper
      const firstRent = await createTestRent();

      // Try to create second rent with same locker
      const response = await request(app)
        .post(`/api/rents/locker/${firstRent.body.lockerId}`)
        .send({
          weight: 6.5,
          size: RentSize.L,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Locker is already occupied");
    });
  });

  describe("Validation Tests", () => {
    it("should handle invalid weight", async () => {
      const bloq = await request(app).post("/api/bloqs").send({
        title: "Test Bloq",
        address: "123 Test St",
      });
      const locker = await request(app).post(
        `/api/lockers/bloq/${bloq.body.id}`
      );

      const response = await request(app)
        .post(`/api/rents/locker/${locker.body.id}`)
        .send({
          weight: -5,
          size: RentSize.M,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should handle invalid size enum", async () => {
      const bloq = await request(app).post("/api/bloqs").send({
        title: "Test Bloq",
        address: "123 Test St",
      });
      const locker = await request(app).post(
        `/api/lockers/bloq/${bloq.body.id}`
      );

      const response = await request(app)
        .post(`/api/rents/locker/${locker.body.id}`)
        .send({
          weight: 5,
          size: "INVALID_SIZE",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET Endpoints", () => {
    it("should get rent by ID", async () => {
      // Create test data first
      const rent = await createTestRent();

      const response = await request(app).get(`/api/rents/${rent.body.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(rent.body.id);
    });

    it("should return 404 for non-existent rent", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const response = await request(app).get(`/api/rents/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Rent not found");
    });
  });
});
