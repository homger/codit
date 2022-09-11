'use strict';

//KEEP IT SIMPLE

document.onreadystatechange = function(){
    if(document.readyState === "complete"){
        main();
    }
}


let test_interval_array = [new _gd_interval(2,5,"Z"),new _gd_interval(2,6,"A"), new _gd_interval(0,6,"B"), new _gd_interval(2,5,"C")];

function main(){
    let editor = new _gd_sandbox_editor()
    document.body.appendChild(editor._editor)

    console.log(_gd_interval.nested_interval_range_from_interval_list(test_interval_array));
    //VisualiseNestedInterval(_gd_interval.nested_interval_range_from_interval_list(test_interval_array));
    //debugger;
    /*editor.newLine()
    editor.newLine()
    editor._lineArray[0].addString("TEST STRING")
    editor._lineArray[1].addString("Line 222")
*/
    let div = document.getElementById("main");
}

function VisualiseNestedInterval(nestedInterval, originalInterValArray = []){
    let vue = `**************************<br>`;
    vue += originalInterValArray;
    vue  += `<br>**************************<br>`;
    nestedInterval.forEach(changePoint => {
        vue += `${changePoint[0]}  `; 
        changePoint[1].forEach(intervalID => {
            vue += `| ${intervalID} |`;
        });

        vue += `<br>______________________________<br>`;
    })

    document.body.innerHTML = vue;

}