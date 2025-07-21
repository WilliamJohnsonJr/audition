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
import silouette from "../../assets/silouette-optimized.webp";
import type { ActorOnly } from "../../models/actor";
import { ErrorBoundary } from "react-error-boundary";

export function ActorCard({
  actor,
  deleteActor,
  unassignCasting,
  submitting = false,
}: {
  actor: ActorOnly;
  deleteActor?: (id: number) => void;
  unassignCasting?: (actorId: number) => void;
  submitting?: boolean;
}) {
  const { actorId } = useParams();
  return (
    <Card sx={{ width: 350 }} className="rounded-xl">
      <ErrorBoundary fallback={<p>The image failed to load</p>}>
        {actor.photoUrl && !actor.photoUrl.includes("example.example") ? (
          <CardMedia
            component="img"
            className="object-contain h-[200px]"
            image={actor.photoUrl}
            title={`${actor.name} photo`}
          />
        ) : (
          <CardMedia
            component="img"
            className="object-contain h-[200px]"
            image={silouette}
            title={`actor poster placeholder image`}
          />
        )}
      </ErrorBoundary>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {actor.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Gender: {actor.gender || "No Gender"}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Age: {actor.age}
        </Typography>
      </CardContent>
      <CardActions className="flex-auto justify-center">
        {!actorId && (
          <Link component={RouterLink} to={`/actors/${actor.id}`}>
            <Button sx={{backgroundColor: "#1a1a1a !important"}}
              type="button"
              size="small"
              aria-label={`View actor ${actor.name}`}
            >
              View
            </Button>
          </Link>
        )}
        {!!unassignCasting && (
          <Button sx={{backgroundColor: "#1a1a1a !important"}}
            type="button"
            onClick={() => unassignCasting(actor.id)}
            disabled={submitting}
            aria-label={`Unassign actor ${actor.name}`}
          >
            Unassign
          </Button>
        )}
        <Link component={RouterLink} to={`/actors/${actor.id}/edit`}>
          <Button sx={{backgroundColor: "#1a1a1a !important"}}
            type="button"
            size="small"
            aria-label={`Edit actor ${actor.name}`}
          >
            Edit
          </Button>
        </Link>
        {!!deleteActor && (
          <Button sx={{backgroundColor: "#1a1a1a !important"}}
            type="button"
            onClick={() => deleteActor(actor.id)}
            disabled={submitting}
            aria-label={`Delete actor ${actor.name}`}
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
