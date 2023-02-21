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
    accessGroups: ["proposalingestor"],
    MeasurementPeriodList: [],
  },

  ProposalWring_1: {
    proposalId: "20170267",
    pi_email: "pi@uni.edu",
    pi_firstname: "principal",
    pi_lastname: "investigator",
    email: "proposer@uni.edu",
    firstname: "proposal",
    lastname: "proposer",
    title: "A complete test proposal with an extra field",
    abstract: "Abstract of test proposal",
    ownerGroup: "20170251-group",
    accessGroups: [],
    MeasurementPeriodList: [],
    createdBy: "This should not be here",
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
    principalInvestigator: "scicatingestor@your.site",
    endTime: "2011-09-14T06:31:25.000Z",
    creationLocation: "/SU/XQX/RAMJET",
    dataFormat: "Upchuck pre 2017",
    scientificMetadata: {
      approx_file_size_mb: {
        "value" : 8500,
        "unit" : ""
      },
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
    owner: "Bertram Astor first",
    ownerEmail: "scicatingestor@your.site",
    orcidOfOwner: "unknown",
    contactEmail: "scicatingestor@your.site",
    sourceFolder: "/iramjet/tif/",
    size: 0,
    packedSize: 0,
    numberOfFiles: 0,
    numberOfFilesArchived: 0,
    creationTime: "2011-09-14T06:08:25.000Z",
    description: "None, The ultimate test",
    datasetName: "Test raw dataset",
    classification: "AV=medium,CO=low",
    license: "CC BY-SA 4.0",
    isPublished: false,
    ownerGroup: "p13388",
    accessGroups: [],
    proposalId: "10.540.16635/20110123",
    type: "raw",
    keywords: ["sls", "protein"],
  },

  RawWrong_1: {
    owner: "Bertram Astor second",
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
    type: "raw",
  },

  RawWrong_2: {
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
    owner: "Bertram Astor third",
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
    history: {},
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

  SampleCorrect: {
    owner: "Max Novelli",
    description: "This is a very important sample",
    sampleCharacteristics: {
      chemical_formula: "H2O",
    },
    ownerGroup: "ess",
    accessGroups: ["data scientist", "instrument scientist"],
  },

  SampleWrong: {
    owner: "Max Novelli",
    sampleCharacteristics: {
      chemical_formula: "H2O",
    },
    ownerGroup: "ess",
    accessGroups: ["data scientist", "instrument scientist"],
  },

  DataBlockCorrect: {
    archiveId:
      "1oneCopyBig/p10029/raw/2018/01/23/20.500.11935/07e8a14c-f496-42fe-b4b4-9ff41061695e_1_2018-01-23-03-11-34.tar",
    size: 41780190,
    packedSize: 20890095,
    chkAlg: "sha1",
    version: "0.6.0",
    dataFileList: [
      {
        path: "N1039__B410489.tif",
        size: 8356038,
        time: "2017-07-24T13:56:30.000Z",
        chk: "652810fb470a0c90456912c0a3351e2f6d7325e4",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039__B410613.tif",
        size: 8356038,
        time: "2017-07-24T13:56:35.000Z",
        chk: "9fc6640a4cdb97c8389aa9613f4aeabe8ef681ef",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039__B410729.tif",
        size: 8356038,
        time: "2017-07-24T13:56:41.000Z",
        chk: "908fe1a942aabf63d5dfa3d0a5088eeaf02c79cf",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039__B410200.tif",
        size: 8356038,
        time: "2017-07-24T13:56:18.000Z",
        chk: "ee86aafec6258ff95961563435338e79a1ccb04d",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039__B410377.tif",
        size: 8356038,
        time: "2017-07-24T13:56:25.000Z",
        chk: "44cae8b9cb4bc732f04225371203af884af621d7",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
    ],
  },

  OrigDataBlockCorrect1: {
    size: 41780189,
    dataFileList: [
      {
        path: "N1039-1.tif",
        size: 8356037,
        time: "2017-07-24T13:56:30.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-2.tif",
        size: 8356038,
        time: "2017-07-24T13:56:35.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-3.tif",
        size: 8356038,
        time: "2017-07-24T13:56:41.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-B410200.tif",
        size: 8356038,
        time: "2017-07-24T13:56:18.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-B410377.tif",
        size: 8356038,
        time: "2017-07-24T13:56:25.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
    ],
  },

  OrigDataBlockCorrect2: {
    size: 41780289,
    dataFileList: [
      {
        path: "N1039-1.tif",
        size: 8356037,
        time: "2017-07-24T13:56:30.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-2.tif",
        size: 8356038,
        time: "2017-07-24T13:56:35.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-3.tif",
        size: 8356038,
        time: "2017-07-24T13:56:41.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-B410200.tif",
        size: 8356038,
        time: "2017-07-24T13:56:18.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "N1039-B410377.tif",
        size: 8356038,
        time: "2017-07-24T13:56:25.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738",
        perm: "-rw-rw-r--",
      },
      {
        path: "this_unique_file.txt",
        size: 100,
        time: "2017-07-24T13:56:25.000Z",
        uid: "egon.meiera@psi.ch",
        gid: "p16738+1",
        perm: "-rw-rw-r--",
      },
    ],
  },

  OrigDataBlockWrong: {
    size: "This is wrong",
  },

  DatasetLifecycle_query_1: {
    fields: {
      ownerGroup: ["p12345", "p10029"],
      text: "'ultimate test'",
      creationTime: {
        begin: "2011-09-13",
        end: "2011-09-15",
      },
      "datasetlifecycle.archiveStatusMessage": "datasetCreated",
      keywords: ["energy", "protein"],
    },
  },

  DatasetLifecycle_query_2: {
    fields: {
      ownerGroup: ["p12345"],
      "datasetlifecycle.archiveStatusMessage": "datasetCreated",
    },
    limits: {
      skip: 1000,
    },
  },

  DatasetLifecycle_query_3: {
    fields: {
      ownerGroup: ["p12345", "p10029"],
      text: "'ultimate test'",
      creationTime: {
        begin: "2011-09-13",
        end: "2011-09-15",
      },
      keywords: ["energy", "protein"],
    },
    facets: [
      "type",
      "creationTime",
      "creationLocation",
      "ownerGroup",
      "keywords",
    ],
  },

  ArchiveJob: {
    emailJobInitiator: "scicatarchivemanger@psi.ch",
    type: "archive",
    jobStatusMessage: "jobForwarded",
    datasetList: [
      {
        pid: "dummy",
        files: [],
      },
      {
        pid: "dummy",
        files: [],
      },
    ],
    jobResultObject: {
      status: "okay",
      message: "All systems okay",
    },
  },

  RetrieveJob: {
    emailJobInitiator: "scicatarchivemanger@psi.ch",
    type: "retrieve",
    jobStatusMessage: "jobForwarded",
    datasetList: [
      {
        pid: "dummy",
        files: [],
      },
      {
        pid: "dummy",
        files: [],
      },
    ],
    jobResultObject: {
      status: "okay",
      message: "All systems okay",
    },
  },

  PublicJob: {
    emailJobInitiator: "firstname.lastname@gmail.com",
    type: "public",
    jobStatusMessage: "jobSubmitted",
    datasetList: [
      {
        pid: "dummy",
        files: [],
      },
      {
        pid: "dummy",
        files: [],
      },
    ],
  },

  PublishedData: {
    creator: ["ESS"],
    publisher: "ESS",
    publicationYear: 2020,
    title: "dd",
    url: "",
    abstract: "dd",
    dataDescription: "dd",
    resourceType: "raw",
    numberOfFiles: 1,
    sizeOfArchive: 1,
    pidArray: [],
    status: "pending_registration",
  },
};

module.exports = { TestData };
