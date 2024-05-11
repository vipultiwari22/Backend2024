// require('dotenv').config({ path: './env' })
import dotenv from 'dotenv'
import connectDB from './db/databse.js'
import { app } from './app.js'
dotenv.config({ path: './env' })


connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running at Port :${process.env.PORT}`);
        })
    }).catch((err) => {
        console.log(err);
    })


















/*
const app = express()
    (async () => {
        try {
            await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
            app.on('error', () => {
                console.log("Error", error);
                throw error
            })

            app.listen(process.env.PORT, () => {
                console.log(`app is listing on ${process.env.PORT}`);
            })



        } catch (error) {
            console.log(error);
        }
//     })()
*/