import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from "@mui/material";
import { Link as RouterLink, useParams } from 'react-router';
import type { MovieOnly } from "../../models/movie";
import { format, parseISO } from "date-fns";
import filmReel from '../../assets/film-reel-optimized.webp';

export function MovieCard({ movie }: { movie: MovieOnly }) {
  const { movieId } = useParams()
  return (
    <Card sx={{ width: 350 }}>
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
        {!movieId && <Link component={RouterLink} to={`/movies/${movie.id}`}>
          <Button type="button" size="small">View</Button>
        </Link>}
        <Link component={RouterLink} to={`/movies/${movie.id}/edit`}>
          <Button type="button" size="small">Edit</Button>
        </Link>
      </CardActions>
    </Card>
  );
}