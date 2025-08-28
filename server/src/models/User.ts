import mongoose, { Document, Schema, Types } from "mongoose";
import crypto from "crypto";

export enum Role {
  Admin = "admin",
  Member = "member",
}

export interface IUser extends Document {
  avatar: string;
  firstName: string;
  lastName: string;
  bio: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  salt: string;
  onboard: boolean;
  verified: boolean;
  account: Types.ObjectId;
  role: Role;
  status: {
    status: boolean;
    lastLoginAt?: Date;
    lastLogoutAt?: Date;
  };
  lastSeen: Date;
  starredChats: Types.ObjectId[];
  comparePassword(password: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
    avatar: {
      type: String,
      default: function (this: IUser) {
        return 'https://avatar.iran.liara.run/public/boy';
      },
    },
    firstName: { type: String },
    lastName: { type: String, default: "" },
    bio: { type: String, default: "" },
    username: {
      type: String,
      get(this: IUser): string {
        return (this.firstName + this.email.slice(0, 5)).trim();
      },
    },
    fullName: {
      type: String,
      get(this: IUser): string {
        return `${this.firstName} ${this.lastName}`.trim();
      },
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    salt: { type: String, required: true, select: false }, // Store salt
    onboard: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    account: {
      type: Schema.Types.ObjectId,
      ref: "Account",
    },
    role: { type: String, enum: Object.values(Role), default: Role.Member },
    status: {
      status: Boolean,
      lastLoginAt: Date,
      lastLogoutAt: Date,
    },
    lastSeen: Date,
    starredChats: [{
      type: Schema.Types.ObjectId,
      ref: 'Chat'
    }]
  },
  { timestamps: true }
);

// method to hash password
export async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 32, "sha512")
    .toString("hex");
  return { hash, salt };
}

// Instance method to compare password
userSchema.methods.comparePassword = function (password: string): boolean {
  const hashedPassword = crypto
    .pbkdf2Sync(password, this.salt, 10000, 32, "sha512")
    .toString("hex");
  return hashedPassword === this.password;
};

export const UserModel =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
