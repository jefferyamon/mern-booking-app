import { hotelFacilities } from "../config/hotel-options-config";

type Props = {
  selectedFacility: string[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const FacilitiesFilter = ({ selectedFacility, onChange }: Props) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <h4 className="text-md font-semibold mb-2">Facility</h4>
      {hotelFacilities.map((facility, index) => (
        <label className="flex items-center space-x-2" key={index}>
          <input
            type="checkbox"
            className="rounded"
            value={facility}
            checked={selectedFacility.includes(facility)}
            onChange={onChange}
          />
          <span>{facility}</span>
        </label>
      ))}
    </div>
  );
};
export default FacilitiesFilter;
