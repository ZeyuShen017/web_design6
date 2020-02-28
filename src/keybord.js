const Rx = require('rxjs');
import {TableOperation,} from "./code"
var row, column;
const addRow=document.getElementById("addRow");
const deleteRow=document.getElementById("deleteRow");
const addColumn=document.getElementById("addColumn");
const deleteColumn=document.getElementById("deleteColumn");


const addRow$=Rx.Observable.fromEvent(addRow,'click').subscribe(f);

let keyPlus$ = Rx.Observable.fromEvent(window, 'keydown')
    .subscribe(() => {
        row= document.getElementById("main_table").getAttribute("row");
        column= document.getElementById("main_table").getAttribute("column");
            if (event.keyCode === 187 && event.shiftKey && event.ctrlKey) {
                let content = prompt("Add Row or Column?", "Row");
                if (content.toLowerCase() === "row") {
                   console.log("1");
                    row++;
                    TableOperation([row, column]);
                }else if(content.toLowerCase()=== "column"){
                    console.log("2");
                    column++;
                    TableOperation([row, column]);
                }
            }else if(event.keyCode === 189 && event.shiftKey && event.ctrlKey){
                let content = prompt("Delete Row or Column?", "Row");
                if (content.toLowerCase() === "row") {
                    console.log("1");
                    row--;
                    TableOperation([row, column]);
                }else if(content.toLowerCase()=== "column"){
                    console.log("2");
                    column--;
                    TableOperation([row, column]);
                }
            }
        }
    )

function f() {
    let row=document.getElementById('selection').getAttribute('selected');
    console.log(row);

}