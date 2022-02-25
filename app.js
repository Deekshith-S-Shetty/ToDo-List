const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const date = require(__dirname + "/date.js");
const _ = require("lodash");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const res = require("express/lib/response");
app.set("view engine", "ejs");

// connecting to database

mongoose.connect("mongodb+srv://admin-deekshith:deekshith2002@cluster0.i87md.mongodb.net/todolistDB");

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the todo list.",
});

const item2 = new Item({
  name: "Click + to add items.",
});

const item3 = new Item({
  name: "Click - to remove items.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  const dayName = date.dateName();

  Item.find(function (err, item) {
    if (item.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Added default items.");
        }
      });
      res.redirect("/");
    } else {
      res.render("index", { listName: dayName, items: item });
    }
  });
});

app.post("/", function (req, res) {
  const listName = req.body.list;
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName,
  });

  if(listName === date.dateName()) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
  
});

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === date.dateName()) {
    Item.deleteOne({ _id: itemId }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully Deleted");
      }
      res.redirect("/");
    });
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList) {
        if(!err) {
          res.redirect("/" + listName);
        }
      })
  }
  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("index", {listName: foundList.name, items: foundList.items});
      }
    }
  });
});

app.listen(process.env.PORT, function () {
  console.log("server is running at port 3000");
});
