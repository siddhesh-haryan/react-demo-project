import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Search from './components/Search';
import NumResult from './components/NumResult';
import Main from './components/Main';
import ListBox from './components/ListBox';
import ListMovies from './components/ListMovies';
import WatchedSummary from './components/WatchedSummary';
import WatchedMovies from './components/WatchedMovies';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import MovieDetails from './components/MovieDetails';
import { useLocalStorageState } from './hooks/useLocalStorageState';

const API_KEY = 'c097f0c5';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState();
  const [error, setError] = useState('');
  /// using custom hook of locale storage

  const [watched, setWatched] = useLocalStorageState([], 'watchedList');

  // using locale storage to store data in website (store watched list)
  // using useEffect

  useEffect(() => {
    // To Cancel and clean up the previous requests
    const controller = new AbortController();
    const fetchingMovie = async () => {
      try {
        setError('');
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`,
          {
            signal: controller.signal,
          },
        );
        // Throw The Error To Show It In Console
        if (!res.ok)
          throw new Error('Something went wrong Not Fetching The Data');
        const data = await res.json();
        if (data.Response === 'False') throw new Error('Movie Not Found');
        setMovies(data.Search);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }
    handleCloseDetailsMovie();
    fetchingMovie();

    return () => {
      controller.abort();
    };
  }, [query]);

  const handleSelectedMovie = (id) => {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  };
  const handleCloseDetailsMovie = () => {
    setSelectedId(null);
  };
  const handleAddToWatchList = (movie) => {
    setWatched((prevWatched) => [...prevWatched, movie]);
  };
  const handleDeleteWatchedMovie = (id) => {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  };
  return (
    <>
      <Navbar>
        <Search
          query={query}
          setQuery={setQuery}
        />
        <NumResult movies={movies} />
      </Navbar>

      <Main>
        <ListBox>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <ListMovies
              movies={movies}
              onSelectMovie={handleSelectedMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </ListBox>
        <ListBox>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseDetailsMovie={handleCloseDetailsMovie}
              onAddToWatchedList={handleAddToWatchList}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovies
                watched={watched}
                onDeleteWatchedMovie={handleDeleteWatchedMovie}
              />
            </>
          )}
        </ListBox>
      </Main>
    </>
  );
}
