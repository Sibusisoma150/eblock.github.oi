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
  Sun,
  Moon,
  TrendingUp,
  Clock,
  Eye,
  ArrowLeft,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import Link from "next/link"

interface UserType {
  id: string
  email: string
  displayName: string
  profilePic: string
  bio?: string
  interests?: string
  gender?: "male" | "female" | "other" | ""
  isOnline?: boolean
  friends?: string[]
  createdAt?: any
}

interface Post {
  id: string
  userId: string
  caption: string
  mediaURL: string
  mediaType: "image" | "video" | "song" | ""
  reactions: Reaction[]
  comments: Comment[]
  createdAt: any
  user: UserType
  viewCount?: number
  streamCount?: number
  songData?: Song
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
  messageType: "text" | "voice" | "image" | "video" | "song"
  mediaUrl?: string
  duration?: number
  createdAt: any
  read: boolean
}

interface Notification {
  id: string
  type: "like" | "comment" | "friend_request" | "friend_accept" | "song_like" | "song_comment"
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
  streamCount: number
  reactions: Reaction[]
  comments: Comment[]
}

interface SearchHistory {
  id: string
  query: string
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
  const { theme, setTheme } = useTheme()
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
    gender: "",
  })
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false)
  const [voiceRecorder, setVoiceRecorder] = useState<MediaRecorder | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [showEditPost, setShowEditPost] = useState(false)
  const [editCaption, setEditCaption] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [gender, setGender] = useState("")

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

  // Time formatting function
  const getTimeAgo = (date: any) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = loadFromStorage("currentUser", null)
    const savedPosts = loadFromStorage("posts", [])
    const savedUsers = loadFromStorage("allUsers", [])
    const savedFriendRequests = loadFromStorage("friendRequests", [])
    const savedNotifications = loadFromStorage("notifications", [])
    const savedChatMessages = loadFromStorage("chatMessages", [])
    const savedSongs = loadFromStorage("songs", [])
    const savedSearchHistory = loadFromStorage("searchHistory", [])

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
    setSearchHistory(savedSearchHistory)

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
        gender: "other",
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

  useEffect(() => {
    saveToStorage("searchHistory", searchHistory)
  }, [searchHistory])

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
    if (!email || !password || !displayName || !gender) {
      toast({
        title: "Error",
        description: "Please fill in all fields including gender",
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
      gender: gender as "male" | "female" | "other",
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
    setGender("")
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
        gender: "",
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
      streamCount: 0,
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

  const handleSongReaction = (songId: string, reactionType: string) => {
    if (!currentUser || !user) return

    const updatedSongs = songs.map((song) => {
      if (song.id === songId) {
        const existingReaction = song.reactions.find((r) => r.userId === currentUser.uid)
        let newReactions = [...song.reactions]

        if (existingReaction && existingReaction.type === reactionType) {
          newReactions = newReactions.filter((r) => r.userId !== currentUser.uid)
        } else {
          newReactions = newReactions.filter((r) => r.userId !== currentUser.uid)
          const emoji = reactionEmojis.find((r) => r.type === reactionType)?.emoji || "👍"
          newReactions.push({
            type: reactionType as any,
            userId: currentUser.uid,
            emoji,
          })

          if (song.userId !== currentUser.uid) {
            const newNotification: Notification = {
              id: `notif-${Date.now()}`,
              type: "song_like",
              fromUserId: currentUser.uid,
              fromUser: user,
              postId: songId,
              message: `liked your song "${song.title}"`,
              createdAt: new Date(),
              read: false,
            }
            setNotifications([newNotification, ...notifications])
          }
        }

        return { ...song, reactions: newReactions }
      }
      return song
    })

    setSongs(updatedSongs)
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

  const handleSongComment = (songId: string, commentText: string) => {
    if (!currentUser || !user || !commentText.trim()) return

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      userId: currentUser.uid,
      displayName: user.displayName,
      profilePic: user.profilePic,
      createdAt: new Date(),
    }

    const updatedSongs = songs.map((song) => {
      if (song.id === songId) {
        const updatedComments = [...song.comments, newComment]

        if (song.userId !== currentUser.uid) {
          const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            type: "song_comment",
            fromUserId: currentUser.uid,
            fromUser: user,
            postId: songId,
            message: `commented on your song "${song.title}"`,
            createdAt: new Date(),
            read: false,
          }
          setNotifications([newNotification, ...notifications])
        }

        return { ...song, comments: updatedComments }
      }
      return song
    })

    setSongs(updatedSongs)
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
      // Search by displayName primarily, then email, bio, interests
      const results = allUsers.filter(
        (searchUser) =>
          searchUser.id !== user?.id &&
          (searchUser.displayName.toLowerCase().includes(query.toLowerCase()) ||
            searchUser.email.toLowerCase().includes(query.toLowerCase()) ||
            searchUser.bio?.toLowerCase().includes(query.toLowerCase()) ||
            searchUser.interests?.toLowerCase().includes(query.toLowerCase())),
      )
      setSearchResults(results)
      setShowSearch(true)
      setShowSearchHistory(false)

      // Add to search history
      if (currentUser && user) {
        const newSearchHistory: SearchHistory = {
          id: `search-${Date.now()}`,
          query,
          userId: currentUser.uid,
          user: user,
          createdAt: new Date(),
        }
        setSearchHistory([newSearchHistory, ...searchHistory.slice(0, 9)])
      }
    } else {
      // Show all users when search is empty
      const allOtherUsers = allUsers.filter((u) => u.id !== user?.id)
      setSearchResults(allOtherUsers)
      setShowSearch(true)
      setShowSearchHistory(false)
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

    // Check if already friends
    if (user.friends?.includes(userId)) {
      toast({
        title: "Info",
        description: "You are already friends",
      })
      return
    }

    const targetUser = allUsers.find((u) => u.id === userId)
    if (!targetUser) return

    // Calculate mutual friends
    const mutualFriends = (user.friends || []).filter((friendId) =>
      (targetUser.friends || []).includes(friendId),
    ).length

    const newRequest: FriendRequest = {
      id: `req-${Date.now()}`,
      fromUserId: currentUser.uid,
      toUserId: userId,
      fromUser: user,
      status: "pending",
      mutualFriends,
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
      messageType: "text",
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
      gender: editingProfile.gender || user.gender || "",
    }

    setUser(updatedUser)

    // Update in all users list
    const updatedUsers = allUsers.map((u) => (u.id === currentUser.uid ? updatedUser : u))
    setAllUsers(updatedUsers)

    // Update posts with new user info
    const updatedPosts = posts.map((post) => (post.userId === currentUser.uid ? { ...post, user: updatedUser } : post))
    setPosts(updatedPosts)

    setShowProfileEdit(false)
    setEditingProfile({ displayName: "", bio: "", interests: "", profilePic: "", gender: "" })

    toast({
      description: "Profile updated successfully!",
    })
  }

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setEditingProfile({ ...editingProfile, profilePic: result })
      }
      reader.readAsDataURL(file)
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

    // Check if audio file is at least 1 minute (60 seconds)
    const audio = new Audio(URL.createObjectURL(newSong.audioFile))
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration < 60) {
        toast({
          title: "Error",
          description: "Song must be at least 1 minute long",
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
        streamCount: 0,
        reactions: [],
        comments: [],
      }

      setSongs([newSongData, ...songs])

      // Create a post for the song
      const songPost: Post = {
        id: `post-song-${Date.now()}`,
        userId: currentUser.uid,
        caption: `🎵 Just uploaded a new song: "${newSong.title}" by ${newSong.artist}`,
        mediaURL: coverArt,
        mediaType: "song",
        reactions: [],
        comments: [],
        createdAt: new Date(),
        user: user,
        viewCount: 0,
        streamCount: 0,
        songData: newSongData,
      }

      setPosts([songPost, ...posts])

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
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setNewSong({ ...newSong, coverArt: file, coverArtPreview: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)

    // Increment stream count
    const updatedSongs = songs.map((s) => (s.id === song.id ? { ...s, streamCount: s.streamCount + 1 } : s))
    setSongs(updatedSongs)
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

  const getTrendingSongs = () => {
    return songs
      .sort((a, b) => {
        const aScore = a.streamCount + a.reactions.length * 2
        const bScore = b.streamCount + b.reactions.length * 2
        return bScore - aScore
      })
      .slice(0, 10)
  }

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const url = URL.createObjectURL(blob)
        sendVoiceMessage(url, recordingTime)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setVoiceRecorder(recorder)
      setIsRecordingVoice(true)
      setRecordingTime(0)

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      setTimeout(() => {
        clearInterval(timer)
      }, 60000) // Max 1 minute recording
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive",
      })
    }
  }

  const stopVoiceRecording = () => {
    if (voiceRecorder && isRecordingVoice) {
      voiceRecorder.stop()
      setIsRecordingVoice(false)
      setVoiceRecorder(null)
    }
  }

  const sendVoiceMessage = (audioUrl: string, duration: number) => {
    if (!selectedChatUser || !currentUser || !user) return

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: currentUser.uid,
      toUserId: selectedChatUser.id,
      message: "Voice message",
      messageType: "voice",
      mediaUrl: audioUrl,
      duration,
      createdAt: new Date(),
      read: false,
    }

    setChatMessages([newMessage, ...chatMessages])
  }

  const sendMediaMessage = (file: File, type: "image" | "video" | "song") => {
    if (!selectedChatUser || !currentUser || !user) return

    const mediaUrl = URL.createObjectURL(file)
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      fromUserId: currentUser.uid,
      toUserId: selectedChatUser.id,
      message: type === "image" ? "Photo" : type === "video" ? "Video" : "Song",
      messageType: type,
      mediaUrl,
      createdAt: new Date(),
      read: false,
    }

    setChatMessages([newMessage, ...chatMessages])
    setShowMediaPicker(false)
  }

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setEditCaption(post.caption)
    setShowEditPost(true)
  }

  const saveEditPost = () => {
    if (!editingPost) return

    const updatedPosts = posts.map((post) => (post.id === editingPost.id ? { ...post, caption: editCaption } : post))
    setPosts(updatedPosts)
    setShowEditPost(false)
    setEditingPost(null)
    setEditCaption("")

    toast({
      description: "Post updated successfully!",
    })
  }

  const handleDeletePost = (postId: string) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    setPosts(updatedPosts)

    toast({
      description: "Post deleted successfully!",
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Button>
                </div>
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Button>
                </div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b shadow-sm">
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
                  onFocus={() => !searchQuery && setShowSearchHistory(true)}
                />

                {/* Search Results */}
                {showSearch && (
                  <Card className="absolute top-full left-0 mt-2 w-full z-50 max-h-96 overflow-y-auto">
                    <CardContent className="p-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((searchUser) => {
                          const isAlreadyFriend = user?.friends?.includes(searchUser.id)
                          const hasPendingRequest = friendRequests.some(
                            (req) =>
                              req.fromUserId === currentUser?.uid &&
                              req.toUserId === searchUser.id &&
                              req.status === "pending",
                          )

                          return (
                            <div
                              key={searchUser.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                            >
                              <Link href={`/user/${searchUser.id}`}>
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={searchUser.profilePic || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    <UserIcon className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1">
                                <Link href={`/user/${searchUser.id}`}>
                                  <p className="font-semibold hover:text-blue-600">{searchUser.displayName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {searchUser.gender &&
                                      `${searchUser.gender.charAt(0).toUpperCase() + searchUser.gender.slice(1)} • `}
                                    {searchUser.email}
                                  </p>
                                  {searchUser.bio && (
                                    <p className="text-xs text-muted-foreground truncate">{searchUser.bio}</p>
                                  )}
                                </Link>
                                <div className="flex items-center gap-2 mt-1">
                                  <Users className="h-3 w-3" />
                                  <span className="text-xs text-muted-foreground">
                                    {searchUser.friends?.length || 0} friends
                                  </span>
                                  {(user?.friends || []).filter((friendId) =>
                                    (searchUser.friends || []).includes(friendId),
                                  ).length > 0 && (
                                    <span className="text-xs text-blue-600">
                                      •{" "}
                                      {
                                        (user?.friends || []).filter((friendId) =>
                                          (searchUser.friends || []).includes(friendId),
                                        ).length
                                      }{" "}
                                      mutual friends
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {!isAlreadyFriend && !hasPendingRequest && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      sendFriendRequest(searchUser.id)
                                    }}
                                  >
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    Add Friend
                                  </Button>
                                )}
                                {isAlreadyFriend && <Badge variant="secondary">Friends</Badge>}
                                {hasPendingRequest && <Badge variant="outline">Request Sent</Badge>}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    startChat(searchUser)
                                  }}
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground text-center p-4">No users found</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Search History */}
                {showSearchHistory && searchHistory.length > 0 && !searchQuery && (
                  <Card className="absolute top-full left-0 mt-2 w-full z-50 max-h-60 overflow-y-auto">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Recent searches</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchHistory([])
                            setShowSearchHistory(false)
                          }}
                        >
                          Clear all
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {searchHistory.slice(0, 5).map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                          onClick={() => handleSearch(search.query)}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{search.query}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right - Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b shadow-sm py-2">
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

      {/* Friend Requests Modal - Full Screen */}
      {showFriendRequests && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setShowFriendRequests(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Friend Requests</h1>
            </div>
            <div className="space-y-4">
              {friendRequests
                .filter((req) => req.status === "pending" && req.toUserId === currentUser?.uid)
                .map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={request.fromUser.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{request.fromUser.displayName}</p>
                          <p className="text-muted-foreground">{request.fromUser.email}</p>
                          {request.mutualFriends && request.mutualFriends > 0 && (
                            <p className="text-sm text-blue-600">{request.mutualFriends} mutual friends</p>
                          )}
                          <div className="flex gap-3 mt-3">
                            <Button onClick={() => acceptFriendRequest(request.id)}>Confirm</Button>
                            <Button variant="outline" onClick={() => declineFriendRequest(request.id)}>
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {friendRequests.filter((req) => req.status === "pending" && req.toUserId === currentUser?.uid).length ===
                0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No pending friend requests</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal - Full Screen */}
      {showNotifications && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setShowNotifications(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            <div className="space-y-4">
              {notifications.map((notif) => (
                <Card
                  key={notif.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !notif.read ? "border-blue-200 bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={notif.fromUser.profilePic || "/placeholder.svg"} />
                        <AvatarFallback>
                          <UserIcon className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notif.fromUser.displayName}</span> {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground">{getTimeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.read && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {notifications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No notifications</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inbox Modal - Full Screen */}
      {showInbox && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={() => setShowInbox(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">Chats</h1>
            </div>
            <div className="space-y-4">
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
                  <Card
                    key={friendId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => startChat(friend)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={friend.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-8 w-8" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-lg">{friend.displayName}</p>
                            {unreadCount > 0 && (
                              <Badge className="h-6 w-6 rounded-full p-0 text-xs">{unreadCount}</Badge>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-muted-foreground truncate">
                              {lastMessage.fromUserId === currentUser?.uid ? "You: " : ""}
                              {lastMessage.message}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {lastMessage ? getTimeAgo(lastMessage.createdAt) : "No messages"}
                          </p>
                        </div>
                        {friend.isOnline && <div className="w-4 h-4 bg-green-500 rounded-full"></div>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {(!user?.friends || user.friends.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No friends to chat with</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Chat Modal */}
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
                <div>
                  <CardTitle className="text-sm">{selectedChatUser.displayName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedChatUser.isOnline ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setShowVideoCall(true)}>
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {message.messageType === "text" && message.message}
                        {message.messageType === "voice" && (
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="p-1">
                              <Play className="h-3 w-3" />
                            </Button>
                            <span className="text-xs">{message.duration}s</span>
                            <audio controls className="hidden">
                              <source src={message.mediaUrl} />
                            </audio>
                          </div>
                        )}
                        {message.messageType === "image" && (
                          <img
                            src={message.mediaUrl || "/placeholder.svg"}
                            alt="Shared image"
                            className="max-w-full rounded"
                          />
                        )}
                        {message.messageType === "video" && (
                          <video controls className="max-w-full rounded">
                            <source src={message.mediaUrl} />
                          </video>
                        )}
                        {message.messageType === "song" && (
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            <span>Song shared</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Voice Recording UI */}
              {isRecordingVoice && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-red-100 dark:bg-red-900 rounded">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Recording... {recordingTime}s</span>
                  <Button size="sm" onClick={stopVoiceRecording}>
                    Stop
                  </Button>
                </div>
              )}

              {/* Media Picker */}
              {showMediaPicker && (
                <div className="flex gap-2 mb-2 p-2 border rounded">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) sendMediaMessage(file, "image")
                    }}
                    className="hidden"
                    id="image-input"
                  />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) sendMediaMessage(file, "video")
                    }}
                    className="hidden"
                    id="video-input"
                  />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) sendMediaMessage(file, "song")
                    }}
                    className="hidden"
                    id="audio-input"
                  />
                  <Button size="sm" onClick={() => document.getElementById("image-input")?.click()}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => document.getElementById("video-input")?.click()}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => document.getElementById("audio-input")?.click()}>
                    <Music className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowMediaPicker(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowMediaPicker(!showMediaPicker)}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                  className={isRecordingVoice ? "bg-red-500 text-white" : ""}
                >
                  🎤
                </Button>
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

      {/* Video Call Modal */}
      {showVideoCall && selectedChatUser && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 text-white">
              <p className="text-lg font-semibold">Video call with {selectedChatUser.displayName}</p>
              <p className="text-sm opacity-75">Calling...</p>
            </div>
            <div className="absolute top-4 right-4">
              <Button variant="destructive" onClick={() => setShowVideoCall(false)}>
                End Call
              </Button>
            </div>
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={selectedChatUser.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    <UserIcon className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                <p className="text-xl">Video calling {selectedChatUser.displayName}...</p>
                <p className="text-sm opacity-75 mt-2">This is a demo video call interface</p>
              </div>
            </div>
          </div>
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
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={editingProfile.gender}
                onChange={(e) => setEditingProfile({ ...editingProfile, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
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
              <Label>Audio File * (minimum 1 minute)</Label>
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

      {/* Edit Post Modal */}
      <Dialog open={showEditPost} onOpenChange={setShowEditPost}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Share Your Gossip With Us"
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={saveEditPost} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setShowEditPost(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Music Player at Bottom */}
      {currentSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 z-40">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <img
                src={currentSong.coverArt || "/placeholder.svg"}
                alt={currentSong.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{currentSong.title}</h4>
                <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[currentTime]}
                    max={currentSong.duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(currentSong.duration)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVolume(value[0])}
                    className="w-16"
                  />
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={currentSong.audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 py-6 ${currentSong ? "pb-24" : ""}`}>
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
                    placeholder="Share Your Gossip With Us"
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
                  {/* Post Header with Edit/Delete for own posts */}
                  <div className="flex items-center justify-between mb-4">
                    <Link href={`/user/${post.user.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <Avatar>
                          <AvatarImage src={post.user.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.user.displayName}</p>
                          <p className="text-sm text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
                        </div>
                      </div>
                    </Link>
                    {post.userId === currentUser?.uid ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  {post.caption && <p className="mb-4">{post.caption}</p>}

                  {post.mediaURL && (
                    <div className="mb-4">
                      {post.mediaType === "video" ? (
                        <video
                          controls
                          className="w-full rounded-lg"
                          onPlay={() => {
                            // Increment view count when video starts playing
                            const updatedPosts = posts.map((p) =>
                              p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p,
                            )
                            setPosts(updatedPosts)
                          }}
                        >
                          <source src={post.mediaURL} />
                        </video>
                      ) : post.mediaType === "song" && post.songData ? (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                          <div className="flex items-center gap-4">
                            <img
                              src={post.songData.coverArt || "/placeholder.svg"}
                              alt={post.songData.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{post.songData.title}</h3>
                              <p className="text-sm opacity-90">{post.songData.artist}</p>
                              <p className="text-xs opacity-75">{formatTime(post.songData.duration)}</p>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => playSong(post.songData!)}>
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.songData.streamCount} streams
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {post.songData.reactions.length} likes
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img src={post.mediaURL || "/placeholder.svg"} alt="Post media" className="w-full rounded-lg" />
                      )}
                    </div>
                  )}

                  {/* View Count for Videos */}
                  {post.mediaType === "video" && (
                    <div className="mb-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.viewCount || 0} views
                      </span>
                    </div>
                  )}

                  {/* Reactions Display */}
                  {post.reactions.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-1">
                        {Array.from(new Set(post.reactions.map((r) => r.emoji))).map((emoji, index) => (
                          <span key={index} className="text-sm bg-white dark:bg-gray-800 rounded-full border p-1">
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
                          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 flex gap-1 z-10">
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
                          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1">
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

        {currentPage === "videos" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Videos</h2>
            <div className="grid gap-6">
              {posts
                .filter((post) => post.mediaType === "video")
                .map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <Link href={`/user/${post.user.id}`}>
                        <div className="flex items-center gap-3 mb-4 cursor-pointer">
                          <Avatar>
                            <AvatarImage src={post.user.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{post.user.displayName}</p>
                            <p className="text-sm text-muted-foreground">{getTimeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                      </Link>
                      {post.caption && <p className="mb-4">{post.caption}</p>}
                      <video
                        controls
                        className="w-full rounded-lg mb-4"
                        onPlay={() => {
                          // Increment view count when video starts playing
                          const updatedPosts = posts.map((p) =>
                            p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p,
                          )
                          setPosts(updatedPosts)
                        }}
                      >
                        <source src={post.mediaURL} />
                      </video>

                      {/* View Count Above Reactions */}
                      <div className="mb-3">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount || 0} views
                        </span>
                      </div>

                      {/* Reactions Display */}
                      {post.reactions.length > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-1">
                            {Array.from(new Set(post.reactions.map((r) => r.emoji))).map((emoji, index) => (
                              <span key={index} className="text-sm bg-white dark:bg-gray-800 rounded-full border p-1">
                                {emoji}
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{post.reactions.length}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
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
                              Like ({post.reactions.length})
                            </Button>
                            {showReactions[post.id] && (
                              <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 flex gap-1 z-10">
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
                              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1">
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

        {currentPage === "music" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Music</h2>
              <Button onClick={() => setShowAddSong(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Song
              </Button>
            </div>

            {/* Trending Songs */}
            {getTrendingSongs().length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trending Songs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getTrendingSongs()
                    .slice(0, 5)
                    .map((song, index) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                        <img
                          src={song.coverArt || "/placeholder.svg"}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{song.title}</h3>
                          <p className="text-sm text-muted-foreground">{song.artist}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{song.streamCount} streams</span>
                            <span>{song.reactions.length} likes</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => playSong(song)}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* All Songs */}
            <Card>
              <CardHeader>
                <CardTitle>All Songs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {songs.map((song) => (
                  <div key={song.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
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
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={song.user.profilePic || "/placeholder.svg"} />
                        <AvatarFallback>
                          <UserIcon className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">Uploaded by {song.user.displayName}</span>
                      <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
                        <span>{song.streamCount} streams</span>
                        <span>{song.reactions.length} likes</span>
                        <span>{song.comments.length} comments</span>
                      </div>
                    </div>

                    {/* Song Reactions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex gap-4">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReactions({ ...showReactions, [song.id]: !showReactions[song.id] })}
                          >
                            <Heart
                              className={`h-4 w-4 mr-2 ${
                                song.reactions.some((r) => r.userId === currentUser?.uid)
                                  ? "fill-red-500 text-red-500"
                                  : ""
                              }`}
                            />
                            Like ({song.reactions.length})
                          </Button>
                          {showReactions[song.id] && (
                            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                              {reactionEmojis.map((reaction) => (
                                <button
                                  key={reaction.type}
                                  className="text-lg hover:scale-125 transition-transform"
                                  onClick={() => handleSongReaction(song.id, reaction.type)}
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Comment ({song.comments.length})
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {/* Song Comments */}
                    {song.comments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {song.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.profilePic || "/placeholder.svg"} />
                              <AvatarFallback>
                                <UserIcon className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1">
                              <p className="font-semibold text-sm">{comment.displayName}</p>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment to Song */}
                    <div className="flex items-center gap-2 mt-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                        <AvatarFallback>
                          <UserIcon className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        placeholder="Write a comment..."
                        value={commentInputs[song.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [song.id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSongComment(song.id, commentInputs[song.id] || "")
                            setCommentInputs({ ...commentInputs, [song.id]: "" })
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          handleSongComment(song.id, commentInputs[song.id] || "")
                          setCommentInputs({ ...commentInputs, [song.id]: "" })
                        }}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {songs.length === 0 && (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No songs uploaded yet. Be the first to share your music!</p>
                  </div>
                )}
              </CardContent>
            </Card>
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

        {currentPage === "profile" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Cover Photo */}
            <Card>
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
                <div className="absolute bottom-4 left-4 flex items-end gap-4">
                  <Avatar className="h-32 w-32 border-4 border-white">
                    <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                    <AvatarFallback>
                      <UserIcon className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white mb-4">
                    <h1 className="text-3xl font-bold">{user?.displayName}</h1>
                    <p className="text-lg opacity-90">{user?.friends?.length || 0} friends</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-16">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    {user?.bio && <p className="text-lg mb-2">{user.bio}</p>}
                    {user?.interests && (
                      <p className="text-muted-foreground">
                        <strong>Interests:</strong> {user.interests}
                      </p>
                    )}
                    {user?.gender && (
                      <p className="text-muted-foreground">
                        <strong>Gender:</strong> {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{user?.isOnline ? "Online" : "Offline"}</Badge>
                      <span className="text-sm text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingProfile({
                        displayName: user?.displayName || "",
                        bio: user?.bio || "",
                        interests: user?.interests || "",
                        profilePic: "",
                        gender: user?.gender || "",
                      })
                      setShowProfileEdit(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {posts.filter((post) => post.userId === currentUser?.uid).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{user?.friends?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Friends</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {songs.filter((song) => song.userId === currentUser?.uid).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Songs</p>
                </CardContent>
              </Card>
            </div>

            {/* User's Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts
                    .filter((post) => post.userId === currentUser?.uid)
                    .map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`}>
                        <div className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                          {post.mediaURL && (
                            <div className="mb-2">
                              {post.mediaType === "video" ? (
                                <video className="w-full h-32 object-cover rounded">
                                  <source src={post.mediaURL} />
                                </video>
                              ) : post.mediaType === "song" && post.songData ? (
                                <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                                  <Music className="h-8 w-8 text-white" />
                                </div>
                              ) : (
                                <img
                                  src={post.mediaURL || "/placeholder.svg"}
                                  alt="Post media"
                                  className="w-full h-32 object-cover rounded"
                                />
                              )}
                            </div>
                          )}
                          {post.caption && <p className="text-sm mb-2 line-clamp-2">{post.caption}</p>}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{getTimeAgo(post.createdAt)}</span>
                            <div className="flex gap-2">
                              <span>{post.reactions.length} ❤️</span>
                              <span>{post.comments.length} 💬</span>
                              {post.mediaType === "video" && <span>{post.viewCount || 0} 👁️</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  {posts.filter((post) => post.userId === currentUser?.uid).length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <p className="text-muted-foreground">You haven't posted anything yet.</p>
                    </div>
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
