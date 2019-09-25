module.exports = {
    host: 'localhost',
    port: '27017',
    user: 'admin',
    password: 'hyzRoot71808',
    database: 'app'
};

//db.auth( <username>, <password> )
// db.createUser(
//     {
//         user: "admin",
//         pwd: "hyzRoot71808",
//         roles: [ { role: "readWrite", db: "app" } ]
//     }
// )
// grantRolesToUser (
//     "admin" ,
//     [
//       {  role : "root" , db : "app"  }
//     ]
// )
// db.auth("root", "hyzRoot71808" )
