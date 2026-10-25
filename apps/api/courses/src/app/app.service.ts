import { Inject, Injectable } from '@nestjs/common';
import {REDIS_CLIENT} from "@lms/redis"
import Redis from 'ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { Courses, CoursesDocument } from './schema/course.schema';
import { Model } from 'mongoose';
import { MediaClient } from '@lms/medias';

@Injectable()
export class AppService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis:Redis,
    @InjectModel(Courses.name) private readonly coursesmodel:Model<CoursesDocument>,
    private readonly media:MediaClient
  ){}
 
}
