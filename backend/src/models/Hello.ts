import mongoose, { Schema, Document } from 'mongoose';

export interface IHello extends Document {
  name: string;
  type: string;
}

const helloSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }
});

export default mongoose.model<IHello>('Plant', helloSchema);
