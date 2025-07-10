import Button from "@mui/material/Button";
import { baseUrl } from "../../shared/base-url";
import { useFormik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router";
import {
  Alert,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { Genre } from "../../models/genre";
import { useEffect, useState } from "react";

export function AddMovie() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [genre, setGenre] = useState<Genre>(Genre.ACTION_AND_ADVENTURE);
  useEffect(() => {
    formik.setFieldValue("genre", genre);
  }, [genre]);

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
      title: "",
      genre: genre,
      posterUrl: "",
      releaseDate: "",
    },
    validationSchema: validationSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (submitting) {
        return;
      }

      try {
        setSubmitting(true);
        const res = await fetch(`${baseUrl}/movies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
        if (res.status < 400) {
          const json = await res.json();
          navigate(`/movies/${json.id}`);
        }
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
        open={!!snackbarMessage}
        onClose={handleClose}
        message={snackbarMessage}
      >
        {snackbarMessage.includes("201:") ? (
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
      <div>
        <Button type="button" onClick={() => navigate(-1)} className="mb-5">
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
            error={formik.touched.posterUrl && Boolean(formik.errors.posterUrl)}
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
            helperText={formik.touched.releaseDate && formik.errors.releaseDate}
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
    </>
  );
}
