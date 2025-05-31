"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  UserIcon,
  Bell,
  MessageSquare,
  UserPlus,
  Home,
  Newspaper,
  Play,
  Search,
  Music,
  Video,
  ImageIcon,
  X,
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Plus,
  Send,
  Pause,
  Volume2,
  Upload,
  Edit,
  Camera,
  Users,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface UserType {
  id: string
  email: string
  displayName: string
  profilePic: string
  bio?: string
  interests?: string
  isOnline?: boolean
  friends?: string[]
  createdAt?: any
}

interface Post {
  id: string
  userId: string
  caption: string
  mediaURL: string
  mediaType: "image" | "video" | ""
  reactions: Reaction[]
  comments: Comment[]
  createdAt: any
  user: UserType
  viewCount?: number
}

interface Reaction {
  type: "like" | "love" | "laugh" | "wow" | "sad" | "angry"
  userId: string
  emoji: string
}

interface Comment {
  id: string
  text: string
  userId: string
  displayName: string
  profilePic: string
  createdAt: any
}

interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromUser: UserType
  status: "pending" | "accepted" | "declined"
  mutualFriends?: number
  createdAt: any
}

interface ChatMessage {
  id: string
  fromUserId: string
  toUserId: string
  message: string
  createdAt: any
  read: boolean
}

interface Notification {
  id: string
  type: "like" | "comment" | "friend_request" | "friend_accept"
  fromUserId: string
  fromUser: UserType
  postId?: string
  message: string
  createdAt: any
  read: boolean
}

interface Song {
  id: string
  title: string
  artist: string
  album: string
  coverArt: string
  audioUrl: string
  duration: number
  genre: string
  userId: string
  user: UserType
  createdAt: any
}

// Data persistence helpers
const saveToStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data))
  }
}

const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  }
  return defaultValue
}

function MzansiGossipClub() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [currentPage, setCurrentPage] = useState<"home" | "news" | "profile" | "music" | "videos">("home")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [caption, setCaption] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [showInbox, setShowInbox] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState<{ [userId: string]: number }>({})
  const [allUsers, setAllUsers] = useState<UserType[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [selectedChatUser, setSelectedChatUser] = useState<UserType | null>(null)
  const [chatInput, setChatInput] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [showReactions, setShowReactions] = useState<{ [key: string]: boolean }>({})
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const [showAddSong, setShowAddSong] = useState(false)
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    audioFile: null as File | null,
    coverArt: null as File | null,
    coverArtPreview: "",
  })
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [editingProfile, setEditingProfile] = useState({
    displayName: "",
    bio: "",
    interests: "",
    profilePic: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePicInputRef = useRef<HTMLInputElement>(null)
  const songFileInputRef = useRef<HTMLInputElement>(null)
  const songCoverInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const reactionEmojis = [
    { type: "like", emoji: "👍", color: "text-blue-500" },
    { type: "love", emoji: "❤️", color: "text-red-500" },
    { type: "laugh", emoji: "😂", color: "text-yellow-500" },
    { type: "wow", emoji: "😮", color: "text-orange-500" },
    { type: "sad", emoji: "😢", color: "text-blue-400" },
    { type: "angry", emoji: "😡", color: "text-red-600" },
  ]

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = loadFromStorage("currentUser", null)
    const savedPosts = loadFromStorage("posts", [])
    const savedUsers = loadFromStorage("allUsers", [])
    const savedFriendRequests = loadFromStorage("friendRequests", [])
    const savedNotifications = loadFromStorage("notifications", [])
    const savedChatMessages = loadFromStorage("chatMessages", [])
    const savedSongs = loadFromStorage("songs", [])

    if (savedUser) {
      setUser(savedUser)
      setCurrentUser({ uid: savedUser.id, email: savedUser.email })
    }
    setPosts(savedPosts)
    setAllUsers(savedUsers)
    setFriendRequests(savedFriendRequests)
    setNotifications(savedNotifications)
    setChatMessages(savedChatMessages)
    setSongs(savedSongs)

    // Calculate unread messages
    const unread: { [userId: string]: number } = {}
    savedChatMessages.forEach((msg: ChatMessage) => {
      if (msg.toUserId === savedUser?.id && !msg.read) {
        unread[msg.fromUserId] = (unread[msg.fromUserId] || 0) + 1
      }
    })
    setUnreadMessages(unread)

    // Initialize demo user if none exists
    if (!savedUser) {
      const demoUser: UserType = {
        id: "demo-user-123",
        email: "demo@example.com",
        displayName: "Demo User",
        profilePic: "/placeholder.svg?height=40&width=40",
        bio: "Welcome to TheMzansiGossipClub!",
        interests: "Music, Videos, Social Media",
        isOnline: true,
        friends: [],
        createdAt: new Date(),
      }
      setUser(demoUser)
      setCurrentUser({ uid: demoUser.id, email: demoUser.email })
      saveToStorage("currentUser", demoUser)
      saveToStorage("allUsers", [demoUser])
      setAllUsers([demoUser])
    }
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    if (user) saveToStorage("currentUser", user)
  }, [user])

  useEffect(() => {
    saveToStorage("posts", posts)
  }, [posts])

  useEffect(() => {
    saveToStorage("allUsers", allUsers)
  }, [allUsers])

  useEffect(() => {
    saveToStorage("friendRequests", friendRequests)
  }, [friendRequests])

  useEffect(() => {
    saveToStorage("notifications", notifications)
  }, [notifications])

  useEffect(() => {
    saveToStorage("chatMessages", chatMessages)
  }, [chatMessages])

  useEffect(() => {
    saveToStorage("songs", songs)
  }, [songs])

  // Audio player controls
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && currentSong) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
          toast({
            title: "Playback Error",
            description: "Could not play the audio. Please try again.",
            variant: "destructive",
          })
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSong, toast])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current && currentSong) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const newUser: UserType = {
      id: `user-${Date.now()}`,
      email: email,
      displayName: displayName,
      profilePic: "/placeholder.svg?height=40&width=40",
      bio: "",
      interests: "",
      isOnline: true,
      friends: [],
      createdAt: new Date(),
    }

    setUser(newUser)
    setCurrentUser({ uid: newUser.id, email: newUser.email })
    setAllUsers([...allUsers, newUser])
    setEmail("")
    setPassword("")
    setDisplayName("")
    setLoading(false)

    toast({
      description: "Account created successfully!",
    })
  }

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Find existing user or create new one
    const existingUser = allUsers.find((u) => u.email === email)
    if (existingUser) {
      setUser(existingUser)
      setCurrentUser({ uid: existingUser.id, email: existingUser.email })
    } else {
      const newUser: UserType = {
        id: `user-${Date.now()}`,
        email: email,
        displayName: email.split("@")[0],
        profilePic: "/placeholder.svg?height=40&width=40",
        bio: "",
        interests: "",
        isOnline: true,
        friends: [],
        createdAt: new Date(),
      }
      setUser(newUser)
      setCurrentUser({ uid: newUser.id, email: newUser.email })
      setAllUsers([...allUsers, newUser])
    }

    setEmail("")
    setPassword("")
    setLoading(false)

    toast({
      description: "Logged in successfully!",
    })
  }

  const handleCreatePost = async () => {
    if (!currentUser || (!caption.trim() && !selectedFile)) {
      toast({
        title: "Error",
        description: "Please add some content to your post",
        variant: "destructive",
      })
      return
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: currentUser.uid,
      caption,
      mediaURL: previewUrl || "",
      mediaType: selectedFile?.type.startsWith("video") ? "video" : selectedFile ? "image" : "",
      reactions: [],
      comments: [],
      createdAt: new Date(),
      user: user!,
      viewCount: 0,
    }

    setPosts([newPost, ...posts])
    setCaption("")
    setSelectedFile(null)
    setPreviewUrl("")

    toast({
      description: "Post shared successfully!",
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleReaction = (postId: string, reactionType: string) => {
    if (!currentUser || !user) return

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const existingReaction = post.reactions.find((r) => r.userId === currentUser.uid)
        let newReactions = [...post.reactions]

        if (existingReaction && existingReaction.type === reactionType) {
          // Remove reaction if clicking the same type
          newReactions = newReactions.filter((r) => r.userId !== currentUser.uid)
        } else {
          // Remove existing reaction if any
          newReactions = newReactions.filter((r) => r.userId !== currentUser.uid)
          // Add new reaction
          const emoji = reactionEmojis.find((r) => r.type === reactionType)?.emoji || "👍"
          newReactions.push({
            type: reactionType as any,
            userId: currentUser.uid,
            emoji,
          })

          // Create notification if not the user's own post
          if (post.userId !== currentUser.uid) {
            const newNotification: Notification = {
              id: `notif-${Date.now()}`,
              type: "like",
              fromUserId: currentUser.uid,
              fromUser: user,
              postId,
              message: `reacted with ${emoji} to your post`,
              createdAt: new Date(),
              read: false,
            }
            setNotifications([newNotification, ...notifications])
          }
        }

        return { ...post, reactions: newReactions }
      }
      return post
    })

    setPosts(updatedPosts)
    setShowReactions({ ...showReactions, [postId]: false })
  }

  const handleComment = (postId: string) => {
    if (!currentUser || !user) return

    const commentText = commentInputs[postId]?.trim()
    if (!commentText) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      userId: currentUser.uid,
      displayName: user.displayName,
      profilePic: user.profilePic,
      createdAt: new Date(),
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = [...post.comments, newComment]

        // Create notification if not the user's own post
        if (post.userId !== currentUser.uid) {
          const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: "comment",
            fromUserId: currentUser.uid,
            fromUser: user,
            postId,
            message: "commented on your post",
            createdAt: new Date(),
            read: false,
          }
          setNotifications([newNotification, ...notifications])
        }

        return { ...post, comments: updatedComments }
      }
      return post
    })

    setPosts(updatedPosts)
    setCommentInputs({ ...commentInputs, [postId]: "" })
    toast({
      description: "Comment added!",
    })
  }

  const handleShare = (post: Post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast({
          description: "Link copied to clipboard!",
        })
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        toast({
          description: "Link copied to clipboard!",
        })
      })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = allUsers.filter(
        (searchUser) =>
          searchUser.id !== user?.id &&
          (searchUser.displayName.toLowerCase().includes(query.toLowerCase()) ||
            searchUser.email.toLowerCase().includes(query.toLowerCase())),
      )
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setShowSearch(false)
      setSearchResults([])
    }
  }

  const sendFriendRequest = (userId: string) => {
    if (!currentUser || !user) return

    // Check if request already exists
    const existingRequest = friendRequests.find((req) => req.fromUserId === currentUser.uid && req.toUserId === userId)

    if (existingRequest) {
      toast({
        title: "Info",
        description: "Friend request already sent",
      })
      return
    }

    const targetUser = allUsers.find((u) => u.id === userId)
    if (!targetUser) return

    const newRequest: FriendRequest = {
      id: `req-${Date.now()}`,
      fromUserId: currentUser.uid,
      toUserId: userId,
      fromUser: user,
      status: "pending",
      mutualFriends: 0,
      createdAt: new Date(),
    }

    setFriendRequests([newRequest, ...friendRequests])

    // Create notification
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: "friend_request",
      fromUserId: currentUser.uid,
      fromUser: user,
      message: "sent you a friend request",
      createdAt: new Date(),
      read: false,
    }
    setNotifications([newNotification, ...notifications])

    toast({
      description: "Friend request sent!",
    })
  }

  const acceptFriendRequest = (requestId: string) => {
    if (!currentUser || !user) return

    const request = friendRequests.find((req) => req.id === requestId)
    if (!request) return

    // Update request status
    const updatedRequests = friendRequests.map((req) =>
      req.id === requestId ? { ...req, status: "accepted" as const } : req,
    )
    setFriendRequests(updatedRequests)

    // Update both users' friends lists
    const updatedUsers = allUsers.map((u) => {
      if (u.id === currentUser.uid) {
        return { ...u, friends: [...(u.friends || []), request.fromUserId] }
      }
      if (u.id === request.fromUserId) {
        return { ...u, friends: [...(u.friends || []), currentUser.uid] }
      }
      return u
    })
    setAllUsers(updatedUsers)

    // Update current user
    setUser({ ...user, friends: [...(user.friends || []), request.fromUserId] })

    // Create notification
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: "friend_accept",
      fromUserId: currentUser.uid,
      fromUser: user,
      message: "accepted your friend request",
      createdAt: new Date(),
      read: false,
    }
    setNotifications([newNotification, ...notifications])

    toast({
      description: "Friend request accepted!",
    })
  }

  const declineFriendRequest = (requestId: string) => {
    const updatedRequests = friendRequests.map((req) =>
      req.id === requestId ? { ...req, status: "declined" as const } : req,
    )
    setFriendRequests(updatedRequests)

    toast({
      description: "Friend request declined",
    })
  }

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedChatUser || !currentUser || !user) return

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: currentUser.uid,
      toUserId: selectedChatUser.id,
      message: chatInput,
      createdAt: new Date(),
      read: false,
    }

    setChatMessages([newMessage, ...chatMessages])
    setChatInput("")
  }

  const startChat = (chatUser: UserType) => {
    setSelectedChatUser(chatUser)
    setShowChat(true)
    setShowInbox(false)

    // Mark messages as read
    const updatedMessages = chatMessages.map((msg) =>
      msg.fromUserId === chatUser.id && msg.toUserId === currentUser?.uid ? { ...msg, read: true } : msg,
    )
    setChatMessages(updatedMessages)

    // Update unread count
    setUnreadMessages({ ...unreadMessages, [chatUser.id]: 0 })
  }

  const handleProfileEdit = () => {
    if (!currentUser || !user) return

    const updatedUser = {
      ...user,
      displayName: editingProfile.displayName || user.displayName,
      bio: editingProfile.bio || user.bio || "",
      interests: editingProfile.interests || user.interests || "",
      profilePic: editingProfile.profilePic || user.profilePic,
    }

    setUser(updatedUser)

    // Update in all users list
    const updatedUsers = allUsers.map((u) => (u.id === currentUser.uid ? updatedUser : u))
    setAllUsers(updatedUsers)

    // Update posts with new user info
    const updatedPosts = posts.map((post) => (post.userId === currentUser.uid ? { ...post, user: updatedUser } : post))
    setPosts(updatedPosts)

    setShowProfileEdit(false)
    setEditingProfile({ displayName: "", bio: "", interests: "", profilePic: "" })

    toast({
      description: "Profile updated successfully!",
    })
  }

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setEditingProfile({ ...editingProfile, profilePic: url })
    }
  }

  const handleSongUpload = () => {
    if (!currentUser || !user) return

    if (!newSong.title || !newSong.artist || !newSong.audioFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and upload an audio file",
        variant: "destructive",
      })
      return
    }

    // Check if audio file is at least 2 minutes (120 seconds)
    const audio = new Audio(URL.createObjectURL(newSong.audioFile))
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration < 120) {
        toast({
          title: "Error",
          description: "Song must be at least 2 minutes long",
          variant: "destructive",
        })
        return
      }

      const audioUrl = URL.createObjectURL(newSong.audioFile!)
      const coverArt = newSong.coverArtPreview || "/placeholder.svg?height=300&width=300"

      const newSongData: Song = {
        id: `song-${Date.now()}`,
        title: newSong.title,
        artist: newSong.artist,
        album: newSong.album || newSong.title,
        coverArt,
        audioUrl,
        duration: audio.duration,
        genre: newSong.genre || "Other",
        userId: currentUser.uid,
        user: user,
        createdAt: new Date(),
      }

      setSongs([newSongData, ...songs])

      // Reset form
      setNewSong({
        title: "",
        artist: "",
        album: "",
        genre: "",
        audioFile: null,
        coverArt: null,
        coverArtPreview: "",
      })

      setShowAddSong(false)
      toast({
        description: "Song uploaded successfully!",
      })
    })
  }

  const handleSongFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNewSong({ ...newSong, audioFile: file })
    }
  }

  const handleSongCoverSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setNewSong({ ...newSong, coverArt: file, coverArtPreview: url })
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map((notif) =>
      notif.id === notificationId ? { ...notif, read: true } : notif,
    )
    setNotifications(updatedNotifications)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-blue-600">TheMzansiGossipClub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              defaultValue={isSignUp ? "signup" : "login"}
              onValueChange={(value) => setIsSignUp(value === "signup")}
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin} className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <Input
                  type="text"
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleSignUp} className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left - Logo and Search */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-blue-600">TheMzansiGossipClub</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search people..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {showSearch && searchResults.length > 0 && (
                  <Card className="absolute top-full left-0 mt-2 w-full z-50 max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                      {searchResults.map((searchUser) => (
                        <div
                          key={searchUser.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={searchUser.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{searchUser.displayName}</p>
                            <p className="text-xs text-muted-foreground">{searchUser.email}</p>
                          </div>
                          <Button size="sm" onClick={() => sendFriendRequest(searchUser.id)}>
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b shadow-sm py-2">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant={currentPage === "home" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setCurrentPage("home")}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant={currentPage === "news" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setCurrentPage("news")}
            >
              <Newspaper className="h-5 w-5" />
            </Button>
            <Button
              variant={currentPage === "videos" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setCurrentPage("videos")}
            >
              <Play className="h-5 w-5" />
            </Button>
            <Button
              variant={currentPage === "music" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setCurrentPage("music")}
            >
              <Music className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Button variant="ghost" className="w-full" onClick={() => setShowFriendRequests(!showFriendRequests)}>
                <UserPlus className="h-5 w-5" />
                {friendRequests.filter((req) => req.status === "pending" && req.toUserId === currentUser?.uid).length >
                  0 && (
                  <Badge className="absolute -top-1 right-1/4 h-5 w-5 rounded-full p-0 text-xs">
                    {
                      friendRequests.filter((req) => req.status === "pending" && req.toUserId === currentUser?.uid)
                        .length
                    }
                  </Badge>
                )}
              </Button>
            </div>
            <div className="relative flex-1">
              <Button variant="ghost" className="w-full" onClick={() => setShowInbox(!showInbox)}>
                <MessageSquare className="h-5 w-5" />
                {Object.values(unreadMessages).reduce((a, b) => a + b, 0) > 0 && (
                  <Badge className="absolute -top-1 right-1/4 h-5 w-5 rounded-full p-0 text-xs">
                    {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
                  </Badge>
                )}
              </Button>
            </div>
            <div className="relative flex-1">
              <Button variant="ghost" className="w-full" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 right-1/4 h-5 w-5 rounded-full p-0 text-xs">
                    {notifications.filter((n) => !n.read).length}
                  </Badge>
                )}
              </Button>
            </div>
            <Button
              variant={currentPage === "profile" ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setCurrentPage("profile")}
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>

      {/* Friend Requests Dropdown */}
      {showFriendRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Friend Requests</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFriendRequests(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {friendRequests
                .filter((req) => req.status === "pending" && req.toUserId === currentUser?.uid)
                .map((request) => (
                  <div key={request.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.fromUser.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{request.fromUser.displayName}</p>
                      <p className="text-xs text-muted-foreground">{request.fromUser.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => declineFriendRequest(request.id)}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {friendRequests.filter((req) => req.status === "pending" && req.toUserId === currentUser?.uid).length ===
                0 && <p className="text-sm text-muted-foreground text-center">No pending requests</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notifications</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer ${!notif.read ? "bg-blue-50" : ""}`}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={notif.fromUser.profilePic || "/placeholder.svg"} />
                    <AvatarFallback>
                      <UserIcon className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{notif.fromUser.displayName}</span> {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notif.createdAt?.toLocaleDateString?.() || "Just now"}
                    </p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-muted-foreground text-center">No notifications</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inbox Dropdown */}
      {showInbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md m-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Messages</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowInbox(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {user?.friends?.map((friendId) => {
                const friend = allUsers.find((u) => u.id === friendId)
                if (!friend) return null

                const unreadCount = unreadMessages[friendId] || 0
                const lastMessage = chatMessages
                  .filter(
                    (msg) =>
                      (msg.fromUserId === friendId && msg.toUserId === currentUser?.uid) ||
                      (msg.fromUserId === currentUser?.uid && msg.toUserId === friendId),
                  )
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

                return (
                  <div
                    key={friendId}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => startChat(friend)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{friend.displayName}</p>
                        {unreadCount > 0 && <Badge className="h-5 w-5 rounded-full p-0 text-xs">{unreadCount}</Badge>}
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage.fromUserId === currentUser?.uid ? "You: " : ""}
                          {lastMessage.message}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
              {(!user?.friends || user.friends.length === 0) && (
                <p className="text-sm text-muted-foreground text-center">No friends to chat with</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedChatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="w-full max-w-md m-4 h-96 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChatUser.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    <UserIcon className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-sm">{selectedChatUser.displayName}</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                {chatMessages
                  .filter(
                    (msg) =>
                      (msg.fromUserId === selectedChatUser.id && msg.toUserId === currentUser?.uid) ||
                      (msg.fromUserId === currentUser?.uid && msg.toUserId === selectedChatUser.id),
                  )
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.fromUserId === currentUser?.uid ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.fromUserId === currentUser?.uid
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        {message.message}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Edit Modal */}
      <Dialog open={showProfileEdit} onOpenChange={setShowProfileEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={editingProfile.profilePic || user?.profilePic || "/placeholder.svg"} />
                <AvatarFallback>
                  <UserIcon className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={() => profilePicInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
              <input
                ref={profilePicInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="hidden"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder={user?.displayName}
                value={editingProfile.displayName}
                onChange={(e) => setEditingProfile({ ...editingProfile, displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={editingProfile.bio}
                onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                placeholder="Music, Sports, Technology..."
                value={editingProfile.interests}
                onChange={(e) => setEditingProfile({ ...editingProfile, interests: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleProfileEdit} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowProfileEdit(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Song Modal */}
      <Dialog open={showAddSong} onOpenChange={setShowAddSong}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Song</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="songTitle">Title *</Label>
              <Input
                id="songTitle"
                placeholder="Song title"
                value={newSong.title}
                onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="songArtist">Artist *</Label>
              <Input
                id="songArtist"
                placeholder="Artist name"
                value={newSong.artist}
                onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="songAlbum">Album</Label>
              <Input
                id="songAlbum"
                placeholder="Album name"
                value={newSong.album}
                onChange={(e) => setNewSong({ ...newSong, album: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="songGenre">Genre</Label>
              <Input
                id="songGenre"
                placeholder="Genre"
                value={newSong.genre}
                onChange={(e) => setNewSong({ ...newSong, genre: e.target.value })}
              />
            </div>
            <div>
              <Label>Audio File * (minimum 2 minutes)</Label>
              <Button variant="outline" onClick={() => songFileInputRef.current?.click()} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {newSong.audioFile ? newSong.audioFile.name : "Choose audio file"}
              </Button>
              <input
                ref={songFileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleSongFileSelect}
                className="hidden"
              />
            </div>
            <div>
              <Label>Cover Art</Label>
              <Button variant="outline" onClick={() => songCoverInputRef.current?.click()} className="w-full">
                <ImageIcon className="h-4 w-4 mr-2" />
                {newSong.coverArt ? newSong.coverArt.name : "Choose cover image"}
              </Button>
              <input
                ref={songCoverInputRef}
                type="file"
                accept="image/*"
                onChange={handleSongCoverSelect}
                className="hidden"
              />
              {newSong.coverArtPreview && (
                <img
                  src={newSong.coverArtPreview || "/placeholder.svg"}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded mt-2"
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSongUpload} className="flex-1">
                Upload Song
              </Button>
              <Button variant="outline" onClick={() => setShowAddSong(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6">
        {currentPage === "home" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Create Post */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {previewUrl && (
                  <div className="relative mb-4">
                    {selectedFile?.type.startsWith("video") ? (
                      <video controls className="w-full max-h-64 rounded-lg">
                        <source src={previewUrl} type={selectedFile.type} />
                      </video>
                    ) : (
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl("")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Photo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Video className="h-4 w-4 mr-2" />
                      Video
                    </Button>
                  </div>
                  <Button onClick={handleCreatePost} disabled={loading}>
                    {loading ? "Posting..." : "Post"}
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Posts Feed */}
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-4">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={post.user.profilePic || "/placeholder.svg"} />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{post.user.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          {post.createdAt?.toLocaleDateString?.() || "Just now"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  {post.caption && <p className="mb-4">{post.caption}</p>}

                  {post.mediaURL && (
                    <div className="mb-4">
                      {post.mediaType === "video" ? (
                        <video controls className="w-full rounded-lg">
                          <source src={post.mediaURL} />
                        </video>
                      ) : (
                        <img src={post.mediaURL || "/placeholder.svg"} alt="Post media" className="w-full rounded-lg" />
                      )}
                    </div>
                  )}

                  {/* Reactions Display */}
                  {post.reactions.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-1">
                        {Array.from(new Set(post.reactions.map((r) => r.emoji))).map((emoji, index) => (
                          <span key={index} className="text-sm bg-white rounded-full border p-1">
                            {emoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{post.reactions.length}</span>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-4">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReactions({ ...showReactions, [post.id]: !showReactions[post.id] })}
                        >
                          <Heart
                            className={`h-4 w-4 mr-2 ${
                              post.reactions.some((r) => r.userId === currentUser?.uid)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                          Like
                        </Button>
                        {showReactions[post.id] && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                            {reactionEmojis.map((reaction) => (
                              <button
                                key={reaction.type}
                                className="text-lg hover:scale-125 transition-transform"
                                onClick={() => handleReaction(post.id, reaction.type)}
                              >
                                {reaction.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Comment ({post.comments.length})
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 rounded-lg px-3 py-2 flex-1">
                            <p className="font-semibold text-sm">{comment.displayName}</p>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="flex items-center gap-2 mt-4">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        <UserIcon className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => handleComment(post.id)}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {posts.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No posts yet. Create your first post!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentPage === "music" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Music</h2>
              <Button onClick={() => setShowAddSong(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Song
              </Button>
            </div>

            {/* Current Playing Song */}
            {currentSong && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentSong.coverArt || "/placeholder.svg"}
                      alt={currentSong.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{currentSong.title}</h3>
                      <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button size="sm" onClick={togglePlayPause}>
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <div className="flex-1">
                          <Slider
                            value={[currentTime]}
                            max={currentSong.duration}
                            step={1}
                            onValueChange={handleSeek}
                            className="w-full"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(currentTime)} / {formatTime(currentSong.duration)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        onValueChange={(value) => setVolume(value[0])}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <audio
                    ref={audioRef}
                    src={currentSong.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Songs List */}
            <div className="grid gap-4">
              {songs.map((song) => (
                <Card key={song.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={song.coverArt || "/placeholder.svg"}
                        alt={song.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                        <p className="text-xs text-muted-foreground">
                          {song.album} • {song.genre}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formatTime(song.duration)}</span>
                        <Button size="sm" onClick={() => playSong(song)}>
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleShare({ ...song, id: song.id } as any)}>
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={song.user.profilePic || "/placeholder.svg"} />
                        <AvatarFallback>
                          <UserIcon className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Uploaded by {song.user.displayName}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {songs.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No songs uploaded yet. Be the first to share your music!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {currentPage === "news" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Latest News</h2>
            <div className="grid gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Welcome to News Section</h3>
                  <p className="text-muted-foreground">
                    Stay updated with the latest news and updates from the community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentPage === "videos" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Videos</h2>
            <div className="grid gap-6">
              {posts
                .filter((post) => post.mediaType === "video")
                .map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src={post.user.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.user.displayName}</p>
                          <p className="text-sm text-muted-foreground">
                            {post.createdAt?.toLocaleDateString?.() || "Just now"}
                          </p>
                        </div>
                      </div>
                      {post.caption && <p className="mb-4">{post.caption}</p>}
                      <video controls className="w-full rounded-lg mb-4">
                        <source src={post.mediaURL} />
                      </video>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <Button variant="ghost" size="sm" onClick={() => handleReaction(post.id, "like")}>
                            <Heart className="h-4 w-4 mr-2" />
                            Like ({post.reactions.length})
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Comment ({post.comments.length})
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare(post)}>
                            <Share className="h-4 w-4 mr-2" />
                            Share
                          </Button>
                        </div>
                        <span className="text-sm text-muted-foreground">{post.viewCount || 0} views</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {posts.filter((post) => post.mediaType === "video").length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No videos uploaded yet. Share your first video!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {currentPage === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                    <AvatarFallback>
                      <UserIcon className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{user?.displayName}</h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    {user?.bio && <p className="text-sm mt-2">{user.bio}</p>}
                    {user?.interests && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Interests:</strong> {user.interests}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{user?.isOnline ? "Online" : "Offline"}</Badge>
                      <span className="text-sm text-muted-foreground">
                        <Users className="h-4 w-4 inline mr-1" />
                        {user?.friends?.length || 0} friends
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEditingProfile({
                      displayName: user?.displayName || "",
                      bio: user?.bio || "",
                      interests: user?.interests || "",
                      profilePic: "",
                    })
                    setShowProfileEdit(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* User's Posts */}
            <Card>
              <CardHeader>
                <CardTitle>My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {posts
                    .filter((post) => post.userId === currentUser?.uid)
                    .map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        {post.caption && <p className="mb-2">{post.caption}</p>}
                        {post.mediaURL && (
                          <div className="mb-2">
                            {post.mediaType === "video" ? (
                              <video controls className="w-full max-h-48 rounded">
                                <source src={post.mediaURL} />
                              </video>
                            ) : (
                              <img
                                src={post.mediaURL || "/placeholder.svg"}
                                alt="Post media"
                                className="w-full max-h-48 object-cover rounded"
                              />
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{post.createdAt?.toLocaleDateString?.() || "Just now"}</span>
                          <div className="flex gap-4">
                            <span>{post.reactions.length} likes</span>
                            <span>{post.comments.length} comments</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {posts.filter((post) => post.userId === currentUser?.uid).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">You haven't posted anything yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default MzansiGossipClub
