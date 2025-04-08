
import React, { createContext, useContext } from "react";
import { Movie } from "@/types/movie";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Sample initial movies for first-time setup only
const initialMovies: Omit<Movie, "id">[] = [
  {
    title: "The Shawshank Redemption",
    director: "Frank Darabont",
    year: 1994,
    rating: 9.3,
    poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    title: "The Godfather",
    director: "Francis Ford Coppola",
    year: 1972,
    rating: 9.2,
    poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
  },
  {
    title: "The Dark Knight",
    director: "Christopher Nolan",
    year: 2008,
    rating: 9.0,
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  }
];

// Supabase API functions
const fetchMovies = async (): Promise<Movie[]> => {
  console.log("Fetching movies from Supabase");
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching movies:", error);
      throw error;
    }
    
    console.log("Movies fetched successfully:", data);
    return data || [];
  } catch (err) {
    console.error("Error in fetchMovies:", err);
    throw err;
  }
};

const addMovieToDb = async (movie: Omit<Movie, "id">): Promise<Movie> => {
  console.log("Adding movie to Supabase:", movie);
  try {
    const { data, error } = await supabase
      .from('movies')
      .insert(movie)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding movie:", error);
      throw error;
    }
    
    console.log("Movie added successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in addMovieToDb:", err);
    throw err;
  }
};

const updateMovieInDb = async (movie: Movie): Promise<Movie> => {
  console.log("Updating movie in Supabase:", movie);
  try {
    const { data, error } = await supabase
      .from('movies')
      .update(movie)
      .eq('id', movie.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating movie:", error);
      throw error;
    }
    
    console.log("Movie updated successfully:", data);
    return data;
  } catch (err) {
    console.error("Error in updateMovieInDb:", err);
    throw err;
  }
};

const deleteMovieFromDb = async (id: string): Promise<void> => {
  console.log("Deleting movie from Supabase:", id);
  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting movie:", error);
      throw error;
    }
    
    console.log("Movie deleted successfully");
  } catch (err) {
    console.error("Error in deleteMovieFromDb:", err);
    throw err;
  }
};

// Check if the DB is empty and seed with initial data if needed
const initializeDb = async (): Promise<void> => {
  console.log("Initializing database");
  try {
    const { count, error } = await supabase
      .from('movies')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking movie count:', error);
      return;
    }
    
    console.log("Current movie count:", count);
    
    if (count === 0) {
      console.log("No movies in database, adding initial movies");
      // No movies in database, add initial movies
      const { error: insertError } = await supabase
        .from('movies')
        .insert(initialMovies);
      
      if (insertError) {
        console.error('Error initializing movies:', insertError);
      } else {
        console.log("Initial movies added successfully");
      }
    }
  } catch (err) {
    console.error("Error in initializeDb:", err);
  }
};

interface MovieContextType {
  movies: Movie[];
  isLoading: boolean;
  error: Error | null;
  addMovie: (movie: Omit<Movie, "id">) => void;
  updateMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;
  getMovie: (id: string) => Movie | undefined;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize database with sample data if needed (only run once)
  React.useEffect(() => {
    console.log("Running initializeDb");
    initializeDb().catch(err => {
      console.error("Error during initialization:", err);
    });
  }, []);
  
  // Query to fetch movies from Supabase - FIXED: removed onError and implemented onSuccess/onError properly
  const { 
    data: movies = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['movies'],
    queryFn: fetchMovies,
    retry: 1,
    meta: {
      onError: (err: Error) => {
        console.error("Query error:", err);
        toast({
          title: "Database Error",
          description: "Could not connect to the movies database. Please check your Supabase configuration.",
          variant: "destructive",
        });
      }
    }
  });
  
  // Mutation to add a movie
  const addMovieMutation = useMutation({
    mutationFn: addMovieToDb,
    onSuccess: (newMovie) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast({
        title: "Movie Added",
        description: `"${newMovie.title}" has been added to your collection.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add movie: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to update a movie
  const updateMovieMutation = useMutation({
    mutationFn: updateMovieInDb,
    onSuccess: (updatedMovie) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast({
        title: "Movie Updated",
        description: `"${updatedMovie.title}" has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update movie: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Mutation to delete a movie
  const deleteMovieMutation = useMutation({
    mutationFn: deleteMovieFromDb,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      const movieTitle = movies.find(movie => movie.id === id)?.title || "Movie";
      toast({
        title: "Movie Deleted",
        description: `"${movieTitle}" has been removed from your collection.`,
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete movie: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const addMovie = (movieData: Omit<Movie, "id">) => {
    addMovieMutation.mutate(movieData);
  };

  const updateMovie = (updatedMovie: Movie) => {
    updateMovieMutation.mutate(updatedMovie);
  };

  const deleteMovie = (id: string) => {
    deleteMovieMutation.mutate(id);
  };

  const getMovie = (id: string) => {
    return movies.find((movie) => movie.id === id);
  };

  return (
    <MovieContext.Provider
      value={{ 
        movies, 
        isLoading,
        error: error as Error | null,
        addMovie, 
        updateMovie, 
        deleteMovie, 
        getMovie 
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error("useMovies must be used within a MovieProvider");
  }
  return context;
};
