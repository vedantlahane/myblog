import '../config/env';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { User } from '../models/user.model';
import { Tag } from '../models/tag.model';
import { Category } from '../models/category.model';
import { Post } from '../models/post.model';

interface SampleUser {
  name: string;
  email: string;
  password: string;
  bio?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
}

interface SampleTag {
  name: string;
  slug: string;
  description?: string;
}

interface SampleCategory {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
}

interface SamplePost {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  content: string;
  tagSlugs: string[];
  authorEmail: string;
  status?: 'draft' | 'published' | 'archived';
  publishedAt: Date;
  viewCount?: number;
}

const sampleUsers: SampleUser[] = [
  {
    name: 'Amelia Carter',
  email: 'amelia@Motherworld.com',
    password: 'CreateBrave!1',
    bio: 'Design director sharing process notes on storytelling, systems, and creative leadership.',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
    isAdmin: true,
    isVerified: true,
  },
  {
    name: 'Noah Patel',
  email: 'noah@Motherworld.com',
    password: 'CalibrateFlow@2',
    bio: 'Engineer documenting experiments in AI tooling, asynchronous work, and developer experience.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
  },
  {
    name: 'Mira Solis',
  email: 'mira@Motherworld.com',
    password: 'ClarityQuest@3',
    bio: 'Researcher turning field notes into approachable essays on focus, rituals, and mindful productivity.',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  },
];

const sampleTags: SampleTag[] = [
  {
    name: 'Productivity',
    slug: 'productivity',
    description: 'Systems, rituals, and experiments for doing our best work.',
  },
  {
    name: 'Design',
    slug: 'design',
    description: 'Interface thinking, visual language, and product craft.',
  },
  {
    name: 'Engineering',
    slug: 'engineering',
    description: 'Developer experience, tools, and pragmatic architecture notes.',
  },
  {
    name: 'Wellness',
    slug: 'wellness',
    description: 'Energy, rest, and care practices for sustainable creativity.',
  },
  {
    name: 'Career',
    slug: 'career',
    description: 'Navigating growth, leadership, and humane work cultures.',
  },
];

const sampleCategories: SampleCategory[] = [
  {
    name: 'Studio Logs',
    slug: 'studio-logs',
    description: 'Weeknotes, prototypes, and creative lab reports.',
    icon: '🧪',
    order: 1,
  },
  {
    name: 'Guides & Playbooks',
    slug: 'guides-playbooks',
    description: 'Step-by-step breakdowns for repeatable workflows.',
    icon: '🧭',
    order: 2,
  },
  {
    name: 'Letters from the Field',
    slug: 'letters-from-the-field',
    description: 'Personal reflections from builds, launches, and travel.',
    icon: '✉️',
    order: 3,
  },
];

const lorem = (paragraphs: string[]): string => {
  return paragraphs
    .map((text) => `<p>${text}</p>`)
    .join('\n');
};

const samplePosts: SamplePost[] = [
  {
    title: 'Rituals for Protecting Deep Work in Open Calendars',
    slug: 'rituals-deep-work-open-calendars',
    excerpt: 'Five small constraints that keep creative focus intact—even when your week belongs to meetings and messages.',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
    content: lorem([
      'Deep work rarely survives by accident. It needs friction—gentle barriers that signal to our future selves that this block is protected.',
      'In this piece I unpack the exact rituals our studio uses: pre-commitment emails, analog scoreboards, and the “open tab fast” we run each Thursday.',
      'There is no hustle narrative here. Just honest constraints that honour the pacing our brains crave.',
    ]),
    tagSlugs: ['productivity', 'career'],
  authorEmail: 'amelia@Motherworld.com',
    status: 'published',
    publishedAt: new Date('2024-10-18T09:00:00Z'),
    viewCount: 1280,
  },
  {
    title: 'Shipping Interface Experiments Without Burning Out the Team',
    slug: 'shipping-interface-experiments',
    excerpt: 'A calmer playbook for releasing bold UI ideas: scoped pilots, async crit, and an anticipatory QA loop.',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
    content: lorem([
      'We stopped betting entire sprints on a single redesign. Instead, we run layered experiments that ship quietly and learn loudly.',
      'This article breaks down how we define hypotheses, keep QA inside the design process, and use instrumentation to know when a concept is ready for prime time.',
      'Your team deserves to ship brave work without sprint hangovers.',
    ]),
    tagSlugs: ['design', 'engineering'],
  authorEmail: 'amelia@Motherworld.com',
    status: 'published',
    publishedAt: new Date('2024-11-05T14:30:00Z'),
    viewCount: 980,
  },
  {
    title: 'Telemetry for Humans: Measuring Flow Instead of Hours',
    slug: 'telemetry-for-humans',
    excerpt: 'A lightweight dashboard our engineering org uses to read energy, focus, and friction without surveilling people.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80',
    content: lorem([
      'We built a telemetry stack that privileges agency. Engineers self-report friction, the system pairs it with repo signals, and managers coach from reality—not assumptions.',
      'The stack runs on Google Forms, Retool, and a few cron jobs. The secret is the cadence: every Friday by noon, 90% participation, zero guilt.',
      'Flow is a feeling. When you treat it as such, the data finally becomes useful.',
    ]),
    tagSlugs: ['engineering', 'career'],
  authorEmail: 'noah@Motherworld.com',
    status: 'published',
    publishedAt: new Date('2024-09-12T08:00:00Z'),
    viewCount: 1560,
  },
  {
    title: 'Rest Notes from a Recovering Overachiever',
    slug: 'rest-notes-recovering-overachiever',
    excerpt: 'Burnout taught me that rest is a skill. Here is the protocol I follow now—complete with scripts, playlists, and boundaries.',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80',
    content: lorem([
      'Rest felt unproductive until I tracked it like training. Now I know which inputs refill energy and which ones steal it.',
      'This essay shares the weekly sabbath menu, sunset shutdown, and “gentle start” routine that repaired my nervous system.',
      'You cannot do your best work if your body never trusts you with downtime.',
    ]),
    tagSlugs: ['wellness', 'productivity'],
  authorEmail: 'mira@Motherworld.com',
    status: 'published',
    publishedAt: new Date('2024-08-03T07:30:00Z'),
    viewCount: 1735,
  },
];

const upsertUsers = async () => {
  const createdUsers: Record<string, mongoose.Types.ObjectId> = {};
  for (const userData of sampleUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      createdUsers[userData.email] = existing._id as mongoose.Types.ObjectId;
      continue;
    }

    const user = new User({
      ...userData,
      isAdmin: userData.isAdmin ?? false,
      isVerified: userData.isVerified ?? false,
    });
    await user.save();
    createdUsers[userData.email] = user._id as mongoose.Types.ObjectId;
    console.log(`Created user: ${user.email}`);
  }
  return createdUsers;
};

const upsertTags = async () => {
  const createdTags = new Map<string, mongoose.Types.ObjectId>();
  for (const tagData of sampleTags) {
    const existing = await Tag.findOne({ slug: tagData.slug });
    if (existing) {
      createdTags.set(tagData.slug, existing._id as mongoose.Types.ObjectId);
      continue;
    }

    const tag = new Tag({
      ...tagData,
      postCount: 0,
    });
    await tag.save();
    createdTags.set(tag.slug, tag._id as mongoose.Types.ObjectId);
    console.log(`Created tag: ${tag.name}`);
  }
  return createdTags;
};

const upsertCategories = async () => {
  for (const categoryData of sampleCategories) {
    const existing = await Category.findOne({ slug: categoryData.slug });
    if (existing) {
      continue;
    }

    const category = new Category({
      ...categoryData,
      isActive: true,
    });
    await category.save();
    console.log(`Created category: ${category.name}`);
  }
};

const createPosts = async (
  users: Record<string, mongoose.Types.ObjectId>,
  tags: Map<string, mongoose.Types.ObjectId>
) => {
  for (const postData of samplePosts) {
    const existing = await Post.findOne({ slug: postData.slug });
    if (existing) {
      continue;
    }

    const authorId = users[postData.authorEmail];
    if (!authorId) {
      console.warn(`Skipping post ${postData.title} -> missing author ${postData.authorEmail}`);
      continue;
    }

    const tagIds = postData.tagSlugs
      .map((slug) => tags.get(slug))
      .filter((id): id is mongoose.Types.ObjectId => Boolean(id));

    if (!tagIds.length) {
      console.warn(`Skipping post ${postData.title} -> missing tags ${postData.tagSlugs.join(', ')}`);
      continue;
    }

    const post = new Post({
      title: postData.title,
      slug: postData.slug,
      excerpt: postData.excerpt,
      coverImage: postData.coverImage,
      content: postData.content,
      author: authorId,
      tags: tagIds,
      status: postData.status ?? 'published',
      publishedAt: postData.publishedAt,
      viewCount: postData.viewCount ?? 0,
    });

    await post.save();
    await Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { postCount: 1 } });
    console.log(`Created post: ${post.title}`);
  }
};

const seed = async () => {
  await connectDB();

  const users = await upsertUsers();
  const tags = await upsertTags();
  await upsertCategories();
  await createPosts(users, tags);

  await mongoose.connection.close();
  console.log('Database connection closed. ✅');
};

seed()
  .then(() => {
    console.log('Seed completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
