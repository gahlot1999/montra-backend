export function filterObj(obj, ...allowedFields) {
  const filteredObj = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      filteredObj[field] = obj[field];
    }
  });

  return filteredObj;
}
