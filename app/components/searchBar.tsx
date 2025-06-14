"use client";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchBar({ searchTerm, setSearchTerm }: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Buscar"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="p-2 border border-gray-400 rounded-lg w-full bg-white appearance-none outline-amber-700"
    />
  );
}