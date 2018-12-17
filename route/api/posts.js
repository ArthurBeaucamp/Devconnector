const express = require('express');
const passport = require('passport');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validation/post');

const router = express.Router();

/**
 * @route   GET api/posts/test
 * @desc    Test posts route
 * @access  Public
 */
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

/**
 * @route   GET api/posts
 * @desc    GET post
 * @access  Public
 */
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(() => res.status(404).json(
      { nopostsfound: 'No posts found' },
    ));
});

/**
 * @route   GET api/posts/:id
 * @desc    GET post by id
 * @access  Public
 */
router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(() => res.status(404).json(
      { nopostsfound: 'No post found with that ID' },
    ));
});

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

/**
 * @route   DELETE api/posts/:id
 * @desc    Delete post
 * @access  Private
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(() => {
        Post.findById(req.params.id)
          .then((post) => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res.status(401).json(
                { notauthorized: 'User not authorized' },
              );
            }

            // Delete
            post.remove().then(() => res.json({ success: true }));
            return true;
          })
          .catch(() => res.status(404).json({ postnotfound: 'No post found' }));
      });
  },
);

module.exports = router;
