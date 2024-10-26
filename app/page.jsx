'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import {fetchPopularMovies, fetchSearchMovies} from "../Utils/api";
import MovieCard from "./components/MovieCard";
import { useForm } from "react-hook-form";

export default function Home() {

  const [movies, setMovies]                                       = useState([]);
  const [page, setPage]                                           = useState(1);
  const [loading, setLoading]                                     = useState(true);
  const [hasMore, setHasMore]                                     = useState(true);
  // const [searchQuery, setSearchQuery]                             = useState(''); 
  const [isSearching, setIsSearching]                             = useState(false);
  const [debouncedQuery, setDebouncedQuery]                       = useState('');
  const { register, handleSubmit, watch, formState: { errors } }  = useForm();


  const searchQuery = watch("searchQuery");

  useEffect(() => {
    setMovies([]); 
    setPage(1); 
    setHasMore(true); 
    const handler = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 3) {
        setDebouncedQuery(searchQuery);
        setIsSearching(true);
        
      }else if (isSearching && searchQuery === "") {
        // If search query becomes empty switch to popular movies
        setIsSearching(false); 
      }
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler); 
    };
  }, [isSearching, searchQuery]);

  useEffect(() => {
    let mounted = true;

    const loadMovies = async () => {
      setLoading(true);
      try {
        const data = isSearching ? await fetchSearchMovies(page, debouncedQuery) : await fetchPopularMovies(page);
        if (mounted) { // Only update state if component is still mounted
          setMovies((prevMovies) => [...prevMovies, ...data.results]);
          setHasMore(data.page < data.total_pages);
        }
      } catch (error) {
        console.error("Error loading movies:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (debouncedQuery || !isSearching) {
      loadMovies();
    }

    return () => {
      mounted = false; 
    };
  }, [isSearching, page, debouncedQuery]);

  const loadMoreMovies = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Check if the user has scrolled to within 100px of the bottom of the page
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !loading && hasMore) {
        setTimeout(()=>{
          setPage((prevPage) => prevPage + 1);
        },200);
      }
    };

    // Add event listener for scrolling
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll); // Cleanup event listener on unmount
    };
  }, [loading, hasMore]);

  return (
    <>
      {loading && page === 1 ? (
                    <div className="flex justify-center items-center">
                        <Image
                            src="/assets/loading.gif"
                            alt="Loading..."
                            width={50}
                            height={50}
                        />
                    </div>
                  ):
        (<>
          <div className="my-6 flex flex-col gap-4 justify-between items-center py-5 md:px-16 md:flex-row">
            <Image
              loading="lazy"
              alt=""
              width={120}
              height={50}
              src="/assets/movie-logo.png"
            />

            <h1 className="font-semibold text-3xl text-red-600">{isSearching ? `Search Results for "${debouncedQuery}"` : "Popular Movies"}</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mb-5">
              <input
                type="text"
                placeholder="Search movies..."
                {...register("searchQuery", { minLength: 3 })}
                className="border p-2 rounded w-48"
              />
              {errors.searchQuery && <p className="text-red-500">Enter at least 3 characters</p>}
            </form>

          </div>

          <div className="flex flex-wrap justify-between gap-4 py-5 px-16">
            {movies.map((movie, index) => (
              <MovieCard
                key={`${index}-${movie?.id}`}
                keyId={movie?.id}
                title={movie?.title}
                releaseDate={movie?.release_date}
                imagePath={movie?.poster_path}
                rating={movie?.vote_average}
              />
            ))}

            {hasMore && !loading && (
              <button onClick={loadMoreMovies} className="my-4 p-2 w-full bg-blue-500 text-white rounded">
                Load More
              </button>
            )}

          </div>
        </>
      )}
    </>
  );
}
