import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { UserModel, UserDocument } from './user.model';

interface UpsertCredentialsInput {
  password: string;
  username: string;
  email?: string;
}

class UserService {
  private normalize(value: string) {
    return value.trim().toLowerCase();
  }

  async findByIdentifier(identifier: string) {
    const normalized = this.normalize(identifier);
    return UserModel.findOne({
      $or: [{ email: normalized }, { username: normalized }]
    });
  }

  async hasAnyUser(): Promise<boolean> {
    const count = await UserModel.countDocuments();
    return count > 0;
  }

  async upsertAdminCredentials(input: UpsertCredentialsInput): Promise<UserDocument> {
    const username = this.normalize(input.username);
    const normalizedEmailInput = input.email ? this.normalize(input.email) : undefined;
    const fallbackEmail = this.normalize(env.ADMIN_EMAIL);
    const fallbackUsername = this.normalize(env.ADMIN_USERNAME);

    const identifiers = new Set<string>();
    identifiers.add(username);
    if (normalizedEmailInput) identifiers.add(normalizedEmailInput);
    identifiers.add(fallbackEmail);
    identifiers.add(fallbackUsername);

    const conditions: Array<Record<string, string>> = [];
    identifiers.forEach(value => {
      conditions.push({ email: value });
      conditions.push({ username: value });
    });

    const existing = await UserModel.findOne({ $or: conditions });

    const email = normalizedEmailInput ?? existing?.email ?? fallbackEmail;
    const passwordHash = await bcrypt.hash(input.password.trim(), 10);

    const filter = existing ? { _id: existing._id } : { $or: [{ email }, { username }] };

    const user = await UserModel.findOneAndUpdate(
      filter,
      { email, username, passwordHash },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return user;
  }
}

export const userService = new UserService();
