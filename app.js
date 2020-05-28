const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
var items = ["Click ➕ to add","Click ☑ to complete","Click ➖ to remove"];
var wLItems = ["Click ➕ to add","Click ☑ to complete","Click ➖ to remove"];
var pLItems = ["Click ➕ to add","Click ☑ to complete","Click ➖ to remove"];
var listTypes = ["To-Do List","Personal List","Work List"];
var classNames=["todoList","personalList","workList"];
let listMap={
  todoList:"/",
  workList:"/work",
  personalList:"/personal"
}
var i = 0;

let options = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
};
let today = new Date();
let dayN = today.toLocaleDateString("en-US", options);

// const https=require('https');
// const request=require('request');
// const ejs=require('ejs');
app.set('view engine', 'ejs');

app.use(express.static("public")); //don't use this when using ejs

app.get("/", function(req, res) {
  let listType=listTypes[0];
  res.render('todo', {
    pDay: dayN,
    nItem: items,
    listType:listType,
    classType:classNames[0]
  });
});

app.get("/work",function(req, res){
  let listType=listTypes[2];
  res.render('todo', {
    pDay: dayN,
    nItem: wLItems,
    listType:listType,
    classType:classNames[2]
  });
});

app.get("/personal",function(req, res){
  let listType=listTypes[1];
  res.render('todo', {
    pDay: dayN,
    nItem: pLItems,
    listType:listType,
    classType:classNames[1]
  });
});

app.post("/", function(req, res) {
  console.log(req.body);

  let item = req.body.newItem;
  // Below part is to remove an item as clicked on '-' button
  let rItem = req.body.checkB;
  let lT= req.body.para;
  let lType=lT;
  let redir="";
if(typeof req.body.tabSelector !='undefined' && req.body.tabSelector !='')
{redir=listMap[req.body.tabSelector];}
else{  redir=listMap[lT];}


  if (item.length === 0  && (typeof rItem !="undefined" && rItem.trim() != "")) {
      if(lT==="workList")
      {
        let ind = wLItems.indexOf(rItem);
        console.log("removing '" + wLItems[ind] +"' from list");
        wLItems.splice(ind, 1);
        redir="/work";
      }
      else if(lT==="todoList")
      {
        let ind = items.indexOf(rItem);
        console.log("removing '" + items[ind] +"' from list");
        items.splice(ind, 1);
        redir="/";
      }
      else {
        let ind = pLItems.indexOf(rItem);
        console.log("removing '" + pLItems[ind] +"' from list");
        pLItems.splice(ind, 1);
        redir="/personal";
      }
  }
//item removal part ends


  console.log("ltype: "+lType);

  if (typeof item !='undefined' && item.trim() != "") {
    console.log("adding '" + item.trim() +"' to list");

      if(lType=="workList")
      {
        wLItems.push(item);
        redir="/work";
      }
      else if(lType=="todoList") {
        items.push(item);
        redir="/";
      }
      else {
        pLItems.push(item);
        redir="/personal";
      }
  } else {
    console.log("empty item, not adding");
  }

console.log("redir "+redir);
res.redirect(redir);
});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server started at port 3000...");
});
