/**
 * This defines a nodemailer transport implementing the MS365 Graph API.
 *
 * https://learn.microsoft.com/en-us/graph/api/resources/mail-api-overview
 */
import { SentMessageInfo, Transport } from "nodemailer";
import MailMessage from "nodemailer/lib/mailer/mail-message";
import { HttpService } from "@nestjs/axios";
import { Address } from "nodemailer/lib/mailer";
import { firstValueFrom } from "rxjs";
import { Injectable, Logger } from "@nestjs/common";

// Define interface for access token response
interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface MSGraphMailTransportOptions {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  tenantId: string;
}

function getAddress(address: string | Address): {
  name?: string;
  address: string;
} {
  return typeof address === "object" ? address : { address };
}

// Define the Microsoft Graph Transport class
@Injectable()
export class MSGraphMailTransport implements Transport {
  name: string;
  version: string;
  private clientId: string;
  private clientSecret: string;
  private refreshToken?: string;
  private tenantId: string;
  private cachedAccessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private readonly httpService: HttpService,
    options: MSGraphMailTransportOptions,
  ) {
    this.httpService.axiosRef.defaults.headers["Content-Type"] =
      "application/json";
    this.name = "Microsoft Graph API Transport";
    this.version = "1.0.0";
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.refreshToken = options.refreshToken;
    this.tenantId = options.tenantId;
  }

  // Method to send email using Microsoft Graph API
  send(
    mail: MailMessage,
    callback: (err: Error | null, info?: SentMessageInfo) => void,
  ): void {
    this.getAccessToken().then(
      (accessToken) => {
        this.sendEmail(accessToken, mail).then(
          (info) => {
            callback(null, info);
          },
          (err) => {
            callback(err, undefined);
          },
        );
      },
      (err) => {
        callback(err, undefined);
      },
    );
  }

  // Method to fetch or return cached access token
  private getAccessToken(): Promise<string> {
    if (
      this.cachedAccessToken != null &&
      Date.now() < (this.tokenExpiry ?? 0)
    ) {
      return ((token: string) =>
        new Promise<string>((resolve) => resolve(token)))(
        this.cachedAccessToken,
      );
    }

    const body: Record<string, string> = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    if (this.refreshToken) {
      body["refresh_token"] = this.refreshToken;
      body["grant_type"] = "refresh_token";
    } else {
      body["grant_type"] = "client_credentials";
      body["scope"] = "https://graph.microsoft.com/.default";
    }

    return firstValueFrom(
      this.httpService.post<TokenResponse>(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        body,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      ),
    ).then((response) => {
      this.cachedAccessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.cachedAccessToken;
    });
  }

  private sendEmail(
    accessToken: string,
    mail: MailMessage,
  ): Promise<SentMessageInfo> {
    const { to, subject, text, html, from } = mail.data;

    // Construct email payload for Microsoft Graph API
    const emailPayload = {
      message: {
        subject: subject,
        body: {
          contentType: html ? "HTML" : "Text",
          content: html || text,
        },
        toRecipients: Array.isArray(to)
          ? to.map((recipient: string | Address) => getAddress(recipient))
          : [{ emailAddress: { address: to } }],
      },
    };

    // Send the email using Microsoft Graph API
    return firstValueFrom(
      this.httpService.post<void>(
        `https://graph.microsoft.com/v1.0/users/${from}/sendMail`,
        emailPayload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      ),
    ).then(
      (response) => {
        if (response.status === 202) {
          return {
            envelope: mail.message.getEnvelope(),
            messageId: mail.message.messageId,
          };
        }

        throw new Error("Failed to send email: " + response.statusText);
      },
      (err) => {
        Logger.error(err);
        throw err;
      },
    );
  }
}
