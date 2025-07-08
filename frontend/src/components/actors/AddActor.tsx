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
import { Gender } from "../../models/gender";
import { useEffect, useState } from "react";

export default function AddActor() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  useEffect(() => {
    formik.setFieldValue("gender", gender);
  }, [gender]);

  function handleChange(event: SelectChangeEvent<Gender>) {
    setGender(event.target.value);
  }

  function handleClose() {
    setSnackbarMessage("");
  }

  const validationSchema = yup.object({
    name: yup.string().min(1).required("Name is required"),
    gender: yup
      .string()
      .oneOf(Object.values(Gender))
      .required("Gender is required"),
    pictureUrl: yup.string().url(),
    age: yup.number().min(1).required("Age is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      gender: gender,
      pictureUrl: "",
      age: 0,
    },
    validationSchema: validationSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (submitting) {
        return;
      }

      try {
        setSubmitting(true);
        const res = await fetch(`${baseUrl}/actors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        setSnackbarMessage(`${res.status}: ${res.statusText}`);
        if (res.status < 400) {
          const json = await res.json();
          navigate(`/actors/${json.id}`);
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
            id="name"
            className="mb-5"
            name="name"
            label="Name"
            required
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />
          <FormControl sx={{ minWidth: 120 }} fullWidth className="mb-5">
            <InputLabel id="gender-select-label" required>
              Gender
            </InputLabel>
            <Select
              fullWidth
              label="Gender"
              value={gender}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              displayEmpty
              inputProps={{ "aria-label": "Gender" }}
            >
              {Object.values(Gender).map((g) => (
                <MenuItem value={g}>{g}</MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.gender && formik.errors.gender}
            </FormHelperText>
          </FormControl>
          <TextField
            fullWidth
            id="picture-url"
            className="mb-5"
            name="pictureUrl"
            label="Picture URL"
            value={formik.values.pictureUrl}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.pictureUrl && Boolean(formik.errors.pictureUrl)
            }
            helperText={formik.touched.pictureUrl && formik.errors.pictureUrl}
          />
          <TextField
            fullWidth
            name="age"
            required
            className="mb-5"
            label="Age"
            value={formik.values.age}
            onChange={formik.handleChange}
            error={formik.touched.age && Boolean(formik.errors.age)}
            helperText={formik.touched.age && formik.errors.age}
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
