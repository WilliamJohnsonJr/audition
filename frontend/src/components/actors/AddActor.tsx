import Button from "@mui/material/Button";
import { BaseUrlContext } from "../../shared/base-url";
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
import { useContext, useState } from "react";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";

export function AddActor() {
  const baseUrl = useContext(BaseUrlContext);
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const validationSchema = yup.object({
    name: yup.string().min(1).required("Name is required"),
    gender: yup.string().oneOf(Object.values(Gender)),
    photoUrl: yup.string().url(),
    age: yup.number().min(1).required("Age is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      gender: "",
      photoUrl: "",
      age: 0,
    },
    validationSchema: validationSchema,
    enableReinitialize: false,
    onSubmit: async (values) => {
      if (submitting) {
        return;
      }

      const request = {
        name: values.name,
        gender: values.gender,
        photoUrl: values.photoUrl,
        age: +values.age,
      };

      try {
        setSubmitting(true);
        const accessToken = await getAccessTokenSilently();
        const res = await fetchWithAuth(accessToken, `${baseUrl}/actors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
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

  function handleChange(event: SelectChangeEvent<Gender | string>) {
    formik.setFieldValue("gender", event.target.value);
  }

  function handleClose() {
    setSnackbarMessage("");
  }

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
              id="gender"
              label="Gender"
              name="gender"
              value={formik.values.gender}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              displayEmpty
              inputProps={{ "aria-label": "Gender" }}
            >
              {Object.values(Gender).map((g) => (
                <MenuItem value={g} key={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {formik.touched.gender && formik.errors.gender}
            </FormHelperText>
          </FormControl>
          <TextField
            fullWidth
            id="photo-url"
            className="mb-5"
            name="photoUrl"
            label="Photo URL"
            value={formik.values.photoUrl}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.photoUrl && Boolean(formik.errors.photoUrl)}
            helperText={formik.touched.photoUrl && formik.errors.photoUrl}
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
