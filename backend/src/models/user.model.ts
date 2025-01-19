import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";

export interface UserInput {
  email: string;
  name: string;
  password: string;
}

export interface UserDocument extends mongoose.Document, UserInput {
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
  savedAuctions: string[];
  watchList: string[];
  isAdmin: Boolean;
  avatar?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    verified: {type: Boolean, required: true, default: false},
    savedAuctions: [{ type: String, ref: "Auction", required: false }],
      watchList: [{ type: String, ref: "Auction", required: false }],
    isAdmin: {type: Boolean, required: true, default: false},
    avatar: {type: String, required: false},
  },
  {
    timestamps: true,
  }
);

//elimina il record se dopo 3 ore non è stato verificato, altrimenti tienilo
userSchema.index({createdAt: 1}, {expireAfterSeconds: 3 * 60 * 60, partialFilterExpression: {verified: false}})

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
  const hash = await bcrypt.hash(user.password, salt);

  user.password = hash;

  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidatePassword, user.password).catch((e) => false);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
