import mongoose, { Schema, Document } from "mongoose"

export enum TaskStatus{
  PENDING = "pending",
  COMPLETED = "completed",
}

export interface ITask extends Document {
  title: string,
  description?: string;
  status: TaskStatus,
  dueDate?: Date;
  owner: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TaskSchema: Schema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String},
    status:{
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING
    },
    dueDate: {type: Date},
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {timestamps: true}
)

TaskSchema.index({status: 1})

export default mongoose.model<ITask>("Task", TaskSchema)