import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AdminService } from "./admin.service";

const mockConfig: Record<string, unknown> = {
  accessTokenPrefix: "Bearer ",
  addDatasetEnabled: false,
  archiveWorkflowEnabled: false,
  datasetReduceEnabled: true,
  datasetJsonScientificMetadata: true,
  editDatasetSampleEnabled: true,
  editMetadataEnabled: true,
  editPublishedData: false,
  addSampleEnabled: false,
  externalAuthEndpoint: "/api/v3/auth/msad",
  facility: "SciCat Vanilla",
  siteIcon: "site-header-logo.png",
  loginFacilityLabel: "SciCat Vanilla",
  loginLdapLabel: "Ldap",
  loginLocalLabel: "Local",
  loginFacilityEnabled: true,
  loginLdapEnabled: true,
  loginLocalEnabled: true,
  localLoginLabel: "Local",
  fileColorEnabled: true,
  fileDownloadEnabled: true,
  gettingStarted: null,
  ingestManual: null,
  jobsEnabled: true,
  jsonMetadataEnabled: true,
  jupyterHubUrl: "",
  landingPage: "doi.ess.eu/detail/",
  lbBaseURL: "http://localhost:3000",
  logbookEnabled: true,
  loginFormEnabled: true,
  metadataPreviewEnabled: true,
  metadataStructure: "",
  multipleDownloadAction: "http:/127.0.0.1:3012/zip",
  multipleDownloadEnabled: true,
  oAuth2Endpoints: [
    {
      authURL: "api/v3/auth/oidc",
      displayText: "ESS One Identity"
    },
  ],
  policiesEnabled: true,
  retrieveDestinations: [],
  riotBaseUrl: "http://scichat.esss.lu.se",
  scienceSearchEnabled: true,
  scienceSearchUnitsEnabled: true,
  searchPublicDataEnabled: true,
  searchSamples: true,
  sftpHost: "login.esss.dk",
  sourceFolder: "/data/ess",
  maxDirectDownloadSize: 5000000000,
  maxFileSizeWarning: "Some files are above <maxDirectDownloadSize> and cannot be downloaded directly. These file can be downloaded via sftp host: <sftpHost> in directory: <sourceFolder>",
  shareEnabled: true,
  shoppingCartEnabled: true,
  shoppingCartOnHeader: true,
  tableSciDataEnabled: true,
  datasetDetailsShowMissingProposalId: false,
  notificationInterceptorEnabled: true,
  metadataEditingUnitListDisabled: true,
  datafilesActionsEnabled: true,
  datafilesActions: [],
  labelMaps: {
    filters: {},
  },
  defaultDatasetsListSettings: {
    columns: [],
    filters: [],
    conditions: [],
  },
  labelsLocalization: {
    datasetDefault: {},
    datasetCustom: {},
    proposalDefault: {},
  },
  dateFormat: "yyyy-MM-dd HH:mm",
  datasetDetailComponent: {
    enableCustomizedComponent: false,
    customization: [],
  },
};

const mockTheme: Record<string, unknown> = {
  name: "light",
  properties: {
    "--theme-primary-default": "#27aae1",
  },
};

describe("AdminService", () => {
  let service: AdminService;
  const mockConfigService = {
    get: jest.fn((propertyPath: string) => {
      const config = {
        maxFileUploadSizeInMb: "12mb",
        frontendConfig: mockConfig,
        frontendTheme: mockTheme,
      } as Record<string, unknown>;

      return config[propertyPath];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getConfig", () => {
    it("should return modified config", async () => {
      const result = await service.getConfig();

      expect(result).toEqual({
        ...mockConfig,
        maxFileUploadSizeInMb: "12mb",
      });
    });
  });

  describe("getTheme", () => {
    it("should return theme config", async () => {
      const result = await service.getTheme();
      expect(result).toEqual(mockTheme);
    });
  });
});
