import { LockerController } from "../../controllers/lockerController.js";
import { LockerService } from "../../services/lockerService.js";
import { testPrismaInstance } from "../config/testConfig.js";
import { LockerStatus } from "@prisma/client";
import request from "supertest";
import express from "express";
import { createLockerRouter } from "../../routes/lockerRoutes.js";
import { createBloqRouter } from "../../routes/bloqRoutes.js";
import { BloqController } from "../../controllers/bloqController.js";
import { BloqService } from "../../services/bloqService.js";

const app = express();
app.use(express.json());

const testPrisma = testPrismaInstance(
  process.env.DATABASE_TEST_LOCKER_URL as string
);
const lockerService = new LockerService(testPrisma);
const lockerController = new LockerController(lockerService);
app.use("/api/lockers", createLockerRouter(lockerController));

const bloqService = new BloqService(testPrisma);
const bloqController = new BloqController(bloqService);
app.use("/api/bloqs", createBloqRouter(bloqController));

describe("Locker Integration Tests", () => {
  beforeEach(async () => {
    await testPrisma.rent.deleteMany();
    await testPrisma.locker.deleteMany();
    await testPrisma.bloq.deleteMany();
  });

  afterAll(async () => {
    await testPrisma.$disconnect();
  });

  describe("Service + Database Integration", () => {
    it("should create and retrieve a locker", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const response = await request(app).post(
        `/api/lockers/bloq/${bloq.body.id}`
      );
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.bloqId).toBe(bloq.body.id);
      expect(response.body.status).toBe(LockerStatus.CLOSED);
      expect(response.body.isOccupied).toBeFalsy();
    });

    it("should update locker status", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await lockerService.createLockerService(bloq.body.id);
      const updated = await lockerService.updateStatusLockerService(
        locker.id,
        LockerStatus.OPEN
      );

      expect(updated.status).toBe(LockerStatus.OPEN);
    });
  });

  describe("API Endpoint Integration", () => {
    it("should create locker through API", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const response = await request(app).post(
        `/api/lockers/bloq/${bloq.body.id}`
      );
      expect(response.status).toBe(201);
      expect(response.body.bloqId).toBe(bloq.body.id);
      expect(response.body.status).toBe(LockerStatus.CLOSED);
    });

    it("should get lockers by bloq ID through API", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      await lockerService.createLockerService(bloq.body.id);
      await lockerService.createLockerService(bloq.body.id);

      const response = await request(app).get(
        `/api/lockers/bloq/${bloq.body.id}`
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].bloqId).toBe(bloq.body.id);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid bloq ID when creating locker", async () => {
      const response = await request(app).post(`/api/lockers/bloq/invalid-id`);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
    it("should handle non-existent bloq ID when creating locker", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const response = await request(app).post(
        `/api/lockers/bloq/${nonExistentId}`
      );
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
    it("should handle invalid status when updating locker", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await lockerService.createLockerService(bloq.body.id);
      const response = await request(app)
        .put(`/api/lockers/${locker.id}/status`)
        .send({ status: "INVALID_STATUS" });
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("Occupation Status Operations", () => {
    it("should update locker occupation status through API", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await lockerService.createLockerService(bloq.body.id);
      const response = await request(app)
        .put(`/api/lockers/${locker.id}/occupy`)
        .send({ isOccupied: true });
      expect(response.status).toBe(200);
      expect(response.body.isOccupied).toBe(true);
    });

    it("should get locker occupation status through API", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await lockerService.createLockerService(bloq.body.id);
      await lockerService.occupyLockerService(locker.id, true);
      const response = await request(app).get(
        `/api/lockers/${locker.id}/is-occupied`
      );
      expect(response.status).toBe(200);
      expect(response.body).toBe(true);
    });
  });

  describe("Rent Association Operations", () => {
    it("should get rents for a locker through API", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await lockerService.createLockerService(bloq.body.id);
      const response = await request(app).get(
        `/api/lockers/${locker.id}/rents`
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
    it("should handle non-existent locker when getting rents", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const response = await request(app).get(
        `/api/lockers/${nonExistentId}/rents`
      );
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("Deletion Operations", () => {
    it("should delete locker through API", async () => {
      const bloq = await request(app).post("/api/bloqs/").send({
        title: "Test Bloq",
        address: "123 Test St",
      });

      const locker = await lockerService.createLockerService(bloq.body.id);
      const response = await request(app).delete(`/api/lockers/${locker.id}`);
      expect(response.status).toBe(200);

      const getResponse = await request(app).get(`/api/lockers/${locker.id}`);
      expect(getResponse.status).toBe(404);
    });

    it("should handle deletion of non-existent locker", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174999";
      const response = await request(app).delete(
        `/api/lockers/${nonExistentId}`
      );
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });
  });
});
