import Button from "@mui/material/Button";
import type { Actor } from "../../models/actor";
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
import { Gender } from "../../models/gender";
import { useContext, useEffect, useState } from "react";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";

export function EditActor() {
  const baseUrl = useContext(BaseUrlContext);
  const { actorId } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { getAccessTokenSilently } = useAuth0();

  const { data, error, isLoading } = useDataLoader<{
    actor?: Actor;
    success: boolean;
  }>(`${baseUrl}/actors/${actorId}`, {
    actor: undefined,
    success: true,
  });

  const validationSchema = yup.object({
    name: yup.string().min(1).required("Name is required"),
    gender: yup.string().oneOf(["", ...Object.values(Gender)]),
    photoUrl: yup.string().url(),
    age: yup.number().min(1).required("Age is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: data.actor?.name || "",
      gender: data.actor?.gender || "",
      photoUrl: data.actor?.photoUrl || "",
      age: data.actor?.age || "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (submitting) {
        return;
      }
      const patches = [];
      const actor = data.actor!;

      if (values.name !== actor.name) {
        patches.push({ op: "add", path: "/name", value: values.name.trim() });
      }
      if (!values.gender && actor.gender) {
        patches.push({ op: "remove", path: "/gender" });
      } else if (values.gender !== actor.gender) {
        patches.push({ op: "add", path: "/gender", value: values.gender });
      }
      if (!values.photoUrl && actor.photoUrl) {
        patches.push({ op: "remove", path: "/photoUrl" });
      } else if (values.photoUrl !== "" && values.photoUrl !== actor.photoUrl) {
        patches.push({
          op: "add",
          path: "/photoUrl",
          value: values.photoUrl,
        });
      }
      if (values.age !== actor.age) {
        patches.push({
          op: "add",
          path: "/age",
          value: values.age,
        });
      }
      try {
        setSubmitting(true);
        const accessToken = await getAccessTokenSilently();
        const res = await fetchWithAuth(
          accessToken,
          `${baseUrl}/actors/${actorId}`,
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

  useEffect(() => {
    if (error?.message?.includes("404")) {
      navigate("/not-found");
    }
    if (error?.message) {
      setSnackbarMessage(error.message);
    }
    if (data.actor?.gender) {
      formik.setFieldValue("gender", data.actor.gender);
    }
  }, [data, error]);

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
                value={formik.values.gender}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                displayEmpty
                inputProps={{ "aria-label": "Gender" }}
              >
                <MenuItem value={""} key="None">
                  None
                </MenuItem>
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
            <Button sx={{backgroundColor: "#1a1a1a !important"}}
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
