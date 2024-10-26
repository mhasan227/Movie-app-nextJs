const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

console.log(API_KEY);

// Function to fetch popular movies
export const fetchPopularMovies = async (page = 1) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
};

// Function to fetch popular movies
export const fetchSearchMovies = async (page = 1, query) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Search');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Search:', error);
      throw error;
    }
};