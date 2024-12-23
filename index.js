
import express from "express";
import boostrap from "./src/index.Router.js";
// import { Server } from "socket.io";
const app = express();
const port = 5000;
boostrap(app,express);


app.listen(port,()=>{
    console.log(`Server is listening on port..........${process.env.port}`);
});

// const io = new Server(server,{
//     cors:'*'
// });
// io.on('connection',socket =>{
//     console.log(socket);
//     socket.on('sayHi',data=>{
//         console.log(data);
        
//     })

//     io.emit('sayHiBack','Hello Alllllll');

// }
// );