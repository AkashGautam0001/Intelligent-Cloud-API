import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AdminUser } from "../models/AdminUser";
import { AppError } from "../middleware/error";
import { requireAuth, signToken } from "../middleware/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const user = await AdminUser.findOne({ email: body.email.toLowerCase() });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken({
      sub: String(user._id),
      email: user.email,
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await AdminUser.findById(req.admin!.sub).select("-passwordHash");
    if (!user) {
      throw new AppError("User not found", 404);
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

authRouter.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const body = changePasswordSchema.parse(req.body);
    const user = await AdminUser.findById(req.admin!.sub);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) {
      throw new AppError("Current password is incorrect", 400);
    }

    if (body.currentPassword === body.newPassword) {
      throw new AppError("New password must be different", 400);
    }

    user.passwordHash = await bcrypt.hash(body.newPassword, 10);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
