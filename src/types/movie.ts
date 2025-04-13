
export interface Movie {
  id: string;
  title: string;
  director: string | null;
  year: number;
  rating: number;
  poster: string | null;
  description: string | null;
}
