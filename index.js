const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
require('dotenv').config();
const connectToDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware'); 
const cbform = require('./routes/cashbuyer-route');
const fastSell = require('./routes/fastSell');
const listing = require('./routes/listing');
const contactusRoute = require('./routes/contactus-route'); // New route for contact form
const sql = require('mssql');
const dbConfig = require("./config/db");
const Handlebars = require('handlebars');

const app = express();
const port = process.env.PORT; 

// Middleware to handle cookies
app.use(cookieParser());

// Middleware to parse JSON and URL-encoded requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to parse JSON requests
app.use(express.json());

// Set up Handlebars
app.engine('handlebars', engine({ 
  defaultLayout: 'main',
  partialsDir: path.join(__dirname, 'views/partials'),
   layoutsDir: path.join(__dirname , 'views/layouts'),  
}));
app.set('view engine', 'handlebars');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/forms'), path.join(__dirname, 'protected_views/pages')]);

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/auth', authRoutes);
app.use('/api', cbform);
app.use('/api', fastSell);
app.use('/api', listing);
app.use('/api', contactusRoute); // Use the new contactus route

// Terms of Service/Privacy Policy 
app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { title: `Nick House Buyer Privacy Policy ` });
});
app.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', { title: `Nick House Buyer Terms Of Service` });
});

// public routes
app.get('/', (req, res) => {
  res.render('index', { title: `Nick House Buyer` });
});

app.get('/faq', (req, res) => {
  res.render('faq', { title: `Frequently Asked Questions ` });
});

// Handle blogs routes (e.g., about page)
app.get('/Blogs', (req, res) => {
  res.render('Blogs', { title:' Blogs'  });
});

app.get('/Blogs2', (req, res) => {
  res.render('Blogs2', { title:' Blogs2'  });
});

app.get('/Blog', (req, res) => {
  res.render('Blog', { title:' Blog' , layout:false });
});

app.get('/signin', (req, res) => {
    const error = req.query.error;
    res.render('signin', { title: 'Sign In', layout: false, error });
});


app.get('/Contactus', (req, res) => {
  res.render('Contactus', { title: `Contact Us` });
});
app.get('/sgin', (req, res) => {
  res.render('sgin', {title: `signup` , layout: false });
});

// dashboard routes
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

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

app.get('/cashBuyers', authMiddleware, async (req, res)=>{
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .query('SELECT * FROM dbo.cashbuyers_tbl');
    const cashbuyers = result.recordset;
    res.render('cashCard', {title: 'CashBuyers', layout: "__dashboard", cashbuyer: cashbuyers});
  } catch (err) {
    console.error('Error fetching CashBuyers:', err);
    res.status(500).send('Error fetching CashBuyers');
}
});

app.get('/fastSeller', authMiddleware, async (req, res)=>{
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .query('SELECT * FROM dbo.fastsell_tbl');
    const fastSellers = result.recordset;
    res.render('fastSeller', {title: 'fastSeller', layout: "__dashboard", fastSeller: fastSellers});
  } catch (err) {
    console.error('Error fetching fastSeller:', err);
    res.status(500).send('Error fetching fastSeller');
}
});
app.get('/lister', authMiddleware, async (req, res)=>{
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
        .query('SELECT * FROM dbo.listings_tbl');
    const listers = result.recordset;
    res.render('lister', {title: 'lister', layout: "__dashboard", lister: listers});
  } catch (err) {
    console.error('Error fetching lister:', err);
    res.status(500).send('Error fetching lister');
}
});

// Forms routes
app.get('/Nick-Cash-Buyer', (req, res) => {
  res.render('cashbuyers', { title:` Nick's Cash Buyers Form `, layout: false});
});
app.get('/fastSell', (req, res) => {
  res.render('fastSell', { title:` Fast Sell House `, layout: false});
});
app.get('/listing', (req, res) => {
  res.render('listing', { title:` Fast Sell Property `, layout: false});
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
