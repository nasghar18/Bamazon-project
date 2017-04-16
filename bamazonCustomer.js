var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "Bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
});

// function which starts the program
var start = function() {
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;

    console.log("The items we sell are: ");
    for (var i = 0; i < results.length; i++) {
            console.log("Product Name: " + results[i].product_name);
            console.log("Item ID: " + results[i].item_id);
            console.log("Department: " + results[i].department_name);
            console.log("Price: $" + results[i].price);
            console.log("Stock: " + results[i].stock_quantity);
            console.log("-------------------------------");
          };
    
  //asking what item they wanna buy
  inquirer.prompt([{
    name: "choice",
    type: "rawlist",
    choices: function() {
      var choiceArray = [];
      for (var i = 0; i < results.length; i++) {
        choiceArray.push(results[i].product_name);
      }
      return choiceArray;
    },
    message: "What is the ID number of the item you would like to buy?"

       }, {
            name: "OrderAmt",
            type: "input",
            message: "How much of it would you like to buy?",
            validate: function(value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            }

  }]).then(function(answer) {
    // based on their answer, we run a check to make sure we can place their order
    connection.query("SELECT item_id FROM products WHERE ?",[{
      product_name: answer.choice
    }], function(err, results) {
    if (err) throw err;

    //console.log(answer.choice);
    //console.log(answer.OrderAmt);
    

    var idnum = results[0].item_id;

    var stocknum = answer.OrderAmt   

    //console.log(idnum);

    StockCheck(idnum, stocknum);

   });

  });
  
  });
};
//this function checks whether or not we have enough stock of the item they want
var StockCheck = function(id, order){
  connection.query("SELECT stock_quantity FROM products WHERE ?", [{
          item_id: id
        }], function(err, results) {
    if (err) throw err;  

    var stocklvl = results[0].stock_quantity;

    if(stocklvl < order){
      console.log("Insufficient Quantity!");
      start();
    }else{
      console.log("Order is being completed...");
      UpdateandTotal(id, order);
    }

});

};
//this function updates the database and totals their order for this item
var UpdateandTotal = function(idnumber, ordernum){
  connection.query("SELECT stock_quantity FROM products WHERE ?", [{
    item_id: idnumber
  }], function(err, results){
    if(err) throw err;
    var updatelvl = results[0].stock_quantity - ordernum;

    //console.log(updatelvl);

    connection.query("UPDATE products SET ? WHERE ?", [{
           stock_quantity: updatelvl
        },{
          item_id: idnumber
        }], function(err) {
    if (err) throw err;

    console.log("Order completed successfully!")

    connection.query("SELECT price FROM products WHERE ?", [{
      item_id: idnumber
    }], function(err, results){
      if(err) throw err;
      var totalprice = results[0].price * ordernum;
      console.log("Your total order price for this item is: $" + totalprice);
      start();
  });

  });
  });

};
start();