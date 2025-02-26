import express, { Request, Response } from "express";
import { prisma } from "./utils/prisma/prisma.js";
import { BloqService } from "./services/bloqService.js";
import { BloqController } from "./controllers/bloqController.js";
import { createBloqRouter } from "./routes/bloqRoutes.js";
import { LockerService } from "./services/lockerService.js";
import { LockerController } from "./controllers/lockerController.js";
import { createLockerRouter } from "./routes/lockerRoutes.js";
import { RentService } from "./services/rentService.js";
import { RentController } from "./controllers/rentController.js";
import { createRentRouter } from "./routes/rentRoutes.js";

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const bloqService = new BloqService(prisma);
const bloqController = new BloqController(bloqService);
const bloqRouter = createBloqRouter(bloqController);

const lockerService = new LockerService(prisma);
const lockerController = new LockerController(lockerService);
const lockerRouter = createLockerRouter(lockerController);

const rentService = new RentService(prisma);
const rentController = new RentController(rentService);
const rentRouter = createRentRouter(rentController);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from docker!");
});

app.use("/api/bloqs", bloqRouter);
app.use("/api/lockers", lockerRouter);
app.use("/api/rents", rentRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
