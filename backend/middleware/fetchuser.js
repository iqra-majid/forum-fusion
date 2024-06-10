const jwt = require("jsonwebtoken");
require('dotenv').config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET;

const fetchuser = (req, res, next) => {
    // Get the user from jwt and add id to req object
    const token = req.header('authToken');
    if (!token) {
        return res.status(401).send({ error: 'Please authenticate using a valid token' });
    }

    try {
        // Verify the token and extract the payload
        const data = jwt.verify(token, JWT_SECRET);
        // console.log(data);

        // Attach the user data to the request object
        req.user = data.user;
        // console.log(req.user);

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate using a valid token' });
    }
};

module.exports = fetchuser;
