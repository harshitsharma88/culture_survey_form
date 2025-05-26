require("dotenv").config();
const app = require("./src/app");
const {getConnection} = require("./src/config/dbConnection");

const PORT = process.env.PORT || 5000;

getConnection()
.then(()=>{
    app.listen(PORT, ()=>{
    console.log(`Server Running on ${PORT}`);
})
});
