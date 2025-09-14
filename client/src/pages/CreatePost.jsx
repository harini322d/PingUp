import React, { useState } from 'react'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from "react-redux";
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {

  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const user = useSelector((state)=>state.user.value)

  const  { getToken } = useAuth()
  
  const handleSubmit = async () => {
    if (!images.length && !content) {
      return toast.error('Please add at least one image or text');
    }
    setLoading(true);

    const postType =
      images.length && content
        ? 'text_with_image'
        : images.length
        ? 'image'
        : 'text';

    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('post_type', postType);

      images.forEach((image) => {
        formData.append('images', image);
      });

      const { data } = await api.post('/api/post/add', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        navigate('/');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error; // let toast.promise catch and show error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-white'>
      {/* 🔥 wider container here */}
      <div className='max-w-7xl mx-auto p-8'>
        {/* Title */}
        <div className='mb-10'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the world</p>
        </div>

        {/* Form */}
        <div className='bg-white p-6 sm:p-10 sm:pb-6 rounded-xl shadow-md space-y-4 w-full md:w-3/4 lg:w-2/3'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <img src={user.profile_picture} alt="" className='w-12 h-12 rounded-full shadow'/>
            <div>
              <h2 className='font-semibold'>{user.full_name}</h2>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            className='w-full resize-none max-h-32 mt-4 text-sm outline-none placeholder-gray-400'
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Images */}
          {images.length > 0 && (
            <div className='flex flex-wrap gap-3 mt-4'>
              {images.map((image, i) => (
                <div key={i} className='relative group'>
                  <img src={URL.createObjectURL(image)} className='h-24 rounded-md' alt="" />
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className='absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer'
                  >
                    <X className="w-6 h-6 text-white"/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
            <label
              htmlFor="images"
              className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer'
            >
              <Image className='size-6'/>
            </label>

            <input
              type="file"
              id="images"
              accept='image/*'
              hidden
              multiple
              onChange={(e) => setImages([...images, ...e.target.files])}
            />

            <button
              disabled={loading}
              onClick={() =>
                toast.promise(
                  handleSubmit(),
                  {
                    loading: 'Uploading ...',
                    success: <p>Post Added</p>,
                    error: <p>Post Not Added</p>,
                  }
                )
              }
              className='text-sm bg-gradient-to-r from-indigo-500 to-purple-600 
                        hover:from-indigo-600 hover:to-purple-700 active:scale-95 
                        transition text-white font-medium px-8 py-2 rounded-md 
                        cursor-pointer'
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
