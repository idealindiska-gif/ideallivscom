/**
 * WordPress REST API Type Definitions
 *
 * Type definitions for WordPress posts, pages, and related entities.
 */

export interface Author {
  id: number;
  name: string;
  url?: string;
  description?: string;
  link?: string;
  slug: string;
  avatar_url?: string;
  meta?: any;
}

export interface Category {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta?: any;
}

export interface Tag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta?: any;
}

export interface FeaturedImage {
  id: number;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Post {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: string;
  content?: string;
  excerpt?: string;
  author?: Author;
  featured_image?: FeaturedImage;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format:
    | 'standard'
    | 'aside'
    | 'chat'
    | 'gallery'
    | 'link'
    | 'image'
    | 'quote'
    | 'status'
    | 'video'
    | 'audio';
  meta?: any;
  categories?: Category[];
  tags?: Tag[];
  _embedded?: any;
}

export interface Page {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: string;
  content: string;
  excerpt?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text?: string;
    }>;
  };
  author?: Author;
  featured_image?: FeaturedImage;
  parent: number;
  menu_order: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta?: any;
  _embedded?: any;
}

export interface Media {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'future' | 'draft' | 'pending' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta?: any;
  description?: {
    rendered: string;
  };
  caption?: {
    rendered: string;
  };
  alt_text: string;
  media_type: 'image' | 'file' | 'video' | 'audio';
  mime_type: string;
  media_details?: {
    width: number;
    height: number;
    file: string;
    sizes?: any;
    image_meta?: any;
  };
  post?: number;
  source_url: string;
  _embedded?: any;
}

export interface Comment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: string;
  type: string;
  author_avatar_urls?: {
    [key: string]: string;
  };
  meta?: any;
}

export interface PostQueryParams {
  context?: 'view' | 'embed' | 'edit';
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  author?: number | number[];
  author_exclude?: number | number[];
  before?: string;
  exclude?: number | number[];
  include?: number | number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?:
    | 'author'
    | 'date'
    | 'id'
    | 'include'
    | 'modified'
    | 'parent'
    | 'relevance'
    | 'slug'
    | 'include_slugs'
    | 'title';
  slug?: string | string[];
  status?: string;
  categories?: number | number[];
  categories_exclude?: number | number[];
  tags?: number | number[];
  tags_exclude?: number | number[];
  sticky?: boolean;
  _embed?: boolean;
}

export interface PageQueryParams {
  context?: 'view' | 'embed' | 'edit';
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  author?: number | number[];
  author_exclude?: number | number[];
  before?: string;
  exclude?: number | number[];
  include?: number | number[];
  menu_order?: number;
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?:
    | 'author'
    | 'date'
    | 'id'
    | 'include'
    | 'modified'
    | 'parent'
    | 'relevance'
    | 'slug'
    | 'include_slugs'
    | 'title'
    | 'menu_order';
  parent?: number | number[];
  parent_exclude?: number | number[];
  slug?: string | string[];
  status?: string;
  _embed?: boolean;
}
