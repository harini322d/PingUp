import React, { useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  dummyConnectionsData as connections,
  dummyFollowersData as followers,
  dummyFollowingData as following,
  dummyPendingConnectionsData as pendingConnections,
} from "../assets/assets";

const Connections = () => {
  const [currentTab, setCurrentTab] = useState("Followers");

  const navigate = useNavigate();
  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-8xl mx-auto p-6">
        {/* Title  */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Connections
          </h1>
          <p className="text-slate-600">
            Manage your network and discover new connections
          </p>
        </div>

        {/* Counts  */}
        <div className="mb-8 flex flex-wrap gap-6">
          {dataArray.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center gap-1 border h-20 w-40 border-gray-200 bg-white shadow rounded-md "
            >
              <b>{item.value.length}</b>
              <p className="text-gray-600 ">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs  */}
        <div className="inline-flex flex-wrap items-center border border-gray-200 rounded-md p-1 bg-white shadow-sm">
          {dataArray.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCurrentTab(tab.label)}
              className={`cursor-pointer flex items-center px-3 py-1 text:sm rounded-md transition-colors ${
                currentTab === tab.label
                  ? "bg-white font-medium text-black"
                  : "text-gray-500 hover:text-black"
              } `}
            >
              <tab.icon className="w-4 h-4" />
              <span className="ml-1"> {tab.label} </span>
            </button>
          ))}
        </div>

        {/* Connections Horizontal Scroll */}
        <div className="mt-6 flex gap-6 overflow-x-auto pb-4">
          {dataArray
            .find((item) => item.label === currentTab)
            .value.map((user) => (
              <div
                key={user._id}
                className="flex-shrink-0 w-72 p-6 bg-white shadow rounded-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.profile_picture}
                    alt=""
                    className="rounded-full w-12 h-12 shadow-md"
                  />
                  <div>
                    <p className="font-medium text-slate-700">
                      {user.full_name}
                    </p>
                    <p className="text-slate-500">@{user.username}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  {user.bio.slice(0, 40)}...
                </p>

                {/* Action buttons horizontally */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/profile/${user._id}`)}
                    className="flex-1 p-2 text-sm rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 text-white active:scale-95 transition cursor-pointer"
                  >
                    View Profile
                  </button>

                  {currentTab === "Following" && (
                    <button className="flex-1 p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer">
                      Unfollow
                    </button>
                  )}

                  {currentTab === "Pending" && (
                    <button className="flex-1 p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-black active:scale-95 transition cursor-pointer">
                      Accept
                    </button>
                  )}

                  {currentTab === "Connections" && (
                    <button
                      onClick={() => navigate(`/messages/${user._id}`)}
                      className="flex-1 p-2 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
