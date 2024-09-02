var express = require('express');
var router = express.Router();
var userSchema = require('../models/userSchema');
var passport = require('passport');
var strategy = require('passport-local');
const { isLoggedIn } = require('../utils/auth.middile');

passport.use(new strategy(userSchema.authenticate()));

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/signup', (req, res) => {
  res.render('signup');
});
router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    await userSchema.register({ username, email }, password);
    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { user: req.user });
});

router.post(
  '/signin',
  passport.authenticate('local', {
    successRedirect: '/users/profile',
    failureRedirect: '/',
  }),
  async (req, res) => {}
);

router.get('/updateuser', isLoggedIn, async (req, res) => {
  res.render('updateuser', { user: req.user });
});
router.get('/deleteuser', isLoggedIn, async (req, res) => {
  await userSchema.findByIdAndDelete(req.user._id);
  res.redirect('/');
});
router.get('/passwordChange', isLoggedIn, async (req, res) => {
  res.render('passwordChange');
});
router.post('/passwordChange', isLoggedIn, async (req, res) => {
  try {
    await req.user.changePassword(req.body.oldpassword, req.body.newpassword);
    req.user.save();
    res.redirect('/users/profile');
  } catch (error) {
    console.log(error.message);
  }
});

router.post('/updateuser', isLoggedIn, async (req, res, next) => {
  try {
    await userSchema.findByIdAndUpdate(req.user._id, req.body);
    res.redirect('/users/profile');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
