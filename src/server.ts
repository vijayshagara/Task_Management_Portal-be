import app from './app';
import sequelize from './config/database';

const PORT = process.env.PORT || 5000;

async function initialize() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync all models
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

initialize();