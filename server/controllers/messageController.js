import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Message from "../models/Message.js";
import Post from "../models/Post.js"; // ✅ Added for sharing posts

// Create an empty object to store SS Event connections
const connections = {}; 

// Controller function for the SSE endpoint
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log("New client connected : ", userId);

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Add the client's response object to the connections object
    connections[userId] = res;

    // Send an initial event to the client
    res.write("log: Connected to SSE stream\n\n");

    // Handle client disconnection
    req.on("close", () => {
        delete connections[userId];
        console.log("Client disconnected");
    });
};

// Send Message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id, text } = req.body;
        const image = req.file;

        let media_url = "";
        let message_type = image ? "image" : "text";

        if (message_type === "image") {
            const fileBuffer = fs.readFileSync(image.path);
            const response = await imagekit.upload({
                file: fileBuffer,
                fileName: image.originalname,
            });
            media_url = imagekit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1280" },
                ],
            });
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,
        });

        res.json({ success: true, message });

        // Send message to to_user_id using SSE
        const messageWithUserData = await Message.findById(message._id).populate(
            "from_user_id"
        );

        if (connections[to_user_id]) {
            connections[to_user_id].write(
                `data: ${JSON.stringify(messageWithUserData)}\n\n`
            );
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get Chat Messages
export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { to_user_id } = req.body;

        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId },
            ],
        }).sort({ created_at: -1 });

        // mark messages as seen
        await Message.updateMany(
            { from_user_id: to_user_id, to_user_id: userId },
            { seen: true }
        );

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = req.auth();
        const messages = await Message.find({ to_user_id: userId })
            .populate("from_user_id to_user_id")
            .sort({ created_at: -1 });

        res.json({ success: true, messages });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ✅ Share Post as a Message
export const sharePostController = async (req, res) => {
    try {
        const { userId } = req.auth(); // sender
        const { to_user_id, postId } = req.body; // receiver & post to share

        // Find the original post
        const post = await Post.findById(postId);
        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }

        // Determine message_type & content
        let message_type = post.image_urls && post.image_urls.length > 0 ? "image" : "text";
        let text = message_type === "text" ? post.content : "";
        let media_url = message_type === "image" ? post.image_urls[0] : "";

        // Create the shared message
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url,
            isShared: true,
            originalPostId: post._id,
        });

        res.json({ success: true, message });

        // Real-time push via SSE
        const messageWithUserData = await Message.findById(message._id).populate(
            "from_user_id"
        );
        if (connections[to_user_id]) {
            connections[to_user_id].write(
                `data: ${JSON.stringify(messageWithUserData)}\n\n`
            );
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
