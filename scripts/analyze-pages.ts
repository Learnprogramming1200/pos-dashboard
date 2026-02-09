/**
 * Page Migration Helper Script
 * 
 * This script helps identify all pages that need to be migrated
 * from legacy routes (/admin, /manager, /cashier) to /dashboard.
 * 
 * Run with: npx ts-node scripts/analyze-pages.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const appDir = path.join(__dirname, '..', 'src', 'app');
const legacyRoles = ['admin', 'manager', 'cashier'];

interface PageInfo {
    role: string;
    path: string;
    fullPath: string;
    hasDashboardEquivalent: boolean;
    dashboardPath: string;
}

function findPages(dir: string, baseRole: string, relativePath: string = ''): PageInfo[] {
    const pages: PageInfo[] = [];

    if (!fs.existsSync(dir)) return pages;

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Recurse into subdirectories
            pages.push(...findPages(fullPath, baseRole, path.join(relativePath, item)));
        } else if (item === 'page.tsx' || item === 'page.ts') {
            const routePath = relativePath || '/';
            const dashboardPath = routePath === '/' ? '/dashboard' : `/dashboard${routePath}`;
            const dashboardFullPath = path.join(appDir, 'dashboard', relativePath, 'page.tsx');

            pages.push({
                role: baseRole,
                path: `/${baseRole}${relativePath}`,
                fullPath,
                hasDashboardEquivalent: fs.existsSync(dashboardFullPath),
                dashboardPath,
            });
        }
    }

    return pages;
}

function analyzePages() {
    console.log('='.repeat(80));
    console.log('PAGE MIGRATION ANALYSIS');
    console.log('='.repeat(80));
    console.log();

    const allPages: PageInfo[] = [];

    for (const role of legacyRoles) {
        const roleDir = path.join(appDir, role);
        const pages = findPages(roleDir, role);
        allPages.push(...pages);
    }

    // Group by role
    const byRole = allPages.reduce((acc, page) => {
        if (!acc[page.role]) acc[page.role] = [];
        acc[page.role].push(page);
        return acc;
    }, {} as Record<string, PageInfo[]>);

    for (const role of legacyRoles) {
        const pages = byRole[role] || [];
        console.log(`\n## ${role.toUpperCase()} (${pages.length} pages)`);
        console.log('-'.repeat(40));

        for (const page of pages) {
            const status = page.hasDashboardEquivalent ? '✅' : '❌';
            console.log(`${status} ${page.path} -> ${page.dashboardPath}`);
        }
    }

    // Summary
    const needsMigration = allPages.filter(p => !p.hasDashboardEquivalent);
    const alreadyMigrated = allPages.filter(p => p.hasDashboardEquivalent);

    console.log('\n');
    console.log('='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total pages: ${allPages.length}`);
    console.log(`Already migrated: ${alreadyMigrated.length}`);
    console.log(`Needs migration: ${needsMigration.length}`);

    if (needsMigration.length > 0) {
        console.log('\nPages needing migration:');
        for (const page of needsMigration) {
            console.log(`  - ${page.path}`);
        }
    }

    // Get unique routes (ignoring role)
    const uniqueRoutes = new Set(allPages.map(p => p.dashboardPath));
    console.log(`\nUnique routes to create in /dashboard: ${uniqueRoutes.size}`);
}

analyzePages();
