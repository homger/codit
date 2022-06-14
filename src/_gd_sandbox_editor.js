'use strict';

const vrCursor = {
    line : 0,
    index : 0,
    reset : function(){
        this.line = 0;
        this.index = 0;
    },
    updateFrom : function(from){
        switch(from){
            case "anchor_selection":
                currentSelection = window.getSelection();
                this.line = !isNaN(currentSelection.anchorNode.data._line_number)?  currentSelection.anchorNode.data._line_number : this.line;
                this.index = currentSelection.anchorOffset;
            default: return;
        }
    },
}


//@GDn&p+gbg
class _gd_sandbox_editor{
    constructor(){

        this._hasFile = false;
        this._editor = document.createElement("pre");
        this._editor.className = "editor";
        this._editor.contentEditable = true;
        vrCursor.reset();
        
        this.keyAction = this.keyAction.bind(this);

        this._lineArray = [];
        this._lineMap = new Map(); //to test will delete this._lineArray if ok
        this.lineCount = 0;
        this.newLine = this.newLine.bind(this);
        this.insertLine = this.insertLine.bind(this);

        this.focusedLine = -1;
        
        this.copyPastSetup();
        this.keyActionSetup();
        this.mutationObserverSetup();
        
        /*this._editor.addEventListener("keyup", function(){
            this._file.content = this._editor.textContent;
            console.log(`slect start:  ${this._getSelector().anchorOffset} || slect end: ${this._getSelector().focusOffset}`);
        }.bind(this));*/
        this._editor.addEventListener("keydown", this.keyAction);

        this.hasFocus = false
        this._editor.addEventListener("focus", this.focus.bind(this));
        this._editor.addEventListener("focusout", this.focus.bind(this));

        this.uiElement = this._editor;

    }
    focus(){
        if(this.lineCount == 0){
            this.newLine();
            this.focusedLine = 0;
        }

        this.hasFocus = true;
    }
    focusout(){
        this.hasFocus = false;
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
                    return selection.anchorNode.parentNode._line_number;
                
                return selection.anchorNode._line_number;
            }
                
        }

        return undefined;

    }
    set focusedLine(index){
        this.setCursorPosition(this._lineArray[index], 0);
    }
    get anchorNodeIsEmpty(){
        return !isNaN(selection.anchorNode._line_number) ? true : false;
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
        let selector = this._getSelector();
        console.log("selector   :   "   +  selector);
        if(selector)
            selector.collapse(node, index);
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
    __wrapSelection(selection, startPrintValue, endPrintValue){
        console.log("Will wrap")
        if(this.selectionIsValid(selection)){
            let anchorOffset = selection.anchorOffset, focusOffset = selection.focusOffset;
            console.log("WRAP anchorOffset    :  " + anchorOffset);
            console.log("WRAP focusOffset    :  " + focusOffset);
            if(selection.anchorNode === selection.focusNode){
                this._lineArray[selection.anchorNode.parentNode._line_number].wrapText(anchorOffset, startPrintValue, focusOffset, endPrintValue);
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
                this._lineArray[selection.anchorNode.parentNode._line_number].wrapBrutContent(anchorOffset, startPrintValue, focusOffset, endPrintValue);
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
        }
        console.log();
    }
    __print(printValue, index = vrCursor.index, line = vrCursor.line){
        console.log(line);
        if(line === undefined){
            line = this.anchorNode._line_number;
        }
        this._lineArray[line].insertString(printValue,index);
        ++vrCursor.index;
        this.setCursorPosition(this._lineArray[line].uiElement, index);
        
        /*
        const {anchorOffset, focusOffset} = this.anchor_focus_offset;
        let value = this._editor.textContent;

        if(anchorOffset != focusOffset){
            if(anchorOffset - focusOffset > 0)
                this._editor.textContent = `${value.slice(0,focusOffset)}${printValue}${value.slice(anchorOffset)}`;
            else
                this._editor.textContent = `${value.slice(0,anchorOffset)}${printValue}${value.slice(focusOffset)}`;
        
        
        
            this._getSelector().removeAllRanges();
            
            let range = document.createRange();
            range.setStart(this._editor, anchorOffset + printValue.length + cursorOffset);
            this._getSelector().addRange(range);

            //this._getSelector().focusOffset = anchorOffset + printValue.length + cursorOffset;
            //this._getSelector().anchorOffset = anchorOffset + printValue.length + cursorOffset;
            return;
        }
        
        this._editor.textContent = `${value.slice(0,anchorOffset)}${printValue}${value.slice(anchorOffset)}`;
        
        
        
        this._getSelector().removeAllRanges();
        
        let range = document.createRange();
        range.setStart(this._editor, anchorOffset + printValue.length + cursorOffset);
        this._getSelector().addRange(range);

        //this._getSelector().focusOffset = focusOffset + printValue.length + cursorOffset;
        //this._getSelector().anchorOffset = anchorOffset + printValue.length + cursorOffset;
        
        */
        //console.log(value);
    }
    /*
    keyAction options = {
        printKey: true,
        printValue: "",
        printBrut: false,
        cursorOffset: 0,
        specialAction: true,
        specialFunction: function(textArea){},
        wrapText: true,
        beforeWrapValue:"",
        afterWrapValue:"",
    }
    */
   
    keyActionSetup(){

        this.keyActionMap = new Map();

        this.addKeyAction("Shift", {specialAction: true, specialFunction: function(){
            console.log(this.anchorNode);
        }.bind(this)});

        this.addKeyAction("Tab", {printKey: true, printValue: "  "});
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
        this.addKeyAction("Enter", {specialAction: true, specialFunction: this.insertLine});
        this.addKeyAction("___________Control", {specialAction: true, specialFunction: function(){
            this._lineArray[this.anchorNode.parentNode._line_number].insertBrutContent("<br>", this.anchorOffset)
        }.bind(this)});
        this.addKeyAction("²", {
            printKey: true, printValue: "<special></special>", printBrut: true,
            wrapText: true, beforeWrapValue:"<special>", afterWrapValue:"</special>",
            cursorOffset: -1});
        

    }
    addKeyAction(keyValue, options){
        this.keyActionMap.set(keyValue, options);
    }
    
    keyAction(keyboardEvent){
        
            let key = this.keyActionMap.get(keyboardEvent.key);
            
            if(keyboardEvent.key.length == 1 && keyboardEvent.key.search(VALID_BASIC_TEXT_DATA_VALUES__AS_REGXP) == 0){
                keyboardEvent.preventDefault();
                this.__print(keyboardEvent.key);
                console.log("to basic data:  " + keyboardEvent.key);
                return;
            }
            vrCursor.updateFrom("anchor_selection");
            /*if(key === undefined){
                console.log(keyboardEvent.key);
                keyboardEvent.preventDefault();
                return;
            }*/

            if(this.selectionActive){
                if(key.specialAction){
                    keyboardEvent.preventDefault();
                    this._getSelector().deleteFromDocument();
                    key.specialFunction();
                    return;
                }
                if(key.wrapText){
                    keyboardEvent.preventDefault();
                    if(key.printBrut){
                        
                    }
                    this.__wrapSelection_brut(this._getSelector(), key.beforeWrapValue, key.afterWrapValue);
                    return;
                }
                if(key.printKey){
                    keyboardEvent.preventDefault();
                    if(key.printBrut){

                    }

                    this._getSelector().deleteFromDocument();
                    this.__print(key.printValue);
                    return;
                }
            }
            if(key.specialAction){
                keyboardEvent.preventDefault();
                key.specialFunction();
                return;

            }
            if(key.printKey){
                keyboardEvent.preventDefault();
                this.__print(key.printValue);
                return;
            }
            //alert(keyboardEvent.key);

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
    
    insertLine(line = new _line(""), index = this.focusedLine){
        // alert(); 
        //debugger;
        if(index < 0 || index >= this.lineCount)
            return false;
        //debugger;
        if(this._lineArray[index].textData == ""){



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
        if(lineNumber < 0 || lineNumber >= this.lineCount)
            return false;
        this._lineArray.splice(lineNumber, 1);
        this.reorderLines_startAt_index(lineNumber);
        this.lineCount -= 1;
        return true;
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
    cut(selection){
        
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

class _line{
    constructor(initialStringValue = ""){
        
        this.uiElement = document.createElement("div");
        
        this.uiElement.className = "_line";

        
        this.uiElement._gd_line = this;
        

        //***to-do for mutiline textwrap */
        this.highlightSetup();
        this.basicTextData = initialStringValue.replaceAll(NOT_VALID_BASIC_TEXT_DATA_VALUES__AS_REGXP, "");
        //this.textData = initialStringValue;
        this.uiElement.appendChild(document.createTextNode(""));
        this.uiElement.appendChild(document.createElement("br"));
        
        //this.updateUi()
        this.fixedChildListFixedCount = 0;
        this.childListPresentSet = new Set();
    }
    get length(){
        return this.basicTextData.length;
    }
    setLineNumber(lineNumber){
        this.uiElement._line_number = lineNumber;
        this._line_number = lineNumber;
    }
    
    __setText(text){
        /*
        this.uiElement.innerHTML = "";
        this.uiElement.appendChild(document.createTextNode(text ))*/
        //this.uiElement.appendChild(document.createElement("br"))

        this.uiElement.innerText = text;
        this.fixChildList();
    }
    //NO DATA CHECK
    inputKey(key){
        /*if(key == "\n" || key == "\r" || key == "\r\n"){

        }*/
        this.basicTextData += key;
        this.recomputeUiElement();
    }
    get textData(){
        return this.uiElement.innerText;
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
    addString(string){

        this.textData = this.textData.concat(string);
        this.fixChildList();
    }
    
    insertString(string, index){
        /*let textData = this.textData;
        index = index % (this.textData.length + 1);

        this.textData = textData.substring(0, index) + string + textData.substring(index);
        this.fixChildList();*/

        let basicTextData = this.basicTextData;
        index = index % (this.basicTextData.length + 1);

        this.basicTextData = basicTextData.substring(0, index) + string + basicTextData.substring(index);
        this.fixChildList();
        this.recomputeUiElement();
        return this.uiElement;
    }
    recomputeUiElement(){


        this.uiElement.innerHTML = this.basicTextData;
    }
    wrapText(startIndex, startString, endIndex, endString){
        /**
         * 
         * to-do Check parameters values
         */

         let textData = this.textData;
         let orderedIndex = this.__orderAndCheckIndex(startIndex, endIndex);
         startIndex = orderedIndex.a, endIndex = orderedIndex.b;
         this.textData = textData.substring(0, startIndex) + startString + textData.substring(startIndex, endIndex) + endString + textData.substring(endIndex);
         this.fixChildList();

    }
    get brutContent(){
        return this.uiElement.innerHTML;
    }
    set brutContent(newBrutContent){
        this.uiElement.innerHTML = newBrutContent;
        this.fixChildList();
    }
    // can break the _line object
    insertBrutContent(brutString, index){
        let brutContent = this.brutContent;
        index = index % (this.brutContent.length + 1);

        this.brutContent = brutContent.substring(0, index) + brutString + brutContent.substring(index);
        this.fixChildList();
    }

    getBrutContent(){

    }

    //Why did i write this?
    // to-do
    fixChildList(){
        /*this.childListFixedSet = [];
        console.log(this.uiElement.childNodes);
        if(this.uiElement.childNodes.length != 2){
            this.uiElement.childNodes.forEach(node => 
                this.childListFixedSet.push(node.nodeName)
                );
            //this.uiElement.innerHTML = this.uiElement.innerText + "<br>"
            ++this.fixedChildListFixedCount;
            console.log(this.fixedChildListFixedCount);
            console.log(this.childListPresentSet);
        }*/

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

        let length = this.textData.length;
        /*a = Math.abs(a);
        if(b === undefined)
            b = length - 1;
        b = Math.abs(b);*/
        if(a < 0 || b < 0 || a >= length || b >= length){
            throw new Error("provided index are invalid:  " + a + " < 0 || " + b + " < 0 || " + a + " >= " + length + " || " + b + " >= " + length);
            
        }
        if( a > b){
            let cach = a;
            a = b;
            b = cach;
        }
        return {a,b};
    }
    deleteFromTo(a,b){
        let order = this.__orderAndCheckIndex(a,b);
        start = order.a, end = order.b;
        if(start <= textData.length && end <= textData.length){
            this.textData = textData.substring(0, start) + textData.substring(end);
            return;
        }
        else
            throw new Error("a <= this._string.length && b <= this._string.length  is false");
        
    }

    highlightSetup(){
        this._highlightMap = new Map();
    }
    highlight(id, startIndex, endIndex, type = HIGHLIGHT_TAG.noTag){
        this._highlightMap.set(id, [type, new _gd_interval(startIndex, endIndex)]);
        let orderedIndex = this.__orderAndCheckIndex(startIndex, endIndex);

    }
    
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







