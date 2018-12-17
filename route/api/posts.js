const express = require('express');
const passport = require('passport');
const Post = require('../../models/Post');
const validatePostInput = require('../../validation/post');

const router = express.Router();

/**
 * @route   GET api/posts/test
 * @desc    Test posts route
 * @access  Public
 */
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

/**
 * @route   POST api/posts
 * @desc    Create post
 * @access  Private
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id,
    });

    newPost.save().then(post => res.json(post));
    return true;
  },
);

module.exports = router;
