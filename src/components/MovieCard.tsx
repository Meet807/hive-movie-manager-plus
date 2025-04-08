
import React from "react";
import { Movie } from "@/types/movie";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Star, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  onEdit: (movie: Movie) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  onEdit, 
  onDelete, 
  className 
}) => {
  return (
    <Card className={cn("movie-card group h-full", className)}>
      <CardContent className="p-0">
        <div className="relative h-full">
          <img 
            src={movie.poster} 
            alt={`${movie.title} poster`} 
            className="movie-poster"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://placehold.co/300x450/222/ddd?text=No+Poster";
            }}
          />
          
          <div className="movie-info">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold line-clamp-1">{movie.title}</h3>
                <p className="text-sm text-gray-300">{movie.year} • {movie.director}</p>
              </div>
              
              <div className="flex items-center space-x-1 rounded bg-primary/80 px-2 py-1 text-sm">
                <Star className="h-3 w-3 fill-white text-white" />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            </div>
            
            {movie.description && (
              <p className="mt-2 text-xs line-clamp-2 text-gray-300">{movie.description}</p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="absolute right-2 top-2 rounded-full bg-black/50 p-1 opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(movie)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(movie.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
