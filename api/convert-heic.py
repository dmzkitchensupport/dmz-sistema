from http.server import BaseHTTPRequestHandler
import io

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            import pillow_heif
            from PIL import Image

            pillow_heif.register_heif_opener()

            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)

            if not body:
                self._error(400, 'Empty body')
                return

            img = Image.open(io.BytesIO(body))
            out = io.BytesIO()
            img.convert('RGB').save(out, 'JPEG', quality=88, optimize=True)
            jpeg = out.getvalue()

            self.send_response(200)
            self._cors()
            self.send_header('Content-Type', 'image/jpeg')
            self.send_header('Content-Length', str(len(jpeg)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(jpeg)

        except Exception as e:
            self._error(500, str(e))

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _error(self, code, msg):
        body = f'{{"error":"{msg}"}}'.encode()
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)
