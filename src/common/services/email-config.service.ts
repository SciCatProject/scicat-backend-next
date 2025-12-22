import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class EmailConfigService {
  private config: Record<string, any> | null = null;

  constructor() {
    this.loadConfig();
  }

  // Loads the configuration file if it exists
  private loadConfig(): void {
    const configFilePath = path.join(__dirname, "email-templates.json");

    if (fs.existsSync(configFilePath)) {
      const configFile = fs.readFileSync(configFilePath, "utf-8");
      this.config = JSON.parse(configFile);
    } else {
      console.warn("email-templates.json file not found.");
      this.config = null;
    }
  }

  // Returns the email template if the configuration file is loaded
  getTemplate(templateName: string): { subject: string; body: string } | null {
    if (this.config) {
      return this.config[templateName] || null;
    }
    return null;
  }
}
