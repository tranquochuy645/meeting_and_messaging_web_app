import { useRef, useState, useEffect, KeyboardEvent } from 'react';
import './style.css';
const SearchBar = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = () => {
    const searchTerm = searchInputRef.current?.value;
    if (!searchTerm) {
      return;
    }

    fetch(`/api/search/${searchTerm}`)
      .then(response => {
        if (response.ok) {
          return response.json().then(
            data => {
              setSearchResults(data);
            }
          );
        }
        console.log(response.status);
      });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const handleCreateNewConversation=(id:string)=>{
    console.log(id);
  }
  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchInputRef.current &&
      !searchInputRef.current.contains(event.target as Node)
    ) {
      setSearchResults([]);
      searchInputRef.current.value="";
    }
  };
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div id="search">
      <input
        type="text"
        placeholder="Search for users..."
        ref={searchInputRef}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSearch}>Search</button>

      {searchResults.length > 0 && (
        <div className="search_dropdown">
          {searchResults.map(result => (
            <div key={result._id} onClick={() => { handleCreateNewConversation(result._id) }}>
              <img src={result.avatar} alt="Avatar" />
              {result.fullname}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
