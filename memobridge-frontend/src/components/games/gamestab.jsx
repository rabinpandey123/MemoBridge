import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicTacToe from './tictactoe';
import MemoryGame from './memorygame';
import CompetitiveMemoryGame from './competitivememory'; // ADD THIS IMPORT
import LargeButton from '../shared/largebutton';

const GamesTab = () => {
    const [activeGame, setActiveGame] = useState(null);
    const navigate = useNavigate();

    const games = [
        { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', icon: '⭕', description: 'Classic game against AI' },
        { id: 'memory', name: 'Memory Game', icon: '🎮', description: 'Match the pairs' },
        { id: 'competitive-memory', name: 'Memory vs AI', icon: '🧠', description: 'Compete against AI in Memory' } // ADD THIS
    ];

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

    const gamesGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        margin: '40px 0'
    };

    const gameCardStyle = {
        background: 'white',
        borderRadius: '15px',
        padding: '30px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: '3px solid #2c5aa0'
    };

    const gameIconStyle = {
        fontSize: '4rem',
        marginBottom: '15px'
    };

    if (activeGame) {
        return (
            <div style={containerStyle}>
                <button
                    onClick={() => setActiveGame(null)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        fontSize: '1.2rem'
                    }}
                >
                    ← Back to Games
                </button>
                
                {activeGame === 'tic-tac-toe' && <TicTacToe />}
                {activeGame === 'memory' && <MemoryGame />}
                {activeGame === 'competitive-memory' && <CompetitiveMemoryGame />} {/* ADD THIS */}
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>🎮 Games</h1>
            <p style={{ fontSize: '1.3rem', color: '#2c5aa0', marginBottom: '30px' }}>
                Play fun games to exercise your mind!
            </p>
            
            <div style={gamesGridStyle}>
                {games.map(game => (
                    <div 
                        key={game.id}
                        style={gameCardStyle}
                        onClick={() => setActiveGame(game.id)}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-5px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                        }}
                    >
                        <div style={gameIconStyle}>{game.icon}</div>
                        <h3 style={{ fontSize: '1.8rem', margin: '10px 0', color: '#2c5aa0' }}>
                            {game.name}
                        </h3>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>
                            {game.description}
                        </p>
                        <div style={{ 
                            marginTop: '15px', 
                            padding: '8px 16px', 
                            backgroundColor: '#2c5aa0', 
                            color: 'white', 
                            borderRadius: '20px',
                            fontSize: '1.1rem',
                            display: 'inline-block'
                        }}>
                            Click to Play
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '40px' }}>
                <LargeButton 
                    icon="⬅️" 
                    text="Back to Home" 
                    onClick={() => navigate('/')}
                />
            </div>
        </div>
    );
};

export default GamesTab;