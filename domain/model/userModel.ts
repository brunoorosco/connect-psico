import { ObjectId } from "mongodb";

export enum UserRole {
  DEFAULT = "DEFAULT",
  ADMIN = "ADMIN",
  SUPERVISOR = "SUPERVISOR",
  STUDENT = "STUDENT",
}

export class UserModel {
  private _id?: ObjectId;
  private _name?: string;
  private _email: string;
  private _role: UserRole;
  private _isTwoFactorAuthEnabled: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    email: string,
    role: UserRole = UserRole.DEFAULT,
    isTwoFactorAuthEnabled = false,
    name?: string
  ) {
    this._email = email;
    this._role = role;
    this._isTwoFactorAuthEnabled = isTwoFactorAuthEnabled;
    this._name = name;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Getters
  get id(): ObjectId | undefined {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get role(): UserRole {
    return this._role;
  }

  // Methods
  updateName(name: string) {
    this._name = name;
    this._updatedAt = new Date();
  }

  enableTwoFactorAuth() {
    this._isTwoFactorAuthEnabled = true;
    this._updatedAt = new Date();
  }
}
