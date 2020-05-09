const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

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
    console.log(error);
  }
}

exports.heartbeat = functions.https.onRequest((req, res) => {
    try{
        res.send("Success");
    }
    catch (error) {
        responseParser(error,500,res);
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
    }
    
    
});