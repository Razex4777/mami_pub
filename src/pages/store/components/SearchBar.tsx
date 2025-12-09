import { Input } from "@/components/ui/forms/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="relative group mb-4">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
        <Search className="h-4 w-4" />
      </div>
      <Input
        placeholder="Rechercher des produits par nom ou description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 h-11 bg-card/30 border-white/10 hover:bg-card/50 focus:bg-card/50 focus:border-primary/30 rounded-xl text-sm transition-all placeholder:text-muted-foreground/50"
      />
    </div>
  );
};

export default SearchBar;
