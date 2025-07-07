import type { Actor } from "./actor";
import type { Genre } from "./genre";

export interface Movie {
  actors: Omit<Actor, 'movies'>[];
  genre: Genre;
  id: number;
  posterUrl?: string; // https://example.example,
  releaseDate?: string; // e.g. 1939-08-25
  title: string;
}

export type MovieOnly = Omit<Movie, 'actors'>;