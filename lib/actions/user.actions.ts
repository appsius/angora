'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === '/profile/edit') {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`User cannot be created/updated: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId });
    // .populate({
    //   path: 'communities',
    //   model: 'Community',
    // });
  } catch (error: any) {
    throw new Error(`Unable to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  connectToDB();

  // TODO: Populate community
  // Find all threads authored by the user
  const threads = await User.findOne({ id: userId }).populate({
    path: 'threads',
    model: 'Thread',
    populate: {
      path: 'children',
      model: 'Thread',
      populate: {
        path: 'author',
        model: 'User',
        select: 'id name image',
      },
    },
  });

  return threads;
  try {
  } catch (error: any) {
    throw new Error(`Error fetching user posts: ${error.message}`);
  }
}
