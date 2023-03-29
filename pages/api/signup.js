import {getInstance} from '../../utils/mongoClient'
import bcrypt from 'bcrypt';

/*
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    
    const client = await getInstance()
    
    const { email, password, betaKey } = req.body;
    const db = client.db(process.env.MONGO_DB_NAME)
    
    // validate beta key
    const betaKeys = db.collection('beta-keys');
    
    console.log("Searchin for beta key: ", betaKey)
    const key = await betaKeys.findOne(
        { key: betaKey, used: false }
        );
        console.log(key)
        if (!key) {
            console.log("Invalid beta key used: ", betaKey)
            return res.status(400).json({ message: 'Invalid or used beta key' });
        }
        
        // create user account
        const users = db.collection('users');
        
        const existingUser = await users.findOne({email: email})
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashPwd = await bcrypt.hash(password, 10);
        const user = { email, hashPwd, betaKey: key.key };
        try {
            const result = await users.insertOne(user);
            key.used = true
            await betaKeys.updateOne({_id: key._id}, {
                $set: {
                    used: true        
                }
            })
            
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: 'Error creating the user', error: err });
        }
        return res.status(201).json({ message: 'User account created' });
    }
    */
    
    export default async function handler(req, res) {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }
        
        const client = await getInstance()
        
        const { email, password, betaKey } = req.body;
        const db = client.db(process.env.MONGO_DB_NAME)
        
        // validate beta key
        const betaKeys = db.collection('beta-keys');
        
        console.log("Searchin for beta key: ", betaKey)
        
        // create user account
        const users = db.collection('users');
        
        const existingUser = await users.findOne({email: email})
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashPwd = await bcrypt.hash(password, 10);
        const user = { email, hashPwd};
        try {
            const result = await users.insertOne(user);
            console.log(result)
        } catch (err) {
            console.error(err)
            return res.status(500).json({ message: 'Error creating the user', error: err });
        }
        return res.status(201).json({ message: 'User account created' });
    }
    