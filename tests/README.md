# Cross-Browser Testing with Playwright

This directory contains cross-browser compatibility tests for the MySpaWebsite application using Playwright.

## Test Structure

### Test Files
- **`home.cross.spec.js`** - Tests Home page rendering, statistics, and responsive behavior
- **`appointments.cross.spec.js`** - Tests Appointments page table/card views and accordion functionality
- **`expenses.cross.spec.js`** - Tests Expenses page table/card views and accordion functionality
- **`reports.cross.spec.js`** - Tests Reports page charts, tables, and financial calculations
- **`chatbot.cross.spec.js`** - Tests ChatBot functionality and appointment workflows

### Browser Projects
- **`chromium`** - Chrome/Edge compatibility
- **`firefox`** - Firefox compatibility
- **`webkit`** - Safari/iOS compatibility
- **`Mobile Chrome`** - Mobile Chrome viewport
- **`Mobile Safari`** - Mobile Safari viewport

## Setup

### 1. Install Playwright
```bash
npm run test:e2e:install
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Application
```bash
npm start
```

## Running Tests

### Run All Cross-Browser Tests
```bash
npm run test:e2e
```

### Run Tests in Headed Mode (See browser windows)
```bash
npm run test:e2e:headed
```

### Run Tests for Specific Browsers
```bash
# Chrome/Edge
npm run test:e2e:chromium

# Firefox
npm run test:e2e:firefox

# Safari
npm run test:e2e:webkit

# Mobile browsers
npm run test:e2e:mobile
```

### Run Tests with UI Mode
```bash
npm run test:e2e:ui
```

### Run Tests in Debug Mode
```bash
npm run test:e2e:debug
```

### Generate Test Code
```bash
npm run test:e2e:codegen
```

## Test Configuration

The tests are configured in `playwright.config.js` with:
- Base URL: `http://localhost:3000`
- Automatic server startup with `npm start`
- Screenshot capture on failure
- Video recording on failure
- Trace collection on retry

## What Tests Cover

### Cross-Browser Compatibility
- **Rendering Consistency** - Visual elements appear the same across browsers
- **Layout Behavior** - Flexbox, Grid, and responsive breakpoints work correctly
- **CSS Features** - Gradients, shadows, transitions, and focus states
- **JavaScript APIs** - Fetch, localStorage, ResizeObserver compatibility
- **Form Elements** - Input types, validation, and accessibility

### Responsive Design
- **Desktop View** (1200x800) - Full layout with tables and charts
- **Tablet View** (768x1024) - Intermediate breakpoint behavior
- **Mobile View** (375x667) - Mobile card layouts and touch-friendly UI

### Functionality Testing
- **Navigation** - Page routing and content loading
- **Interactive Elements** - Buttons, forms, accordions, modals
- **Data Display** - Tables, charts, statistics, mobile cards
- **User Input** - ChatBot, form submissions, keyboard navigation

## Test Results

### HTML Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

### Screenshots and Videos
- Screenshots are saved on test failures
- Videos are recorded for failed tests
- Traces are collected for debugging

## Debugging

### View Test Execution
```bash
npm run test:e2e:headed
```

### Debug Specific Test
```bash
npm run test:e2e:debug -- --grep "should render hero section"
```

### Generate Test from Browser Actions
```bash
npm run test:e2e:codegen
```

## Continuous Integration

The tests are configured for CI environments:
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, parallel locally
- Fail fast on CI with `forbidOnly`

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Mobile Chrome | Mobile Safari |
|---------|--------|---------|--------|---------------|----------------|
| Flexbox/Grid | ✅ | ✅ | ✅ | ✅ | ✅ |
| CSS Variables | ✅ | ✅ | ✅ | ✅ | ✅ |
| ES6+ Features | ✅ | ✅ | ✅ | ✅ | ✅ |
| Fetch API | ✅ | ✅ | ✅ | ✅ | ✅ |
| ResizeObserver | ✅ | ✅ | ✅ | ✅ | ✅ |
| Touch Events | ✅ | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### Common Issues

1. **Tests fail on first run**
   - Ensure the app is running: `npm start`
   - Check that port 3000 is available

2. **Browser-specific failures**
   - Run individual browser tests to isolate issues
   - Check browser console for JavaScript errors

3. **Visual inconsistencies**
   - Use headed mode to see actual rendering
   - Check CSS vendor prefixes and browser support

4. **Mobile viewport issues**
   - Verify mobile breakpoints in CSS
   - Test with actual mobile devices if possible

### Performance Tips

- Use `--project=chromium` for faster development testing
- Run specific test files: `npx playwright test home.cross.spec.js`
- Use `--workers=1` for debugging complex interactions

## Contributing

When adding new cross-browser tests:
1. Follow the existing test structure
2. Test across all browser projects
3. Include responsive design testing
4. Add proper error handling and timeouts
5. Document any browser-specific workarounds
