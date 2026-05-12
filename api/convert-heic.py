import io
import sys

def handler(request, response):
    """Vercel Python serverless — convierte HEIC/HEVC a JPEG"""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    
    if request.method == "OPTIONS":
        response.status_code = 200
        return
    
    if request.method != "POST":
        response.status_code = 405
        response.write(b'{"error":"Method not allowed"}')
        return
    
    try:
        import pillow_heif
        from PIL import Image
        
        pillow_heif.register_heif_opener()
        
        body = request.body
        if not body:
            response.status_code = 400
            response.write(b'{"error":"Empty body"}')
            return
        
        img = Image.open(io.BytesIO(body))
        out = io.BytesIO()
        img = img.convert("RGB")
        img.save(out, "JPEG", quality=88, optimize=True)
        jpeg_bytes = out.getvalue()
        
        response.headers["Content-Type"] = "image/jpeg"
        response.headers["Content-Length"] = str(len(jpeg_bytes))
        response.headers["Cache-Control"] = "no-store"
        response.status_code = 200
        response.write(jpeg_bytes)
        
    except Exception as e:
        response.status_code = 500
        response.write(f'{{"error":"{str(e)}"}}'.encode())
