import type { Gender } from "./gender";
import type { Movie } from "./movie";

export interface Actor {
  age: number; // 30
  gender?: Gender;
  id: number; // 1
  movies: Movie[];
  name: string; // John Doe,
  photoUrl?: string; // https://example.example
}

export type ActorOnly = Omit<Actor, "movies">;
