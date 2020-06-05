const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
const _ = require("lodash");

// ************DB PART************
const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://admin_subhajit:Being801@cluster0-u7c8q.mongodb.net/todoListDB?retryWrites=true&w=majority",{ useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false });
//create a new schema
const itemSchema= new mongoose.Schema({
  name:{type:String},
  itemsChecked:{type:String,default:"notStrike",enum: ["notStrike", "Strike"] }
});

// // let initialCount=0;
// // using the above schema we create a mongoose model,use singular name of collection ( it will automatically conver to plural name)
const Item= mongoose.model("Item",itemSchema); //Person collection converted to plural 'people' by mongoose

// Item.countDocuments({}, function(err, c) {initialCount=c;});

//intentionally didn't provide 'checked' field value to see if default declaration in schema works : works!
let defItem1=new Item({  name:"Click ➕ to add"});
let defItem2=new Item({  name:"Click ☑ to complete"});
let defItem3=new Item({  name:"Click ➖ to remove"});

let defItems=[defItem1,defItem2,defItem3];


const listSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,'need list schema type']
  },
  items:[itemSchema]
});

const List=mongoose.model("List",listSchema);

// ************DB PART ENDS************

// 
// const listTypes = ["To-Do List","Personal List","Work List"];
// const classNames=["todoList","personalList","workList"];
// const listMap={
//   todoList:"/",
//   workList:"/work",
//   personalList:"/personal"
// }


const date=require(__dirname + "/date.js");
let dayN=date.getDate();
app.set('view engine', 'ejs');

app.use(express.static("public")); //don't use this when using ejs

const toKebabCase = string => string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()


// using routing parameters
app.get("/", function  (req,res){
  let listType="ToDo";
  listType=_.capitalize(toKebabCase(listType.toLowerCase()));
  List.findOne({name:listType},function(err,obj){
    if(!err)
    {
    if(!obj){
      let list=new List({name:listType,items:defItems});
      list.save();
      res.redirect("/");
    }
    else {
      res.render('custom', {
        pDay: dayN,
        nItem: obj.items,
        listType:listType,
        classType:"todoList"
      });
    }
  }
  });
});

app.get("/:customList", function  (req,res){
  let listType=toKebabCase(req.params.customList.toLowerCase());
  listType=_.capitalize(listType);

  List.findOne({name:listType},function(err,obj){
    if(!err)
    {
    if(!obj){
      let list=new List({name:listType,items:defItems});
      list.save();
      res.redirect("/"+listType);
    }
    else {
      res.render('custom', {
        pDay: dayN,
        nItem: obj.items,
        listType:listType,
        classType:"todoList"
      });
    }
  }
  });
});



// using routing parameters to add to custom list
app.post("/:customList", function  (req,res){

  let listType=toKebabCase(req.params.customList.toLowerCase());
  listType=_.capitalize(listType);
  let newItem=new Item({name:req.body.newItem});

  console.log("list type "+listType);
  console.log("newItem "+newItem);

  List.findOne({name:listType},function(err,obj){
    if(!err){
      if(obj)
{   obj.items.push(newItem);
    obj.save();
    res.redirect("/"+listType);
}
else {
  res.send("object not found");
}
  }
  });
});

//Check part
app.post("/:customList/check", function  (req,res){
  console.log(req.body);
  let listType=toKebabCase(req.params.customList.toLowerCase());
  listType=_.capitalize(listType);
  let check=req.body.itemCheck;
let fileId = mongoose.Types.ObjectId(check);

List.updateOne({name:listType,items:{$elemMatch:{_id:fileId,itemsChecked:"Strike"}}},{$set:{"items.$.itemsChecked":"notStrike"}},function(err,result){
  if(!err){
  if(result.nModified)
  {
    console.log("modified to not-strike");
    res.redirect("/"+listType);
  }
  else {
    List.updateOne({name:listType,items:{$elemMatch:{_id:fileId,itemsChecked:"notStrike"}}},{$set:{"items.$.itemsChecked":"Strike"}},function(err,result){});
    console.log("modified to strike");
    res.redirect("/"+listType);
  }
}
});


});


//remove part
app.post("/:customList/remove", function  (req,res){

  let listType=toKebabCase(req.params.customList.toLowerCase());
  listType=_.capitalize(listType);
  let remItemId = req.body.remItem;
  console.log("list type"+listType);
  console.log("rem item id"+remItemId);
  List.findOneAndUpdate({name:listType},{$pull:{items:{_id:remItemId}}},function(error,result){
  if(error)
  {
    console.log("could not remove the document with following id: "+remItemId);
  }
  else {
    console.log("successfully removed the document with following id: "+remItemId);
    res.redirect("/"+listType);
  }
  }
);
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started at port 3000...");
});
