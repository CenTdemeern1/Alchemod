import os,requests
for i in os.walk("../../files/assets/www/"):
    print(i)
    crootpath=i[0].replace('../../files/assets/www/','./')
    for f in i[1]:
        if not os.path.exists(crootpath+'/'+f):
            os.mkdir(crootpath+'/'+f)
    for f in i[2]:
        r='.580'.join(os.path.splitext(f))
        resp=requests.get('http://littlealchemy.com/'+(crootpath[2:])+r)
        if resp.status_code!=404:
            file=open(crootpath+'/'+r,'wb')
            file.write(resp.text.encode())
            file.close()
            resp.close()
