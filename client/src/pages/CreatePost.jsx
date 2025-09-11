import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const CreatePost = () => {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const user = dummyUserData

  const handleSubmit = async () => {
    // Your API call logic can go here
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 🔥 widened whole container */}
      <div className="w-full max-w-7xl mx-auto px-10 py-8">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Post</h1>
          <p className="text-lg text-slate-600">
            Share your thoughts with the world
          </p>
        </div>

        {/* Form */}
        <div className="w-full bg-white p-8 rounded-xl shadow-md space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <img
              src={user.profile_picture}
              alt=""
              className="w-14 h-14 rounded-full shadow"
            />
            <div>
              <h2 className="font-semibold text-lg">{user.full_name}</h2>
              <p className="text-sm text-gray-500">@{user.username}</p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            className="w-full resize-none h-36 text-base outline-none placeholder-gray-400 border border-gray-200 rounded-md p-3"
            placeholder="What's Happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Images */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {images.map((image, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-28 rounded-md"
                    alt=""
                  />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-300">
            <label
              htmlFor="images"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              <ImageIcon className="size-6" />
              Add Images
            </label>
            <input
              type="file"
              id="images"
              accept="image/*"
              hidden
              multiple
              onChange={(e) => setImages([...images, ...e.target.files])}
            />
            <button
              disabled={loading}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: 'uploading...',
                  success: <p>Post Added</p>,
                  error: <p>Post Not Added</p>,
                })
              }
              className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-10 py-3 rounded-md cursor-pointer"
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
