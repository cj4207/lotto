const express = require('express');
const myspl = require('mysql');
const xlsx = require('xlsx');
const path = require('path');

const jsonData = []
// fetchLottoInfo(1).then(()=>{
//   console.log(jsonData,'jsonData')
// })

function fetchLottoInfo(roundNo){
  fetch(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${roundNo}`)
  .then(res=>res.json())
  .then(lottoData=>{
    if(lottoData.returnValue !== 'success'){
      const worksheet = xlsx.utils.json_to_sheet(jsonData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'sheet1');
      xlsx.writeFile(workbook, path.join(__dirname, '1.xlsx'));
      return
    }
    else{
      console.log(roundNo,'회차 입력중....')
      jsonData.push(lottoData)
      roundNo++
      setTimeout(()=>{
        fetchLottoInfo(roundNo)
      },5000)
    }
  })
}
let i = 1
fetchLottoInfo(i)
// const con = myspl.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'cksdud4607'
// })

// con.connect((err)=>{
//   if(err) throw err;
//   console.log('DB Connected!')
// })

// const app = express();

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// var server = app.listen(3000, function () {
//   var host = server.address().address;
//   var port = server.address().port;
//   console.log('Server is working : PORT - ',port);
// });