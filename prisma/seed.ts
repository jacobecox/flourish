import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { DEV_USER_ID } from "../lib/dev-user";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: {
      id: DEV_USER_ID,
      email: "dev@flourish.local",
      name: "Dev Baker",
    },
  });
  console.log("Seeded dev user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
