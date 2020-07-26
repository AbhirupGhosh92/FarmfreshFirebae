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
      var id = body.areaId;

        admin.database().ref('/area/'+id).once("value",(snapshot) => {
           
            if(snapshot.exists())
            {
                responseParser("Area Id already exists",200,res);
            }
            else
            {
               
                admin.database().ref('/area/'+id).set({	"areaId" :body.areaId,
                "deliveryCharge":body.deliveryCharge,"minimumBill":body.minimumBill,"name":body.name
                }).then(() => {
                responseParser("Area added Successfully",200,res);
              });
                
            }
        });
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
    
    
});

exports.editArea = functions.https.onRequest((req, res) => {
    
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {
      var body = req.body;
      var id = body.areaId;
        admin.database().ref('/area/'+id).set({	"areaId" :body.areaId,
        "deliveryCharge":body.deliveryCharge,"minimumBill":body.minimumBill,"name":body.name
        }).then(() => {
        responseParser("Area edited Successfully",200,res);
        });
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
                        responseParser("role not found",400,res);
                    }
                    else {
                        
                        var userList = snapshot.toJSON();
                        
                        var users = [];

                        for(let [key,it] of Object.entries(userList))
                        {
                            if (it.hasOwnProperty("email") && it.hasOwnProperty("mobile") && it.hasOwnProperty("name") && it.hasOwnProperty("address")) {           
                                var element = {};
                                element.uid = key;
                                element.name = it.name;
                                element.email = it.email;
                                element.mobile = it.mobile;
                                users.push(element);
                            }
                            
                        }

                        responseParser(users,200,res);
                    }
                    
                });
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

function processAddressForDefault(role,body,callback)
{
    if(body.address.primary == true)
    {
        var add = {};
        admin.database().ref('/'+'userDetails/'+role + '/'+body.uid + '/address').once("value",(snapshot) => {
            for(let [key,value] of Object.entries(snapshot.toJSON()))
            {
                value.primary = false;
                add[key] = value;
            };
            admin.database().ref('/userDetails/'+role+'/'+body.uid).child("address").set(add);
            admin.database().ref('/userDetails/'+role+'/'+body.uid).child("address").push(body.address);
        });
    }
    else
    {
        admin.database().ref('/userDetails/'+role+'/'+body.uid).child("address").push(body.address);
    }

    callback();
}

function processAddressForDefaultUpdate(role,body,addressId,callback)
{
    if(body.address.primary == true)
    {
        var add = {};
        admin.database().ref('/'+'userDetails/'+role + '/'+body.uid + '/address').once("value",(snapshot) => {
            for(let [key,value] of Object.entries(snapshot.toJSON()))
            {
                value.primary = false;
                add[key] = value;
            };
            admin.database().ref('/userDetails/'+role+'/'+body.uid).child("address").set(add);
            admin.database().ref('/userDetails/'+role+'/'+body.uid+'/address/'+addressId).child('primary').set(true);
        });
    }

    callback();
}

exports.addUserDetails = functions.https.onRequest((req, res) => {
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

                admin.database().ref('/'+'userDetails/'+role + '/'+body.uid).once("value",(snapshot) => {
                    
                    if(!snapshot.child("address").exists())
                    {
                        admin.database().ref('/userDetails/'+role+'/'+body.uid).child("name").set(body.name);
                        admin.database().ref('/userDetails/'+role+'/'+body.uid).child("email").set(body.email);
                        admin.database().ref('/userDetails/'+role+'/'+body.uid).child("address").push(body.address);
                        admin.database().ref("/access/"+role+"/"+body.uid).child("detailsAdded").set(true);
                        responseParser("Details Saved",200,res);
                      
                    }
                    else {

                        processAddressForDefault(role, body);
                        responseParser("Details Saved",200,res);
                    }
                    
                });

                responseParser("Details Saved",200,res);
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

exports.editUserDetails = functions.https.onRequest((req, res) => {
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
                admin.database().ref('/'+'userDetails/'+role + '/'+body.uid).once("value",(snapshot) => {
                    
                    if (snapshot.exists())
                    {
                        if(body.email != undefined && body.email.length > 0)
                        {
                          admin.database().ref('/'+'userDetails/'+role + '/'+body.uid).child('email').set(body.email);
                        } 
                        if(body.name != undefined && body.name.length > 0)
                        {
                          admin.database().ref('/'+'userDetails/'+role + '/'+body.uid).child('name').set(body.name);
                        }
                        if(body.mobile != undefined && body.mobile.length > 0)
                        {
                          admin.database().ref('/'+'userDetails/'+role + '/'+body.uid).child('mobile').set(body.mobile);
                        }

                        responseParser("Details updated",200,res);
                    }
                    else
                    {
                        responseParser("User Not found",400,res);
                    }
                });
                
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

exports.editAddress = functions.https.onRequest((req, res) => {
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

                processAddressForDefaultUpdate(role, body,body.addressId,() => {

                      admin.database().ref('/'+'userDetails/'+role + '/'+body.uid + '/address/'+body.addressId).once("value",(snapshot) => {
                    
                    if (snapshot.exists())
                    {

                        if(body.address.city != undefined && body.address.city.length > 0)
                        {
                          admin.database().ref('/'+'userDetails/'+role + '/'+body.uid +'/address/'+body.addressId).child('city').set(body.address.city);
                        } 
                        if(body.address.country != undefined && body.address.country.length > 0)
                        {
                            admin.database().ref('/'+'userDetails/'+role + '/'+body.uid +'/address/'+body.addressId).child('country').set(body.address.country);
                        }
                        if(body.address.locality != undefined && body.address.locality.length > 0)
                        {
                            admin.database().ref('/'+'userDetails/'+role + '/'+body.uid +'/address/'+body.addressId).child('locality').set(body.address.locality);
                        }

                        if(body.address.pincode != undefined && body.address.pincode.length > 0)
                        {
                            admin.database().ref('/'+'userDetails/'+role + '/'+body.uid +'/address/'+body.addressId).child('pincode').set(body.address.pincode);
                        }

                        if(body.address.state != undefined && body.address.state.length > 0)
                        {
                            admin.database().ref('/'+'userDetails/'+role + '/'+body.uid +'/address/'+body.addressId).child('state').set(body.address.state);
                        }

                        if(body.address.street != undefined && body.address.street.length > 0)
                        {
                            admin.database().ref('/'+'userDetails/'+role + '/'+body.uid +'/address/'+body.addressId).child('street').set(body.address.street);
                        }



                        responseParser("Details updated",200,res);
                    }
                    else
                    {
                        responseParser("Address Id doesnot exist",400,res);
                    }
                });


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

exports.getAddressList = functions.https.onRequest((req, res) => {
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
                admin.database().ref('/'+'userDetails/'+role + '/'+body.uid+'/address').once("value",(snapshot) => {
                    
                    if (snapshot.exists())
                    {
        
                        responseParser(snapshot.toJSON(),200,res);
                    }
                    else
                    {
                        responseParser("Address not found",400,res);
                    }
                });
                
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

exports.deleteAddress = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var role = body.role;
      var addressId = body.addressId;
            if(role != null && role.length != 0)
            {
                var ref = admin.database().ref('/'+'userDetails/'+role + '/'+body.uid+'/address/'+addressId);
                ref.once("value",(snapshot) => {
                    
                    if (snapshot.exists())
                    {
                        if(snapshot.toJSON().primary == true)
                        {
                            responseParser("Cannot delete primary address",200,res);
                        }
                        else {
                            
                            ref.remove();
                            responseParser("Address deleted",200,res);

                        }
                    }
                    else
                    {
                        responseParser("Address not found",400,res);
                    }
                });
                
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

exports.createDeliveryBoy = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var uid = body.uid;
      var deliveryBoyId = body.deliveryBoyId;

      admin.database().ref('/'+'userDetails/delivery/'+deliveryBoyId).once("value",(snapshot) => {
                    
        if(!snapshot.exists())
        {
            responseParser("delivery boy not found",400,res);
        }
        else {
            var json = snapshot.toJSON();
            if (json.hasOwnProperty("email") && json.hasOwnProperty("mobile") && json.hasOwnProperty("name") && json.hasOwnProperty("address")) {           
                admin.database().ref('/'+'userDetails/manager/'+uid).child('deliveryBoy').child(deliveryBoyId).set({
                    "active" : true,
                    "status" : "IDLE"
                });
                responseParser('Delivery boy created',200,res);
            }
            else
            {
                responseParser("delivery boy found but not registered",400,res);
            }
            
        }
        
    });
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.deleteDeliveryBoy = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var uid = body.uid;
      var deliveryBoyId = body.deliveryBoyId;
      ref = admin.database().ref('/'+'userDetails/manager/'+uid+'/deliveryBoy/'+deliveryBoyId);
      
      ref.once("value",(snapshot) => {
                    
        if(!snapshot.exists())
        {
            responseParser("delivery boy not found",400,res);
        }
        else {
            ref.remove();
            responseParser("Delivery boy removed",200,res);
        }
        
    });
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.deleteArea = functions.https.onRequest((req, res) => {
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var areaId = body.areaId;

     admin.database().ref('/'+'area/'+areaId).remove().then(() => {
        responseParser("Area removed successfully",200,res);
     });

    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.addCoupon = functions.https.onRequest((req, res) => {
    
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var id = body.code;

      admin.database().ref('/coupon/'+id).once("value",(snapshot) => {
            if(snapshot.exists())
            {
                responseParser("Coupon ID already exists",200,res);
            }
            else {
                admin.database().ref('/coupon/'+id).set({	"code" :body.code,
                "amount":body.amount,"desc":body.desc
                }).then(() => {
                responseParser("Coupon added Successfully",200,res);
              })
            }
      });

    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.deleteCoupon = functions.https.onRequest((req, res) => {
    
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var id = body.code;


      admin.database().ref('/coupon/'+id).remove().then(() => {
        responseParser("Coupon removed successfully",200,res);
      })

    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});

exports.editCoupon = functions.https.onRequest((req, res) => {
    
    try{
    if(req.method === 'GET')
    {
        responseParser("Method Not allowed", 403, res);
    }
    else {

      var body = req.body;
      var id = body.code;
      admin.database().ref('/coupon/'+id).set({	"code" :body.code,
        "amount":body.amount,"desc":body.desc
        }).then(() => {
        responseParser("Coupon edited Successfully",200,res);
      })
    }
}
catch (error) {
    responseParser(error,500,res);
    console.error(error);
    }
});