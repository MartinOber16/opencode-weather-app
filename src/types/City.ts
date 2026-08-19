export interface City {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface Settings {
  defaultCity: string;
  unit: "C" | "F";
  cities: City[];
}
