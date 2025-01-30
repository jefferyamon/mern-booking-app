import { useMutation, useQuery } from "react-query";
import { useParams } from "react-router";
import * as apiClient from "../api-client";
import ManageHotelForms from "../Forms/ManageHotelForms/ManageHotelForms";
import { useAppContext } from "../contexts/AppContext";

const EditHotel = () => {
  const { hotelId } = useParams();
  const { showToast } = useAppContext();

  const { data: hotel } = useQuery(
    "fetchMyHotelById",
    () => apiClient.fetchMyHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {
      showToast({ message: "Hotel saved!", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Error saving hotel", type: "ERROR" });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return (
    <ManageHotelForms onSave={handleSave} hotel={hotel} isLoading={isLoading} />
  );
};
export default EditHotel;
