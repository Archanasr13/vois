# A Unified Cybersecurity Simulation and Threat Intelligence Platform

A comprehensive full-stack cybersecurity platform combining realistic phishing simulations, interactive training, and advanced threat intelligence capabilities including the Suspicious Website Hosting Identifier (SWHI) for real-time domain analysis.

## 🚀 Features

### For Users (Government Employees)
- **Realistic Simulations**: Experience authentic phishing emails and ransomware scenarios
- **Interactive Quizzes**: Test cybersecurity knowledge with immediate feedback
- **Progress Tracking**: Monitor awareness scores and training progress
- **Personal Dashboard**: View recommendations and training history
- **🔎 SWHI Analysis**: Analyze suspicious domains and websites for threats (NEW!)

### For Administrators
- **Analytics Dashboard**: Monitor organization-wide training performance
- **Interactive Charts**: Visualize department performance and awareness trends
- **User Management**: Track individual user progress and scores
- **Real-time Statistics**: View safe vs unsafe interaction rates

## 🛠️ Tech Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React**: JavaScript library for building user interfaces
- **TailwindCSS**: Utility-first CSS framework
- **Chart.js**: Data visualization library
- **React Router**: Client-side routing
- **Framer Motion**: Animation library (SWHI)
- **Leaflet**: Interactive maps (SWHI)
- **Lucide React**: Icon library (SWHI)

## 📁 Project Structure

```
cybersecurity-training-platform/
├── backend/
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   ├── SimulationCard.js
│   │   │   ├── QuizCard.js
│   │   │   └── ResultModal.js
│   │   ├── pages/             # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── SimulationPage.js
│   │   │   ├── QuizPage.js
│   │   │   ├── UserDashboard.js
│   │   │   └── AdminDashboard.js
│   │   ├── App.js             # Main application component
│   │   ├── index.js           # Application entry point
│   │   └── index.css          # Global styles
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # TailwindCSS configuration
│   └── postcss.config.js      # PostCSS configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the Flask application:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📊 API Endpoints

### Simulations
- `GET /api/simulate_attack` - Get a random phishing simulation
- `POST /api/submit_interaction` - Submit user response to simulation

### Quizzes
- `GET /api/get_quiz_questions` - Get 5 random quiz questions
- `POST /api/submit_quiz` - Submit quiz answers and get results

### Analytics
- `GET /api/get_dashboard_data` - Get admin dashboard analytics
- `GET /api/users` - Get all users
- `GET /api/user/<id>` - Get specific user data

### SWHI (Domain Analysis)
- `POST /api/swhi/analyze` - Analyze a domain for threats
- `GET /api/swhi/history` - Get analysis history
- `GET /api/swhi/result/<id>` - Get detailed analysis result
- `GET /api/swhi/stats` - Get SWHI usage statistics

## 🎯 Usage

### For Users
1. **Start Simulation**: Click "Start Simulation" to experience a phishing email
2. **Make Decision**: Choose whether the email is safe or unsafe
3. **Get Feedback**: Receive immediate feedback on your choice
4. **Take Quiz**: Test your knowledge with interactive questions
5. **View Progress**: Check your dashboard for scores and recommendations

### For Administrators
1. **Access Admin Dashboard**: Navigate to `/admin` to view analytics
2. **Monitor Performance**: View department-wise performance charts
3. **Track Interactions**: See safe vs unsafe interaction statistics
4. **Manage Users**: View user details and individual progress

### SWHI Domain Analysis
1. **Access SWHI**: Click the "SWHI" (🔎) tab in the navigation bar
2. **Analyze Domain**: Enter a suspicious domain or URL
3. **View Results**: See comprehensive analysis including:
   - Risk score and threat level
   - DNS records and SSL certificate details
   - Hosting provider and geolocation
   - CDN detection and bypass attempts
   - Machine learning threat prediction
   - Network path visualization
4. **Review History**: Access past analyses and re-run checks

For detailed SWHI documentation, see [SWHI_INTEGRATION.md](./SWHI_INTEGRATION.md)

## 🎨 Design Features

- **Glassmorphism Effects**: Modern translucent UI elements
- **Gradient Backgrounds**: Professional color schemes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Interactive Charts**: Real-time data visualization
- **Smooth Animations**: Enhanced user experience

## 🔒 Security Features

- **Safe Training Environment**: All simulations are educational
- **No Real Threats**: Phishing emails are clearly marked as simulations
- **Data Privacy**: User data is stored locally in SQLite
- **CORS Protection**: Proper cross-origin request handling

## 📈 Sample Data

The platform comes pre-loaded with:
- 4 demo users from different departments
- 3 phishing email templates (easy, medium, hard difficulty)
- 5 cybersecurity awareness quiz questions
- Sample interaction data for analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions about the training platform, please contact your IT department.

---

**Built with ❤️ for cybersecurity awareness training**
