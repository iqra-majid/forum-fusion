const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Thread = require("../models/Thread");
const fetchuser = require('../middleware/fetchuser');

// ROUTE : 1 Add thread : POST '/api/threads/addthread' login required

router.post(
  "/addthread",
  fetchuser,
  // [
  //   check("title").isLength({ min: 3 }).withMessage("Enter a valid title"),
  //   check("description")
  //     .isLength({ min: 5 })
  //     .withMessage("Description is 5 atleast characters long"),
  // ],
  async (req, res) => {
    try {
      // Using destructuring
      const { title, description } = req.body;
      //if there are errors return bad requests with error

      // const errors = validationResult(req);
      // if (!errors.isEmpty()) {
      //   return res.status(400).json({ errors: errors.array() });
      // }

      //new Note({ ... }) creates a new document in the notes collection(table)
      const newThread = new Thread({
        title,
        description,
        user: req.user.id,
      });
      const savedThread = await newThread.save();
      res.json(savedThread);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("some error occured");
    }
  }
);

// ROUTE 2 : delete a thread: DELETE '/api/threads/deletethread' . Login required

router.delete("/deletethread/:id",  async (req, res) => {
  try {
   // find the note to be deleted and delete it
   // here we get the id from get request
   // req.params.id is used to get the ID from the request URL
   let thread = await Thread.findById(req.params.id);
   if(!thread){return res.status(404).send("Not found")};
   // .toString function is used to convert db object in string
   //allow deleteion if only user owns this note   
   // This condition checks whether the 'user 'field of the thread (converted to a string) is not equal to the id of the currently logged-in user. 
   
  //  if(thread.user.toString() !== req.user.id){
  //        return res.status(401),send("not allowed");
  //  }

   thread = await Thread.findByIdAndDelete(req.params.id)
   res.json({success:"Note has been deleted"});
} catch (error) {
   console.log(error.message);
 res.status(500).send("some error occured")
}
});


// ROUTE 3 : add a new thread: PUT '/api/threads/updatethread' . Login required

router.put("/updatethread/:id", fetchuser, async (req, res) => {
  const { title, description} = req.body;
  try{
  //create a new thread object
  const newThread = {};  // Initialize an empty object

  if (title) {
    newThread.title = title;
  }
  if (description) {
    newThread.description = description;
  }
  

  // find the note to be updated and update it
  // here we get the id from get request
  // req.params.id is used to get the ID from the request URL
  let thread = await Thread.findById(req.params.id);
  if(!thread){return res.status(404).send("Not found")};
  // .toString function is used to convert db object in string
  if(thread.user.toString() !== req.user.id){
        return res.status(401),send("not allowed");
  }

  thread = await Thread.findByIdAndUpdate(req.params.id,{$set: newThread},{new:true})
  res.json({thread});
  }catch{
        console.log(error.message);
      res.status(500).send("some error occured");
  }

});


// ROUTE 4 : GET : Fetch all threads: GET '/api/threads/fetchallthreads' . No login required


router.get("/fetchallthreads",  async (req, res) => {
  try {
    // Fetch all threads without filtering by user ID
    const threads = await Thread.find();
    res.json(threads);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("some error occurred");
  }
});


module.exports = router;