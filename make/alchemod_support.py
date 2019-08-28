import sys

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

def set_Tk_var():
    global combobox
    combobox = StringVar()
    global pane1list
    pane1list = StringVar()
    global pane2list
    pane2list = StringVar()
    global che40
    che40 = StringVar()
    global elementname
    elementname = StringVar()
    global che41
    che41 = StringVar()
    global elementsearch
    elementsearch = StringVar()
    global combobox2
    combobox2 = StringVar()

def init(top, gui, *args, **kwargs):
    global w, top_level, root
    w = gui
    top_level = top
    root = top

def destroy_window():
    # Function which closes the window.
    global top_level
    top_level.destroy()
    top_level = None

if __name__ == '__main__':
    import alchemod
    alchemod.vp_start_gui()
