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

    else if(status===400)
    {
        response.statusCode = 400
        response.send({"status":400,"responseMessage":"BAD REQUEST","data":payload});
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

exports.checkAccess = functions.https.onRequest((req, res) => {
    try {
        if(req.method === 'POST')
        {
        var id = req.body.id;
        var role = req.body.role;

        if(id != undefined && role != undefined && id.length!=0 && role.length != 0)
        {


            if(role === "master")
            {
                var statusReport = {accessGranted:true,mobileAdded : true,detailsAdded : true};
                responseParser(statusReport,200,res);
            }
            else if (role === "shop")
            {
                admin.database().ref("/access/"+role+"/"+id).once("value",(snapshot) => {
                    console.log(snapshot);
                    if(!snapshot.exists())
                {
                    var mobile = false;

                    if(snapshot.child('mobileAdded').exists())
                    {
                        mobile = snapshot.child('mobileAdded').val();
                    }

                    admin.database().ref('/access/'+role+'/'+id).child("accessGranted").set(true);
                    responseParser({
                        accessGranted:true,mobileAdded : mobile,detailsAdded : false
                    },200,res);

                
                }
                else
                {
                    var statusReport = {};
                    statusReport.accessGranted = true;
                
                    if(snapshot.child('mobileAdded').exists() && snapshot.child('mobileAdded').val() != null && snapshot.child('mobileAdded').val() == true)
                    {
                        statusReport.mobileAdded = true;
                    }
                    else {
                        statusReport.mobileAdded = false;
                        }

                    if(snapshot.child('detailsAdded').exists() && snapshot.child('detailsAdded').val() != null && snapshot.child('detailsAdded').val() == true )
                    {
                        statusReport.detailsAdded = true;
                    }
                    else {
                        statusReport.detailsAdded = false;
                        }
                    responseParser(statusReport,200,res);
                }

            });
               
            }
            else
            {
        admin.database().ref("/access/"+role+"/"+id).once("value",(snapshot) => {
            console.log(snapshot)
            if(!snapshot.exists())
        {
            responseParser({
                accessGranted:false
            },200,res);
        }
        else {
            var statusReport = {};
            if(snapshot.child('accessGranted').exists() && snapshot.child('accessGranted').val() != null)
            {
                statusReport.accessGranted =  snapshot.child('accessGranted').val();
            }
            else {
                    statusReport.accessGranted = false;
            }
            if(snapshot.child('mobileAdded').exists() && snapshot.child('mobileAdded').val() != null && snapshot.child('mobileAdded').val() == true)
            {
                statusReport.mobileAdded = true;
            }
            else {
                  statusReport.mobileAdded = false;
                }

            if(snapshot.child('detailsAdded').exists() && snapshot.child('detailsAdded').val() != null && snapshot.child('detailsAdded').val() == true )
            {
                statusReport.detailsAdded = true;
            }
            else {
                  statusReport.detailsAdded = false;
                }
            responseParser(statusReport,200,res);
        }
        });
    }
    }
    else
    {
        responseParser("Id and role not provided",500,res);
    }
    }
    else {
        responseParser("Method Not allowed", 403, res);
      }
        
    } catch (error) {
        console.error(error);
        responseParser(error,500,res);
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

exports.addMobileNumber = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var id = body.id;
      var role = body.role;
      var mobile = body.mobile;
        if(id != undefined && id.length !=0)
        {
            if(role != null && role.length != 0)
            {
                if(mobile != undefined && mobile.length === 13)
                {
                    admin.database().ref('/access/'+role+'/'+id).child("mobileAdded").set(true);
                    admin.database().ref('/'+'userDetails/'+role+'/'+id).child("mobile").set(mobile);
                    responseParser("Mobile number added Successfully",200,res);
                }
                else {
                    responseParser("Mobile Number is invalid",400,res);
              }
            }
            else
            {
                responseParser("role is invalid",400,res);
            }
            
        }
        else 
        {
            responseParser("Id is invalid",400,res);
        }
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.grantAccess = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var email = body.email;
      var role = body.role;
            if(role != null && role.length != 0)
            {
                if(email != undefined)
                {
                    admin.auth().getUserByEmail(email)
                            .then((userRecord) => {
                                // See the UserRecord reference doc for the contents of userRecord.
                                console.log('Successfully fetched user data:', userRecord.toJSON());
                                admin.database().ref('/access/'+role+'/'+userRecord.uid).child("accessGranted").set(true);
                    responseParser("Access granted successfully",200,res);
                            })
                            .catch(function(error) {
                                console.log('Error fetching user data:', error);
                                responseParser("Error fetching user data",500,res);
                            });

                    
                }
                else {
                    responseParser("Email is invalid",400,res);
              }
            }
            else
            {
                responseParser("role is invalid",400,res);
            }
            
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.getUsersList = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var role = body.role;
            if(role != null && role.length != 0)
            {
                admin.database().ref('/'+'userDetails/'+role).once("value",(snapshot) => {
                    
                    if(!snapshot.exists())
                    {
                        responseParser("role not found",500,res);
                    }
                    else {
                        responseParser(snapshot.toJSON(),200,res);
                    }
                    
                })
            }
            else
            {
                responseParser("role is invalid",400,res);
            }
            
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});