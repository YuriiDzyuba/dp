import { HttpStatus } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { PostEntity } from '../entities/post.entity';

export const createPost = {
  apiOperation: {
    summary: 'create new post',
  },
  apiResponse: {
    status: 201,
    type: PostEntity,
  },
};

export const editPostById = {
  apiOperation: {
    summary: 'update post',
  },
  apiResponse: {
    status: 200,
    type: PostEntity,
  },
};

export const getUserNewsPage = {
  apiOperation: {
    summary: 'get all own and following user posts',
  },
  apiResponse: {
    status: 200,
  },
};

export const findOnePostsById = {
  apiOperation: {
    summary: 'find one post by id',
  },
  apiResponse: {
    status: 200,
    type: PostEntity,
  },
};

export const findManyPostsByTag = {
  apiOperation: {
    summary: 'find many posts by tag',
  },
  apiResponse: {
    status: 200,
  },
};

export const deletePost = {
  apiOperation: {
    summary: 'like post',
  },
  apiResponse: {
    status: 200,
  },
};

export const likePost = {
  apiOperation: {
    summary: 'find all posts by tag',
  },
  apiResponse: {
    status: 200,
  },
};

export const disLikePost = {
  apiOperation: {
    summary: 'find all posts by tag',
  },
  apiResponse: {
    status: 200,
  },
};
