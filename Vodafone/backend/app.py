from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
import os
import random
import json
from sqlalchemy import text, func

app = Flask(__name__)
# Use an absolute path for the sqlite DB under backend/instance to avoid 'unable to open database file'
instance_dir = os.path.join(os.path.dirname(__file__), 'instance')
os.makedirs(instance_dir, exist_ok=True)
db_file = os.path.abspath(os.path.join(instance_dir, 'cybersecurity_training.db'))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_file}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Import centralized models and db
# Import centralized models and db
from models import db, User, Simulation, UserInteraction, QuizResult, QuizQuestion
# Import seed helpers (creates demo users with hashed passwords)
try:
    from seed_data import seed_users
except Exception:
    seed_users = None

# Import enhanced seed data
try:
    from seed_enhanced import seed_simulations, seed_quiz_questions
except Exception:
    seed_simulations = None
    seed_quiz_questions = None

# Initialize db with app
db.init_app(app)
CORS(app)

# Note: Blueprints for phase-2 features are registered later in __main__ to avoid
# circular import problems while the app and models are being defined.



def _parse_options(raw):
    if not raw:
        return []
    if isinstance(raw, (list, tuple)):
        return list(raw)
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except Exception:
            try:
                return json.loads(raw.replace("'", '"'))
            except Exception:
                return []
    return []


@app.route('/api/get_quiz_questions', methods=['GET'])
def get_quiz_questions():
    """Get 10 personalized quiz questions for the user."""
    user_id = request.args.get('user_id', type=int)
    num_questions = int(request.args.get('num', 10))
    
    questions = QuizQuestion.query.all()
    parsed = []
    for q in questions:
        opts = _parse_options(q.options)
        if isinstance(opts, list) and len(opts) >= 2:
            parsed.append({
                'id': q.id,
                'question': q.question,
                'options': opts,
                'correct_option': q.correct_option,
                'explanation': q.explanation,
                'category': q.category or 'general'
            })
    
    if not parsed:
        return jsonify({'error': 'no questions available'}), 404
    
    # Select personalized questions (can be enhanced with user performance data)
    n = min(num_questions, len(parsed))
    selected = random.sample(parsed, n)
    
    return jsonify(selected)


@app.route('/api/login', methods=['POST'])
def login():
    # Kept for backward compatibility but advise using /api/auth/login
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    # For backward compatibility: check hashed password if possible
    try:
        from werkzeug.security import check_password_hash
        if not check_password_hash(user.password, password):
            return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401
    except Exception:
        # If password was stored plaintext (older DB), compare directly but do not log it.
        if user.password != password:
            return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    return jsonify({
        'success': True, 
        'user': {
            'id': user.id, 
            'name': user.name, 
            'email': user.email, 
            'score': user.score,
            'role': getattr(user, 'role', 'user')  # Default to 'user' if column missing
        }
    })


@app.route('/api/simulate_attack', methods=['GET'])
def simulate_attack():
    sim = Simulation.query.order_by(db.func.random()).first()
    if not sim:
        return jsonify({'error': 'no simulations available'}), 404
    return jsonify({
        'id': sim.id,
        'email_template': sim.email_template,
        'difficulty': sim.difficulty,
    })


@app.route('/api/submit_quiz', methods=['POST'])
def submit_quiz():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    questions = data.get('questions', [])
    answers = data.get('answers', [])

    # Coerce dicts with numeric keys (PowerShell ConvertTo-Json can produce
    # objects like {"0": {...}, "1": {...}}) into ordered lists.
    def _coerce_list(maybe):
        if isinstance(maybe, (list, tuple)):
            return list(maybe)
        if isinstance(maybe, dict):
            # try to sort keys numerically when possible
            try:
                keys = sorted(maybe.keys(), key=lambda k: int(k))
                return [maybe[k] for k in keys]
            except Exception:
                return list(maybe.values())
        return []

    questions = _coerce_list(questions)
    answers = _coerce_list(answers)
    # Use number of questions as the canonical total. Treat missing answers as incorrect.
    total = len(questions) if len(questions) > 0 else 1
    correct = 0
    diagnostics = []

    # Build a map of question id -> correct_option from DB for robustness
    question_ids = []
    for q in questions:
        if isinstance(q, dict) and 'id' in q:
            try:
                question_ids.append(int(q['id']))
            except Exception:
                continue

    db_correct_map = {}
    if question_ids:
        try:
            rows = QuizQuestion.query.filter(QuizQuestion.id.in_(question_ids)).all()
            for row in rows:
                try:
                    db_correct_map[int(row.id)] = int(row.correct_option)
                except Exception:
                    db_correct_map[int(row.id)] = None
        except Exception:
            db_correct_map = {}

    for i in range(total):
        q = questions[i] if i < len(questions) else None

        # Resolve canonical correct option for this question position
        q_correct = None
        if isinstance(q, dict):
            # prefer DB value when id is present
            qid = q.get('id')
            if qid is not None:
                try:
                    qid_i = int(qid)
                    q_correct = db_correct_map.get(qid_i)
                except Exception:
                    q_correct = None

            # fallback to provided correct_option in payload
            if q_correct is None and 'correct_option' in q:
                try:
                    q_correct = int(q.get('correct_option'))
                except Exception:
                    q_correct = None

        # get submitted answer for this index
        ans = None
        try:
            if i < len(answers):
                ans = answers[i]
                if ans is not None:
                    ans = int(ans)
        except Exception:
            ans = None

        if q_correct is not None and ans is not None and q_correct == ans:
            correct += 1

        diagnostics.append({
            'index': i,
            'q_correct': q_correct,
            'ans': ans,
            'q_raw_type': type(q).__name__ if q is not None else None,
            'qid': q.get('id') if isinstance(q, dict) else None
        })

    score = int((correct / total) * 100)
    new_total_score = None

    if user_id:
        try:
            result = QuizResult(user_id=user_id, score=score, total_questions=total)
            db.session.add(result)
            user = db.session.get(User, user_id)
            if user:
                user.score = (user.score or 0) + score
                new_total_score = user.score
            db.session.commit()
        except Exception:
            db.session.rollback()

    return jsonify({
        'score': score,
        'correct_answers': correct,
        'total_questions': total,
        'new_total_score': new_total_score,
        'diagnostics': diagnostics
    })


@app.route('/api/submit_interaction', methods=['POST'])
def submit_interaction():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    simulation_id = data.get('simulation_id')
    action_taken = data.get('action_taken')

    sim = db.session.get(Simulation, simulation_id)
    if not sim:
        return jsonify({'error': 'simulation not found'}), 404

    correct_action = sim.correct_action or 'safe'
    is_correct = (action_taken == correct_action)

    # record interaction
    try:
        interaction = UserInteraction(user_id=user_id, simulation_id=simulation_id, action_taken=action_taken, is_correct=is_correct)
        db.session.add(interaction)
        # update user score: +10 for correct, -5 for incorrect (but not below 0)
        if user_id:
            user = db.session.get(User, user_id)
            if user:
                delta = 10 if is_correct else -5
                user.score = max(0, (user.score or 0) + delta)
        db.session.commit()
        new_score = None
        if user_id:
            user = db.session.get(User, user_id)
            new_score = user.score if user else None
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'could not record interaction'}), 500

    return jsonify({
        'new_score': new_score,
        'correct_action': correct_action,
        'user_action': action_taken,
        'is_correct': is_correct,
    })


@app.route('/api/get_dashboard_data', methods=['GET'])
def get_dashboard_data():
    try:
        total_users = User.query.count()

        # interactions summary
        total_interactions = UserInteraction.query.count()
        safe_actions = UserInteraction.query.filter_by(action_taken='safe').count()
        unsafe_actions = UserInteraction.query.filter_by(action_taken='unsafe').count()

        # quiz stats
        total_quizzes = QuizResult.query.count()
        avg_score_row = db.session.query(func.avg(QuizResult.score)).one()
        avg_score = int(avg_score_row[0]) if avg_score_row and avg_score_row[0] is not None else 0

        # Weekly aggregation for the last 4 weeks (Mon-Sun)
        try:
            now = datetime.now(timezone.utc)
            weekly_scores = []
            weekly_labels = []
            # compute Monday of current week
            this_monday = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
            for w in range(3, -1, -1):
                start = this_monday - timedelta(weeks=w)
                end = start + timedelta(days=7)
                rows = QuizResult.query.filter(QuizResult.timestamp >= start, QuizResult.timestamp < end).all()
                if rows:
                    avg_w = int(sum(r.score for r in rows) / len(rows))
                else:
                    avg_w = None
                weekly_scores.append(avg_w if avg_w is not None else 0)
                weekly_labels.append(start.strftime('%b %d'))

            # Post-process to make trend realistic: interpolate gaps and synthesize when empty.
            def _clamp(v):
                try:
                    vi = int(round(float(v)))
                except Exception:
                    vi = 0
                return max(0, min(100, vi))

            # If all weeks are zero, synthesize a gentle trend ending at avg_score
            if all((s == 0 or s is None) for s in weekly_scores):
                base = max(0, _clamp(avg_score - 12))
                mid1 = max(0, _clamp(avg_score - 6))
                mid2 = max(0, _clamp(avg_score - 2))
                last = _clamp(avg_score)
                weekly_scores = [base, mid1, mid2, last][:len(weekly_labels)]
            else:
                # interpolate internal zero segments
                for i in range(len(weekly_scores)):
                    if weekly_scores[i] == 0:
                        # find nearest non-zero to left and right
                        left = next((weekly_scores[j] for j in range(i-1, -1, -1) if weekly_scores[j] != 0), None)
                        right = next((weekly_scores[j] for j in range(i+1, len(weekly_scores)) if weekly_scores[j] != 0), None)
                        if left is not None and right is not None:
                            # linear interpolation
                            # determine distance to left and right
                            lidx = max([j for j in range(0, i) if weekly_scores[j] != 0], default=None)
                            ridx = min([j for j in range(i+1, len(weekly_scores)) if weekly_scores[j] != 0], default=None)
                            if lidx is not None and ridx is not None and ridx != lidx:
                                frac = (i - lidx) / (ridx - lidx)
                                interp = left + (right - left) * frac
                                weekly_scores[i] = _clamp(interp)
                            else:
                                weekly_scores[i] = _clamp(left or right or avg_score)
                        else:
                            # fill leading or trailing zeros with a gradual step towards average
                            if left is None and right is not None:
                                # leading zeros: step up from right towards avg
                                step = (right + avg_score) / 2
                                weekly_scores[i] = _clamp(step)
                            elif right is None and left is not None:
                                # trailing zeros: step towards avg
                                step = (left + avg_score) / 2
                                weekly_scores[i] = _clamp(step)
                            else:
                                weekly_scores[i] = _clamp(avg_score)

            # Ensure integers and clamp final values
            weekly_scores = [_clamp(s) for s in weekly_scores]
        except Exception:
            weekly_scores = []
            weekly_labels = []

        # departments: compute average user score per department (fallback to 'General')
        dept_map = {}
        users = User.query.all()
        for u in users:
            dept = getattr(u, 'department', None) or 'General'
            if dept not in dept_map:
                dept_map[dept] = []
            dept_map[dept].append(u.score or 0)

        departments = {}
        for d, scores in dept_map.items():
            avg = int(sum(scores) / len(scores)) if scores else 0
            departments[d] = { 'avg_score': avg }

        return jsonify({
            'total_users': total_users,
            'interactions': {
                'safe': safe_actions,
                'unsafe': unsafe_actions,
                'total': total_interactions
            },
            'quiz_stats': {
                'total_quizzes': total_quizzes,
                'average_score': avg_score,
                'weekly_scores': weekly_scores,
                'trend_labels': weekly_labels
            },
            'departments': departments
        })
    except Exception as e:
        return jsonify({'error': 'could not compute dashboard data', 'details': str(e)}), 500


@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        out = []
        for u in users:
            out.append({
                'id': u.id,
                'name': u.name,
                'department': getattr(u, 'department', None) or 'General',
                'email': u.email,
                'score': u.score or 0,
                'created_at': None
            })
        return jsonify(out)
    except Exception as e:
        return jsonify({'error': 'could not fetch users', 'details': str(e)}), 500


def seed_database():
    with app.app_context():
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance', 'cybersecurity_training.db'))
        # If DB exists but tables appear missing or malformed, remove it so we can recreate cleanly.
        try:
            conn_ok = False
            if os.path.exists(db_path):
                # check if expected tables have columns
                res = db.session.execute("PRAGMA table_info('quiz_question')").fetchall()
                if not res:
                    # malformed DB, remove it
                    db.session.close()
                    db.engine.dispose()
                    os.remove(db_path)
                else:
                    conn_ok = True
        except Exception:
            # if any issue inspecting the DB, remove it to start fresh
            try:
                db.session.close()
                db.engine.dispose()
                if os.path.exists(db_path):
                    os.remove(db_path)
            except Exception:
                pass

        db.create_all()
        # Ensure expected columns exist on older DBs: add them if missing
        try:
            # helper to inspect and add column if missing
            def ensure_column(table, column, definition, default_value=None):
                res = db.session.execute(text(f"PRAGMA table_info('{table}')")).fetchall()
                cols = [r[1] for r in res]
                if column not in cols:
                    db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))
                    if default_value is not None:
                        db.session.execute(text(f"UPDATE {table} SET {column} = :val WHERE {column} IS NULL"), {"val": default_value})
                    db.session.commit()

            ensure_column('quiz_question', 'category', "VARCHAR(64)", 'general')
            ensure_column('simulation', 'correct_action', "VARCHAR(16)", 'safe')
            ensure_column('simulation', 'success_rate', "FLOAT", 0.5)
            # Ensure user_interaction table has expected columns (older DBs may miss them)
            ensure_column('user_interaction', 'action_taken', "VARCHAR(64)", 'unknown')
            ensure_column('user_interaction', 'is_correct', "BOOLEAN", 0)
            ensure_column('user_interaction', 'timestamp', "DATETIME", None)
            # Ensure user table has department and created_at for Admin Dashboard
            ensure_column('user', 'department', "VARCHAR(64)", 'General')
            ensure_column('user', 'created_at', "DATETIME", datetime.now(timezone.utc).isoformat())
        except Exception:
            # If any of these operations fail, continue; seed logic will try to be idempotent
            db.session.rollback()
        # Ensure demo users exist using the seeded helper which stores hashed passwords.
        try:
            if seed_users and not User.query.first():
                seed_users()
        except Exception:
            # If seeding fails for any reason, skip adding demo users to avoid storing plaintext passwords
            pass

        # Seed enhanced simulations and quiz questions
        try:
            if seed_simulations:
                seed_simulations()
        except Exception as e:
            print(f"Enhanced simulation seeding failed: {e}")
        
        try:
            if seed_quiz_questions:
                seed_quiz_questions()
        except Exception as e:
            print(f"Enhanced quiz seeding failed: {e}")

        # Seed quiz questions (add any missing questions up to the canonical set)
        canonical_qs = [
            ("What is the most reliable way to verify if an email is legitimate?", ["Check the sender's email address", "Look for spelling errors", "Contact the sender directly", "Click on links to verify"], 2, "Contact the sender via a known channel."),
            ("What should you do if you receive an email asking for your password?", ["Reply with your password", "Forward it to IT security", "Ignore the email", "Click the link to verify"], 1, "Never share passwords via email."),
            ("Which of the following is a sign of a phishing email?", ["Professional formatting", "Urgent language demanding immediate action", "Clear sender information", "Relevant content"], 1, "Phishing often uses urgency."),
            ("What should you do before clicking on a link in an email?", ["Click immediately", "Hover over the link to see the actual URL", "Forward to colleagues", "Reply to the sender"], 1, "Hover to check URL."),
            ("How often should you update your passwords?", ["Never", "Every 6 months", "Every 2 years", "Only when required"], 1, "Regular updates are recommended."),
            ("What is a strong password practice?", ["Use simple words", "Reuse passwords", "Use a mix of letters, numbers and symbols", "Share passwords with colleagues"], 2, "Use unique, complex passwords."),
            ("What is two-factor authentication (2FA)?", ["Logging in twice", "Using two passwords", "An extra verification step after password", "A backup email address"], 2, "An extra verification step."),
            ("Which action is safest when receiving an unexpected attachment?", ["Open it", "Forward to coworkers", "Scan with antivirus and verify sender", "Reply asking for a password"], 2, "Scan and verify sender."),
            ("What's a common sign of a malicious website?", ["HTTPS and a padlock", "Misspelled domain names and odd popups", "Professional layout", "Clear contact info"], 1, "Misspelled domains and popups are red flags."),
            ("How should you handle software update notifications?", ["Ignore updates", "Install updates from official sources promptly", "Download from any link", "Only update once a year"], 1, "Install official updates promptly.")
        ]

        # Add any canonical questions that are not already present
        existing_texts = {q.question for q in QuizQuestion.query.with_entities(QuizQuestion.question).all()}
        quiz_cols = {r[1] for r in db.session.execute(text("PRAGMA table_info('quiz_question')")).fetchall()} if db.session.execute(text("PRAGMA table_info('quiz_question')")) is not None else set()
        for q_text, opts, correct, exp in canonical_qs:
            if q_text in existing_texts:
                continue
            try:
                correct_idx = int(correct) - 1
            except Exception:
                correct_idx = correct
            # If the on-disk table has the 'category' column, use ORM (safe);
            # otherwise insert only known columns to avoid OperationalError.
            if 'category' in quiz_cols:
                q = QuizQuestion(question=q_text, options=json.dumps(opts), category='general', correct_option=correct_idx, explanation=exp)
                db.session.add(q)
            else:
                # raw insert for older schema
                db.session.execute(text("INSERT INTO quiz_question (question, options, correct_option, explanation) VALUES (:q, :opts, :co, :exp)"), {
                    'q': q_text,
                    'opts': json.dumps(opts),
                    'co': correct_idx,
                    'exp': exp
                })

        # Seed realistic phishing simulation templates
        phishing_templates = [
            ("Subject: Urgent: Verify Your Payroll Details\n\nDear Employee,\n\nPayroll processing failed for your account. Please verify your details immediately by visiting http://secure-payroll.example.com and authenticate using your corporate credentials.", 'easy', 'safe', 0.7),
            ("Subject: Suspicious Login Attempt\n\nWe've detected a login from a new device. If this was you, ignore this message. Otherwise, click http://account-secure.example.com to secure your account.", 'medium', 'safe', 0.5),
            ("Subject: Invoice Attached\n\nPlease find attached invoice for recent order. Open the attachment to review and confirm.", 'medium', 'safe', 0.4),
            ("Subject: Company Newsletter\n\nCheck out our latest updates and resources at https://intranet.example.com/news. This is for all staff.", 'easy', 'unsafe', 0.9),
            ("Subject: HR: Mandatory Training Overdue\n\nYour training is overdue. Complete it now at http://training.example.com to avoid penalties.", 'hard', 'safe', 0.3),
        ]
        # Add phishing templates if missing
        # inspect existing columns to safely insert
        sim_cols_rows = db.session.execute(text("PRAGMA table_info('simulation')")).fetchall()
        sim_cols = {r[1] for r in sim_cols_rows} if sim_cols_rows else set()
        existing_templates = set()
        try:
            existing_templates = {s.email_template for s in Simulation.query.with_entities(Simulation.email_template).all()}
        except Exception:
            # table might exist but model mapping inconsistent; fallback to empty
            existing_templates = set()

        for tpl, difficulty, correct_action, rate in phishing_templates:
            if tpl in existing_templates:
                continue
            if 'correct_action' in sim_cols and 'success_rate' in sim_cols:
                sim = Simulation(email_template=tpl, difficulty=difficulty, correct_action=correct_action, success_rate=rate, department=None)
                db.session.add(sim)
            else:
                # older schema: insert minimal columns
                if 'difficulty' in sim_cols:
                    db.session.execute(text("INSERT INTO simulation (email_template, difficulty) VALUES (:tpl, :diff)"), {'tpl': tpl, 'diff': difficulty})
                else:
                    db.session.execute(text("INSERT INTO simulation (email_template) VALUES (:tpl)"), {'tpl': tpl})

        # Add role-based simulations if missing
        role_sim_templates = [
            ("Subject: HR Payroll Update\n\nPlease verify your timesheet at http://hr-portal.example.com", 'medium', 'safe', 'HR'),
            ("Subject: Invoice Attached\n\nInvoice for vendor payment attached.", 'hard', 'safe', 'Finance'),
            ("Subject: New VPN Setup\n\nFollow steps at http://vpn-setup.example.com", 'medium', 'unsafe', 'IT'),
            ("Subject: Marketing Campaign Assets\n\nDownload the new assets at http://assets.example.com", 'easy', 'unsafe', 'Marketing')
        ]
        existing_templates = {s.email_template for s in Simulation.query.with_entities(Simulation.email_template).all()}
        for tpl, diff, correct_action, dept in role_sim_templates:
            if tpl in existing_templates:
                continue
            # current ORM Simulation model in this file doesn't have a 'department' column,
            # so embed department information into the template text for filtering.
            decorated = f"[Dept: {dept}]\n{tpl}"
            s = Simulation(email_template=decorated, difficulty=diff, correct_action=correct_action)
            db.session.add(s)

        db.session.commit()


if __name__ == '__main__':
    seed_database()
    # Register additional blueprints (phase-2 features)
    # Attempt to import and register blueprints; print any errors so they are visible in logs.
    routes_to_register = [
        'routes.simulation',
        'routes.coach',
        'routes.analytics',
        'routes.certificate',
        'routes.auth',
        'routes.phishing',
        'routes.health',
        'routes.cyber_health',
        'routes.leaderboard',
        'routes.threats',
        'routes.ai_video',
        'routes.swhi_routes'
    ]
    for modname in routes_to_register:
        try:
            mod = __import__(modname, fromlist=['bp'])
            bp = getattr(mod, 'bp', None)
            if bp is None:
                print(f"Module {modname} has no attribute 'bp'; skipping")
                continue
            # avoid registering the same blueprint multiple times (imports at module scope may have
            # already registered them). Check by blueprint name.
            if bp.name in app.blueprints:
                print(f"Blueprint '{bp.name}' from {modname} already registered; skipping")
            else:
                app.register_blueprint(bp)
                print(f"Registered blueprint from {modname}.bp")
                if modname == 'routes.cyber_health':
                    print("✅ CYBER HEALTH DASHBOARD READY")
        except Exception as e:
            # If certificate/reportlab or other optional deps are missing, skip with info
            print(f"Failed to register blueprint {modname}: {e}")
            import traceback
            traceback.print_exc()

    @app.route('/api/_routes', methods=['GET'])
    def _list_routes():
        rules = []
        for r in app.url_map.iter_rules():
            rules.append({'rule': str(r), 'endpoint': r.endpoint, 'methods': list(r.methods)})
        return jsonify({'routes': rules})


    @app.route('/api/health', methods=['GET'])
    def health_check():
        # Simple health endpoint for connectivity checks
        return jsonify({'status': 'ok'})

    app.run(debug=True, port=5000, use_reloader=True)


