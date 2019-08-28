import zipfile,os,shutil,io,threading,random,math,sys,subprocess

__all__=['help','reset-workspace','quit','make','generate-apk','generate-web']

print('Alchemod Manager 2.0\nType \'help\' for help.')
cmd=''
while cmd!='quit':
    cmd=input('> ')
    if cmd[0]=='\'' or cmd[-1]=='\"':
        print('All commands are without quotes :)')
    if cmd=='help':
        print('''
Commands:
'help': You just used it :)
'reset-workspace': Delete and reset your workspace.
'quit': Exit Alchemod Manager.
'make': Starts the editing GUI.
'generate-apk': Generates an Android app.
''')
    if cmd=='reset-workspace':
        shutil.rmtree('files')
        if not os.path.exists('files'):
            os.mkdir('files')
            apkfile=zipfile.ZipFile('alchemodassets/Little_Alchemy_1.8.0.apk')
            apkfile.extractall('files')
            shutil.copy('alchemodassets/index.html','files/assets/www/index.html')
            shutil.copy('alchemodassets/la2logo.svg','files/assets/www/img/la2logo.svg')
            print('\nSuccess!\n')
        else:
            print('\nFailed, try again in a few seconds.\n')
    if cmd=='generate-apk':
        overwrite=True
        if os.path.exists('Little_Alchemy_1.8.0_modded.apk'):
            print('\n!!WARNING!!\n\nDirectory "Little_Alchemy_1.8.0_modded.apk" exists!\n')
            if input('Overwrite? [y/n]> ')=='y':
                os.remove('Little_Alchemy_1.8.0_modded.apk')
            else:
                overwrite=False
        if overwrite:
            shutil.copy('alchemodassets/Little_Alchemy_1.8.0.apk','Little_Alchemy_1.8.0_modded.apk')
            ####apkfile=zipfile.ZipFile('Little_Alchemy_1.8.0_modded.apk','a')
##            for i in os.listdir('files'):
##                apkfile.write('files/'+i,i)
            ####apkfile.write('files/assets','assets')
##            pq=[]
##            for i in os.listdir('files'):
##                pq.append('files/'+i)

            """If someone would like to fix this
            I would be really thankful"""
            
            exitcode=os.system('7z.exe a -y -tzip Little_Alchemy_1.8.0_modded.apk ./files/assets')#+(' '.join(pq)))
            print('Exit code:',exitcode)
            #apkfile.close()
            if exitcode==0:
                print('\nThat means...\nSuccess!\n')
    if cmd=='make':
        print('\nStarting.\nJust a quick reminder: don\'t forget to save :)\n')
        subprocess.Popen('cd '+os.path.realpath('./make')+' && '+sys.executable+' alchemod.py',shell=True)
    if cmd=='generate-web':
        print('\n!!WARNING!!\n\nThis is currently being developed. Watch out for bugs!\n')
        overwrite=True
        if os.path.exists('Little_Alchemy_1.8.0_modded_web'):
            print('\n!!WARNING!!\n\nDirectory "Little_Alchemy_1.8.0_modded_web" exists!\n')
            if input('Overwrite? [y/n]> ')=='y':
                shutil.rmtree('Little_Alchemy_1.8.0_modded_web')
            else:
                overwrite=False
        if overwrite:
            shutil.copytree('alchemodassets/laweb','Little_Alchemy_1.8.0_modded_web')
            for i in ['base','images']:
                shutil.copy('files/assets/www/resources/'+i+'.json','Little_Alchemy_1.8.0_modded_web/resources/'+i+'.580.json')
            for i in ['de', 'en', 'en-us', 'es', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'sv']:
                for f in ['broadcast','languagePack','names']:
                    try:
                        shutil.copy('files/assets/www/resources/'+i+'/'+f+'.json','Little_Alchemy_1.8.0_modded_web/resources/'+i+'/'+f+'.580.json')
                    except FileNotFoundError:
                        if not (i=='en' and (f=='broadcast' or f=='languagePack')):
                            print('File not found: "'+('files/assets/www/resources/'+i+'/'+f+'.json')+'", ignoring.')
        print('\nSuccess!\n')
