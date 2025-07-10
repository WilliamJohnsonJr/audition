import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Link,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router";
import type { MovieOnly } from "../../models/movie";
import { format, parseISO } from "date-fns";
import filmReel from "../../assets/film-reel-optimized.webp";
import { ErrorBoundary } from "react-error-boundary";

export function MovieCard({
  movie,
  deleteMovie,
  unassignCasting,
  submitting = false,
}: {
  movie: MovieOnly;
  deleteMovie?: (id: number) => void;
  unassignCasting?: (movieId: number) => void;
  submitting?: boolean;
}) {
  const { movieId } = useParams();

  return (
    <Card sx={{ width: 350 }} className="rounded-xl">
      <ErrorBoundary fallback={<p>The image failed to load</p>}>
        {movie.posterUrl && !movie.posterUrl.includes("example.example") ? (
          <CardMedia
            component="img"
            className="object-contain h-[200px]"
            image={movie.posterUrl}
            title={`${movie.title} poster`}
          />
        ) : (
          <CardMedia
            component="img"
            className="object-contain h-[200px]"
            image={filmReel}
            title={`movie poster placeholder image`}
          />
        )}
      </ErrorBoundary>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {movie.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {(movie.releaseDate && format(parseISO(movie.releaseDate), "PP")) ||
            "No Release Date"}
        </Typography>
      </CardContent>
      <CardActions className="flex-auto justify-center">
        {!movieId && (
          <Link component={RouterLink} to={`/movies/${movie.id}`}>
            <Button type="button" size="small" aria-label={`View movie ${movie.title}`}>
              View
            </Button>
          </Link>
        )}
        {!!unassignCasting && (
          <Button
            type="button"
            onClick={() => unassignCasting(movie.id)}
            disabled={submitting}
            aria-label={`Unassign movie ${movie.title}`}
          >
            Unassign
          </Button>
        )}
        <Link component={RouterLink} to={`/movies/${movie.id}/edit`}>
          <Button type="button" size="small" aria-label={`Edit movie ${movie.title}`}>
            Edit
          </Button>
        </Link>
        {!!deleteMovie && (
          <Button
            type="button"
            onClick={() => deleteMovie(movie.id)}
            disabled={submitting}
            aria-label={`Delete movie ${movie.title}`}
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
