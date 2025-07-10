import {
  debounce,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import type { FormikValues } from "formik";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import type { Actor } from "../../models/actor";
import { baseUrl } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";

export function ActorAutosearch({
  formik,
  onChange,
}: {
  formik: FormikValues;
  onChange: (
    event: SyntheticEvent,
    value: { label: string; id: number } | null
  ) => void;
}) {
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
      label: `${actor.name} | id: ${actor.id}`,
    }));
  }

  function handleChange(val: string = "") {
    setSearch(val);
  }

  const debouncedSetSearch = useCallback(
    debounce((event) => handleChange(event.target.value), 500),
    []
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
          label: `${actor.name}  | id: ${actor.id}`,
        }))
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    setOptions([]);
  };

  return (
    <Autocomplete
      className="w-1/2"
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={onChange}
      onBlur={formik.handleBlur}
      value={formik.values.actor}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label ?? ""}
      options={options}
      filterOptions={() => filterOptions()}
      loading={isLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Actor"
          onChange={debouncedSetSearch}
          error={formik.touched.actor && Boolean(formik.errors.actor)}
          helperText={formik.touched.actor && formik.errors.actor}
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
