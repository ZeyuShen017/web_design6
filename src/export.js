
const Rx = require('rxjs');

var button = document.getElementById('export');
Rx.Observable.fromEvent(button, 'click')
    .subscribe(() => {
        var str = getTblData("main_table");

        //支持中文
        var uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(str);

        var downloadLink = document.createElement("a");
        downloadLink.href = uri;
        downloadLink.download ="1.csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);})

function getTblData(inTbl) {

    var rows = 0;
    var tblDocument = document;

    //tblDocument = eval(inWindow).document;
    var curTbl = document.getElementById(inTbl);
    var outStr = "";
    if (curTbl != null) {
        for (var j = 0; j < curTbl.rows.length; j++) {
            for (var i = 0; i < curTbl.rows[j].cells.length; i++) {

                if (i == 0 && rows > 0) {
                    outStr += ",";
                    rows -= 1;
                }

                outStr +=curTbl.rows[j].cells[i].innerText + ",";
                if (curTbl.rows[j].cells[i].colSpan > 1) {
                    for (var k = 0; k < curTbl.rows[j].cells[i].colSpan - 1; k++) {
                        outStr += ",";
                    }
                }
                if (i == 0) {
                    if (rows == 0 && curTbl.rows[j].cells[i].rowSpan > 1) {
                        rows = curTbl.rows[j].cells[i].rowSpan - 1;
                    }
                }
            }
            outStr += "\r\n";//换行
        }
    }

    else {
        outStr = null;
        alert(allPage.noData);
    }
    return outStr;
}