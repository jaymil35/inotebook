const express = require('express');
const router = express.Router()
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Route 1: Get all the notes
router.get('/fetchallnotes', fetchuser, async (req, res)=> {
    
   try{
    const notes = await Note.find({user: req.user.id});
    res.json(notes)
   } catch(error){
    console.log(error.message);
    res.status(500).send("Internal server Error");
}
})

// Route 2: Add a new notes
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3}),
    body('description','Description must be atleat 5 characters').isLength({ min: 5}),
], async (req, res)=> {

    try{
    const {title, description, tag} = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const note = new Note({
       title, description, tag, user: req.user.id
    })
    const saveNote = await note.save()
    res.json(saveNote)

} catch(error){
    console.log(error.message);
    res.status(500).send("Internal server Error");
}

})


// Route 3: update an existing notes
router.put('/updatenote/:id', fetchuser, async (req, res)=> {
  const {title, description, tag} = req.body;

  try{
  // create a newnote object
  const newNote = {};
  if(title){newNote.title = title};
  if(description){newNote.description = description};
  if(tag){newNote.tag = tag};

  // find the note to be updated and update it
  let note = await Note.findById(req.params.id);
  if(!note){return res.status(404).send("Not Found")};

  if(note.user.toString() !== req.user.id){
    return res.status(401).send("Not Allowed");
  }

  note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
  res.json({note});
} catch(error){
    console.log(error.message);
    res.status(500).send("Internal server Error");
}

})


// Route 4: delete an existing notes
router.delete('/deletenote/:id', fetchuser, async (req, res)=> {
    
  try{
  
    // find the note to be updated and update it
    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not Found")};
  
    // allow deletion only if user owns this note
    if(note.user.toString() !== req.user.id){
      return res.status(401).send("Not Allowed");
    }
  
    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"Success": "Note has been deleted", note: note});
} catch(error){
    console.log(error.message);
    res.status(500).send("Internal server Error");
}
  
})

module.exports = router

