import Button from "@mui/material/Button";
import type { Movie } from "../../models/movie";
import { BaseUrlContext } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import { useFormik } from "formik";
import * as yup from "yup";
import { useParams, useNavigate } from "react-router";
import {
  Alert,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { Genre } from "../../models/genre";
import { useContext, useEffect, useState } from "react";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";

export function EditMovie() {
  const baseUrl = useContext(BaseUrlContext);
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [genre, setGenre] = useState<Genre>(Genre.ACTION_AND_ADVENTURE);
  const { getAccessTokenSilently } = useAuth0();
  useEffect(() => {
    formik.setFieldValue("genre", genre);
  }, [genre]);

  const { data, error, isLoading } = useDataLoader<{
    movie?: Movie;
    success: boolean;
  }>(`${baseUrl}/movies/${movieId}`, {
    movie: undefined,
    success: true,
  });

  useEffect(() => {
    if (error?.message?.includes("404")) {
      navigate("/not-found");
    }
    if (error?.message) {
      setSnackbarMessage(error.message);
    }
    if (data.movie?.genre) {
      setGenre(data.movie.genre);
    }
  }, [data, error]);

  function handleChange(event: SelectChangeEvent<Genre>) {
    setGenre(event.target.value);
  }

  function handleClose() {
    setSnackbarMessage("");
  }

  const validationSchema = yup.object({
    title: yup.string().min(1).required("Title is required"),
    genre: yup
      .string()
      .oneOf(Object.values(Genre))
      .required("Genre is required"),
    posterUrl: yup.string().url(),
    releaseDate: yup
      .string()
      .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  });

  const formik = useFormik({
    initialValues: {
      title: data.movie?.title || "",
      genre: genre,
      posterUrl: data.movie?.posterUrl || "",
      releaseDate: data.movie?.releaseDate || "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (submitting) {
        return;
      }
      const patches = [];
      const movie = data.movie!;

      if (values.title !== movie.title) {
        patches.push({ op: "add", path: "/title", value: values.title.trim() });
      }
      if (values.genre !== movie.genre) {
        patches.push({ op: "add", path: "/genre", value: values.genre });
      }
      if (!values.posterUrl && movie.posterUrl) {
        patches.push({ op: "remove", path: "/posterUrl" });
      } else if (
        values.posterUrl !== "" &&
        values.posterUrl !== movie.posterUrl
      ) {
        patches.push({
          op: "add",
          path: "/posterUrl",
          value: values.posterUrl,
        });
      }
      if (!values.releaseDate && movie.releaseDate) {
        patches.push({ op: "remove", path: "/releaseDate" });
      } else if (
        values.releaseDate !== "" &&
        values.releaseDate !== movie.releaseDate
      ) {
        patches.push({
          op: "add",
          path: "/releaseDate",
          value: values.releaseDate,
        });
      }
      try {
        setSubmitting(true);
        const accessToken = await getAccessTokenSilently();
        const res = await fetchWithAuth(
          accessToken,
          `${baseUrl}/movies/${movieId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json-patch+json",
            },
            body: JSON.stringify(patches),
          },
        );
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
      } catch (err) {
        setSnackbarMessage("Error occurred - please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={6000}
        open={!!snackbarMessage}
        onClose={handleClose}
        message={snackbarMessage}
      >
        {snackbarMessage.includes("200:") ||
        snackbarMessage.includes("204:") ? (
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
      {!isLoading ? (
        <div>
          <div>{snackbarMessage}</div>
          <Button  type="button" onClick={() => navigate(-1)} className="mb-5">
            Back
          </Button>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="title"
              className="mb-5"
              name="title"
              label="Title"
              required
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
            <FormControl sx={{ minWidth: 120 }} fullWidth className="mb-5">
              <InputLabel id="genre-select-label" required>
                Genre
              </InputLabel>
              <Select
                fullWidth
                label="Genre"
                value={genre}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.genre && Boolean(formik.errors.genre)}
                displayEmpty
                inputProps={{ "aria-label": "Genre" }}
              >
                {Object.values(Genre).map((g) => (
                  <MenuItem value={g}>{g}</MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {formik.touched.genre && formik.errors.genre}
              </FormHelperText>
            </FormControl>
            <TextField
              fullWidth
              id="poster-url"
              className="mb-5"
              name="posterUrl"
              label="Poster URL"
              value={formik.values.posterUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.posterUrl && Boolean(formik.errors.posterUrl)
              }
              helperText={formik.touched.posterUrl && formik.errors.posterUrl}
            />
            <TextField
              fullWidth
              name="releaseDate"
              className="mb-5"
              label="Release Date (YYYY-MM-DD)"
              value={formik.values.releaseDate}
              onChange={formik.handleChange}
              error={
                formik.touched.releaseDate && Boolean(formik.errors.releaseDate)
              }
              helperText={
                formik.touched.releaseDate && formik.errors.releaseDate
              }
            />
            <Button 
              color="primary"
              variant="outlined"
              fullWidth
              type="submit"
              disabled={submitting}
            >
              Submit
            </Button>
          </form>
        </div>
      ) : (
        <Skeleton height="300" width="500"></Skeleton>
      )}
    </>
  );
}
