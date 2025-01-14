import { UserModel } from "@/domain/model/userModel";
import { IUserRepository } from "./IUserRepository";
import { Collection } from "mongodb";

export class UserModelMongo {
    constructor(private readonly collection: Collection<UserModel>) {}
  
    async insert(user: UserModel): Promise<void> {
      await this.collection.insertOne(user as any);
    }
  
    async findOneByEmail(email: string): Promise<UserModel | null> {
      const result = await this.collection.findOne({ _email: email });
      if (result) {
        const { _id, ...userModel } = result;
        return userModel as UserModel;
      }
      return null;
    }
  }

export class MongoUserRepository implements IUserRepository {
  constructor(private readonly userModel: UserModelMongo) {}

  async create(user: UserModel): Promise<void> {
    await this.userModel.insert(user);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await this.userModel.findOneByEmail(email);
  }
}
