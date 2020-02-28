const Rx = require('rxjs');
import {renderTable} from "./code";

var Data;//=new Array();
var load = document.getElementById('import');
var file=document.getElementById("file");
Rx.Observable.fromEvent(file, 'change')
    .subscribe(() =>{
        var reader = new FileReader();
        if(document.getElementById('file').files[0]) {
            reader.readAsText(document.getElementById('file').files[0]);
            reader.onload = function () {
                 Data = csvToObject(this.result);
                 console.log(Data[0])
            }
        }
    });


 //   .subscribe();//readCSVFile(this));
Rx.Observable.fromEvent(load, 'click')
    .subscribe(() =>{

        console.log(Data);
        console.log(Object.getOwnPropertyNames(Data).length);
       // renderTable([Data.length+1, Object.getOwnPropertyNames(Data).length]);
        let i=0;
        for(var key in Data[0]){　　//遍历对象的所有属性，包括原型链上的所有属性
            if(Data[0].hasOwnProperty(key)){ //判断是否是对象自身的属性，而不包含继承自原型链上的属性
                console.log(key);        //键名
                i++;
                document.getElementById(`${String.fromCharCode(i+64)}1`).querySelector("span").textContent=key;

            }
        }

        for(let j=0;j<Data.length;j++){
            let k=0;
            for(key in Data[j]) {
                k++;
                document.getElementById(`${String.fromCharCode(k+64)}${j+2}`).querySelector("span").textContent = Data[j][key];

            }

        }
});
function csvToObject(csvString){
    var csvarry = csvString.split("\r\n");
    var datas = [];
    var headers = csvarry[0].split(",");
    for(var i = 1;i<csvarry.length;i++){
        let data = {};
        let temp = csvarry[i].split(",");
        for(let j = 0;j<temp.length;j++){
            data[headers[j]] = temp[j];
        }
        datas.push(data);
    }
    return datas;
}

function readCSVFile(obj) {
    let reader = new FileReader();
    if(obj.files) {
        reader.readAsText(obj.files[0]);
        reader.onload = function () {
            let data = csvToObject(this.result);
            console.log(data);//data为csv转换后的对象
        }
    }
}