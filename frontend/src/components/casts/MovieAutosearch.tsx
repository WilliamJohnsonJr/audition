import {
  debounce,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import type { FormikValues } from "formik";
import {
  useCallback,
  useContext,
  useEffect,
  useState,
  type SyntheticEvent,
} from "react";
import type { Movie } from "../../models/movie";
import { BaseUrlContext } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";

export function MovieAutosearch({
  formik,
  onChange,
}: {
  formik: FormikValues;
  onChange: (
    event: SyntheticEvent,
    value: { label: string; id: number } | null,
  ) => void;
}) {
  const baseUrl = useContext(BaseUrlContext);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<
    readonly { label: string; id: number }[]
  >([{ label: "Not Selected", id: 0 }]);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useDataLoader<{
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
      label: `${movie.title} | id: ${movie.id}`,
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
          label: `${movie.title} | id: ${movie.id}`,
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
      className="w-full"
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label ?? ""}
      onChange={onChange}
      onBlur={formik.handleBlur}
      options={options}
      value={formik.values.movie}
      filterOptions={() => filterOptions()}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Movie"
          onChange={debouncedSetSearch}
          error={formik.touched.movie && Boolean(formik.errors.movie)}
          helperText={formik.touched.movie && formik.errors.movie}
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
