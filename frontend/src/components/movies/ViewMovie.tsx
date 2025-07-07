import Button from "@mui/material/Button";
import type { Movie } from "../../models/movie";
import { baseUrl } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import Skeleton from "@mui/material/Skeleton";
import { useParams, useNavigate } from "react-router";
import { ActorCard } from "./ActorCard";
import type { Actor } from "../../models/actor";
import { MovieCard } from "./MovieCard";

export default function ViewMovie() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const { data, refresh, errors, isLoading } = useDataLoader<{
    movie?: Movie;
    success: boolean;
  }>(`${baseUrl}/movies/${movieId}`, {
    movie: undefined,
    success: true,
  });

  return (
    <>
      <div className="flex-auto justify-center mb-5">
        <Button type="button" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <div className="flex-auto justify-center mb-5">
        <h2>{data.movie?.title}</h2>
      </div>
      {isLoading ? (
        <>
          <Skeleton variant="rounded" width={350} height={700} />
        </>
      ) : data.movie ? (
        <>
          <div className="flex justify-center">
            <MovieCard movie={data.movie} />
          </div>
          <div>
            <h2>Cast:</h2>
            <ul className="list-none">
              {data.movie?.actors.length
                ? data.movie?.actors.map((actor: Omit<Actor, "movies">) => (
                    <li className="inline-flex mb-10 mx-2" key={actor.id}>
                      <ActorCard actor={actor} />
                    </li>
                  ))
                : "No Cast Assigned"}
            </ul>
          </div>
        </>
      ) : (
        "No movie found"
      )}
    </>
  );
}
