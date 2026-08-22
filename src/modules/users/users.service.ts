import { User } from '@prisma/client';

import { usersRepository } from './users.repository';
import { UpdateProfileInput } from './users.schema';

import { tokenStore } from '@/modules/auth/token.store';
import { ConflictError, NotFoundError } from '@/utils/errors';

type PublicUser = Omit<User, 'passwordHash'>;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export const usersService = {
  async getProfile(userId: string): Promise<PublicUser> {
    const user = await usersRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    return toPublicUser(user);
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicUser> {
    const user = await usersRepository.updateProfile(userId, input);
    return toPublicUser(user);
  },

  async deleteAccount(userId: string): Promise<void> {
    await usersRepository.deleteById(userId);
    await tokenStore.revokeAllRefreshSessions(userId);
  },

  async listSavedDestinations(userId: string) {
    const saved = await usersRepository.listSavedDestinations(userId);
    return saved.map((s) => s.city);
  },

  async saveDestination(userId: string, cityId: string) {
    const city = await usersRepository.cityExists(cityId);
    if (!city) throw new NotFoundError('City');

    const existing = await usersRepository.findSavedDestination(userId, cityId);
    if (existing) throw new ConflictError('City is already saved');

    const saved = await usersRepository.addSavedDestination(userId, cityId);
    return saved.city;
  },

  async removeSavedDestination(userId: string, cityId: string): Promise<void> {
    const existing = await usersRepository.findSavedDestination(userId, cityId);
    if (!existing) throw new NotFoundError('Saved destination');
    await usersRepository.removeSavedDestination(userId, cityId);
  },
};
