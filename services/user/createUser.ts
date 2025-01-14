import { UserModel } from "@/domain/model/userModel";
import { IUserRepository } from "@/infra/database/mongodb/repository/IUserRepository";

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string, name?: string): Promise<void> {
    const user = new UserModel(email, undefined, false, name);
    await this.userRepository.create(user);
  }
}