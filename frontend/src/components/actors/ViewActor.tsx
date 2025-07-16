import { BaseUrlContext } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import { useParams, useNavigate } from "react-router";
import { ActorCard } from "../actors/ActorCard";
import type { Actor } from "../../models/actor";
import type { Movie } from "../../models/movie";
import { MovieCard } from "../movies/MovieCard";
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

export function ViewActor() {
  const baseUrl = useContext(BaseUrlContext);
  const { actorId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { getAccessTokenSilently } = useAuth0();

  const { data, refresh, error, isLoading } = useDataLoader<{
    actor?: Actor;
    success: boolean;
  }>(`${baseUrl}/actors/${actorId}`, {
    actor: undefined,
    success: true,
  });

  async function deleteActor(id: number) {
    setSubmitting(true);
    try {
      const accessToken = await getAccessTokenSilently();
      const res = await fetchWithAuth(accessToken, `${baseUrl}/actors/${id}`, {
        method: "DELETE",
      });
      if (res.ok && res.status < 400) {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
        navigate("/actors");
      } else {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
      }
    } catch {
      setSnackbarMessage("Error occurred - please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function unassignCasting(movieId: number) {
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
      {isLoading ? (
        <>
          <Box
            sx={{ display: "flex", justifyContent: "center", height: "90vh" }}
          >
            <CircularProgress />
          </Box>
        </>
      ) : data.actor ? (
        <>
          <Typography
            variant="h1"
            color="primary.main"
            className="my-5 border-2 rounded-xl"
          >
            {data.actor.name}
          </Typography>
          <div className="flex justify-center">
            <ActorCard actor={data.actor} deleteActor={deleteActor} />
          </div>
          <Typography
            variant="h2"
            color="secondary.main"
            className="my-5 border-2 rounded-xl"
          >
            Movies
          </Typography>
          <ul className="list-none">
            {data.actor?.movies.length
              ? data.actor?.movies.map((movie: Omit<Movie, "actors">) => (
                  <li className="inline-flex mb-10 mx-2" key={movie.id}>
                    <MovieCard
                      movie={movie}
                      unassignCasting={unassignCasting}
                      submitting={submitting}
                    />
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
