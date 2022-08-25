import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc
} from 'firebase/firestore'
import {
  ChartBarIcon,
  ChatIcon,
  DotsHorizontalIcon,
  HeartIcon,
  ShareIcon,
  SwitchHorizontalIcon,
  TrashIcon
} from '@heroicons/react/outline'
import {
  HeartIcon as HeartIconFilled,
  ChatIcon as ChatIconFilled
} from '@heroicons/react/solid'
import { useRecoilState } from 'recoil'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { modalState, postIdState } from '../atoms/modalAtom'
import Moment from 'react-moment'
import { db } from '../firebase'
import React from 'react'
import { useRouter } from 'next/router'

function Post({ id, post, postPage }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useRecoilState(modalState)
  const [postId, setPostId] = useRecoilState(postIdState)
  const [comments, setComments] = useState([])
  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const router = useRouter()

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, 'posts', id, 'comments'),
          orderBy('timestamp', 'desc')
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, id]
  )

  useEffect(
    () =>
      onSnapshot(collection(db, 'posts', id, 'likes'), (snapshot) =>
        setLikes(snapshot.docs)
      ),
    [db, id]
  )

  useEffect(
    () =>
      setLiked(
        likes.findIndex((like) => like.id === session?.user?.uid) !== -1
      ),
    [likes]
  )

  const likePost = async () => {
    if (liked) {
      await deleteDoc(doc(db, 'posts', id, 'likes', session.user.uid))
    } else {
      await setDoc(doc(db, 'posts', id, 'likes', session.user.uid), {
        username: session.user.name
      })
    }
  }

  useEffect(
    () =>
      onSnapshot(
        query(
          collection(db, 'posts', id, 'comments'),
          orderBy('timestamp', 'desc')
        ),
        (snapshot) => setComments(snapshot.docs)
      ),
    [db, id]
  )

  return (
    <div
      className='flex items-center p-3 border-b border-gray-700 cursor-pointer'
      onClick={() => router.push(`/${id}`)} //push to a page called /id
    >
      {!postPage && (
        <img
          src={post?.userImg}
          alt=''
          height='50px'
          width='50px'
          className='mr-2 rounded-full'
        />
      )}{' '}
      {/* If it's not a postpage then it'll be justify-between, if its a postpage then we want an image  */}
      <div className='flex flex-col w-full space-y-2'>
        <div className={`flex ${!postPage && 'justify-between'}`}>
          {postPage && (
            <img
              src={post?.userImg}
              alt='Profile Pic'
              height='60px'
              width='60px'
              className='mr-4 rounded-full'
            />
          )}{' '}
          {/*  Image will render only if there is a PostPage */}
          <div className='text-[#6e767d]'>
            <div className='inline-block group'>
              <h4
                className={`font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline ${
                  !postPage && 'inline-block'
                }`}
              >
                {post?.username}
              </h4>
              <span
                className={`text-sm sm:text-[15px] ${!postPage && 'ml-1.5'}`}
              >
                @{post?.tag}
              </span>
            </div>{' '}
            ·{' '}
            <span className='hover:underline text-sm sm:text-[15px]'>
              <Moment fromNow>{post?.timestamp?.toDate()}</Moment>
            </span>
            {!postPage && (
              <p className='text-[#d9d9d9] text-[15px] sm:text-base mt-0.5'>
                {post?.text}
              </p>
            )}
          </div>
          <div className='flex-shrink-0 ml-auto icon group'>
            <DotsHorizontalIcon className='h-5 text-[#6e767d] group-hover:text-[#1d9bf0]' />
          </div>
        </div>
        {postPage && (
          <p className='text-[#d9d9d9] mt-0.5 text-xl'>{post?.text}</p>
        )}
        <img
          src={post?.image}
          alt=''
          className='rounded-2xl max-h-[700px] object-cover mr-2'
        />
        <div
          className={`text-[#6e767d] flex justify-between w-10/12 ${
            postPage && 'mx-auto'
          }`}
        >
          <div
            className='flex items-center space-x-1 group'
            onClick={(e) => {
              e.stopPropagation() // Prevents the user from an onclick event within a group
              setPostId(id)
              setIsOpen(true)
            }}
          >
            <div className='icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10'>
              <ChatIcon className='h-5 group-hover:text-[#1d9bf0]' />
            </div>

            {comments.length > 0 && ( // if there are more then 1 comment then show the number of comments
              <span className='group-hover:text-[#1d9bf0] text-sm'>
                {comments.length}
              </span>
            )}
          </div>

          {session.user.uid === post?.id ? ( // I only want to display the delete icon when the post is from the user.  With the  session.user.uid i'm verifying the user.uid from the input component is the same,then i'll display the icons below.
            <div
              className='flex items-center space-x-1 group'
              onClick={(e) => {
                e.stopPropagation()
                deleteDoc(doc(db, 'posts', id)) // when deleteIcon is clicked it will go into firebase/doc/db/posts/id and delete
                router.push('/') // then push back to the home page.
              }}
            >
              <div className='icon group-hover:bg-red-600/10'>
                <TrashIcon className='h-5 group-hover:text-red-600' />
              </div>
            </div>
          ) : (
            // if this isnt the users post then we want to display the switchhorizontal Icon
            <div className='flex items-center space-x-1 group'>
              <div className='icon group-hover:bg-green-500/10'>
                <SwitchHorizontalIcon className='h-5 group-hover:text-green-500' />
              </div>
            </div>
          )}

          <div
            className='flex items-center space-x-1 group'
            onClick={(e) => {
              e.stopPropagation()
              likePost()
            }}
          >
            <div className='icon group-hover:bg-pink-600'>
              {liked ? (
                <HeartIconFilled className='h-5 text-pink-600' />
              ) : (
                <HeartIcon className='h-5 group-hover:text-pink-600' />
              )}
            </div>
            {likes.length > 0 && (
              <span
                className={`group-hover:text-pink-600 text-sm ${
                  liked && 'text-pink-600'
                }`}
              >
                {likes.length}
              </span>
            )}
          </div>

          <div className='icon group'>
            <ShareIcon className='h-5 group-hover:text-[#1d9bf0]' />
          </div>
          <div className='icon group'>
            <ChartBarIcon className='h-5 group-hover:text-[#1d9bf0]' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Post

/* option chaining to protect yourself
if its undefined then it will wait to get the image before erroring out

*/
