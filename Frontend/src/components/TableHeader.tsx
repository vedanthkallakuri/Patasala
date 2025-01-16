export default function TableHeader({ headers }) {
  return (
    <>
      <div className="table-row-headers">
        {headers.map((header) => (
          <div className="table-header">{header.name}</div>
        ))}
      </div>
    </>
  );
}
