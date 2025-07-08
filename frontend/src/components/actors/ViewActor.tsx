import Button from "@mui/material/Button";
import { baseUrl } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import Skeleton from "@mui/material/Skeleton";
import { useParams, useNavigate } from "react-router";
import { ActorCard } from "../actors/ActorCard";
import type { Actor } from "../../models/actor";
import type { Movie } from "../../models/movie";
import { MovieCard } from "../movies/MovieCard";
import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

export default function ViewActor() {
  const { actorId } = useParams();
  const navigate = useNavigate();
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { data, error, isLoading } = useDataLoader<{
    actor?: Actor;
    success: boolean;
  }>(`${baseUrl}/actors/${actorId}`, {
    actor: undefined,
    success: true,
  });

  async function deleteActor(id: number) {
    try {
      const res = await fetch(`${baseUrl}/movies/${id}`, { method: "DELETE" });
      if (res.ok && res.status < 400) {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
        navigate("/movies");
      } else {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
      }
    } catch {
      setSnackbarMessage("Error occurred - please try again.");
    }
  }

  useEffect(() => {
    if (error?.message?.includes("404")) {
      navigate("/not-found");
    }
    if (error?.message) {
      setSnackbarMessage(error.message);
    }
  }, [error]);

  function handleClose() {
    setSnackbarMessage("");
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={!!snackbarMessage}
        onClose={handleClose}
        message={snackbarMessage}
      >
        {snackbarMessage.includes("200") ? (
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        ) : (
          <Alert
            onClose={handleClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        )}
      </Snackbar>
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
            <ActorCard actor={data.actor} deleteActor={deleteActor} />
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
