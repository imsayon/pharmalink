import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.render('login', { pageTitle: 'Login - PharmaLink' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    return res.redirect('/dashboard');
  }
  req.flash('error', 'Invalid credentials');
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  res.redirect('/');
});

export default router;
