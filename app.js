var express = require('express');
var app = express();
var server = app.listen(3000);
var io = require('socket.io').listen(server);
var mysql = require("mysql");
var bodyParser = require('body-parser');
//var async = require('async');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies



var con = mysql.createConnection({
//    host:'52.37.50.202',
  //  user:'gilt',
   // password:'gilt-all',
   // database:'gilt_xchange',
    host:'127.0.0.1',
     user:'root',
     password:'Pa$$1234',
     database:'lala_exchange',
     port:'3306'
});



    con.connect(function(err){
        if(err){
            console.error('err' + err.stack);
            return;
        }
        console.log(con.threadId)
    })

    
    function getTicker(){
        
        con.query('select pair_coin, parent_coin, rate from ticker where status=1', function(err,rows, fields){
            if(err) throw err;
            // var a = {};
            // var temp = [];
            // var i =0;
            // rows.forEach((v) => {
            //     if(a[v.parent_coin]=='undefined')
            //     {
            //         a[v.parent_coin] = {};
            //     }
            //     var d = [];
            //     rows.forEach((c) => {
            //         if(c.parent_coin==v.parent_coin)
            //         {
            //             d.push(c.pair_coin);
            //         }
            //     });
            //     a[v.parent_coin] = d;
            // });

            //console.log(a);
            
            // Object.keys(a).forEach(function(element, key, _array) {
            //     // element is the name of the key.
            //     // key is just a numerical value for the array
            //     // _array is the array of all the keys
            //     //console.log(element);
            //     // this keyword = secondArg
                
            //     for(i=0; i< a[element].length; i++)
            //     {
            //         from = a[element][i];
            //         con.query('SELECT seller_rate, buyer_rate, trade_type FROM trade where (from_currency="'+element+'" and to_currency="'+from+'") OR (to_currency="'+element+'" and from_currency="'+from+'" )  order by trade_at asc limit 1',function(er,ws, flds){
            //         if(er) throw er;
            //             //console.log(ws);
            //             var Lrate=0;
            //             if(ws.length>0)
            //             {
            //                 if(ws[0].trade_type=='BUY')
            //                     Lrate = ws[0].buyer_rate
            //                 else
            //                     Lrate = ws[0].seller_rate
            //             }
            //             //console.log(Lrate);
            //         });
            //         console.log(1);
            //     }
            //     console.log('Okay')
            // });

            // // con.query('SELECT seller_rate, buyer_rate, trade_type FROM trade where (from_currency="'+v.parent_coin+'" and to_currency="'+v.pair_coin+'" OR to_currency="'+v.parent_coin+'" and from_currency="'+v.pair_coin+'" )  order by trade_at asc limit 1',function(er,ws, flds){
            // //     if(er) throw er;

            // //     console.log(ws);
            // //         //     if(ws[0].trade_type=='BUY')
            // //         //         Lrate = ws[0].buyer_rate
            // //         //     else
            // //         //         Lrate = ws[0].seller_rate
                    
            // //         // console.log(Lrate);
            // //     });

            
            // // q = 'SELECT seller_rate, buyer_rate, trade_type FROM trade WHERE (trade_at >= now() - INTERVAL 24 hour) and (trade_at <= now() - INTERVAL 23.55 hour) order by trade_at asc limit 1'

            // // //console.log(rows);
            io.emit('ticker', {ticker:rows})
       });
    }
    function test(){
        console.log('Okay')
    }

    function getTrades(from_currency, to_currency)
    {
        con.query('select from_currency, to_currency, volume, trade_type, trade_at, seller_rate, buyer_rate from trade where (from_currency="'+from_currency+'" and to_currency="'+to_currency+'") || (from_currency="'+to_currency+'" and to_currency="'+from_currency+'") order by trade_at desc limit 0,12',function(err,rows){
            if(err) throw err;
            io.emit('trade', {trade:rows, from_currency:from_currency, to_crrency:to_currency})
        });
    }
    function getBuy(from_currency, to_currency)
    {
        con.query('select sum(volume) as volume, rate from bid where from_currency="'+to_currency+'" and to_currency="'+from_currency+'" group by rate order by rate desc limit 0,12',function(err,rows){
            if(err) throw err;
                io.emit('buy', {bid:rows, from_currency:from_currency, to_crrency:to_currency})
        });
    }
    function getSell(from_currency, to_currency)
    {
        con.query('select sum(volume) as volume, rate from ask where from_currency="'+from_currency+'" and to_currency="'+to_currency+'" group by rate order by rate asc limit 0,12',function(err,rows){
            if(err) throw err;
                io.emit('sell', {sell:rows, from_currency:from_currency, to_crrency:to_currency})
        });
    }
    


    app.post('/buy', function(req, res){
        // var name = req.param('name');
        var from_currency = req.body.from_currency;
        var to_currency = req.body.to_crrency;
        var trade = req.body.trade;
        if(trade==1)
        {
            trades= getTrades(from_currency, to_currency);
        }
        getBuy(from_currency, to_currency);

        res.send(from_currency+' '+to_currency+' '+trade);

    });
    app.post('/sell', function(req, res) {
        var from_currency = req.body.from_currency;
        var to_currency = req.body.to_currency;
        var trade = req.body.trade;
        if(trade==1)
        {
            trades= getTrades(from_currency, to_currency);
        }
	   res.send(from_currency+' '+to_currency+' '+trade);
      	// getSell(from_currency, to_currency);
	
        res.send(from_currency+' '+to_currency+' '+trade);
    });

    app.post('/all', function(req, res) {
        
        var from_currency = req.body.from_currency;
        var to_currency = req.body.to_currency;
        var trade = req.body.trade;
        var buy = req.body.buy;
        var sell = req.body.sell;
        var ticker = req.body.ticker;
        
        if(trade==1)
        {
            getTrades(from_currency, to_currency);
        }
        if(buy==1)
        {
            getBuy(from_currency, to_currency);
        }
        if(sell==1)
        {
            getSell(from_currency, to_currency);
        }
        
        res.send(from_currency+' '+to_currency+' '+trade+' '+buy+' '+sell);
    });

    app.post('/ticker', function(req, res) {
        getTicker();
        res.send('status-  success');
    });
