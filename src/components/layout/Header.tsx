import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/patients/${encodeURIComponent(trimmed)}`);
      setSearchValue('');
    }
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4">
      <button onClick={onMenuClick} className="lg:hidden">
        <Bars3Icon className="h-5 w-5 text-gray-500" />
      </button>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Patient UPID..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-9 w-64 rounded-lg border border-gray-300 pl-8 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Go
        </button>
      </form>
    </header>
  );
}
