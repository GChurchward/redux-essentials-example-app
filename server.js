import { rest, setupWorker } from 'msw'
import { factory, oneOf, manyOf, primaryKey } from '@mswjs/data'
import { nanoid } from '@reduxjs/toolkit'
import faker from 'faker'
import seedrandom from 'seedrandom'
import { Server as MockSocketServer } from 'mock-socket'
import { setRandom } from 'txtgen'

import { parseISO } from 'date-fns'

const express = require('express')
const app = express()
const port = 3001

app.get('/hello-world-route-woot', (req, res) => {
  res.send('Hello World!')
})

const db = factory({
  user: {
    id: primaryKey(nanoid),
    firstName: String,
    lastName: String,
    name: String,
    username: String,
    posts: manyOf('post'),
  },
  post: {
    id: primaryKey(nanoid),
    title: String,
    date: String,
    content: String,
    reactions: oneOf('reaction'),
    comments: manyOf('comment'),
    user: oneOf('user'),
  },
  comment: {
    id: primaryKey(String),
    date: String,
    text: String,
    post: oneOf('post'),
  },
  reaction: {
    id: primaryKey(nanoid),
    thumbsUp: Number,
    hooray: Number,
    heart: Number,
    rocket: Number,
    eyes: Number,
    post: oneOf('post'),
  },
})

const fakePost1 = {
  id: 123,
  title: 'FIrst post title',
  date: new Date().toISOString(),
  content: 'Totally the content of a post :fire:',
  reactions: [],
  comments: [],
  user: null,
}
const fakeUser1 = {
  id: 123,
  firstName: 'totally a first name',
  lastName: 'totally a last name',
  name: 'Also a name1',
  username: 'wiskibois@gmail.com',
  posts: [fakePost1],
}
const fakeNotification1 = {
  id: 1,
  date: new Date().toISOString(),
  message: 'template',
  user: fakeUser1.id,
}
const usersInTheDatabase = [fakeUser1]
const postsInTheDatabase = [fakePost1]
const notificationsInTheDatabase = [fakeNotification1]

//get individual post ids
app.get('/realApi/posts/:postId', (req, res) => {
  const post = db.postsInTheDatabase.findFirst({
    where: { id: { equals: req.params.postId } },
  })
  console.log(postId)
  res.json(post)
})
//app.get('/realApi/posts/:postId/comments', )
app.get('/realApi/users', (req, res) => {
  res.json(usersInTheDatabase)
})
app.get('/realApi/posts/:postId/comments', (req, res) => {
  const post = db.postsInTheDatabase.findFirst({
    where: { id: { equals: req.params.postId } },
  })
  console.log(postId)
  res.json(post)
})
app.get('/realApi/posts', (req, res) => {
  res.json(postsInTheDatabase)
})
app.get('/realAPI/notification', (req, res) => {
  res.json(notificationsInTheDatabase)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
