-- Suspicious Domain Hosting Identifier Database Setup
-- PostgreSQL Database Schema

-- Create database (run as superuser)
-- CREATE DATABASE suspicious_domains;

-- Connect to the database
-- \c suspicious_domains;

-- Create analysis results table
CREATE TABLE IF NOT EXISTS analysis_result (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analysis_domain ON analysis_result(domain);
CREATE INDEX IF NOT EXISTS idx_analysis_timestamp ON analysis_result(timestamp);
CREATE INDEX IF NOT EXISTS idx_analysis_score ON analysis_result(suspicious_score);
CREATE INDEX IF NOT EXISTS idx_analysis_ip ON analysis_result(real_ip);

-- Create user for the application (optional)
-- CREATE USER suspicious_app WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE suspicious_domains TO suspicious_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO suspicious_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO suspicious_app;

-- Sample data (optional)
INSERT INTO analysis_result (
    domain, real_ip, asn, hosting_provider, country, city, 
    is_cdn_detected, cdn_provider, suspicious_score, raw_data
) VALUES (
    'example.com',
    '93.184.216.34',
    'AS15133',
    'Edgecast Networks',
    'United States',
    'Los Angeles',
    FALSE,
    NULL,
    15.5,
    '{"domain":"example.com","dns_records":{"A":["93.184.216.34"]},"ssl_info":{"valid":true},"ip_info":{"ip":"93.184.216.34"}}'
) ON CONFLICT DO NOTHING;

-- Create view for recent analyses
CREATE OR REPLACE VIEW recent_analyses AS
SELECT 
    domain,
    real_ip,
    country,
    city,
    suspicious_score,
    timestamp,
    is_cdn_detected,
    cdn_provider
FROM analysis_result
ORDER BY timestamp DESC
LIMIT 100;

-- Create view for high-risk domains
CREATE OR REPLACE VIEW high_risk_domains AS
SELECT 
    domain,
    real_ip,
    country,
    suspicious_score,
    timestamp,
    cdn_provider
FROM analysis_result
WHERE suspicious_score >= 70
ORDER BY suspicious_score DESC, timestamp DESC;

-- Create function to clean old analyses (optional)
CREATE OR REPLACE FUNCTION clean_old_analyses(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analysis_result 
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON analysis_result TO suspicious_app;
-- GRANT USAGE, SELECT ON SEQUENCE analysis_result_id_seq TO suspicious_app;
-- GRANT SELECT ON recent_analyses TO suspicious_app;
-- GRANT SELECT ON high_risk_domains TO suspicious_app;
-- GRANT EXECUTE ON FUNCTION clean_old_analyses TO suspicious_app;

-- Create backup script (save as backup.sh)
/*
#!/bin/bash
# Database backup script
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U suspicious_app -d suspicious_domains > backup_${DATE}.sql
echo "Backup created: backup_${DATE}.sql"
*/

-- Performance optimization queries
-- Analyze table statistics
ANALYZE analysis_result;

-- Check table size
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename = 'analysis_result';

-- Monitor query performance
-- SELECT query, calls, total_time, mean_time
-- FROM pg_stat_statements
-- WHERE query LIKE '%analysis_result%'
-- ORDER BY total_time DESC;



