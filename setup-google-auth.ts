#!/usr/bin/env bun

/**
 * Quick setup utility for Google Auth configuration
 * This script helps initialize the .env file with Google Auth settings
 */

import { resolve } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";

function createEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  const templatePath = resolve(process.cwd(), ".env.template");

  console.log(`Checking for .env file at: ${envPath}`);
  console.log(`Checking for .env.template file at: ${templatePath}`);

  if (existsSync(envPath)) {
    console.log(
      "📋 .env file already exists. Please manually update it with your Google OAuth credentials."
    );
    console.log(
      "   Required variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL"
    );
    return;
  }

  if (!existsSync(templatePath)) {
    console.log(
      "❌ .env.template file not found. Please ensure you are in the correct directory."
    );
    return;
  }

  try {
    const templateContent = readFileSync(templatePath, "utf8");
    writeFileSync(envPath, templateContent);

    console.log("✅ Created .env file from template");
    console.log("📝 Please update the following variables in your .env file:");
    console.log("   - GOOGLE_CLIENT_ID: Your Google OAuth Client ID");
    console.log("   - GOOGLE_CLIENT_SECRET: Your Google OAuth Client Secret");
    console.log(
      "   - GOOGLE_CALLBACK_URL: Usually http://localhost:8000/auth/callback for development"
    );
    console.log("");
    console.log(
      "🔗 Get these credentials from: https://console.cloud.google.com/apis/credentials"
    );
    console.log(
      "📖 For detailed setup instructions, see: ../GOOGLE_AUTH_SETUP.md"
    );
  } catch (error) {
    console.error("❌ Error creating .env file:", error);
  }
}

async function main() {
  console.log("🚀 Google Auth Setup Utility\n");
  createEnvFile();
  console.log(
    '\n🔍 Run "bun validate-google-auth.ts" after updating your .env file to validate the configuration.'
  );
}

main().catch(console.error);
