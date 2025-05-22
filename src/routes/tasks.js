const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

router.get('/', async (req, res) => {
  const tasks = await Task.find().sort({ pinned: -1 });
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description || title.trim() === '' || description.trim() === '') {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  try {
    const task = new Task({ title, description });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Error saving task:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

module.exports = router;