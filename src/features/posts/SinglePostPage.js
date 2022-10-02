import React from 'react'
import { useSelector } from 'react-redux'

import { Link } from 'react-router-dom'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'
import { selectPostById } from './postsSlice'

export const SinglePostPage = ({ match }) => {
  const { postId } = match.params

  const post = useSelector((state) => selectPostById(state, postId))

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <PostAuthor user={post.user} />
        </div>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        {/* 
          - STEFFAN/GLEN - This is where we want to DO SOMETHING that fires a network call to the route.
          - Look at the "Create post" machinery for inspiration
        */}
        <Link to={`/editPost/${post._id}`} className="button">
          Edit Post
        </Link>
      </article>
    </section>
  )
}
