import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authcontext';

const CompetitiveMemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState('user');
    const [userScore, setUserScore] = useState(0);
    const [aiScore, setAiScore] = useState(0);
    const [aiMemory, setAiMemory] = useState({});
    const [gameStatus, setGameStatus] = useState("Your turn! Find matching pairs.");
    const [difficulty, setDifficulty] = useState('medium');
    const { getToken } = useAuth();

    // Styles
    const containerStyle = {
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        margin: '20px 0',
        color: '#2c5aa0',
        fontWeight: 'bold'
    };

    const gameInfoStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '20px',
        margin: '20px 0',
        fontSize: '1.2rem',
        fontWeight: 'bold'
    };

    const scoreStyle = (isActive) => ({
        padding: '15px',
        borderRadius: '10px',
        backgroundColor: isActive ? '#2c5aa0' : '#f8f9fa',
        color: isActive ? 'white' : '#2c5aa0',
        border: `3px solid ${isActive ? '#1a3a6d' : '#2c5aa0'}`,
        transition: 'all 0.3s ease'
    });

    const statusStyle = {
        fontSize: '1.3rem',
        margin: '20px 0',
        padding: '15px',
        backgroundColor: '#e8f4fd',
        borderRadius: '10px',
        border: '2px solid #2c5aa0',
        fontWeight: 'bold'
    };

    const boardStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        margin: '20px 0',
        maxWidth: '500px',
        marginLeft: 'auto',
        marginRight: 'auto'
    };

    const cardStyle = (isFlipped, isMatched) => ({
        height: '100px',
        perspective: '1000px',
        cursor: (currentPlayer === 'user' && !isFlipped && !isMatched) ? 'pointer' : 'default',
        opacity: isMatched ? 0.7 : 1
    });

    const cardInnerStyle = (isFlipped) => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        transition: 'transform 0.3s',
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
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
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

    const buttonStyle = {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        margin: '5px',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
    };

    const difficultyStyle = (level) => ({
        ...buttonStyle,
        backgroundColor: difficulty === level ? '#2c5aa0' : '#6c757d'
    });

    useEffect(() => {
        initializeGame();
    }, []);

    useEffect(() => {
        if (currentPlayer === 'ai' && !gameCompleted) {
            aiTurn();
        }
    }, [currentPlayer]);

    useEffect(() => {
        if (matchedCards.length > 0 && matchedCards.length === cards.length) {
            endGame();
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
            setCurrentPlayer('user');
            setUserScore(0);
            setAiScore(0);
            setAiMemory({});
            setGameStatus("Your turn! Find matching pairs.");
        } catch (error) {
            console.error('Error initializing game:', error);
            alert('Error loading game. Please try again.');
        }
    };

    const aiTurn = async () => {
        setGameStatus("AI is thinking... 🤔");
        
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:5000/api/games/memory/ai_turn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    cards: cards,
                    ai_memory: aiMemory,
                    difficulty: difficulty
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'AI turn failed');
            }

            const { ai_move, ai_memory } = data;
            
            if (ai_move !== null && ai_move !== undefined) {
                // Update AI memory immediately
                setAiMemory(ai_memory);
                
                // SAFETY CHECK: Verify the card exists and is available
                const targetCard = cards.find(card => card.id === ai_move);
                if (!targetCard) {
                    console.error('AI returned invalid card ID:', ai_move);
                    setGameStatus("AI made an invalid move. Your turn!");
                    setCurrentPlayer('user');
                    return;
                }

                if (targetCard.matched || targetCard.flipped) {
                    console.error('AI tried to flip already matched/flipped card:', ai_move);
                    setGameStatus("AI made an invalid move. Your turn!");
                    setCurrentPlayer('user');
                    return;
                }

                // FLIP THE CARD
                setTimeout(() => {
                    setFlippedCards(prev => [...prev, ai_move]);
                    setGameStatus("AI flipped a card!");
                    
                    // Check if this is the first or second flip in AI's turn
                    if (flippedCards.length === 0) {
                        // First flip - AI needs to flip second card
                        setTimeout(() => {
                            aiSecondTurn(ai_memory, ai_move);
                        }, 300);
                    } else {
                        // Second flip - check for match
                        setMoves(prev => prev + 1);
                        setTimeout(() => {
                            checkAiMatch();
                        }, 400);
                    }
                }, 200);
            } else {
                // No moves available
                setGameStatus("AI cannot make a move. Your turn!");
                setCurrentPlayer('user');
            }
        } catch (error) {
            console.error('AI turn error:', error);
            setCurrentPlayer('user');
            setGameStatus("Your turn! AI encountered an error.");
        }
    };

    const aiSecondTurn = async (currentAiMemory, firstMove) => {
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:5000/api/games/memory/ai_turn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    cards: cards,
                    ai_memory: currentAiMemory,
                    difficulty: difficulty
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'AI second turn failed');
            }

            const { ai_move, ai_memory } = data;
            
            if (ai_move !== null && ai_move !== undefined) {
                // Update AI memory
                setAiMemory(ai_memory);
                
                // SAFETY CHECK: Verify the card exists and is available
                const targetCard = cards.find(card => card.id === ai_move);
                if (!targetCard) {
                    console.error('AI returned invalid card ID for second move:', ai_move);
                    setGameStatus("AI made an invalid move. Your turn!");
                    setFlippedCards([]);
                    setCurrentPlayer('user');
                    return;
                }

                if (targetCard.matched || targetCard.flipped) {
                    console.error('AI tried to flip already matched/flipped card (second move):', ai_move);
                    setGameStatus("AI made an invalid move. Your turn!");
                    setFlippedCards([]);
                    setCurrentPlayer('user');
                    return;
                }

                // FLIP SECOND CARD
                setTimeout(() => {
                    setFlippedCards(prev => [...prev, ai_move]);
                    setMoves(prev => prev + 1);
                    
                    // CHECK MATCH with both card IDs
                    setTimeout(() => {
                        checkAiMatchWithIds(firstMove, ai_move);
                    }, 400);
                }, 300);
            } else {
                // No second move available
                setGameStatus("AI couldn't find second move. Your turn!");
                setMoves(prev => prev + 1);
                setTimeout(() => {
                    setFlippedCards([]);
                    setCurrentPlayer('user');
                }, 600);
            }
        } catch (error) {
            console.error('AI second turn error:', error);
            setFlippedCards([]);
            setCurrentPlayer('user');
            setGameStatus("Your turn! AI encountered an error.");
        }
    };

    const checkAiMatchWithIds = (firstId, secondId) => {
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        // EXTRA SAFETY CHECK
        if (!firstCard || !secondCard) {
            console.error('Invalid cards in AI match check:', firstId, secondId);
            setGameStatus("AI made invalid moves. Your turn!");
            setFlippedCards([]);
            setCurrentPlayer('user');
            return;
        }

        if (firstCard.symbol === secondCard.symbol) {
            // AI found a match! - Update matched cards and score
            setMatchedCards(prev => [...prev, firstId, secondId]);
            setFlippedCards([]);
            setAiScore(prev => prev + 1); // This now happens immediately
            setGameStatus("AI found a match! 🎯 AI continues!");
            
            // Check if game completed using updated state
            const newMatchedCount = matchedCards.length + 2;
            if (newMatchedCount === cards.length) {
                setTimeout(() => {
                    endGame();
                }, 800);
            } else {
                // AI goes again immediately
                setTimeout(() => {
                    if (!gameCompleted) {
                        aiTurn();
                    }
                }, 800);
            }
        } else {
            // No match found
            setGameStatus("AI didn't find a match. Your turn!");
            setTimeout(() => {
                setFlippedCards([]);
                setCurrentPlayer('user');
            }, 600);
        }
    };

    const checkAiMatch = () => {
        if (flippedCards.length !== 2) {
            console.error('Expected 2 flipped cards for AI match check, got:', flippedCards.length);
            setFlippedCards([]);
            setCurrentPlayer('user');
            return;
        }

        const [firstId, secondId] = flippedCards;
        checkAiMatchWithIds(firstId, secondId);
    };

    const handleCardClick = async (cardId) => {
        if (currentPlayer !== 'user' || 
            flippedCards.includes(cardId) || 
            matchedCards.includes(cardId) ||
            flippedCards.length >= 2) {
            return;
        }

        const newFlippedCards = [...flippedCards, cardId];
        setFlippedCards(newFlippedCards);
        
        if (newFlippedCards.length === 2) {
            setMoves(prev => prev + 1);
            setGameStatus("Checking your match...");
            
            const [firstId, secondId] = newFlippedCards;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            setTimeout(() => {
                if (firstCard.symbol === secondCard.symbol) {
                    // User found a match!
                    setMatchedCards(prev => [...prev, firstId, secondId]);
                    setFlippedCards([]);
                    setUserScore(prev => prev + 1);
                    setGameStatus("You found a match! 🎉 Your turn continues!");
                    // User continues turn immediately
                } else {
                    // No match
                    setGameStatus("No match found. AI's turn!");
                    setTimeout(() => {
                        setFlippedCards([]);
                        setCurrentPlayer('ai');
                    }, 600);
                }
            }, 600);
        }
    };

    const endGame = () => {
        setGameCompleted(true);
        
        let winner = '';
        if (userScore > aiScore) {
            winner = 'You win! 🎉';
        } else if (aiScore > userScore) {
            winner = 'AI wins! 🤖';
        } else {
            winner = "It's a tie! 🤝";
        }
        
        setGameStatus(`Game Over! ${winner} Final Score: You ${userScore} - ${aiScore} AI`);
        saveGameScore();
    };

    const saveGameScore = async () => {
        try {
            const token = getToken();
            // FIXED: Use the correct endpoint URL
            const response = await fetch('http://127.0.0.1:5000/api/games/memory/save_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    score: userScore,
                    moves: moves
                })
            });

            // FIXED: Check if the response is ok
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save score');
            }

            const data = await response.json();
            console.log('Score saved successfully:', data);
        } catch (error) {
            console.error('Error saving score:', error);
            // Don't show alert to avoid interrupting gameplay
        }
    };

    const getWinnerMessage = () => {
        if (userScore > aiScore) return "Congratulations! You defeated the AI! 🏆";
        if (aiScore > userScore) return "The AI was too strong this time! 🤖";
        return "Well played! It was a close game! 🤝";
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>🧠 Memory Game vs AI</h2>
            
            {/* Difficulty Selection */}
            <div style={{ margin: '20px 0' }}>
                <h3>Select AI Difficulty:</h3>
                <button 
                    style={difficultyStyle('easy')} 
                    onClick={() => setDifficulty('easy')}
                >
                    Easy 🟢
                </button>
                <button 
                    style={difficultyStyle('medium')} 
                    onClick={() => setDifficulty('medium')}
                >
                    Medium 🟡
                </button>
                <button 
                    style={difficultyStyle('hard')} 
                    onClick={() => setDifficulty('hard')}
                >
                    Hard 🔴
                </button>
            </div>

            {/* Game Info */}
            <div style={gameInfoStyle}>
                <div style={scoreStyle(currentPlayer === 'user')}>
                    <div>You</div>
                    <div style={{ fontSize: '2rem' }}>{userScore}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div>Moves: {moves}</div>
                    <div>Matches: {matchedCards.length / 2}</div>
                </div>
                
                <div style={scoreStyle(currentPlayer === 'ai')}>
                    <div>AI</div>
                    <div style={{ fontSize: '2rem' }}>{aiScore}</div>
                </div>
            </div>

            {/* Game Status */}
            <div style={statusStyle}>
                {gameStatus}
            </div>

            {/* Game Board */}
            <div style={boardStyle}>
                {cards.map(card => {
                    const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
                    const isMatched = matchedCards.includes(card.id);
                    
                    return (
                        <div
                            key={card.id}
                            style={cardStyle(isFlipped, isMatched)}
                            onClick={() => handleCardClick(card.id)}
                        >
                            <div style={cardInnerStyle(isFlipped)}>
                                <div style={frontStyle}>?</div>
                                <div style={backStyle}>{card.symbol}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Game Controls */}
            <div style={{ marginTop: '20px' }}>
                <button 
                    style={buttonStyle} 
                    onClick={initializeGame}
                >
                    🔄 New Game
                </button>
                
                {gameCompleted && (
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '20px', 
                        backgroundColor: '#d4edda',
                        border: '2px solid #28a745',
                        borderRadius: '10px'
                    }}>
                        <h3 style={{ color: '#155724', marginBottom: '10px' }}>
                            {getWinnerMessage()}
                        </h3>
                        <p>Final Score: You {userScore} - {aiScore} AI</p>
                        <p>Total Moves: {moves}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitiveMemoryGame;