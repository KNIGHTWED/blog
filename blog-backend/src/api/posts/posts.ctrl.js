import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; // Bad Request
    return;
  }

  try {
    const post = await Post.findById(id);
    // 포스트가 존재하지 않을 때
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const write = async (ctx) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required()
  });

  // const result = Joi.validate(ctx.request.body, schema);
  const validation = schema.validate(ctx.request.body);
  if (validation.error) {
    ctx.status = 400; // Bad Request
    ctx.body = validation.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const list = async ctx => {
// query는 문자열이기 때문에 숫자로 변환해 주어야 합니다.
// 값이 주어지지 않았다면 1을 기본으로 사용합니다.
  const page = parseInt(ctx.query.page || '1', 10);

  if(page < 1){
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;
  // tag, username 값이 유효한지 체크하고
  // 유효하면 객체에 넣는다.
  const query = {
    ...(username ? {'user.username': username} : {}),
    ...(tag ? {tags: tag} : {}),
  };

  try {
    const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(10)
    .skip((page - 1) * 10)
    .lean()
    .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10));
    ctx.body = posts.map(post => ({
      ...post,
      body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    }));
    // ctx.body = posts.map(post => post.toJSON()).map(post => ({
    //   ...post,
    //   body: post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    // }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const read = ctx => {
  ctx.body = ctx.state.post;
};

export const remove = async (ctx) => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const update = async (ctx) => {
  const { id } = ctx.params;
  // write에서 사용한 schema와 비슷한데, required()가 없습니다.
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  // const result = Joi.validate(ctx.request.body, schema);
  const validation = schema.validate(ctx.request.body);
  if(validation.error){
    ctx.status = 400;
    ctx.body = validation.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
      // false 일 때는 업데이트 되기 전의 데이터를 반환합니다.
    }).exec();
    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if(post.user._id.toString() !== user._id){
    ctx.status = 403;
    return;
  }
  return next();
}
