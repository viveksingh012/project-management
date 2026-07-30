import { body } from "express-validator";
export const userRegisterValidator = ()=>{
  return [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required"),
    body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required")
  ]
}