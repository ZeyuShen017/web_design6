const Rx = require('rxjs');
import {addRow,deleteRow, deleteColumn, addColumn} from "./code"
var row, column;
const add_Row=document.getElementById("addRow");
const delete_Row=document.getElementById("deleteRow");
const add_Column=document.getElementById("addColumn");
const delete_Column=document.getElementById("deleteColumn");


const addRow$=Rx.Observable.fromEvent(add_Row,'click').subscribe(addRow);
const deleteRow$=Rx.Observable.fromEvent(delete_Row,'click').subscribe(deleteRow);
const addColumn$=Rx.Observable.fromEvent(add_Column,'click').subscribe(addColumn);
const deleteColumn$=Rx.Observable.fromEvent(delete_Column, 'click').subscribe(deleteColumn);


