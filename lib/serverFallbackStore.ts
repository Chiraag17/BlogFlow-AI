import crypto from "crypto";
import { BlogStatus, ApprovalStatus, PublishingStatus, WorkflowStatus } from "@prisma/client";
import {
  DEMO_WEBSITES,
  DEMO_BLOGS,
  DEMO_QUALITY_REPORTS,
  DEMO_APPROVALS,
  DEMO_INTEGRATIONS,
  DEMO_PUBLISHING_RECORDS,
  DEMO_AUTOMATION_RULES,
} from "@/lib/mock-data";

export interface FallbackWebsiteRecord {
  id: string;
  userId: string;
  name: string;
  url: string;
  niche: string;
  targetAudience: string;
  writingTone: string;
  preferredKeywords: string[];
  excludedTopics: string[];
  websiteContext: any;
  connectionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackBlogRecord {
  id: string;
  websiteId: string;
  researchReportId: string | null;
  title: string;
  subtitle: string | null;
  slug: string;
  content: string;
  introduction: string | null;
  conclusion: string | null;
  faqs: any;
  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  secondaryKeywords: any;
  tags: any;
  category: string | null;
  estimatedReadingTime: number;
  status: BlogStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackQualityReportRecord {
  id: string;
  blogId: string;
  grammarStatus: string;
  readabilityScore: number | null;
  seoScore: number | null;
  contentQualityScore: number | null;
  factCheckingResults: any;
  issues: any;
  suggestions: any;
  createdAt: Date;
}

export interface FallbackApprovalRecord {
  id: string;
  blogId: string;
  reviewerId: string | null;
  reviewerName?: string | null;
  reviewerEmail?: string | null;
  status: ApprovalStatus;
  comments: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackIntegrationRecord {
  id: string;
  websiteId: string;
  provider: string;
  cmsUrl: string;
  username: string;
  encryptedCredentials: string;
  connectionStatus: string;
  lastConnectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackPublishingRecord {
  id: string;
  blogId: string;
  integrationId: string;
  externalPostId: string | null;
  publishedUrl: string | null;
  publishingStatus: PublishingStatus;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackAutomationConfigRecord {
  id: string;
  websiteId: string;
  enabled: boolean;
  researchFrequency: string;
  generationFrequency: string;
  preferredPublishingDays: string[];
  preferredPublishingTime: string;
  timezone: string;
  maxBlogsPerWeek: number;
  requireHumanApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackWorkflowExecutionRecord {
  id: string;
  userId: string;
  websiteId: string;
  blogId: string | null;
  workflowType: string;
  graphThreadId: string;
  currentNode: string;
  status: WorkflowStatus;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FallbackState {
  websites: FallbackWebsiteRecord[];
  blogs: FallbackBlogRecord[];
  qualityReports: FallbackQualityReportRecord[];
  approvals: FallbackApprovalRecord[];
  integrations: FallbackIntegrationRecord[];
  publishingRecords: FallbackPublishingRecord[];
  automationConfigs: FallbackAutomationConfigRecord[];
  workflows: FallbackWorkflowExecutionRecord[];
}

declare global {
  // eslint-disable-next-line no-var
  var blogflowFallbackState: FallbackState | undefined;
}

export const DEMO_OWNER_ID = "demo-studio-user";

function mapBlogStatus(raw: string): BlogStatus {
  const upper = raw.toUpperCase();
  if (upper in BlogStatus) {
    return upper as BlogStatus;
  }
  return BlogStatus.DRAFT;
}

function mapApprovalStatus(raw: string): ApprovalStatus {
  const upper = raw.toUpperCase();
  if (upper in ApprovalStatus) {
    return upper as ApprovalStatus;
  }
  return ApprovalStatus.PENDING;
}

function createInitialState(): FallbackState {
  const websites: FallbackWebsiteRecord[] = DEMO_WEBSITES.map((w) => ({
    id: w.id,
    userId: DEMO_OWNER_ID,
    name: w.name,
    url: w.url,
    niche: w.niche,
    targetAudience: w.audience,
    writingTone: w.tone,
    preferredKeywords: [...w.keywords],
    excludedTopics: [...w.excludedTopics],
    websiteContext: null,
    connectionStatus: w.connectionStatus === "pending" ? "PENDING" : "ACTIVE",
    createdAt: new Date(w.createdAt),
    updatedAt: new Date(w.updatedAt),
  }));

  const blogs: FallbackBlogRecord[] = DEMO_BLOGS.map((b) => ({
    id: b.id,
    websiteId: b.websiteId,
    researchReportId: b.researchId || null,
    title: b.title,
    subtitle: b.subtitle || null,
    slug: b.slug,
    content: b.content,
    introduction: b.introduction || null,
    conclusion: b.conclusion || null,
    faqs: b.faqs || [],
    metaTitle: b.metaTitle || null,
    metaDescription: b.metaDescription || null,
    focusKeyword: b.focusKeyword || null,
    secondaryKeywords: b.secondaryKeywords || [],
    tags: b.tags || [],
    category: b.category || null,
    estimatedReadingTime: b.readingTime || 5,
    status: mapBlogStatus(b.status),
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt),
  }));

  const qualityReports: FallbackQualityReportRecord[] = DEMO_QUALITY_REPORTS.map((qr) => ({
    id: qr.id,
    blogId: qr.blogId,
    grammarStatus: qr.grammarScore >= 80 ? "PASSED" : "NEEDS_REVIEW",
    readabilityScore: qr.readabilityScore,
    seoScore: qr.seoScore,
    contentQualityScore: qr.overallScore,
    factCheckingResults: [],
    issues: qr.issues || [],
    suggestions: qr.suggestions || [],
    createdAt: new Date(qr.createdAt),
  }));

  const approvals: FallbackApprovalRecord[] = DEMO_APPROVALS.map((a) => ({
    id: a.id,
    blogId: a.blogId,
    reviewerId: a.reviewerId || null,
    reviewerName: a.reviewerName || "Aria Vance",
    reviewerEmail: "demo@blogflow.ai",
    status: mapApprovalStatus(a.status),
    comments: a.comments.map((c) => c.comment).join(" | ") || null,
    reviewedAt: a.reviewedAt ? new Date(a.reviewedAt) : null,
    createdAt: new Date(a.createdAt),
    updatedAt: new Date(a.reviewedAt || a.createdAt),
  }));

  const integrations: FallbackIntegrationRecord[] = DEMO_INTEGRATIONS.map((int) => ({
    id: int.id,
    websiteId: int.websiteId,
    provider: int.provider.toUpperCase(),
    cmsUrl: int.siteUrl,
    username: int.configuration.username || "admin",
    encryptedCredentials: "",
    connectionStatus: int.connectionStatus === "connected" ? "CONNECTED" : "DISCONNECTED",
    lastConnectedAt: int.lastSynced ? new Date(int.lastSynced) : null,
    createdAt: new Date(int.createdAt),
    updatedAt: new Date(int.lastSynced || int.createdAt),
  }));

  const publishingRecords: FallbackPublishingRecord[] = DEMO_PUBLISHING_RECORDS.map((pub) => ({
    id: pub.id,
    blogId: pub.blogId,
    integrationId: "int-2",
    externalPostId: "wp-1042",
    publishedUrl: pub.publishedUrl || null,
    publishingStatus:
      pub.status === "published"
        ? PublishingStatus.PUBLISHED
        : pub.status === "scheduled"
        ? PublishingStatus.SCHEDULED
        : PublishingStatus.PENDING,
    scheduledAt: pub.scheduledAt ? new Date(pub.scheduledAt) : null,
    publishedAt: pub.publishedAt ? new Date(pub.publishedAt) : null,
    errorMessage: null,
    createdAt: new Date(pub.createdAt),
    updatedAt: new Date(pub.publishedAt || pub.createdAt),
  }));

  const automationConfigs: FallbackAutomationConfigRecord[] = DEMO_AUTOMATION_RULES.map((rule) => ({
    id: rule.id,
    websiteId: rule.websiteId,
    enabled: rule.status === "active",
    researchFrequency: rule.researchFrequency.toUpperCase(),
    generationFrequency: rule.generationFrequency.toUpperCase(),
    preferredPublishingDays: [...rule.preferredDays],
    preferredPublishingTime: rule.publishingTime,
    timezone: "UTC",
    maxBlogsPerWeek: rule.maxBlogsPerWeek,
    requireHumanApproval: rule.requireApproval,
    createdAt: new Date(rule.createdAt),
    updatedAt: new Date(rule.updatedAt),
  }));

  const workflows: FallbackWorkflowExecutionRecord[] = [
    {
      id: "wf-demo-1",
      userId: DEMO_OWNER_ID,
      websiteId: "web-1",
      blogId: "blog-1",
      workflowType: "AUTONOMOUS_BLOG_CREATION",
      graphThreadId: "wf-thread-demo-1",
      currentNode: "humanApproval",
      status: WorkflowStatus.PAUSED,
      errorMessage: null,
      startedAt: new Date("2025-09-25T10:50:00Z"),
      completedAt: null,
      createdAt: new Date("2025-09-25T10:50:00Z"),
      updatedAt: new Date("2025-09-26T09:00:00Z"),
    },
    {
      id: "wf-demo-2",
      userId: DEMO_OWNER_ID,
      websiteId: "web-2",
      blogId: "blog-2",
      workflowType: "AUTONOMOUS_BLOG_CREATION",
      graphThreadId: "wf-thread-demo-2",
      currentNode: "completed",
      status: WorkflowStatus.COMPLETED,
      errorMessage: null,
      startedAt: new Date("2025-09-26T09:45:00Z"),
      completedAt: new Date("2025-09-27T14:00:00Z"),
      createdAt: new Date("2025-09-26T09:45:00Z"),
      updatedAt: new Date("2025-09-27T14:00:00Z"),
    },
  ];

  return {
    websites,
    blogs,
    qualityReports,
    approvals,
    integrations,
    publishingRecords,
    automationConfigs,
    workflows,
  };
}

function getState(): FallbackState {
  if (!globalThis.blogflowFallbackState) {
    globalThis.blogflowFallbackState = createInitialState();
  }
  return globalThis.blogflowFallbackState;
}

export const serverFallbackStore = {
  // ---------------- WEBSITES ----------------
  getWebsites(userId?: string) {
    const state = getState();
    let list = userId ? state.websites.filter((w) => w.userId === userId) : [];
    if (list.length === 0) {
      list = state.websites.filter((w) => w.userId === DEMO_OWNER_ID);
    }

    return [...list]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((w) => ({
        ...w,
        cmsIntegrations: state.integrations
          .filter((c) => c.websiteId === w.id)
          .map(({ encryptedCredentials: _enc, ...safe }) => safe),
        automationConfig: state.automationConfigs.find((a) => a.websiteId === w.id) || null,
        _count: {
          blogs: state.blogs.filter((b) => b.websiteId === w.id).length,
          researchReports: 1,
        },
      }));
  },

  getAccessibleWebsiteIds(userId?: string | null): string[] {
    return this.getWebsites(userId || undefined).map((w) => w.id);
  },

  getWebsiteById(id: string) {
    const state = getState();
    const w = state.websites.find((site) => site.id === id);
    if (!w) return null;

    return {
      ...w,
      cmsIntegrations: state.integrations
        .filter((c) => c.websiteId === w.id)
        .map(({ encryptedCredentials: _enc, ...safe }) => safe),
      automationConfig: state.automationConfigs.find((a) => a.websiteId === w.id) || null,
      blogs: state.blogs
        .filter((b) => b.websiteId === w.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      _count: {
        blogs: state.blogs.filter((b) => b.websiteId === w.id).length,
      },
    };
  },

  createWebsite(data: {
    userId: string;
    name: string;
    url: string;
    niche: string;
    targetAudience: string;
    writingTone: string;
    preferredKeywords?: string[];
    excludedTopics?: string[];
    websiteContext?: any;
  }) {
    const state = getState();
    const now = new Date();
    const record: FallbackWebsiteRecord = {
      id: `web-${crypto.randomBytes(4).toString("hex")}`,
      userId: data.userId,
      name: data.name.trim(),
      url: data.url,
      niche: data.niche.trim(),
      targetAudience: data.targetAudience.trim(),
      writingTone: data.writingTone.trim(),
      preferredKeywords: data.preferredKeywords || [],
      excludedTopics: data.excludedTopics || [],
      websiteContext: data.websiteContext || null,
      connectionStatus: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    state.websites.unshift(record);
    return {
      ...record,
      cmsIntegrations: [],
      automationConfig: null,
      _count: { blogs: 0, researchReports: 0 },
    };
  },

  updateWebsite(
    id: string,
    updates: Partial<
      Pick<
        FallbackWebsiteRecord,
        "name" | "url" | "niche" | "targetAudience" | "writingTone" | "preferredKeywords" | "excludedTopics"
      >
    >
  ) {
    const state = getState();
    const idx = state.websites.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    state.websites[idx] = {
      ...state.websites[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return state.websites[idx];
  },

  deleteWebsite(id: string): boolean {
    const state = getState();
    const before = state.websites.length;
    state.websites = state.websites.filter((w) => w.id !== id);
    state.blogs = state.blogs.filter((b) => b.websiteId !== id);
    state.integrations = state.integrations.filter((i) => i.websiteId !== id);
    state.automationConfigs = state.automationConfigs.filter((a) => a.websiteId !== id);
    return state.websites.length < before;
  },

  // ---------------- BLOGS ----------------
  hydrateBlog(blog: FallbackBlogRecord) {
    const state = getState();
    const website = state.websites.find((w) => w.id === blog.websiteId);
    const qualityReports = state.qualityReports
      .filter((q) => q.blogId === blog.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const approvals = state.approvals
      .filter((a) => a.blogId === blog.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const publishingRecords = state.publishingRecords
      .filter((p) => p.blogId === blog.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((p) => {
        const integ = state.integrations.find((i) => i.id === p.integrationId);
        return {
          ...p,
          integration: integ
            ? {
                id: integ.id,
                websiteId: integ.websiteId,
                provider: integ.provider,
                cmsUrl: integ.cmsUrl,
                username: integ.username,
                connectionStatus: integ.connectionStatus,
                lastConnectedAt: integ.lastConnectedAt,
                createdAt: integ.createdAt,
                updatedAt: integ.updatedAt,
              }
            : null,
        };
      });
    const workflowExecutions = state.workflows
      .filter((w) => w.blogId === blog.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      ...blog,
      website: website
        ? {
            ...website,
            cmsIntegrations: state.integrations
              .filter((c) => c.websiteId === website.id)
              .map(({ encryptedCredentials: _e, ...safe }) => safe),
          }
        : null,
      researchReport: null,
      qualityReports,
      approvals,
      publishingRecords,
      workflowExecutions,
    };
  },

  getBlogs(params?: {
    userId?: string | null;
    websiteId?: string;
    status?: BlogStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(params?.userId);

    let filtered = state.blogs.filter((b) => {
      if (params?.websiteId) {
        if (accessibleIds.length > 0 && !accessibleIds.includes(params.websiteId)) return false;
        if (b.websiteId !== params.websiteId) return false;
      } else if (accessibleIds.length > 0 && !accessibleIds.includes(b.websiteId)) {
        return false;
      }

      if (params?.status && b.status !== params.status) return false;

      if (params?.search) {
        const q = params.search.toLowerCase();
        const hit =
          b.title.toLowerCase().includes(q) ||
          b.content.toLowerCase().includes(q) ||
          (b.focusKeyword || "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });

    filtered = filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = filtered.length;
    const offset = Math.max(params?.offset || 0, 0);
    const limit = Math.min(Math.max(params?.limit || 50, 1), 100);
    const paged = filtered.slice(offset, offset + limit).map((b) => this.hydrateBlog(b));

    return { blogs: paged, total };
  },

  getBlogById(id: string) {
    const state = getState();
    const blog = state.blogs.find((b) => b.id === id);
    return blog ? this.hydrateBlog(blog) : null;
  },

  createBlog(data: {
    websiteId: string;
    title: string;
    subtitle?: string | null;
    slug?: string;
    content: string;
    introduction?: string | null;
    conclusion?: string | null;
    faqs?: any;
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    secondaryKeywords?: any;
    tags?: any;
    category?: string | null;
    estimatedReadingTime?: number;
    status?: BlogStatus;
    researchReportId?: string | null;
  }) {
    const state = getState();
    const now = new Date();
    const generatedSlug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") +
        "-" +
        Date.now().toString(36);

    const record: FallbackBlogRecord = {
      id: `blog-${crypto.randomBytes(4).toString("hex")}`,
      websiteId: data.websiteId,
      researchReportId: data.researchReportId || null,
      title: data.title,
      subtitle: data.subtitle || null,
      slug: generatedSlug,
      content: data.content,
      introduction: data.introduction || null,
      conclusion: data.conclusion || null,
      faqs: data.faqs || [],
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      focusKeyword: data.focusKeyword || null,
      secondaryKeywords: data.secondaryKeywords || [],
      tags: data.tags || [],
      category: data.category || null,
      estimatedReadingTime: data.estimatedReadingTime || 5,
      status: data.status || BlogStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
    };

    state.blogs.unshift(record);

    if (record.status === BlogStatus.PENDING_APPROVAL) {
      state.approvals.unshift({
        id: `approval-${crypto.randomBytes(4).toString("hex")}`,
        blogId: record.id,
        reviewerId: null,
        status: ApprovalStatus.PENDING,
        comments: "Submitted for editorial review and approval.",
        reviewedAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    return this.hydrateBlog(record);
  },

  updateBlog(id: string, updates: Partial<FallbackBlogRecord>) {
    const state = getState();
    const idx = state.blogs.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    state.blogs[idx] = {
      ...state.blogs[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return this.hydrateBlog(state.blogs[idx]);
  },

  // ---------------- QUALITY REPORTS ----------------
  addQualityReport(report: {
    blogId: string;
    grammarStatus: string;
    readabilityScore: number;
    seoScore: number;
    contentQualityScore: number;
    issues: any;
    suggestions: any;
  }) {
    const state = getState();
    const record: FallbackQualityReportRecord = {
      id: `qr-${crypto.randomBytes(4).toString("hex")}`,
      blogId: report.blogId,
      grammarStatus: report.grammarStatus,
      readabilityScore: report.readabilityScore,
      seoScore: report.seoScore,
      contentQualityScore: report.contentQualityScore,
      factCheckingResults: [],
      issues: report.issues,
      suggestions: report.suggestions,
      createdAt: new Date(),
    };
    state.qualityReports.unshift(record);
    return record;
  },

  // ---------------- APPROVALS ----------------
  getPendingApprovals(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    return state.blogs
      .filter(
        (b) =>
          (accessibleIds.length === 0 || accessibleIds.includes(b.websiteId)) &&
          (b.status === BlogStatus.PENDING_APPROVAL || b.status === BlogStatus.CHANGES_REQUESTED)
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((b) => this.hydrateBlog(b));
  },

  getApprovalHistory(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    return state.approvals
      .filter((a) => {
        const blog = state.blogs.find((b) => b.id === a.blogId);
        if (!blog) return false;
        return accessibleIds.length === 0 || accessibleIds.includes(blog.websiteId);
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 100)
      .map((a) => {
        const blog = state.blogs.find((b) => b.id === a.blogId)!;
        return {
          ...a,
          blog: this.hydrateBlog(blog),
          reviewer: a.reviewerId
            ? {
                id: a.reviewerId,
                name: a.reviewerName || "Editorial Reviewer",
                email: a.reviewerEmail || "reviewer@blogflow.ai",
              }
            : null,
        };
      });
  },

  processApprovalDecision(params: {
    blogId: string;
    decision: "APPROVE" | "REJECT" | "REQUEST_REVISION";
    comments?: string;
    reviewerId?: string;
  }) {
    const state = getState();
    const blogIdx = state.blogs.findIndex((b) => b.id === params.blogId);
    if (blogIdx === -1) {
      throw new Error("Blog not found.");
    }

    let newBlogStatus: BlogStatus = BlogStatus.PENDING_APPROVAL;
    let approvalStatus: ApprovalStatus = ApprovalStatus.PENDING;

    if (params.decision === "APPROVE") {
      newBlogStatus = BlogStatus.APPROVED;
      approvalStatus = ApprovalStatus.APPROVED;
    } else if (params.decision === "REJECT") {
      newBlogStatus = BlogStatus.REJECTED;
      approvalStatus = ApprovalStatus.REJECTED;
    } else if (params.decision === "REQUEST_REVISION") {
      newBlogStatus = BlogStatus.CHANGES_REQUESTED;
      approvalStatus = ApprovalStatus.REVISION_REQUESTED;
    }

    const now = new Date();
    state.blogs[blogIdx] = {
      ...state.blogs[blogIdx],
      status: newBlogStatus,
      updatedAt: now,
    };

    const approvalRecord: FallbackApprovalRecord = {
      id: `approval-${crypto.randomBytes(4).toString("hex")}`,
      blogId: params.blogId,
      reviewerId: params.reviewerId || null,
      reviewerName: "Editorial Reviewer",
      reviewerEmail: "demo@blogflow.ai",
      status: approvalStatus,
      comments: params.comments || `Human decision recorded: ${params.decision}`,
      reviewedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    state.approvals.unshift(approvalRecord);

    // Update associated workflow if paused
    state.workflows = state.workflows.map((wf) =>
      wf.blogId === params.blogId && wf.status === WorkflowStatus.PAUSED
        ? {
            ...wf,
            status:
              params.decision === "REJECT" ? WorkflowStatus.CANCELLED : WorkflowStatus.COMPLETED,
            currentNode: params.decision === "REQUEST_REVISION" ? "revision" : "completed",
            completedAt: now,
            updatedAt: now,
          }
        : wf
    );

    return {
      success: true,
      blog: state.blogs[blogIdx],
      approval: approvalRecord,
      graphResume: null,
      fallbackMode: true,
    };
  },

  // ---------------- INTEGRATIONS ----------------
  getIntegrations(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    return state.integrations
      .filter((i) => accessibleIds.length === 0 || accessibleIds.includes(i.websiteId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ encryptedCredentials: _enc, ...safe }) => {
        const site = state.websites.find((w) => w.id === safe.websiteId);
        return {
          ...safe,
          website: site ? { id: site.id, name: site.name, url: site.url } : null,
        };
      });
  },

  getIntegrationWithSecretById(id: string) {
    const state = getState();
    return state.integrations.find((i) => i.id === id) || null;
  },

  createIntegration(data: {
    websiteId: string;
    cmsUrl: string;
    username: string;
    encryptedCredentials: string;
  }) {
    const state = getState();
    const now = new Date();
    const record: FallbackIntegrationRecord = {
      id: `int-${crypto.randomBytes(4).toString("hex")}`,
      websiteId: data.websiteId,
      provider: "WORDPRESS",
      cmsUrl: data.cmsUrl,
      username: data.username,
      encryptedCredentials: data.encryptedCredentials,
      connectionStatus: "CONNECTED",
      lastConnectedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    state.integrations.unshift(record);
    const site = state.websites.find((w) => w.id === data.websiteId);
    const { encryptedCredentials: _enc, ...safe } = record;
    return {
      ...safe,
      website: site ? { id: site.id, name: site.name, url: site.url } : null,
    };
  },

  deleteIntegration(id: string): boolean {
    const state = getState();
    const before = state.integrations.length;
    state.integrations = state.integrations.filter((i) => i.id !== id);
    return state.integrations.length < before;
  },

  // ---------------- PUBLISHING ----------------
  getPublishingHistory(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    return state.publishingRecords
      .filter((rec) => {
        const blog = state.blogs.find((b) => b.id === rec.blogId);
        return blog && (accessibleIds.length === 0 || accessibleIds.includes(blog.websiteId));
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50)
      .map((rec) => {
        const blog = state.blogs.find((b) => b.id === rec.blogId);
        const integration = state.integrations.find((i) => i.id === rec.integrationId);
        return {
          ...rec,
          blog: blog
            ? { id: blog.id, title: blog.title, slug: blog.slug, status: blog.status }
            : null,
          integration: integration
            ? {
                id: integration.id,
                provider: integration.provider,
                cmsUrl: integration.cmsUrl,
                username: integration.username,
              }
            : null,
        };
      });
  },

  getPublishingRecordById(id: string) {
    const state = getState();
    const rec = state.publishingRecords.find((r) => r.id === id);
    if (!rec) return null;
    const blog = state.blogs.find((b) => b.id === rec.blogId);
    const integration = state.integrations.find((i) => i.id === rec.integrationId);
    return {
      ...rec,
      blog: blog ? this.hydrateBlog(blog) : null,
      integration: integration
        ? {
            id: integration.id,
            provider: integration.provider,
            cmsUrl: integration.cmsUrl,
            username: integration.username,
          }
        : null,
    };
  },

  recordPublishFallback(params: {
    blogId: string;
    integrationId: string;
    publishMode: "publish" | "draft" | "schedule";
    scheduledDate?: string;
    externalPostId?: string;
    publishedUrl?: string;
  }) {
    const state = getState();
    const blogIdx = state.blogs.findIndex((b) => b.id === params.blogId);
    if (blogIdx === -1) return null;
    const integration = state.integrations.find((i) => i.id === params.integrationId);
    const now = new Date();
    const targetPubStatus =
      params.publishMode === "schedule"
        ? PublishingStatus.SCHEDULED
        : params.publishMode === "publish"
        ? PublishingStatus.PUBLISHED
        : PublishingStatus.PENDING;

    const targetBlogStatus =
      params.publishMode === "schedule"
        ? BlogStatus.SCHEDULED
        : params.publishMode === "publish"
        ? BlogStatus.PUBLISHED
        : BlogStatus.APPROVED;

    const url =
      params.publishedUrl ||
      `${(integration?.cmsUrl || "https://example.com").replace(/\/+$/, "")}/${state.blogs[blogIdx].slug}`;

    state.blogs[blogIdx] = {
      ...state.blogs[blogIdx],
      status: targetBlogStatus,
      updatedAt: now,
    };

    const existingIdx = state.publishingRecords.findIndex(
      (r) => r.blogId === params.blogId && r.integrationId === params.integrationId
    );
    const record: FallbackPublishingRecord = {
      id:
        existingIdx >= 0
          ? state.publishingRecords[existingIdx].id
          : `pub-${crypto.randomBytes(4).toString("hex")}`,
      blogId: params.blogId,
      integrationId: params.integrationId,
      externalPostId: params.externalPostId || `wp-${Date.now().toString().slice(-4)}`,
      publishedUrl: url,
      publishingStatus: targetPubStatus,
      scheduledAt: params.scheduledDate ? new Date(params.scheduledDate) : null,
      publishedAt: now,
      errorMessage: null,
      createdAt: existingIdx >= 0 ? state.publishingRecords[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      state.publishingRecords[existingIdx] = record;
    } else {
      state.publishingRecords.unshift(record);
    }

    return {
      success: true,
      externalPostId: record.externalPostId,
      publishedUrl: record.publishedUrl,
      status: params.publishMode === "schedule" ? "future" : params.publishMode,
      fallbackMode: true,
    };
  },

  // ---------------- AUTOMATION ----------------
  getAutomationConfigs(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    return state.automationConfigs
      .filter((c) => accessibleIds.length === 0 || accessibleIds.includes(c.websiteId))
      .map((c) => {
        const site = state.websites.find((w) => w.id === c.websiteId);
        return {
          ...c,
          website: site ? { id: site.id, name: site.name, url: site.url } : null,
        };
      });
  },

  getAutomationConfigByIdOrWebsiteId(id: string) {
    const state = getState();
    return state.automationConfigs.find((c) => c.id === id || c.websiteId === id) || null;
  },

  upsertAutomationConfig(data: {
    websiteId: string;
    enabled?: boolean;
    researchFrequency?: string;
    generationFrequency?: string;
    preferredPublishingDays?: string[];
    preferredPublishingTime?: string;
    timezone?: string;
    maxBlogsPerWeek?: number;
    requireHumanApproval?: boolean;
  }) {
    const state = getState();
    const now = new Date();
    const idx = state.automationConfigs.findIndex((c) => c.websiteId === data.websiteId);
    if (idx >= 0) {
      const existing = state.automationConfigs[idx];
      state.automationConfigs[idx] = {
        ...existing,
        enabled: data.enabled !== undefined ? data.enabled : existing.enabled,
        researchFrequency: data.researchFrequency || existing.researchFrequency,
        generationFrequency: data.generationFrequency || existing.generationFrequency,
        preferredPublishingDays: data.preferredPublishingDays || existing.preferredPublishingDays,
        preferredPublishingTime: data.preferredPublishingTime || existing.preferredPublishingTime,
        timezone: data.timezone || existing.timezone,
        maxBlogsPerWeek: data.maxBlogsPerWeek || existing.maxBlogsPerWeek,
        requireHumanApproval:
          data.requireHumanApproval !== undefined
            ? data.requireHumanApproval
            : existing.requireHumanApproval,
        updatedAt: now,
      };
      return state.automationConfigs[idx];
    }

    const record: FallbackAutomationConfigRecord = {
      id: `auto-${crypto.randomBytes(4).toString("hex")}`,
      websiteId: data.websiteId,
      enabled: data.enabled ?? false,
      researchFrequency: data.researchFrequency || "WEEKLY",
      generationFrequency: data.generationFrequency || "WEEKLY",
      preferredPublishingDays: data.preferredPublishingDays || ["Monday", "Wednesday", "Friday"],
      preferredPublishingTime: data.preferredPublishingTime || "09:00",
      timezone: data.timezone || "UTC",
      maxBlogsPerWeek: data.maxBlogsPerWeek || 3,
      requireHumanApproval:
        data.requireHumanApproval !== undefined ? data.requireHumanApproval : true,
      createdAt: now,
      updatedAt: now,
    };
    state.automationConfigs.unshift(record);
    return record;
  },

  setAutomationEnabled(id: string, enabled: boolean): number {
    const state = getState();
    let count = 0;
    state.automationConfigs = state.automationConfigs.map((c) => {
      if (c.id === id || c.websiteId === id) {
        count++;
        return { ...c, enabled, updatedAt: new Date() };
      }
      return c;
    });
    return count;
  },

  // ---------------- WORKFLOWS ----------------
  getWorkflows(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    return state.workflows
      .filter((w) => accessibleIds.length === 0 || accessibleIds.includes(w.websiteId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50)
      .map((w) => {
        const site = state.websites.find((s) => s.id === w.websiteId);
        const blog = w.blogId ? state.blogs.find((b) => b.id === w.blogId) : null;
        return {
          ...w,
          website: site ? { name: site.name, url: site.url } : null,
          blog: blog ? { title: blog.title, status: blog.status } : null,
        };
      });
  },

  getWorkflowByIdOrThreadId(id: string) {
    const state = getState();
    const wf = state.workflows.find((w) => w.id === id || w.graphThreadId === id);
    if (!wf) return null;
    const site = state.websites.find((s) => s.id === wf.websiteId);
    const blog = wf.blogId ? state.blogs.find((b) => b.id === wf.blogId) : null;
    return {
      ...wf,
      website: site || null,
      blog: blog ? this.hydrateBlog(blog) : null,
    };
  },

  upsertWorkflow(data: {
    userId: string;
    websiteId: string;
    graphThreadId: string;
    blogId?: string | null;
    currentNode?: string;
    status?: WorkflowStatus;
    errorMessage?: string | null;
    completedAt?: Date | null;
  }) {
    const state = getState();
    const now = new Date();
    const idx = state.workflows.findIndex((w) => w.graphThreadId === data.graphThreadId);
    if (idx >= 0) {
      state.workflows[idx] = {
        ...state.workflows[idx],
        ...data,
        updatedAt: now,
      };
      return state.workflows[idx];
    }
    const record: FallbackWorkflowExecutionRecord = {
      id: `wf-${crypto.randomBytes(4).toString("hex")}`,
      userId: data.userId,
      websiteId: data.websiteId,
      blogId: data.blogId || null,
      workflowType: "AUTONOMOUS_BLOG_CREATION",
      graphThreadId: data.graphThreadId,
      currentNode: data.currentNode || "research",
      status: data.status || WorkflowStatus.RUNNING,
      errorMessage: data.errorMessage || null,
      startedAt: now,
      completedAt: data.completedAt || null,
      createdAt: now,
      updatedAt: now,
    };
    state.workflows.unshift(record);
    return record;
  },

  updateWorkflowStatus(
    id: string,
    status: WorkflowStatus,
    errorMessage: string | null,
    completedAt: Date | null
  ): number {
    const state = getState();
    let count = 0;
    state.workflows = state.workflows.map((w) => {
      if (w.id === id || w.graphThreadId === id) {
        count++;
        return { ...w, status, errorMessage, completedAt, updatedAt: new Date() };
      }
      return w;
    });
    return count;
  },

  // ---------------- ANALYTICS ----------------
  getAnalyticsOverview(userId?: string | null) {
    const state = getState();
    const accessibleIds = this.getAccessibleWebsiteIds(userId);
    const scopedBlogs = state.blogs.filter(
      (b) => accessibleIds.length === 0 || accessibleIds.includes(b.websiteId)
    );
    const scopedWebsites = state.websites.filter((w) => accessibleIds.includes(w.id));
    const scopedWorkflows = state.workflows.filter((w) => accessibleIds.includes(w.websiteId));

    const totalBlogs = scopedBlogs.length;
    const pendingApprovals = scopedBlogs.filter(
      (b) =>
        b.status === BlogStatus.PENDING_APPROVAL || b.status === BlogStatus.CHANGES_REQUESTED
    ).length;
    const publishedBlogs = scopedBlogs.filter((b) => b.status === BlogStatus.PUBLISHED).length;
    const connectedWebsites = scopedWebsites.filter(
      (w) => w.connectionStatus === "ACTIVE"
    ).length;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weeklyTrends = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * 86400000);
      return {
        day: days[d.getDay()],
        articles: Math.max(0, Math.floor(totalBlogs / 7) + (i % 2)),
        published: Math.max(0, Math.floor(publishedBlogs / 7)),
      };
    });

    const recentBlogs = [...scopedBlogs]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((b) => {
        const site = state.websites.find((w) => w.id === b.websiteId);
        return {
          id: b.id,
          title: b.title,
          website: site?.name || "Website",
          status: b.status,
          date: b.createdAt.toISOString().slice(0, 10),
          readingTime: `${b.estimatedReadingTime} min`,
        };
      });

    const recentActivity = [...scopedWorkflows]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((w) => {
        const site = state.websites.find((s) => s.id === w.websiteId);
        return {
          id: w.id,
          type: w.workflowType,
          website: site?.name || "Website",
          status: w.status,
          currentNode: w.currentNode,
          timestamp: w.startedAt.toISOString(),
        };
      });

    return {
      isDatabaseConnected: false,
      fallbackActive: true,
      stats: {
        totalBlogs,
        pendingApprovals,
        publishedBlogs,
        connectedWebsites,
        avgSeoScore: 91.2,
        automationUptime: "99.9%",
      },
      weeklyTrends,
      recentBlogs,
      recentActivity,
    };
  },
};
