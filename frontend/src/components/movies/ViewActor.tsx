import Button from "@mui/material/Button";
import { baseUrl } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import Skeleton from "@mui/material/Skeleton";
import { useParams, useNavigate } from "react-router";
import { ActorCard } from "./ActorCard";
import type { Actor } from "../../models/actor";
import type { Movie } from "../../models/movie";
import { MovieCard } from "./MovieCard";

export default function ViewActor() {
  const { actorId } = useParams();
  const navigate = useNavigate();

  const { data, refresh, errors, isLoading } = useDataLoader<{
    actor?: Actor;
    success: boolean;
  }>(`${baseUrl}/actors/${actorId}`, {
    actor: undefined,
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
        <h2>{data.actor?.name}</h2>
      </div>
      {isLoading ? (
        <>
          <Skeleton variant="rounded" width={350} height={700} />
        </>
      ) : data.actor ? (
        <>
          <div className="flex justify-center">
            <ActorCard actor={data.actor} />
          </div>
          <h2>Movies:</h2>
          <ul className="list-none">
            {data.actor?.movies.length
              ? data.actor?.movies.map((movie: Omit<Movie, "actors">) => (
                  <li className="inline-flex mb-10 mx-2" key={movie.id}>
                    <MovieCard movie={movie} />
                  </li>
                ))
              : "No Movies Assigned"}
          </ul>
        </>
      ) : (
        "No actor found"
      )}
    </>
  );
}
