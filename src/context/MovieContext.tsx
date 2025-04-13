
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

// Sample movies with corrected types
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
  },
  // Additional Hollywood movies
  {
    id: "4",
    title: "Pulp Fiction",
    director: "Quentin Tarantino",
    year: 1994,
    rating: 8.9,
    poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption."
  },
  {
    id: "5",
    title: "Inception",
    director: "Christopher Nolan",
    year: 2010,
    rating: 8.8,
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  },
  {
    id: "6",
    title: "The Matrix",
    director: "Lana Wachowski, Lilly Wachowski",
    year: 1999,
    rating: 8.7,
    poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers."
  },
  {
    id: "7",
    title: "Parasite",
    director: "Bong Joon Ho",
    year: 2019,
    rating: 8.5,
    poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
  },
  {
    id: "8",
    title: "Interstellar",
    director: "Christopher Nolan",
    year: 2014,
    rating: 8.6,
    poster: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: "9",
    title: "The Lord of the Rings: The Return of the King",
    director: "Peter Jackson",
    year: 2003,
    rating: 9.0,
    poster: "https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWZlMTY3XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    description: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring."
  },
  {
    id: "10",
    title: "Fight Club",
    director: "David Fincher",
    year: 1999,
    rating: 8.8,
    poster: "https://m.media-amazon.com/images/M/MV5BMmEzNTkxYjQtZTc0MC00YTVjLTg5ZTEtZWMwOWVlYzY0NWIwXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg",
    description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more."
  },
  
  // Bollywood movies
  {
    id: "11",
    title: "3 Idiots",
    director: "Rajkumar Hirani",
    year: 2009,
    rating: 8.4,
    poster: "https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    description: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them 'idiots'."
  },
  {
    id: "12",
    title: "Dangal",
    director: "Nitesh Tiwari",
    year: 2016,
    rating: 8.3,
    poster: "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_.jpg",
    description: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression."
  },
  {
    id: "13",
    title: "Lagaan",
    director: "Ashutosh Gowariker",
    year: 2001,
    rating: 8.1,
    poster: "https://m.media-amazon.com/images/M/MV5BNDYxNWUzZmYtOGQxMC00MTdkLTkxOTctYzkyOGIwNWQxZjhmXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg",
    description: "The people of a small village in Victorian India stake their future on a game of cricket against their ruthless British rulers."
  },
  {
    id: "14",
    title: "PK",
    director: "Rajkumar Hirani",
    year: 2014,
    rating: 8.1,
    poster: "https://m.media-amazon.com/images/M/MV5BMTYzOTE2NjkxN15BMl5BanBnXkFtZTgwMDgzMTg0MzE@._V1_.jpg",
    description: "An alien on Earth loses the only device he can use to communicate with his spaceship. His innocent nature and child-like questions force the country to evaluate the impact of religion on its people."
  },
  {
    id: "15",
    title: "Gully Boy",
    director: "Zoya Akhtar",
    year: 2019,
    rating: 8.0,
    poster: "https://m.media-amazon.com/images/M/MV5BZDkzMTQ1YTMtMWY4Ny00MzExLTk1NTktODc5YTAzZjEwYTBiXkEyXkFqcGdeQXVyODY3NjMyMDU@._V1_.jpg",
    description: "A coming-of-age story based on the lives of street rappers in Mumbai."
  },
  {
    id: "16",
    title: "Dil Chahta Hai",
    director: "Farhan Akhtar",
    year: 2001,
    rating: 8.1,
    poster: "https://m.media-amazon.com/images/M/MV5BOWQ5ODU1ZmItYzA3Zi00NTJiLTkzODctYTg0YzI5M2U2MTU0XkEyXkFqcGdeQXVyMTU3ODQxNjkw._V1_.jpg",
    description: "Three inseparable childhood friends are just out of college. Nothing comes between them - until they each fall in love, and their wildly different approaches to relationships creates tension."
  },
  {
    id: "17",
    title: "Andhadhun",
    director: "Sriram Raghavan",
    year: 2018,
    rating: 8.2,
    poster: "https://m.media-amazon.com/images/M/MV5BZWZhMjhhZmYtOTIzOC00MGYzLWI1OGYtM2ZkN2IxNTI4ZWI3XkEyXkFqcGdeQXVyNDAzNDk0MTQ@._V1_.jpg",
    description: "A series of mysterious events change the life of a blind pianist, who must now report a crime that he should technically know nothing of."
  },
  {
    id: "18",
    title: "Queen",
    director: "Vikas Bahl",
    year: 2013,
    rating: 8.2,
    poster: "https://m.media-amazon.com/images/M/MV5BNWYyOWRlOWItZWM5MS00ZjJkLWI0MTUtYTE3NTI5MDAwYjgyXkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_.jpg",
    description: "A Delhi girl from a traditional family sets out on a solo honeymoon after her marriage gets cancelled."
  },
  {
    id: "19",
    title: "Gangs of Wasseypur",
    director: "Anurag Kashyap",
    year: 2012,
    rating: 8.2,
    poster: "https://m.media-amazon.com/images/M/MV5BMTc5NjY4MjUwNF5BMl5BanBnXkFtZTgwODM3NzM5MzE@._V1_.jpg",
    description: "A clash between Sultan and Shahid Khan leads to the expulsion of Khan from Wasseypur, and ignites a deadly blood feud spanning three generations."
  },
  {
    id: "20",
    title: "Taare Zameen Par",
    director: "Aamir Khan",
    year: 2007,
    rating: 8.4,
    poster: "https://m.media-amazon.com/images/M/MV5BMTM0Mzc2NDk0OF5BMl5BanBnXkFtZTcwMzIwMzMzMg@@._V1_.jpg",
    description: "An eight-year-old boy is thought to be a lazy trouble-maker, until the new art teacher has the patience and compassion to discover the real problem behind his struggles in school."
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
          // Convert year from string to number if needed
          const formattedData = data?.map(movie => ({
            ...movie,
            year: typeof movie.year === 'string' ? parseInt(movie.year) : movie.year,
            rating: typeof movie.rating === 'string' ? parseFloat(movie.rating) : movie.rating
          })) as Movie[] || [];
          
          setMovies(formattedData);
          setDatabaseConnected(true);
          
          toast({
            title: "Connected to Supabase",
            description: `Successfully loaded ${formattedData.length} movies from your database.`,
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
        
        // Don't need to specify ID, Supabase will generate one
        const { data, error } = await supabase
          .from('movies')
          .insert({
            title: movie.title,
            director: movie.director,
            year: movie.year.toString(), // Convert number to string for Supabase
            rating: movie.rating,
            poster: movie.poster,
            description: movie.description
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error adding movie:", error);
          throw error;
        }
        
        console.log("Movie added successfully:", data);
        // Convert year back to number
        const newMovie = {
          ...data,
          year: typeof data.year === 'string' ? parseInt(data.year) : data.year,
          rating: typeof data.rating === 'string' ? parseFloat(data.rating) : data.rating
        } as Movie;
        
        setMovies(prev => [newMovie, ...prev]);
        
        toast({
          title: "Movie added",
          description: `"${movie.title}" has been added to your database.`,
        });
      } else {
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

  const updateMovie = async (movie: Movie) => {
    try {
      setLoading(true);
      
      if (databaseConnected) {
        console.log("Updating movie in database:", movie);
        const { error } = await supabase
          .from('movies')
          .update({
            title: movie.title,
            director: movie.director,
            year: movie.year.toString(), // Convert number to string for Supabase
            rating: movie.rating,
            poster: movie.poster,
            description: movie.description
          })
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
