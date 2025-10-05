#!/usr/bin/env node

// Test Runner for D&D 2024 Play Tools
// Runs all unit tests and reports results

const { execSync } = require('child_process');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  D&D 2024 Play Tools - Unit Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

const testFiles = [
    'tests/character.test.js',
    'tests/encounter.test.js',
    'tests/server.test.js'
];

let totalPassed = 0;
let totalFailed = 0;

testFiles.forEach((testFile, index) => {
    const testPath = path.join(__dirname, testFile);
    const testName = path.basename(testFile, '.test.js');

    console.log(`\n[${ index + 1}/${testFiles.length}] Running ${testName} tests...`);
    console.log('─'.repeat(65));

    try {
        const output = execSync(`node "${testPath}"`, {
            encoding: 'utf-8',
            cwd: __dirname
        });

        console.log(output);

        // Count passed tests (lines with ✓)
        const passed = (output.match(/✓/g) || []).length;
        totalPassed += passed;

        console.log(`\n✅ ${testName} tests: ${passed} passed`);
    } catch (error) {
        console.error(`\n❌ ${testName} tests failed:`);
        console.error(error.stdout || error.message);
        totalFailed++;
    }
});

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Test Summary');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\n  Total Test Suites: ${testFiles.length}`);
console.log(`  Total Tests Passed: ${totalPassed}`);
console.log(`  Failed Test Suites: ${totalFailed}`);

if (totalFailed === 0) {
    console.log('\n  ✨ All tests passed! ✨\n');
    process.exit(0);
} else {
    console.log(`\n  ⚠️  ${totalFailed} test suite(s) failed\n`);
    process.exit(1);
}
