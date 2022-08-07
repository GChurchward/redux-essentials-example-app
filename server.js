const express = require('express')
const app = express()
const port = 3001

app.get('/hello-world-route-woot', (req, res) => {
  res.send('Hello World!')
})


const fakePost1={
    id: 123,
    title: "FIrst post title",
    date: new Date().toISOString(),
    content: "Totally the content of a post :fire:",
    reactions: [],
    comments: [],
    user: null,
}
const fakeUser1 = {
  id: 123,
  firstName: "totally a first name",
  lastName: "totally a last name",
  name: "Also a name1",
  username: "wiskibois@gmail.com",
  posts: [fakePost1],
}
const usersInTheDatabase = [fakeUser1]
const postsInTheDatabase = [fakePost1]
app.get('/realApi/users', (req, res) => {
  res.json(usersInTheDatabase)
})
app.get('/realApi/posts', (req, res) => {
  res.json(postsInTheDatabase)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})