export type Props = {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
};

const Pagination = ({ page, pages, onPageChange }: Props) => {
  const pageNumber = [];
  for (let i = 1; i <= pages; i++) {
    pageNumber.push(i);
  }

  return (
    <div className="flex justify-center">
      <ul className="flex border-slate-300 border">
        {pageNumber.map((number, index) => (
          <li
            key={index}
            className={`px-2 py-1 ${page === number ? "bg-gray-200" : ""}`}
          >
            <button className="" onClick={() => onPageChange(number)}>
              {number}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Pagination;
