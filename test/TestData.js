//export { DatasetData };

const TestData = {
  ProposalCorrectMin: {
    proposalId: "20170266",
    email: "proposer@uni.edu",
    title: "A minimal test proposal",
    abstract: "Abstract of test proposal",
    ownerGroup: "20170251-group",
    accessGroups: [],
  },

  ProposalCorrectComplete: {
    proposalId: "20170267",
    pi_email: "pi@uni.edu",
    pi_firstname: "principal",
    pi_lastname: "investigator",
    email: "proposer@uni.edu",
    firstname: "proposal",
    lastname: "proposer",
    title: "A complete test proposal",
    abstract: "Abstract of test proposal",
    ownerGroup: "20170251-group",
    accessGroups: [],
    MeasurementPeriodList: [],
  },

  AttachmentCorrect: {
    thumbnail: "data/abc123",
    caption: "Some caption",
    proposalId: "",
    ownerGroup: "ess",
    accessGroups: ["loki", "odin"],
  },

  DatasetWrong: {
    owner: "Bertram Astor",
    ownerEmail: "bertram.astor@grumble.com",
    orcidOfOwner: "unknown",
    contactEmail: "bertram.astor@grumble.com",
    sourceFolder: "/iramjet/tif/",
    creationTime: "2011-09-14T06:08:25.000Z",
    keywords: ["Cryo", "Calibration"],
    description: "None",
    license: "CC BY-SA 4.0",
    isPublished: false,
    ownerGroup: "p13388",
    accessGroups: [],
    type: "base",
  },

  RawCorrect: {
    principalInvestigator: "bertram.astor@grumble.com",
    endTime: "2011-09-14T06:31:25.000Z",
    creationLocation: "/SU/XQX/RAMJET",
    dataFormat: "Upchuck pre 2017",
    scientificMetadata: {
      beamlineParameters: {
        Monostripe: "Ru/C",
        "Ring current": {
          v: 0.402246,
          u: "A",
        },
        "Beam energy": {
          v: 22595,
          u: "eV",
        },
      },
      detectorParameters: {
        Objective: 20,
        Scintillator: "LAG 20um",
        "Exposure time": {
          v: 0.4,
          u: "s",
        },
      },
      scanParameters: {
        "Number of projections": 1801,
        "Rot Y min position": {
          v: 0,
          u: "deg",
        },
        "Inner scan flag": 0,
        "File Prefix": "817b_B2_",
        "Sample In": {
          v: 0,
          u: "m",
        },
        "Sample folder": "/ramjet/817b_B2_",
        "Number of darks": 10,
        "Rot Y max position": {
          v: 180,
          u: "deg",
        },
        "Angular step": {
          v: 0.1,
          u: "deg",
        },
        "Number of flats": 120,
        "Sample Out": {
          v: -0.005,
          u: "m",
        },
        "Flat frequency": 0,
        "Number of inter-flats": 0,
      },
    },
    owner: "Bertram Astor",
    ownerEmail: "bertram.astor@grumble.com",
    orcidOfOwner: "unknown",
    contactEmail: "bertram.astor@grumble.com",
    sourceFolder: "/iramjet/tif/",
    size: 0,
    numberOfFiles: 0,
    creationTime: "2011-09-14T06:08:25.000Z",
    description: "None",
    datasetName: "Test raw dataset",
    classification: "AV=medium,CO=low",
    license: "CC BY-SA 4.0",
    isPublished: false,
    ownerGroup: "p13388",
    accessGroups: [],
    proposalId: "10.540.16635/20110123",
    type: "raw",
  },

  DerivedCorrect: {
    investigator: "egon.meier@web.de",
    inputDatasets: ["/data/input/file1.dat"],
    usedSoftware: [
      "https://gitlab.psi.ch/ANALYSIS/csaxs/commit/7d5888bfffc440bb613bc7fa50adc0097853446c",
    ],
    jobParameters: {
      nscans: 10,
    },
    jobLogData: "Output of log file...",
    owner: "Egon Meier",
    ownerEmail: "egon.meier@web.de",
    contactEmail: "egon.meier@web.de",
    sourceFolder: "/data/example/2017",
    size: 0,
    numberOfFiles: 0,
    creationTime: "2017-01-31T09:20:19.562Z",
    keywords: ["Test", "Derived", "Science", "Math"],
    description: "Some fancy description",
    datasetName: "Test derviced dataset",
    isPublished: false,
    ownerGroup: "p34123",
    accessGroups: [],
    type: "derived",
  },

  DerivedWrong: {
    investigator: "egon.meier@web.de",
    jobParameters: {
      nscans: 10,
    },
    jobLogData: "Output of log file...",
    owner: "Egon Meier",
    ownerEmail: "egon.meier@web.de",
    contactEmail: "egon.meier@web.de",
    sourceFolder: "/data/example/2017",
    creationTime: "2017-01-31T09:20:19.562Z",
    keywords: ["Test", "Derived", "Science", "Math"],
    description: "Some fancy description",
    isPublished: false,
    ownerGroup: "p34123",
    type: "derived",
  },
};

module.exports = { TestData };
