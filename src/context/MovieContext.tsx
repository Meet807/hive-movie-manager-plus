import React, { createContext, useContext, useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MovieContextType {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  addMovie: (movie: Omit<Movie, "id">) => Promise<void>;
  updateMovie: (movie: Movie) => Promise<void>;
  deleteMovie: (id: string) => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

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

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Attempting to fetch movies from Supabase...");
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data, error } = await supabase
          .from('movies')
          .select('*')
          .order('title', { ascending: true });
        
        if (error) {
          console.error("Database error:", error);
          setMovies(sampleMovies);
          setDatabaseConnected(false);
          
          toast({
            title: "Using sample data",
            description: "Unable to connect to database. Using sample data instead.",
            variant: "destructive",
          });
        } else {
          console.log("Movies loaded from database:", data);
          setMovies(data || []);
          setDatabaseConnected(true);
          
          toast({
            title: "Connected to Supabase",
            description: `Successfully loaded ${data?.length || 0} movies from your database.`,
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch movies:", err);
        setMovies(sampleMovies);
        setDatabaseConnected(false);
        
        toast({
          title: "Error connecting to database",
          description: "Using sample data instead. Please check console for details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [toast]);

  const addMovie = async (movie: Omit<Movie, "id">) => {
    try {
      setLoading(true);
      
      if (databaseConnected) {
        console.log("Adding movie to database:", movie);
        
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
        setMovies(prev => [data, ...prev]);
        
        toast({
          title: "Movie added",
          description: `"${movie.title}" has been added to your database.",
        });
      } else {
        const newMovie = {
          ...movie,
          id: (Math.random() * 1000).toString()
        };
        setMovies(prev => [newMovie, ...prev]);
        
        toast({
          title: "Movie added (sample mode)",
          description: `"${movie.title}" has been added to sample data.",
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

  const updateMovie = async (movie: Movie) => {
    try {
      setLoading(true);
      
      if (databaseConnected) {
        console.log("Updating movie in database:", movie);
        const { error } = await supabase
          .from('movies')
          .update(movie)
          .eq('id', movie.id);
          
        if (error) {
          console.error("Error updating movie:", error);
          throw error;
        }
      }
      
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

  const deleteMovie = async (id: string) => {
    try {
      setLoading(true);
      
      const movieToDelete = movies.find(m => m.id === id);
      if (!movieToDelete) throw new Error("Movie not found");
      
      if (databaseConnected) {
        console.log("Deleting movie from database, ID:", id);
        const { error } = await supabase
          .from('movies')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error("Error deleting movie:", error);
          throw error;
        }
      }
      
      setMovies(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "Movie deleted",
        description: `"${movieToDelete.title}" has been removed.`,
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
