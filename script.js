'use strict';

document.onreadystatechange = function(){
    if(document.readyState === "complete"){
        main();
    }
}




function main(){
    let editor = new _gd_sandbox_editor()
    document.body.appendChild(editor._editor)

    //debugger;
    /*editor.newLine()
    editor.newLine()
    editor._lineArray[0].addString("TEST STRING")
    editor._lineArray[1].addString("Line 222")
*/
    let div = document.getElementById("main");
}