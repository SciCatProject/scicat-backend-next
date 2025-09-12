const FILTER_MAPPING = {
  LocationFilter: {
    key: "creationLocation",
    type: "multiSelect",
    label: "Location",
    description: "Filter datasets by creation location",
  },
  PidFilter: {
    key: "pid",
    type: "text",
    label: "PID",
    description: "Filter datasets by PID",
  },
  GroupFilter: {
    key: "ownerGroup",
    type: "multiSelect",
    label: "Group",
    description: "Filter datasets by owner group",
  },
  TypeFilter: {
    key: "type",
    type: "multiSelect",
    label: "Type",
    description: "Filter datasets by type",
  },
  KeywordFilter: {
    key: "keywords",
    type: "multiSelect",
    label: "Keywords",
    description: "Filter datasets by keywords",
  },
  DateRangeFilter: {
    key: "creationTime",
    type: "dateRange",
    label: "Creation Time",
    description: "Filter datasets by creation time",
  },
};

module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    for await (const userSetting of db.collection("UserSetting").find({
      "externalSettings.filters": { $exists: true },
    })) {
      const filters = userSetting.externalSettings.filters;

      if (filters.length) {
        const newFilters = filters
          .filter((f) => {
            const [key] = Object.keys(f);

            return FILTER_MAPPING[key];
          })
          .map((filter) => {
            const [key, value] = Object.entries(filter)[0];

            return {
              key: FILTER_MAPPING[key].key,
              type: FILTER_MAPPING[key].type,
              label: FILTER_MAPPING[key].label,
              description: FILTER_MAPPING[key].description,
              enabled: value,
            };
          });

        console.log(
          `Updating UserSetting (Id: ${userSetting._id}) with new filter config structure =>${JSON.stringify(newFilters)}<=`,
        );

        await db.collection("UserSetting").updateOne(
          { _id: userSetting._id },
          {
            $set: {
              externalSettings: {
                ...userSetting.externalSettings,
                filters: newFilters,
              },
            },
          },
        );
      }
    }
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    for await (const userSetting of db.collection("UserSetting").find({
      "externalSettings.filters": { $exists: true },
    })) {
      const filters = userSetting.externalSettings.filters;

      if (filters.length) {
        const oldFilters = filters
          .filter((f) => {
            const found = Object.values(FILTER_MAPPING).find(
              (fm) => fm.key === f.key,
            );

            return !!found;
          })
          .map((filter) => {
            const keys = Object.keys(FILTER_MAPPING);
            const values = Object.values(FILTER_MAPPING);
            const index = values.findIndex((v) => v.key === filter.key);
            const key = keys[index];

            return {
              [key]: filter.enabled,
            };
          });

        console.log(
          `Reverting UserSetting (Id: ${userSetting._id}) to old filter config structure =>${JSON.stringify(oldFilters)}<=`,
        );

        await db.collection("UserSetting").updateOne(
          { _id: userSetting._id },
          {
            $set: {
              externalSettings: {
                ...userSetting.externalSettings,
                filters: oldFilters,
              },
            },
          },
        );
      }
    }
  },
};
