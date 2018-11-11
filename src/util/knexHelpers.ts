import _ from "lodash";
import { QueryBuilder } from "knex";
export function convertNestedFields(rows: any[]) {
  return rows.map(row => {
    const newObj = {};
    for (const key of Object.keys(row)) {
      const path = key.split(".");
      _.set(newObj, path, row[key]);
    }
    return newObj;
  });
}

export function addFilters(query: QueryBuilder, filters: any) {
  for (const key of Object.keys(filters)) {
    if (filters[key] === undefined) {
      continue;
    }
    query.where(key, filters[key]);
  }
}