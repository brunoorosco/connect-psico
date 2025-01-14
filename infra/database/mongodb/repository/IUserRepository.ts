import { UserModel } from "@/domain/model/userModel";

export interface IUserRepository {
  create(user: UserModel): Promise<void>;
  findByEmail(email: string): Promise<UserModel | null>;
}
