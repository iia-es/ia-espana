import http.server, socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

PORT = 8765
with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
    print(f"Serving on http://127.0.0.1:{PORT}")
    httpd.serve_forever()
