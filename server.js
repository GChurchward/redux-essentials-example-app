import { rest, setupWorker } from 'msw'
import { factory, oneOf, manyOf, primaryKey } from '@mswjs/data'
import pkg from '@reduxjs/toolkit'
import faker from 'faker'
import seedrandom from 'seedrandom'
import { Server as MockSocketServer } from 'mock-socket'
import { setRandom } from 'txtgen'
import express from 'express'
import { parseISO } from 'date-fns'
import mongoose from 'mongoose';

export {}
const { nanoid } = pkg

const app = express()
const port = 3001

app.get('/hello-world-route-woot', (req, res) => {
  res.send('Hello World!')
})

const NUM_USERS = 3
const POSTS_PER_USER = 3
const RECENT_NOTIFICATIONS_DAYS = 7
mongoose.connect('mongodb://localhost/my_database',{auth: {
        username:'root',
        password:'rootpassword'
    },
    authSource:"admin",
    useUnifiedTopology: true,
    useNewUrlParser: true});
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
  userId: ObjectId,
  firstName: String,
    lastName: String,
    name: String,
    username: String,
    //posts: manyOf('post'),
});
const MyUserModel = mongoose.model('User', User);
 
const Post = new Schema({
   postId: ObjectId,
   title: String,
     date: String,
     content: String,
     //reactions: oneOf('reaction'),
     //comments: manyOf('comment'),
     //user: MyUserModel,
 })

 const MyPostModel = mongoose.model('Post', Post);

 const Comments = new Schema({
   commentId: ObjectId,
   date: String,
    text: String,
    //post: oneOf('post'),
 })

 const MyCommentModel = mongoose.model('Comments', Comments)

const Reaction = new Schema({
   reactionId: ObjectId,
   thumbsUp: Number,
    hooray: Number,
    heart: Number,
    rocket: Number,
    eyes: Number,
    //post: postId,
})

const MyReactionModel = mongoose.model('Reaction', Reaction)

// const db = factory({
//   user: {
//     id: primaryKey(nanoid),
//     firstName: String,
//     lastName: String,
//     name: String,
//     username: String,
//     posts: manyOf('post'),
//   },
//   post: {
//     id: primaryKey(nanoid),
//     title: String,
//     date: String,
//     content: String,
//     reactions: oneOf('reaction'),
//     comments: manyOf('comment'),
//     user: oneOf('user'),
//   },
//   comment: {
//     id: primaryKey(String),
//     date: String,
//     text: String,
//     post: oneOf('post'),
//   },
//   reaction: {
//     id: primaryKey(nanoid),
//     thumbsUp: Number,
//     hooray: Number,
//     heart: Number,
//     rocket: Number,
//     eyes: Number,
//     post: oneOf('post'),
//   },
// })
const createUserData = () => {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    username: faker.internet.userName(),
  }
}

const createPostData = (user) => {
  return {
    title: faker.lorem.words(),
    date: faker.date.recent(RECENT_NOTIFICATIONS_DAYS).toISOString(),
    user,
    content: faker.lorem.paragraphs(),
    //reactions: db.reaction.create(),
    reaction: MyReactionModel(),
  }
}

// Create an initial set of users and posts
for (let i = 0; i < NUM_USERS; i++) {
  // const author = db.user.create(createUserData())
  //const author = await MyUserModel.save();
  const user = new MyUserModel(createUserData())
  await user.save()
  for (let j = 0; j < POSTS_PER_USER; j++) {
    const newPost = createPostData(user)
    // db.post.create(newPost)
    new MyPostModel((newPost))
  }
}

//const serializePost = (post) => ({
 // ...post,
  //user: post.user.id,
//})
app.use(express.json())
export const handlers = [
  app.get('/realApi/posts', function (req, res) {
    //const posts = db.post.getAll().map(serializePost)
    const posts = MyPostModel //.map(serializePost)
    return res.json(posts)
  }),
  app.post('/realApi/posts', function (req, res) {
    const data = req.body
    // if (data.content === 'error') {
    //   return res.json('Server error saving this post!')
    // }

    data.date = new Date().toISOString()

    const user = db.user.findFirst({ where: { id: { equals: data.user } } })
    data.user = user
    data.reactions = db.reaction.create()

    const post = db.post.create(data)
    return res.json(serializePost(post))
  }),
  app.get('/realApi/posts/:postId', function (req, res) {
    const post = db.post.findFirst({
      where: { id: { equals: req.params.postId } },
    })
    return res.json(serializePost(post))
  }),
  app.patch('/realApi/posts/:postId', (req, res, ctx) => {
    const { id, ...data } = req.body
    const updatedPost = db.post.update({
      where: { id: { equals: req.params.postId } },
      data,
    })
    return res.json(serializePost(updatedPost))
  }),

  app.get('/realApi/posts/:postId/comments', (req, res, ctx) => {
    const post = db.post.findFirst({
      where: { id: { equals: req.params.postId } },
    })
    return res.json({ comments: post.comments })
  }),

  app.post('/realApi/posts/:postId/reactions', (req, res, ctx) => {
    const postId = req.params.postId
    const reaction = req.body.reaction
    const post = db.post.findFirst({
      where: { id: { equals: postId } },
    })

    const updatedPost = db.post.update({
      where: { id: { equals: postId } },
      data: {
        reactions: {
          ...post.reactions,
          [reaction]: (post.reactions[reaction] += 1),
        },
      },
    })

    return res.json(serializePost(updatedPost))
  }),
  app.get('/realApi/notifications', (req, res, ctx) => {
    const numNotifications = getRandomInt(1, 5)

    let notifications = generateRandomNotifications(
      undefined,
      numNotifications,
      db
    )

    return res.json(notifications)
  }),
  app.get('/realApi/users', (req, res, ctx) => {
    //return res.json(db.user.getAll())
    return res.json(MyUserModel())
  }),
]

app.listen(port, async () => {

  
  console.log(`Example app listening on port ${port}`)
})
