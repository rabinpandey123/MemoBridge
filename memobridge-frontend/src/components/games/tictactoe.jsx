// src/components/games/tictactoe.jsx - UPDATED
import React, { useState } from 'react';
import { useAuth } from '../contexts/authcontext';

const TicTacToe = () => {
    const [board, setBoard] = useState(Array(9).fill(''));
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState(null);
    const [loading, setLoading] = useState(false);
    const { getToken, user } = useAuth();

    const containerStyle = {
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px'
    };

    const titleStyle = {
        fontSize: '2.5rem',
        margin: '20px 0',
        color: '#2c5aa0'
    };

    const statusStyle = {
        fontSize: '1.5rem',
        margin: '20px 0',
        fontWeight: 'bold',
        color: '#2c5aa0',
        minHeight: '40px'
    };

    const boardStyle = {
        display: 'inline-block',
        border: '4px solid #2c5aa0',
        borderRadius: '15px',
        overflow: 'hidden',
        margin: '20px 0',
        backgroundColor: '#f8f9fa'
    };

    const rowStyle = {
        display: 'flex'
    };

    const cellStyle = (index) => ({
        width: '80px',
        height: '80px',
        border: '2px solid #2c5aa0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        fontWeight: 'bold',
        cursor: gameOver || board[index] !== '' || loading ? 'default' : 'pointer',
        backgroundColor: '#ffffff',
        transition: 'background-color 0.2s ease'
    });

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

    const makeMove = async (index) => {
        if (board[index] !== '' || gameOver || loading) return;

        setLoading(true);
        try {
            const token = getToken();
            
            if (!token) {
                throw new Error('Please login to play games');
            }

            const response = await fetch('http://127.0.0.1:5000/api/games/tic_tac_toe/move', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    board: board,
                    playerMove: index
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }
            
            setBoard(data.board);
            setGameOver(data.gameOver);
            setWinner(data.winner);
        } catch (error) {
            console.error('Error making move:', error);
            alert(`Error: ${error.message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(''));
        setGameOver(false);
        setWinner(null);
    };

    const getStatusMessage = () => {
        if (loading) return "Thinking...";
        if (gameOver) {
            if (winner === 'tie') return "It's a tie! 🤝";
            if (winner === 'X') return "You win! 🎉";
            return "AI wins! 🤖";
        }
        return "Your turn! (You are X)";
    };

    const renderCell = (index) => {
        let cellContent = board[index];
        let cellColor = '#000';
        
        if (cellContent === 'X') cellColor = '#e74c3c';
        if (cellContent === 'O') cellColor = '#3498db';

        return (
            <div
                style={{...cellStyle(index), color: cellColor}}
                onClick={() => makeMove(index)}
                onMouseEnter={(e) => {
                    if (board[index] === '' && !gameOver && !loading) {
                        e.target.style.backgroundColor = '#e8f4fd';
                    }
                }}
                onMouseLeave={(e) => {
                    if (board[index] === '' && !gameOver && !loading) {
                        e.target.style.backgroundColor = '#ffffff';
                    }
                }}
            >
                {cellContent}
            </div>
        );
    };

    // Check if user is logged in
    if (!user) {
        return (
            <div style={containerStyle}>
                <h2 style={titleStyle}>⭕ Tic-Tac-Toe</h2>
                <div style={{...statusStyle, color: '#dc3545'}}>
                    Please login to play games
                </div>
                <button 
                    style={resetButtonStyle} 
                    onClick={() => window.location.href = '/login'}
                >
                    🔐 Login to Play
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>⭕ Tic-Tac-Toe</h2>
            
            <div style={statusStyle}>
                {getStatusMessage()}
            </div>
            
            <div style={boardStyle}>
                {[0, 1, 2].map(row => (
                    <div key={row} style={rowStyle}>
                        {[0, 1, 2].map(col => renderCell(row * 3 + col))}
                    </div>
                ))}
            </div>
            
            <button 
                style={resetButtonStyle} 
                onClick={resetGame}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
                disabled={loading}
            >
                {loading ? '⏳' : '🔄'} New Game
            </button>
        </div>
    );
};

export default TicTacToe;