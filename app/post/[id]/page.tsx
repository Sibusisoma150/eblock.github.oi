"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Heart, MessageCircle, Share, UserIcon } from "lucide-react"
import Link from "next/link"

interface Post {
  id: string
  userId: string
  caption: string
  mediaURL: string
  mediaType: "image" | "video" | ""
  reactions: any[]
  comments: any[]
  createdAt: any
  user: any
  viewCount?: number
}

export default function PostPage() {
  const params = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const postId = params.id as string
    const savedPosts = localStorage.getItem("posts")

    if (savedPosts) {
      const posts: Post[] = JSON.parse(savedPosts)
      const foundPost = posts.find((p) => p.id === postId)

      if (foundPost) {
        // Increment view count
        const updatedPosts = posts.map((p) => (p.id === postId ? { ...p, viewCount: (p.viewCount || 0) + 1 } : p))
        localStorage.setItem("posts", JSON.stringify(updatedPosts))
        setPost({ ...foundPost, viewCount: (foundPost.viewCount || 0) + 1 })
      }
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-4">
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={post.user.profilePic || "/placeholder.svg"} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.user.displayName}</p>
                <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
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

            {/* Post Stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>{post.reactions.length} reactions</span>
              <div className="flex gap-4">
                <span>{post.comments.length} comments</span>
                {post.mediaType === "video" && <span>{post.viewCount || 0} views</span>}
              </div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comment
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
