'use strict';

const vrCursor = {
    sloted_gd_sandbox_editor : {},
    editor_slothed : false,
    slothEditor : function(editor){
        if(editor instanceof _gd_sandbox_editor){
            if(this.editor_slothed){
                this.sloted_gd_sandbox_editor.slothed_in_vrCursor = false;   
            }
            this.sloted_gd_sandbox_editor = editor;
            this.editor_slothed = true;
            this.sloted_gd_sandbox_editor.slothed_in_vrCursor = true;
        }
        else{
            console.warn("editor instanceof _gd_sandbox_editor  == false");
        }
    },
    line : 0,
    index : 0,
    _lineOffset: 0,
    _indexOffset: 0,
    _apply_lineOffset: () => {this.line += this._lineOffset; this._lineOffset = 0},
    _apply_indexOffset: () => {this.index += this._indexOffset; this._indexOffset = 0},
    applyOffset: () => {
        this._apply_lineOffset();
        this._apply_indexOffset();
    },
    reset : function(editor){
        if(editor !== this.sloted_gd_sandbox_editor){
            throw new Error("editor !== this.sloted_gd_sandbox_editor");
            return;
        }
        this.line = 0;
        this.index = 0;
        this._lineOffset = 0;
        this._indexOffset = 0;
    },
    updateFrom : function(from){
        switch(from){
            case "anchor_selection":
                let currentSelection = window.getSelection();
                let valid_anchor = getValidParent(currentSelection.anchorNode);
                this.line = !isNaN(valid_anchor._line_number)?  valid_anchor._line_number : this.line;
                this.index = currentSelection.anchorOffset;
                console.log("line :  " + this.line + "       index :  " + this.index);
            default: return;
        }
    },
    update : function(element){
        switch(element){
            case "index":
                this.index = currentSelection.anchorOffset;
            case "carret":
                this.sloted_gd_sandbox_editor.__updateCursorPosition();
            default: return;
        }
    },
    up : function(){
        if(this.line > 0){
            --this.line;
            if(this.index > this.sloted_gd_sandbox_editor.current_line.length - 1){
                this.index = this.sloted_gd_sandbox_editor.current_line.length;
            }
        }
    },
    down : function(){ //USE WITH CARE
        if(this.sloted_gd_sandbox_editor.lineCount > this.line + 1){
            ++this.line;
            if(this.index > this.sloted_gd_sandbox_editor.current_line.length - 1){
                this.index = this.sloted_gd_sandbox_editor.current_line.length;
            }
        }
    },
    left : function(){ //USE WITH CARE
        if(this.index > 0){
            --this.index;
        }
        else if(this.line > 0){
            --this.line;
            this.index = this.sloted_gd_sandbox_editor.current_line.length;
        }
    },
    right : function(){ //USE WITH CARE
        if(this.sloted_gd_sandbox_editor.current_line.length > this.index){
            ++this.index;
        }
        else if(this.line < this.sloted_gd_sandbox_editor.lineCount - 1){
            ++this.line;
            this.index = 0;
        }
    },

}
vrCursor.updateFrom = vrCursor.updateFrom.bind(vrCursor);
vrCursor.update = vrCursor.update.bind(vrCursor);


//@GDn&p+gbg
class _gd_sandbox_editor{
    constructor(){

        this._hasFile = false;
        this._editor = document.createElement("pre");
        this._editor.className = "editor";
        this._editor.contentEditable = true;

        this.slothed_in_vrCursor = false;
        vrCursor.slothEditor(this);
        vrCursor.reset(this);
        
        
        this.keyAction = this.keyAction.bind(this);
        this.keyUpAction = this.keyUpAction.bind(this);

        this._lineArray = [];
        this._lineMap = new Map(); //to test will delete this._lineArray if ok
        this.lineCount = 0;
        this.newLine = this.newLine.bind(this);
        this.insertLine = this.insertLine.bind(this);
        this.splitLine = this.splitLine.bind(this);
        //this.deleteSelection = this.deleteSelection.bind(this);
        
        this.__filteredSelectorObjectUpToDate = false;
        this.__filteredSelectorObject = null;

        this.focusedLine = -1;
        
        this.copyPastSetup();
        this.keyActionExceptionSetup();
        this.keyActionSetup();
        this.keyCombinationSetup();
        //this.mutationObserverSetup(); Useless for now
        
        /*this._editor.addEventListener("keyup", function(){
            this._file.content = this._editor.textContent;
            console.log(`slect start:  ${this._getSelector().anchorOffset} || slect end: ${this._getSelector().focusOffset}`);
        }.bind(this));*/
        this._editor.addEventListener("keydown", this.keyAction);
        this._editor.addEventListener("keyup", this.keyUpAction);

        this.hasFocus = false
        this._editor.addEventListener("focus", this.onFocus.bind(this));
        this._editor.addEventListener("focusout", this.onFocusout.bind(this));
        this._editor.addEventListener("click", this.click.bind(this));
        

        this.uiElement = this._editor;

        
    }
    onFocus(){
        if(this.lineCount == 0){
            this.newLine();
            this.focusedLine = 0;
        }

        this.hasFocus = true;
    }
    onFocusout(){
        this.hasFocus = false;
    }
    click(){
        vrCursor.updateFrom("anchor_selection");
    }
    get cursorIndex(){
        return this._getSelector().anchorOffset == this._getSelector().focusOffset ? this._getSelector().focusOffset : undefined;
    }
    
    /*set cursorIndex(index){
        /*if(index > this.textAreaValueLength){
            this._textArea.anchorOffset = this.textAreaValueLength - 1;
            this._textArea.focusOffset = this.textAreaValueLength - 1;
        }*//*
        this._getSelector().anchorOffset += index;
        this._getSelector().focusOffset += index;
    }*/
    /*moveCursorIndex(index){
        this._textArea.anchorOffset = index;
        this._textArea.focusOffset = index;
    }*/
    get textAreaValueLength(){
        return this._editor.textContent.length;
    }
    /*get textAreaValue(){
        return this._textArea.value;
    }
    set textAreaValue(value){
        return this._textArea.value = value;
    }*/
    get charAt(){
        return this._editor.textContent[index];
    }
    _getSelector(){
        if(document.activeElement === this._editor)
            return window.getSelection();
        //return Error(" document.activeElement === this._editor is false");
        return undefined;
    }
    
    filteredSelector(forceUpdate = false){
        if(!forceUpdate && this.__filteredSelectorObjectUpToDate){
            return this.__filteredSelectorObject;
        }
        let selectorCach = this._getSelector();
        //debugger;
        let filteredSelector_f_startLine = getValidParent(selectorCach.anchorNode)._line_number;
        let filteredSelector_f_endLine = getValidParent(selectorCach.focusNode)._line_number;

        this.__filteredSelectorObject =  {
            startLine: filteredSelector_f_startLine,
            endLine: filteredSelector_f_endLine,

            startIndex: selectorCach.anchorOffset,
            endIndex: selectorCach.focusOffset,

            multilineSelection: filteredSelector_f_startLine != filteredSelector_f_endLine,
            selection: selectorCach.anchorOffset != selectorCach.focusOffset || filteredSelector_f_startLine != filteredSelector_f_endLine,
        }

        this.__filteredSelectorObjectUpToDate = true;
        return this.__filteredSelectorObject;
    }
    get anchorNode(){
        return this._getSelector().anchorNode;
    }
    get focusNode(){
        return this._getSelector().focusNode;
    }
    get selectionActive(){
        let selection = this._getSelector();
        return this.selectionIsValid(selection) && selection.anchorNode !== selection.focusNode || selection.anchorOffset != selection.focusOffset;
    }
    get singlelineSelectionActive(){
        let selection = this._getSelector();
        return this.selectionIsValid(selection) && selection.anchorNode === selection.focusNode && selection.anchorOffset != selection.focusOffset;
    }

    get multilineSelectionActive(){
        let selection = this._getSelector();
        return this.selectionIsValid(selection) && selection.anchorNode !== selection.focusNode;
    }

    // Focsued line if singlelineSelectionActive is false
    get focusedLine(){

        if(!this.singlelineSelectionActive){
            //debugger;
            let selection = this._getSelector();
            if(selection.isCollapsed){

                //if(!isNaN(selection.anchorNode.parentNode._line_number))
                    return getValidParent(selection.anchorNode)._line_number;
                
                return selection.anchorNode._line_number;
            }
                
        }

        return undefined;

    }
    set focusedLine(index){
        //debugger;

        
        if(index < 0){
            //throw new Error("index is negative :  " + index);
            console.warn("index is negative :  " + index);
            return;
        }
        vrCursor.line = index;

        this.setCursorPosition(this._lineArray[index].uiElement, 0);
    }
    get anchorNodeIsEmpty(){
        return !isNaN(getValidParent(selection.anchorNode).dataset._line_number) ? true : false;
    }
    get lineFromSelection(){

    }
    get lineNumberFromSelection(){
        let selection = this._getSelector();
    }
    selectionIsValid(selection){
        //debugger
        //return this._lineMap.has(selection.anchorNode.parentNode) && this._lineMap.has(selection.focusNode.parentNode)

        
        // this._lineArray ver
        
        return this._lineArray[selection.anchorNode.parentNode._line_number] === selection.anchorNode.parentNode._gd_line && 
        this._lineArray[selection.focusNode.parentNode._line_number] === selection.focusNode.parentNode._gd_line;
    }
    get anchor_focus_offset(){
        return {
            anchorOffset: this.anchorOffset,
            focusOffset: this.focusOffset,
        }
    }
    get anchorOffset(){
        return this._getSelector().anchorOffset;
    }
    /*set anchorOffset(s_start){
        return this._getSelector().anchorOffset = s_start;
    }*/
    get focusOffset(){
        return this._getSelector().focusOffset;
    }
    /*set focusOffset(s_end){
        return this._getSelector().focusOffset = s_end;
    }*/
    set className(className){
        this._editor.className = className;
    }

    setCursorPosition(node, index){
        console.log(node);
        let selector = this._getSelector();
        console.log("selector   :   "   +  selector);
        if(selector)
            getValidParent(node)._gd_line.cursorToIndex(selector, index);
            
        else
            console.error("SELECTOR :  " + selector);
    }


    get className(){
        return this._editor.className;
    }
    set id(id){
        this._editor.id = id;
    }
    get id(){
        return this._editor.id;
    }
    set file(file){
        //_gd_sandbox_file_isValid(file);
        if(!is_gd_sandbox_file(file)){
            throw new Error("file is not instanceof _gd_sandbox_file");
        }
        this.removeFile();
        if(file.open()){
            this._hasFile = true;
            this._file = file;
            this._editor.textContent = this.file.content;
            this._file.editor = this;
        }
        else{
            throw new Error("file is already open");
        }
    }
    removeFile(){
      if(this._hasFile){
          this._file.close();
          this._file.editor = null;
          this._file = null;
          this._hasFile = false;
      }
    }
    get file(){
        return this._file;
    }
    getfile(){
        return this.file;
    }
    setFile(file){
        this.file = file;
    }
    insertText(text){
        if(this.selectionActive){

        }
        this.insertTextAtLine(text, 0);
    }
    
    insertTextAtLine(text, lineNumber = 0){
        this.insertTextAtLineIndex(text, lineNumber, 0);
    }
    insertTextAtLineIndex(text, lineNumber = 0, index = 0){
        if(this._lineArray[lineNumber]){
            this._lineArray[lineNumber].insertString(text, index);
        }
    }
    __wrapSelection(selector = this.filteredSelector(), startPrintValue, endPrintValue){
        console.log("Will wrap")
        if(selector.selection){
            let startLine = selector.startLine;
            let endLine = selector.endLine;
            let startIndex = selector.startIndex;
            let endIndex = selector.endIndex;

            if(startLine > endLine){
                startLine = endLine;
                endLine = selector.startLine;
    
                startIndex = endIndex;
                endIndex = selector.startIndex;
            }
            else if(startIndex > endIndex){
                startIndex = endIndex;
                endIndex = selector.startIndex;
            }

            if(!selector.multilineSelection){
                this._lineArray[startLine].wrapText(startIndex, startPrintValue, endIndex, endPrintValue);
            }
            else{
                this._lineArray[startLine].insertString(startPrintValue, startIndex);
                this._lineArray[endLine].insertString(endPrintValue, endIndex);
            }

            /*
            this._lineArray[selection.anchorNode.parentNode._line_number].insertString(startPrintValue, selection.anchorOffset);
            this._lineArray[selection.focusNode.parentNode._line_number].insertString(endPrintValue, selection.focusOffset);*/
        }
        console.log();
    }
    // FN NO DONE to-do
    __wrapSelection_brut(selection, startPrintValue, endPrintValue){
        console.log("Will wrap")
        if(this.selectionIsValid(selection)){
            let anchorOffset = selection.anchorOffset, focusOffset = selection.focusOffset;
            console.log("WRAP anchorOffset    :  " + anchorOffset);
            console.log("WRAP focusOffset    :  " + focusOffset);
            if(selection.anchorNode === selection.focusNode){
                //TEST

                this._lineArray[selection.anchorNode.parentNode._line_number].highlight(0,selection.focusOffset, selection.anchorNode, HIGHLIGHT_TAG.keywords);

                //this._lineArray[selection.anchorNode.parentNode._line_number].wrapBrutContent(anchorOffset, startPrintValue, focusOffset, endPrintValue);
                return;
            }
            //debugger;
            if(selection.anchorNode.parentNode._line_number > selection.focusNode.parentNode._line_number){
                this._lineArray[selection.focusNode.parentNode._line_number].insertString(startPrintValue, selection.focusOffset);
                this._lineArray[selection.anchorNode.parentNode._line_number].insertString(endPrintValue, selection.anchorOffset);
                return;
            }
            this._lineArray[selection.anchorNode.parentNode._line_number].insertString(startPrintValue, selection.anchorOffset);
            this._lineArray[selection.focusNode.parentNode._line_number].insertString(endPrintValue, selection.focusOffset);
            this._lineArray[selection.anchorNode.parentNode._line_number].highlight()
        }
        console.log();
    }
    __print(printValue, cursorOffset = 0, index = vrCursor.index, line = vrCursor.line){
        console.log(line);
        /*if(line === undefined){
            line = this.anchorNode._line_number;
        }*/
        this._lineArray[line].insertString(printValue,index);
        index += printValue.length;
        //debugger;
        this.setCursorPosition(this._lineArray[line].uiElement, index);
    }
    get current_line(){
        return this._lineArray[vrCursor.line];
    }
    __print_brut(printValue, index = vrCursor.index, line = vrCursor.line){
        console.log(line);
        /*if(line === undefined){
            line = this.anchorNode._line_number;
        }*/
        this._lineArray[line].insertBrutContent(printValue,index);
        ++vrCursor.index;
        this.setCursorPosition(this._lineArray[line].uiElement, index);
    }
    __updateCursorPosition(){
        this.setCursorPosition(this._lineArray[vrCursor.line].uiElement, vrCursor.index);
    }
    backspace(){
        if(this.filteredSelector().selection){
            this.deleteSelection();
            
        }
        else{
            --vrCursor.index
            this._lineArray[vrCursor.line].backspace(vrCursor.index);
            
            this.setCursorPosition(this._lineArray[vrCursor.line].uiElement, vrCursor.index);
        }
    }
    moveCursorLeft(x){
        if(x > vrCursor.index){
            x -= vrCursor.index;
            //vrCursor.line
        }
        this.setCursorPosition(this._lineArray[vrCursor.line].uiElement, vrCursor.index);
    }
    ArrowLeft(){
        vrCursor.left();
        this.__updateCursorPosition();
    }
    ArrowRight(){
        vrCursor.right();
        this.__updateCursorPosition();
    }
    ArrowUp(){
        vrCursor.up();
        this.__updateCursorPosition();
    }
    ArrowDown(){
        vrCursor.down();
        this.__updateCursorPosition();
    }
    /*// print xor wrap xor specialAction ?? or...
    keyAction options = {
        printKey: false,
        printValue: "",
        printBrut: false,
        cursorOffset: 0, //don't use
        additionalOffset: 0,
        specialAction: false,
        specialFunction: function(textArea){},
        wrapText: false,
        beforeWrapValue:"",
        afterWrapValue:"",
        preventDefault: false,
        keyCombination: {down: false},
    }
    */
    
    keyCombinationSetup(){
        this.keyCombinationMap = new Map();
        this.keyCombinationDownCount = 0;

        this.addKeyCombination("Control");
        this.addKeyCombination("Alt");
        this.addKeyCombination("Shift");
    }
    addKeyCombination(keyValue){
        this.keyCombinationMap.set(keyValue, {down: false});
        this.addKeyAction(keyValue, {keyCombination: true});
    }
    keyActionExceptionSetup(){
        this.keyActionExceptionMap = new Map();

        this.addKeyActionException("F5");
        this.addKeyActionException("F12");
        

    }
    addKeyActionException(keyValue){
        this.keyActionExceptionMap.set(keyValue, null);
    }
    keyActionSetup(){
        this.genericKeyAction = this.classicKeyAction.bind(this);
        this.keyActionMap = new Map();

        this.addKeyAction("Shift__", {specialAction: true, specialFunction: function(){
            alert("SPE");
        }.bind(this)});
        
        this.addKeyAction("ArrowLeft", {specialAction: true, specialFunction: this.ArrowLeft.bind(this)});
        this.addKeyAction("ArrowRight", {specialAction: true, specialFunction: this.ArrowRight.bind(this)});
        this.addKeyAction("ArrowUp", {specialAction: true, specialFunction: this.ArrowUp.bind(this)});
        this.addKeyAction("ArrowDown", {specialAction: true, specialFunction: this.ArrowDown.bind(this)});

        this.addKeyAction("Tab", {printKey: true, printValue: "  "});
        this.addKeyAction("Backspace", {specialAction: true, specialFunction: this.backspace.bind(this)});
        this.addKeyAction("{", {
            printKey: true, printValue: "{}",
            wrapText: true, beforeWrapValue:"{", afterWrapValue:"}",
            cursorOffset: -1
        });
        this.addKeyAction("\"", {
            printKey: true, printValue: "\"\"",
            wrapText: true, beforeWrapValue:"\"", afterWrapValue:"\"",
            cursorOffset: -1
        });
        this.addKeyAction("(", {
            printKey: true, printValue: "()", 
            wrapText: true, beforeWrapValue:"(", afterWrapValue:")",
            cursorOffset: -1});
        //this.addKeyAction("Backspace", {specialAction: true, specialFunction: function(textArea){}});
        this.addKeyAction("Enter", {specialAction: true, specialFunction: this.splitLine});
        /*this.addKeyAction("__Control", {specialAction: true, specialFunction: function(){
            //this._lineArray[this.anchorNode.parentNode._line_number].insertBrutContent("<br>", this.anchorOffset)
            //this.insertLine();
        }.bind(this)});*/
        this.addKeyAction("²", {
            printKey: true, printValue: "<special></special>", printBrut: true,
            wrapText: true, beforeWrapValue:"<special>", afterWrapValue:"</special>",
            cursorOffset: -1});
        

    }
    addKeyAction(keyValue, options){
        this.keyActionMap.set(keyValue, options);
    }
    
    keyAction(keyboardEvent){
        this.genericKeyAction(keyboardEvent);
    }

    classicKeyAction(keyboardEvent){
            
        _slot_keyAction_call();

        
        //debugger;
        let key = this.keyActionMap.get(keyboardEvent.key);
        console.log("VR C INDEX BEFORE UPDATE: " + vrCursor.index);
        //keyboardEvent.preventDefault();
        if(key){
            if(this.selectionActive){
                if(key.wrapText){
                    keyboardEvent.preventDefault();
                    if(key.printBrut){
                        this.__wrapSelection_brut(this._getSelector(), key.beforeWrapValue, key.afterWrapValue);
                    }
                    else{
                        this.__wrapSelection(this.filteredSelector(), key.beforeWrapValue, key.afterWrapValue);
                    }
                    
                }
                else if(key.printKey){
                    keyboardEvent.preventDefault();
                    this.deleteSelection();
                    if(key.printBrut){
                        this.__print_brut(key.printValue);
                    }
                    else{
                        this.__print(key.printValue);
                    }
                    
                }
                else if(key.specialAction){
                    keyboardEvent.preventDefault();
                    key.specialFunction();
                }
            }
            else if(key.printKey){
                keyboardEvent.preventDefault();
                //debugger;
                if(key.cursorOffset){
                    this.__print(key.printValue, key.cursorOffset);
                }
                else{
                    this.__print(key.printValue);
                }
            }
            else if(key.specialAction){
                keyboardEvent.preventDefault();
                key.specialFunction();

            }
        }
        if(keyboardEvent.key.length == 1 && keyboardEvent.key.search(VALID_BASIC_TEXT_DATA_VALUES__AS_REGXP) == 0){
            keyboardEvent.preventDefault();
            this.deleteSelection();
            //debugger;
            this.__print(keyboardEvent.key);
            console.log("to basic data:  " + keyboardEvent.key);
        }
        else if(key.keyCombination){
            this.genericKeyAction = this.keyCombinationKeyAction.bind(this);
            this.keyCombinationMap.set(keyboardEvent.key, {down: true});   
            ++this.keyCombinationDownCount;
        }
        else if(!this.keyActionExceptionMap.has(keyboardEvent.key)){
            keyboardEvent.preventDefault();
        }
        //vrCursor.updateFrom("anchor_selection");

        

        _slot_keyAction_add(vrCursor.updateFrom, "anchor_selection");
        
        this.__filteredSelectorObjectUpToDate = false;
        //alert(keyboardEvent.key);*/
    }
    keyCombinationKeyAction(keyboardEvent){
        //debugger;
        let keycombvalue = this.keyCombinationMap.get(keyboardEvent.key);
        if(keycombvalue && !keycombvalue.down){
            ++this.keyCombinationDownCount;
            this.keyCombinationMap.set(keyboardEvent.key, {down: true});   
        }
        console.log("this.keyCombinationDownCount : " + this.keyCombinationDownCount);
    }

    keyUpAction(keyboardEvent){
        let key = this.keyCombinationMap.get(keyboardEvent.key);
        if(key && key.down){
            --this.keyCombinationDownCount;
            this.keyCombinationMap.set(keyboardEvent.key, {down: false});  
            if(this.keyCombinationDownCount == 0){
                this.genericKeyAction = this.classicKeyAction.bind(this);
            }
        }
        console.log("this.keyCombinationDownCount : " + this.keyCombinationDownCount);
    }

    newLine(line = new _line("")){
        
        line.setLineNumber(this.lineCount);
        this._lineArray.push(line);
        this._lineMap.set(line.uiElement, line);

        this.lineCount += 1;
        this._editor.append(line.uiElement);
        this.setCursorPosition(line.uiElement,0);
        this.checkLineCount();
        console.log(this.lineCount);
        //this.updateUi();
    }
    splitLine(splitIndex = this.filteredSelector().startIndex, lineNumber = this.filteredSelector().startLine){
        if(lineNumber < 0 || lineNumber >= this.lineCount)
            throw new Error("index < 0 || index >= this.lineCount");
        
            //debugger;
        let newLine = this._lineArray[lineNumber].splitLine_returnLine(splitIndex);
        this.insertLine(newLine, lineNumber);
    }
    insertLine(line = new _line(""), index = this.filteredSelector().startLine){
        // alert(); 
        //debugger;
        if(index < 0 || index >= this.lineCount)
            return false;
        //debugger;
        if(false && this._lineArray[index].textData == ""){



            return true;
        }
        this._lineArray.splice(index + 1, 0, line);
        
        line.setLineNumber(index + 1);
        this.reorderLines_startAt_index(index);
        if(index == this.lineCount){
            this._editor.append(line.uiElement);
        }
        else{
            this._lineArray[index].uiElement.insertAdjacentElement("afterend", line.uiElement);
        }

        vrCursor.line = line._line_number;
        vrCursor.index = vrCursor.index % (line.basicTextData.length + 1);
        this.setCursorPosition(line.uiElement, this.cursorIndex % line.textData.length);
        this.lineCount += 1;
        
        this.checkLineCount();
        console.log(this._lineArray);
        return true;
    }
    checkLineCount(){
        let i = 0;
        this._lineArray.forEach(line => {
            if(line._line_number != i){
                console.log(line);
                throw new Error("Line n° " + i + "  number invalid");
                //this.reorderLines_startAt_index(i);
                return;
            }
            ++i
        });
    }
    _get_lineNumberX(lineNumber){
        if( this.lineCount - lineNumber != 1){
            console.error("lineNumber invalid");
            return;
        }
        return this._lineMap.values()[lineNumber];
    }

    mutationObserverSetup(){
        this.removedNodesCount = 0;
        this.lineObserver = new MutationObserver(this.lineMutationFonction.bind(this));
        this.lineObserver.observe(this._editor, {childList: true});
        
    }
    reorderLines(){
        let lineNumber = 0;
        this._lineArray.forEach(line => {

            if(line._line_number != lineNumber)
                line.setLineNumber(lineNumber)
            ++lineNumber
        });
        this.checkLineCount();
    }
    reorderLines_startAt_index(index){//VF_1
        while(index < this._lineArray.length){
            this._lineArray[index].setLineNumber(index);
            ++index;
        }
    }
    deleteLine(lineNumber){//VF_1
        //debugger;
        if(lineNumber < 0 || lineNumber >= this.lineCount)
            return false;
        this._lineArray[lineNumber].delete();
        this._lineArray.splice(lineNumber, 1);
        this.reorderLines_startAt_index(lineNumber);
        this.lineCount -= 1;
        return true;
    }
    deleteSelection(selection = this.filteredSelector(), ajustCursor = true){
        console.log("deleteSelection");
        if(!selection.selection){
            console.log("deleteSelection no selection");
            console.log(selection);
            return;
        }
            
        let startLine = selection.startLine;
        let endLine = selection.endLine;
        let startIndex = selection.startIndex;
        let endIndex = selection.endIndex;
        if(startLine > endLine){
            startLine = endLine;
            endLine = selection.startLine;

            startIndex = endIndex;
            endIndex = selection.startIndex;
        }
        else if(startIndex > endIndex){
            startIndex = endIndex;
            endIndex = selection.startIndex;
        }
        if(startLine != endLine){
            //Multiple splice
            for(let i = startLine  + 1; i < endLine; ++i){
                this.deleteLine(i);
                --endLine;
            }
            //debugger;
            
            this._lineArray[startLine].deleteFromTo(startIndex, this._lineArray[startLine].length);
            this._lineArray[endLine].deleteFromTo(0,endIndex);

            this._lineArray[startLine].appendLine(this._lineArray[endLine]);
            this.deleteLine(endLine);
            //--endLine;
            /*if(this._lineArray[endLine].length == 0){
                this.deleteLine(endLine);
                --endLine;
            }*/

        }
        else{
            
            this._lineArray[startLine].deleteFromTo(startIndex, endIndex);
        }
        if(ajustCursor){
            vrCursor.line = startLine;
            vrCursor.index = startIndex;

            vrCursor.update("carret");
        }
    }
    lineMutationFonction(mutationRecordArray, mutationObserver){
        //debugger;
        if(mutationRecordArray.length > 0 && mutationRecordArray[0].type == "childList"){
        
            mutationRecordArray.forEach(mutationRecord => {
                if(mutationRecord.removedNodes.length > 0){
                    mutationRecord.removedNodes.forEach(removedNode => {

                        //if(this._lineMap.delete(removedNode))
                        if(this.deleteLine(removedNode._line_number)){
                            console.log(this.lineCount);
                            this.removedNodesCount += 1;
                        }
                    });
                }
                else if(mutationRecord.addedNodes.length > 0){
                    console.log("ADDED NODES : ");
                    mutationRecord.addedNodes.forEach(addedNodes => {
                        console.log("added node : " + addedNodes);
                    });
                    
                }
            });
            this.reorderLines();
            console.log(mutationRecordArray);
            console.log("Out : mutationRecordArray if");
        }
    }
    //

    copyPastSetup(){
        this.copyBuffer = null;
        this._editor.addEventListener("paste", this.pastFromPastEvent.bind(this));
        this._editor.addEventListener("cut", this.cut.bind(this));
    }

    copy(selection){
        if(this.selectionIsValid(selection)){
            if(this.multilineSelectionActive(selection)){

            }
        }
    }
    pastFromPastEvent(pasteEvent){
        let pasteData = pasteEvent.clipboardData.getData("text/plain");
        console.log("paste DATA :" + this.split_string_by_line_break(pasteData));
        pasteEvent.preventDefault();
        this.split_string_by_line_break(pasteData).forEach(string => this.insertLine( new _line(string)));
        //this.insertLine(new _line(pasteData));
    }
    split_string_by_line_break(string){

        return string.split(/\n|\r|\r\n/);
    }
    past(){
        
    }
    cut(cutEvent){
        cutEvent.preventDefault();
        cutEvent.clipboardData.setData('text/plain', this._getSelector().toString());
        this.deleteSelection();
    }

    updateEditor_from_lineArray(){ //use after reorder line

    }
    /// highlightSystem
    

    ///
    
}






/* const HIGHLIGHT_TAG = `<hlt class="gdh fn sl1 used1"></hlt>`  = 36 char
                                      gdh cl   
                                      gdh kw
                                      gdh vr
                                      gdh cd
                                      gdh st
gdh = gdhighlight
sl1 = selecttion, sl0 = no selection
used1 = variable or function... is used, used0 = variable or function... is not used
fn = function
cl = className
kw = keywords : class / new / this / function
vr = variable
cd = conditional statment like if else switch... and return ??
st = string
*/
const HIGHLIGHT_TAG = {
    noTag: {
        start: "",
        end: "",
        startLength: 0,
        endLength: 0,
        totalLength: 0, 
        used: false,
    },
    function: {
        start: "<fn>",
        end: "</fn>",
        startLength: 4,
        endLength: 5,
        totalLength: 9, 
        used: true,
    },
    className: {
        start: "<cl>",
        end: "</cl>",
        startLength: 4,
        endLength: 5,
        totalLength: 9, 
        used: true,
    },
    keywords: {
        start: "<kw>",
        end: "</kw>",
        startLength: 4,
        endLength: 5,
        totalLength: 9, 
        used: true,
    },
    variable: {
        start: "<vr>",
        end: "</vr>",
        startLength: 4,
        endLength: 5,
        totalLength: 9, 
        used: false,
    },
    conditional: {
        start: "<cd>",
        end: "</cd>",
        startLength: 4,
        endLength: 5,
        totalLength: 9, 
        used: true,
    },
    string: {
        start: "<st>",
        end: "</st>",
        startLength: 4,
        endLength: 5,
        totalLength: 9, 
        used: false,
    },
    selection: {
        start: "<sl>",
        end: "</sl>",
        startLength: 4,
        endLength: 5,
        totalLength: 9,
        used: true,
    },
    special: {
        start: "<special>",
        end: "</special>",
        startLength: 9,
        endLength: 10,
        totalLength: 19,
        used: true,
    },
}

class __line{
    constructor(){
        this._plain_text = "";
    }
}

class _line{
    constructor(initialStringValue = ""){
        
        this.uiElement = document.createElement("div");
        
        this.uiElement.className = "_line";
        this.uiElement._gdm = true;
        this.uiElement._gd_line = this;
        

        //***to-do for mutiline textwrap */
        this.highlightSetup();
        this.basicTextData = initialStringValue;//initialStringValue.replaceAll(NOT_VALID_BASIC_TEXT_DATA_VALUES__AS_REGXP, "");
        
        // this.basicTextData IS main plain text
        // only plain text for now
        

        
        //this.brutContent = this.basicTextData;
        //this.uiElement.appendChild(document.createElement("br"));
        
        //this.updateUi()
        this.fixedChildListFixedCount = 0;
        this.childListPresentSet = new Set();
        this.textNodeList = [];

        this.textNodeList.push(new Text(this.basicTextData));
        this.uiElement.appendChild(this.textNodeList[0]);
    }
    
    get length(){
        return this.basicTextData.length;
    }
    setLineNumber(lineNumber){
        //debugger;
        this.uiElement.dataset._line_number = lineNumber;
        this.uiElement._line_number = lineNumber;
        this._line_number = lineNumber;
    }
    clear(){
        this.__setText("");
    }
    
    __setText(text){

        this.basicTextData = text;
        
        this.recomputeUiElement();
    }
    //NO DATA CHECK
    inputKey(key){
        /*if(key == "\n" || key == "\r" || key == "\r\n"){

        }*/
        this.basicTextData += key;
        this.recomputeUiElement();
    }
    addString(string){
        console.log("ADD STRING");
        this.basicTextData = this.basicTextData.concat(string);
        
        this.recomputeUiElement();
    }
    prependLine(line){
        this.isLine_crash(line);

        this.basicTextData = line.basicTextData + this.basicTextData;
        this.recomputeUiElement();
    }
    appendLine(line){
        this.isLine_crash(line);

        this.basicTextData += line.basicTextData;
        this.recomputeUiElement();
    }
    splitLine_returnLine(index){
        let tempLine = new _line (this.basicTextData.substring(index));
        this.basicTextData = this.basicTextData.substring(0, index);

        this.recomputeUiElement();
        return tempLine;
    }
    splitLine_returnString(index){
        let tempLine = this.basicTextData.substring(index);
        this.basicTextData = this.basicTextData.substring(0, index);

        this.recomputeUiElement();
        return tempLine;
    }
    insertString(string, index){
        if(index == this.length){
            this.addString(string);
            return this.uiElement;
        }
        let basicTextData = this.basicTextData;
        index = index % (this.basicTextData.length + 1);

        this.basicTextData = basicTextData.substring(0, index) + string + basicTextData.substring(index);
        
        this.recomputeUiElement();
        return this.uiElement;
    }
    get textData(){
        return this.basicTextData;
    }
    set textData(newTextData){
        this.__setText(newTextData);
        return;
        this.uiElement.replaceChild(document.createTextNode(newTextData), this.uiElement.firstChild);
    }
    get_textData_range(a = 0 , b = undefined){
        let orderedIndex = this.__orderAndCheckIndex(a,b);
        
        return this.textData.substring(orderedIndex.a,orderedIndex.b);
    }
    get_textData_range_as_line(a = 0 , b = undefined){
        return new _line(this.get_textData_range(a,b));
    }
    recomputeUiElement(){


        console.log(this.textn);
        if(this.textNodeList.length == 0){
            this.textNodeList.push(new Text(""));
            this.uiElement.appendChild(this.textNodeList[0]);
        }
        this.textNodeList[0].replaceData(0, this.textNodeList[0].length, this.basicTextData);
        
        console.log(this.textn);
    }
    
    wrapText(startIndex, startString, endIndex, endString){
        /**
         * 
         * to-do Check parameters values
         */

         let basicTextData = this.basicTextData;
         /*let orderedIndex = this.__orderAndCheckIndex(startIndex, endIndex);
         startIndex = orderedIndex.a, endIndex = orderedIndex.b;*/
         this.basicTextData = basicTextData.substring(0, startIndex) + startString + basicTextData.substring(startIndex, endIndex) + endString + basicTextData.substring(endIndex);
         this.recomputeUiElement();
         

    }
    filledTextNode(text){
        return document.createTextNode(text);
    }
    get brutContent(){
        return this.uiElement.innerHTML;
    }
    set brutContent(newBrutContent){
        this.uiElement.innerHTML = newBrutContent;
        
    }
    // can break the _line object
    insertBrutContent(brutString, index){
        let brutContent = this.brutContent;
        index = index % (this.brutContent.length + 1);

        this.brutContent = brutContent.substring(0, index) + brutString + brutContent.substring(index);
        
    }

    getBrutContent(){

    }
    
    wrapBrutContent(startIndex, startContent, endIndex, endContent){
        /**
         * 
         * to-do Check parameters values
         */

         let brutContent = this.brutContent;
         let orderedIndex = this._brut__orderAndCheckIndex(startIndex, endIndex);
         startIndex = orderedIndex.a, endIndex = orderedIndex.b;
         this.brutContent = brutContent.substring(0, startIndex) + startContent + brutContent.substring(startIndex, endIndex) + endContent + brutContent.substring(endIndex);
    }
    

    _brut__orderAndCheckIndex(a,b = undefined){

        let length = this.brutContent.length;
        a = Math.abs(a);
        if(b === undefined)
            b = length - 1;
        b = Math.abs(b);
        if( a > b){
            let cach = a;
            a = b;
            b = cach;
        }
        return {a,b};
    }
    //to-do solution if a is negative other than error
    __orderAndCheckIndex(a = -1, b = -1){

        let length = this.length;
        /*a = Math.abs(a);
        if(b === undefined)
            b = length - 1;
        b = Math.abs(b);*/
        if(a < 0 || b < 0 || a > length+1 || b > length+1){
            throw new Error("provided index are invalid:  Index a:" + a + " < 0 || Index b:" + b + " < 0 || Index a:" + a + " >= " + length + "+1 || Index b:" + b + " >= " + length + "+1");
            
        }
        if( a > b){
            let cach = a;
            a = b;
            b = cach;
        }
        return {a,b};
    }
    dismountUI(){
        this.uiElement.parentNode.removeChild(this.uiElement);
    }
    delete(){
        this.dismountUI();
    }
    deleteFromTo(a,b){
        //delete from a to b (char n°a is also deleted char n°b is not deleted)
        console.log("FUNCTION CALL: deleteFromTo(a,b)");
        let order = this.__orderAndCheckIndex(a,b);
        let start = order.a, end = order.b;

        if((end - start) == this.length){
            this.clear();
            return;
        }
        this.basicTextData = this.basicTextData.substring(0, start) + this.basicTextData.substring(end);
        this.recomputeUiElement();
        
    }
    backspace(index){
        if(this.length > 0){
            this.basicTextData = this.basicTextData.substring(0, index) + this.basicTextData.substring(index + 1);

            this.recomputeUiElement();
            return true;
        }
        return false;
    }

    sectorsSetup(){
        this._texte_sector = new _gd_interval_sector();
    }

    highlightSetup(){
        //called "tag" but are html balise
        //_highlightMap entrie : [type of tag, _gd_interval object, bool tag status open/closed] 
        this._highlightMap = new Map();
    }
    highlight(id, startIndex, endIndex, type = HIGHLIGHT_TAG.noTag){
        
        let orderedIndex = this.__orderAndCheckIndex(startIndex, endIndex);
        this._highlightMap.set(id, [type, new _gd_interval(orderedIndex.a, orderedIndex.b, id), false]);

        apply_highlight();

    }
    apply_highlight(){
        let IntervalArray = Array.from(this._highlightMap.values());
        let tag_layering_array = _gd_interval.nested_interval_range_from_interval_list(IntervalArray);

        let indexDecal = 0;
        let concatenated_tag_string = "";
        tag_layering_array.forEach((value) => {
            value[1].forEach((value) => {
                this._highlightMap.get(value)[2]  != this._highlightMap.get(value)[2];
                concatenated_tag_string += this._highlightMap.get(value)[2] ? this._highlightMap.get(value)[0].start : this._highlightMap.get(value)[0].end;
                
            });
            this.insertBrutContent(concatenated_tag_string, value[0] + indexDecal);
            indexDecal += concatenated_tag_string.length;
            concatenated_tag_string = "";
        });
    }
    cursorToIndex(selection = window.getSelection(), index = this.length){
        console.log(index);
        try{
            selection.collapse(this.textNodeList[0], index);
        }
        catch(error){
            console.error(error);
            selection.collapse(this.uiElement, index);
        }
        
    }
    isLine(supposed_line){
        return supposed_line instanceof _line;
    }
    isLine_crash(supposed_line){
        if(!this.isLine(supposed_line)){
            throw new Error("argument is not instanceof _line");
        }
        //return supposed_line instanceof _line;
    }
    
}

function getValidParent(node){
    if(node._gdm){
        return node;
    }
    
    node = node.parentNode;
    let i = 10;
    while(i > 0){
        if(node._gdm){
            return node;
        }
        node = node.parentNode;
        --i;
    }
    return null;
}
//for key action call function sloted to be called before the main bloc.
const _slot_keyAction = {

}
var __slotkeyaction = [];
function _slot_keyAction_call(){
    __slotkeyaction.forEach(fn_arg_array => {
        if(fn_arg_array[1] !== undefined){
            fn_arg_array[0](fn_arg_array[1]);
        }
        fn_arg_array[0]()
    });
    __slotkeyaction = [];
}

function _slot_keyAction_add(fn, arg = undefined){
    __slotkeyaction.push([fn, arg]);
}

/* interval = {
        start: Number,
        end: Number,
}*/
const VALID_BASIC_TEXT_DATA_VALUES__AS_REGXP = /\p{L}|\p{S}|\p{M}|\p{N}|\p{P}|\p{Zs}/u;
const NOT_VALID_BASIC_TEXT_DATA_VALUES__AS_REGXP = /\P{L}|\P{Ll}/ug;
const INTERVAL_ARRAY = [
    [0,0], //interval 1
    [0,0], // interval 2
];
function interval(intervalArray = INTERVAL_ARRAY){
    let intervallMap = new Map();
    intervalArray.forEach((interval, index) => {
        if(intervallMap.has(interval[0]))
            intervallMap.get(interval[0]).push(index);
        else
            intervallMap.set(interval[0], [index]);

        if(intervallMap.has(interval[1]))
            intervallMap.get(interval[1]).push(index);
        else
            intervallMap.set(interval[1], [index]);
    })
    return intervallMap;
}

function h_test(str){
    txtdata.search(str);
}