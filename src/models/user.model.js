import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        refreshToken: {
            type: String,
        },
        googleId: {
            type: String,
            unique: true,
            default: null,
            sparse: true,
        },
        plan: {
            type: String,
            enum: ["free", "premium"],
            default: "free",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.createRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
        }
    );
};

const User = mongoose.model("User", userSchema);

export default User;
