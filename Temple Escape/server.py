"""
Local HTTP Server for Temple Escape: Lost Idol
Run this script to launch the local web server and play the game in your browser:
    python server.py
"""
import http.server
import socketserver
import webbrowser
import os
import sys
import mimetypes

mimetypes.init()
mimetypes.add_type('image/svg+xml', '.svg')
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('image/png', '.png')

PORT = 8000

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable caching-control for rapid iteration
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
        url = f"http://localhost:{PORT}"
        print(f"==================================================")
        print(f" TEMPLE ESCAPE: LOST IDOL — 3D Endless Runner")
        print(f" Server running at: {url}")
        print(f" Press Ctrl+C to stop the server.")
        print(f"==================================================")
        
        try:
            webbrowser.open(url)
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

if __name__ == '__main__':
    main()
