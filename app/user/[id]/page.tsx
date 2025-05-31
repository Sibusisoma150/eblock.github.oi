"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, UserPlus, MessageSquare, Users, UserIcon, Heart, MessageCircle, Share } from "lucide-react"
import Link from "next/link"

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
  reactions: any[]
  comments: any[]
  createdAt: any
  user: UserType
  viewCount?: number
}

export default function UserProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<UserType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = params.id as string
    const savedUsers = localStorage.getItem("allUsers")
    const savedPosts = localStorage.getItem("posts")
    const savedCurrentUser = localStorage.getItem("currentUser")

    if (savedUsers) {
      const users: UserType[] = JSON.parse(savedUsers)
      const foundUser = users.find((u) => u.id === userId)
      setUser(foundUser || null)
    }

    if (savedPosts) {
      const allPosts: Post[] = JSON.parse(savedPosts)
      const userPosts = allPosts.filter((p) => p.userId === userId)
      setPosts(userPosts)
    }

    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser))
    }

    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isFriend = currentUser && user.friends?.includes(currentUser.id)
  const isOwnProfile = currentUser && currentUser.id === user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.profilePic || "/placeholder.svg"} />
                <AvatarFallback>
                  <UserIcon className="h-16 w-16" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{user.displayName}</h1>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                {user.bio && <p className="mb-2">{user.bio}</p>}
                {user.interests && (
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Interests:</strong> {user.interests}
                  </p>
                )}

                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <Badge variant="secondary">{user.isOnline ? "Online" : "Offline"}</Badge>
                  <span className="text-sm text-muted-foreground">
                    <Users className="h-4 w-4 inline mr-1" />
                    {user.friends?.length || 0} friends
                  </span>
                  <span className="text-sm text-muted-foreground">{posts.length} posts</span>
                </div>

                {!isOwnProfile && (
                  <div className="flex gap-2">
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isFriend ? "Friends" : "Add Friend"}
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profilePic || "/placeholder.svg"} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

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

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 mr-2" />
                        {post.reactions.length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments.length}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    {post.mediaType === "video" && (
                      <span className="text-sm text-muted-foreground">{post.viewCount || 0} views</span>
                    )}
                  </div>
                </div>
              ))}

              {posts.length === 0 && <p className="text-center text-muted-foreground py-8">No posts yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
