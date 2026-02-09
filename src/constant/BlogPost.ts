import { publicAPI } from '@/lib/api';
import { BlogRow } from '@/types/superadmin/landingpage-setting';
import { generateSlug } from '@/lib/utils';

export class BlogPost {
  static async getBlogs(): Promise<BlogRow[]> {
    try {
      const response = await publicAPI.getBlogs();

      let blogData: BlogRow[] = [];

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        blogData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        blogData = response.data;
      } else {
        return [];
      }

      // Ensure slug is present
      return blogData.map(blog => ({
        ...blog,
        slug: blog.slug || (blog.title ? generateSlug(blog.title) : blog._id)
      }));

    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  static async getById(id: string): Promise<BlogRow | null> {
    try {
      const response = await publicAPI.getBlogBySlug(id);
      const blogData = response.data.data || response.data;

      if (!blogData) return null;

      // Ensure slug is present
      return {
        ...blogData,
        slug: blogData.slug || (blogData.title ? generateSlug(blogData.title) : blogData._id)
      };

    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      return null;
    }
  }

  static async getBlogBySlug(slug: string): Promise<BlogRow | null> {
    try {
      const allPosts = await this.getBlogs();
      return allPosts.find(post => post.slug === slug) || null;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  }
} 