import { Request } from "express"

export interface AuthType extends Request {
  userId: number
}