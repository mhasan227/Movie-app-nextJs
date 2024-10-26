import Image from 'next/image';
// import Link from 'next/link';
import MovieCard from "../../components/MovieCard";
// import dynamic from 'next/dynamic';

// const MovieCard = dynamic(() => import('../../components/MovieCard'), {
//   ssr: false, // disable server-side rendering for this component
// });

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function generateStaticParams() {
  // Fetch popular movies to pre-generate some pages
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const movies = await res.json();

  // Generate paths for the first 10 movies
  return movies.results.slice(0, 10).map((movie) => ({
    id: movie.id.toString(),
  }));
}

async function getMovieDetails(id) {
  const [movieRes, creditsRes, recommendationsRes] = await Promise.all([
    fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`),
    fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`),
    fetch(`${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}`),
  ]);

  const movie = await movieRes.json();
  const credits = await creditsRes.json();
  const recommendations = await recommendationsRes.json();

  return { movie, credits, recommendations };
}

export default async function MovieDetails({ params }) {
  const { id } = params;
  const { movie, credits, recommendations } = await getMovieDetails(id);

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row">
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={300}
            height={450}
            className="rounded-lg"
          />
        </div>

        <div className="md:ml-8">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="text-gray-700 mt-4">{movie.overview}</p>

          <div className="mt-4">
            <h2 className="font-bold">Genres:</h2>
            <ul className="flex gap-2">
              {movie.genres.map((genre) => (
                <li key={genre.id} className="bg-blue-500 text-white px-2 py-1 rounded">
                  {genre.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h2 className="font-bold">Release Date:</h2>
            <p>{movie.release_date}</p>
          </div>

          <div className="mt-4">
            <h2 className="font-bold">Cast:</h2>
            <ul>
              {credits.cast.slice(0, 5).map((castMember) => (
                <li key={castMember.cast_id}>
                  {castMember.name} as {castMember.character}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Recommendations:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {recommendations.results.slice(0, 6).map((recMovie, index) => (
              <MovieCard
                  key={`${index}-${recMovie?.id}`}
                  keyId={recMovie?.id}
                  title={recMovie?.title}
                  releaseDate={recMovie?.release_date}
                  imagePath={recMovie?.poster_path}
                  rating={recMovie?.vote_average}
              />
          ))}
        </div>
      </div>
    </div>
  );
}
