"use strict";
const testData = {
  "scientificMetadata": {
    "comment": "test2",
    "motors": {
      "sampx": {
        "value": -0.03949844939218141,
        "unit": "mm"
      },
      "sampy": {
        "value": 0.003037629787175808,
        "unit": "mm"
      },
      "phi": {
        "value": 85.62724999999955,
        "unit": "deg"
      },
      "zoom": 35007.46875,
      "focus": {
        "value": -0.2723789062500003,
        "unit": "mm"
      },
      "phiz": {
        "value": 0.18436550301217358,
        "unit": "deg"
      },
      "phiy": {
        "value": 0.21792454481296603,
        "unit": "deg"
      }
    },
    "take_snapshots": 1,
    "shape": "2DP1",
    "in_interleave": false,
    "yBeam": 2124.4119215493815,
    "wavelength": {
      "value": 0.9789504111255567,
      "unit": "angstrom"
    },
    "fileinfo": {
      "run_number": 1,
      "suffix": "h5",
      "filename": "/data/visitors/cosaxs/20170251/20190625/raw/air/air-air9/air9-air_1_master.h5",
      "num_files": 1,
      "prefix": "air9-air",
      "template": "air9-air_1_%06d.h5",
      "archive_directory": "/mxn/groups/ispybstorage/pyarch/visitors/20170251/20190625/raw/air/air-air9/",
      "directory": "/data/visitors/cosaxs/20170251/20190625/raw/air/air-air9/",
      "process_directory": "/data/visitors/cosaxs/20170251/20190625/process/air/air-air9/"
    },
    "in_queue": false,
    "proposalInfo": {
      "status": {
        "code": "ok"
      },
      "Person": {
        "personId": 216,
        "familyName": "Carlsson",
        "emailAddress": "ims@maxiv.lu.se",
        "laboratoryId": 871846,
        "login": "carlcarl",
        "givenName": "Carla"
      },
      "Proposal": {
        "code": "MX",
        "title": "TEST for checking data handling",
        "personId": 216,
        "number": "20170251",
        "proposalId": 17,
        "type": "MX"
      },
      "Session": {
        "scheduled": 0,
        "lastUpdate": "",
        "endDate": "2019-06-27 06:59:59",
        "beamlineName": "CoSAXS",
        "startDate": "2019-06-25 23:00:00",
        "timeStamp": "",
        "proposalName": "mx20170251",
        "comments": "Session created by the BCM",
        "sessionId": 1702,
        "proposalId": 17,
        "beamLineSetupId": 1304101,
        "nbShifts": 3
      },
      "Laboratory": {
        "laboratoryId": 871846,
        "city": "Stockholm",
        "name": "Swedish Museum of Natural History",
        "address": "Box 50007\r\n104 05 Stockholm\r\n,Sweden"
      }
    },
    "detector_mode": [],
    "shutterless": true,
    "beamShape": "ellipse",
    "slitGapHorizontal": {
      "value": 0.02,
      "unit": "mm"
    },
    "detectorDistance": {
      "value": 148.0342,
      "unit": "mm"
    },
    "actualCenteringPosition": {
      "sampx": {
        "value": -0.039498,
        "unit": "mm"
      },
      "sampy": {
        "value": 0.003038,
        "unit": "mm"
      },
      "phi": {
        "value": 85.62725,
        "unit": "deg"
      },
      "zoom": 35007.46875,
      "focus": {
        "value": -0.272379,
        "unit": "mm"
      },
      "phiz": {
        "value": 0.184366,
        "unit": "deg"
      },
      "phiy": {
        "value": 0.217925,
        "unit": "deg"
      }
    },
    "do_inducedraddam": false,
    "xBeam": 2099.108089282656,
    "detector_id": 3,
    "sample_reference": {
      "cell": [
        0,
        0,
        0,
        0,
        0,
        0
      ],
      "spacegroup": 0,
      "blSampleId": -1
    },
    "actualContainerBarcode": "",
    "status": "Data collection successful",
    "synchrotronMode": "Variable TopUp/Decay",
    "blSampleId": -1,
    "processing": "True",
    "residues": 200,
    "dark": 1,
    "resolutionAtCorner": {
      "value": 0.2,
      "unit": "angstrom"
    },
    "slitGapVertical": 0.02,
    "actualSampleBarcode": null,
    "collection_id": 18389,
    "auto_dir": "/data/visitors/cosaxs/20170251/20190625/process/air/air-air9/xds_air9-air_1_1",
    "beamSizeAtSampleX": {
      "value": 0.02,
      "unit": "mm"
    },
    "beamSizeAtSampleY": {
      "value": 0.02,
      "unit": "mm"
    },
    "oscillation_sequence": [
      {
        "exposure_time": 0.1,
        "kappaStart": -9999,
        "start_image_number": 1,
        "mesh_range": [],
        "number_of_lines": 1,
        "phiStart": -9999,
        "number_of_images": 1,
        "overlap": 0,
        "start": 85.6279468749999,
        "range": 0.1,
        "number_of_passes": 1
      }
    ],
    "EDNA_files_dir": "/data/visitors/cosaxs/20170251/20190625/process/air/air-air9/",
    "transmission": "1.006",
    "collection_start_time": "2019-06-26 18:01:17",
    "anomalous": false,
    "xds_dir": "/data/visitors/cosaxs/20170251/20190625/raw/air/air-air9/process/xds_air9-air_1_1",
    "flux": 0,
    "sessionId": 1702,
    "experiment_type": "OSC",
    "group_id": 18413,
    "resolution": "1.250",
    "skip_images": false
  }
};
const appendSIUnitToPhysicalQuantityExpectedData = {
  "comment": "test2",
  "motors": {
    "sampx": {
      "value": -0.03949844939218141,
      "unit": "mm",
      "valueSI": -0.00003949844939218141,
      "unitSI": "m"
    },
    "sampy": {
      "value": 0.003037629787175808,
      "unit": "mm",
      "valueSI": 0.000003037629787175808,
      "unitSI": "m"
    },
    "phi": {
      "value": 85.62724999999955,
      "unit": "deg",
      "valueSI": 1.4944774419283067,
      "unitSI": "rad"
    },
    "zoom": 35007.46875,
    "focus": {
      "value": -0.2723789062500003,
      "unit": "mm",
      "valueSI": -0.00027237890625000027,
      "unitSI": "m"
    },
    "phiz": {
      "value": 0.18436550301217358,
      "unit": "deg",
      "valueSI": 0.003217785054657952,
      "unitSI": "rad"
    },
    "phiy": {
      "value": 0.21792454481296603,
      "unit": "deg",
      "valueSI": 0.0038035008278961874,
      "unitSI": "rad"
    }
  },
  "take_snapshots": 1,
  "shape": "2DP1",
  "in_interleave": false,
  "yBeam": 2124.4119215493815,
  "wavelength": {
    "value": 0.9789504111255567,
    "unit": "angstrom",
    "valueSI": 9.789504111255567e-11,
    "unitSI": "m"
  },
  "fileinfo": {
    "run_number": 1,
    "suffix": "h5",
    "filename": "/data/visitors/cosaxs/20170251/20190625/raw/air/air-air9/air9-air_1_master.h5",
    "num_files": 1,
    "prefix": "air9-air",
    "template": "air9-air_1_%06d.h5",
    "archive_directory": "/mxn/groups/ispybstorage/pyarch/visitors/20170251/20190625/raw/air/air-air9/",
    "directory": "/data/visitors/cosaxs/20170251/20190625/raw/air/air-air9/",
    "process_directory": "/data/visitors/cosaxs/20170251/20190625/process/air/air-air9/"
  },
  "in_queue": false,
  "proposalInfo": {
    "status": {
      "code": "ok"
    },
    "Person": {
      "personId": 216,
      "familyName": "Carlsson",
      "emailAddress": "ims@maxiv.lu.se",
      "laboratoryId": 871846,
      "login": "carlcarl",
      "givenName": "Carla"
    },
    "Proposal": {
      "code": "MX",
      "title": "TEST for checking data handling",
      "personId": 216,
      "number": "20170251",
      "proposalId": 17,
      "type": "MX"
    },
    "Session": {
      "scheduled": 0,
      "lastUpdate": "",
      "endDate": "2019-06-27 06:59:59",
      "beamlineName": "CoSAXS",
      "startDate": "2019-06-25 23:00:00",
      "timeStamp": "",
      "proposalName": "mx20170251",
      "comments": "Session created by the BCM",
      "sessionId": 1702,
      "proposalId": 17,
      "beamLineSetupId": 1304101,
      "nbShifts": 3
    },
    "Laboratory": {
      "laboratoryId": 871846,
      "city": "Stockholm",
      "name": "Swedish Museum of Natural History",
      "address": "Box 50007\r\n104 05 Stockholm\r\n,Sweden"
    }
  },
  "detector_mode": [],
  "shutterless": true,
  "beamShape": "ellipse",
  "slitGapHorizontal": {
    "value": 0.02,
    "unit": "mm",
    "valueSI": 0.00002,
    "unitSI": "m"
  },
  "detectorDistance": {
    "value": 148.0342,
    "unit": "mm",
    "valueSI": 0.1480342,
    "unitSI": "m"
  },
  "actualCenteringPosition": {
    "sampx": {
      "value": -0.039498,
      "unit": "mm",
      "valueSI": -0.000039498,
      "unitSI": "m"
    },
    "sampy": {
      "value": 0.003038,
      "unit": "mm",
      "valueSI": 0.000003038,
      "unitSI": "m"
    },
    "phi": {
      "value": 85.62725,
      "unit": "deg",
      "valueSI": 1.4944774419283147,
      "unitSI": "rad"
    },
    "zoom": 35007.46875,
    "focus": {
      "value": -0.272379,
      "unit": "mm",
      "valueSI": -0.000272379,
      "unitSI": "m"
    },
    "phiz": {
      "value": 0.184366,
      "unit": "deg",
      "valueSI": 0.0032177937287318657,
      "unitSI": "rad"
    },
    "phiy": {
      "value": 0.217925,
      "unit": "deg",
      "valueSI": 0.003803508772408643,
      "unitSI": "rad"
    }
  },
  "do_inducedraddam": false,
  "xBeam": 2099.108089282656,
  "detector_id": 3,
  "sample_reference": {
    "cell": [
      0,
      0,
      0,
      0,
      0,
      0
    ],
    "spacegroup": 0,
    "blSampleId": -1
  },
  "actualContainerBarcode": "",
  "status": "Data collection successful",
  "synchrotronMode": "Variable TopUp/Decay",
  "blSampleId": -1,
  "processing": "True",
  "residues": 200,
  "dark": 1,
  "resolutionAtCorner": {
    "value": 0.2,
    "unit": "angstrom",
    "valueSI": 2.0000000000000002e-11,
    "unitSI": "m"
  },
  "slitGapVertical": 0.02,
  "actualSampleBarcode": null,
  "collection_id": 18389,
  "auto_dir": "/data/visitors/cosaxs/20170251/20190625/process/air/air-air9/xds_air9-air_1_1",
  "beamSizeAtSampleX": {
    "value": 0.02,
    "unit": "mm",
    "valueSI": 0.00002,
    "unitSI": "m"
  },
  "beamSizeAtSampleY": {
    "value": 0.02,
    "unit": "mm",
    "valueSI": 0.00002,
    "unitSI": "m"
  },
  "oscillation_sequence": [
    {
      "exposure_time": 0.1,
      "kappaStart": -9999,
      "start_image_number": 1,
      "mesh_range": [],
      "number_of_lines": 1,
      "phiStart": -9999,
      "number_of_images": 1,
      "overlap": 0,
      "start": 85.6279468749999,
      "range": 0.1,
      "number_of_passes": 1
    }
  ],
  "EDNA_files_dir": "/data/visitors/cosaxs/20170251/20190625/process/air/air-air9/",
  "transmission": "1.006",
  "collection_start_time": "2019-06-26 18:01:17",
  "anomalous": false,
  "xds_dir": "/data/visitors/cosaxs/20170251/20190625/raw/air/air-air9/process/xds_air9-air_1_1",
  "flux": 0,
  "sessionId": 1702,
  "experiment_type": "OSC",
  "group_id": 18413,
  "resolution": "1.250",
  "skip_images": false
};

const extractMetadataKeysExpectedData = [
  "comment",
  "motors.sampx",
  "motors.sampy",
  "motors.phi",
  "motors.zoom",
  "motors.focus",
  "motors.phiz",
  "motors.phiy",
  "take_snapshots",
  "shape",
  "in_interleave",
  "yBeam",
  "wavelength",
  "fileinfo.run_number",
  "fileinfo.suffix",
  "fileinfo.filename",
  "fileinfo.num_files",
  "fileinfo.prefix",
  "fileinfo.template",
  "fileinfo.archive_directory",
  "fileinfo.directory",
  "fileinfo.process_directory",
  "in_queue",
  "proposalInfo.status.code",
  "proposalInfo.Person.personId",
  "proposalInfo.Person.familyName",
  "proposalInfo.Person.emailAddress",
  "proposalInfo.Person.laboratoryId",
  "proposalInfo.Person.login",
  "proposalInfo.Person.givenName",
  "proposalInfo.Proposal.code",
  "proposalInfo.Proposal.title",
  "proposalInfo.Proposal.personId",
  "proposalInfo.Proposal.number",
  "proposalInfo.Proposal.proposalId",
  "proposalInfo.Proposal.type",
  "proposalInfo.Session.scheduled",
  "proposalInfo.Session.lastUpdate",
  "proposalInfo.Session.endDate",
  "proposalInfo.Session.beamlineName",
  "proposalInfo.Session.startDate",
  "proposalInfo.Session.timeStamp",
  "proposalInfo.Session.proposalName",
  "proposalInfo.Session.comments",
  "proposalInfo.Session.sessionId",
  "proposalInfo.Session.proposalId",
  "proposalInfo.Session.beamLineSetupId",
  "proposalInfo.Session.nbShifts",
  "proposalInfo.Laboratory.laboratoryId",
  "proposalInfo.Laboratory.city",
  "proposalInfo.Laboratory.name",
  "proposalInfo.Laboratory.address",
  "detector_mode",
  "shutterless",
  "beamShape",
  "slitGapHorizontal",
  "detectorDistance",
  "actualCenteringPosition.sampx",
  "actualCenteringPosition.sampy",
  "actualCenteringPosition.phi",
  "actualCenteringPosition.zoom",
  "actualCenteringPosition.focus",
  "actualCenteringPosition.phiz",
  "actualCenteringPosition.phiy",
  "do_inducedraddam",
  "xBeam",
  "detector_id",
  "sample_reference.cell",
  "sample_reference.spacegroup",
  "sample_reference.blSampleId",
  "actualContainerBarcode",
  "status",
  "synchrotronMode",
  "blSampleId",
  "processing",
  "residues",
  "dark",
  "resolutionAtCorner",
  "slitGapVertical",
  "actualSampleBarcode",
  "collection_id",
  "auto_dir",
  "beamSizeAtSampleX",
  "beamSizeAtSampleY",
  "oscillation_sequence",
  "EDNA_files_dir",
  "transmission",
  "collection_start_time",
  "anomalous",
  "xds_dir",
  "flux",
  "sessionId",
  "experiment_type",
  "group_id",
  "resolution",
  "skip_images"
];
module.exports = { testData, extractMetadataKeysExpectedData, appendSIUnitToPhysicalQuantityExpectedData };
