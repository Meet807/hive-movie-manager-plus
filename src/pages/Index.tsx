
import React, { useState } from "react";
import { useMovies } from "@/context/MovieContext";
import { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import MovieForm from "@/components/MovieForm";
import DeleteConfirmation from "@/components/DeleteConfirmation";

const Index = () => {
  const { movies, addMovie, updateMovie, deleteMovie } = useMovies();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMovie = (movieData: Omit<Movie, "id">) => {
    addMovie(movieData);
    setIsAddDialogOpen(false);
  };

  const handleUpdateMovie = (movieData: Omit<Movie, "id">) => {
    if (editingMovie) {
      updateMovie({ ...movieData, id: editingMovie.id });
      setEditingMovie(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (movieToDelete) {
      deleteMovie(movieToDelete.id);
      setMovieToDelete(null);
    }
  };

  const handleEditClick = (movie: Movie) => {
    setEditingMovie(movie);
  };

  const handleDeleteClick = (id: string) => {
    const movie = movies.find((m) => m.id === id);
    if (movie) {
      setMovieToDelete(movie);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="mb-6 text-center text-4xl font-bold text-primary">Movie Hive</h1>
        
        <div className="mx-auto mb-4 flex max-w-3xl items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search movies by title or director..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Movie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Movie</DialogTitle>
              </DialogHeader>
              <MovieForm 
                onSubmit={handleAddMovie} 
                onCancel={() => setIsAddDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {filteredMovies.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            {searchQuery ? "No movies found matching your search." : "Your movie collection is empty."}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Movie
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Edit Movie Dialog */}
      <Dialog open={!!editingMovie} onOpenChange={(open) => !open && setEditingMovie(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Movie</DialogTitle>
          </DialogHeader>
          {editingMovie && (
            <MovieForm
              movie={editingMovie}
              onSubmit={handleUpdateMovie}
              onCancel={() => setEditingMovie(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {movieToDelete && (
        <DeleteConfirmation
          isOpen={!!movieToDelete}
          onClose={() => setMovieToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title={movieToDelete.title}
        />
      )}
    </div>
  );
};

export default Index;
