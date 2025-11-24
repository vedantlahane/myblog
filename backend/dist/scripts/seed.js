"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../config/env");
const mongoose_1 = __importDefault(require("mongoose"));
const database_1 = require("../config/database");
const user_model_1 = require("../models/user.model");
const tag_model_1 = require("../models/tag.model");
const category_model_1 = require("../models/category.model");
const post_model_1 = require("../models/post.model");
const sampleUsers = [
    {
        name: 'Amelia Carter',
        email: 'amelia@myblog.com',
        password: 'CreateBrave!1',
        bio: 'Design director sharing process notes on storytelling, systems, and creative leadership.',
        avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
        isAdmin: true,
        isVerified: true,
    },
    {
        name: 'Noah Patel',
        email: 'noah@myblog.com',
        password: 'CalibrateFlow@2',
        bio: 'Engineer documenting experiments in AI tooling, asynchronous work, and developer experience.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        isVerified: true,
    },
    {
        name: 'Mira Solis',
        email: 'mira@myblog.com',
        password: 'ClarityQuest@3',
        bio: 'Researcher turning field notes into approachable essays on focus, rituals, and mindful productivity.',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    },
];
const sampleTags = [
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
const sampleCategories = [
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
const lorem = (paragraphs) => {
    return paragraphs
        .map((text) => `<p>${text}</p>`)
        .join('\n');
};
const samplePosts = [
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
        authorEmail: 'amelia@myblog.com',
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
        authorEmail: 'amelia@myblog.com',
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
        authorEmail: 'noah@myblog.com',
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
        authorEmail: 'mira@myblog.com',
        status: 'published',
        publishedAt: new Date('2024-08-03T07:30:00Z'),
        viewCount: 1735,
    },
];
const upsertUsers = async () => {
    const createdUsers = {};
    for (const userData of sampleUsers) {
        const existing = await user_model_1.User.findOne({ email: userData.email });
        if (existing) {
            createdUsers[userData.email] = existing._id;
            continue;
        }
        const user = new user_model_1.User({
            ...userData,
            isAdmin: userData.isAdmin ?? false,
            isVerified: userData.isVerified ?? false,
        });
        await user.save();
        createdUsers[userData.email] = user._id;
        console.log(`Created user: ${user.email}`);
    }
    return createdUsers;
};
const upsertTags = async () => {
    const createdTags = new Map();
    for (const tagData of sampleTags) {
        const existing = await tag_model_1.Tag.findOne({ slug: tagData.slug });
        if (existing) {
            createdTags.set(tagData.slug, existing._id);
            continue;
        }
        const tag = new tag_model_1.Tag({
            ...tagData,
            postCount: 0,
        });
        await tag.save();
        createdTags.set(tag.slug, tag._id);
        console.log(`Created tag: ${tag.name}`);
    }
    return createdTags;
};
const upsertCategories = async () => {
    for (const categoryData of sampleCategories) {
        const existing = await category_model_1.Category.findOne({ slug: categoryData.slug });
        if (existing) {
            continue;
        }
        const category = new category_model_1.Category({
            ...categoryData,
            isActive: true,
        });
        await category.save();
        console.log(`Created category: ${category.name}`);
    }
};
const createPosts = async (users, tags) => {
    for (const postData of samplePosts) {
        const existing = await post_model_1.Post.findOne({ slug: postData.slug });
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
            .filter((id) => Boolean(id));
        if (!tagIds.length) {
            console.warn(`Skipping post ${postData.title} -> missing tags ${postData.tagSlugs.join(', ')}`);
            continue;
        }
        const post = new post_model_1.Post({
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
        await tag_model_1.Tag.updateMany({ _id: { $in: tagIds } }, { $inc: { postCount: 1 } });
        console.log(`Created post: ${post.title}`);
    }
};
const seed = async () => {
    await (0, database_1.connectDB)();
    const users = await upsertUsers();
    const tags = await upsertTags();
    await upsertCategories();
    await createPosts(users, tags);
    await mongoose_1.default.connection.close();
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
