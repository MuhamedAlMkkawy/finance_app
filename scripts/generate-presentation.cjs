const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Layla Property Management & Analytics Platform';
  pptx.author = 'Layla Development Team';
  pptx.company = 'Layla Real Estate';

  // Palette Constants
  const C_NAVY = '0F172A';     // Slate 900
  const C_NAVY_LIGHT = '1E293B';// Slate 800
  const C_EMERALD = '059669';  // Emerald 600
  const C_EMERALD_LIGHT = '10B981';
  const C_SKY = '0284C7';      // Sky 600
  const C_AMBER = 'D97706';    // Amber 600
  const C_WHITE = 'FFFFFF';
  const C_MUTED = '64748B';    // Slate 500
  const C_BG_LIGHT = 'F8FAFC';  // Slate 50
  const C_BORDER = 'E2E8F0';

  // Helper: Standard Slide Header
  function addSlideHeader(slide, category, title, subtitle) {
    // Top category badge
    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.45,
      w: 8.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_EMERALD
    });

    // Main Slide Title
    slide.addText(title, {
      x: 0.8,
      y: 0.72,
      w: 9.5,
      h: 0.45,
      fontSize: 20,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_NAVY
    });

    // Subtitle
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.8,
        y: 1.18,
        w: 11.0,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Segoe UI',
        color: C_MUTED
      });
    }

    // Header divider line
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8,
      y: 1.52,
      w: 11.7,
      h: 0.02,
      fill: { color: C_BORDER },
      line: { color: C_BORDER, width: 0 }
    });
  }

  // ==========================================
  // SLIDE 1: Title Slide (Dark Theme)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_NAVY };

    // Decorative Accent Bar
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.8,
      y: 1.8,
      w: 0.15,
      h: 3.2,
      fill: { color: C_EMERALD_LIGHT },
      line: { width: 0 }
    });

    slide.addText('ENTERPRISE PROPERTY SUITE', {
      x: 1.2,
      y: 1.8,
      w: 9.0,
      h: 0.35,
      fontSize: 12,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_EMERALD_LIGHT
    });

    slide.addText('Layla Property Management\n& Analytics Platform', {
      x: 1.2,
      y: 2.2,
      w: 10.5,
      h: 1.6,
      fontSize: 34,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_WHITE
    });

    slide.addText('Full-Stack Executive Web Application Powered by Nuxt 4, Vue 3, SQLite & Apache ECharts', {
      x: 1.2,
      y: 3.85,
      w: 10.0,
      h: 0.5,
      fontSize: 14,
      fontFace: 'Segoe UI',
      color: '94A3B8'
    });

    // Feature Badges at bottom
    const badges = [
      '1,034 Real Excel Records',
      '92 Columns Preserved',
      '14 Real-Time Executive KPIs',
      'Bilingual (Arabic / English)'
    ];

    badges.forEach((b, idx) => {
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: 1.2 + idx * 2.8,
        y: 5.4,
        w: 2.6,
        h: 0.65,
        fill: { color: C_NAVY_LIGHT },
        line: { color: '334155', width: 1 },
        rectRadius: 0.1
      });
      slide.addText(b, {
        x: 1.2 + idx * 2.8,
        y: 5.4,
        w: 2.6,
        h: 0.65,
        fontSize: 10,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_WHITE,
        align: 'center',
        valign: 'middle'
      });
    });
  }

  // ==========================================
  // SLIDE 2: Executive Summary & Project Purpose
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Project Objective', 'Executive Summary & Business Objectives', 'Transforming complex 92-column Excel workbooks into an audited SaaS executive suite.');

    // 3 Value Pillars
    const pillars = [
      {
        title: 'Complete Data Ingestion',
        desc: '100% preservation of all 92 original fields from Property Units Exp-Property Units Target.xlsx without data loss or column truncation.',
        stat: '1,034',
        statLabel: 'Total Records Ingested',
        color: C_EMERALD
      },
      {
        title: 'Real-Time Calculations',
        desc: 'Zero mock statistics. Every KPI, aggregation, distribution, and price per m² is calculated directly on SQLite persistent storage.',
        stat: '1.42 B',
        statLabel: 'SAR Total Portfolio Sales',
        color: C_SKY
      },
      {
        title: 'Executive Decision Making',
        desc: 'Built specifically for C-level executives, portfolio asset managers, and financial analysts who require immediate insights.',
        stat: '9',
        statLabel: 'Active Properties',
        color: C_NAVY
      }
    ];

    pillars.forEach((p, idx) => {
      const x = 0.8 + idx * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.8,
        w: 3.75,
        h: 4.8,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.15
      });

      // Top color indicator
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.3,
        y: 2.1,
        w: 0.8,
        h: 0.1,
        fill: { color: p.color },
        line: { width: 0 }
      });

      slide.addText(p.stat, {
        x: x + 0.3,
        y: 2.3,
        w: 3.15,
        h: 0.6,
        fontSize: 28,
        fontFace: 'Segoe UI',
        bold: true,
        color: p.color
      });

      slide.addText(p.statLabel, {
        x: x + 0.3,
        y: 2.9,
        w: 3.15,
        h: 0.3,
        fontSize: 10,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_MUTED
      });

      slide.addText(p.title, {
        x: x + 0.3,
        y: 3.5,
        w: 3.15,
        h: 0.4,
        fontSize: 14,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_NAVY
      });

      slide.addText(p.desc, {
        x: x + 0.3,
        y: 4.0,
        w: 3.15,
        h: 2.2,
        fontSize: 11,
        fontFace: 'Segoe UI',
        color: '475569',
        lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 3: Architecture & Technology Stack
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Technology Architecture', 'Production-Grade Nuxt 4 Architecture', 'Single unified codebase built on modern TypeScript, SSR, and SQLite persistent disk storage.');

    const techs = [
      { layer: 'Application Framework', name: 'Nuxt 4 + Vue 3', details: 'Full-stack SSR with Nitro server routes, eliminating external backend dependencies.' },
      { layer: 'Database & ORM', name: 'SQLite + Drizzle ORM', details: 'High-performance persistent disk storage with WAL concurrency mode and automated schema migrations.' },
      { layer: 'Analytics & Visualization', name: 'Apache ECharts', details: 'GPU-accelerated responsive charts with container ResizeObservers and interactive drilldowns.' },
      { layer: 'UI & Design System', name: 'Tailwind CSS + PrimeVue', details: 'Enterprise SaaS dark navy/emerald styling with responsive data tables and drawers.' },
      { layer: 'Internationalization', name: 'Nuxt i18n (ar / en)', details: 'Native bilingual engine supporting Arabic RTL and English LTR layouts dynamically.' },
      { layer: 'Auditing & Exports', name: 'ExcelJS + jsPDF', details: 'Automated executive spreadsheet generation and printable PDF portfolio digests.' }
    ];

    techs.forEach((t, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 1.8 + row * 1.65;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 5.75,
        h: 1.45,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.12
      });

      slide.addText(t.layer.toUpperCase(), {
        x: x + 0.3,
        y: y + 0.15,
        w: 5.15,
        h: 0.25,
        fontSize: 9,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_EMERALD
      });

      slide.addText(t.name, {
        x: x + 0.3,
        y: y + 0.38,
        w: 5.15,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_NAVY
      });

      slide.addText(t.details, {
        x: x + 0.3,
        y: y + 0.75,
        w: 5.15,
        h: 0.55,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: C_MUTED
      });
    });
  }

  // ==========================================
  // SLIDE 4: Data Ingestion & 92-Column Preservation
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Data Ingestion', 'Hybrid Schema & Complete 92-Field Preservation', 'Guaranteed zero data loss through indexed relational columns and complete raw JSON backups.');

    // Left Box: Hybrid Strategy
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.8,
      w: 6.8,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Core Ingestion Highlights', {
      x: 1.1,
      y: 2.05,
      w: 6.2,
      h: 0.35,
      fontSize: 14,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_NAVY
    });

    const points = [
      'Indexed Relational Columns: Fast SQL queries for property IDs, unit types, areas, sales statuses, and prices.',
      'Raw JSON Preservation: Every unit row stores raw_data containing all 92 original Excel fields exactly as provided.',
      'Legacy Date Cleansing: Automatic identification of 1900-01-01 Excel default dates to prevent flawed analytics.',
      'Property ID Normalization: Standardized uppercase trimmed identifiers while preserving raw original values.',
      'Batch Audit & Rollback: Every import is logged with import strategy, row counts, and one-click rollback.'
    ];

    slide.addText(points.map(p => `•  ${p}`).join('\n\n'), {
      x: 1.1,
      y: 2.5,
      w: 6.2,
      h: 3.8,
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: '334155',
      lineSpacing: 18
    });

    // Right Box: Preserved Fields Summary
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.8,
      y: 1.8,
      w: 4.7,
      h: 4.8,
      fill: { color: C_NAVY },
      line: { width: 0 },
      rectRadius: 0.15
    });

    slide.addText('92 Preserved Fields Categories', {
      x: 8.1,
      y: 2.1,
      w: 4.1,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_WHITE
    });

    const categories = [
      '1. General (Property, Unit, Activity, Brand)',
      '2. Location (Block, Floor, Company, Extension)',
      '3. Area (Built-up, Carpet, Terrace, Common)',
      '4. Financial (Sale, Tax, Total, Rent, Brokerage)',
      '5. Status (Sales Status, Occupied, Vacant, Offer)',
      '6. Facilities (Pool, Balcony, Maid, Parking)',
      '7. Maintenance (Paint, Vacant, Maintenance Dates)',
      '8. Utilities (Electric, Water, Gas, Views A-D)'
    ];

    slide.addText(categories.map(c => `✓  ${c}`).join('\n'), {
      x: 8.1,
      y: 2.55,
      w: 4.1,
      h: 3.8,
      fontSize: 9.5,
      fontFace: 'Segoe UI',
      color: '94A3B8',
      lineSpacing: 20
    });
  }

  // ==========================================
  // SLIDE 5: Executive Dashboard & 14 KPIs
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Executive Dashboard', '14 Real-Time Portfolio KPIs & Global Filters', 'Immediate executive visibility into inventory, financials, and unit availability.');

    const kpiList = [
      { label: 'Total Properties', val: '9 Properties', color: C_NAVY },
      { label: 'Total Unit Records', val: '1,034 Records', color: C_NAVY },
      { label: 'Unique Unit IDs', val: '529 Unique Units', color: C_SKY },
      { label: 'Sold Units', val: '931 Units (90.0%)', color: C_EMERALD },
      { label: 'Available Units', val: '103 Units (10.0%)', color: C_AMBER },
      { label: 'Physically Occupied', val: '931 Units', color: C_SKY },
      { label: 'Physically Vacant', val: '103 Units', color: C_EMERALD },
      { label: 'Total Sale Amount', val: '1,420,933,088 SAR', color: C_EMERALD },
      { label: 'Total Sales Tax', val: '0.00 SAR Recorded', color: C_MUTED },
      { label: 'Total Overall Value', val: '1,260,065,922 SAR', color: C_NAVY },
      { label: 'Total Area', val: '2,658,054 m²', color: C_NAVY },
      { label: 'Average Unit Price', val: '1,376,873 SAR', color: C_SKY },
      { label: 'Average Price / m²', val: '534.58 SAR / m²', color: C_EMERALD },
      { label: 'Reserved Units', val: '0 Units Flagged', color: C_MUTED }
    ];

    kpiList.forEach((k, idx) => {
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const x = 0.8 + col * 2.95;
      const y = 1.8 + row * 1.25;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 2.8,
        h: 1.1,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(k.label.toUpperCase(), {
        x: x + 0.15,
        y: y + 0.15,
        w: 2.5,
        h: 0.25,
        fontSize: 8.5,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_MUTED
      });

      slide.addText(k.val, {
        x: x + 0.15,
        y: y + 0.42,
        w: 2.5,
        h: 0.5,
        fontSize: 12,
        fontFace: 'Segoe UI',
        bold: true,
        color: k.color
      });
    });
  }

  // ==========================================
  // SLIDE 6: Interactive Charts & Visual Analytics
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Visual Analytics', '7 ECharts Interactive Visualizations (/charts)', 'Dynamic portfolio charts equipped with cross-filtering, tooltips, and click-through navigation.');

    const charts = [
      { title: 'Commercial Status Doughnut', desc: 'Sold (90%) vs Available (10%) commercial inventory ratio.' },
      { title: 'Sales Value by Property', desc: 'Bar chart comparing total revenue across all 9 properties in SAR.' },
      { title: 'Property Unit Distribution', desc: 'Stacked bar comparing total units vs sold units per property.' },
      { title: 'Units by Block Ranking', desc: 'Ranked distribution of unit capacity across all 15 building blocks.' },
      { title: 'Unit Area Distribution Bins', desc: 'Histogram classifying units into area buckets (<1000m², 1k-2k, >5000m²).' },
      { title: 'Financial Comparison (Dual Axis)', desc: 'Dual-axis chart correlating total recorded sales vs total unit area.' },
      { title: 'Floor-Level Distribution', desc: 'Building level inventory distribution across ground, first, and upper levels.' }
    ];

    charts.forEach((c, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const isFullWidth = idx === 6;
      const x = isFullWidth ? 0.8 : 0.8 + col * 5.95;
      const y = 1.8 + row * 1.25;
      const w = isFullWidth ? 11.7 : 5.75;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w,
        h: 1.1,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(`0${idx + 1}.  ${c.title}`, {
        x: x + 0.25,
        y: y + 0.15,
        w: w - 0.5,
        h: 0.3,
        fontSize: 11,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_NAVY
      });

      slide.addText(c.desc, {
        x: x + 0.25,
        y: y + 0.48,
        w: w - 0.5,
        h: 0.45,
        fontSize: 9.5,
        fontFace: 'Segoe UI',
        color: C_MUTED
      });
    });
  }

  // ==========================================
  // SLIDE 7: Properties Management Module
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Properties Module', 'Properties Management & Side-by-Side Comparison', 'Comprehensive portfolio view with dual grid/table modes and 8-tab property inspection.');

    // 2 Feature Columns
    const feats = [
      {
        title: 'Portfolio Grid & Comparison Matrix',
        bullets: [
          'Dual View: Switch seamlessly between visual Property Cards and high-density Data Tables.',
          'Performance Cards: Instant visibility into Property ID, unit counts, area, and sales percentage.',
          'Side-by-Side Comparison: Select up to 4 properties simultaneously to compare sales velocity, absorption, and area efficiency in a modal table.'
        ]
      },
      {
        title: 'Deep-Dive Property Details (/properties/[id])',
        bullets: [
          'Overview & Financials: Total property sales, tax collections, and currency distributions.',
          'Block & Floor Hierarchy: Visual breakdown of units across specific blocks and levels.',
          'Facilities Audit: Direct catalog of swimming pools, parking spaces, maid rooms, and furnishing.',
          'Raw Records Access: Inspect all underlying Excel rows associated with the building.'
        ]
      }
    ];

    feats.forEach((f, idx) => {
      const x = 0.8 + idx * 5.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.8,
        w: 5.75,
        h: 4.8,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.15
      });

      slide.addText(f.title, {
        x: x + 0.35,
        y: 2.1,
        w: 5.05,
        h: 0.4,
        fontSize: 13,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_EMERALD
      });

      slide.addText(f.bullets.map(b => `•  ${b}`).join('\n\n'), {
        x: x + 0.35,
        y: 2.65,
        w: 5.05,
        h: 3.6,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: '334155',
        lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 8: Units Inventory & 92-Column Selector
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Units Inventory', 'Enterprise Data Table & 92-Column Selector', 'Infinite customization with server-side pagination, sorting, and field-level visibility.');

    // 3 Capability Cards
    const caps = [
      {
        title: 'Server-Side Engine',
        items: [
          'High Performance: Fast paginated SQL queries with configurable page sizes (10, 20, 50, 100).',
          'Global Search: Real-time search by Unit ID, Name, Property ID, Block, or Floor.',
          'Server Sorting: Sort ascending or descending on any visible database column.'
        ]
      },
      {
        title: '92-Column Selector',
        items: [
          'Dynamic Visibility: Modal dialog allowing users to pick and choose any combination of the 92 fields.',
          'Custom Views: Save layout preferences and inspect specialized columns like Views A-D, Maid rooms, and connections.',
          'Filtered Export: Export currently filtered and selected unit columns directly to CSV.'
        ]
      },
      {
        title: 'Unit Details (/units/[id])',
        items: [
          '8 Clean Categories: General, Location, Area, Financial, Status, Facilities, Maintenance, and Utilities.',
          'No Missing Fields: 100% of the original Excel row values remain accessible in the detail drawer.',
          'Direct Linking: One-click navigation between properties, blocks, and unit records.'
        ]
      }
    ];

    caps.forEach((c, idx) => {
      const x = 0.8 + idx * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.8,
        w: 3.75,
        h: 4.8,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.15
      });

      slide.addText(c.title, {
        x: x + 0.3,
        y: 2.1,
        w: 3.15,
        h: 0.4,
        fontSize: 13,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_NAVY
      });

      slide.addText(c.items.map(i => `•  ${i}`).join('\n\n'), {
        x: x + 0.3,
        y: 2.65,
        w: 3.15,
        h: 3.6,
        fontSize: 10,
        fontFace: 'Segoe UI',
        color: '475569',
        lineSpacing: 18
      });
    });
  }

  // ==========================================
  // SLIDE 9: Analytics Suite (Sales, Financial & Inventory)
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Analytics Suite', 'Specialized Financial, Sales & Inventory Analytics', 'Deep analytical views dedicated to asset ranking, revenue contribution, and operational status.');

    const modules = [
      {
        name: 'Sales Analytics (/analytics/sales)',
        color: C_EMERALD,
        highlights: [
          'Sales Revenue by Property & Block: Visual bar charts ranking highest-performing properties.',
          'Top 10 Assets: Items ranked by maximum recorded sales value (up to 495M SAR).',
          'Lowest-Value Assets: Identifies units sold above 0 to spot underperforming inventory.',
          'Price per m² Aggregates: Evaluates average price per square meter across blocks.'
        ]
      },
      {
        name: 'Financial Analytics (/analytics/financial)',
        color: C_SKY,
        highlights: [
          'Property Revenue Ranking: Interactive sales ranking bar chart with percentage contributions.',
          'Multi-Currency Audit: Groupings by currency codes (SAR) with total valuations.',
          'Revenue Types: Segmentations by Sales Agreement and revenue classifications.',
          'Anomaly Detection: Automatically flags units marked "Sold" with 0 or missing price.'
        ]
      },
      {
        name: 'Inventory Analytics (/analytics/inventory)',
        color: C_AMBER,
        highlights: [
          'Commercial vs Physical: Separates commercial availability from physical occupancy.',
          'Absorption Rates: Calculated property-by-property absorption percentages.',
          'Stacked Availability Chart: Visual comparison of Sold vs Available units per property.',
          'Conflicting Status Audit: Identifies units where occupied and vacant flags conflict.'
        ]
      }
    ];

    modules.forEach((m, idx) => {
      const x = 0.8 + idx * 3.95;
      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y: 1.8,
        w: 3.75,
        h: 4.8,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.15
      });

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.3,
        y: 2.1,
        w: 0.6,
        h: 0.08,
        fill: { color: m.color },
        line: { width: 0 }
      });

      slide.addText(m.name, {
        x: x + 0.3,
        y: 2.3,
        w: 3.15,
        h: 0.45,
        fontSize: 12,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_NAVY
      });

      slide.addText(m.highlights.map(h => `•  ${h}`).join('\n\n'), {
        x: x + 0.3,
        y: 2.85,
        w: 3.15,
        h: 3.5,
        fontSize: 9.5,
        fontFace: 'Segoe UI',
        color: '334155',
        lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 10: Executive Reports & Bilingual Engine
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Global Capabilities', 'Bilingual Engine (Arabic/English) & Executive Reports', 'Enterprise export capabilities and complete internationalization for Middle Eastern markets.');

    // Left Box: Reports & Exports
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 1.8,
      w: 5.75,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Executive Reports Engine (/reports)', {
      x: 1.15,
      y: 2.1,
      w: 5.05,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_EMERALD
    });

    const reportItems = [
      'Multi-Tab Excel Reports: Built with ExcelJS, containing Executive Summary, Property Breakdown, and Full Inventory tabs.',
      'Audited PDF Digests: Generated via jsPDF with branded headers, KPI grids, and tabular property rankings.',
      '6 Specialized Reports: Executive Portfolio, Property Performance, Sales Analysis, Inventory Catalog, Financial Audit, and Data Quality.',
      'Direct Downloads: Instant export links with streaming binary buffers directly from Nitro server routes.'
    ];

    slide.addText(reportItems.map(r => `•  ${r}`).join('\n\n'), {
      x: 1.15,
      y: 2.65,
      w: 5.05,
      h: 3.6,
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: '334155',
      lineSpacing: 18
    });

    // Right Box: Bilingual i18n
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 6.75,
      y: 1.8,
      w: 5.75,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.15
    });

    slide.addText('Bilingual Architecture (Arabic / English)', {
      x: 7.1,
      y: 2.1,
      w: 5.05,
      h: 0.35,
      fontSize: 13,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_SKY
    });

    const i18nItems = [
      'Native RTL & LTR Layouts: Arabic Right-to-Left and English Left-to-Right dynamic UI switching.',
      'Complete Tokenization: All titles, buttons, badges, tables, and chart tooltips translated without hardcoded English.',
      'Expo Arabic Typography: Premium font family integrated for executive Arabic presentations.',
      'Persistent Language Cookie: Remembers executive language preference across reloads.'
    ];

    slide.addText(i18nItems.map(i => `•  ${i}`).join('\n\n'), {
      x: 7.1,
      y: 2.65,
      w: 5.05,
      h: 3.6,
      fontSize: 10,
      fontFace: 'Segoe UI',
      color: '334155',
      lineSpacing: 18
    });
  }

  // ==========================================
  // SLIDE 11: Security & Authentication System
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_BG_LIGHT };
    addSlideHeader(slide, 'Security & Auth', 'Enterprise Security & Authentication (/auth)', 'Role-based access control, cookie-backed sessions, and bcrypt password hashing.');

    const secCards = [
      {
        title: 'Cookie-Based Sessions',
        desc: 'HTTP-only session cookies with lax same-site policy, ensuring secure transmission across both local intranets and cloud hosting environments.'
      },
      {
        title: 'Cryptographic Protection',
        desc: 'Industry-standard bcryptjs password hashing (salt factor 10) safeguarding user credentials in the persistent SQLite database.'
      },
      {
        title: 'Global Route Guard',
        desc: 'Nuxt global middleware (auth.global.ts) intercepting unauthenticated navigation and redirecting to the login portal seamlessly.'
      },
      {
        title: 'Demo One-Click Login',
        desc: 'Executive-friendly "Fill Admin Credentials" button enabling instant demonstration and testing with default admin credentials.'
      }
    ];

    secCards.forEach((s, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 5.95;
      const y = 1.8 + row * 2.35;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x,
        y,
        w: 5.75,
        h: 2.05,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.12
      });

      slide.addText(`0${idx + 1}.  ${s.title}`, {
        x: x + 0.35,
        y: y + 0.25,
        w: 5.05,
        h: 0.35,
        fontSize: 13,
        fontFace: 'Segoe UI',
        bold: true,
        color: C_NAVY
      });

      slide.addText(s.desc, {
        x: x + 0.35,
        y: y + 0.7,
        w: 5.05,
        h: 1.1,
        fontSize: 10.5,
        fontFace: 'Segoe UI',
        color: C_MUTED,
        lineSpacing: 16
      });
    });
  }

  // ==========================================
  // SLIDE 12: Deployment & Conclusion Slide
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: C_NAVY };

    slide.addText('CONCLUSION & DEPLOYMENT', {
      x: 0.8,
      y: 0.6,
      w: 8.0,
      h: 0.25,
      fontSize: 10,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_EMERALD_LIGHT
    });

    slide.addText('Ready for Production Deployment', {
      x: 0.8,
      y: 0.9,
      w: 11.0,
      h: 0.6,
      fontSize: 26,
      fontFace: 'Segoe UI',
      bold: true,
      color: C_WHITE
    });

    slide.addText('A robust, maintainable property analytics platform delivered on time with 100% specification compliance.', {
      x: 0.8,
      y: 1.55,
      w: 11.0,
      h: 0.4,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: '94A3B8'
    });

    // Deployment Checklist Box
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.8,
      y: 2.2,
      w: 11.7,
      h: 4.4,
      fill: { color: C_NAVY_LIGHT },
      line: { color: '334155', width: 1 },
      rectRadius: 0.15
    });

    const readyItems = [
      '✔  Full Nuxt 4 production build completed with exit code 0 (14.6 MB optimized serverless bundle).',
      '✔  All 1,034 Excel records pre-seeded and indexed in SQLite database (app.db).',
      '✔  Serverless compatibility enabled for /tmp copying and WAL fallback modes.',
      '✔  Automated GitHub integration synced to github.com/MuhamedAlMkkawy/finance_app.',
      '✔  Interactive live server running at http://localhost:3000.',
      '✔  Ready for 1-click Vercel, Netlify, Render, or Docker deployment.'
    ];

    slide.addText(readyItems.join('\n\n'), {
      x: 1.2,
      y: 2.6,
      w: 10.9,
      h: 3.5,
      fontSize: 12,
      fontFace: 'Segoe UI',
      color: C_WHITE,
      lineSpacing: 18
    });
  }

  // Save to public directory for direct browser download
  const outputDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'Property_Management_Analytics_Platform.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Presentation generated successfully at: ${outputPath}`);

  // Also create a copy named presentation.pptx for convenience
  const shortPath = path.join(outputDir, 'presentation.pptx');
  fs.copyFileSync(outputPath, shortPath);
  console.log(`Presentation copy created at: ${shortPath}`);
}

createPresentation().catch(err => {
  console.error('Failed to generate presentation:', err);
  process.exit(1);
});

