'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';
import { FilterQuery, SortOrder } from 'mongoose';

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

export async function fetchUsers({
  userId,
  searchStr = '',
  pageNum = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  userId: string;
  searchStr?: string;
  pageNum?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNum - 1) * pageSize;
    const regex = new RegExp(searchStr, 'i');
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchStr.trim() !== '') {
      query.$or = [
        { name: { $regex: regex } },
        { username: { $regex: regex } },
      ];
    }

    const sortOpts = { createdAt: sortBy };
    const usersQuery = User.find(query)
      .sort(sortOpts)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUserAmount = await User.countDocuments(query);
    const users = await usersQuery.exec();
    const isNext = totalUserAmount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
}
