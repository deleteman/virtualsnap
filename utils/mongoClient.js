const MongoClient = require('mongodb').MongoClient;

// Connection URI
const uri = "mongodb+srv://productai:J2fTLeMkPdk6XmSI@cluster0.kp8xhdr.mongodb.net/?retryWrites=true&w=majority"



// Create a new MongoClient
let client;
let conn;

export async function getInstance() {
    if(!conn) {
        console.log("Instantiating new mongoclient instance...")
        client = new MongoClient(uri, { useNewUrlParser: true });
        try {
            conn = await client.connect()
            console.log("Conection")
            console.log(conn)
        } catch (connErr) {
            console.log("== Error connecting to db")
            console.error(connErr)
            return false
        }
    } else {
        console.log("Reusing mongo instance...")
    }
    return conn;
}

