const express = require("express");
const app = express();

let morgan = require("morgan");
app.use(morgan("combined"));
const cors = require("cors");
app.use(cors());
let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

//usersignmap contains the users and passwords that signup
let usersignmap = new Map();
// sourcecode will be in the submission certificate
//userloginmap contains the users and token that successfully login
let userloginmap = new Map();
//selleritemmap contains the itemid and object of (seller and other item decription )
let selleritemmap = new Map();
//cartmap contains the itemid and user
let cartmap = new Map();
//purchasemap contains the itemid and user
let purchasemap = new Map();
//messagemap contains the sender and object (reciever and the message)
let messagemap = new Map();
//shipeditemarr contains the shipped item
let shipitemarr = [];
//reviewmap contains the item and object (numstars,contents,itemid)
let allchatmessage=[];
let reviewmap = new Map();

app.get("/sourcecode", (req, res) => {
  res.send(
    require("fs")
      .readFileSync(__filename)
      .toString()
  );
});

//create an acccount///////////////////////////////////////////////////
app.post("/signup", (req, res) => {
  let userobj = JSON.parse(req.body);

  if (userobj.username === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "username field missing" })
    );
    return;
  }
  if (userobj.password === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "password field missing" })
    );
    return;
  }
  if (usersignmap.has(userobj.username)) {
    res.send(JSON.stringify({ success: false, reason: "Username exists" }));
    return;
  }

  usersignmap.set(userobj.username, userobj.password);
  res.send(JSON.stringify({ success: true }));
});
////end of create an acccount //////////////////////////////////////////////
//login endpoint ///////////////////////////////////////////////////
app.post("/login", (req, res) => {
  let userobj = JSON.parse(req.body);

  if (userobj.username === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "username field missing" })
    );
    return;
  }
  if (userobj.password === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "password field missing" })
    );
    return;
  }
  if (!usersignmap.has(userobj.username)) {
    res.send(JSON.stringify({ success: false, reason: "User does not exist" }));
    return;
  }
  if (userobj.password !== usersignmap.get(userobj.username)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid password" }));
    return;
  }
  let usertoken = "" + Math.floor(Math.random() * 1000000000);
  userloginmap.set(usertoken, userobj.username);
  res.send(JSON.stringify({ success: true, token: usertoken }));
});

///end of login ///////////////////////////////////////////////////////

//change-password end point ///////////////////////////////////////////////
app.post("/change-password", (req, res) => {
  let userobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
 // console.log("stored password : " + usersignmap.get(userloginmap.get(auth)));
//  console.log("old passwrod: " + userobj.oldPassword);
  if (usersignmap.get(userloginmap.get(auth)) !== userobj.oldPassword) {
    res.send(
      JSON.stringify({ success: false, reason: "Unable to authenticate" })
    );
    return;
  }

  usersignmap.set(userloginmap.get(auth), userobj.newPassword);
  res.send(JSON.stringify({ success: true }));
});

//end of change passwrod /////////////////////////////////////////////////////////

//create listing end point ///////////////////////////////////////////////////////
app.post("/create-listing", (req, res) => {
  let itemobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (itemobj.price === undefined) {
    res.send(JSON.stringify({ success: false, reason: "price field missing" }));
    return;
  }
  if (itemobj.description === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "description field missing" })
    );
    return;
  }
  
  let itemid = "" + Math.floor(Math.random() * 1000000000);

  let newitem = {
    price: itemobj.price,
    description: itemobj.description,
    itemId: itemid,
    sellerUsername: userloginmap.get(auth)
  };
 // console.log("new item : "+JSON.stringify(newitem))
  
  selleritemmap.set(itemid, newitem);
  //test seller map 
//  let testitem = Array.from(selleritemmap.keys());
//  let testarr =[]
//  for (let k=0 ; k< testitem.length ; k++){
 //   testarr.push(selleritemmap.get(testitem[k]))
 // }
 // console.log("items : "+ JSON.stringify(testarr))
  ///end test
  res.send(JSON.stringify({ success: true, listingId: itemid }));
});

//end of create listing /////////////////////////////////////////
//listing end point ////////////////////////////////////////////
app.get("/listing", (req, res) => {
  let item = req.query.listingId;
  if (!selleritemmap.has(item)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid listing id" }));
    return;
  }
  console.log("listing : "+JSON.stringify(selleritemmap.get(item)))
  res.send(JSON.stringify({ success: true, listing: selleritemmap.get(item) }));
});

//end of listing /////////////////////////////////////////////////////////

//modify listing end point //////////////////////////////////////////////////////
app.post("/modify-listing", (req, res) => {
  let itemobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (itemobj.itemid === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "itemid field missing" })
    );
    return;
  }

  let newitem = selleritemmap.get(itemobj.itemid);

  if (itemobj.description !== undefined) {
    newitem.description = itemobj.description;
  }
  if (itemobj.price !== undefined) {
    newitem.price = itemobj.price;
  }
  
  // console.log("item changes!!!! : "+ JSON.stringify(testarrb))
    //test seller map befor
  //let testitemb = Array.from(selleritemmap.keys());
  //let testarrb =[]
  //for (let k=0 ; k< testitemb.length ; k++){
  //  testarrb.push(selleritemmap.get(testitemb[k]))
//  }
 // console.log("seller map items before modify!!!! : "+ JSON.stringify(testarrb))
  ///end test
//test new modified item
 // console.log("modify item !!!! : " +JSON.stringify(newitem))
  //end test
  selleritemmap.set(itemobj.itemid, newitem);
  
    //test seller map 
//  let testitem = Array.from(selleritemmap.keys());
// let testarr =[]
  //for (let k=0 ; k< testitem.length ; k++){
 //   testarr.push(selleritemmap.get(testitem[k]))
//  }
//  console.log("seller map items after modify!!!! : "+ JSON.stringify(testarr))
  ///end test
  res.send(JSON.stringify({ success: true }));
});

//end of modify listing /////////////////////////////////////////////////

//add-to-cart end point /////////////////////////////////////////////////////////
app.post("/add-to-cart", (req, res) => {
  let itemobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

    if (itemobj.itemid === undefined) {
    res.send(JSON.stringify({ success: false, reason: "itemid field missing" }));
    return;
  }
  if (!selleritemmap.has(itemobj.itemid)) {
    res.send(JSON.stringify({ success: false, reason: "Item not found" }));
    return;
  }

  let cartitem = [];
  if (cartmap.has(userloginmap.get(auth))) {
    cartitem = cartmap.get(userloginmap.get(auth));
  }
  cartitem.push(itemobj.itemid);

  cartmap.set(userloginmap.get(auth), cartitem);
  res.send(JSON.stringify({ success: true }));
});

//end of add-to-cart /////////////////////////////////////////

//cart end point /////////////////////////////////////////////
app.get("/cart", (req, res) => {
  let auth = req.headers.token;
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  let cartitem = [];
  if (cartmap.has(userloginmap.get(auth))) {
    cartitem = cartmap.get(userloginmap.get(auth));
  }
  let itemdetails = [];

  for (let i = 0; i < cartitem.length; i++) {
    itemdetails.push(selleritemmap.get(cartitem[i]));
  }

  res.send(JSON.stringify({ success: true, cart: itemdetails }));
});

//end of cart /////////////////////////////////////////////

//checkout end point /////////////////////////////////////////
app.post("/checkout", (req, res) => {
  let auth = req.headers.token;
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  let cartitem = [];
  if (cartmap.has(userloginmap.get(auth))) {
    cartitem = cartmap.get(userloginmap.get(auth));
  }

  if (!cartmap.has(userloginmap.get(auth)) || cartitem.length === 0) {
    res.send(JSON.stringify({ success: false, reason: "Empty cart" }));
    return;
  }

  let found = false;
  for (let i = 0; i < cartitem.length; i++) {
    if (purchasemap.has(cartitem[i])) {
      found = true;
    }
  }

  if (found) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Item in cart no longer available"
      })
    );
    return;
  }
  for (let j = 0; j < cartitem.length; j++) {
    purchasemap.set(cartitem[j], userloginmap.get(auth));
  }
  res.send(JSON.stringify({ success: true }));
});

//end of checkout //////////////////////////////////////////////

//purchase-history end point ////////////////////////////////////////
app.get("/purchase-history", (req, res) => {
  let auth = req.headers.token;
  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
  let purchasemaparr = Array.from(purchasemap.keys());
  let purchaseditem = [];
  for (let i = 0; i < purchasemaparr.length; i++) {
    if (purchasemap.get(purchasemaparr[i]) === userloginmap.get(auth)) {
      purchaseditem.push(purchasemaparr[i]);
    }
  }
//console.log("purchaseditem :"+purchaseditem.toString())
  let itemdetails = [];

  for (let j = 0; j < purchaseditem.length; j++) {
    itemdetails.push(selleritemmap.get(purchaseditem[j]));
  }

 //   console.log("itemdetails : "+JSON.stringify(itemdetails))
  res.send(JSON.stringify({ success: true, purchased: itemdetails }));
});

//end of purchase-history ///////////////////////////////

//chat end point ////////////////////////////////////////
app.post("/chat", (req, res) => {
  
 
  let auth = req.headers.token;

  let userobj =undefined;
//  console.log("req.body ????:",req.body);
  //console.log("req.body type ????:",typeof req.body);
  // let test=req.body.toString() ;
   // console.log(" expression !!!!! = "+req.body)
  //console.log("req.body length :",test.length +"  and content :"+JSON.stringify(test))
 try {
    userobj=  JSON.parse(req.body);
  }
  catch(e){
    userobj =undefined;
  }
 


  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (userobj.destination === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "destination field missing" })
    );
    return;
  }

  if (userobj.contents === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "contents field missing" })
    );
    return;
  }

  let allusers = Array.from(userloginmap.keys());

  let found = false;
  for (let i = 0; i < allusers.length; i++) {
    if (userloginmap.get(allusers[i]) === userobj.destination) {
      found = true;
    }
  }

  if (!found) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Destination user does not exist"
      })
    );
    return;
  }

  let messagesarr = [];
  if (messagemap.has(userloginmap.get(auth))) {
    messagesarr = messagemap.get(userloginmap.get(auth));
  }

  let message = {
    destination: userobj.destination,
    contents: userobj.contents
  };
  let newchat={
    from:userloginmap.get(auth),
    destination: userobj.destination,
    contents: userobj.contents
  };
  messagesarr.push(message);
  messagemap.set(userloginmap.get(auth), messagesarr);
 
  allchatmessage.push(newchat)
  res.send(JSON.stringify({ success: true }));
});

//end of chat /////////////////////////////////////////

//chat message end point/////////////////////////////////////////
app.post("/chat-messages", (req, res) => {
  let userobj = undefined
  try{
     userobj=JSON.parse(req.body);
  }
   catch( e){
     
   }  
  let auth = req.headers.token;
  if (auth === undefined) {
    res.send(JSON.stringify({ success: false, reason: "token field missing" }));
    return;
  }

  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }
let dest=undefined
try{
  dest=userobj.destination
}
  catch(e){
     res.send(
      JSON.stringify({ success: false, reason: "destination field missing" })
    );
    return;
  }
  
   if (dest === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "destination field missing" })
    );
    return;
  }
  
    let allusers = Array.from(userloginmap.keys());

  let found = false;
  
  if(dest !==undefined){
     for (let i = 0; i < allusers.length; i++) {
    if (userloginmap.get(allusers[i]) === dest) {
      found = true;
    }
  }

  if (!found) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Destination user not found"
      })
    );
    return;
  }

  }
 
  
 


  let messagearr = [];

  for(let i=0 ; i<allchatmessage.length ;i++){
    if((allchatmessage[i].from ===userloginmap.get(auth))&&(allchatmessage[i].destination ===userobj.destination)){
        let newmessage={from:userloginmap.get(auth) ,contents:allchatmessage[i].contents}
      messagearr.push(newmessage);
       }
     if((allchatmessage[i].from ===userobj.destination)&&(allchatmessage[i].destination ===userloginmap.get(auth))){
        let newmessage={from:userobj.destination ,contents:allchatmessage[i].contents}
      messagearr.push(newmessage);
       }
  }
  res.send(JSON.stringify({ success: true, messages: messagearr }));
});

//end of chat message//////////////////////////////////////

//ship end point/////////////////////////////////
app.post("/ship", (req, res) => {
  let itemobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (!purchasemap.has(itemobj.itemid)) {
    res.send(JSON.stringify({ success: false, reason: "Item was not sold" }));
    return;
  }
  let found = false;
  for (let i = 0; i < shipitemarr.length; i++) {
    if (shipitemarr[i] === itemobj.itemid) {
      found = true;
    }
  }

  if (found) {
    res.send(
      JSON.stringify({ success: false, reason: "Item has already shipped" })
    );
    return;
  }
let itemdet=selleritemmap.get(itemobj.itemid)
  if (itemdet.sellerUsername !== userloginmap.get(auth)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not selling that item"
      })
    );
    return;
  }

  shipitemarr.push(itemobj.itemid);
  res.send(JSON.stringify({ success: true }));
});

//end of ship //////////////////////////////////

//status end point//////////////////////////////
app.get("/status", (req, res) => {
  let item = req.query.itemid;
  if (!purchasemap.has(item)) {
    res.send(JSON.stringify({ success: false, reason: "Item not sold" }));
    return;
  }

  let found = false;
  for (let i = 0; i < shipitemarr.length; i++) {
    if (shipitemarr[i] === item) {
      found = true;
    }
  }

  if (found) {
    res.send(JSON.stringify({ success: true, status: "shipped" }));
    return;
  } else {
    res.send(JSON.stringify({ success: true, status: "not-shipped" }));
  }
});

//end of status////////////////////////////////////
//review-seller end point/////////////////////////////////
app.post("/review-seller", (req, res) => {
  let itemobj = JSON.parse(req.body);
  let auth = req.headers.token;

  if (!userloginmap.has(auth)) {
    res.send(JSON.stringify({ success: false, reason: "Invalid token" }));
    return;
  }

  if (reviewmap.has(itemobj.itemid)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "This transaction was already reviewed"
      })
    );
    return;
  }
  if (purchasemap.get(itemobj.itemid) !== userloginmap.get(auth)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User has not purchased this item"
      })
    );
    return;
  }

  if (!selleritemmap.has(itemobj.itemid)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User has not purchased this item"
      })
    );
    return;
  }

  let reviewobj = {
    from: userloginmap.get(auth),
    numStars: itemobj.numStars,
    contents: itemobj.contents
  };
  reviewmap.set(itemobj.itemid, reviewobj);
  res.send(JSON.stringify({ success: true }));
});

//end of review-seller ////////////////////////////////////

//reviews end point//////////////////////////////
app.get("/reviews", (req, res) => {
  let sname = req.query.sellerUsername;
  let selleritems = Array.from(selleritemmap.keys());
  let snameitem = [];

  for (let i = 0; i < selleritems.length; i++) {
    if ((selleritemmap.get(selleritems[i]).sellerUsername === sname)&&(reviewmap.has(selleritems[i]))) {
      snameitem.push(selleritems[i]);
    }
  }

  let allreviews = [];
  for (let j = 0; j < snameitem.length; j++) {
    allreviews.push(reviewmap.get(snameitem[j]));
  }

  res.send(JSON.stringify({ success: true, reviews: allreviews }));
});

//end of reviews////////////////////////////////////

//selling end point//////////////////////////////
app.get("/selling", (req, res) => {
  let sname = req.query.sellerUsername;

  if (sname === undefined) {
    res.send(
      JSON.stringify({ success: false, reason: "sellerUsername field missing" })
    );
    return;
  }
  let selleritems = Array.from(selleritemmap.keys());
  let snameitem = [];

  for (let i = 0; i < selleritems.length; i++) {
    if (selleritemmap.get(selleritems[i]).sellerUsername === sname) {
      snameitem.push(selleritemmap.get(selleritems[i]));
    }
  }

  res.send(JSON.stringify({ success: true, selling: snameitem }));
});

//end of selling////////////////////////////////////

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// send the default array of dreams to the webpage

// listen for requests :)
app.listen(process.env.PORT || 3000 )