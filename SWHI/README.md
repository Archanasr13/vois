# 🔍 Suspicious Domain Hosting Identifier

A comprehensive full-stack web application that uncovers the real hosting infrastructure behind suspicious websites, even when they hide behind CDNs like Cloudflare.

## 🎯 Features

### Core Analysis Capabilities
- **Real IP Detection**: Identifies actual hosting provider and IP address
- **CDN Bypass**: Detects and attempts to bypass CDN masking (Cloudflare, Akamai, etc.)
- **DNS Analysis**: Comprehensive DNS record analysis (A, MX, TXT, NS, CNAME)
- **SSL Inspection**: Certificate validation, issuer analysis, and security assessment
- **Subdomain Enumeration**: Discovers subdomains using crt.sh API
- **Geolocation Mapping**: IP geolocation with interactive world map
- **Network Path Analysis**: Traceroute simulation and network topology
- **Suspicious Score**: AI-powered risk assessment based on hosting patterns

### Advanced Features
- **Dark Cyber Theme**: Professional cybersecurity aesthetic
- **Real-time Analysis**: Live domain analysis with progress indicators
- **PDF Export**: Comprehensive security reports
- **Analysis History**: Track previous investigations
- **Interactive Visualizations**: Charts, maps, and network diagrams
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Backend
- **Python Flask**: RESTful API with factory pattern
- **PostgreSQL**: Database for analysis history
- **DNS Resolution**: dnspython for comprehensive DNS analysis
- **SSL Inspection**: Built-in SSL certificate analysis
- **Geolocation APIs**: ipapi.co integration
- **OSINT Tools**: crt.sh for subdomain enumeration

### Frontend
- **React 18**: Modern component-based UI
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Leaflet.js**: Interactive world maps
- **Lucide React**: Professional icon set
- **shadcn/ui**: Accessible component library

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd suspicious-domain-identifier
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Configure database**
   ```bash
   # Install PostgreSQL and create database
   createdb suspicious_domains
   
   # Set environment variables
   export DATABASE_URL="postgresql://username:password@localhost/suspicious_domains"
   export SECRET_KEY="your-secret-key-here"
   ```

4. **Run the backend**
   ```bash
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env file
   echo "REACT_APP_API_URL=http://localhost:5000" > .env
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   The application will be available at `http://localhost:3000`

## 📊 Usage

### Basic Domain Analysis

1. **Enter Domain**: Input any domain name in the search field
2. **Analysis**: The system performs comprehensive analysis including:
   - DNS record resolution
   - SSL certificate inspection
   - IP geolocation
   - CDN detection
   - Subdomain enumeration
   - Risk assessment

3. **Results**: View detailed results in organized sections:
   - **Suspicious Score**: Risk assessment (0-100)
   - **Hosting Information**: Real IP, location, ISP details
   - **DNS Analysis**: All DNS records with copy functionality
   - **SSL Certificate**: Certificate details and validity
   - **Network Path**: Simulated traceroute results
   - **World Map**: Interactive geographic visualization

### Advanced Features

- **History Panel**: Access previous analyses
- **PDF Export**: Generate comprehensive security reports
- **Risk Classification**: Automatic threat level assessment
- **CDN Bypass**: Attempts to find real hosting behind CDNs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@localhost/suspicious_domains
SECRET_KEY=your-secret-key
FLASK_ENV=development
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000
```

### API Endpoints

- `POST /analyze` - Analyze a domain
- `GET /report/<domain>` - Get analysis report
- `GET /history` - Get analysis history

### Database Schema

```sql
CREATE TABLE analysis_result (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    real_ip VARCHAR(45),
    asn VARCHAR(50),
    hosting_provider VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    is_cdn_detected BOOLEAN DEFAULT FALSE,
    cdn_provider VARCHAR(100),
    suspicious_score FLOAT DEFAULT 0.0,
    raw_data TEXT
);
```

## 🎨 Customization

### Theme Customization
The application uses a dark cyber theme with customizable colors:

```css
:root {
  --cyber-blue: #00eeff;
  --cyber-dark: #0a0a0a;
  --cyber-gray: #1a1a1a;
  --cyber-accent: #00ff88;
  --cyber-danger: #ff0040;
  --cyber-warning: #ffaa00;
}
```

### Adding New Analysis Features
1. Extend the `DomainAnalyzer` class in `backend/app.py`
2. Add new analysis methods
3. Update the frontend components to display new data
4. Modify the suspicious score calculation

## 🔒 Security Considerations

- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: All domain inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling prevents information leakage
- **Data Privacy**: Analysis history can be configured for data retention
- **HTTPS**: Use HTTPS in production environments

## 🚀 Deployment

### Production Backend

1. **Use Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Environment Variables**
   ```bash
   export FLASK_ENV=production
   export DATABASE_URL=postgresql://user:pass@host:port/db
   export SECRET_KEY=production-secret-key
   ```

### Production Frontend

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Serve with nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/build;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## 📈 Performance Optimization

- **Caching**: Implement Redis caching for frequent queries
- **Database Indexing**: Add indexes on frequently queried columns
- **CDN**: Use CDN for static assets
- **Compression**: Enable gzip compression
- **Connection Pooling**: Configure database connection pooling

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 API Documentation

### Analyze Domain
```http
POST /analyze
Content-Type: application/json

{
  "domain": "example.com"
}
```

**Response:**
```json
{
  "domain": "example.com",
  "timestamp": "2024-01-01T00:00:00Z",
  "dns_records": {...},
  "ssl_info": {...},
  "ip_info": {...},
  "cdn_detection": {...},
  "subdomains": [...],
  "suspicious_score": 25.5
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- **Machine Learning**: Enhanced suspicious score calculation
- **Real-time Monitoring**: Continuous domain monitoring
- **Threat Intelligence**: Integration with threat feeds
- **API Rate Limiting**: Advanced rate limiting
- **Multi-language Support**: Internationalization
- **Mobile App**: React Native mobile application

---

**Built with ❤️ for cybersecurity professionals**



