const express= require("express");
const mongoose= require("mongoose");
const cors = require('cors');
require('dotenv').config();

const app=express();
app.use(express.json());
app.use(cors({origin:"*"}));

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

app.use('/api/users',require('./routes/userRoutes'));
// port
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
