import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  username: string;
  password: string;
  displayName: string;
  role: "superadmin" | "admin" | "editor";
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never returned in queries by default
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "editor"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Strip password from JSON responses even if accidentally selected
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Hash password before save
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const AdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);
