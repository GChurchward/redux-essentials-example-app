import React from 'react'
import { useSelector } from 'react-redux'

import { selectUserById } from '../users/usersSlice'

export const PostAuthor = ({ user }) => {
  return <span>by {user ? user.name : 'Unknown author'}</span>
}
