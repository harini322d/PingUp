# PingUp  

PingUp is a **modern social media platform** designed to make digital connections more engaging, flexible, and real-time.  

With PingUp, users can share their thoughts as **text posts**, express themselves with **photos and stories**, and stay connected through a **real-time chat system**. The platform focuses on creating a simple yet powerful way to stay in touch with friends and community.  

🚀 Live Demo: [PingUp](https://ping-up-henna.vercel.app/)  

---
## 📸 Preview  

**Login Page**                         **&& Home/Feed Page**

<img width="192" height="108" alt="Screenshot (68)" src="https://github.com/user-attachments/assets/3d33bda6-aed9-4dcf-8f2a-7a43c33c3e60" />        <img width="192" height="108" alt="Screenshot (69)" src="https://github.com/user-attachments/assets/c0df796a-388a-4d43-a783-4adce426c8d0" />

**Profile Page**                       **&& Discover Page** 

<img width="192" height="108" alt="Screenshot (73)" src="https://github.com/user-attachments/assets/c3b72fd9-10e1-45b5-b473-c0dfcb136b45" />        <img width="192" height="108" alt="Screenshot (72)" src="https://github.com/user-attachments/assets/90950647-9304-4a85-b320-d19f4913ebfb" />




## 📌 Features  

- 🔑 **Clerk Authentication** – secure login & signup  
- 📝 **Posts** – create text posts, share photos, and publish stories  
- 📰 **Personalized Feed** – view content from the people you follow  
- 💬 **Real-Time Chat** – instant conversations powered by SSE (Server-Sent Events)  
- ⏳ **Stories** – share temporary updates with your friends  
- 📱 **Responsive UI** – works seamlessly on mobile and desktop with Tailwind CSS  
- 👥 **Follow System** – connect and engage with your friends and community  

---

## 🛠️ Tech Stack  

**Frontend:**  
- React.js  
- Tailwind CSS  

**Backend:**  
- Node.js with Express.js  
- MongoDB (Database)  

**Authentication:**  
- [Clerk](https://clerk.com/) – for user management & authentication  

**Real-Time Communication:**  
- Server-Sent Events (SSE) – for live chat  

**Deployment:**  
- Vercel  

---

# ⚙️ Installation & Setup  

Follow these steps to run PingUp locally:  

```bash
# 1. Clone the repository
git clone <repository-url>

# 2. Move into the project directory
cd pingup

# 3. Install dependencies
npm install

# 4. Setup environment variables
# Create a .env file in the root with:

FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URL=your_mongodb_connection_string

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# ImageKit
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# SMTP / Email
SENDER_EMAIL=your_sender_email
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password

# JWT Secret
JWT_SECRET=your_jwt_secret

# 5. Start the development server
npm run dev
``` 
## 📂 Project Structure
pingup/ structure:

- client/ (React.js frontend): api/, components/, features/, pages/, ...
- server/ (Express.js backend): controllers/, models/, routes/, utils/, ...
---

## 📸 Screenshots

- 🏠 **Home / Feed**
- ➕ **Create Post**
- 💬 **Real-Time Chat**
- 📖 **Stories**

---

## 🚀 Usage

- Sign up or log in with Clerk
- Create posts (text, images, or stories)
- Follow your friends and see their posts in the feed
- Chat with friends in real-time using SSE chat
- Share updates through stories

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Added new feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License – feel free to use and modify it.

---

## 📧 Contact

**Developer:** Harini Maheswaram
**Email:** m.harini8460@gmail.com
