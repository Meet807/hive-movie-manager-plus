
import React, { useState } from "react";
import { useMovies } from "@/context/MovieContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Edit, Trash, Plus } from "lucide-react";

const Index = () => {
  const { movies, loading, addMovie, updateMovie, deleteMovie } = useMovies();
  const [formVisible, setFormVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState<null | {id: string}>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [rating, setRating] = useState(5);
  const [poster, setPoster] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const movieData = {
      title,
      director,
      year,
      rating,
      poster,
      description
    };
    
    if (editingMovie) {
      updateMovie({ ...movieData, id: editingMovie.id });
    } else {
      addMovie(movieData);
    }
    
    resetForm();
  };

  const handleEdit = (movie: any) => {
    setTitle(movie.title);
    setDirector(movie.director);
    setYear(movie.year);
    setRating(movie.rating);
    setPoster(movie.poster);
    setDescription(movie.description || "");
    setEditingMovie({ id: movie.id });
    setFormVisible(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setTitle("");
    setDirector("");
    setYear(new Date().getFullYear());
    setRating(5);
    setPoster("");
    setDescription("");
    setEditingMovie(null);
    setFormVisible(false);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Movie Collection</h1>
        <p className="text-muted-foreground mb-4">
          Add, update, and track your favorite movies
        </p>
        
        {!formVisible && (
          <Button 
            className="mx-auto" 
            onClick={() => setFormVisible(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Movie
          </Button>
        )}
      </header>

      {formVisible && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="director" className="block text-sm font-medium mb-1">
                  Director
                </label>
                <Input
                  id="director"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium mb-1">
                    Year
                  </label>
                  <Input
                    id="year"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium mb-1">
                    Rating (0-10)
                  </label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="poster" className="block text-sm font-medium mb-1">
                  Poster URL
                </label>
                <Input
                  id="poster"
                  value={poster}
                  onChange={(e) => setPoster(e.target.value)}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief movie description"
                  className="resize-none"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingMovie ? 'Update Movie' : 'Add Movie'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="relative aspect-[2/3] bg-muted">
                <Skeleton className="absolute inset-0" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No movies in your collection yet.</p>
          <Button 
            className="mt-4" 
            onClick={() => setFormVisible(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Movie
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <Card key={movie.id} className="overflow-hidden group">
              <div className="relative aspect-[2/3] bg-muted">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} poster`}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/300x450/222/ddd?text=No+Poster";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <p className="text-muted-foreground">No Poster</p>
                  </div>
                )}
                
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{movie.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle>{movie.title}</CardTitle>
                <CardDescription>{movie.year} • {movie.director}</CardDescription>
              </CardHeader>
              
              {movie.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {movie.description}
                  </p>
                </CardContent>
              )}
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEdit(movie)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteMovie(movie.id)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
