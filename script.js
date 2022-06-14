'use strict';

//KEEP IT SIMPLE

document.onreadystatechange = function(){
    if(document.readyState === "complete"){
        main();
    }
}




function main(){
    let editor = new _gd_sandbox_editor()
    document.body.appendChild(editor._editor)

    //console.log(_gd_interval.nested_interval_range_from_interval_list());

    //debugger;
    /*editor.newLine()
    editor.newLine()
    editor._lineArray[0].addString("TEST STRING")
    editor._lineArray[1].addString("Line 222")
*/
    let div = document.getElementById("main");
}