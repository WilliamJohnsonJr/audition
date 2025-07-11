import type { Movie } from "../../models/movie";
import { BaseUrlContext } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import { useParams, useNavigate } from "react-router";
import { ActorCard } from "../actors/ActorCard";
import type { Actor } from "../../models/actor";
import { MovieCard } from "./MovieCard";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";

export function ViewMovie() {
  const baseUrl = useContext(BaseUrlContext);
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { getAccessTokenSilently } = useAuth0();

  const { data, refresh, error, isLoading } = useDataLoader<{
    movie?: Movie;
    success: boolean;
  }>(`${baseUrl}/movies/${movieId}`, {
    movie: undefined,
    success: true,
  });

  async function deleteMovie(id: number) {
    try {
      const accessToken = await getAccessTokenSilently();
      const res = await fetchWithAuth(accessToken, `${baseUrl}/movies/${id}`, {
        method: "DELETE",
      });
      if (res.ok && res.status < 400) {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
        navigate("/movies");
      } else {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
      }
    } catch {
      setSnackbarMessage("Error occurred - please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function unassignCasting(actorId: number) {
    setSubmitting(true);
    try {
      const accessToken = await getAccessTokenSilently();
      const res = await fetchWithAuth(
        accessToken,
        `${baseUrl}/casts/movies/${movieId}/actors/${actorId}`,
        { method: "DELETE" },
      );
      setSnackbarMessage(`${res.status}: ${res.statusText}`);
      if (res.status < 400) {
        refresh();
      }
    } catch {
      setSnackbarMessage("Error occurred - please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSnackbarMessage("");
  }

  useEffect(() => {
    if (error?.message?.includes("404")) {
      navigate("/not-found");
    }
    if (error?.message) {
      setSnackbarMessage(error.message);
    }
  }, [error]);

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
      {isLoading ? (
        <>
          <Box
            sx={{ display: "flex", justifyContent: "center", height: "90vh" }}
          >
            <CircularProgress />
          </Box>
        </>
      ) : data.movie ? (
        <>
          <Typography
            variant="h1"
            color="primary.main"
            className="my-5 border-2 rounded-xl"
          >
            {data.movie.title}
          </Typography>
          <div className="flex justify-center">
            <MovieCard movie={data.movie} deleteMovie={deleteMovie} />
          </div>
          <div>
            <Typography
              variant="h2"
              color="secondary.main"
              className="my-5 border-2 rounded-xl"
            >
              Cast
            </Typography>
            <ul className="list-none">
              {data.movie?.actors.length
                ? data.movie?.actors.map((actor: Omit<Actor, "movies">) => (
                    <li className="inline-flex mb-10 mx-2" key={actor.id}>
                      <ActorCard
                        actor={actor}
                        unassignCasting={unassignCasting}
                        submitting={submitting}
                      />
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
