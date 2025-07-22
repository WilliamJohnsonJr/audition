import Button from "@mui/material/Button";
import type { Movie } from "../../models/movie";
import { useContext, useEffect, useState } from "react";
import { useDataLoader } from "../../shared/data-loader";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import { MovieCard } from "./MovieCard";
import { Alert, Link, Snackbar } from "@mui/material";
import Search from "@mui/icons-material/Search";
import { BaseUrlContext } from "../../shared/base-url";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";
import { Link as RouterLink } from "react-router";

export function Movies() {
  const baseUrl = useContext(BaseUrlContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [privateSearch, setPrivateSearch] = useState("");
  const [pageMax, setPageMax] = useState(1);
  const { getAccessTokenSilently } = useAuth0();

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { data, refresh, error, isLoading } = useDataLoader<{
    movies: Movie[];
    totalMovies: number;
    success: boolean;
    offset: number;
  }>(`${baseUrl}/movies?page=${page}&search=${search}`, {
    movies: [],
    totalMovies: 0,
    success: true,
    offset: 0,
  });

  async function deleteMovie(id: number) {
    try {
      const accessToken = await getAccessTokenSilently();
      const res = await fetchWithAuth(accessToken, `${baseUrl}/movies/${id}`, {
        method: "DELETE",
      });
      if (res.ok && res.status < 400) {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
        refresh();
      } else {
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
      }
    } catch {
      setSnackbarMessage("Error occurred - please try again.");
    }
  }

  useEffect(() => {
    setPageMax(Math.ceil(data.totalMovies / 10) || 1);
  }, [page, data.totalMovies]);

  useEffect(() => {
    if (error?.message) {
      setSnackbarMessage(error.message);
    }
  }, [error]);

  function handleClose() {
    setSnackbarMessage("");
  }

  function handleSearch(val: string = "") {
    setPrivateSearch(val);
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
      <div className="flex-auto justify-center my-5">
        <TextField
          id="search-movie-text-field"
          className="w-1/2 mb-5"
          label="Movie Search"
          variant="outlined"
          onChange={(event) => handleSearch(event.target.value)}
        />
        <Button 
          className="ml-5"
          type="button"
          startIcon={<Search />}
          onClick={() => setSearch(privateSearch)}
        >
          Search
        </Button>
        <Link component={RouterLink} to="/movies/add">
          <Button sx={{backgroundColor: "#4ED7FA !important"}} color="secondary" type="button" className="ml-5">
          Add Movie
          </Button>
          </Link>
      </div>
      {data.totalMovies > 0 && (
        <p className="mb-5">
          Page {page} of {pageMax}
        </p>
      )}
      <div className="flex justify-center mb-5">
        <Button 
          className="mr-2"
          type="button"
          disabled={page < 2}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </Button>
        <Button 
          className="ml-2"
          type="button"
          disabled={page === pageMax}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
      {isLoading ? (
        <ul className="list-none flex justify-center">
          <li className="inline-flex mb-10 mx-2" key="skel-1">
            <Skeleton variant="rounded" width={350} height={300} />
          </li>
          <li className="inline-flex mb-10 mx-2" key="skel-2">
            <Skeleton variant="rounded" width={350} height={300} />
          </li>
          <li className="inline-flex mb-10 mx-2" key="skel-3">
            <Skeleton variant="rounded" width={350} height={300} />
          </li>
          <li className="inline-flex mb-10 mx-2" key="skel-4">
            <Skeleton variant="rounded" width={350} height={300} />
          </li>
        </ul>
      ) : data && !!data.movies.length ? (
        <ul className="list-none">
          {data.movies.map((movie: Movie) => (
            <li className="inline-block mb-10 mx-2" key={movie.id}>
              <MovieCard movie={movie} deleteMovie={deleteMovie} />
            </li>
          ))}
        </ul>
      ) : (
        "No movies found"
      )}
    </>
  );
}
