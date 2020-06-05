export function getClassRepresentation(o: object) {
  const className = Object.getPrototypeOf(o).constructor.name;
  return className === "Object" ? "#<Object>" : `[object ${className}]`;
}
