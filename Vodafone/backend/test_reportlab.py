from reportlab.pdfgen import canvas
import io

try:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer)
    c.drawString(100, 750, "Hello World")
    c.save()
    print("ReportLab PDF generation successful!")
except Exception as e:
    print(f"ReportLab failed: {e}")
