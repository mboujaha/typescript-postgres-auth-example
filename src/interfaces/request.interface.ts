import { Request } from "express";
import { User } from "../services/user/user.entity";
import URLParams from "./urlparams.interface";

export default interface RequestWithUser extends Request {
  user: User;
  startTime?: number;
  userAgent?: {[key: string]: any};
  searchParams?: URLParams; // TODO: perhaps change to Dto and add validation
}
