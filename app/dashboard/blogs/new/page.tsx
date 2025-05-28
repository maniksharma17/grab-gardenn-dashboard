"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Image from "next/image";
import { uploadToS3 } from "@/lib/upload";

export default function NewBlogPage() {
  const [title, setTitle] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title,
        content,
        tags: tags.split(",").map((tag) => tag.trim()),
        coverImage,
        urlTitle: urlTitle || title.toLowerCase().replace(/\s+/g, "-"),
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/blogs`,
        payload
      );

      toast({
        title: "Blog Created",
        description: "Your blog post has been published.",
      });

      router.push("/dashboard/blogs");
    } catch (error) {
      console.error("Error creating blog:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create New Blog</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blog Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter blog title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="title">URL Title</Label>
              <Input
                id="urlTitle"
                placeholder="Eg. this-is-a-blog-url-title"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="e.g. travel, spirituality, food"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                onChange={(e) => setCoverImage(e.target.value)}
                value={coverImage}
                placeholder="Image URL"
                disabled={loading}
              />
              {/* Upload Button */}
              <Input
                type="file"
                accept="image/*"
                id={`upload-image`}
                className=""
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    const uploadedUrl = await uploadToS3(file);
                    setCoverImage(uploadedUrl);
                  } catch (err) {
                    console.error("Upload failed", err);
                    alert("Image upload failed");
                  }
                }}
              />
              <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                <Image
                  src={coverImage}
                  alt={`Preview image`}
                  className="h-full w-full object-cover"
                  width={100}
                  height={100}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/100x100?text=Error";
                  }}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Blog"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
