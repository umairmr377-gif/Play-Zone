import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.court.deleteMany();
  await prisma.sport.deleteMany();

  // Create Sports with Courts
  const football = await prisma.sport.create({
    data: {
      name: "Football",
      description: "Book a professional football court for your match. Our courts feature high-quality turf and professional lighting.",
      image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
      courts: {
        create: [
          {
            name: "Football Court A",
            location: "Building 1, Ground Floor",
            pricePerHour: 50,
            image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
          },
          {
            name: "Football Court B",
            location: "Building 1, Ground Floor",
            pricePerHour: 50,
            image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
          },
          {
            name: "Football Court C",
            location: "Building 2, Ground Floor",
            pricePerHour: 60,
            image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop",
          },
        ],
      },
    },
  });

  const paddle = await prisma.sport.create({
    data: {
      name: "Paddle Tennis",
      description: "Experience the excitement of paddle tennis on our premium courts. Perfect for singles or doubles matches.",
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431f7?w=800&h=600&fit=crop",
      courts: {
        create: [
          {
            name: "Paddle Court 1",
            location: "Building 1, First Floor",
            pricePerHour: 40,
            image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431f7?w=800&h=600&fit=crop",
          },
          {
            name: "Paddle Court 2",
            location: "Building 1, First Floor",
            pricePerHour: 40,
            image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431f7?w=800&h=600&fit=crop",
          },
          {
            name: "Paddle Court 3",
            location: "Building 2, First Floor",
            pricePerHour: 45,
            image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431f7?w=800&h=600&fit=crop",
          },
        ],
      },
    },
  });

  const cricket = await prisma.sport.create({
    data: {
      name: "Cricket",
      description: "Practice your cricket skills on our indoor cricket nets. Professional-grade facilities for batting and bowling practice.",
      image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop",
      courts: {
        create: [
          {
            name: "Cricket Net A",
            location: "Building 1, Basement",
            pricePerHour: 35,
            image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop",
          },
          {
            name: "Cricket Net B",
            location: "Building 1, Basement",
            pricePerHour: 35,
            image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop",
          },
          {
            name: "Cricket Net C",
            location: "Building 2, Basement",
            pricePerHour: 40,
            image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop",
          },
        ],
      },
    },
  });

  const tennis = await prisma.sport.create({
    data: {
      name: "Tennis",
      description: "Play tennis on our well-maintained indoor courts. Climate-controlled environment for year-round play.",
      image: "https://images.unsplash.com/photo-1622163642992-85870d6c6c0a?w=800&h=600&fit=crop",
      courts: {
        create: [
          {
            name: "Tennis Court 1",
            location: "Building 1, Second Floor",
            pricePerHour: 55,
            image: "https://images.unsplash.com/photo-1622163642992-85870d6c6c0a?w=800&h=600&fit=crop",
          },
          {
            name: "Tennis Court 2",
            location: "Building 1, Second Floor",
            pricePerHour: 55,
            image: "https://images.unsplash.com/photo-1622163642992-85870d6c6c0a?w=800&h=600&fit=crop",
          },
        ],
      },
    },
  });

  const badminton = await prisma.sport.create({
    data: {
      name: "Badminton",
      description: "Enjoy fast-paced badminton matches on our professional courts. High-quality flooring and lighting for optimal play.",
      image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
      courts: {
        create: [
          {
            name: "Badminton Court 1",
            location: "Building 1, First Floor",
            pricePerHour: 30,
            image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
          },
          {
            name: "Badminton Court 2",
            location: "Building 1, First Floor",
            pricePerHour: 30,
            image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
          },
          {
            name: "Badminton Court 3",
            location: "Building 2, First Floor",
            pricePerHour: 35,
            image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded sports:", {
    football: football.id,
    paddle: paddle.id,
    cricket: cricket.id,
    tennis: tennis.id,
    badminton: badminton.id,
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

