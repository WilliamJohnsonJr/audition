import Button from "@mui/material/Button";
import type { Movie } from "../../models/movie";
import { useEffect, useState } from "react";
import { baseUrl } from "../../shared/base-url";
import { useDataLoader } from "../../shared/data-loader";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import { MovieCard } from "./MovieCard";

export default function Movies() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [privateSearch, setPrivateSearch] = useState("")
  const [pageMax, setPageMax] = useState(1);

  const { data, refresh, errors, isLoading } = useDataLoader<{
    movies: Movie[];
    totalMovies: number;
    success: boolean;
    offset: number;
  }>(`${baseUrl}/movies?page=${page}&search=${search}`, {
    movies: [],
    totalMovies: 0,
    success: true,
    offset: 0,
  });
  
  useEffect(() => {
    setPageMax(Math.ceil(data.totalMovies / 10) || 1)
  }, [page, data.totalMovies])


  function handleSearch(val: string = '') {
    setPrivateSearch(val);
  }

  return (
    <>
      <div className="flex-auto justify-center mb-5">
        <TextField id="search-movie-text-field" label="Movie Search" variant="outlined" onChange={(event) => handleSearch(event.target.value)} />
        <Button className="ml-5" type="button" onClick={() => setSearch(privateSearch)}>Search</Button>
      </div>
      {data.totalMovies > 0 && <p className="mb-5">Page {page} of {pageMax}</p>}
      <div className="flex-auto justify-center mb-5">
        <Button className="mr-2" type="button" disabled={ page < 2 } onClick={()=> setPage(page-1)}>Prev</Button>
        <Button className="ml-2" type="button" disabled={(page) <= pageMax} onClick={()=> setPage(page + 1)}>Next</Button>
      </div>
      {isLoading ? (
        <>
          <Skeleton variant="rounded" width={350} height={300} />
          <br></br>
          <Skeleton variant="rounded" width={350} height={300} />
          <br></br>
          <Skeleton variant="rounded" width={350} height={300} />
          <br></br>
          <Skeleton variant="rounded" width={350} height={300} />
        </>
      ) : data && !!data.movies.length ? (
        <ul className="list-none">
          {data.movies.map((movie: Movie) => (
            <li className="inline-flex mb-10 mx-2" key={movie.id}>
              <MovieCard movie={movie} />
            </li>
          ))}
        </ul>
      ) : (
        "No movies found"
      )}
    </>
  );
}
