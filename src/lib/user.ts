export const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export function isUuid(v?: string | null) {
  return (
    !!v &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v
    )
  );
}

export function getUserId(req: Request) {
  const h = req.headers.get('x-user-id');
  return isUuid(h) ? (h as string) : DEFAULT_USER_ID;
}
