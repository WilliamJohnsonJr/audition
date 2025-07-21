import { useContext, useState, type SyntheticEvent } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import { ActorAutosearch } from "./ActorAutosearch";
import { MovieAutosearch } from "./MovieAutosearch";
import { useFormik } from "formik";
import * as yup from "yup";
import { BaseUrlContext } from "../../shared/base-url";
import { fetchWithAuth } from "../../api-helper/api-helper";
import { useAuth0 } from "@auth0/auth0-react";

export function AssignCast() {
  const baseUrl = useContext(BaseUrlContext);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { getAccessTokenSilently } = useAuth0();
  function handleClose() {
    setSnackbarMessage("");
  }
  const validationSchema = yup.object({
    movie: yup
      .object({ label: yup.string().required(), id: yup.number().required() })
      .required("Movie is required"),
    actor: yup
      .object({ label: yup.string().required(), id: yup.number().required() })
      .required("Actor is required"),
  });

  const formik = useFormik({
    initialValues: {
      movie: null as null | { label: string; id: number },
      actor: null as null | { label: string; id: number },
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      if (submitting) {
        return;
      }
      if (!values.movie || !values.actor) {
        throw new Error("Values not provided");
      }
      const request = {
        movieId: values.movie.id,
        actorId: values.actor.id,
      };
      try {
        setSubmitting(true);
        const accessToken = await getAccessTokenSilently();
        const res = await fetchWithAuth(accessToken, `${baseUrl}/casts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });
        setSnackbarMessage(`${res.status}: ${res.statusText}`);

        if (res.status < 400) {
          formik.resetForm();
        }
      } catch (err) {
        setSnackbarMessage("Error occurred - please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  function handleMovieChange(
    _event: SyntheticEvent,
    value: { label: string; id: number } | null,
  ) {
    console.log(value);
    formik.setFieldValue("movie", value);
  }
  function handleActorChange(
    _event: SyntheticEvent,
    value: { label: string; id: number } | null,
  ) {
    console.log(value);
    formik.setFieldValue("actor", value);
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
          <div>
            <div className="mb-5 flex justify-center">
              <MovieAutosearch formik={formik} onChange={handleMovieChange} />
            </div>
            <div className="mb-5 flex justify-center">
              <ActorAutosearch formik={formik} onChange={handleActorChange} />
            </div>
          </div>
          <div className="mb-5 flex justify-center">
            <Button sx={{backgroundColor: "#1a1a1a !important"}} type="submit" variant="outlined" disabled={submitting}>
              Assign
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
