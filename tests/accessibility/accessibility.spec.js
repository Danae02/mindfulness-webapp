import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';


// Inloggegevens per rol vanuit .env
const USERS = {
    client: {
        email:    process.env.TEST_CLIENT_EMAIL,
        password: process.env.TEST_CLIENT_PASSWORD,
    },
    admin: {
        email:    process.env.TEST_ADMIN_EMAIL,
        password: process.env.TEST_ADMIN_PASSWORD,
    },
    supervisor: {
        email:    process.env.TEST_SUPERVISOR_EMAIL,
        password: process.env.TEST_SUPERVISOR_PASSWORD,
    },
    researcher: {
        email:    process.env.TEST_RESEARCHER_EMAIL,
        password: process.env.TEST_RESEARCHER_PASSWORD,
    },
};

// inloggen als een specifieke rol
async function loginAs(page, role) {
    const user = USERS[role];
    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
}


// axe-scan uitvoeren op huidige pagina
async function scanPage(page) {
    return await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        // aria-roles uitgesloten: role="bar" in Inertia/NProgress voortgangsbalk is third-party
        .disableRules(['aria-roles'])
        .analyze();
}


// klik op een sidebar-menuitem en wacht tot de content geladen is, scan dan de pagina
async function scanSidebarView(page, menuLabel) {
    await page.getByRole('menuitem', { name: menuLabel }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    return await scanPage(page);
}


// 1. Publieke pagina's zonder login
test('inlogpagina heeft geen WCAG AA schendingen', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('registratiepagina heeft geen WCAG AA schendingen', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('introductieoefening heeft geen WCAG AA schendingen', async ({ page }) => {
    await page.goto('/exercises/intro');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});


// 2. cliënt: dashboard + oefeningen + audio + favorieten + profiel
test('client: dashboard heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'client');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('client: gevoelsvraag vóór oefening heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'client');
    // Oefening 2 — aanname: testgebruiker heeft deze vandaag nog niet gedaan
    await page.goto('/exercises/2');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('client: audioscherm heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'client');
    // Oefening 1 — aanname: al eerder voltooid, dus skipQuestions=true → audio direct zichtbaar
    await page.goto('/exercises/1');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('client: favorieten-pagina heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'client');
    await page.goto('/favorieten');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('client: profielpagina heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'client');
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

// 3. admi: dashboard + alle 6 sidebar-views
test('admin: dashboard (cursussen-overzicht) heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'admin');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('admin: cursus toevoegen heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'admin');
    const results = await scanSidebarView(page, 'Cursus toevoegen');
    expect(results.violations).toEqual([]);
});

test('admin: lijst van alle datapunten heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'admin');
    const results = await scanSidebarView(page, 'Lijst van alle datapunten');
    expect(results.violations).toEqual([]);
});

test('admin: lijst van alle gebruikers heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'admin');
    const results = await scanSidebarView(page, 'Lijst van alle gebruikers');
    expect(results.violations).toEqual([]);
});

test('admin: gevoelsvragen beheren heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'admin');
    const results = await scanSidebarView(page, 'Gevoelsvragen beheren');
    expect(results.violations).toEqual([]);
});

test('admin: backup en herstel heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'admin');
    const results = await scanSidebarView(page, 'Backup en herstel');
    expect(results.violations).toEqual([]);
});


// 4. begeleider: dashboard + cliëntdetail
test('supervisor: dashboard heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'supervisor');
    // Sluit de intro-modal als die verschijnt (eerste bezoek)
    const closeButton = page.getByRole('button', { name: /sluiten|sluit|close/i });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForLoadState('networkidle');
    }
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('supervisor: cliëntdetail heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'supervisor');
    // Sluit de intro-modal als die verschijnt
    const closeButton = page.getByRole('button', { name: /sluiten|sluit|close/i });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeButton.click();
        await page.waitForLoadState('networkidle');
    }
    // Klik op de eerste cliënt in de lijst om het detailpaneel te openen
    const firstClient = page.locator('[data-testid="client-row"], tbody tr, .client-item').first();
    if (await firstClient.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstClient.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
    }
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});


// 5. onderzoeker: dashboard + alle 4 sidebar-views
test('researcher: gevoelsmetingen heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'researcher');
    const results = await scanPage(page);
    expect(results.violations).toEqual([]);
});

test('researcher: log van de duur heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'researcher');
    const results = await scanSidebarView(page, 'Log van de Duur');
    expect(results.violations).toEqual([]);
});

test('researcher: alle datapunten heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'researcher');
    const results = await scanSidebarView(page, 'Alle datapunten');
    expect(results.violations).toEqual([]);
});

test('researcher: exporteer data heeft geen WCAG AA schendingen', async ({ page }) => {
    await loginAs(page, 'researcher');
    const results = await scanSidebarView(page, 'Exporteer data');
    expect(results.violations).toEqual([]);
});
