// db/setup.js

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'schucohub.sqlite');

// Se vuoi proprio ripulire tutto (ATTENZIONE: cancella i dati!)
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("Vecchio database cancellato!");
}

const db = new Database(DB_PATH);

// ---- TABELLE UTENTI ----
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  surname TEXT,
  email TEXT NOT NULL UNIQUE,
  password TEXT,
  phone TEXT,
  address TEXT,
  note TEXT,
  role TEXT,
  status TEXT,
  tags TEXT, -- JSON string array
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime'))
);
`);

// ---- TABELLE TEAM ----
db.exec(`
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS user_teams (
  user_id INTEGER,
  team_id INTEGER,
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
`);

// ---- RUOLI CLASSICI E RELAZIONE UTENTI-TEAM-RUOLI ----
db.exec(`
CREATE TABLE IF NOT EXISTS roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);
`);

['admin', 'supervisor', 'technician', 'Operator'].forEach(role => {
  const exists = db.prepare("SELECT id FROM roles WHERE name = ?").get(role);
  if (!exists) db.prepare("INSERT INTO roles (name) VALUES (?)").run(role);
});

db.exec(`
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  role_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, team_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
`);

// ---- TABELLE CLIENTI ----
db.exec(`
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surname TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  address TEXT,
  city TEXT,
  cap TEXT,
  province TEXT,
  note TEXT,
  main_contact TEXT,
  phone TEXT,
  mobile TEXT,
  emails TEXT, -- può contenere più email separate da virgola
  documents TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// ---- TABELLE PROGETTI ----
db.exec(`
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'da iniziare',
  priority TEXT,
  deadline TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS project_clients (
  project_id INTEGER,
  client_id INTEGER,
  PRIMARY KEY (project_id, client_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
`);

// ---- FILES E RELAZIONI ----
db.exec(`
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  uploader_id INTEGER,
  size INTEGER,
  mimetype TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS files_projects (
  file_id INTEGER,
  project_id INTEGER,
  PRIMARY KEY (file_id, project_id),
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS files_clients (
  file_id INTEGER,
  client_id INTEGER,
  PRIMARY KEY (file_id, client_id),
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS files_teams (
  file_id INTEGER,
  team_id INTEGER,
  PRIMARY KEY (file_id, team_id),
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
`);

// ---- TABELLE TAGS ----
db.exec(`
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS tags_files (
  tag_id INTEGER,
  file_id INTEGER,
  PRIMARY KEY (tag_id, file_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  FOREIGN KEY (file_id) REFERENCES files(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS tags_projects (
  tag_id INTEGER,
  project_id INTEGER,
  PRIMARY KEY (tag_id, project_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS tags_clients (
  tag_id INTEGER,
  client_id INTEGER,
  PRIMARY KEY (tag_id, client_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS tags_teams (
  tag_id INTEGER,
  team_id INTEGER,
  PRIMARY KEY (tag_id, team_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
`);

// ---- EVENTI ----
db.exec(`
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start TEXT,
  end TEXT,
  creator_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS events_users (
  event_id INTEGER,
  user_id INTEGER,
  PRIMARY KEY (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS events_teams (
  event_id INTEGER,
  team_id INTEGER,
  PRIMARY KEY (event_id, team_id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS events_files (
  event_id INTEGER,
  file_id INTEGER,
  PRIMARY KEY (event_id, file_id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (file_id) REFERENCES files(id)
);
`);
db.exec(`
CREATE TABLE IF NOT EXISTS tags_events (
  tag_id INTEGER,
  event_id INTEGER,
  PRIMARY KEY (tag_id, event_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
`);

// ---- ATTIVITA' (tasks) ----
db.exec(`
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  project_id INTEGER,
  assigned_to INTEGER,
  status TEXT DEFAULT 'da_iniziare',
  priority TEXT DEFAULT 'normale',
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now','localtime')),
  updated_at TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id),
  FOREIGN KEY(assigned_to) REFERENCES users(id)
);
`);

// ---- NOTIFICHE ----
db.exec(`
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  message TEXT NOT NULL,
  read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

console.log('Tutte le tabelle sono state create!');

db.close();
