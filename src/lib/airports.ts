export type Airport = {
  name: string;
  iata: string;
  city: string;
  country: string;
};

export const AIRPORTS: Airport[] = [
  { name: "Indira Gandhi International Airport", iata: "DEL", city: "New Delhi", country: "India" },
  { name: "Chhatrapati Shivaji Maharaj International Airport", iata: "BOM", city: "Mumbai", country: "India" },
  { name: "Kempegowda International Airport", iata: "BLR", city: "Bengaluru", country: "India" },
  { name: "Rajiv Gandhi International Airport", iata: "HYD", city: "Hyderabad", country: "India" },
  { name: "Chennai International Airport", iata: "MAA", city: "Chennai", country: "India" },
  { name: "Netaji Subhas Chandra Bose International Airport", iata: "CCU", city: "Kolkata", country: "India" },
  { name: "Cochin International Airport", iata: "COK", city: "Kochi", country: "India" },
  { name: "Goa Dabolim Airport", iata: "GOI", city: "Goa", country: "India" },
  { name: "Manohar International Airport", iata: "GOX", city: "North Goa", country: "India" },
  { name: "Sardar Vallabhbhai Patel International Airport", iata: "AMD", city: "Ahmedabad", country: "India" },
  { name: "Pune Airport", iata: "PNQ", city: "Pune", country: "India" },
  { name: "Jaipur International Airport", iata: "JAI", city: "Jaipur", country: "India" },
  { name: "Trivandrum International Airport", iata: "TRV", city: "Thiruvananthapuram", country: "India" },
  { name: "Sri Guru Ram Dass Jee International Airport", iata: "ATQ", city: "Amritsar", country: "India" },
  { name: "Lucknow Airport", iata: "LKO", city: "Lucknow", country: "India" },
  { name: "Sheikh ul-Alam International Airport", iata: "SXR", city: "Srinagar", country: "India" },
  { name: "Dubai International Airport", iata: "DXB", city: "Dubai", country: "UAE" },
  { name: "Al Maktoum International Airport", iata: "DWC", city: "Dubai", country: "UAE" },
  { name: "Abu Dhabi International Airport", iata: "AUH", city: "Abu Dhabi", country: "UAE" },
  { name: "Hamad International Airport", iata: "DOH", city: "Doha", country: "Qatar" },
  { name: "King Abdulaziz International Airport", iata: "JED", city: "Jeddah", country: "Saudi Arabia" },
  { name: "King Khalid International Airport", iata: "RUH", city: "Riyadh", country: "Saudi Arabia" },
  { name: "Kuwait International Airport", iata: "KWI", city: "Kuwait City", country: "Kuwait" },
  { name: "Muscat International Airport", iata: "MCT", city: "Muscat", country: "Oman" },
  { name: "Bahrain International Airport", iata: "BAH", city: "Manama", country: "Bahrain" },
  { name: "London Heathrow Airport", iata: "LHR", city: "London", country: "United Kingdom" },
  { name: "London Gatwick Airport", iata: "LGW", city: "London", country: "United Kingdom" },
  { name: "Manchester Airport", iata: "MAN", city: "Manchester", country: "United Kingdom" },
  { name: "Paris Charles de Gaulle Airport", iata: "CDG", city: "Paris", country: "France" },
  { name: "Frankfurt Airport", iata: "FRA", city: "Frankfurt", country: "Germany" },
  { name: "Amsterdam Schiphol Airport", iata: "AMS", city: "Amsterdam", country: "Netherlands" },
  { name: "Zurich Airport", iata: "ZRH", city: "Zurich", country: "Switzerland" },
  { name: "Istanbul Airport", iata: "IST", city: "Istanbul", country: "Turkey" },
  { name: "Heydar Aliyev International Airport", iata: "GYD", city: "Baku", country: "Azerbaijan" },
  { name: "Singapore Changi Airport", iata: "SIN", city: "Singapore", country: "Singapore" },
  { name: "Kuala Lumpur International Airport", iata: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  { name: "Suvarnabhumi Airport", iata: "BKK", city: "Bangkok", country: "Thailand" },
  { name: "Don Mueang International Airport", iata: "DMK", city: "Bangkok", country: "Thailand" },
  { name: "Phuket International Airport", iata: "HKT", city: "Phuket", country: "Thailand" },
  { name: "Ngurah Rai International Airport", iata: "DPS", city: "Bali", country: "Indonesia" },
  { name: "Soekarno–Hatta International Airport", iata: "CGK", city: "Jakarta", country: "Indonesia" },
  { name: "Velana International Airport", iata: "MLE", city: "Malé", country: "Maldives" },
  { name: "Tan Son Nhat International Airport", iata: "SGN", city: "Ho Chi Minh City", country: "Vietnam" },
  { name: "Noi Bai International Airport", iata: "HAN", city: "Hanoi", country: "Vietnam" },
  { name: "Hong Kong International Airport", iata: "HKG", city: "Hong Kong", country: "Hong Kong" },
  { name: "Tokyo Haneda Airport", iata: "HND", city: "Tokyo", country: "Japan" },
  { name: "Narita International Airport", iata: "NRT", city: "Tokyo", country: "Japan" },
  { name: "Incheon International Airport", iata: "ICN", city: "Seoul", country: "South Korea" },
  { name: "Sydney Kingsford Smith Airport", iata: "SYD", city: "Sydney", country: "Australia" },
  { name: "Melbourne Airport", iata: "MEL", city: "Melbourne", country: "Australia" },
  { name: "John F. Kennedy International Airport", iata: "JFK", city: "New York", country: "USA" },
  { name: "Newark Liberty International Airport", iata: "EWR", city: "New York", country: "USA" },
  { name: "Los Angeles International Airport", iata: "LAX", city: "Los Angeles", country: "USA" },
  { name: "San Francisco International Airport", iata: "SFO", city: "San Francisco", country: "USA" },
  { name: "O'Hare International Airport", iata: "ORD", city: "Chicago", country: "USA" },
  { name: "Toronto Pearson International Airport", iata: "YYZ", city: "Toronto", country: "Canada" },
];

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { a: Airport; score: number }[] = [];
  for (const a of AIRPORTS) {
    const iata = a.iata.toLowerCase();
    const city = a.city.toLowerCase();
    const name = a.name.toLowerCase();
    const country = a.country.toLowerCase();
    let s = 0;
    if (iata === q) s = 100;
    else if (iata.startsWith(q)) s = 90;
    else if (city.startsWith(q)) s = 80;
    else if (name.startsWith(q)) s = 70;
    else if (city.includes(q)) s = 60;
    else if (name.includes(q)) s = 50;
    else if (country.includes(q)) s = 30;
    if (s > 0) scored.push({ a, score: s });
  }
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, limit).map((x) => x.a);
}