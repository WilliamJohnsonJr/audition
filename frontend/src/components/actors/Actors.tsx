import Button from "@mui/material/Button";
import type { Actor } from "../../models/actor";
import { useContext, useEffect, useState } from "react";
import { useDataLoader } from "../../shared/data-loader";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import { ActorCard } from "./ActorCard";
import { Alert, Link, Snackbar } from "@mui/material";
import { BaseUrlContext } from "../../shared/base-url";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";
import { Link as RouterLink } from 'react-router';

export function Actors() {
  const baseUrl = useContext(BaseUrlContext);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [privateSearch, setPrivateSearch] = useState("");
  const [pageMax, setPageMax] = useState(1);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { getAccessTokenSilently } = useAuth0();

  const { data, refresh, error, isLoading } = useDataLoader<{
    actors: Actor[];
    totalActors: number;
    success: boolean;
    offset: number;
  }>(`${baseUrl}/actors?page=${page}&search=${search}`, {
    actors: [],
    totalActors: 0,
    success: true,
    offset: 0,
  });

  useEffect(() => {
    setPageMax(Math.ceil(data.totalActors / 10) || 1);
  }, [page, data.totalActors]);

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

  async function deleteActor(id: number) {
    try {
      const accessToken = await getAccessTokenSilently();
      const res = await fetchWithAuth(accessToken, `${baseUrl}/actors/${id}`, {
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
        <TextField
          id="search-actor-text-field"
          label="Actor Search"
          variant="outlined"
          className="w-1/2 mb-5"
          onChange={(event) => handleSearch(event.target.value)}
        />
        <Button 
          className="ml-5"
          type="button"
          onClick={() => setSearch(privateSearch)}
        >
          Search
        </Button>
        <Link component={RouterLink} to="/actors/add">
          <Button sx={{backgroundColor: "#4ED7FA !important"}} color="secondary" type="button" className="ml-5">
            Add Actor
          </Button>
        </Link>
      </div>
      {data.totalActors > 0 && (
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
        <ul className="list-none">
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
      ) : data && !!data.actors.length ? (
        <ul className="list-none">
          {data.actors.map((actor: Actor) => (
            <li className="inline-block mb-10 mx-2" key={actor.id}>
              <ActorCard actor={actor} deleteActor={deleteActor} />
            </li>
          ))}
        </ul>
      ) : (
        "No actors found"
      )}
    </>
  );
}
