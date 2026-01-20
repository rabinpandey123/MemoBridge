// src/components/games/memorygame.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authcontext';

const MemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const { getToken } = useAuth();

    const containerStyle = {
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        margin: '20px 0',
        color: '#2c5aa0'
    };

    const gameInfoStyle = {
        display: 'flex',
        justifyContent: 'space-around',
        margin: '20px 0',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#2c5aa0'
    };

    const boardStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        margin: '20px 0'
    };

    const cardStyle = (isFlipped, isMatched) => ({
        height: '100px',
        perspective: '1000px',
        cursor: isFlipped || isMatched ? 'default' : 'pointer'
    });

    const cardInnerStyle = (isFlipped) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        transition: 'transform 0.6s',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
    });

    const cardFaceStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        fontSize: '2rem',
        fontWeight: 'bold'
    };

    const frontStyle = {
        ...cardFaceStyle,
        background: 'linear-gradient(135deg, #2c5aa0, #3498db)',
        color: 'white'
    };

    const backStyle = {
        ...cardFaceStyle,
        background: 'white',
        border: '3px solid #2c5aa0',
        transform: 'rotateY(180deg)'
    };

    const resetButtonStyle = {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '15px 30px',
        borderRadius: '8px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        marginTop: '20px',
        fontWeight: 'bold'
    };

    useEffect(() => {
        initializeGame();
    }, []);

    useEffect(() => {
        if (matchedCards.length > 0 && matchedCards.length === cards.length) {
            setGameCompleted(true);
        }
    }, [matchedCards, cards.length]);

    const initializeGame = async () => {
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:5000/api/games/memory/cards', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load game');
            }
            
            setCards(data.cards);
            setFlippedCards([]);
            setMatchedCards([]);
            setMoves(0);
            setGameCompleted(false);
        } catch (error) {
            console.error('Error initializing game:', error);
            alert('Error loading game. Please try again.');
        }
    };

    const handleCardClick = async (cardId) => {
        if (flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
            return;
        }

        const newFlippedCards = [...flippedCards, cardId];
        setFlippedCards(newFlippedCards);
        
        if (newFlippedCards.length === 2) {
            setMoves(moves + 1);
            const [firstId, secondId] = newFlippedCards;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard.symbol === secondCard.symbol) {
                setMatchedCards([...matchedCards, firstId, secondId]);
                setFlippedCards([]);
            } else {
                setTimeout(() => setFlippedCards([]), 1000);
            }
        }
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>🎮 Memory Game</h2>
            
            <div style={gameInfoStyle}>
                <div>Moves: {moves}</div>
                <div>Matches: {matchedCards.length / 2}</div>
                {gameCompleted && <div style={{color: '#28a745'}}>Completed! 🎉</div>}
            </div>
            
            <div style={boardStyle}>
                {cards.map(card => {
                    const isFlipped = flippedCards.includes(card.id);
                    const isMatched = matchedCards.includes(card.id);
                    
                    return (
                        <div
                            key={card.id}
                            style={cardStyle(isFlipped, isMatched)}
                            onClick={() => handleCardClick(card.id)}
                        >
                            <div style={cardInnerStyle(isFlipped || isMatched)}>
                                <div style={frontStyle}>?</div>
                                <div style={backStyle}>{card.symbol}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <button 
                style={resetButtonStyle} 
                onClick={initializeGame}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
                🔄 New Game
            </button>
        </div>
    );
};

export default MemoryGame;