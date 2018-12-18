import _ from "lodash";
import { QueryBuilder } from "knex";
export function convertNestedFields(rows: any[]) {
  return rows.map(row => {
    const newObj: any = {};
    for (const key of Object.keys(row)) {
      const path = key.split(".");
      _.set(newObj, path, row[key]);
    }
    return newObj;
  });
}
const nameFilters = [
  "studentname",
  "teachername",
  "disciplinename",
  "modulename"
];
export function addFilters(query: QueryBuilder, filters: any) {
  for (const key of Object.keys(filters)) {
    if (filters[key] === undefined) {
      continue;
    } else if (_.includes(nameFilters, key)) {
      addNameFilter(query, key, filters[key]);
    } else {
      query.where(key, filters[key]);
    }
  }
}

function addNameFilter(query: QueryBuilder, key: string, filter: any) {
  console.log(key, filter);
  switch (key) {
    case "studentname":
      query.whereRaw("concat(student.firstname, ' ', student.lastname) like ?", [`%${filter}%`]);
      break;
    case "teachername":
    query.whereRaw("concat(teacher.firstname, ' ', teacher.lastname) like ?", [`%${filter}%`]);
      break;
    case "disciplinename":
      query.where("disciplines.name", "like", `%${filter}%`);
      break;
    case "modulename":
      query.where("modules.name", "like", `%${filter}%`);
      break;
  }
}
