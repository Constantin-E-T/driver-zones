export interface Zone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
  notes?: string;
  createdAt: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
}
