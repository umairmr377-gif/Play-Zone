import { Sport } from "./types";

/**
 * Generate time slots from 6 AM to 11 PM
 * Returns array of time strings in "HH:MM" format
 */
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/**
 * Sports data with courts and time slots
 */
export const sports: Sport[] = [
  {
    id: "football",
    name: "Football",
    description: "Book a professional football court for your match. Our courts feature high-quality turf and professional lighting for the best playing experience.",
    image: "/images/football.jpg",
    courts: [
      {
        id: "football-1",
        name: "Football Court A",
        location: "Building 1, Ground Floor",
        pricePerHour: 50,
        image: "/images/football-court-1.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
      {
        id: "football-2",
        name: "Football Court B",
        location: "Building 1, Ground Floor",
        pricePerHour: 50,
        image: "/images/football-court-2.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
      {
        id: "football-3",
        name: "Football Court C",
        location: "Building 2, Ground Floor",
        pricePerHour: 60,
        image: "/images/football-court-3.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
    ],
  },
  {
    id: "cricket",
    name: "Cricket",
    description: "Practice your cricket skills on our indoor cricket nets. Professional-grade facilities for batting and bowling practice with automated bowling machines available.",
    image: "/images/cricket.jpg",
    courts: [
      {
        id: "cricket-1",
        name: "Cricket Net A",
        location: "Building 1, Basement",
        pricePerHour: 35,
        image: "/images/cricket-net-1.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
      {
        id: "cricket-2",
        name: "Cricket Net B",
        location: "Building 1, Basement",
        pricePerHour: 35,
        image: "/images/cricket-net-2.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
      {
        id: "cricket-3",
        name: "Cricket Net C",
        location: "Building 2, Basement",
        pricePerHour: 40,
        image: "/images/cricket-net-3.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
    ],
  },
  {
    id: "paddle",
    name: "Paddle Tennis",
    description: "Experience the excitement of paddle tennis on our premium courts. Perfect for singles or doubles matches with climate-controlled environment.",
    image: "/images/padel.jpg",
    courts: [
      {
        id: "paddle-1",
        name: "Paddle Court 1",
        location: "Building 1, First Floor",
        pricePerHour: 40,
        image: "/images/padel-court-1.jpeg",
        availableTimeSlots: generateTimeSlots(),
      },
      {
        id: "paddle-2",
        name: "Paddle Court 2",
        location: "Building 1, First Floor",
        pricePerHour: 40,
        image: "/images/padel-court-2.jpeg",
        availableTimeSlots: generateTimeSlots(),
      },
      {
        id: "paddle-3",
        name: "Paddle Court 3",
        location: "Building 2, First Floor",
        pricePerHour: 45,
        image: "/images/padel-court-3.jpg",
        availableTimeSlots: generateTimeSlots(),
      },
    ],
  },
];

/**
 * Helper function to get sport by ID
 */
export function getSportById(id: string): Sport | undefined {
  return sports.find((sport) => sport.id === id);
}

/**
 * Helper function to get court by ID
 */
export function getCourtById(sportId: string, courtId: string) {
  const sport = getSportById(sportId);
  return sport?.courts.find((court) => court.id === courtId);
}

/**
 * Helper function to get all courts
 */
export function getAllCourts() {
  return sports.flatMap((sport) =>
    sport.courts.map((court) => ({
      ...court,
      sportId: sport.id,
      sportName: sport.name,
    }))
  );
}
