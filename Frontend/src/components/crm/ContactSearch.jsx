import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useCrmStore } from '../../store/crmStore';

export const ContactSearch = () => {
  const [input, setInput] = useState('');
  const { setSelectedEmail } = useCrmStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setSelectedEmail(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative flex items-center gap-2 bg-white rounded-lg border-2 border-gray-200 shadow-md hover:border-blue-400 transition-colors focus-within:border-blue-500 focus-within:shadow-lg">
        <FiSearch className="ml-3 text-gray-400" size={20} />
        <input
          type="email"
          placeholder="Search contact email..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-3 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          className="mr-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Search
        </button>
      </div>
    </form>
  );
};
