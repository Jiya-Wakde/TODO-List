
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect("mongodb+srv://db-jiya:db-jiya-wakde@cluster0.x3kywho.mongodb.net/todolistDB");
}

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({ name: "Read!"});
const item2 = new Item({ name: "Code!"});
const item3 = new Item({ name: "Learn!"});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);


  
app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems)
    .then(function(){
      console.log("Successfully saved into our DB.");
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    };
  })
  .catch(function(err){
    console.log(err);
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});

  });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const newItem = new Item({name: itemName});

 if(listName === "Today"){
  newItem.save();
  res.redirect("/");
 } else {
  List.findOne({name: listName})
  .then(function(foundList){
    foundList.items.push(newItem);
    foundList.save();
    res.redirect("/"+ listName);
  });
 };
});

app.post("/delete", function(req, res){
  const deletingItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(deletingItem)
    .then(function(){
      console.log("Item Deleted");
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletingItem }}})
    .then(function(){
      console.log("Item Deleted");
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/" + listName);
  };
  
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
