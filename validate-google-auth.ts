#!/usr/bin/env bun

/**
 * Google Auth Integration Validation Script
 *
 * This script validates that the Google Auth integration is properly configured.
 * Run with: bun run validate-google-auth.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

interface ValidationResult {
  success: boolean;
  message: string;
}

function validateEnvironmentVariables(): ValidationResult[] {
  const results: ValidationResult[] = [];

  const requiredVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];

    if (!value) {
      results.push({
        success: false,
        message: `❌ Missing required environment variable: ${varName}`,
      });
    } else if (
      value.includes("your_") ||
      value.includes("_here") ||
      value === "your_google_client_id" ||
      value === "your_google_client_secret"
    ) {
      results.push({
        success: false,
        message: `❌ Environment variable ${varName} contains placeholder value. Please update with actual Google OAuth credentials.`,
      });
    } else {
      results.push({
        success: true,
        message: `✅ ${varName} is configured`,
      });
    }
  }

  return results;
}

function validateCallbackUrl(): ValidationResult {
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;

  if (!callbackUrl) {
    return {
      success: false,
      message: "❌ GOOGLE_CALLBACK_URL is not set",
    };
  }

  try {
    const url = new URL(callbackUrl);

    if (!url.pathname.includes("/auth/callback")) {
      return {
        success: false,
        message: `❌ GOOGLE_CALLBACK_URL should end with '/auth/callback', got: ${url.pathname}`,
      };
    }

    return {
      success: true,
      message: `✅ GOOGLE_CALLBACK_URL is properly formatted: ${callbackUrl}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `❌ GOOGLE_CALLBACK_URL is not a valid URL: ${callbackUrl}`,
    };
  }
}

function checkConfigFile(): ValidationResult {
  try {
    // Check if the config file exists and is readable
    const configPath = resolve(process.cwd(), "medusa-config.ts");
    const fs = require("fs");

    if (!fs.existsSync(configPath)) {
      return {
        success: false,
        message: "❌ medusa-config.ts file not found",
      };
    }

    const configContent = fs.readFileSync(configPath, "utf8");

    if (configContent.includes("@medusajs/medusa/auth-google")) {
      return {
        success: true,
        message: "✅ Google Auth Module is configured in medusa-config.ts",
      };
    } else {
      return {
        success: false,
        message: "❌ Google Auth Module not found in medusa-config.ts",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Error reading medusa-config.ts: ${error.message}`,
    };
  }
}

function main() {
  console.log("🔍 Validating Google Auth Integration...\n");

  const envResults = validateEnvironmentVariables();
  const callbackResult = validateCallbackUrl();
  const configResult = checkConfigFile();

  const allResults = [...envResults, callbackResult, configResult];

  console.log("Environment Variables:");
  envResults.forEach((result) => console.log(`  ${result.message}`));

  console.log("\nCallback URL:");
  console.log(`  ${callbackResult.message}`);

  console.log("\nConfiguration:");
  console.log(`  ${configResult.message}`);

  const failedResults = allResults.filter((result) => !result.success);

  if (failedResults.length === 0) {
    console.log(
      "\n🎉 All validations passed! Google Auth integration is properly configured."
    );
    console.log("\nNext steps:");
    console.log("1. Start your Medusa backend: bun run dev");
    console.log(
      "2. Start your storefront: cd ../joyjunction-storefront && bun run dev"
    );
    console.log(
      "3. Visit http://localhost:8000/account and test Google Sign-In"
    );
    process.exit(0);
  } else {
    console.log(
      `\n❌ ${failedResults.length} validation(s) failed. Please fix the issues above.`
    );
    console.log("\nCommon fixes:");
    console.log(
      "- Copy .env.template to .env and fill in your Google OAuth credentials"
    );
    console.log("- Ensure GOOGLE_CALLBACK_URL ends with /auth/callback");
    console.log("- Get Google OAuth credentials from Google Cloud Console");
    console.log(
      "\nFor detailed setup instructions, see: ../GOOGLE_AUTH_SETUP.md"
    );
    process.exit(1);
  }
}

main();
