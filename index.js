const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
admin.initializeApp();

function responseParser(payload,status,response)
{
    try {
    if(status===403)
    {
        response.statusCode = 403;
        response.send({"status":403,"responseMessage":payload,"data":{}});
    }
    else if(status===200)
    {
        response.statusCode = 200
        response.send({"status":200,"responseMessage":"SUCCESS","data":payload});
    }
    else if(status===500)
    {
        response.statusCode = 500
        response.send({"status":500,"responseMessage":"INTERNAL SERVER ERROR","data":payload});
    }
}
catch (error) {
    console.error(error);
  }
}

exports.heartbeat = functions.https.onRequest((req, res) => {
    try{
        responseParser("Success", 200, res);
    }
    catch (error) {
        responseParser(error,500,res);
        console.log(error);
    }
});

exports.createDeliveryBoy = functions.https.onRequest((req, res) => {
    
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {
      var body = JSON.parse(req.json);
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
    
    
});

exports.addArea = functions.https.onRequest((req, res) => {
    
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var id = body.name;
      var manager = body.manager;
      admin.database().ref('/area/'+id).set({
        "deliveryCharge":body.deliveryCharge,"manager":body.manager,"minimumBill":body.minimumBill,"name":body.name
        }).then(() => {
        responseParser("Area added Successfully",200,res);
      })

      if(manager.length  != 0 && manager != null)
      {
        admin.database().ref('/managers/'+manager).set({"name":manager,"area":body.name,"phone":"",address:""});
      }
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
    
    
});