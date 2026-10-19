// Runs a zod schema and returns either clean data or friendly error messages
export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (result.success) return { data: result.data };

  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { errors, message: Object.values(errors)[0] };
}