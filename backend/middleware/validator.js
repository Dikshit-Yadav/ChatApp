import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map((err) => ({
        field: err.type === "field" ? err.path : err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

export const registerValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validate,
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

export const sendOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  validate,
];

export const verifyOtpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be between 4 and 6 characters"),
  validate,
];

export const resetPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  body("otp").trim().notEmpty().withMessage("OTP is required"),
  validate,
];

export const sendMessageValidation = [
  param("conversationId")
    .isMongoId()
    .withMessage("Invalid conversation ID format"),
  body("text").trim().notEmpty().withMessage("Message text is required"),
  validate,
];

export const reactionValidation = [
  param("id").isMongoId().withMessage("Invalid message ID format"),
  body("emoji").trim().notEmpty().withMessage("Emoji reaction is required"),
  validate,
];

export const deleteMessageValidation = [
  param("id").isMongoId().withMessage("Invalid message ID format"),
  validate,
];

export const createGroupValidation = [
  body("groupName")
    .trim()
    .notEmpty()
    .withMessage("Group name is required")
    .isLength({ min: 2 })
    .withMessage("Group name must be at least 2 characters"),
  body("members")
    .isArray({ min: 1 })
    .withMessage("Group must have at least one member"),
  validate,
];

export const renameGroupValidation = [
  param("conversationId")
    .isMongoId()
    .withMessage("Invalid conversation ID format"),
  body("groupName")
    .trim()
    .notEmpty()
    .withMessage("New group name is required"),
  validate,
];

export const addMemberValidation = [
  body("groupId").isMongoId().withMessage("Invalid group ID format"),
  body("newMemberId").isMongoId().withMessage("Invalid new member ID format"),
  validate,
];

export const removeMemberValidation = [
  body("groupId").isMongoId().withMessage("Invalid group ID format"),
  body("memberId").isMongoId().withMessage("Invalid member ID format"),
  validate,
];

export const conversationIdParamValidation = [
  param("conversationId")
    .isMongoId()
    .withMessage("Invalid conversation ID format"),
  validate,
];

export const inviteValidation = [
  body("receiverId").isMongoId().withMessage("Invalid receiver ID format"),
  validate,
];

export const respondInviteValidation = [
  body("invitationId").isMongoId().withMessage("Invalid invitation ID format"),
  body("status")
    .isIn(["accepted", "rejected"])
    .withMessage("Status must be either 'accepted' or 'rejected'"),
  validate,
];

export const updateProfileValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("phone")
    .optional()
    .trim()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  validate,
];
