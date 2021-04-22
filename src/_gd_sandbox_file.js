'use strict';

class _gd_sandbox_file extends _gd_event{
    constructor(name, MIME, content, creationDate = Date.now(), lastModified = Date.now(),
    path = "/"){
        super();
        this.isValid(name, MIME, creationDate, lastModified, path);
        
        this._path = path;
        this._name = name;
        this._fullName = this._path + this._name;
        this._MIME = MIME;
        this._content = content;
        this._creationDate = creationDate;
        this._lastModified = lastModified;
        this._open = false;
        this.editor = null;

        this._make_ui_element();

        this.__addEventType("filechange", ["content", "lastModified"]);
    }

    set name(name){
        this._name = name;
        this._fullName = this._path + name;
        
        this.uiName.innerHTML = name;
    }
    set path(path){
        this._path = path;
        this._fullName = path + this._name;
    }
    get name(){
        return this._name;
    }
    get path(){
        return this._path;
    }
    get fullName(){
        return this._fullName;
    }
    isOpen(){
      return this._open;
    }
    get isOpen(){
      return this._open;
    }
    open(){
        if(this._open){
            console.warn(" _gd_sandbox_file is already open");
            return false;
        }
        this._open = true;
        return true;
    }
    close(){
        if(!this._open){
            console.warn(" _gd_sandbox_file is already closed");
            return false;
        }
        this._open = false;
        return true;
    }
    get content(){
        return this._content;
    }
    set content(value){
        this._content = value;
        this._lastModified = Date.now();
        this.dispatchEvent("filechange");
    }
    get creationDate(){
        return this._creationDate;
    }
    /*set creationDate(value){
        this._creationDate = value;
    }*/
    get lastModified(){
        return this._lastModified;
    }
    get fileData(){
        return {
            name: this._name,
            MIME: this._MIME,
            content: this._content,
            lastModified: this._lastModified,
            creationDate: this._creationDate,
            path: this._path,
            fullName: this._fullName,
            open: this._open,
        };
    }
    isValid(name, MIME, creationDate, lastModified, path){
        if(!(typeof name == "string"))
            throw new Error ("'name' typeof is not string");
        if(!(typeof MIME == "string"))
            throw new Error ("'MIME' typeof is not string");
        if(isNaN(creationDate))
            throw new Error ("'creationDate' is not number");
        if(isNaN(lastModified))
            throw new Error ("'lastModified' is not number");
        if(!(typeof path == "string"))
            throw new Error ("'path' typeof is not string");
        if(name.includes("/")){
            throw new Error ("'name' Is invalid");
            let index = name.lastIndexOf("/");
            if(index == name.length - 1 || name.includes("//")){
                throw new Error ("'name' Is invalid");
            }
        }
        return true;
    }
    
    _make_ui_element(){
      this.uiElement = document.createElement("li");
      this.uiElement.className = "file";
      
      this.uiName = document.createElement("div");
      this.uiName.className = "name";
      this.uiName.innerHTML = this.name;

      this.uiElement.append(this.uiName);
      this.uiElement._gd_oject = this;

      this.uiElement._contextmenu_type = "file";
    }

    removeFile(){
      if(this.parentFolder instanceof _gd_sandbox_folder){
        this.parentFolder._files.delete(this.name);
      }
      this.uiElement.parentNode.removeChild(this.uiElement);
      console.log( this.name + "UI ROMVED");
    }
}
function _fileFromFileData(file){
    return new _gd_sandbox_file(file.name, file.MIME, file.content,
        file.creationDate, file.lastModified, file.path);
}
function is_gd_sandbox_file(file){
    return (file instanceof _gd_sandbox_file);
}