# -*- coding: utf-8 -*-
#test on python 3.4 ,python of lower version  has different module organization.
import http.server
from http.server import HTTPServer, BaseHTTPRequestHandler
import socketserver

PORT = 8080

Handler = http.server.BaseHTTPRequestHandler

Handler.extensions_map={
        '.manifest': 'text/cache-manifest',
	'.html': 'text/html',
        '.png': 'image/png',
	'.jpg': 'image/jpg',
	'.svg':	'image/svg+xml',
	'.css':	'text/css',
	'.js':	'text/javascript',
        '.json': 'application/json',
	'': 'application/octet-stream', # Default
    }

def get(self,*args):
    cpath=self.path[1:] if self.path.startswith('/') else self.path
    try:
        try:
            cfile=open(cpath,'rb')
        except:
            cpath+='index.html'
            cfile=open(cpath,'rb')
        cr=cfile.read()
        self.protocol_version = "HTTP/1.1"
        self.send_response(200)
        self.send_header("Content-Length", len(cr))
        for i in list(self.extensions_map):
            if cpath.endswith(i):
                self.send_header("Content-Type", self.extensions_map[i])
                break
        self.end_headers()
        self.wfile.write(cr)
        cfile.close()
        print('served page',self.path)
    except FileNotFoundError:
        message=b'404!'
        self.protocol_version = "HTTP/1.1"
        self.send_response(404)
        self.send_header("Content-Length", len(message))
        self.end_headers()
        self.wfile.write(message)
        print('served 404')
    return

Handler.do_GET=get

httpd = socketserver.TCPServer(("", PORT), Handler)

print("serving at port", PORT)
httpd.serve_forever()
