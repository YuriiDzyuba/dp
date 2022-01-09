import { HttpStatus } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { CommentEntity } from '../entities/comment.entity';

export const addNewComment = {
  apiOperation: {
    summary: 'add New Comment',
  },
  apiResponse: {
    status: 201,
    description: 'add new comment to chosen in query post',
    type: CommentEntity,
  },
};

export const editComment = {
  apiOperation: {
    summary: 'edit coment',
  },
  apiResponse: {
    status: 200,
    description: 'edit existing comment ',
    type: CommentEntity,
  },
};

export const deleteComment = {
  apiOperation: {
    summary: 'delete comment by id',
  },
  apiResponse: {
    status: 206,
    description: 'only owner can delete comment',
  },
};

export const findAllUserComments = {
  apiOperation: {
    summary: 'get all current user comments',
  },
  apiResponse: {
    status: 206,
    description: "array off user's comments",
  },
};
