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

export function ActorCard({
  actor,
  deleteActor,
}: {
  actor: ActorOnly;
  deleteActor?: (id: number) => void;
}) {
  const { actorId } = useParams();
  return (
    <Card sx={{ width: 350 }}>
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
            <Button type="button" size="small">
              View
            </Button>
          </Link>
        )}
        <Link component={RouterLink} to={`/actors/${actor.id}/edit`}>
          <Button type="button" size="small">
            Edit
          </Button>
        </Link>
        {deleteActor && (
          <Button type="button" onClick={() => deleteActor(actor.id)}>
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
