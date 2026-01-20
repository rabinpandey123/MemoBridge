import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LargeButton from '../shared/largebutton';

const MusicPlayerPage = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  

  const containerStyle = {
    padding: '20px',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    margin: '20px 0',
    color: '#2c5aa0'
  };

  const playerStyle = {
    backgroundColor: 'white',
    border: '3px solid #9C27B0',
    borderRadius: '20px',
    padding: '30px',
    margin: '30px auto',
    maxWidth: '600px',
    fontSize: '1.3rem'
  };

  const searchContainerStyle = {
    backgroundColor: 'white',
    border: '3px solid #4CAF50',
    borderRadius: '15px',
    padding: '20px',
    margin: '20px auto',
    maxWidth: '600px'
  };

  const inputStyle = {
    padding: '15px',
    fontSize: '1.2rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    width: '100%',
    margin: '10px 0'
  };

  const buttonStyle = {
    padding: '15px 25px',
    fontSize: '1.2rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '5px'
  };

  // UPDATED: WORKING MUSIC DATABASE WITH RELIABLE AUDIO URLs
  const musicDatabase = [
    { 
      id: '1', 
      title: "Relaxing Piano", 
      artist: "Calm Meditation", 
      genre: "Meditation", 
      duration: "3:45",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop"
    },
    { 
      id: '2', 
      title: "Morning Birds", 
      artist: "Nature Sounds", 
      genre: "Nature", 
      duration: "2:30",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=150&h=150&fit=crop"
    },
    { 
      id: '3', 
      title: "Ocean Waves", 
      artist: "Ocean Sounds", 
      genre: "Nature", 
      duration: "4:15",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&h=150&fit=crop"
    },
    { 
      id: '4', 
      title: "Classical Violin", 
      artist: "Mozart", 
      genre: "Classical", 
      duration: "3:20",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      thumbnail: "https://images.unsplash.com/photo-1511192336575-5a79af67b7f0?w=150&h=150&fit=crop"
    },
    { 
      id: '5', 
      title: "Jazz Lounge", 
      artist: "Smooth Jazz", 
      genre: "Jazz", 
      duration: "4:00",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop"
    },
    { 
      id: '6', 
      title: "Ambient Space", 
      artist: "Space Sounds", 
      genre: "Ambient", 
      duration: "5:10",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=150&h=150&fit=crop"
    },
    { 
      id: '7', 
      title: "Soft Guitar", 
      artist: "Acoustic Melodies", 
      genre: "Acoustic", 
      duration: "3:30",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
      thumbnail: "https://images.unsplash.com/photo-1564186763535-ebb21c52731e?w=150&h=150&fit=crop"
    },
    { 
      id: '8', 
      title: "Peaceful Flute", 
      artist: "Wind Instruments", 
      genre: "Meditation", 
      duration: "4:25",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
      thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=150&h=150&fit=crop"
    }
  ];

  // Default playlists
  const defaultPlaylists = [
    {
      name: "Relaxation Music",
      songs: musicDatabase.filter(song => song.genre === "Meditation" || song.genre === "Nature")
    },
    {
      name: "Classical & Jazz", 
      songs: musicDatabase.filter(song => song.genre === "Classical" || song.genre === "Jazz")
    },
    {
      name: "All Music",
      songs: musicDatabase.slice(0, 6) // First 6 songs
    }
  ];

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      handleNext();
    };
    
    const handleError = (e) => {
      console.error('Audio error:', e, audio.error);
      setError(`Audio error: ${audio.error?.message || 'Failed to play audio'}. Please try another song.`);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      console.log('Audio loading started...');
    };

    const handleCanPlay = () => {
      console.log('Audio can play now');
      setError('');
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // SIMPLIFIED AND FIXED: Search music function
  const searchMusic = (query) => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsSearching(true);
    setError('');

    // Simulate API delay
    setTimeout(() => {
      const results = musicDatabase.filter(song => 
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase()) ||
        song.genre.toLowerCase().includes(query.toLowerCase())
      );

      if (results.length === 0) {
        setError(`No songs found for "${query}". Try: piano, jazz, nature, classical, guitar, or flute`);
      } else {
        setSearchResults(results);
      }
      setIsSearching(false);
    }, 500);
  };

  // FIXED: Simple and reliable play function
  const playSong = async (song) => {
    console.log('🎵 Attempting to play:', song.title);
    
    if (!audioRef.current) {
      setError('Audio player not ready');
      return;
    }

    try {
      // Stop current audio
      audioRef.current.pause();
      
      // Set new source
      audioRef.current.src = song.audioUrl;
      
      // Load the audio
      await audioRef.current.load();
      
      console.log('🔊 Audio loaded, attempting to play...');
      
      // Try to play
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Audio playing successfully!');
            setIsPlaying(true);
            setCurrentSong(song);
            setError('');
          })
          .catch((playError) => {
            console.error('❌ Play failed:', playError);
            setError('Playback requires user interaction. Click the play button in the player controls.');
            setIsPlaying(false);
            setCurrentSong(song); // Still set as current song for manual play
          });
      }
    } catch (error) {
      console.error('💥 Audio error:', error);
      setError(`Failed to load audio: ${error.message}`);
      setIsPlaying(false);
    }
  };

  // Play/Pause function
  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (currentSong) {
          // If we have a current song but audio source might be empty
          if (!audioRef.current.src && currentSong.audioUrl) {
            audioRef.current.src = currentSong.audioUrl;
          }
          
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(true);
                setError('');
              })
              .catch(error => {
                console.error('Play failed:', error);
                setError('Cannot play audio. Please select a song first.');
              });
          }
        } else {
          setError('Please select a song first');
        }
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
      setError('Audio error occurred');
    }
  };

  // Next song
  const handleNext = () => {
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  };

  // Previous song
  const handlePrevious = () => {
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIndex]);
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Add to playlist
  const addToPlaylist = (song) => {
    if (!playlist.find(s => s.id === song.id)) {
      setPlaylist(prev => [...prev, song]);
      setError(`"${song.title}" added to playlist!`);
      
      // Auto-play if it's the first song
      if (playlist.length === 0) {
        setTimeout(() => playSong(song), 100);
      }
    } else {
      setError(`"${song.title}" is already in your playlist`);
    }
  };

  // Remove from playlist
  const removeFromPlaylist = (index) => {
    const songTitle = playlist[index].title;
    setPlaylist(prev => prev.filter((_, i) => i !== index));
    setError(`"${songTitle}" removed from playlist`);
  };

  // Format time
  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Progress bar click (seek)
  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;

    const progressBar = e.currentTarget;
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
    const progressBarWidth = progressBar.clientWidth;
    const seekTime = (clickPosition / progressBarWidth) * duration;
    
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() === '') {
      setSearchResults([]);
      setError('');
    }
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchMusic(searchQuery);
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🎵 Universal Music Player</h1>
      <p style={{fontSize: '1.3rem', marginBottom: '20px'}}>
        Search and play relaxing music - Alzheimer's Friendly!
      </p>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        style={{ display: 'none' }}
        preload="metadata"
      />

      {/* Search Section */}
      <div style={searchContainerStyle}>
        <h3 style={{color: '#4CAF50', marginBottom: '15px'}}>Search Relaxing Music</h3>
        
        <form onSubmit={handleSearchSubmit}>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <input
              type="text"
              placeholder="Try: piano, jazz, nature, classical, guitar, flute..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={inputStyle}
            />
            <button 
              type="submit"
              disabled={isSearching}
              style={{...buttonStyle, backgroundColor: isSearching ? '#cccccc' : '#4CAF50'}}
            >
              {isSearching ? '🔍 Searching...' : '🔍 Search'}
            </button>
          </div>
        </form>

        {/* Search Tips */}
        <div style={{fontSize: '1rem', color: '#666', margin: '10px 0', textAlign: 'left'}}>
          <strong>Try these searches:</strong> piano, jazz, nature, classical, guitar, flute, meditation, acoustic
        </div>

        {error && (
          <div style={{
            color: error.includes('added') || error.includes('removed') ? 'green' : 'red',
            backgroundColor: error.includes('added') || error.includes('removed') ? '#e6ffe6' : '#ffe6e6',
            padding: '10px',
            borderRadius: '5px',
            margin: '10px 0',
            border: `2px solid ${error.includes('added') || error.includes('removed') ? 'green' : 'red'}`
          }}>
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{marginTop: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
              <h4>Search Results ({searchResults.length})</h4>
              <button 
                onClick={clearSearch}
                style={{...buttonStyle, backgroundColor: '#ff4444', padding: '8px 15px', fontSize: '1rem'}}
              >
                Clear
              </button>
            </div>
            <div style={{display: 'grid', gap: '10px'}}>
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  style={{
                    padding: '15px',
                    backgroundColor: currentSong?.id === song.id ? '#e1bee7' : '#f9f9f9',
                    border: `2px solid ${currentSong?.id === song.id ? '#9C27B0' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => playSong(song)}
                  onMouseOver={(e) => {
                    if (currentSong?.id !== song.id) {
                      e.currentTarget.style.backgroundColor = '#e8f5e8';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (currentSong?.id !== song.id) {
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }
                  }}
                >
                  <img 
                    src={song.thumbnail} 
                    alt={song.title}
                    style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60x60?text=🎵';
                    }}
                  />
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{song.title}</div>
                    <div style={{color: '#666', fontSize: '1rem'}}>{song.artist}</div>
                    <div style={{color: '#888', fontSize: '0.9rem'}}>{song.genre} • {song.duration}</div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToPlaylist(song);
                    }}
                    style={{...buttonStyle, padding: '8px 12px', fontSize: '1rem'}}
                  >
                    ➕ Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rest of the component remains the same... */}
      {/* [Keep all the existing player controls, playlists, and other sections from your original code] */}

      {/* Quick Playlists */}
      <div style={{margin: '40px 0'}}>
        <h3 style={{color: '#2c5aa0', marginBottom: '20px'}}>Quick Playlists - Click to Play!</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
          {defaultPlaylists.map((playlistItem, index) => (
            <div key={index} style={{
              backgroundColor: 'white',
              border: '2px solid #2196F3',
              borderRadius: '10px',
              padding: '20px'
            }}>
              <h4 style={{color: '#2196F3', marginBottom: '15px'}}>{playlistItem.name}</h4>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {playlistItem.songs.map((song) => (
                  <div
                    key={song.id}
                    style={{
                      padding: '12px',
                      backgroundColor: currentSong?.id === song.id ? '#e1bee7' : '#f9f9f9',
                      border: `2px solid ${currentSong?.id === song.id ? '#9C27B0' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => playSong(song)}
                    onMouseOver={(e) => {
                      if (currentSong?.id !== song.id) {
                        e.currentTarget.style.backgroundColor = '#e8f5e8';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (currentSong?.id !== song.id) {
                        e.currentTarget.style.backgroundColor = '#f9f9f9';
                      }
                    }}
                  >
                    <img 
                      src={song.thumbnail} 
                      alt={song.title}
                      style={{width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover'}}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/45x45?text=🎵';
                      }}
                    />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 'bold', fontSize: '1rem'}}>{song.title}</div>
                      <div style={{color: '#666', fontSize: '0.8rem'}}>{song.artist}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        addToPlaylist(song);
                      }}
                      style={{...buttonStyle, padding: '6px 10px', fontSize: '0.8rem'}}
                    >
                      ➕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Player */}
      {currentSong && (
        <div style={playerStyle}>
          <h3 style={{color: '#9C27B0', marginBottom: '20px'}}>
            {isPlaying ? '🎵 Now Playing' : '⏸ Paused'}
          </h3>
          <div style={{textAlign: 'center'}}>
            <img 
              src={currentSong.thumbnail} 
              alt={currentSong.title}
              style={{
                width: '150px', 
                height: '150px', 
                borderRadius: '10px', 
                marginBottom: '15px',
                objectFit: 'cover',
                border: '3px solid #9C27B0'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150x150?text=🎵';
              }}
            />
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '5px'}}>
              {currentSong.title}
            </div>
            <div style={{fontSize: '1.2rem', color: '#666', marginBottom: '5px'}}>
              {currentSong.artist}
            </div>
            <div style={{color: '#888', marginBottom: '20px'}}>
              {currentSong.genre} • {currentSong.duration}
            </div>

            {/* Progress Bar */}
            <div style={{margin: '20px 0'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#666', marginBottom: '5px'}}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div 
                style={{
                  height: '8px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  margin: '10px 0',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={handleProgressClick}
              >
                <div style={{
                  width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#9C27B0',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            {/* Player Controls */}
            <div style={{display: 'flex', justifyContent: 'center', gap: '15px', margin: '20px 0', alignItems: 'center'}}>
              <button 
                onClick={handlePrevious}
                disabled={playlist.length <= 1}
                style={{
                  ...buttonStyle,
                  backgroundColor: playlist.length <= 1 ? '#cccccc' : '#9C27B0',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  fontSize: '1.2rem'
                }}
              >
                ⏮
              </button>
              
              <button 
                onClick={handlePlayPause}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#9C27B0',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  fontSize: '1.8rem'
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              
              <button 
                onClick={handleNext}
                disabled={playlist.length <= 1}
                style={{
                  ...buttonStyle,
                  backgroundColor: playlist.length <= 1 ? '#cccccc' : '#9C27B0',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  fontSize: '1.2rem'
                }}
              >
                ⏭
              </button>
            </div>

            {/* Volume Control */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '15px 0'}}>
              <span style={{fontSize: '1.5rem'}}>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                style={{width: '120px', cursor: 'pointer'}}
              />
              <span style={{fontSize: '1rem', color: '#666', minWidth: '40px'}}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User Playlist */}
      {playlist.length > 0 && (
        <div style={{margin: '40px 0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h3 style={{color: '#2c5aa0'}}>Your Playlist ({playlist.length} songs)</h3>
            <button 
              onClick={() => setPlaylist([])}
              style={{...buttonStyle, backgroundColor: '#ff4444', padding: '10px 15px'}}
            >
              🗑️ Clear All
            </button>
          </div>
          <div style={{display: 'grid', gap: '10px', maxWidth: '800px', margin: '0 auto'}}>
            {playlist.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                style={{
                  padding: '15px',
                  backgroundColor: currentSong?.id === song.id ? '#e1bee7' : '#f9f9f9',
                  border: `2px solid ${currentSong?.id === song.id ? '#9C27B0' : '#e0e0e0'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => playSong(song)}
                onMouseOver={(e) => {
                  if (currentSong?.id !== song.id) {
                    e.currentTarget.style.backgroundColor = '#e8f5e8';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentSong?.id !== song.id) {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }
                }}
              >
                <div style={{fontWeight: 'bold', color: '#666', minWidth: '30px'}}>{index + 1}.</div>
                <img 
                  src={song.thumbnail} 
                  alt={song.title}
                  style={{width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover'}}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50x50?text=🎵';
                  }}
                />
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 'bold', fontSize: '1rem'}}>{song.title}</div>
                  <div style={{color: '#666', fontSize: '0.9rem'}}>{song.artist} • {song.duration}</div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPlaylist(index);
                  }}
                  style={{...buttonStyle, backgroundColor: '#ff4444', padding: '8px 12px', fontSize: '0.9rem'}}
                >
                  🗑️ Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{marginTop: '40px'}}>
        <LargeButton 
          icon="⬅️" 
          text="Back to Home" 
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            navigate('/');
          }}
        />
      </div>
    </div>
  );
};

export default MusicPlayerPage;