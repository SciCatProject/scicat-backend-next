import { Logger } from "@nestjs/common";
import { unit } from "mathjs";
import { createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { DerivedDataset } from "src/datasets/schemas/derived-dataset.schema";
import { RawDataset } from "src/datasets/schemas/raw-dataset.schema";
import { IAxiosError, IScientificFilter } from "./interfaces/common.interface";
import { ScientificRelation } from "./scientific-relation.enum";

export const convertToSI = (
  inputValue: number,
  inputUnit: string,
): { valueSI: number; unitSI: string } => {
  try {
    const quantity = unit(inputValue, inputUnit).toSI().toJSON();
    return { valueSI: Number(quantity.value), unitSI: quantity.unit };
  } catch (error) {
    console.error(error);
    return { valueSI: inputValue, unitSI: inputUnit };
  }
};

export const mapScientificQuery = (
  scientific: IScientificFilter[],
): Record<string, unknown> => {
  const scientificFilterQuery: Record<string, unknown> = {};

  scientific.forEach((scientificFilter) => {
    const { lhs, relation, rhs, unit } = scientificFilter;
    const matchKeyGeneric = `scientificMetadata.${lhs}`;
    const matchKeyMeasurement = `scientificMetadata.${lhs}.valueSI`;
    const matchUnit = `scientificMetadata.${lhs}.unitSI`;

    switch (relation) {
      case ScientificRelation.EQUAL_TO_STRING: {
        scientificFilterQuery[`${matchKeyGeneric}.value`] = { $eq: rhs };
        break;
      }
      case ScientificRelation.EQUAL_TO_NUMERIC: {
        if (unit && unit.length > 0) {
          const { valueSI, unitSI } = convertToSI(Number(rhs), unit);
          scientificFilterQuery[matchKeyMeasurement] = { $eq: valueSI };
          scientificFilterQuery[matchUnit] = { $eq: unitSI };
        } else {
          scientificFilterQuery[`${matchKeyGeneric}.value`] = { $eq: rhs };
        }
        break;
      }
      case ScientificRelation.GREATER_THAN: {
        if (unit && unit.length > 0) {
          const { valueSI, unitSI } = convertToSI(Number(rhs), unit);
          scientificFilterQuery[matchKeyMeasurement] = { $gt: valueSI };
          scientificFilterQuery[matchUnit] = { $eq: unitSI };
        } else {
          scientificFilterQuery[`${matchKeyGeneric}.value`] = { $gt: rhs };
        }
        break;
      }
      case ScientificRelation.LESS_THAN: {
        if (unit && unit.length > 0) {
          const { valueSI, unitSI } = convertToSI(Number(rhs), unit);
          scientificFilterQuery[matchKeyMeasurement] = { $lt: valueSI };
          scientificFilterQuery[matchUnit] = { $eq: unitSI };
        } else {
          scientificFilterQuery[`${matchKeyGeneric}.value`] = { $lt: rhs };
        }
        break;
      }
    }
  });

  return scientificFilterQuery;
};

/**Check if input is object or a physical quantity */
const isObject = (x: unknown) => {
  if (
    x &&
    typeof x === "object" &&
    !Array.isArray(x) &&
    !(x as Record<string, unknown>).unit &&
    (x as Record<string, unknown>).unit !== "" &&
    !(x as Record<string, unknown>).u &&
    (x as Record<string, unknown>).u !== ""
  ) {
    return true;
  }
  return false;
};

export const extractMetadataKeys = (datasets: unknown[]): string[] => {
  const keys = new Set<string>();
  //Return nested keys in this structure parentkey.childkey.grandchildkey....
  const flattenKeys = (object: Record<string, unknown>, keyStr: string) => {
    Object.keys(object).forEach((key) => {
      const value = object[key];
      const newKeyStr = `${keyStr ? keyStr + "." : ""}${key}`;
      if (isObject(value)) {
        flattenKeys(value as Record<string, unknown>, newKeyStr);
      } else {
        keys.add(newKeyStr);
      }
    });
  };
  datasets.forEach((dataset) => {
    if (dataset instanceof RawDataset && dataset.scientificMetadata) {
      const scientificMetadata = dataset.scientificMetadata;
      flattenKeys(scientificMetadata, "");
    }
    if (dataset instanceof DerivedDataset && dataset.scientificMetadata) {
      const scientificMetadata = dataset.scientificMetadata;
      flattenKeys(scientificMetadata, "");
    }
  });
  return Array.from(keys);
};

export const handleAxiosRequestError = (
  err: unknown,
  context?: string,
): void => {
  const error: IAxiosError = err as IAxiosError;
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    Logger.error(error.response.data, context);
    Logger.error(error.response.status, context);
    Logger.error(error.response.headers, context);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(error.request);
    Logger.error({ request: error.request }, context);
  } else {
    // Something happened in setting up the request that triggered an Error
    Logger.error("Error: " + error.message, context);
  }
  Logger.verbose(error.config, context);
};

export const sendMail = async (
  to: string,
  cc: string,
  subjectText: string,
  mailText: string | null,
  html: string | null = null,
) => {
  const smtpSettings: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
    secure: process.env.SMTP_SECURE === "yes" ? true : false,
  };
  const smtpMessage = {
    from: process.env.SMTP_MESSAGE_FROM,
    to: undefined,
    subject: undefined,
    text: undefined,
  };

  if (smtpSettings.host && smtpMessage) {
    try {
      const transporter = createTransport(smtpSettings);
      const message = {
        ...smtpMessage,
        to,
        ...(cc && { cc }),
        ...(subjectText && { subject: subjectText }),
        ...(html && { html }),
        ...(mailText && { mailText }),
      };
      Logger.log("Sending email to: " + to, "Utils.sendMail");
      return await transporter.sendMail(message);
    } catch (error) {
      Logger.error("Failed sending email to: " + to, "Utils.sendMail");
      Logger.error(error, "Utils.sendMail");
    }
  }
  return;
};
