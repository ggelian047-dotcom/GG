import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('jobs.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    salary INTEGER NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    rating INTEGER NOT NULL,
    comment TEXT,
    author TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs (id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/jobs', (req, res) => {
    const sort = req.query.sort === 'desc' ? 'DESC' : 'ASC';
    const jobs = db.prepare(`SELECT * FROM jobs ORDER BY salary ${sort}`).all();
    
    // Attach average rating to each job
    const jobsWithRatings = jobs.map((job: any) => {
      const rating = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE job_id = ?').get(job.id) as any;
      return { ...job, rating: rating?.avg || 0 };
    });
    
    res.json(jobsWithRatings);
  });

  app.post('/api/jobs', (req, res) => {
    const { title, company, description, salary, location } = req.body;
    const info = db.prepare('INSERT INTO jobs (title, company, description, salary, location) VALUES (?, ?, ?, ?, ?)')
      .run(title, company, description, salary, location);
    res.json({ id: info.lastInsertRowid });
  });

  app.get('/api/jobs/:id/reviews', (req, res) => {
    const reviews = db.prepare('SELECT * FROM reviews WHERE job_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(reviews);
  });

  app.post('/api/jobs/:id/reviews', (req, res) => {
    const { rating, comment, author } = req.body;
    db.prepare('INSERT INTO reviews (job_id, rating, comment, author) VALUES (?, ?, ?, ?)')
      .run(req.params.id, rating, comment, author);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
