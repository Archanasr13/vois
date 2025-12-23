from flask import Blueprint, jsonify, request
from models import db, User, QuizResult, UserInteraction
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone

bp = Blueprint('leaderboard', __name__, url_prefix='/api/leaderboard')

@bp.route('/top-users', methods=['GET'])
def get_top_users():
    """Get top users by score for leaderboard"""
    try:
        limit = request.args.get('limit', 10, type=int)
        period = request.args.get('period', 'all')  # all, week, month
        
        # Base query
        query = User.query
        
        # Filter by period if needed
        if period == 'week':
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            # Get users who have been active in the last week
            active_user_ids = db.session.query(QuizResult.user_id).filter(
                QuizResult.timestamp >= week_ago
            ).distinct().all()
            active_ids = [uid[0] for uid in active_user_ids]
            if active_ids:
                query = query.filter(User.id.in_(active_ids))
        elif period == 'month':
            month_ago = datetime.now(timezone.utc) - timedelta(days=30)
            active_user_ids = db.session.query(QuizResult.user_id).filter(
                QuizResult.timestamp >= month_ago
            ).distinct().all()
            active_ids = [uid[0] for uid in active_user_ids]
            if active_ids:
                query = query.filter(User.id.in_(active_ids))
        
        # Get top users by score
        top_users = query.order_by(desc(User.score)).limit(limit).all()
        
        leaderboard = []
        for idx, user in enumerate(top_users, 1):
            # Get additional stats
            quiz_count = QuizResult.query.filter_by(user_id=user.id).count()
            sim_count = UserInteraction.query.filter_by(user_id=user.id).count()
            
            # Calculate recent activity (last 7 days)
            week_ago = datetime.now(timezone.utc) - timedelta(days=7)
            recent_quizzes = QuizResult.query.filter(
                QuizResult.user_id == user.id,
                QuizResult.timestamp >= week_ago
            ).count()
            
            leaderboard.append({
                'rank': idx,
                'user_id': user.id,
                'name': user.name,
                'department': getattr(user, 'department', 'General'),
                'score': user.score or 0,
                'quiz_count': quiz_count,
                'simulation_count': sim_count,
                'recent_activity': recent_quizzes,
                'badge': get_badge(user.score or 0)
            })
        
        return jsonify({
            'success': True,
            'leaderboard': leaderboard,
            'period': period
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/user-rank/<int:user_id>', methods=['GET'])
def get_user_rank(user_id):
    """Get specific user's rank and stats"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Calculate rank
        higher_scores = User.query.filter(User.score > (user.score or 0)).count()
        rank = higher_scores + 1
        
        # Get total users
        total_users = User.query.count()
        
        # Get user stats
        quiz_count = QuizResult.query.filter_by(user_id=user_id).count()
        sim_count = UserInteraction.query.filter_by(user_id=user_id).count()
        
        # Calculate percentile
        percentile = ((total_users - rank) / total_users * 100) if total_users > 0 else 0
        
        return jsonify({
            'success': True,
            'rank': rank,
            'total_users': total_users,
            'percentile': round(percentile, 1),
            'score': user.score or 0,
            'quiz_count': quiz_count,
            'simulation_count': sim_count,
            'badge': get_badge(user.score or 0)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@bp.route('/achievements/<int:user_id>', methods=['GET'])
def get_achievements(user_id):
    """Get user achievements and badges"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        quiz_count = QuizResult.query.filter_by(user_id=user_id).count()
        sim_count = UserInteraction.query.filter_by(user_id=user_id).count()
        
        # Get correct simulations
        correct_sims = UserInteraction.query.filter_by(
            user_id=user_id,
            is_correct=True
        ).count()
        
        # Calculate streak (consecutive days with activity)
        streak = calculate_streak(user_id)
        
        achievements = []
        
        # Score-based achievements
        if user.score >= 100:
            achievements.append({
                'id': 'first_100',
                'name': 'Getting Started',
                'description': 'Earned your first 100 points',
                'icon': '🎯',
                'unlocked': True
            })
        
        if user.score >= 500:
            achievements.append({
                'id': 'intermediate',
                'name': 'Intermediate Guardian',
                'description': 'Reached 500 points',
                'icon': '🛡️',
                'unlocked': True
            })
        
        if user.score >= 1000:
            achievements.append({
                'id': 'expert',
                'name': 'Security Expert',
                'description': 'Reached 1000 points',
                'icon': '⭐',
                'unlocked': True
            })
        
        # Quiz achievements
        if quiz_count >= 5:
            achievements.append({
                'id': 'quiz_5',
                'name': 'Quiz Master',
                'description': 'Completed 5 quizzes',
                'icon': '📝',
                'unlocked': True
            })
        
        if quiz_count >= 10:
            achievements.append({
                'id': 'quiz_10',
                'name': 'Knowledge Seeker',
                'description': 'Completed 10 quizzes',
                'icon': '📚',
                'unlocked': True
            })
        
        # Simulation achievements
        if sim_count >= 10:
            achievements.append({
                'id': 'sim_10',
                'name': 'Threat Hunter',
                'description': 'Completed 10 simulations',
                'icon': '🎮',
                'unlocked': True
            })
        
        if correct_sims >= 20:
            achievements.append({
                'id': 'perfect_20',
                'name': 'Perfect Defense',
                'description': '20 correct simulation responses',
                'icon': '🏆',
                'unlocked': True
            })
        
        # Streak achievements
        if streak >= 3:
            achievements.append({
                'id': 'streak_3',
                'name': '3-Day Streak',
                'description': 'Active for 3 consecutive days',
                'icon': '🔥',
                'unlocked': True
            })
        
        if streak >= 7:
            achievements.append({
                'id': 'streak_7',
                'name': 'Week Warrior',
                'description': 'Active for 7 consecutive days',
                'icon': '💪',
                'unlocked': True
            })
        
        return jsonify({
            'success': True,
            'achievements': achievements,
            'streak': streak,
            'total_unlocked': len(achievements)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_badge(score):
    """Get badge based on score"""
    if score >= 1000:
        return {'name': 'Expert', 'icon': '⭐', 'color': 'gold'}
    elif score >= 500:
        return {'name': 'Advanced', 'icon': '🛡️', 'color': 'silver'}
    elif score >= 100:
        return {'name': 'Intermediate', 'icon': '🎯', 'color': 'bronze'}
    else:
        return {'name': 'Beginner', 'icon': '🌱', 'color': 'gray'}

def calculate_streak(user_id):
    """Calculate consecutive days of activity"""
    try:
        # Get all quiz dates for user
        quiz_dates = db.session.query(
            func.date(QuizResult.timestamp)
        ).filter(
            QuizResult.user_id == user_id
        ).distinct().order_by(
            desc(func.date(QuizResult.timestamp))
        ).all()
        
        if not quiz_dates:
            return 0
        
        streak = 0
        current_date = datetime.now(timezone.utc).date()
        
        for date_tuple in quiz_dates:
            date = date_tuple[0]
            if isinstance(date, str):
                date = datetime.fromisoformat(date).date()
            
            expected_date = current_date - timedelta(days=streak)
            
            if date == expected_date:
                streak += 1
            else:
                break
        
        return streak
    except Exception:
        return 0
