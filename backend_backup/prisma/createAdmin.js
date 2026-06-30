require("dotenv").config({
  path: require("path").join(__dirname, "../.env"),
});

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {

  const email = "admin@sarangi.com";

  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    console.log("✅ Admin already exists.");
    return;
  }

  const password = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      name: "RC Sarangi",
      email,
      password,
      role: "admin",
      is_verified: true
    }
  });

  console.log("🎉 Admin Created");
  console.log("-------------------------");
  console.log("Email :", email);
  console.log("Password : admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());