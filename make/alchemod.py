import sys
import json,zipfile,os,shutil,io,base64,PIL.Image,threading,random,math
import PIL.Image as img
import PIL.ImageTk as ImageTk
from tkinter import filedialog

queryid="0"

try:
    from Tkinter import *
except ImportError:
    from tkinter import *

try:
    import ttk
    py3 = 0
except ImportError:
    import tkinter.ttk as ttk
    py3 = 1

import alchemod_support

##def vp_start_gui():
##    '''Starting point when module is the main routine.'''
##    global val, w, root
    

w = None
def create_New_Toplevel_1(root, *args, **kwargs):
    '''Starting point when module is imported by another program.'''
    global w, w_win, rt
    rt = root
    w = Toplevel (root)
    alchemod_support.set_Tk_var()
    top = New_Toplevel_1 (w)
    alchemod_support.init(w, top, *args, **kwargs)
    return (w, top)

def destroy_New_Toplevel_1():
    global w
    w.destroy()
    w = None

def select_element_image(*args):
    global previousqueryid,top,imagejson,queryid
    filename=filedialog.askopenfilename(multiple=False,defaultextension='.png',title='Select image file for element')
    #print(filename)
    if filename!='':
        iconfile=open('icons/'+str(queryid)+'.png','wb')
        PIL.Image.open(filename).convert('RGBA').resize((74,74)).save(iconfile)
        iconfile.close()
        previousqueryid=''
        top._img1 = PhotoImage(file='icons/'+str(queryid)+'.png')
        top.Button1.configure(image=top._img1)
        iconfile=open('icons/'+str(queryid)+'.png','rb')
        imagejson.update({queryid:base64.encodebytes(iconfile.read()).decode()})
        iconfile.close()

def primeelement_checkbox_command(*args):
    global basejson,queryid
    basejson[str(queryid)].update({'prime':bool(int(alchemod_support.che40.get()))})

def add_recepe(*args):
    global basejson,queryid
    if basejson[str(queryid)].get('parents')==None:
        basejson[str(queryid)].update({'parents':[[0,0]]})
    else:
        basejson[str(queryid)]['parents'].append([0,0])
    alchemod_support.pane2list.set(basejson[str(queryid)]['parents'])

def remove_recepe(*args):
    global basejson,queryid,recepeselected,selectedrecepe
    if recepeselected:
        basejson[str(queryid)]['parents'].pop(selectedrecepe)
        recepeselected=False
        previousselectedrecepe=-1
        selectedrecepe=-1
        top._img2 = PhotoImage(file='icons/0.png')
        top.Button2.configure(image=top._img2)
        top._img3 = PhotoImage(file='icons/0.png')
        top.Button3.configure(image=top._img3)
        alchemod_support.pane2list.set(basejson[str(queryid)]['parents'])

def recepe_button_1(*args):
    global basejson,queryid,recepeselected,selectedrecepe
    if recepeselected:
        recepe=basejson[str(queryid)]['parents'][selectedrecepe].copy()
        recepe[0]=elementids[top.TCombobox1.current()]
        recepe=basejson[str(queryid)]['parents'][selectedrecepe]=recepe
        try:
            top._img2 = PhotoImage(file='icons/'+str(basejson[str(queryid)]['parents'][selectedrecepe][0])+'.png')
            top.Button2.configure(image=top._img2)
            alchemod_support.pane2list.set(basejson[str(queryid)]['parents'])
        except: pass
        
def recepe_button_2(*args):
    global basejson,queryid,recepeselected,selectedrecepe
    if recepeselected:
        recepe=basejson[str(queryid)]['parents'][selectedrecepe].copy()
        recepe[1]=elementids[top.TCombobox1.current()]
        recepe=basejson[str(queryid)]['parents'][selectedrecepe]=recepe
        try:
            top._img3 = PhotoImage(file='icons/'+str(basejson[str(queryid)]['parents'][selectedrecepe][1])+'.png')
            top.Button3.configure(image=top._img3)
            alchemod_support.pane2list.set(basejson[str(queryid)]['parents'])
        except: pass

updateelementnameflag=False

def elementname_textbox(*args):
    global updateelementnameflag
    updateelementnameflag=True
    return True
def update_element_name(*args):
    global queryid,langjson,reversedlangjson,elementnames
    langjson.update({queryid:alchemod_support.elementname.get()})
    reversedlangjson=dict(zip(langjson.values(),langjson.keys()))
    elementnames=list(langjson.values())
    top.TCombobox1.configure(values=elementnames)

def add_element(*args):
    #print('add element')
    global basejson,langjson,reversedlangjson,elementnames,elementids
    try:
        newid=max(*(int(i) for i in tuple(basejson.keys())))+1
    except:
        newid=1
    basejson.update({str(newid):{"parents":[],"tags":[]}})
    langjson.update({str(newid):"New Element"})
    reversedlangjson=dict(zip(langjson.values(),langjson.keys()))
    elementnames=list(langjson.values())
    top.TCombobox1.configure(values=elementnames)
    elementids=list(langjson.keys())
    imagejson.update({str(newid):imagejson['0']})
    iconfile=open('icons/'+str(newid)+'.png','wb')
    PIL.Image.open(io.BytesIO(base64.decodebytes(imagejson[str(newid)].encode()))).convert('RGBA').save(iconfile)
    iconfile.close()
    top.Listbox1.see(len(elementnames)-1)

def remove_element(*args):
    #print('remove element')
    global queryid,basejson,langjson,reversedlangjson,elementnames,elementids
    #newid=max(*(int(i) for i in tuple(basejson.keys())))+1
    if int(queryid)!=0:
        basejson.pop(str(queryid),None)
        langjson.pop(str(queryid),None)
        reversedlangjson=dict(zip(langjson.values(),langjson.keys()))
        elementnames=list(langjson.values())
        top.TCombobox1.configure(values=elementnames)
        elementids=list(langjson.keys())
        imagejson.pop(str(queryid),None)
        os.remove('icons/'+str(queryid)+'.png')
        #iconfile=open('icons/'+str(newid)+'.png','wb')
        #PIL.Image.open(io.BytesIO(base64.decodebytes(imagejson[str(newid)].encode()))).convert('RGBA').save(iconfile)
        #iconfile.close()
        #top.Listbox1.see(len(elementnames)-1)
        top.Listbox1.selection_clear(len(elementnames))
        queryid="0"

def save_all_files(*args):
    basefile=open("../files/assets/www/resources/base.json",'w')
    json.dump(basejson,basefile)
    imagefile=open("../files/assets/www/resources/images.json",'w')
    json.dump(imagejson,imagefile)
    langfile=open("../files/assets/www/resources/"+language+"/names.json",'w')
    json.dump(langjson,langfile)
    basefile.close()
    imagefile.close()
    langfile.close()

def hiddenelement_checkbox_command(*args):
    global basejson,queryid
    basejson[str(queryid)].update({'hidden':bool(int(alchemod_support.che41.get()))})

searchelementnameflag=False

def elementsearch_textbox(*args):
    global searchelementnameflag
    searchelementnameflag=True
    return True
def do_element_search(*args):
    global top,elementnames
    for ni,i in enumerate(elementnames):
        if i.startswith(alchemod_support.elementsearch.get()):
            top.Listbox1.see(ni)
            top.Listbox1.select_clear(0,len(elementnames))
            top.Listbox1.select_set(ni)
            break

def change_language(*args):
    global language,langfile,langjson,reversedlangjson,elementnames,elementids
    save_all_files()
    language=alchemod_support.combobox2.get()
    langfile=open("../files/assets/www/resources/"+language+"/names.json")
    langjson.update(json.load(langfile))
    langfile.close()

    reversedlangjson=dict(zip(langjson.values(),langjson.keys()))

    elementnames=list(langjson.values())
    top.TCombobox1.configure(values=elementnames)
    elementids=list(langjson.keys())
    try:
        alchemod_support.elementname.set(langjson[queryid])
    except: pass

languages=['de', 'en', 'en-us', 'es', 'fr', 'it', 'nl', 'no', 'pl', 'pt', 'sv']

class New_Toplevel_1:
    def __init__(self, top=None):
        '''This class configures and populates the toplevel window.
           top is the toplevel containing window.'''
        _bgcolor = '#d9d9d9'  # X11 color: 'gray85'
        _fgcolor = '#000000'  # X11 color: 'black'
        _compcolor = '#d9d9d9' # X11 color: 'gray85'
        _ana1color = '#d9d9d9' # X11 color: 'gray85' 
        _ana2color = '#d9d9d9' # X11 color: 'gray85' 
        self.style = ttk.Style()
        if sys.platform == "win32":
            self.style.theme_use('winnative')
        self.style.configure('.',background=_bgcolor)
        self.style.configure('.',foreground=_fgcolor)
        self.style.configure('.',font="TkDefaultFont")
        self.style.map('.',background=
            [('selected', _compcolor), ('active',_ana2color)])

        top.geometry("600x450+446+154")
        top.title("Alchemod")
        top.configure(background="#d9d9d9")



        self.TCombobox1 = ttk.Combobox(top)
        self.TCombobox1.place(relx=0.02, rely=0.02, relheight=0.05
                , relwidth=0.24)
        self.TCombobox1.configure(textvariable=alchemod_support.combobox)
        self.TCombobox1.configure(takefocus="")

        self.TPanedwindow1 = ttk.Panedwindow(top, orient="horizontal")
        self.TPanedwindow1.place(relx=0.02, rely=0.09, relheight=0.89
                , relwidth=0.97)
        self.TPanedwindow1.configure(width=200)
        self.TPanedwindow1_p1 = ttk.Labelframe(width=-150, text='Select element')
        self.TPanedwindow1.add(self.TPanedwindow1_p1)
        self.TPanedwindow1_p2 = ttk.Labelframe(text='Edit element')
        self.TPanedwindow1.add(self.TPanedwindow1_p2)
        self.__funcid0 = self.TPanedwindow1.bind('<Map>', self.__adjust_sash0)

        self.Listbox1 = Listbox(self.TPanedwindow1_p1)
        self.Listbox1.place(relx=0.04, rely=0.05, relheight=0.93, relwidth=0.93)
        self.Listbox1.configure(background="white")
        self.Listbox1.configure(disabledforeground="#a3a3a3")
        self.Listbox1.configure(font="TkFixedFont")
        self.Listbox1.configure(foreground="#000000")
        self.Listbox1.configure(width=210)
        self.Listbox1.configure(selectmode=SINGLE)
        self.Listbox1.configure(listvariable=alchemod_support.pane1list)

        self.Listbox2 = Listbox(self.TPanedwindow1_p2)
        self.Listbox2.place(relx=0.72, rely=0.05, relheight=0.93, relwidth=0.25)
        self.Listbox2.configure(background="white")
        self.Listbox2.configure(disabledforeground="#a3a3a3")
        self.Listbox2.configure(font="TkFixedFont")
        self.Listbox2.configure(foreground="#000000")
        self.Listbox2.configure(width=150)
        self.Listbox2.configure(selectmode=SINGLE)
        self.Listbox2.configure(listvariable=alchemod_support.pane2list)

        self.Button1 = Button(self.TPanedwindow1_p2)
        self.Button1.place(relx=0.04, rely=0.04, height=80, width=80)
        self.Button1.configure(activebackground="#d9d9d9")
        self.Button1.configure(activeforeground="#000000")
        self.Button1.configure(background="#d9d9d9")
        self.Button1.configure(borderwidth="3")
        self.Button1.configure(command=select_element_image)
        self.Button1.configure(disabledforeground="#a3a3a3")
        self.Button1.configure(foreground="#000000")
        self.Button1.configure(highlightbackground="#d9d9d9")
        self.Button1.configure(highlightcolor="black")
        self._img1 = PhotoImage(file='icons/'+str(queryid)+'.png')
        self.Button1.configure(image=self._img1)
        self.Button1.configure(pady="0")
        self.Button1.configure(text='''Button''')
        self.Button1.configure(width=80)

        self.Checkbutton1 = Checkbutton(self.TPanedwindow1_p2)
        self.Checkbutton1.place(relx=0.04, rely=0.04, y=90, height=25
                , width=105)
        self.Checkbutton1.configure(activebackground="#d9d9d9")
        self.Checkbutton1.configure(activeforeground="#000000")
        self.Checkbutton1.configure(background="#d9d9d9")
        self.Checkbutton1.configure(disabledforeground="#a3a3a3")
        self.Checkbutton1.configure(foreground="#000000")
        self.Checkbutton1.configure(highlightbackground="#d9d9d9")
        self.Checkbutton1.configure(highlightcolor="black")
        self.Checkbutton1.configure(justify=LEFT)
        self.Checkbutton1.configure(text='''Prime element''')
        self.Checkbutton1.configure(command=primeelement_checkbox_command)
        self.Checkbutton1.configure(variable=alchemod_support.che40)

        self.Checkbutton2 = Checkbutton(self.TPanedwindow1_p2)
        self.Checkbutton2.place(relx=0.04, rely=0.04, y=115, height=25
                , width=105)
        self.Checkbutton2.configure(activebackground="#d9d9d9")
        self.Checkbutton2.configure(activeforeground="#000000")
        self.Checkbutton2.configure(background="#d9d9d9")
        self.Checkbutton2.configure(disabledforeground="#a3a3a3")
        self.Checkbutton2.configure(foreground="#000000")
        self.Checkbutton2.configure(highlightbackground="#d9d9d9")
        self.Checkbutton2.configure(highlightcolor="black")
        self.Checkbutton2.configure(justify=LEFT)
        self.Checkbutton2.configure(text='''Hidden element''')
        self.Checkbutton2.configure(command=hiddenelement_checkbox_command)
        self.Checkbutton2.configure(variable=alchemod_support.che41)

        self.Button2 = Button(self.TPanedwindow1_p2)
        self.Button2.place(relx=0.04, rely=0.96, y=-80, height=80, width=80)
        self.Button2.configure(activebackground="#d9d9d9")
        self.Button2.configure(activeforeground="#000000")
        self.Button2.configure(background="#d9d9d9")
        self.Button2.configure(borderwidth="3")
        self.Button2.configure(command=recepe_button_1)
        self.Button2.configure(disabledforeground="#a3a3a3")
        self.Button2.configure(foreground="#000000")
        self.Button2.configure(highlightbackground="#d9d9d9")
        self.Button2.configure(highlightcolor="black")
        self._img2 = PhotoImage(file='icons/0.png')
        self.Button2.configure(image=self._img2)
        self.Button2.configure(pady="0")
        self.Button2.configure(text='''Button''')
        self.Button2.configure(width=80)

        self.Button3 = Button(self.TPanedwindow1_p2)
        self.Button3.place(relx=0.68, rely=0.96, x=-80, y=-80, height=80, width=80)
        self.Button3.configure(activebackground="#d9d9d9")
        self.Button3.configure(activeforeground="#000000")
        self.Button3.configure(background="#d9d9d9")
        self.Button3.configure(borderwidth="3")
        self.Button3.configure(command=recepe_button_2)
        self.Button3.configure(disabledforeground="#a3a3a3")
        self.Button3.configure(foreground="#000000")
        self.Button3.configure(highlightbackground="#d9d9d9")
        self.Button3.configure(highlightcolor="black")
        self._img3 = PhotoImage(file='icons/0.png')
        self.Button3.configure(image=self._img3)
        self.Button3.configure(pady="0")
        self.Button3.configure(text='''Button''')
        self.Button3.configure(width=80)

        self.Message1 = Message(self.TPanedwindow1_p2)
        self.Message1.place(relx=0.36, rely=0.96, x=-11, y=-51, height=22, width=22)
        self.Message1.configure(background="#d9d9d9")
        self.Message1.configure(foreground="#000000")
        self.Message1.configure(highlightbackground="#d9d9d9")
        self.Message1.configure(highlightcolor="black")
        self.Message1.configure(text='''+''')
        self.Message1.configure(width=22)

        self.Button4 = Button(self.TPanedwindow1_p2)
        self.Button4.place(relx=0.68, rely=0.05, x=-24, height=24, width=24)
        self.Button4.configure(activebackground="#d9d9d9")
        self.Button4.configure(activeforeground="#000000")
        self.Button4.configure(background="#d9d9d9")
        self.Button4.configure(disabledforeground="#a3a3a3")
        self.Button4.configure(foreground="#000000")
        self.Button4.configure(highlightbackground="#d9d9d9")
        self.Button4.configure(highlightcolor="black")
        self.Button4.configure(pady="0")
        self.Button4.configure(command=add_recepe)
        self.Button4.configure(text='''+''')

        self.Button5 = Button(self.TPanedwindow1_p2)
        self.Button5.place(relx=0.68, rely=0.05, x=-24, y=24, height=24, width=24)
        self.Button5.configure(activebackground="#d9d9d9")
        self.Button5.configure(activeforeground="#000000")
        self.Button5.configure(background="#d9d9d9")
        self.Button5.configure(disabledforeground="#a3a3a3")
        self.Button5.configure(foreground="#000000")
        self.Button5.configure(highlightbackground="#d9d9d9")
        self.Button5.configure(highlightcolor="black")
        self.Button5.configure(pady="0")
        self.Button5.configure(command=remove_recepe)
        self.Button5.configure(text='''-''')

        self.TEntry1 = ttk.Entry(self.TPanedwindow1_p2)
        self.TEntry1.place(relx=0.04, rely=0.04, x=80, relheight=0.05, relwidth=0.40, width=-24)
        self.TEntry1.configure(textvariable=alchemod_support.elementname)
        self.TEntry1.configure(validatecommand=elementname_textbox,validate='all')
        self.TEntry1.configure(takefocus="")
        self.TEntry1.configure(cursor="ibeam")

        self.Button6 = Button(self.TPanedwindow1_p1)
        self.Button6.place(relx=0.97, rely=0.05, x=-24, y=-24, height=24, width=24)
        self.Button6.configure(activebackground="#d9d9d9")
        self.Button6.configure(activeforeground="#000000")
        self.Button6.configure(background="#d9d9d9")
        self.Button6.configure(disabledforeground="#a3a3a3")
        self.Button6.configure(foreground="#000000")
        self.Button6.configure(highlightbackground="#d9d9d9")
        self.Button6.configure(highlightcolor="black")
        self.Button6.configure(pady="0")
        self.Button6.configure(command=add_element)
        self.Button6.configure(text='''+''')

        self.Button7 = Button(self.TPanedwindow1_p1)
        self.Button7.place(relx=0.97, rely=0.05, x=-48, y=-24, height=24, width=24)
        self.Button7.configure(activebackground="#d9d9d9")
        self.Button7.configure(activeforeground="#000000")
        self.Button7.configure(background="#d9d9d9")
        self.Button7.configure(disabledforeground="#a3a3a3")
        self.Button7.configure(foreground="#000000")
        self.Button7.configure(highlightbackground="#d9d9d9")
        self.Button7.configure(highlightcolor="black")
        self.Button7.configure(pady="0")
        self.Button7.configure(command=remove_element)
        self.Button7.configure(text='''-''')

        self.Button8 = Button(top)
        self.Button8.place(relx=0.93, rely=0.02, relheight=0.05, relwidth=0.05)
        self.Button8.configure(activebackground="#d9d9d9")
        self.Button8.configure(activeforeground="#000000")
        self.Button8.configure(background="#d9d9d9")
        self.Button8.configure(disabledforeground="#a3a3a3")
        self.Button8.configure(foreground="#000000")
        self.Button8.configure(highlightbackground="#d9d9d9")
        self.Button8.configure(highlightcolor="black")
        self.Button8.configure(pady="0")
        self.Button8.configure(command=save_all_files)
        self.Button8.configure(text='''Save''')
        self._img8_hires = PhotoImage(file='../alchemodassets/Save_72px.png')
        self._img8_midres = PhotoImage(file='../alchemodassets/Save_36px.png')
        self._img8_lores = PhotoImage(file='../alchemodassets/Save_18px.png')
        self.Button8.configure(image=self._img8_lores)

        self.TEntry2 = ttk.Entry(self.TPanedwindow1_p1)
        self.TEntry2.place(relx=0.04, rely=0.05, width=-48, y=-24, height=24, relwidth=0.94)
        self.TEntry2.configure(textvariable=alchemod_support.elementsearch)
        self.TEntry2.configure(validatecommand=elementsearch_textbox,validate='all')
        self.TEntry2.configure(takefocus="")
        self.TEntry2.configure(cursor="ibeam")

        self.TCombobox2 = ttk.Combobox(self.TPanedwindow1_p2)
        self.TCombobox2.place(relx=0.04, rely=0.09, x=80, relheight=0.05, relwidth=0.40, width=-24)
        self.TCombobox2.configure(textvariable=alchemod_support.combobox2)
        self.TCombobox2.configure(takefocus="")
        #self.TCombobox2.configure(command=change_language)
        self.TCombobox2.configure(values=languages)


    def __adjust_sash0(self, event):
        paned = event.widget
        pos = [230, ]
        i = 0
        for sash in pos:
            paned.sashpos(i, sash)
            i += 1
        paned.unbind('<map>', self.__funcid0)
        del self.__funcid0


language="nl"


basefile=open("../files/assets/www/resources/base.json")
basejson=json.load(basefile)
imagefile=open("../files/assets/www/resources/images.json")
imagejson=json.load(imagefile)
langfile=open("../files/assets/www/resources/"+language+"/names.json")
langjson=json.load(langfile)
basefile.close()
imagefile.close()
langfile.close()

reversedlangjson=dict(zip(langjson.values(),langjson.keys()))

elementnames=list(langjson.values())
elementids=list(langjson.keys())
for i in imagejson:
    iconfile=open('icons/'+str(i)+'.png','wb')
    PIL.Image.open(io.BytesIO(base64.decodebytes(imagejson[i].encode()))).convert('RGBA').save(iconfile)
    iconfile.close()



if __name__ == '__main__':
    #vp_start_gui()
    root = Tk()
    alchemod_support.set_Tk_var()
    top = New_Toplevel_1 (root)
    alchemod_support.init(root, top)
    previousqueryid=queryid
    selectedrecepe=-1
    recepeselected=False
    previousselectedrecepe=-1
    previouslang=language
    while True:
        alchemod_support.pane1list.set(elementids)
        previousqueryid=queryid
        previousselectedrecepe=selectedrecepe
        if alchemod_support.combobox2.get() in languages:
            if alchemod_support.combobox2.get()!=language:
                change_language()
            previouslang=language
        else:
            alchemod_support.combobox2.set(previouslang)
        try:
            #print(top.Listbox1.selection_get())
            if top.Listbox1.curselection()!=():
                queryid=top.Listbox1.selection_get()
            if top.Listbox2.curselection()!=():
                recepeselected=True
                selectedrecepe=top.Listbox2.curselection()[0]
            else:
                if recepeselected:
                    recepeselected=False
                    previousselectedrecepe=-1
                    selectedrecepe=-1
                    top._img2 = PhotoImage(file='icons/0.png')
                    top.Button2.configure(image=top._img2)
                    top._img3 = PhotoImage(file='icons/0.png')
                    top.Button3.configure(image=top._img3)
        except:
            pass
        if previousqueryid!=queryid:
            top._img1 = PhotoImage(file='icons/'+str(queryid)+'.png')
            top.Button1.configure(image=top._img1)
            recepeselected=False
            alchemod_support.che40.set(int(bool(basejson[str(queryid)].get('prime'))))
            alchemod_support.che41.set(int(bool(basejson[str(queryid)].get('hidden'))))
            alchemod_support.elementname.set(langjson[queryid])
            try:
                alchemod_support.pane2list.set(basejson[str(queryid)]['parents'])
            except KeyError:
                alchemod_support.pane2list.set([])
        if previousselectedrecepe!=selectedrecepe and recepeselected:
            try:
                top._img2 = PhotoImage(file='icons/'+str(basejson[str(queryid)]['parents'][selectedrecepe][0])+'.png')
                top.Button2.configure(image=top._img2)
                top._img3 = PhotoImage(file='icons/'+str(basejson[str(queryid)]['parents'][selectedrecepe][1])+'.png')
                top.Button3.configure(image=top._img3)
            except:
                pass
        alchemod_support.pane1list.set(elementnames)
        top.TCombobox1.configure(values=elementnames)
        root.update()
        if updateelementnameflag:
            updateelementnameflag=False
            update_element_name()
        if searchelementnameflag:
            searchelementnameflag=False
            do_element_search()
    #root.mainloop()
