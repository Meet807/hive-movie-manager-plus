
import React, { createContext, useContext, useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface MovieContextType {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  addMovie: (movie: Omit<Movie, "id">) => Promise<void>;
  updateMovie: (movie: Movie) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

// Sample movies for when database is not connected
const sampleMovies: Movie[] = [
  {
    id: "1",
    title: "The Shawshank Redemption",
    director: "Frank Darabont",
    year: 1994,
    rating: 9.3,
    poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg",
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
  },
  {
    id: "2",
    title: "The Godfather",
    director: "Francis Ford Coppola",
    year: 1972,
    rating: 9.2,
    poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
  },
  {
    id: "3",
    title: "The Dark Knight",
    director: "Christopher Nolan",
    year: 2008,
    rating: 9.0,
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
  }
];

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState(false);

  // Load movies from Supabase or use sample data if database not connected
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase.from('movies').select('*');
        
        if (error) {
          console.error("Database error:", error);
          // Show sample movies if database not connected
          setMovies(sampleMovies);
          setDatabaseConnected(false);
          
          toast({
            title: "Using sample data",
            description: "Unable to connect to database. Using sample data instead.",
            variant: "default",
          });
        } else {
          console.log("Movies loaded from database:", data);
          setMovies(data || []);
          setDatabaseConnected(true);
        }
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setMovies(sampleMovies);
        setDatabaseConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [toast]);

  // Add a movie
  const addMovie = async (movie: Omit<Movie, "id">) => {
    try {
      setLoading(true);
      
      if (databaseConnected) {
        const { data, error } = await supabase
          .from('movies')
          .insert(movie)
          .select()
          .single();
          
        if (error) throw error;
        
        setMovies(prev => [data, ...prev]);
        toast({
          title: "Movie added",
          description: `"${movie.title}" has been added.`,
        });
      } else {
        // Simulate adding to sample data
        const newMovie = {
          ...movie,
          id: (Math.random() * 1000).toString()
        };
        setMovies(prev => [newMovie, ...prev]);
        toast({
          title: "Movie added (sample mode)",
          description: `"${movie.title}" has been added to sample data.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error adding movie",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update a movie
  const updateMovie = async (movie: Movie) => {
    try {
      setLoading(true);
      
      if (databaseConnected) {
        const { error } = await supabase
          .from('movies')
          .update(movie)
          .eq('id', movie.id);
          
        if (error) throw error;
      }
      
      // Update local state regardless of database connection
      setMovies(prev => prev.map(m => m.id === movie.id ? movie : m));
      
      toast({
        title: "Movie updated",
        description: `"${movie.title}" has been updated.`,
      });
    } catch (err: any) {
      toast({
        title: "Error updating movie",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete a movie
  const deleteMovie = async (id: string) => {
    try {
      setLoading(true);
      
      if (databaseConnected) {
        const { error } = await supabase
          .from('movies')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Remove from local state regardless of database connection
      const movieTitle = movies.find(m => m.id === id)?.title || "Movie";
      setMovies(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Movie deleted",
        description: `"${movieTitle}" has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: "Error deleting movie",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MovieContext.Provider
      value={{
        movies,
        loading,
        error,
        addMovie,
        updateMovie,
        deleteMovie,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovies must be used within a MovieProvider");
  }
  return context;
};
