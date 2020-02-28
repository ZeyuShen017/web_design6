const Rx = require('rxjs');
import './keybord';
import './export'
import './Import'

//const io = require('socket.io-client/dist/socket.io.js');
//const socket = io();
const table = document.getElementById('main_table');
const row=document.getElementsByClassName('index_row');
const column=document.getElementsByClassName('index_column');
const cellInput = document.getElementById('cell_input');
const board = document.getElementById('board');


const mousedown$ = Rx.Observable.fromEvent(table, 'mousedown').filter(e => e.target.nodeName === 'TD');
const mousemove$ = Rx.Observable.fromEvent(document, 'mousemove').filter(e => e.target.nodeName === 'TD');
const mouseup$ = Rx.Observable.fromEvent(document, 'mouseup');
const click$ = Rx.Observable.fromEvent(table, 'click').filter(e => e.target.nodeName === 'TD');
const change$ = Rx.Observable.fromEvent(cellInput, 'blur');
const keyDown$ = Rx.Observable.fromEvent(table, 'keydown').filter(e => e.target.nodeName === 'TD');

var ROW_COUNT = 21, COLUMN_COUNT = 27;
var data = new Array();         //先声明一维
for(let i=0;i<ROW_COUNT-1;i++){          //一维长度为5
    data[i]=new Array(i);    //在声明二维
    for(let j=0;j<COLUMN_COUNT-1;j++){      //二维长度为5
        data[i][j]=false;
    }
}
const tableFrame$ = Rx.Observable.of([ROW_COUNT, COLUMN_COUNT]);



const selection$ = mousedown$
    .switchMap((e) => mousemove$
        .startWith(e)
        .takeUntil(mouseup$)
        .map(e => getPosition(e.target))
        .distinctUntilChanged((p, q) => isPositionEqual(p, q))
        .scan((acc, pos) => {
            if (!acc) {
                return {startRow: pos.row, startColumn: pos.column, endRow: pos.row, endColumn: pos.column};
            } else {
                return Object.assign(acc, {endRow: pos.row, endColumn: pos.column});
            }
        }, null)
    )
    .map((range) => {
        return {
            startRow: Math.min(range.startRow, range.endRow),
            startColumn: Math.min(range.startColumn, range.endColumn),
            endRow: Math.max(range.startRow, range.endRow),
            endColumn: Math.max(range.startColumn, range.endColumn),
        };
    });

click$.subscribe(renderSelection);

const doubleClick$ = click$
    .bufferCount(2, 1)
    .filter(([e1, e2]) =>
        e1.target.id === e2.target.id)// && e1.target.id!== "index" && e2.target.id!== "index")
      //  e1.target.id!== "index";
       // e2.target.id!== "index";
    .map(([e]) => e)
;

const cellChange$ = change$
    .filter(e => e.target.parentNode !== document.body)
    .map(e => Object.assign(getPosition(e.target.parentNode), {
        value: e.target.value,
    }));

tableFrame$.subscribe(renderTable);
//tableFrame1$.subscribe(TableOperation);
//selection$.subscribe(renderSelection);
doubleClick$.merge(keyDown$).subscribe(renderInput);
cellChange$.subscribe(cell => {
    // socket.emit('edit', cell);
    changeInputState();
    console.log(cell.row);
    let num=parseInt(cell.row)-1;
    data[num][Number(cell.column)-1] = cell.value;
    renderData(data);
});





function renderData(data) {
    data.forEach((columns, i) => {
        const rowIndex = i + 1;
        columns.forEach((v, j) => {
            let columnIndex = j + 1;
            let cellEl = document.getElementById(`${String.fromCharCode(columnIndex+64)}${rowIndex}`);
            if(cellEl!==null) {
                let oldV = cellEl.querySelector('span').textContent;
                if (v !== '' && !v) {
                    return;
                }
                if (v === oldV) {
                    return;
                }
                cellEl.querySelector('span').textContent = v;
                if (v.charAt(0) === "=") {
                    let result = 0;
                    let content = new Array();
                    let str = v.substring(1, v.length);
                    if (str.indexOf("SUM") >= 0) {
                        result = 0;
                        str = str.substring(4, v.length - 2);
                        content = str.split(":");

                        let row1 = document.getElementById(content[0]).getAttribute("data-row");
                        let row2 = document.getElementById(content[1]).getAttribute("data-row");
                        let column1 = document.getElementById(content[0]).getAttribute("data-column");
                        let column2 = document.getElementById(content[1]).getAttribute("data-column");
                        if (row1 - row2 === 0) {
                            for (let i = column1; i <= column2; i++) {
                                result += Number(document.getElementById(`${String.fromCharCode(Number(i)+64)}${row1}`).querySelector('span').textContent);
                            }
                            cellEl.querySelector('span').textContent = result.toString();
                        }
                        if (column1 - column2 === 0) {
                            for (let i = row1; i <= row2; i++) {
                                result += Number(document.getElementById(`${String.fromCharCode(Number(column1)+64)}${i}`).querySelector('span').textContent);
                            }
                            cellEl.querySelector('span').textContent = result.toString();
                        }

                    } else if (str.indexOf("+") >= 0) {
                        result = 0;
                        //str=str.substring(4,v.length-2);
                        content = str.split("+");
                        for (let i = 0; i < content.length; i++) {
                            console.log(content[i]);
                            result += Number(document.getElementById(content[i]).querySelector('span').textContent);
                        }
                        cellEl.querySelector('span').textContent = result.toString();
                    } else if (str.indexOf("-") >= 0) {
                        result = 0;
                        //str=str.substring(4,v.length-2);
                        content = str.split("+");
                        for (let i = 0; i < content.length; i++) {
                            console.log(content[i]);
                            result -= Number(document.getElementById(content[i]).querySelector('span').textContent);
                        }
                        cellEl.querySelector('span').textContent = result.toString();
                    } else if (str.indexOf("*") >= 0) {
                        result = 1;
                        //str=str.substring(4,v.length-2);
                        content = str.split("*");
                        for (let i = 0; i < content.length; i++) {
                            console.log(content[i]);
                            result *= Number(document.getElementById(content[i]).querySelector('span').textContent);
                        }
                        cellEl.querySelector('span').textContent = result.toString();
                    } else if (str.indexOf("/") >= 0) {

                        //str=str.substring(4,v.length-2);
                        content = str.split("/");
                        result = Number(document.getElementById(content[0]).querySelector('span').textContent);
                        for (let i = 1; i < content.length; i++) {
                            console.log(content[i]);
                            result /= Number(document.getElementById(content[i]).querySelector('span').textContent);
                        }
                        cellEl.querySelector('span').textContent = Number(result).toPrecision(4).toString();
                    }
                }
            }
        });
    });
}

function changeInputState(e) {
    cellInput.style.display = 'none';
}

function renderInput(e) {
    if(e.target.id==="content") {
        const text = e.target.querySelector('span').textContent;
        e.target.querySelector('span').textContent = '';
        e.target.appendChild(cellInput);
        cellInput.style.removeProperty('display');
        cellInput.value = text;
        cellInput.focus();
    }

}

function renderSelection(e) {
    if(e.target.className==='column') {
        const {top, left} = document.getElementById(`A${e.target.querySelector('span').textContent}`).getBoundingClientRect();
        const {bottom, right} = document.getElementById(`${String.fromCharCode(Number(document.getElementById("main_table").getAttribute('column'))
            + 63)}${e.target.querySelector('span').textContent}`).getBoundingClientRect();
        const selectionEl = document.getElementById('selection');
        selectionEl.style.top = `${top - 2}px`;
        selectionEl.style.left = `${left - 2}px`;
        selectionEl.style.height = `${bottom - top + 3}px`;
        selectionEl.style.width = `${right - left + 3}px`;
        selectionEl.setAttribute("selected",e.target.id);
    }else if(e.target.className==='row'){
        const {top, left} = document.getElementById(`${e.target.querySelector('span').textContent}1`).getBoundingClientRect();
        const {bottom, right} = document.getElementById(`${e.target.querySelector('span').textContent}${Number(document.getElementById("main_table").getAttribute('row'))
            -1}`).getBoundingClientRect();
        //const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        // const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        const selectionEl = document.getElementById('selection');
        selectionEl.style.top = `${top - 2}px`;
        selectionEl.style.left = `${left - 2}px`;
        selectionEl.style.height = `${bottom - top + 3}px`;
        selectionEl.style.width = `${right - left + 3}px`;
        selectionEl.setAttribute("selected",e.target.id);

    }
}

function renderTable([rowCount, columnCount]) {
    const frag = document.createDocumentFragment();
    let tablesize=document.getElementById("main_table");
    tablesize.setAttribute("row",rowCount);
    tablesize.setAttribute("column", columnCount);
    for (let i = 0; i < rowCount; i++) {
        const rowIndex = i;
        const tr = document.createElement('tr');
        tr.id = 'row_' + rowIndex;
        for (let j = 0; j < columnCount; j++) {
            const columnIndex = j;
            const td = document.createElement('td');
            if(j===0){
                td.className='column';
                td.id=`index_row_${i}`;
                if(i>0) {
                    td.appendChild(document.createElement('span'));
                    td.querySelector('span').textContent = i.toString();
                }
                tr.appendChild(td);
                continue;
            }
            if(i===0){
                td.className='row';
                td.id='index_row_column';
                td.appendChild(document.createElement('span'));
                if(j>0) {
                    td.querySelector('span').textContent = String.fromCharCode(j+64);
                    td.id=`index_column_${String.fromCharCode(j+64)}`;
                }
                tr.appendChild(td);
                continue;
            }
            td.id = `${String.fromCharCode(columnIndex+64)}${rowIndex}`;
            td.className='content';
            td.setAttribute('data-row', rowIndex);
            td.setAttribute('data-column', columnIndex);
            td.setAttribute('tabindex', 0);
            td.appendChild(document.createElement('span'));
            tr.appendChild(td);
        }
        frag.appendChild(tr);
    }
    table.innerHTML = '';
    table.appendChild(frag);
    data = new Array();         //先声明一维
    for(let i=0;i<rowCount;i++){          //一维长度为5
        data[i]=new Array(i);    //在声明二维
        for(let j=0;j<columnCount;j++){      //二维长度为5
            data[i][j]=false;
        }
    }
}

function TableOperation([rowCount, columnCount]) {
    const frag = document.createDocumentFragment();
    let row=Number(document.getElementById("main_table").getAttribute("row"));
    let column=Number(document.getElementById("main_table").getAttribute("column"));
    let compare=0;
    if(column===Number(columnCount)) {
        if(row>rowCount){
            let del=document.getElementById(`row_${row}`);
            let parent=del.parentNode;
            parent.removeChild(del);
        }else {
            for (let i = Number(row); i < rowCount; i++) {
                const rowIndex = i + 1;
                console.log(rowIndex);
                const tr = document.createElement('tr');
                tr.id = 'row_' + rowIndex;
                for (let j = 0; j < columnCount; j++) {
                    const columnIndex = j + 1;
                    console.log(columnIndex);
                    const td = document.createElement('td');
                    td.id = `${String.fromCharCode(columnIndex+64)}${rowIndex}`;
                    td.setAttribute('data-row', rowIndex);
                    td.setAttribute('data-column', columnIndex);
                    td.setAttribute('tabindex', 0);
                    td.appendChild(document.createElement('span'));
                    tr.appendChild(td);
                }
                frag.appendChild(tr);
            }
        }
    }else if(row===Number(rowCount)){
        if(column>columnCount){
            for(let i=0;i<row;i++) {
                let del = document.getElementById(`row_${i + 1}`);
                del.deleteCell(column-1);
            }
        }else {
            for (let i = 0; i < rowCount; i++) {
                const rowIndex = i + 1;
                console.log(rowIndex);
                const tr = document.getElementById(`row_${i + 1}`);
                //tr.id = 'row_' + rowIndex;
                for (let j = Number(column); j < columnCount; j++) {
                    const columnIndex = j + 1;
                    console.log(columnIndex);
                    const td = document.createElement('td');
                    td.id = `${String.fromCharCode(columnIndex+64)}${rowIndex}`;
                    td.setAttribute('data-row', rowIndex);
                    td.setAttribute('data-column', columnIndex);
                    td.setAttribute('tabindex', 0);
                    td.appendChild(document.createElement('span'));
                    tr.appendChild(td);

                }
                frag.appendChild(tr);
            }
        }
    }

    //table.innerHTML = '';
    table.appendChild(frag);
    let tablesize=document.getElementById("main_table");
    tablesize.setAttribute("row",rowCount);
    tablesize.setAttribute("column", columnCount);
    data = new Array();         //先声明一维
    for(let i=0;i<rowCount;i++){          //一维长度为5
        data[i]=new Array(i);    //在声明二维
        for(let j=0;j<columnCount;j++){      //二维长度为5
            data[i][j]=false;
        }
    }

}


function getPosition(el) {
    return {
        row: parseInt(el.getAttribute('data-row')),
        column: parseInt(el.getAttribute('data-column')),
    };
}

function isPositionEqual(pos1, pos2) {
    return pos1.row === pos2.row && pos1.column === pos2.column;
}

export {renderTable, ROW_COUNT, COLUMN_COUNT, TableOperation};

