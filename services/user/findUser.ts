import { UserModel } from "@/domain/model/userModel";
import { IUserRepository } from "@/infra/database/mongodb/repository/IUserRepository";

export class FindUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<UserModel | null> {
    return this.userRepository.findByEmail(email);
  }
}
