# SWHI Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Vodafone Cybersecurity Platform                   │
│                          + SWHI Integration                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                            │
│                       http://localhost:3000                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Navbar.js                                                   │   │
│  │  ┌────┬────┬────┬────┬────┬────┬────┬────┬────┐           │   │
│  │  │Home│Sim │Quiz│Dash│Ldr │Thrt│Hlth│SWHI│Admn│           │   │
│  │  └────┴────┴────┴────┴────┴────┴────┴────┴────┘           │   │
│  │                                      ↑                       │   │
│  │                                      │ NEW TAB              │   │
│  └──────────────────────────────────────┼───────────────────────┘   │
│                                         │                            │
│  ┌──────────────────────────────────────┼───────────────────────┐   │
│  │  App.js (Router)                     │                       │   │
│  │  ┌───────────────────────────────────▼────────────────────┐ │   │
│  │  │  Route: /swhi                                           │ │   │
│  │  │  Component: SWHIPage                                    │ │   │
│  │  │  Protected: Requires login                              │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  SWHI Page (src/pages/SWHI/)                                │   │
│  │  ┌────────────────────────────────────────────────────────┐ │   │
│  │  │  SWHIPage.jsx (Main Container)                          │ │   │
│  │  │  ┌────────────────────────────────────────────────────┐│ │   │
│  │  │  │ ┌───────────────┐  ┌──────────────┐               ││ │   │
│  │  │  │ │ DomainInput   │  │  History     │               ││ │   │
│  │  │  │ └───────────────┘  └──────────────┘               ││ │   │
│  │  │  │                                                     ││ │   │
│  │  │  │ ┌──────────────────────────────────────────────┐  ││ │   │
│  │  │  │ │         SuspiciousScore (Risk Gauge)          │  ││ │   │
│  │  │  │ └──────────────────────────────────────────────┘  ││ │   │
│  │  │  │                                                     ││ │   │
│  │  │  │ ┌────────────────┐  ┌────────────────┐           ││ │   │
│  │  │  │ │  HostingInfo   │  │  DNSAnalysis   │           ││ │   │
│  │  │  │ └────────────────┘  └────────────────┘           ││ │   │
│  │  │  │                                                     ││ │   │
│  │  │  │ ┌──────────────────────────────────────────────┐  ││ │   │
│  │  │  │ │          SSLAnalysis                          │  ││ │   │
│  │  │  │ └──────────────────────────────────────────────┘  ││ │   │
│  │  │  │                                                     ││ │   │
│  │  │  │ ┌──────────────────────────────────────────────┐  ││ │   │
│  │  │  │ │          NetworkPath (Traceroute)             │  ││ │   │
│  │  │  │ └──────────────────────────────────────────────┘  ││ │   │
│  │  │  │                                                     ││ │   │
│  │  │  │ ┌──────────────────────────────────────────────┐  ││ │   │
│  │  │  │ │      WorldMap (Leaflet Geographic Map)        │  ││ │   │
│  │  │  │ └──────────────────────────────────────────────┘  ││ │   │
│  │  │  │                                                     ││ │   │
│  │  │  │ ┌──────────────────────────────────────────────┐  ││ │   │
│  │  │  │ │    MLPrediction (Threat Classification)       │  ││ │   │
│  │  │  │ └──────────────────────────────────────────────┘  ││ │   │
│  │  │  └───────────────────────────────┬─────────────────┘│ │   │
│  │  │                                   │ API Calls        │ │   │
│  │  └───────────────────────────────────┼──────────────────┘ │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                         │                            │
└─────────────────────────────────────────┼────────────────────────────┘
                                          │
                                          │ HTTPS/JSON
                                          │
┌─────────────────────────────────────────┼────────────────────────────┐
│                           BACKEND (Flask)                             │
│                       http://localhost:5000                           │
├─────────────────────────────────────────┼────────────────────────────┤
│                                         │                             │
│  ┌──────────────────────────────────────▼───────────────────────┐   │
│  │  app.py (Main Flask App)                                     │   │
│  │  ┌──────────────────────────────────────────────────────────┤   │
│  │  │  Blueprint Registration                                   │   │
│  │  │  • routes.simulation                                      │   │
│  │  │  • routes.coach                                           │   │
│  │  │  • routes.analytics                                       │   │
│  │  │  • routes.auth                                            │   │
│  │  │  • routes.swhi_routes  ← NEW                             │   │
│  │  └──────────────────────────────────────────────────────────┘   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  routes/swhi_routes.py (Blueprint: swhi_bp)                  │   │
│  │  ┌──────────────────────────────────────────────────────────┤   │
│  │  │  API Endpoints (Prefix: /api/swhi)                        │   │
│  │  │                                                            │   │
│  │  │  POST   /analyze      → Analyze domain                    │   │
│  │  │                         (Rate Limited: 5/min)             │   │
│  │  │  GET    /history      → Get past analyses                 │   │
│  │  │  GET    /result/<id>  → Get detailed result               │   │
│  │  │  GET    /stats        → Usage statistics                  │   │
│  │  │  GET    /report/<id>  → PDF report                        │   │
│  │  └──────────────────────────┬───────────────────────────────┘   │
│  └─────────────────────────────┼──────────────────────────────────┘│
│                                │                                     │
│  ┌─────────────────────────────▼──────────────────────────────────┐ │
│  │  swhi/analyzer.py (DomainAnalyzer)                            │ │
│  │  ┌────────────────────────────────────────────────────────────┤ │
│  │  │  Analysis Pipeline                                         │ │
│  │  │  1. Clean & validate domain                               │ │
│  │  │  2. DNS resolution (A, AAAA, MX, NS, TXT, CNAME)          │ │
│  │  │  3. SSL certificate check                                 │ │
│  │  │  4. WHOIS lookup                                          │ │
│  │  │  5. Geolocation (ipapi.co)                                │ │
│  │  │  6. CDN detection                                         │ │
│  │  │  7. Subdomain enumeration (crt.sh)                        │ │
│  │  │  8. Rule-based scoring                                    │ │
│  │  │  9. ML prediction (if available)                          │ │
│  │  │  10. Combine scores                                       │ │
│  │  └────────────────────────────┬───────────────────────────────┘ │
│  └─────────────────────────────────┼────────────────────────────────┘│
│                                   │                                  │
│  ┌────────────────────────────────▼────────────────────────────────┐│
│  │  swhi/ml/predictor.py (ThreatPredictor)                        ││
│  │  ┌──────────────────────────────────────────────────────────────┤│
│  │  │  Machine Learning Pipeline                                  ││
│  │  │  1. Extract features (domain age, SSL, DNS patterns)       ││
│  │  │  2. Load model (threat_model.pkl)                          ││
│  │  │  3. Predict (Legitimate / Suspicious / Malicious)          ││
│  │  │  4. Calculate confidence score                             ││
│  │  └──────────────────────────────────────────────────────────────┤│
│  └────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Database (SQLAlchemy + SQLite)                              │   │
│  │  ┌──────────────────────────────────────────────────────────┤   │
│  │  │  Table: swhi_analysis                                     │   │
│  │  │  • id (Primary Key)                                       │   │
│  │  │  • domain                                                 │   │
│  │  │  • timestamp                                              │   │
│  │  │  • real_ip, asn, hosting_provider                         │   │
│  │  │  • country, city                                          │   │
│  │  │  • is_cdn_detected, cdn_provider                          │   │
│  │  │  • suspicious_score, combined_score                       │   │
│  │  │  • ml_prediction                                          │   │
│  │  │  • raw_data (JSON)                                        │   │
│  │  └──────────────────────────────────────────────────────────┘   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                               │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  • ipapi.co          → Geolocation & ASN data                         │
│  • crt.sh            → Certificate transparency (subdomains)          │
│  • DNS Resolvers     → 8.8.8.8, 1.1.1.1, 208.67.222.222              │
│  • WHOIS Servers     → Domain registration info                       │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                         SECURITY FEATURES                              │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ✓ SSRF Protection      → Blocks private IPs, localhost               │
│  ✓ Rate Limiting        → 5 requests/min per IP                       │
│  ✓ Input Validation     → Domain format checking                      │
│  ✓ SQL Injection        → SQLAlchemy ORM protection                   │
│  ✓ Authentication       → Login required to access SWHI               │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW                                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. User enters domain in SWHI UI                                     │
│  2. Frontend sends POST /api/swhi/analyze                             │
│  3. Backend validates & sanitizes input                               │
│  4. DomainAnalyzer performs multi-step analysis                       │
│  5. ML predictor generates threat score                               │
│  6. Results saved to database                                         │
│  7. JSON response returned to frontend                                │
│  8. Frontend renders visual analysis                                  │
│                                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React 18.2** - UI framework
- **Tailwind CSS 3.2** - Styling
- **Framer Motion 10.16** - Animations
- **Leaflet 1.9** - Maps
- **Lucide React 0.292** - Icons

### Backend
- **Flask 2.3** - Web framework
- **SQLAlchemy 3.0** - ORM
- **dnspython 2.4** - DNS queries
- **python-whois 0.8** - WHOIS lookups
- **scikit-learn 1.3** - Machine learning

### Database
- **SQLite** - Development
- **PostgreSQL** - Production ready

## Integration Points

1. **Navbar** → SWHI tab added
2. **Routing** → `/swhi` route registered
3. **API** → `/api/swhi/*` endpoints
4. **Database** → `swhi_analysis` table
5. **Auth** → Uses existing login system
6. **Styling** → Matches Vodafone theme
