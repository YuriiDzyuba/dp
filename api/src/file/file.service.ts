import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { createUniqueString } from '../utils/createUniqueString';
import { S3 } from 'aws-sdk';
import { ImageType } from './types/image.type';
import * as sharp from 'sharp';
import * as path from 'path';
import {
  AWS_S3_ACCESS_KEY,
  AWS_S3_NAME,
  AWS_S3_REGION,
  AWS_S3_SECRET_KEY,
} from '../config';

@Injectable()
export class FileService {
  async prepareImage(image: ImageType, imageFilter = ''): Promise<ImageType> {
    if (!image) {
      throw new HttpException(
        'image should not be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (image.size > 310000) {
      throw new HttpException(
        'image size must be less than 3MB',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (image.mimetype !== 'image/jpeg' && image.mimetype !== 'image/png') {
      throw new HttpException(
        'image extension must be only .jpeg or .png',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    switch (imageFilter) {
      case 'sepia':
        return this._sepiaImage(image);
      case 'pink':
        return this._pinkImage(image);
      case 'black':
        return this._blackImage(image);
      case 'multi':
        return this._multiImage(image);
      default:
        return this._resizeImage(image);
    }
  }

  async uploadNewImageToAWSs3(
    file: ImageType,
    imageCategory: string,
  ): Promise<any> {
    const { originalname, mimetype } = file;

    const s3 = this._getS3();
    const linkToImage = this._pathBuilder(
      originalname,
      'leverx',
      imageCategory,
    );

    const params = {
      Bucket: AWS_S3_NAME,
      Key: linkToImage,
      Body: file.buffer,
      ContentType: mimetype,
    };

    return s3
      .upload(params)
      .promise()
      .catch((err) => {
        throw new HttpException(
          `${err.message} can't upload image`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      })
      .then((data) => data);
  }

  async _resizeImage(image: ImageType): Promise<ImageType> {
    image.buffer = await sharp(image.buffer)
      .resize(333, 333)
      .sharpen()
      .toBuffer();
    return image;
  }

  async _sepiaImage(image: ImageType): Promise<ImageType> {
    image.buffer = await sharp(image.buffer)
      .resize(333, 333)
      .composite([
        {
          input: path.join(__dirname + '/../../static/photoFilters/sepia.png'),
          gravity: 'southeast',
          blend: 'multiply',
        },
      ])
      .sharpen()
      .toBuffer();
    return image;
  }

  async _pinkImage(image: ImageType): Promise<ImageType> {
    image.buffer = await sharp(image.buffer)
      .resize(333, 333)
      .composite([
        {
          input: path.join(__dirname + '/../../static/photoFilters/pink.png'),
          gravity: 'southeast',
          blend: 'multiply',
        },
      ])
      .sharpen()
      .toBuffer();
    return image;
  }

  async _blackImage(image: ImageType): Promise<ImageType> {
    image.buffer = await sharp(image.buffer)
      .resize(333, 333)
      .grayscale()
      .sharpen()
      .toBuffer();
    return image;
  }

  async _multiImage(image: ImageType): Promise<ImageType> {
    image.buffer = await sharp(image.buffer)
      .resize(333, 333)
      .composite([
        {
          input: path.join(__dirname + '/../../static/photoFilters/multi.png'),
          gravity: 'southeast',
          blend: 'multiply',
        },
      ])
      .sharpen()
      .toBuffer();
    return image;
  }

  _getS3() {
    return new S3({
      region: AWS_S3_REGION,
      accessKeyId: AWS_S3_ACCESS_KEY,
      secretAccessKey: AWS_S3_SECRET_KEY,
    });
  }

  _pathBuilder(fileName, folderName, category) {
    return `${folderName}/${category}/${this.getUniqueFileName(fileName)}`;
  }

  getUniqueFileName(originalName: string): string {
    const fileNameArr = originalName.split('.');
    const fileExtension = fileNameArr.pop();
    const fileName = fileNameArr[0];

    return (
      slugify(fileName + '-' + createUniqueString(), {
        lower: true,
        remove: /[*+~.()'"!:@]/g,
      }) +
      '.' +
      fileExtension
    );
  }
}
