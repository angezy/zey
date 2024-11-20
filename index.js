const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
require('dotenv').config();
const connectToDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const protectedRoute = require('./routes/protected');
const bodyParser = require('body-parser');
const authMiddleware = require('./middleware/authMiddleware'); 

const app = express();
const port = process.env.PORT || 3000; 


 

// Middleware to parse JSON requests
app.use(express.json());

// Set up Handlebars
app.engine('handlebars', engine({ 
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'),
   layoutsDir: path.join(__dirname , 'views/layouts'),  
}));
app.set('view engine', 'handlebars');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'protected_views/pages')]);

// Mount protected routes
const protectedRoutes = require('./routes/protected');
app.use('/protected', protectedRoutes);


// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/auth', authRoutes);
app.use('/api', protectedRoute);

// Handle routes
app.get('/', (req, res) => {
  res.render('index', { title: `Nick's Web Project page` });
});
app.get('/fa', (req, res) => {
  res.render('fa' , { title: 'پروژه‌های وب نیک',  layout: "_fa" });
});
// Handle blogs routes (e.g., about page)
app.get('/Blogs', (req, res) => {
  res.render('Blogs', { title: Blogs  });
});
app.get('/blogsfa', (req, res) => {
  res.render('blogsfa', { title:` بلاگ ها `,  layout: "_fa" });
});
app.get('/signin', (req, res) => {
    const error = req.query.error;
    res.render('signin', { title: 'Sign In', layout: false, error });
});
app.get('/Contactus', (req, res) => {
  res.render('Contactus', { title: `Contact Us` });
});
app.get('/signup', (req, res) => {
  res.render('signup', {title: `signup` , layout: false });
});
app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { title:` dashboard `, layout: "__dashboard"});
});
app.get('/profile', authMiddleware, (req, res) => {
  res.render('profile', { title:` profile `, layout: "__dashboard"});
});
app.get('/tables', authMiddleware, (req, res) => {
  res.render('dashTable', { title:` Tables `, layout: "__dashboard"});
});
app.get('/virtual-reality', authMiddleware, (req, res) => {
  res.render('vreality', { title:` Virtual Reality `, layout: false});
});
app.get('/billing', authMiddleware, (req, res) => {
  res.render('billing', { title:` billing `, layout: "__dashboard"});
});
app.get('/rtl', authMiddleware, (req, res) => {
  res.render('rtl', { title:`داشبرد ستاره`,  layout: "__rtl" });
});
app.get('/billingfa', authMiddleware, (req, res) => {
  res.render('billingfa', { title:`صورتحساب`,  layout: "__rtl" });
});
app.get('/profilefa', authMiddleware, (req, res) => {
  res.render('profilefa', { title:`اطلاعات شخصی`,  layout: "__rtl" });
});
app.get('/tablesfa', authMiddleware, (req, res) => {
  res.render('dashTablefa', { title:`جدول ها`,  layout: "__rtl" });
});
app.get('/load-form', (req, res) => {
  res.render('partials/__fullform', { layout: false});
});






// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});



// Start the application
async function startServer() {
    try {
        await connectToDatabase(); // Connect to the database

    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1); // Exit the process if database connection fails
    }
}




app.listen(port, () => {
console.log(`Server is running on http://localhost:${port}`);
});

