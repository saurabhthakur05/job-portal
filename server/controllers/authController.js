import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { sendTokenResponse } from '../utils/generateToken.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { AppError } from '../middleware/errorHandler.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return next(new AppError('Email already registered', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'recruiter' ? 'recruiter' : 'jobseeker',
    });

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(user, verificationToken);

    sendTokenResponse(user, 201, res);
  }  catch (error) {
  console.error("REGISTER ERROR:", error);
  next(error);
}
};

export const login = async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Account has been blocked', 403));
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({ success: true, requires2FA: true });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });
      if (!verified) {
        return next(new AppError('Invalid 2FA code', 401));
      }
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('company savedJobs');
  res.json({
    success: true,
    user: {
      ...user.toObject(),
      profileCompletion: user.getProfileCompletion(),
    },
  });
};

export const verifyEmail = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: true, message: 'If email exists, reset link sent' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    await sendPasswordResetEmail(user, resetToken);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const setup2FA = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `JobPortal (${req.user.email})`,
    });

    req.user.twoFactorSecret = secret.base32;
    await req.user.save({ validateBeforeSave: false });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const enable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: req.body.code,
      window: 1,
    });

    if (!verified) {
      return next(new AppError('Invalid verification code', 400));
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
};

export const disable2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');
    if (!(await user.matchPassword(req.body.password))) {
      return next(new AppError('Invalid password', 401));
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res) => {
  sendTokenResponse(req.user, 200, res);
};

export const logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};
