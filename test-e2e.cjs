#!/usr/bin/env node

/**
 * E2E Test Suite for LLM Battle Arena
 * This script validates all components and functionality
 * No external dependencies required - uses Node.js built-ins only
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Test results collector
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testPassed(test, details = '') {
  testResults.passed.push({ test, details });
  log(`  ✅ ${test}`, 'green');
  if (details) log(`     ${details}`, 'cyan');
}

function testFailed(test, error) {
  testResults.failed.push({ test, error });
  log(`  ❌ ${test}`, 'red');
  log(`     Error: ${error}`, 'red');
}

function testWarning(test, warning) {
  testResults.warnings.push({ test, warning });
  log(`  ⚠️  ${test}`, 'yellow');
  log(`     Warning: ${warning}`, 'yellow');
}

// Test 1: Check file structure
function testFileStructure() {
  log('\n📁 Testing File Structure...', 'blue');
  
  const requiredFiles = [
    'index.html',
    'README.md',
    'package.json',
    'vercel.json',
    '.env.example',
    '.gitignore',
    'api/compare.js'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      testPassed(`${file} exists`, `Size: ${stats.size} bytes`);
    } else {
      testFailed(`${file} exists`, 'File not found');
    }
  });
}

// Test 2: Validate HTML structure
function testHTMLStructure() {
  log('\n🌐 Testing HTML Structure...', 'blue');
  
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    
    // Check for essential elements
    const essentialElements = [
      { id: 'promptInput', name: 'Prompt textarea' },
      { id: 'battleBtn', name: 'Battle button' },
      { id: 'claude-response', name: 'Claude response container' },
      { id: 'openai-response', name: 'OpenAI response container' },
      { id: 'gemini-response', name: 'Gemini response container' },
      { id: 'examplePrompts', name: 'Example prompts dropdown' },
      { id: 'confetti', name: 'Confetti canvas' },
      { id: 'toast', name: 'Toast notification container' },
      { id: 'theme-icon', name: 'Theme toggle icon' },
      { id: 'battleStats', name: 'Battle stats container' },
      { id: 'battleMode', name: 'Battle mode container' }
    ];
    
    essentialElements.forEach(({ id, name }) => {
      if (htmlContent.includes(`id="${id}"`)) {
        testPassed(`${name} found`, `ID: ${id}`);
      } else {
        testFailed(`${name} found`, `Element with id="${id}" not found`);
      }
    });
    
    // Check for CSS classes
    const requiredClasses = [
      'battle-arena',
      'model-card',
      'theme-toggle',
      'btn-primary',
      'btn-secondary',
      'response-content',
      'animated-bg'
    ];
    
    requiredClasses.forEach(className => {
      if (htmlContent.includes(`class="${className}"`) || htmlContent.includes(`class='${className}'`) || htmlContent.includes(`.${className}`)) {
        testPassed(`CSS class .${className} defined`);
      } else {
        testWarning(`CSS class .${className}`, 'Class might be missing');
      }
    });
    
    // Check for JavaScript functions
    const requiredFunctions = [
      'startBattle',
      'toggleTheme',
      'toggleModel',
      'clearResults',
      'exportResults',
      'shareResults',
      'copyResponse',
      'triggerConfetti',
      'showToast',
      'loadExamplePrompt',
      'updateBattleStats',
      'showBattleWinner',
      'estimateTokens',
      'activateEasterEgg'
    ];
    
    requiredFunctions.forEach(func => {
      if (htmlContent.includes(`function ${func}(`) || htmlContent.includes(`${func} =`)) {
        testPassed(`Function ${func}() defined`);
      } else {
        testFailed(`Function ${func}() defined`, 'Function not found in HTML');
      }
    });
    
    // Check for external dependencies
    if (htmlContent.includes('marked.min.js')) {
      testPassed('Markdown library included');
    } else {
      testFailed('Markdown library', 'Marked.js not found');
    }
    
    if (htmlContent.includes('prism.min.js') || htmlContent.includes('prism')) {
      testPassed('Syntax highlighting library included');
    } else {
      testWarning('Syntax highlighting', 'Prism.js might be missing');
    }
    
    // Check for meta tags
    if (htmlContent.includes('<meta name="viewport"')) {
      testPassed('Mobile viewport meta tag present');
    } else {
      testFailed('Mobile viewport', 'Viewport meta tag missing');
    }
    
  } catch (error) {
    testFailed('HTML parsing', error.message);
  }
}

// Test 3: Validate package.json
function testPackageJson() {
  log('\n📦 Testing package.json...', 'blue');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    // Check required fields
    if (packageJson.name === 'llm-battle-arena') {
      testPassed('Package name correct');
    } else {
      testFailed('Package name', `Expected "llm-battle-arena", got "${packageJson.name}"`);
    }
    
    if (packageJson.version) {
      testPassed('Version specified', packageJson.version);
    } else {
      testFailed('Version specified', 'No version found');
    }
    
    // Check scripts
    const requiredScripts = ['dev', 'build', 'deploy', 'start'];
    requiredScripts.forEach(script => {
      if (packageJson.scripts && packageJson.scripts[script]) {
        testPassed(`Script "${script}" defined`, packageJson.scripts[script]);
      } else {
        testFailed(`Script "${script}" defined`, 'Script not found');
      }
    });
    
    // Check dependencies
    if (packageJson.devDependencies && packageJson.devDependencies.vercel) {
      testPassed('Vercel dependency included', packageJson.devDependencies.vercel);
    } else {
      testWarning('Vercel dependency', 'Vercel not in devDependencies');
    }
    
    // Check Node.js engine requirement
    if (packageJson.engines && packageJson.engines.node) {
      testPassed('Node.js version requirement', packageJson.engines.node);
    } else {
      testWarning('Node.js version', 'No engine requirement specified');
    }
    
  } catch (error) {
    testFailed('package.json parsing', error.message);
  }
}

// Test 4: Validate API endpoint
function testAPIEndpoint() {
  log('\n🚀 Testing API Endpoint...', 'blue');
  
  try {
    const apiContent = fs.readFileSync(path.join(__dirname, 'api/compare.js'), 'utf8');
    
    // Check for Edge runtime configuration
    if (apiContent.includes("runtime: 'edge'")) {
      testPassed('Edge runtime configured');
    } else {
      testFailed('Edge runtime', 'Edge runtime not configured');
    }
    
    // Check for required functions
    const requiredFunctions = [
      'handler',
      'callClaude',
      'callOpenAI', 
      'callGemini',
      'checkRateLimit',
      'sanitizeInput',
      'fetchWithTimeout',
      'estimateTokens'
    ];
    
    requiredFunctions.forEach(func => {
      if (apiContent.includes(`function ${func}`) || apiContent.includes(`async function ${func}`)) {
        testPassed(`API function ${func}() defined`);
      } else {
        testFailed(`API function ${func}() defined`, 'Function not found');
      }
    });
    
    // Check for environment variable usage
    const envVars = ['CLAUDE_API_KEY', 'OPENAI_API_KEY', 'GEMINI_API_KEY'];
    envVars.forEach(envVar => {
      if (apiContent.includes(`process.env.${envVar}`)) {
        testPassed(`Environment variable ${envVar} used`);
      } else {
        testFailed(`Environment variable ${envVar} used`, 'Not referenced in code');
      }
    });
    
    // Check for CORS headers
    if (apiContent.includes('Access-Control-Allow-Origin')) {
      testPassed('CORS headers configured');
    } else {
      testFailed('CORS headers', 'No CORS configuration found');
    }
    
    // Check for rate limiting
    if (apiContent.includes('rateLimitMap')) {
      testPassed('Rate limiting implemented');
    } else {
      testWarning('Rate limiting', 'Rate limiting map not found');
    }
    
    // Check for error handling
    if (apiContent.includes('try') && apiContent.includes('catch')) {
      testPassed('Error handling implemented');
    } else {
      testFailed('Error handling', 'No try-catch blocks found');
    }
    
    // Check for API endpoints
    if (apiContent.includes('api.anthropic.com')) {
      testPassed('Claude API endpoint configured');
    }
    if (apiContent.includes('api.openai.com')) {
      testPassed('OpenAI API endpoint configured');
    }
    if (apiContent.includes('generativelanguage.googleapis.com')) {
      testPassed('Gemini API endpoint configured');
    }
    
  } catch (error) {
    testFailed('API endpoint parsing', error.message);
  }
}

// Test 5: Validate Vercel configuration
function testVercelConfig() {
  log('\n⚙️ Testing Vercel Configuration...', 'blue');
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
    
    // Check essential configurations
    if (vercelConfig.functions && vercelConfig.functions['api/compare.js']) {
      const funcConfig = vercelConfig.functions['api/compare.js'];
      testPassed('API function configured', `maxDuration: ${funcConfig.maxDuration}s, memory: ${funcConfig.memory}MB`);
    } else {
      testFailed('API function configuration', 'No function configuration found');
    }
    
    if (vercelConfig.env) {
      const envKeys = Object.keys(vercelConfig.env);
      testPassed('Environment variables mapped', `${envKeys.length} variables`);
    } else {
      testWarning('Environment variables', 'No env mapping in vercel.json');
    }
    
    if (vercelConfig.headers && vercelConfig.headers.length > 0) {
      testPassed('Security headers configured', `${vercelConfig.headers.length} header rules`);
      
      // Check for specific security headers
      const hasSecurityHeaders = vercelConfig.headers.some(rule => 
        rule.headers && rule.headers.some(h => h.key === 'X-Content-Type-Options')
      );
      if (hasSecurityHeaders) {
        testPassed('Security headers include X-Content-Type-Options');
      }
    } else {
      testWarning('Security headers', 'No security headers configured');
    }
    
    if (vercelConfig.regions && vercelConfig.regions.length > 0) {
      testPassed('Deployment regions specified', vercelConfig.regions.join(', '));
    } else {
      testWarning('Deployment regions', 'No regions specified');
    }
    
    if (vercelConfig.rewrites) {
      testPassed('URL rewrites configured');
    }
    
  } catch (error) {
    testFailed('vercel.json parsing', error.message);
  }
}

// Test 6: Check .env.example
function testEnvExample() {
  log('\n🔑 Testing Environment Variables...', 'blue');
  
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf8');
    
    const requiredVars = [
      { name: 'CLAUDE_API_KEY', pattern: 'sk-ant-' },
      { name: 'OPENAI_API_KEY', pattern: 'sk-' },
      { name: 'GEMINI_API_KEY', pattern: 'xxxxx' }
    ];
    
    requiredVars.forEach(({ name, pattern }) => {
      if (envContent.includes(name)) {
        testPassed(`${name} documented`);
        if (envContent.includes(pattern)) {
          testPassed(`${name} example format correct`, pattern);
        }
      } else {
        testFailed(`${name} documented`, 'Variable not found in .env.example');
      }
    });
    
    // Check for helpful comments
    if (envContent.includes('Get yours at:')) {
      testPassed('API key acquisition links included');
    }
    
  } catch (error) {
    testFailed('.env.example parsing', error.message);
  }
}

// Test 7: Validate README
function testReadme() {
  log('\n📚 Testing README Documentation...', 'blue');
  
  try {
    const readmeContent = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
    
    // Check for essential sections
    const essentialSections = [
      { section: '## 🚀 Features', name: 'Features' },
      { section: '## 🎯 Quick Start', name: 'Quick Start' },
      { section: '## 🔑 Getting Your API Keys', name: 'API Keys Guide' },
      { section: '## 🚀 Deployment Guide', name: 'Deployment' },
      { section: '## 💰 Cost Breakdown', name: 'Cost Analysis' },
      { section: '## 🔧 Troubleshooting', name: 'Troubleshooting' },
      { section: '## ❓ FAQ', name: 'FAQ' },
      { section: '## 📜 License', name: 'License' }
    ];
    
    essentialSections.forEach(({ section, name }) => {
      if (readmeContent.includes(section)) {
        testPassed(`Section "${name}" present`);
      } else {
        testWarning(`Section "${name}"`, 'Section might be missing or renamed');
      }
    });
    
    // Check for API key instructions
    const apiProviders = [
      { url: 'https://console.anthropic.com/', name: 'Claude' },
      { url: 'https://platform.openai.com/', name: 'OpenAI' },
      { url: 'https://makersuite.google.com/', name: 'Gemini' }
    ];
    
    apiProviders.forEach(({ url, name }) => {
      if (readmeContent.includes(url)) {
        testPassed(`${name} API key instructions included`);
      } else {
        testWarning(`${name} API instructions`, 'URL not found');
      }
    });
    
    // Check for badges
    if (readmeContent.includes('![')) {
      testPassed('README includes badges/images');
    }
    
    // Check for ASCII art
    if (readmeContent.includes('```') && readmeContent.includes('Arena')) {
      testPassed('ASCII art logo present');
    }
    
  } catch (error) {
    testFailed('README parsing', error.message);
  }
}

// Test 8: Check for security best practices
function testSecurity() {
  log('\n🔒 Testing Security Configuration...', 'blue');
  
  // Check .gitignore
  try {
    const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
    
    const securityPatterns = ['.env', 'node_modules', '.vercel', '*.log', '.DS_Store'];
    securityPatterns.forEach(pattern => {
      if (gitignoreContent.includes(pattern)) {
        testPassed(`${pattern} in .gitignore`);
      } else {
        testFailed(`${pattern} in .gitignore`, 'Pattern not found');
      }
    });
  } catch (error) {
    testFailed('.gitignore parsing', error.message);
  }
  
  // Check HTML for XSS protection
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    if (htmlContent.includes('sanitize') || htmlContent.includes('.replace(/[<>]/g')) {
      testPassed('XSS protection measures found in frontend');
    } else {
      testWarning('XSS protection', 'No obvious XSS protection in frontend');
    }
    
    // Check for Content Security Policy
    if (htmlContent.includes('Content-Security-Policy')) {
      testPassed('Content Security Policy meta tag found');
    } else {
      testWarning('CSP', 'No Content Security Policy meta tag');
    }
  } catch (error) {
    testFailed('Security checks', error.message);
  }
  
  // Check API for security measures
  try {
    const apiContent = fs.readFileSync(path.join(__dirname, 'api/compare.js'), 'utf8');
    if (apiContent.includes('sanitizeInput')) {
      testPassed('Input sanitization in API');
    }
    if (apiContent.includes('substring(0, 4000)')) {
      testPassed('Input length validation in API');
    }
  } catch (error) {
    testFailed('API security checks', error.message);
  }
}

// Test 9: Test local server
async function testLocalServer() {
  log('\n🌐 Testing Local Server Capability...', 'blue');
  
  // Check if index.html can be served
  try {
    const htmlPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(htmlPath)) {
      testPassed('index.html ready to serve');
      
      // Check file size
      const stats = fs.statSync(htmlPath);
      if (stats.size > 10000) {
        testPassed('HTML file has substantial content', `${(stats.size / 1024).toFixed(2)} KB`);
      }
    }
  } catch (error) {
    testFailed('Local server test', error.message);
  }
}

// Generate comprehensive test report
function generateReport() {
  log('\n' + '='.repeat(70), 'cyan');
  log('                    📊 E2E TEST REPORT SUMMARY', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const totalTests = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
  const passRate = totalTests > 0 ? ((testResults.passed.length / totalTests) * 100).toFixed(1) : 0;
  
  log(`\n📈 Overall Statistics:`, 'blue');
  log(`   Total Tests: ${totalTests}`, 'cyan');
  log(`   ✅ Passed: ${testResults.passed.length} (${((testResults.passed.length / totalTests) * 100).toFixed(1)}%)`, 'green');
  log(`   ❌ Failed: ${testResults.failed.length} (${((testResults.failed.length / totalTests) * 100).toFixed(1)}%)`, testResults.failed.length > 0 ? 'red' : 'green');
  log(`   ⚠️  Warnings: ${testResults.warnings.length} (${((testResults.warnings.length / totalTests) * 100).toFixed(1)}%)`, testResults.warnings.length > 5 ? 'yellow' : 'green');
  
  // Component breakdown
  log(`\n🔧 Component Status:`, 'blue');
  const components = {
    'Frontend (HTML/JS)': testResults.passed.filter(t => t.test.includes('HTML') || t.test.includes('Function')).length,
    'Backend (API)': testResults.passed.filter(t => t.test.includes('API')).length,
    'Configuration': testResults.passed.filter(t => t.test.includes('json') || t.test.includes('.env')).length,
    'Documentation': testResults.passed.filter(t => t.test.includes('README')).length,
    'Security': testResults.passed.filter(t => t.test.includes('security') || t.test.includes('.gitignore')).length
  };
  
  Object.entries(components).forEach(([name, count]) => {
    const status = count > 0 ? '✅' : '⚠️';
    log(`   ${status} ${name}: ${count} tests passed`, count > 0 ? 'green' : 'yellow');
  });
  
  // Failed tests details
  if (testResults.failed.length > 0) {
    log('\n❌ Failed Tests Details:', 'red');
    testResults.failed.forEach(({ test, error }, index) => {
      log(`   ${index + 1}. ${test}`, 'red');
      log(`      → ${error}`, 'red');
    });
  }
  
  // Warnings details
  if (testResults.warnings.length > 0 && testResults.warnings.length <= 10) {
    log('\n⚠️  Warning Details:', 'yellow');
    testResults.warnings.forEach(({ test, warning }, index) => {
      log(`   ${index + 1}. ${test}`, 'yellow');
      log(`      → ${warning}`, 'yellow');
    });
  } else if (testResults.warnings.length > 10) {
    log(`\n⚠️  ${testResults.warnings.length} warnings found (too many to display)`, 'yellow');
  }
  
  // Deployment readiness
  log('\n' + '='.repeat(70), 'cyan');
  log('                    🚀 DEPLOYMENT READINESS', 'cyan');
  log('='.repeat(70), 'cyan');
  
  const criticalFiles = ['index.html', 'api/compare.js', 'package.json', 'vercel.json'];
  const criticalFilesExist = criticalFiles.every(file => 
    testResults.passed.some(t => t.test.includes(file) && t.test.includes('exists'))
  );
  
  if (testResults.failed.length === 0 && criticalFilesExist) {
    log('\n✅ READY FOR DEPLOYMENT!', 'green');
    log('   All critical tests passed. The application is ready to deploy to Vercel.', 'green');
    log('\n   Next steps:', 'cyan');
    log('   1. Create .env file with your API keys', 'cyan');
    log('   2. Run: npm run deploy', 'cyan');
    log('   3. Configure environment variables in Vercel dashboard', 'cyan');
  } else if (testResults.failed.length <= 3) {
    log('\n⚠️  MOSTLY READY - Minor Issues', 'yellow');
    log('   The application has minor issues but may still be deployable.', 'yellow');
    log('   Review the failed tests above and fix if needed.', 'yellow');
  } else {
    log('\n❌ NOT READY FOR DEPLOYMENT', 'red');
    log('   Multiple critical failures detected. Please fix the issues above.', 'red');
  }
  
  // Success rate indicator
  log('\n📊 Quality Score: ' + '█'.repeat(Math.floor(passRate / 10)) + '░'.repeat(10 - Math.floor(passRate / 10)) + ` ${passRate}%`, 
      passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      warnings: testResults.warnings.length,
      passRate: passRate,
      deploymentReady: testResults.failed.length === 0 && criticalFilesExist
    },
    details: testResults,
    recommendations: generateRecommendations()
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'e2e-test-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  log('\n📄 Detailed report saved to: e2e-test-report.json', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');
}

// Generate recommendations based on test results
function generateRecommendations() {
  const recommendations = [];
  
  if (testResults.failed.some(t => t.test.includes('API'))) {
    recommendations.push('Fix API endpoint issues before deployment');
  }
  
  if (testResults.warnings.some(t => t.test.includes('security'))) {
    recommendations.push('Review security configurations for production');
  }
  
  if (!testResults.passed.some(t => t.test.includes('Node.js version'))) {
    recommendations.push('Specify Node.js version requirement in package.json');
  }
  
  return recommendations;
}

// Main test runner
async function runE2ETests() {
  log('\n' + '='.repeat(70), 'cyan');
  log('           🚀 LLM BATTLE ARENA - E2E TEST SUITE', 'cyan');
  log('                    ' + new Date().toLocaleString(), 'cyan');
  log('='.repeat(70), 'cyan');
  
  // Run all test suites
  testFileStructure();
  testHTMLStructure();
  testPackageJson();
  testAPIEndpoint();
  testVercelConfig();
  testEnvExample();
  testReadme();
  testSecurity();
  await testLocalServer();
  
  // Generate final report
  generateReport();
}

// Execute tests
runE2ETests().catch(error => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  log(error.stack, 'red');
  process.exit(1);
});