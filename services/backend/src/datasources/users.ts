import { DataSource } from 'apollo-datasource'
import { getUserCollection, init } from '@src/services/mongoDB.service'
import { User, CeateUserInput } from '@src/generated/graphql';

export class Users extends DataSource {
  async initialize() {
    await init()
  }

  async getUserById(userId: string): Promise<User>  {
    const result = (
      await getUserCollection()
      .aggregate<User>([
        {
          $match: { userId },
        },
      ]))

      const user = (await result.toArray()).pop()

      return {
        ...user,
      }
  }

  async createUser(userInput: CeateUserInput) {
    if (!userInput.userId) {
      throw new Error('Missing userId');
    }

    try {
      await getUserCollection().insertOne(userInput);
      return userInput;
    } catch (error) {
      if (error.code && error.code === 11000) {
        throw new Error('Duplicate user');
      }
      throw error;
    }
  }
  
}