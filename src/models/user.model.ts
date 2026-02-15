import mongoose,{Schema, Document} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document{
  name: string,
  email: string,
  password?: string,
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    name:{type:String, required:true},
    email:{type: String, required:true, unique:true, lowercase:true},
    password:{type: String, required:true, select:false}
  },
  {timestamps: true}
)

UserSchema.pre<IUser>("save", async function (){
  if(!this.isModified("password")){
    return;
  }

  try{
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt); 
  }catch(err){
    throw new Error("Failed to hash user password")
  } 
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
  ): Promise<boolean> {
    if (!this.password) {
      throw new Error("Password not loaded on user document");
    }

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};


export default mongoose.model<IUser>("User",UserSchema)
