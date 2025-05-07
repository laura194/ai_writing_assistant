import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://root:example@localhost:27017', {
      authSource: 'admin',
    });
    console.log('MongoDB verbunden');
  } catch (error) {
    console.error('MongoDB Fehler:', error);
  }
};

export default connectDB;