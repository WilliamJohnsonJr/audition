import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import type { Movie } from "../../models/movie";
import { useDataLoader } from "../../shared/data-loader";
import { baseUrl } from "../../shared/base-url";
import { useCallback, useEffect, useState } from "react";
import { Button, debounce } from "@mui/material";
import type { Actor } from "../../models/actor";

function MoviesAutosearch() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<
    readonly { label: string; id: number }[]
  >([]);
  const [search, setSearch] = useState("");
  const { data, refresh, error, isLoading } = useDataLoader<{
    movies: Movie[];
    totalMovies: number;
    success: boolean;
    offset: number;
  }>(`${baseUrl}/movies?page=1&search=${search}`, {
    movies: [],
    totalMovies: 0,
    success: true,
    offset: 0,
  });

  function filterOptions() {
    return data.movies.map((movie: Movie) => ({
      id: movie.id,
      label: movie.title,
    }));
  }

  function handleChange(val: string = "") {
    setSearch(val);
  }

  const debouncedSetSearch = useCallback(
    debounce((event) => handleChange(event.target.value), 500),
    [],
  );

  useEffect(() => {
    if (!search) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [search]);

  const handleOpen = () => {
    if (search) {
      setOpen(true);
      setOptions(
        data.movies.map((movie: Movie) => ({
          id: movie.id,
          label: movie.title,
        })),
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      sx={{ width: 300 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      options={options}
      filterOptions={() => filterOptions()}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Movie"
          onChange={debouncedSetSearch}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

function ActorsAutosearch() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<
    readonly { label: string; id: number }[]
  >([]);
  const [search, setSearch] = useState("");
  const { data, refresh, error, isLoading } = useDataLoader<{
    actors: Actor[];
    totalActors: number;
    success: boolean;
    offset: number;
  }>(`${baseUrl}/actors?page=1&search=${search}`, {
    actors: [],
    totalActors: 0,
    success: true,
    offset: 0,
  });

  function filterOptions() {
    return data.actors.map((actor: Actor) => ({
      id: actor.id,
      label: actor.name,
    }));
  }

  function handleChange(val: string = "") {
    setSearch(val);
  }

  const debouncedSetSearch = useCallback(
    debounce((event) => handleChange(event.target.value), 500),
    [],
  );

  useEffect(() => {
    if (!search) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [search]);

  const handleOpen = () => {
    if (search) {
      setOpen(true);
      setOptions(
        data.actors.map((actor: Actor) => ({
          id: actor.id,
          label: actor.name,
        })),
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      sx={{ width: 300 }}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      options={options}
      filterOptions={() => filterOptions()}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Actor"
          onChange={debouncedSetSearch}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

export default function AssignCast() {
  return (
    <>
      <div className="mb-5">
        <MoviesAutosearch />
      </div>
      <div className="mb-5">
        <ActorsAutosearch />
      </div>
      <div className="mb-5">
        <Button type="button" variant="outlined">
          Assign
        </Button>
      </div>
    </>
  );
}
