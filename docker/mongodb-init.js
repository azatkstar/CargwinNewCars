// MongoDB initialization script for CargwinNewCar
// This script runs when MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'cargwin_production');

// Create application user
db.createUser({
  user: process.env.APP_DB_USERNAME || 'cargwin_app',
  pwd: process.env.APP_DB_PASSWORD || 'cargwin_password',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_INITDB_DATABASE || 'cargwin_production'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('lots');
db.createCollection('users');
db.createCollection('audit_logs');

// Create indexes for lots collection
db.lots.createIndex({ "slug": 1 }, { unique: true });
db.lots.createIndex({ "status": 1 });
db.lots.createIndex({ "make": 1 });
db.lots.createIndex({ "model": 1 });
db.lots.createIndex({ "year": 1 });
db.lots.createIndex({ "created_at": 1 });
db.lots.createIndex({ "publish_at": 1 });
db.lots.createIndex({ "make": 1, "model": 1, "year": 1 });

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "is_active": 1 });

// Create indexes for audit_logs collection
db.audit_logs.createIndex({ "user_email": 1 });
db.audit_logs.createIndex({ "resource_type": 1 });
db.audit_logs.createIndex({ "resource_id": 1 });
db.audit_logs.createIndex({ "timestamp": 1 });
db.audit_logs.createIndex({ "resource_type": 1, "resource_id": 1 });

// Create initial admin user (optional)
if (process.env.INITIAL_ADMIN_EMAIL) {
  db.users.insertOne({
    email: process.env.INITIAL_ADMIN_EMAIL,
    name: "Initial Admin",
    role: "admin",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  });
}

print("MongoDB initialization completed for CargwinNewCar");