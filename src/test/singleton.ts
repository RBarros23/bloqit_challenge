import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { jest } from "@jest/globals";

import { prisma } from "../utils/prisma/prisma.js";

let prismaMock: DeepMockProxy<PrismaClient>;

beforeEach(() => {
  prismaMock = mockDeep<PrismaClient>();
});

export { prismaMock };
