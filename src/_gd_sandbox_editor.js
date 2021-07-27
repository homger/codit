'use strict';


class _gd_sandbox_editor{
    constructor(){

        this._hasFile = false;
        this._editor = document.createElement("pre");
        this._editor.className = "editor";
        this._editor.contentEditable = true;
        
        this.keyAction = this.keyAction.bind(this);

        this._lineArray = [];
        this._lineMap = new Map(); //to test will delete this._lineArray if ok
        this.lineCount = 0;
        this.newLine = this.newLine.bind(this)
        
        this.keyActionSetup();
        this.mutationObserverSetup()
        
        this._editor.addEventListener("keyup", function(){
            this._file.content = this._editor.textContent;
            console.log(`slect start:  ${this._getSelector().anchorOffset} || slect end: ${this._getSelector().focusOffset}`);
        }.bind(this));
        this._editor.addEventListener("keydown", this.keyAction);

        this.hasFocus = false
        this._editor.addEventListener("focus", this.focus.bind(this));
        this._editor.addEventListener("focusout", this.focus.bind(this));

        this.uiElement = this._editor;
    }
    focus(){
        if(this.lineCount == 0)
            this.newLine();
        this.hasFocus = true
    }
    focusout(){
        this.hasFocus = false
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
        return undefined;
    }
    get anchorNode(){
        return this._getSelector().anchorNode;
    }
    get focusNode(){
        return this._getSelector().focusNode;
    }
    get selectionActive(){
        console.log("focus1 :  " + this.hasFocus)
        let b = this._lineMap.has(this.anchorNode.parentNode) && this._lineMap.has(this.focusNode.parentNode)
        
        console.log("node test :  " + b)

        console.log("Anchor node:  ")
        console.log(this.anchorNode)
        console.log("Focus node:  ")
        console.log(this.focusNode)
        if(this.hasFocus && this.anchorNode !== this.focusNode || this.anchorOffset != this.focusOffset && this.selectionIsValid(this._getSelector())){

            //alert("Work")
            return true
            return this._getSelector().anchorOffset == this._getSelector().focusOffset ? false : true;
        }
            
        return undefined;
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
        this._getSelector().collapse(node, index)
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
        this.insertTextAtIndex(text, index);
    }
    
    insertTextAtIndex(text, index){
        
    }
    selectionIsValid(selection){
        //debugger
        return this._lineMap.has(selection.anchorNode.parentNode) && this._lineMap.has(selection.focusNode.parentNode)
        return this._lineMap.has(selection.anchorNode.parentNode) || this._lineMap.has(selection.anchorNode) 
        && this._lineMap.has(selection.focusNode.parentNode) || this._lineMap.has(selection.focusNode)
    }
    __wrapSelection(selection, startPrintValue, endPrintValue){
        console.log("Will wrap")
        if(this.selectionIsValid(selection)){
            let anchorOffset = selection.anchorOffset, focusOffset = selection.focusOffset
            if(selection.anchorNode === selection.focusNode){
                this._lineMap.get(selection.anchorNode.parentNode).wrapText(anchorOffset, startPrintValue, focusOffset, endPrintValue)
                return
            }
            
            this._lineMap.get(selection.anchorNode.parentNode).insertString(startPrintValue, selection.anchorOffset)
            this._lineMap.get(selection.focusNode.parentNode).insertString(endPrintValue, selection.focusOffset)
        }
    }
    __print(printValue, index, line){
        this._lineArray[line].insertString(printValue,index);
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

        this.addKeyAction("Tab", {printKey: true, printValue: "  "});
        this.addKeyAction("{", {
            printKey: true, printValue: "{}",
            wrapText: true, beforeWrapValue:"{", afterWrapValue:"}",
            cursorOffset: -1
        });
        this.addKeyAction("(", {
            printKey: true, printValue: "()", 
            wrapText: true, beforeWrapValue:"(", afterWrapValue:")",
            cursorOffset: -1});
        this.addKeyAction("Backspace", {specialAction: true, specialFunction: function(textArea){}});
        this.addKeyAction("Enter", {specialAction: true, specialFunction: this.newLine});
        this.addKeyAction("Control", {specialAction: true, specialFunction: function(){
            this._lineMap.get(this.anchorNode.parentNode).insertBrutContent("<br>", this.anchorOffset)
        }.bind(this)});
        

    }
    addKeyAction(keyValue, options){
        this.keyActionMap.set(keyValue, options);
    }
    
    keyAction(keyboardEvent){
        let preventDef = true
        
        if(this.selectionActive){
            
            this.__wrapSelection(this._getSelector(), keyboardEvent.key,keyboardEvent.key)
            keyboardEvent.preventDefault()
            return;
        }
        console.log(keyboardEvent.key);
        let key = this.keyActionMap.get(keyboardEvent.key);
        console.log(key)
        //alert(key.printKey)
        if(key !== undefined){
            if( key.printKey == true && key.wrapText != true){
                //keyboardEvent.preventDefault();
                if(this.selectionActive && this.focusNode !== this.anchorNode){
                    /*

                    let lineNumberDifference = this.focusNode._line_number - this.anchorNode._line_number;
                    if( Math.abs( lineNumberDifference ) > 1){
                        let startIndex = lineNumberDifference < 0 ? (this.focusNode._line_number + 1) : (this.anchorNode._line_number + 1);

                        for(let i = 0; i < (lineNumberDifference - 1); ++i){
                            this._lineArray[startIndex + i].uiElement.remove();
                        }

                    }
                    if(this.focusNode._line_number > this.anchorNode._line_number){

                        this._lineArray[this.anchorNode._line_number].deleteFromTo(this.anchorOffset)
                        this._lineArray[this.focusNode._line_number].deleteFromTo(0, this.focusOffset)
                    }
                        
                        */
                    console.log("delete called")
                    this.getSelection.deleteFromDocument();

                }
                if(preventDef)
                    keyboardEvent.preventDefault();

                //this.print(key.printValue, key.cursorOffset);
            }
            else if(key.specialAction){
                //alert("SPECIAL ACTION")
                key.specialFunction()
                keyboardEvent.preventDefault();
            }
        }
        console.log(this._lineMap)
    }


    newLine(){
        let line = new _line("", this.lineCount)
        this._lineArray.push(line);
        this._lineMap.set(line.uiElement, line)

        this.lineCount += 1;
        this._editor.append(line.uiElement)
        this.setCursorPosition(line.uiElement,0)
        //this.updateUi();
    }
    
    _get_lineNumberX(lineNumber){
        if( this.lineCount - lineNumber != 1){
            console.error("lineNumber invalid");
            return;
        }
        return this._lineMap.values()[lineNumber]
    }
    deleteLine(line){
        
    }

    mutationObserverSetup(){
        this.removedNodesCount = 0
        this.lineObserver = new MutationObserver(this.lineMutationFonction.bind(this))
        this.lineObserver.observe(this._editor, {childList: true})
        
    }
    lineMutationFonction(mutationRecord, mutationObserver){
        //debugger;
        if(mutationRecord.length > 0 && mutationRecord[0].type == "childList"){
        
            mutationRecord.forEach(mutation => {
                if(mutation.removedNodes){
                    mutation.removedNodes.forEach(removedNode => {
                        if(this._lineMap.delete(removedNode))
                        this.removedNodesCount += 1
                    })
                }
            })
        }
    }

    /// highlightSystem
    

    ///
    
}








class _line{
    constructor(initialStringValue, lineNumber){
        this._gd_string_object = new _gd_string("")
        if(typeof initialStringValue == "string")
            this._gd_string_object = new _gd_string(initialStringValue)
        
        this.uiElement = document.createElement("div")
        
        this.uiElement.className = "_line"
        this.uiElement.addEventListener("keypress", () => alert("HA LINE"))
        //this.uiElement.contentEditable = true

        this.uiElement._line_number = lineNumber
        
        /*if(this._gd_string_object._string.length > 0){
            
            this.updateUi()
        }
            
        else{
            this.uiElement.appendChild(this._gd_string_object.)
            this.uiElement.innerHTML = "<br>"
        } */

        //***to-do for mutiline textwrap */
        this.uiElement.appendChild(this._gd_string_object._string)
        this.uiElement.appendChild(document.createElement("br"))
        
        //this.updateUi()
            
    }
    __setText(text){
        /*
        this.uiElement.innerHTML = "";
        this.uiElement.appendChild(document.createTextNode(text ))*/
        //this.uiElement.appendChild(document.createElement("br"))
        this.uiElement.innerText = text
    }
    get textData(){
        return this.uiElement.innerText
    }
    set textData(newTextData){
        this.__setText(newTextData)
        return
        this.uiElement.replaceChild(document.createTextNode(newTextData), this.uiElement.firstChild)
    }
    addString(string){

        this.textData = this.textData.concat(string)
    }
    
    insertString(string, index){
        let textData = this.textData
        index = index % (this.textData.length + 1)

        this.textData = textData.substring(0, index) + string + textData.substring(index)
    }
    wrapText(startIndex, startString, endIndex, endString){
        /**
         * 
         * to-do Check parameters values
         */

         let textData = this.textData
         let orderedIndex = this.__orderAndCheckIndex(startIndex, endIndex)
         startIndex = orderedIndex.a, endIndex = orderedIndex.b
         this.textData = textData.substring(0, startIndex) + startString + textData.substring(startIndex, endIndex) + endString + textData.substring(endIndex)

    }

    get brutContent(){
        return this.uiElement.innerHTML
    }
    set brutContent(newBrutContent){
        this.uiElement.innerHTML = newBrutContent
    }
    insertBrutContent(brutString, index){
        let brutContent = this.brutContent
        index = index % (this.brutContent.length + 1)

        this.brutContent = brutContent.substring(0, index) + brutString + brutContent.substring(index)
    }

    getBrutContent(){

    }

    wrapBrutContent(startIndex, startContent, endIndex, endContent){
        /**
         * 
         * to-do Check parameters values
         */

         let brutContent = this.brutContent
         let orderedIndex = this._brut__orderAndCheckIndex(startIndex, endIndex)
         startIndex = orderedIndex.a, endIndex = orderedIndex.b
         this.brutContent = brutContent.substring(0, startIndex) + startContent + brutContent.substring(startIndex, endIndex) + endContent + textData.brutContent(endIndex)

    }
    

    _brut__orderAndCheckIndex(a,b = undefined){

        let length = this.brutContent.length
        a = Math.abs(a)
        if(b === undefined)
            b = length - 1
        b = Math.abs(b)
        if( a > b){
            let cach = a
            a = b
            b = cach
        }
        return {a,b}
    }

    __orderAndCheckIndex(a,b = undefined){

        let length = this.textData.length
        a = Math.abs(a)
        if(b === undefined)
            b = length - 1
        b = Math.abs(b)
        if( a > b){
            let cach = a
            a = b
            b = cach
        }
        return {a,b}
    }
    deleteFromTo(a,b){
        let order = this.__orderAndCheckIndex(a,b)
        start = order.a, end = order.b
        if(start <= textData.length && end <= textData.length){
            this.textData = textData.substring(0, start) + textData.substring(end)
            return
        }
        else
            throw new Error("a <= this._string.length && b <= this._string.length  is false")
        
    }
}



class _gd_string{
    constructor(initialStringValue){
        
        this._string = document.createTextNode(initialStringValue)
        this._string.speProp = "HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    }

    addString(string){
        this._string = this._string.concat(string)
    }
    insertString(string, index){
        index = index % (this._string.length)

        this._string = this._string.substring(0, index) + string + this._string.substring(index)
    }
    deleteFromTo(a,b){
        let start = Math.abs(a)
        if(!b)
            b = this.string.length
        let end = Math.abs(b)
        if( start > end){
            let cach = start
            start = end
            end = cach
        }
        if(start <= this._string.length && end <= this._string.length){
            this._string = this._string.substring(0, start) + this._string.substring(end)
            return
        }
        else
            throw new Error("a <= this._string.length && b <= this._string.length  is false")
        
    }
}
