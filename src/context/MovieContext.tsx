
import React, { createContext, useContext, useState, useEffect } from "react";
import { Movie } from "@/types/movie";
import { useToast } from "@/components/ui/use-toast";

// Sample initial movies
const initialMovies: Movie[] = [
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

interface MovieContextType {
  movies: Movie[];
  addMovie: (movie: Omit<Movie, "id">) => void;
  updateMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;
  getMovie: (id: string) => Movie | undefined;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const { toast } = useToast();

  // Load movies from localStorage on mount
  useEffect(() => {
    const savedMovies = localStorage.getItem("movies");
    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    } else {
      setMovies(initialMovies);
    }
  }, []);

  // Save movies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("movies", JSON.stringify(movies));
  }, [movies]);

  const addMovie = (movieData: Omit<Movie, "id">) => {
    const newMovie: Movie = {
      ...movieData,
      id: Date.now().toString(),
    };
    
    setMovies((prevMovies) => [...prevMovies, newMovie]);
    toast({
      title: "Movie Added",
      description: `"${movieData.title}" has been added to your collection.`,
    });
  };

  const updateMovie = (updatedMovie: Movie) => {
    setMovies((prevMovies) =>
      prevMovies.map((movie) =>
        movie.id === updatedMovie.id ? updatedMovie : movie
      )
    );
    
    toast({
      title: "Movie Updated",
      description: `"${updatedMovie.title}" has been updated.`,
    });
  };

  const deleteMovie = (id: string) => {
    const movieToDelete = movies.find((movie) => movie.id === id);
    
    setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== id));
    
    if (movieToDelete) {
      toast({
        title: "Movie Deleted",
        description: `"${movieToDelete.title}" has been removed from your collection.`,
        variant: "destructive",
      });
    }
  };

  const getMovie = (id: string) => {
    return movies.find((movie) => movie.id === id);
  };

  return (
    <MovieContext.Provider
      value={{ movies, addMovie, updateMovie, deleteMovie, getMovie }}
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
