import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Globe, Shield, Server, AlertTriangle } from 'lucide-react';

const PDFExport = ({ analysis }) => {
  const generatePDF = () => {
    // Create a comprehensive PDF report
    const reportData = {
      title: 'Suspicious Domain Hosting Identifier Report',
      domain: analysis.domain,
      timestamp: new Date().toLocaleString(),
      suspiciousScore: analysis.suspicious_score || 0,
      riskLevel: getRiskLevel(analysis.suspicious_score || 0),
      ipInfo: analysis.ip_info || {},
      dnsRecords: analysis.dns_records || {},
      sslInfo: analysis.ssl_info || {},
      cdnDetection: analysis.cdn_detection || {},
      subdomains: analysis.subdomains || [],
      whoisInfo: analysis.whois_info || {}
    };

    // Generate HTML content for PDF
    const htmlContent = generateHTMLReport(reportData);
    
    // Create and download PDF
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    element.style.width = '210mm';
    element.style.height = '297mm';
    element.style.background = 'white';
    element.style.color = 'black';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.padding = '20mm';
    element.style.fontSize = '12px';
    element.style.lineHeight = '1.4';
    
    document.body.appendChild(element);
    
    // Use browser's print functionality to generate PDF
    window.print();
    
    document.body.removeChild(element);
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'HIGH', color: '#ff4444' };
    if (score >= 50) return { level: 'MEDIUM', color: '#ffaa00' };
    if (score >= 20) return { level: 'LOW', color: '#4488ff' };
    return { level: 'MINIMAL', color: '#44ff44' };
  };

  const generateHTMLReport = (data) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Domain Analysis Report - ${data.domain}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: white; color: black; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00eeff; padding-bottom: 20px; }
            .header h1 { color: #00eeff; margin: 0; font-size: 24px; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #00eeff; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .info-label { font-weight: bold; color: #333; margin-bottom: 5px; }
            .info-value { color: #666; font-family: monospace; }
            .risk-score { text-align: center; padding: 20px; border: 2px solid ${data.riskLevel.color}; border-radius: 10px; margin: 20px 0; }
            .risk-score h3 { color: ${data.riskLevel.color}; margin: 0; font-size: 18px; }
            .risk-score .score { font-size: 36px; font-weight: bold; color: ${data.riskLevel.color}; margin: 10px 0; }
            .dns-records { margin: 15px 0; }
            .dns-record { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
            .dns-type { font-weight: bold; color: #00eeff; }
            .dns-value { font-family: monospace; color: #333; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 10px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔍 Suspicious Domain Hosting Identifier</h1>
            <p>Comprehensive Security Analysis Report</p>
            <p>Generated: ${data.timestamp}</p>
          </div>

          <div class="risk-score">
            <h3>Risk Assessment</h3>
            <div class="score">${Math.round(data.suspiciousScore)}/100</div>
            <p><strong>Risk Level: ${data.riskLevel.level}</strong></p>
          </div>

          <div class="section">
            <h2>🌐 Domain Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Domain</div>
                <div class="info-value">${data.domain}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Analysis Date</div>
                <div class="info-value">${data.timestamp}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🖥️ Hosting Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">IP Address</div>
                <div class="info-value">${data.ipInfo.ip || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Country</div>
                <div class="info-value">${data.ipInfo.geolocation?.country || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">City</div>
                <div class="info-value">${data.ipInfo.geolocation?.city || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">ISP</div>
                <div class="info-value">${data.ipInfo.geolocation?.isp || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">ASN</div>
                <div class="info-value">${data.ipInfo.asn?.asn || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Organization</div>
                <div class="info-value">${data.ipInfo.asn?.org || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🔒 SSL Certificate</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Valid</div>
                <div class="info-value">${data.sslInfo.valid ? 'Yes' : 'No'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Issuer</div>
                <div class="info-value">${data.sslInfo.issuer?.organizationName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Valid From</div>
                <div class="info-value">${data.sslInfo.not_before || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Valid Until</div>
                <div class="info-value">${data.sslInfo.not_after || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>☁️ CDN Detection</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">CDN Detected</div>
                <div class="info-value">${data.cdnDetection.detected ? 'Yes' : 'No'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">CDN Provider</div>
                <div class="info-value">${data.cdnDetection.provider || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🌐 DNS Records</h2>
            <div class="dns-records">
              ${Object.entries(data.dnsRecords).map(([type, records]) => `
                <div class="dns-record">
                  <div class="dns-type">${type} Records</div>
                  ${records.map(record => `<div class="dns-value">${record}</div>`).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          ${data.subdomains.length > 0 ? `
          <div class="section">
            <h2>🔍 Subdomains</h2>
            <div class="info-item">
              <div class="info-label">Discovered Subdomains (${data.subdomains.length})</div>
              <div class="info-value">${data.subdomains.join(', ')}</div>
            </div>
          </div>
          ` : ''}

          <div class="footer">
            <p>Report generated by Suspicious Domain Hosting Identifier</p>
            <p>This report contains sensitive security information and should be handled confidentially.</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 cyber-border rounded-lg">
          <FileText className="h-6 w-6 cyber-text" />
        </div>
        <div>
          <h3 className="text-xl font-bold cyber-text">Export Report</h3>
          <p className="text-gray-400">Generate comprehensive PDF report</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="cyber-border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold cyber-text">PDF Report</div>
              <div className="text-sm text-gray-400">Complete analysis with all findings</div>
            </div>
            <motion.button
              onClick={generatePDF}
              className="flex items-center space-x-2 px-4 py-2 cyber-text bg-gradient-to-r from-cyber-blue/20 to-cyber-accent/20 cyber-border rounded-lg hover:cyber-glow transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-400">
            <Globe className="h-4 w-4" />
            <span>Domain Analysis</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Shield className="h-4 w-4" />
            <span>SSL Certificate</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-400">
            <Server className="h-4 w-4" />
            <span>Hosting Details</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PDFExport;



