import Alert from "./Alert";

type SearchParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function FlashMessages({ searchParams }: { searchParams: SearchParams }) {
  const success = first(searchParams.success);
  const error = first(searchParams.error);

  return (
    <>
      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}
    </>
  );
}
