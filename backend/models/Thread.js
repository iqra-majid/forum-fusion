const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
      },
    title : {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

// Create a User model using the schema
const Thread = mongoose.model('thread', userSchema);

module.exports = Thread;
