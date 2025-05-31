"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import {
  MessageCircle,
  Share2,
  Moon,
  Sun,
  UserIcon,
  Video,
  ImageIcon,
  X,
  Bell,
  MessageSquare,
  UserPlus,
  Home,
  Newspaper,
  Play,
  Plus,
  Search,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Music,
  Users,
  Eye,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Phone,
  VideoIcon,
} from "lucide-react"

interface UserType {
  id: string
  email: string
  displayName: string
  profilePic: string
  isOnline?: boolean
  friends?: string[]
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
  createdAt: Date
}

interface Post {
  id: string
  userId: string
  caption: string
  mediaURL: string
  mediaType: "image" | "video" | ""
  reactions: Reaction[]
  comments: Comment[]
  createdAt: Date
  user: UserType
  viewCount?: number
}

interface Story {
  id: string
  userId: string
  mediaURL: string
  mediaType: "image" | "video"
  createdAt: Date
  user: UserType
}

interface FriendRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromUser: UserType
  status: "pending" | "accepted" | "declined"
  mutualFriends?: number
}

interface ChatMessage {
  id: string
  fromUserId: string
  toUserId: string
  message: string
  createdAt: Date
  read: boolean
}

interface Notification {
  id: string
  type: "like" | "comment" | "friend_request" | "friend_accept"
  fromUserId: string
  fromUser: UserType
  postId?: string
  message: string
  createdAt: Date
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

export default function MzansiGossipClub() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [currentPage, setCurrentPage] = useState<"home" | "news" | "profile" | "music">("home")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [caption, setCaption] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [showReactions, setShowReactions] = useState<{ [key: string]: boolean }>({})
  const [showNewsReactions, setShowNewsReactions] = useState<{ [key: string]: boolean }>({})
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedChatUser, setSelectedChatUser] = useState<UserType | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [notification, setNotification] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profilePicInputRef = useRef<HTMLInputElement>(null)
  const storyInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [editingProfile, setEditingProfile] = useState({ displayName: "", profilePic: "" })
  const [showUserProfile, setShowUserProfile] = useState<UserType | null>(null)
  const [allUsers, setAllUsers] = useState<UserType[]>([])
  const [showInbox, setShowInbox] = useState(false)
  const [activeChats, setActiveChats] = useState<UserType[]>([])
  const [newsComments, setNewsComments] = useState<{ [key: string]: Comment[] }>({})
  const [newsReactions, setNewsReactions] = useState<{ [key: string]: Reaction[] }>({})
  const [newsCommentInputs, setNewsCommentInputs] = useState<{ [key: string]: string }>({})
  const [newsViewCounts, setNewsViewCounts] = useState<{ [key: string]: number }>({})
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(80)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [unreadMessages, setUnreadMessages] = useState<{ [userId: string]: number }>({})

  const reactionEmojis = [
    { type: "like", emoji: "👍", color: "text-blue-500" },
    { type: "love", emoji: "❤️", color: "text-red-500" },
    { type: "laugh", emoji: "😂", color: "text-yellow-500" },
    { type: "wow", emoji: "😮", color: "text-orange-500" },
    { type: "sad", emoji: "😢", color: "text-blue-400" },
    { type: "angry", emoji: "😡", color: "text-red-600" },
  ]

  // Mock users
  const mockUsers: UserType[] = [
    {
      id: "user1",
      email: "thabo@example.com",
      displayName: "Thabo M",
      profilePic: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      friends: ["user2", "user3"],
    },
    {
      id: "user2",
      email: "nomsa@example.com",
      displayName: "Nomsa K",
      profilePic: "/placeholder.svg?height=40&width=40",
      isOnline: false,
      friends: ["user1", "user3"],
    },
    {
      id: "user3",
      email: "sipho@example.com",
      displayName: "Sipho D",
      profilePic: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      friends: ["user1", "user2"],
    },
    {
      id: "user4",
      email: "lerato@example.com",
      displayName: "Lerato M",
      profilePic: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      friends: ["user2"],
    },
    {
      id: "user5",
      email: "tumi@example.com",
      displayName: "Tumi N",
      profilePic: "/placeholder.svg?height=40&width=40",
      isOnline: false,
      friends: ["user3"],
    },
  ]

  // Mock celebrity news
  const celebrityNews = [
    {
      id: "news1",
      title: "Bonang Matheba's New Business Venture",
      description: "The media personality announces her latest investment in tech startups",
      thumbnail: "/placeholder.svg?height=200&width=300",
      videoUrl: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "news2",
      title: "Cassper Nyovest Studio Session",
      description: "Behind the scenes of his latest album recording",
      thumbnail: "/placeholder.svg?height=200&width=300",
      videoUrl: "/placeholder.svg?height=400&width=600",
    },
  ]

  // Mock video shorts
  const videoShorts = [
    {
      id: "short1",
      title: "Dance Challenge",
      thumbnail: "/placeholder.svg?height=300&width=200",
      user: mockUsers[0],
    },
    {
      id: "short2",
      title: "Comedy Skit",
      thumbnail: "/placeholder.svg?height=300&width=200",
      user: mockUsers[1],
    },
  ]

  // Mock songs
  const mockSongs: Song[] = [
    {
      id: "song1",
      title: "Jerusalema",
      artist: "Master KG ft. Nomcebo",
      album: "Jerusalema Album",
      coverArt: "/placeholder.svg?height=300&width=300",
      audioUrl: "https://example.com/audio/jerusalema.mp3",
      duration: 240,
      genre: "Afro House",
    },
    {
      id: "song2",
      title: "Osama",
      artist: "Zakes Bantwini",
      album: "Ghetto King",
      coverArt: "/placeholder.svg?height=300&width=300",
      audioUrl: "https://example.com/audio/osama.mp3",
      duration: 320,
      genre: "Afro House",
    },
    {
      id: "song3",
      title: "Dali",
      artist: "Daliwonga",
      album: "Daliwonga",
      coverArt: "/placeholder.svg?height=300&width=300",
      audioUrl: "https://example.com/audio/dali.mp3",
      duration: 280,
      genre: "Amapiano",
    },
    {
      id: "song4",
      title: "Asibe Happy",
      artist: "Kabza De Small & DJ Maphorisa",
      album: "Scorpion Kings",
      coverArt: "/placeholder.svg?height=300&width=300",
      audioUrl: "https://example.com/audio/asibehappy.mp3",
      duration: 310,
      genre: "Amapiano",
    },
  ]

  const mockPosts: Post[] = []
  const mockStories: Story[] = []
  const mockFriendRequests: FriendRequest[] = [
    {
      id: "req1",
      fromUserId: "user2",
      toUserId: "current-user",
      fromUser: mockUsers[1],
      status: "pending",
      mutualFriends: 3,
    },
    {
      id: "req2",
      fromUserId: "user3",
      toUserId: "current-user",
      fromUser: mockUsers[2],
      status: "pending",
      mutualFriends: 1,
    },
  ]
  const mockNotifications: Notification[] = []
  const mockChatMessages: ChatMessage[] = [
    {
      id: "msg1",
      fromUserId: "user1",
      toUserId: "current-user",
      message: "Hey, how are you?",
      createdAt: new Date(Date.now() - 3600000),
      read: false,
    },
    {
      id: "msg2",
      fromUserId: "user2",
      toUserId: "current-user",
      message: "Did you see the latest gossip?",
      createdAt: new Date(Date.now() - 7200000),
      read: false,
    },
  ]

  useEffect(() => {
    // Load data from localStorage
    const savedPosts = loadFromStorage("posts", [])
    const savedStories = loadFromStorage("stories", [])
    const savedUsers = loadFromStorage("allUsers", mockUsers)
    const savedFriendRequests = loadFromStorage("friendRequests", mockFriendRequests)
    const savedNotifications = loadFromStorage("notifications", [])
    const savedChatMessages = loadFromStorage("chatMessages", mockChatMessages)
    const savedNewsComments = loadFromStorage("newsComments", {})
    const savedNewsReactions = loadFromStorage("newsReactions", {})
    const savedNewsViewCounts = loadFromStorage("newsViewCounts", {})
    const savedDarkMode = loadFromStorage("darkMode", false)

    // Initialize with saved data or mock data
    setPosts(savedPosts.length > 0 ? savedPosts : mockPosts)
    setStories(savedStories.length > 0 ? savedStories : mockStories)
    setAllUsers(savedUsers)
    setFriendRequests(savedFriendRequests)
    setNotifications(savedNotifications.length > 0 ? savedNotifications : mockNotifications)
    setChatMessages(savedChatMessages)
    setNewsComments(savedNewsComments)
    setNewsReactions(savedNewsReactions)
    setNewsViewCounts(savedNewsViewCounts)
    setDarkMode(savedDarkMode)
    setSongs(mockSongs)

    // Calculate unread messages
    const unread: { [userId: string]: number } = {}
    savedChatMessages.forEach((msg: ChatMessage) => {
      if (msg.toUserId === "current-user" && !msg.read) {
        unread[msg.fromUserId] = (unread[msg.fromUserId] || 0) + 1
      }
    })
    setUnreadMessages(unread)
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    saveToStorage("posts", posts)
  }, [posts])

  useEffect(() => {
    saveToStorage("stories", stories)
  }, [stories])

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
    saveToStorage("newsComments", newsComments)
  }, [newsComments])

  useEffect(() => {
    saveToStorage("newsReactions", newsReactions)
  }, [newsReactions])

  useEffect(() => {
    saveToStorage("newsViewCounts", newsViewCounts)
  }, [newsViewCounts])

  useEffect(() => {
    saveToStorage("darkMode", darkMode)
  }, [darkMode])

  // Audio player controls
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          setIsPlaying(false)
        })
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentSong])

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

  const showNotificationMessage = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(""), 3000)
  }

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter both email and password.")
      return
    }

    const mockUser: UserType = {
      id: "current-user",
      email,
      displayName: email.split("@")[0],
      profilePic: "/placeholder.svg?height=40&width=40",
      isOnline: true,
      friends: [],
    }
    setUser(mockUser)
    showNotificationMessage("Logged in successfully!")
    setEmail("")
    setPassword("")
  }

  const handleReaction = (postId: string, reactionType: string) => {
    if (!user) return

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const existingReaction = post.reactions.find((r) => r.userId === user.id)
          const newReactions = post.reactions.filter((r) => r.userId !== user.id)

          if (!existingReaction || existingReaction.type !== reactionType) {
            const emoji = reactionEmojis.find((r) => r.type === reactionType)?.emoji || "👍"
            newReactions.push({
              type: reactionType as any,
              userId: user.id,
              emoji,
            })
          }

          return { ...post, reactions: newReactions }
        }
        return post
      }),
    )

    setShowReactions({ ...showReactions, [postId]: false })
  }

  const handleNewsReaction = (newsId: string, reactionType: string) => {
    if (!user) return

    const currentReactions = newsReactions[newsId] || []
    const existingReaction = currentReactions.find((r) => r.userId === user.id)
    const newReactions = currentReactions.filter((r) => r.userId !== user.id)

    if (!existingReaction || existingReaction.type !== reactionType) {
      const emoji = reactionEmojis.find((r) => r.type === reactionType)?.emoji || "👍"
      newReactions.push({
        type: reactionType as any,
        userId: user.id,
        emoji,
      })
    }

    setNewsReactions({
      ...newsReactions,
      [newsId]: newReactions,
    })

    setShowNewsReactions({ ...showNewsReactions, [newsId]: false })
  }

  const handleStoryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
      const newStory: Story = {
        id: Date.now().toString(),
        userId: user.id,
        mediaURL: URL.createObjectURL(file),
        mediaType: file.type.startsWith("video") ? "video" : "image",
        createdAt: new Date(),
        user,
      }
      setStories([newStory, ...stories])
      showNotificationMessage("Story uploaded!")
    }
  }

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
      const imageUrl = URL.createObjectURL(file)
      setEditingProfile({ ...editingProfile, profilePic: imageUrl })
    }
  }

  const acceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find((req) => req.id === requestId)
    if (request && user) {
      // Update friend request status
      setFriendRequests(friendRequests.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req)))

      // Update user's friends list
      const updatedUser = {
        ...user,
        friends: [...(user.friends || []), request.fromUserId],
      }
      setUser(updatedUser)

      // Update the other user's friends list
      setAllUsers(
        allUsers.map((u) => (u.id === request.fromUserId ? { ...u, friends: [...(u.friends || []), user.id] } : u)),
      )

      // Add notification
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "friend_accept",
        fromUserId: user.id,
        fromUser: user,
        message: "accepted your friend request",
        createdAt: new Date(),
        read: false,
      }
      setNotifications([...notifications, newNotification])

      showNotificationMessage("Friend request accepted!")
    }
  }

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedChatUser || !user) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      fromUserId: user.id,
      toUserId: selectedChatUser.id,
      message: chatInput,
      createdAt: new Date(),
      read: false,
    }

    setChatMessages([...chatMessages, newMessage])
    setChatInput("")
  }

  const markMessagesAsRead = (fromUserId: string) => {
    setChatMessages(
      chatMessages.map((msg) =>
        msg.fromUserId === fromUserId && msg.toUserId === user?.id ? { ...msg, read: true } : msg,
      ),
    )

    // Update unread count
    setUnreadMessages({ ...unreadMessages, [fromUserId]: 0 })
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const results = allUsers.filter(
        (user) =>
          user.displayName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()),
      )
      setSearchResults(results)
      setShowSearch(true)
    } else {
      setShowSearch(false)
      setSearchResults([])
    }
  }

  const handleProfileEdit = () => {
    if (!user) return

    const updatedUser = { ...user, ...editingProfile }
    setUser(updatedUser)

    // Update user in allUsers array
    setAllUsers(allUsers.map((u) => (u.id === user.id ? updatedUser : u)))

    // Update user in posts
    setPosts(posts.map((post) => (post.userId === user.id ? { ...post, user: updatedUser } : post)))

    // Update user in stories
    setStories(stories.map((story) => (story.userId === user.id ? { ...story, user: updatedUser } : story)))

    // Update user in comments
    setPosts(
      posts.map((post) => ({
        ...post,
        comments: post.comments.map((comment) =>
          comment.userId === user.id
            ? { ...comment, displayName: updatedUser.displayName, profilePic: updatedUser.profilePic }
            : comment,
        ),
      })),
    )

    setShowProfileEdit(false)
    showNotificationMessage("Profile updated successfully!")
  }

  const generateShareLink = (type: "post" | "video", id: string) => {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/share/${type}/${id}`

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showNotificationMessage("Link copied to clipboard!")
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        showNotificationMessage("Link copied to clipboard!")
      })
  }

  const handleNewsComment = (newsId: string) => {
    const commentText = newsCommentInputs[newsId]?.trim()
    if (!commentText || !user) return

    const newComment: Comment = {
      id: `nc${Date.now()}`,
      text: commentText,
      userId: user.id,
      displayName: user.displayName,
      profilePic: user.profilePic,
      createdAt: new Date(),
    }

    setNewsComments({
      ...newsComments,
      [newsId]: [...(newsComments[newsId] || []), newComment],
    })

    setNewsCommentInputs({ ...newsCommentInputs, [newsId]: "" })
    showNotificationMessage("Comment added!")
  }

  const incrementVideoViews = (newsId: string) => {
    setNewsViewCounts({
      ...newsViewCounts,
      [newsId]: (newsViewCounts[newsId] || 0) + 1,
    })
  }

  const startChat = (chatUser: UserType) => {
    setSelectedChatUser(chatUser)
    setShowChat(true)
    setShowInbox(false)

    // Mark messages as read
    markMessagesAsRead(chatUser.id)

    // Add to active chats if not already there
    if (!activeChats.find((u) => u.id === chatUser.id)) {
      setActiveChats([...activeChats, chatUser])
    }
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const downloadSong = (song: Song) => {
    // In a real app, this would trigger a download
    // For now, we'll just show a notification
    showNotificationMessage(`Downloading ${song.title}...`)
  }

  const countMutualFriends = (otherUserId: string) => {
    if (!user || !user.friends) return 0
    const otherUser = allUsers.find((u) => u.id === otherUserId)
    if (!otherUser || !otherUser.friends) return 0

    const mutualCount = user.friends.filter((friendId) => otherUser.friends?.includes(friendId)).length
    return mutualCount
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-blue-600">TheMzansiGossipClub</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1">
                Login
              </Button>
              <Button onClick={handleLogin} variant="outline" className="flex-1">
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
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
                />
                {showSearch && searchResults.length > 0 && (
                  <Card className="absolute top-full left-0 mt-2 w-full z-50 max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                      {searchResults.map((searchUser) => (
                        <div
                          key={searchUser.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => {
                            setShowUserProfile(searchUser)
                            setShowSearch(false)
                            setSearchQuery("")
                          }}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={searchUser.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">{searchUser.displayName}</p>
                            <p className="text-xs text-muted-foreground">{searchUser.email}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Center - Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant={currentPage === "home" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("home")}
              >
                <Home className="h-4 w-4" />
              </Button>
              <Button
                variant={currentPage === "news" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("news")}
              >
                <Newspaper className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant={currentPage === "music" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("music")}
              >
                <Music className="h-4 w-4" />
              </Button>
            </div>

            {/* Right - User Actions */}
            <div className="flex items-center gap-2">
              {/* Friend Requests */}
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowFriendRequests(!showFriendRequests)}>
                  <UserPlus className="h-4 w-4" />
                  {friendRequests.filter((req) => req.status === "pending").length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {friendRequests.filter((req) => req.status === "pending").length}
                    </Badge>
                  )}
                </Button>
                {showFriendRequests && (
                  <Card className="absolute top-full right-0 mt-2 w-80 z-50">
                    <CardHeader>
                      <CardTitle className="text-sm">Friend Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {friendRequests
                        .filter((req) => req.status === "pending")
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
                              {request.mutualFriends && request.mutualFriends > 0 && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {request.mutualFriends} mutual friend{request.mutualFriends !== 1 ? "s" : ""}
                                </p>
                              )}
                              <div className="flex gap-2 mt-1">
                                <Button size="sm" onClick={() => acceptFriendRequest(request.id)}>
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline">
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      {friendRequests.filter((req) => req.status === "pending").length === 0 && (
                        <p className="text-sm text-muted-foreground">No pending requests</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Chat */}
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowInbox(!showInbox)}>
                  <MessageSquare className="h-4 w-4" />
                  {Object.values(unreadMessages).reduce((a, b) => a + b, 0) > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {Object.values(unreadMessages).reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="h-4 w-4" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </Button>
                {showNotifications && (
                  <Card className="absolute top-full right-0 mt-2 w-80 z-50">
                    <CardHeader>
                      <CardTitle className="text-sm">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`flex items-center gap-3 p-2 rounded ${!notif.read ? "bg-blue-50" : ""}`}
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
                            <p className="text-xs text-muted-foreground">{notif.createdAt.toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <Avatar
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => {
                    setEditingProfile({ displayName: user.displayName, profilePic: user.profilePic })
                    setShowProfileEdit(true)
                  }}
                >
                  <AvatarImage src={user.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Dark Mode */}
              <Button variant="ghost" size="sm" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {currentPage === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* Stories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Add Story */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-16 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                        onClick={() => storyInputRef.current?.click()}
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Add</span>
                      </div>
                      <input
                        ref={storyInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleStoryUpload}
                        className="hidden"
                      />
                    </div>

                    {/* Existing Stories */}
                    {stories.map((story) => (
                      <div key={story.id} className="flex-shrink-0 relative">
                        <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-blue-500">
                          <img
                            src={story.mediaURL || "/placeholder.svg"}
                            alt="Story"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Avatar className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-6 w-6 border-2 border-white">
                          <AvatarImage src={story.user.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-center mt-1 truncate w-16">{story.user.displayName}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Video Shorts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Video Shorts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {videoShorts.map((short) => (
                      <div
                        key={short.id}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden relative">
                          <img
                            src={short.thumbnail || "/placeholder.svg"}
                            alt={short.title}
                            className="w-full h-full object-cover"
                          />
                          <Play className="absolute inset-0 m-auto h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{short.title}</p>
                          <p className="text-xs text-muted-foreground">{short.user.displayName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={user.profilePic || "/placeholder.svg"} />
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
                    <Button
                      onClick={() => {
                        if (caption.trim() || selectedFile) {
                          const newPost: Post = {
                            id: Date.now().toString(),
                            userId: user.id,
                            caption,
                            mediaURL: previewUrl,
                            mediaType: selectedFile?.type.startsWith("video") ? "video" : selectedFile ? "image" : "",
                            reactions: [],
                            comments: [],
                            createdAt: new Date(),
                            user,
                            viewCount: 0,
                          }
                          setPosts([newPost, ...posts])
                          setCaption("")
                          setSelectedFile(null)
                          setPreviewUrl("")
                          showNotificationMessage("Post shared!")
                        }
                      }}
                    >
                      Post
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setSelectedFile(file)
                        setPreviewUrl(URL.createObjectURL(file))
                      }
                    }}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={post.user.profilePic || "/placeholder.svg"} />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{post.user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{post.createdAt.toLocaleDateString()} • 🌍</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <p className="mb-4">{post.caption}</p>
                    {post.mediaURL && (
                      <>
                        {post.mediaType === "video" ? (
                          <div className="relative">
                            <video
                              controls
                              className="w-full rounded-lg mb-4"
                              onPlay={() => {
                                setPosts(
                                  posts.map((p) =>
                                    p.id === post.id ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p,
                                  ),
                                )
                              }}
                            >
                              <source src={post.mediaURL} />
                            </video>
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.viewCount || 0}
                            </div>
                          </div>
                        ) : (
                          <img
                            src={post.mediaURL || "/placeholder.svg"}
                            alt="Post media"
                            className="w-full rounded-lg mb-4"
                          />
                        )}
                      </>
                    )}

                    {/* Reaction Summary */}
                    {post.reactions.length > 0 && (
                      <div className="flex items-center justify-between mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1">
                            {[...new Set(post.reactions.map((r) => r.emoji))].slice(0, 3).map((emoji, index) => (
                              <span key={index} className="text-lg">
                                {emoji}
                              </span>
                            ))}
                          </div>
                          <span>{post.reactions.length}</span>
                        </div>
                        <div className="flex gap-4">
                          <span>{post.comments.length} comments</span>
                          <span>0 shares</span>
                        </div>
                      </div>
                    )}

                    <Separator className="mb-3" />

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReactions({ ...showReactions, [post.id]: !showReactions[post.id] })}
                          className="flex items-center gap-2"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          Like
                        </Button>
                        {showReactions[post.id] && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-full shadow-lg p-2 flex gap-1 z-10">
                            {reactionEmojis.map((reaction) => (
                              <button
                                key={reaction.type}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                                onClick={() => handleReaction(post.id, reaction.type)}
                              >
                                {reaction.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comment
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => generateShareLink("post", post.id)}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Comments */}
                    <div className="space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p className="font-semibold text-sm">{comment.displayName}</p>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <button className="hover:underline">Like</button>
                              <button className="hover:underline">Reply</button>
                              <span>{comment.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                const text = commentInputs[post.id]?.trim()
                                if (text) {
                                  const newComment: Comment = {
                                    id: Date.now().toString(),
                                    text,
                                    userId: user.id,
                                    displayName: user.displayName,
                                    profilePic: user.profilePic,
                                    createdAt: new Date(),
                                  }
                                  setPosts(
                                    posts.map((p) =>
                                      p.id === post.id ? { ...p, comments: [...p.comments, newComment] } : p,
                                    ),
                                  )
                                  setCommentInputs({ ...commentInputs, [post.id]: "" })
                                }
                              }
                            }}
                          />
                          <Button size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Online Friends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Online Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allUsers
                      .filter((u) => u.isOnline && u.id !== user.id)
                      .map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          onClick={() => {
                            setSelectedChatUser(friend)
                            setShowChat(true)
                          }}
                        >
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={friend.profilePic || "/placeholder.svg"} />
                              <AvatarFallback>
                                <UserIcon className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                          </div>
                          <span className="text-sm font-medium">{friend.displayName}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentPage === "news" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Trending Celebrity News</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {celebrityNews.map((news) => (
                <Card key={news.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={news.thumbnail || "/placeholder.svg"}
                      alt={news.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      className="absolute inset-0 m-auto h-12 w-12 rounded-full"
                      onClick={() => incrementVideoViews(news.id)}
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {newsViewCounts[news.id] || 0}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-2">{news.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{news.description}</p>

                    {/* Video Interactions */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowNewsReactions({ ...showNewsReactions, [news.id]: !showNewsReactions[news.id] })
                          }
                          className="flex items-center gap-2"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{(newsReactions[news.id] || []).length}</span>
                        </Button>
                        {showNewsReactions[news.id] && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-full shadow-lg p-2 flex gap-1 z-10">
                            {reactionEmojis.map((reaction) => (
                              <button
                                key={reaction.type}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                                onClick={() => handleNewsReaction(news.id, reaction.type)}
                              >
                                {reaction.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{(newsComments[news.id] || []).length}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => generateShareLink("video", news.id)}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Reaction Summary */}
                    {(newsReactions[news.id] || []).length > 0 && (
                      <div className="flex items-center mb-3 text-sm text-muted-foreground">
                        <div className="flex -space-x-1 mr-2">
                          {[...new Set((newsReactions[news.id] || []).map((r) => r.emoji))]
                            .slice(0, 3)
                            .map((emoji, index) => (
                              <span key={index} className="text-lg">
                                {emoji}
                              </span>
                            ))}
                        </div>
                        <span>{(newsReactions[news.id] || []).length} reactions</span>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="space-y-3">
                      {(newsComments[news.id] || []).map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={comment.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-2 w-2" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-2">
                              <p className="font-semibold text-xs">{comment.displayName}</p>
                              <p className="text-xs">{comment.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add Comment */}
                      <div className="flex gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user?.profilePic || "/placeholder.svg"} />
                          <AvatarFallback>
                            <UserIcon className="h-2 w-2" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-1">
                          <Input
                            placeholder="Add a comment..."
                            size="sm"
                            value={newsCommentInputs[news.id] || ""}
                            onChange={(e) => setNewsCommentInputs({ ...newsCommentInputs, [news.id]: e.target.value })}
                            onKeyPress={(e) => e.key === "Enter" && handleNewsComment(news.id)}
                          />
                          <Button size="sm" onClick={() => handleNewsComment(news.id)}>
                            <Send className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentPage === "music" && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Music Streaming</h2>

            {/* Music Player */}
            {currentSong && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentSong.coverArt || "/placeholder.svg"}
                      alt={currentSong.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{currentSong.title}</h3>
                      <p className="text-muted-foreground">{currentSong.artist}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={togglePlayPause}>
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        max={100}
                        step={1}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Slider
                      value={[currentTime]}
                      onValueChange={handleSeek}
                      max={currentSong.duration}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(currentSong.duration)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Songs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {songs.map((song) => (
                <Card key={song.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={song.coverArt || "/placeholder.svg"}
                      alt={song.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button className="absolute inset-0 m-auto h-12 w-12 rounded-full" onClick={() => playSong(song)}>
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-1 truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1 truncate">{song.artist}</p>
                    <p className="text-xs text-muted-foreground mb-3">{song.genre}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{formatTime(song.duration)}</span>
                      <Button variant="ghost" size="sm" onClick={() => downloadSong(song)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Audio Element */}
            {currentSong && (
              <audio
                ref={audioRef}
                src={currentSong.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Beautiful Inbox Modal */}
      {showInbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chats
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowInbox(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {allUsers
                    .filter((u) => u.id !== user?.id)
                    .map((chatUser) => (
                      <div
                        key={chatUser.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => startChat(chatUser)}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={chatUser.profilePic || "/placeholder.svg"} />
                            <AvatarFallback>
                              <UserIcon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          {chatUser.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold truncate">{chatUser.displayName}</p>
                            {unreadMessages[chatUser.id] > 0 && (
                              <Badge className="h-5 w-5 rounded-full p-0 text-xs">{unreadMessages[chatUser.id]}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {chatUser.isOnline ? "Active now" : "Offline"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedChatUser && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b bg-blue-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedChatUser.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    <UserIcon className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                {selectedChatUser.isOnline && (
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <span className="font-semibold text-sm">{selectedChatUser.displayName}</span>
                <p className="text-xs text-muted-foreground">{selectedChatUser.isOnline ? "Active now" : "Offline"}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <VideoIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-64 p-3">
            <div className="space-y-3">
              {chatMessages
                .filter(
                  (msg) =>
                    (msg.fromUserId === user.id && msg.toUserId === selectedChatUser.id) ||
                    (msg.fromUserId === selectedChatUser.id && msg.toUserId === user.id),
                )
                .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.fromUserId === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs p-2 rounded-lg ${
                        message.fromUserId === user.id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-100 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>

          <div className="p-3 border-t bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button size="sm" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={editingProfile.profilePic || user.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    <UserIcon className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={() => profilePicInputRef.current?.click()}>
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
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={editingProfile.displayName}
                  onChange={(e) => setEditingProfile({ ...editingProfile, displayName: e.target.value })}
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowUserProfile(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={showUserProfile.profilePic || "/placeholder.svg"} />
                  <AvatarFallback>
                    <UserIcon className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                {showUserProfile.isOnline && (
                  <div className="absolute bottom-2 right-1/2 transform translate-x-8 h-6 w-6 bg-green-500 rounded-full border-4 border-white"></div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold">{showUserProfile.displayName}</h3>
                <p className="text-muted-foreground">{showUserProfile.email}</p>
                <p className="text-sm text-muted-foreground">{countMutualFriends(showUserProfile.id)} mutual friends</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startChat(showUserProfile)} className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom">
          {notification}
        </div>
      )}
    </div>
  )
}
