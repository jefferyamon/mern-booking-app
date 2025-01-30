import { useFormContext } from "react-hook-form";
import { HotelFormData } from "./ManageHotelForms";

const GuestSection = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<HotelFormData>();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Guests</h2>
      <div className="grid bg-gray-300 grid-cols-2 gap-5 p-6">
        <label className="font-semibold text-sm text-gray-700">
          Adults
          <input
            type="number"
            className="border rounded w-full py-2 px-3 font-normal"
            min={1}
            {...register("adultCount", { required: "This field is required" })}
          />
          {errors.adultCount?.message && (
            <span className="text-red-500 text-sm font-bold">
              {errors.adultCount.message}
            </span>
          )}
        </label>
        <label className="font-semibold text-sm text-gray-700">
          Children
          <input
            type="number"
            className="border rounded w-full py-2 px-3 font-normal"
            min={0}
            {...register("childCount", { required: "This field is required" })}
          />
          {errors.childCount?.message && (
            <span className="text-red-500 text-sm font-bold">
              {errors.childCount.message}
            </span>
          )}
        </label>
      </div>
    </div>
  );
};
export default GuestSection;
