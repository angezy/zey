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
const blogsRoutes = require('./routes/blogsRoutes');
const contactusRoute = require('./routes/contactus-route'); // New route for contact form
const kanbanRoutes = require('./routes/kanban');
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
  layoutsDir: path.join(__dirname, 'views/layouts'),
}));
app.set('view engine', 'handlebars');
app.set('views', [path.join(__dirname, 'views'),
  path.join(__dirname, 'views/forms'),
  path.join(__dirname, 'views/dashboard')]);

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/auth', authRoutes);
app.use('/api', cbform);
app.use('/api', fastSell);
app.use('/api', kanbanRoutes);
app.use('/api', listing);
app.use('/api', contactusRoute);
app.use('/api', blogsRoutes);

// Register a custom helper to format the date
Handlebars.registerHelper('formatDate', function (date) {
  const formattedDate = new Date(date).toString().split(' GMT')[0];
  return formattedDate;
});
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});
Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

const fetchBlogPost = async (postId) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .input('PostId', sql.Int, postId)
      .query('SELECT Title, Imag, Contents, Description FROM dbo.BlogPosts_tbl WHERE postId = @PostId');
    return result.recordset[0];
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
};
async function fetchBlogPosts() {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
    .query('SELECT postId, Title, Description, Imag, Contents, CreatedAt FROM dbo.BlogPosts_tbl');
    return result.recordset;
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    throw new Error('Error fetching blog posts');
  }
}

// Terms of Service/Privacy Policy 
app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy', { title: `Nick House Buyer Privacy Policy ` });
});
app.get('/terms-of-service', (req, res) => {
  res.render('terms-of-service', { title: `Nick House Buyer Terms Of Service` });
});

// Forms routes
app.get('/Cash-Buyer', (req, res) => {
  res.render('cashbuyers', { title: ` Nick's Cash Buyers Form `, layout: false });
});
app.get('/fastSell', (req, res) => {
  res.render('fastSell', { title: ` Fast Sell House `, layout: false });
});
app.get('/listing', (req, res) => {
  res.render('listing', { title: ` Fast Sell Property `, layout: false });
});

// public routes
app.get('/', async (req, res) => {
  try {
    const blogPosts = await fetchBlogPosts();
    const recentPosts = blogPosts.slice(0, 4);
    res.render('index', { title: `Nick House Buyer`, blogs: recentPosts })
} catch (err) {
    res.status(500).send(err.message);
}
});
app.get('/faq', (req, res) => {
  res.render('faq', { title: `Frequently Asked Questions ` });
});
app.get('/Blogs', async (req, res) => {
  try {
    const blogPosts = await fetchBlogPosts();
    res.render('blogs', { layout: 'main', title: 'All Blog Posts', blogs: blogPosts });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.get('/blog/:id', async (req, res) => {
  const postId = req.params.id;
  try {
      const post = await fetchBlogPost(postId);
      if (!post) {
          return res.status(404).send('Blog post not found');
      }
      res.render('blog', { layout: false , title: post.Title, postt: post });
    } catch (err) {
      res.status(500).send('Error retrieving blog post');
  }
});
app.get('/signin', (req, res) => {
  const error = req.query.error;
  res.render('signin', { title: 'Sign In', layout: false, error });
});
app.get('/Contactus', (req, res) => {
  res.render('Contactus', { title: `Contact Us` });
});

// dashboard routes
app.get('/dashboard', authMiddleware, (req, res) => {
  res.render('dashboard', { title: ` dashboard `, layout: "__dashboard" });
});
app.get('/dashboard/profile', authMiddleware, (req, res) => {
  res.render('profile', { title: ` profile `, layout: "__dashboard" });
});
app.get('/dashboard/tables', authMiddleware, (req, res) => {
  res.render('dashTable', { title: ` Tables `, layout: "__dashboard" });
});
app.get('/dashboard/virtual-reality', authMiddleware, (req, res) => {
  res.render('vreality', { title: ` Virtual Reality `, layout: false });
});
app.get('/dashboard/billing', authMiddleware, (req, res) => {
  res.render('billing', { title: ` billing `, layout: "__dashboard" });
});
app.get('/dashboard/cashBuyers', authMiddleware, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .query('SELECT * FROM dbo.cashbuyers_tbl');
    const cashbuyers = result.recordset;
    res.render('cashCard', { title: 'CashBuyers', layout: "__dashboard", cashbuyer: cashbuyers });
  } catch (err) {
    console.error('Error fetching CashBuyers:', err);
    res.status(500).send('Error fetching CashBuyers');
  }
});
app.get('/dashboard/fastSeller', authMiddleware, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .query('SELECT * FROM dbo.fastsell_tbl');
    const fastSellers = result.recordset;
    res.render('fastSeller', { title: 'fastSeller', layout: "__dashboard", fastSeller: fastSellers });
  } catch (err) {
    console.error('Error fetching fastSeller:', err);
    res.status(500).send('Error fetching fastSeller');
  }
});
app.get('/dashboard/lister', authMiddleware, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
      .query('SELECT * FROM dbo.listings_tbl');
    const listers = result.recordset;
    res.render('lister', { title: 'lister', layout: "__dashboard", listings: listers });
  } catch (err) {
    console.error('Error fetching lister:', err);
    res.status(500).send('Error fetching lister');
  }
});
app.get('/dashboard/blogEditor', authMiddleware, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request()
    .query('SELECT postId, Title, Description, Imag, Contents, CreatedAt FROM dbo.BlogPosts_tbl');
    const blogPosts = result.recordset;
    res.render('blogEditor', { layout: '__dashboard', title: ' Blog Editor', blogs: blogPosts });
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).send('Error fetching blog posts');
  }
});
app.get('/dashboard/kanban', authMiddleware, async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM dbo.kanban_tbl');
    const kanban = result.recordset;
    res.render('kanban', { title: 'Kanban Feature', layout: '__dashboard' , kanban: kanban});
} catch (err) {
    console.error('Error fetching entries:', err);
    res.status(500).send('Error fetching entries');
}
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
