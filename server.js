import { rest, setupWorker } from "msw";
import { factory, oneOf, manyOf, primaryKey } from "@mswjs/data";
import pkg from "@reduxjs/toolkit";
import faker from "faker";
import seedrandom from "seedrandom";
import { Server as MockSocketServer } from "mock-socket";
import { setRandom } from "txtgen";
import express from "express";
import { parseISO } from "date-fns";
import mongoose from "mongoose";
const { nanoid } = pkg;

const app = express();
const port = 3001;

app.get("/hello-world-route-woot", (req, res) => {
  res.send("Hello World!");
});

const NUM_USERS = 3;
const POSTS_PER_USER = 3;
const RECENT_NOTIFICATIONS_DAYS = 7;
mongoose.connect(
  "mongodb://localhost/my_database",
  {
    auth: {
      username: "root",
      password: "rootpassword",
    },
    authSource: "admin",
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
  firstName: String,
  lastName: String,
  name: String,
  username: String,
});

const Post = new Schema({
  title: String,
  date: Date,
  content: String,
  authorId: ObjectId,
});

const Comments = new Schema({
  date: Date,
  text: String,
});

const Reaction = new Schema({
  thumbsUp: Number,
  hooray: Number,
  heart: Number,
  rocket: Number,
  eyes: Number,
});

const MyUserModel = mongoose.model("User", User);
const MyPostModel = mongoose.model("Post", Post);
const MyCommentModel = mongoose.model("Comments", Comments);
const MyReactionModel = mongoose.model("Reaction", Reaction);


const createUserData = () => {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();

  return {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    username: faker.internet.userName(),
  };
};

const createPostData = (user) => {
  return {
    title: faker.lorem.words(),
    date: faker.date.recent(RECENT_NOTIFICATIONS_DAYS).toISOString(),
    userId: user._id,
    authorId: user._id,
    content: faker.lorem.paragraphs(),
  };
};

// Create an initial set of users and posts
for (let i = 0; i < NUM_USERS; i++) {
  const user = new MyUserModel(createUserData());
  await user.save();
  for (let j = 0; j < POSTS_PER_USER; j++) {
    const almostNewPost = createPostData(user);
    const newPost = new MyPostModel(almostNewPost);
    await newPost.save();
  }
}

app.use(express.json());
export const handlers = [
  app.get("/realApi/posts", async function (req, res) {
    /*
     * 1. Get posts
     * 2. get the author id for each post
     * 3. get the uathor for each post
     * 4. attach the author to each post
     * 5. send the posts with authors attached to the web client.
     */
    const posts = await MyPostModel.find().lean();
    const postsWithAuthors = await Promise.all(
      posts.map(async (p) => {
        const author = await MyUserModel.findOne({ _id: p.authorId }).lean();
        return { ...p, author, reactions: [] };
      })
    );
    return res.json(postsWithAuthors);
  }),
  app.post("/realApi/posts", async function (req, res) {
    /**
     * 1. Save post to datyabase
     * 1. return new post to web client
    */
    const almostMyNewPost = new MyPostModel({
      date: new Date(),
      content: req.body.content,
      title: req.body.title,
      authorId: req.body.user
    })
    const myNewPost = await almostMyNewPost.save()
    return res.json(myNewPost);
  }),
  app.get("/realApi/posts/:postId", function (req, res) {
    /*
     * 1. Find the post in the db
     * 1. Find the author in the db
     * 1. attach the autho to the post
     * 1. send post to the web client
    */
    return res.json(post);
  }),
  app.patch("/realApi/posts/:postId", (req, res, ctx) => {
    /**
     * 1. Find the post in the db
     * 1. Update the post
     * 1. Save the post to the db
     * 1. Return the updated post - with attached author - to the web client
     */
    return res.json(updatedPost);
  }),

  app.get("/realApi/posts/:postId/comments", (req, res, ctx) => {
    /**
    * 1. Find the post in the db
    * 1. Find all comments for the post
    * 1. Return the comments
    */
    return res.json({ comments: post.comments });
  }),

  app.post("/realApi/posts/:postId/reactions", (req, res, ctx) => {
    /**
    * 1. Find the post in the db
    * 1. Find all reactions for the post
    * 1. Return the reactions
    */
  }),
  app.get("/realApi/notifications", (req, res, ctx) => {

    /**
    * 1. Find notifications
    * 1. Return the notifications
    */
    return res.json([{ poo: 1 }]);
  }),
  app.get("/realApi/users", async (req, res, ctx) => {
    /**
    * 1. Find users
    * 1. return users
    */
    const userResponse = await MyUserModel.find();
    return res.json(userResponse);
  }),
];

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});
