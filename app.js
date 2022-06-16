// jshint esversion:6
const express = require("express");
const mongoose = require('mongoose');
const _ =require("lodash");
// const request = require('request');
const app = express();
const bodyParser = require("body-parser");

app.use(express.static("public"));
// const https = require("https");
// app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

mongoose.connect("mongodb+srv://admin-akul:test123@cluster0.rw2l1.mongodb.net/?retryWrites=true&w=majority/todolist");

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to todo"
});
const item2 = new Item({
  name: "Hit the + button to add item"
});
const item3 = new Item({
  name: "Click on left check-box to delete item"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name: String,
  items : [itemsSchema]
};
const List = mongoose.model("List", listSchema);

let item=["cook","buy","eat"];
let work=[];

app.get("/",function(req,res){
  let today = new Date();
  let options = {
    weekday:"long",
    day:"numeric",
    month:"long"
  };
  let day=today.toLocaleDateString("en-US",options);


  Item.find({},function(err,foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Success");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle:"Today", newListItems:foundItems});
    }

  });


  // res.sendFile(__dirname+"/index.html");

});

app.post("/",function(req,res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  // if(req.body.list == "Work List"){
  //   work.push(item);
  //   res.redirect("/work");
  // } else{
  //   item.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
  const checkedItemid= req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.deleteOne({_id:checkedItemid},function(err){
      if(!err){
        console.log("delete success");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items:{_id:checkedItemid}}},
      function(err, foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      }
    );
  }

});

// app.get("/work",function(req,res){
//   res.render("list",{listTitle: "Work List", newListItems:work});
// });

  app.get("/:customListname",function(req,res){
    const customListName = _.capitalize(req.params.customListname);

    List.findOne({name : customListName}, function(err, foundList){
      if(!err){
        if (!foundList){
          //create new list
          const list = new List({
            name : customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+customListName);
        }else{
          //show existing list
          res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
      }
    });



  });



app.listen(3000, function(){
  console.log("Server on port 3000");
});
