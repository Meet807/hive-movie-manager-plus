
import React, { createContext, useContext, useState, useEffect } from "react";
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
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

const addMovieToDb = async (movie: Omit<Movie, "id">): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .insert(movie)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

const updateMovieInDb = async (movie: Movie): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .update(movie)
    .eq('id', movie.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

const deleteMovieFromDb = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Check if the DB is empty and seed with initial data if needed
const initializeDb = async (): Promise<void> => {
  const { count, error } = await supabase
    .from('movies')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error checking movie count:', error);
    return;
  }
  
  if (count === 0) {
    // No movies in database, add initial movies
    const { error: insertError } = await supabase
      .from('movies')
      .insert(initialMovies);
    
    if (insertError) {
      console.error('Error initializing movies:', insertError);
    }
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
  useEffect(() => {
    initializeDb();
  }, []);
  
  // Query to fetch movies from Supabase
  const { 
    data: movies = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['movies'],
    queryFn: fetchMovies,
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
    onError: (error) => {
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
    onError: (error) => {
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
    onError: (error) => {
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
