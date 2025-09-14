import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import moment from 'moment'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

import Loading from '../components/Loading'
import UserProfileInfo from '../components/UserProfileInfo'
import PostCard from '../components/PostCard'
import ProfileModal from '../components/ProfileModal'

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value)
  const { getToken } = useAuth()
  const { profileId } = useParams()

  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)

  const fetchUser = async (profileId) => {
    const token = await getToken()
    try {
      const { data } = await api.post(
        `/api/user/profiles`,
        { profileId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (data.success) {
        setUser(data.profile)
        setPosts(data.posts)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (profileId) {
      fetchUser(profileId)
    } else {
      fetchUser(currentUser._id)
    }
  }, [profileId, currentUser])

  return user ? (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto"> {/* wider container only for profile */}
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-lg mx-auto">
            {['posts', 'media', 'likes'].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
          {activeTab === 'posts' && (
            <div className="mt-6 flex flex-col items-center gap-8">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="w-full flex justify-center"
                >
                  {/* Override PostCard width ONLY in profile */}
                  <div className="w-full max-w-4xl">
                    <PostCard post={post} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media */}
          {activeTab === 'media' && (
            <div className="flex flex-wrap gap-4 mt-6 max-w-7xl">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) => (
                  <React.Fragment key={post._id}>
                    {post.image_urls.map((image, index) => (
                      <Link
                        target="_blank"
                        to={image}
                        key={index}
                        className="relative group"
                      >
                        <img
                          src={image}
                          className="w-72 aspect-video object-cover rounded-lg shadow"
                          alt=""
                        />
                        <p className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300">
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </Link>
                    ))}
                  </React.Fragment>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </div>
  ) : (
    <Loading />
  )
}

export default Profile
