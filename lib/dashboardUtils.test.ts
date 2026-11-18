import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTelemetryCsv,
  filterDashboardBlogs,
  getTelemetrySeries,
  mapOrreryStageToStatus,
  mapStatusToOrreryStage,
  TELEMETRY_SERIES,
} from './dashboardUtils';

const SAMPLE_BLOGS = [
  {
    id: '1',
    title: 'Agentic RAG Architectures in Production',
    status: 'pending_approval',
    websiteId: 'site-1',
    websiteName: 'TechPulse',
    category: 'AI Systems',
  },
  {
    id: '2',
    title: 'Zero-Trust Cloud Security Guide',
    status: 'approved',
    websiteId: 'site-2',
    websiteName: 'CloudScale',
    category: 'Security',
  },
  {
    id: '3',
    title: 'Core Web Vitals at the Edge',
    status: 'published',
    websiteId: 'site-1',
    websiteName: 'TechPulse',
    category: 'Performance',
  },
  {
    id: '4',
    title: 'PostgreSQL Indexing Deep Dive',
    status: 'draft',
    websiteId: 'site-2',
    websiteName: 'CloudScale',
    category: 'Databases',
  },
];

test('filterDashboardBlogs filters by status, site, and search query', () => {
  assert.equal(
    filterDashboardBlogs(SAMPLE_BLOGS, {
      statusFilter: 'all',
      siteFilter: 'all',
      articleSearch: '',
    }).length,
    4
  );

  const reviewOnly = filterDashboardBlogs(SAMPLE_BLOGS, {
    statusFilter: 'pending_approval',
    siteFilter: 'all',
    articleSearch: '',
  });
  assert.deepEqual(
    reviewOnly.map((b) => b.id),
    ['1']
  );

  const siteFiltered = filterDashboardBlogs(SAMPLE_BLOGS, {
    statusFilter: 'all',
    siteFilter: 'TechPulse',
    articleSearch: '',
  });
  assert.deepEqual(
    siteFiltered.map((b) => b.id),
    ['1', '3']
  );

  const searchFiltered = filterDashboardBlogs(SAMPLE_BLOGS, {
    statusFilter: 'all',
    siteFilter: 'all',
    articleSearch: '  SECURITY ',
  });
  assert.deepEqual(
    searchFiltered.map((b) => b.id),
    ['2']
  );
});

test('mapStatusToOrreryStage and mapOrreryStageToStatus map cleanly', () => {
  assert.equal(mapStatusToOrreryStage('all'), 0);
  assert.equal(mapStatusToOrreryStage('pending_approval'), 1);
  assert.equal(mapStatusToOrreryStage('draft'), 1);
  assert.equal(mapStatusToOrreryStage('approved'), 2);
  assert.equal(mapStatusToOrreryStage('published'), 3);

  assert.equal(mapOrreryStageToStatus(0), 'all');
  assert.equal(mapOrreryStageToStatus(1), 'pending_approval');
  assert.equal(mapOrreryStageToStatus(2), 'approved');
  assert.equal(mapOrreryStageToStatus(3), 'published');
  assert.equal(mapOrreryStageToStatus(99), 'all');
});

test('getTelemetrySeries and buildTelemetryCsv handle 3M and 6M slices', () => {
  const threeMonths = getTelemetrySeries('3M');
  assert.equal(threeMonths.length, 3);
  assert.equal(threeMonths[0].month, 'Jul');

  const sixMonths = getTelemetrySeries('6M');
  assert.equal(sixMonths.length, TELEMETRY_SERIES.length);

  const csv = buildTelemetryCsv(threeMonths);
  const lines = csv.split('\n');
  assert.equal(lines.length, 4);
  assert.equal(lines[0], 'Month,Generated,Published,SEO,Readability,Words');
  assert.ok(lines[1].startsWith('Jul,9,7,85,84,14500'));
});
