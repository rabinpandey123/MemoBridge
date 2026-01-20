# app/routes/games.py - UPDATED
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, GameSession
import random
from datetime import datetime

bp = Blueprint('games', __name__, url_prefix='/api/games')


# ADVANCED AI WITH MINIMAX ALGORITHM FOR TIC TAC TOE
def get_ai_move(board):
    """Advanced AI using minimax algorithm for optimal play"""

    # For first move, sometimes take center, sometimes corner
    if board.count('') == 9:
        return random.choice([0, 2, 4, 6, 8])

    # Use minimax for optimal moves
    best_score = -float('inf')
    best_move = None

    for i in range(9):
        if board[i] == '':
            board[i] = 'O'
            score = minimax(board, 0, False)
            board[i] = ''

            if score > best_score:
                best_score = score
                best_move = i

    return best_move


def minimax(board, depth, is_maximizing):
    """Minimax algorithm for perfect Tic-Tac-Toe AI"""
    result = check_winner(board)

    if result == 'O':  # AI wins
        return 10 - depth
    elif result == 'X':  # Player wins
        return depth - 10
    elif result == 'tie':  # Tie
        return 0

    if is_maximizing:
        best_score = -float('inf')
        for i in range(9):
            if board[i] == '':
                board[i] = 'O'
                score = minimax(board, depth + 1, False)
                board[i] = ''
                best_score = max(score, best_score)
        return best_score
    else:
        best_score = float('inf')
        for i in range(9):
            if board[i] == '':
                board[i] = 'X'
                score = minimax(board, depth + 1, True)
                board[i] = ''
                best_score = min(score, best_score)
        return best_score


def check_winner(board):
    lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]

    for line in lines:
        if board[line[0]] == board[line[1]] == board[line[2]] != '':
            return board[line[0]]

    if '' not in board:
        return 'tie'

    return None


# OPTIONS handlers for CORS preflight
@bp.route('/tic_tac_toe/move', methods=['OPTIONS'])
def tic_tac_toe_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/tic_tac_toe/move', methods=['POST'])
@jwt_required()
def tic_tac_toe_move():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        board = data.get('board', [''] * 9)
        player_move = data.get('playerMove')

        # Validate player move
        if player_move is not None:
            if player_move < 0 or player_move > 8:
                return jsonify({'error': 'Invalid move'}), 400
            if board[player_move] != '':
                return jsonify({'error': 'Cell already occupied'}), 400

        # Update board with player's move
        if player_move is not None and board[player_move] == '':
            board[player_move] = 'X'

        # Check game status after player's move
        winner = check_winner(board)
        game_over = False
        ai_move = None

        if winner:
            game_over = True
            # Save game session
            game_session = GameSession(
                user_id=user_id,
                game_type='tic_tac_toe',
                score=1 if winner == 'X' else 0,
                moves=len([cell for cell in board if cell != ''])
            )
            db.session.add(game_session)
            db.session.commit()
        else:
            # AI's move
            ai_move = get_ai_move(board)
            if ai_move is not None:
                board[ai_move] = 'O'

            # Check game status after AI's move
            winner = check_winner(board)
            if winner:
                game_over = True
                # Save game session
                game_session = GameSession(
                    user_id=user_id,
                    game_type='tic_tac_toe',
                    score=1 if winner == 'X' else 0,
                    moves=len([cell for cell in board if cell != ''])
                )
                db.session.add(game_session)
                db.session.commit()

        return jsonify({
            'board': board,
            'aiMove': ai_move,
            'winner': winner,
            'gameOver': game_over
        }), 200

    except Exception as e:
        print(f"Tic-Tac-Toe error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


# OPTIMIZED MEMORY GAME FUNCTIONS FOR FASTER PLAY
@bp.route('/memory/cards', methods=['OPTIONS'])
def memory_cards_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/memory/cards', methods=['GET'])
@jwt_required()
def get_memory_cards():
    try:
        # Generate memory card pairs with more symbols for variety
        symbols = ['🎵', '🎨', '📚', '🏀', '🐱', '🐶', '🌺', '🍎', '🚀', '⭐', '🌈', '⚽']
        selected_symbols = random.sample(symbols, 8)  # Use 8 pairs for 16 cards
        cards = selected_symbols * 2
        random.shuffle(cards)

        return jsonify({
            'cards': [{'id': i, 'symbol': card, 'flipped': False, 'matched': False}
                      for i, card in enumerate(cards)]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def get_memory_ai_move(cards, ai_memory, difficulty='medium'):
    """
    OPTIMIZED AI for memory game with different difficulty levels
    - FIXED: Always returns valid card IDs
    - easy: Random moves with basic memory
    - medium: Good memory with strategy (faster decision making)
    - hard: Near-perfect memory with optimized matching
    """

    # Get all available unmatched cards
    available_cards = [card for card in cards if not card['matched'] and not card['flipped']]

    if not available_cards:
        return None, ai_memory

    # Update AI memory with currently flipped cards
    flipped_cards = [card for card in cards if card['flipped'] and not card['matched']]
    for card in flipped_cards:
        ai_memory[card['id']] = card['symbol']

    # Strategy 1: If one card is flipped, try to find its match quickly
    if len(flipped_cards) == 1:
        flipped_card = flipped_cards[0]

        # Fast lookup for matching card in memory
        for card_id, symbol in ai_memory.items():
            if (symbol == flipped_card['symbol'] and
                    card_id != flipped_card['id'] and
                    not any(c['id'] == card_id and (c['matched'] or c['flipped']) for c in cards)):
                # Verify the card exists and is available
                target_card = next((c for c in available_cards if c['id'] == card_id), None)
                if target_card:
                    return card_id, ai_memory

        # If no match found, use difficulty-based strategy
        if difficulty == 'easy':
            move = random.choice(available_cards)['id']
        elif difficulty == 'medium':
            # Prefer cards not in memory to gather more information
            unseen = [c for c in available_cards if c['id'] not in ai_memory]
            if unseen:
                move = random.choice(unseen)['id']
            else:
                move = random.choice(available_cards)['id']
        else:  # hard
            # Strategic choice
            move = random.choice(available_cards)['id']

        return move, ai_memory

    # Strategy 2: No cards flipped or need to flip first card
    else:
        # First, try to find a known pair quickly
        symbol_locations = {}
        for card_id, symbol in ai_memory.items():
            # Check if card is still available (not matched or flipped)
            card_available = any(c['id'] == card_id and not c['matched'] and not c['flipped'] for c in cards)
            if card_available:
                if symbol in symbol_locations:
                    # Found a pair! Return the first card of the pair
                    return symbol_locations[symbol], ai_memory
                symbol_locations[symbol] = card_id

        # If no known pairs, use difficulty-based card selection
        if difficulty == 'easy':
            move = random.choice(available_cards)['id']
        elif difficulty == 'medium':
            # Mix of exploring new cards and using memory
            unseen = [c for c in available_cards if c['id'] not in ai_memory]
            if unseen and random.random() > 0.3:  # 70% chance to explore
                move = random.choice(unseen)['id']
            else:
                move = random.choice(available_cards)['id']
        else:  # hard
            # Always explore unseen cards first when no pairs known
            unseen = [c for c in available_cards if c['id'] not in ai_memory]
            if unseen:
                move = random.choice(unseen)['id']
            else:
                move = random.choice(available_cards)['id']

        return move, ai_memory


# FIXED: Add the missing ai_turn endpoint that your frontend is calling
@bp.route('/memory/ai_turn', methods=['OPTIONS'])
def memory_ai_turn_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/memory/ai_turn', methods=['POST'])
@jwt_required()
def memory_ai_turn():
    try:
        data = request.get_json()
        cards = data.get('cards', [])
        ai_memory = data.get('ai_memory', {})
        difficulty = data.get('difficulty', 'medium')

        ai_move, updated_memory = get_memory_ai_move(cards, ai_memory, difficulty)

        return jsonify({
            'ai_move': ai_move,
            'ai_memory': updated_memory
        }), 200

    except Exception as e:
        print(f"Memory AI error: {str(e)}")
        return jsonify({'error': 'AI move failed'}), 500


# Keep the existing ai_move endpoint for backward compatibility
@bp.route('/memory/ai_move', methods=['OPTIONS'])
def memory_ai_move_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/memory/ai_move', methods=['POST'])
@jwt_required()
def memory_ai_move():
    try:
        data = request.get_json()
        cards = data.get('cards', [])
        ai_memory = data.get('ai_memory', {})
        difficulty = data.get('difficulty', 'medium')

        ai_move, updated_memory = get_memory_ai_move(cards, ai_memory, difficulty)

        return jsonify({
            'ai_move': ai_move,
            'ai_memory': updated_memory
        }), 200

    except Exception as e:
        print(f"Memory AI error: {str(e)}")
        return jsonify({'error': 'AI move failed'}), 500


@bp.route('/memory/save_score', methods=['OPTIONS'])
def memory_save_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/memory/save_score', methods=['POST'])
@jwt_required()
def save_memory_score():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # FIXED: Add validation for required fields
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        score = data.get('score')
        moves = data.get('moves')

        if score is None or moves is None:
            return jsonify({'error': 'Missing score or moves data'}), 400

        game_session = GameSession(
            user_id=user_id,
            game_type='memory',
            score=score,
            moves=moves
        )

        db.session.add(game_session)
        db.session.commit()

        return jsonify({'message': 'Memory game score saved'}), 200

    except Exception as e:
        print(f"Save memory score error: {str(e)}")
        return jsonify({'error': 'Failed to save score'}), 500


# SCORES ENDPOINTS
@bp.route('/scores', methods=['OPTIONS'])
def scores_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/scores', methods=['GET'])
@jwt_required()
def get_game_scores():
    try:
        user_id = get_jwt_identity()
        scores = GameSession.query.filter_by(user_id=user_id).order_by(GameSession.created_at.desc()).limit(10).all()

        return jsonify({
            'scores': [{
                'id': score.id,
                'game_type': score.game_type,
                'score': score.score,
                'moves': score.moves,
                'created_at': score.created_at.isoformat() if score.created_at else None
            } for score in scores]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# NEW: Get game statistics
@bp.route('/stats', methods=['OPTIONS'])
def stats_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_game_stats():
    try:
        user_id = get_jwt_identity()

        # Get total games played
        total_games = GameSession.query.filter_by(user_id=user_id).count()

        # Get wins by game type
        tic_tac_toe_wins = GameSession.query.filter_by(
            user_id=user_id,
            game_type='tic_tac_toe',
            score=1
        ).count()

        tic_tac_toe_total = GameSession.query.filter_by(
            user_id=user_id,
            game_type='tic_tac_toe'
        ).count()

        memory_high_score = db.session.query(db.func.max(GameSession.score)).filter_by(
            user_id=user_id,
            game_type='memory'
        ).scalar() or 0

        return jsonify({
            'total_games': total_games,
            'tic_tac_toe': {
                'wins': tic_tac_toe_wins,
                'total': tic_tac_toe_total,
                'win_rate': tic_tac_toe_wins / tic_tac_toe_total if tic_tac_toe_total > 0 else 0
            },
            'memory': {
                'high_score': memory_high_score
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# NEW: Reset game data
@bp.route('/reset', methods=['OPTIONS'])
def reset_options():
    return jsonify({'message': 'CORS preflight'}), 200


@bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_game_data():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        game_type = data.get('game_type', 'all')

        if game_type == 'all':
            # Delete all games for user
            GameSession.query.filter_by(user_id=user_id).delete()
        else:
            # Delete specific game type
            GameSession.query.filter_by(user_id=user_id, game_type=game_type).delete()

        db.session.commit()

        return jsonify({'message': f'{game_type} game data reset successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500