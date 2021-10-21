import { unit } from 'mathjs';
import { IScientificFilter } from 'src/datasets/interfaces/dataset-filters.interface';
import { ScientificRelation } from './scientific-relation.enum';

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
): Record<string, any> => {
  const scientificFilterQuery = {};

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
