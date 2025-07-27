import { useGetMyUser, useUpdateMyUser } from "@/api/MyUserApi";
import UserProfileForm from "../forms/user-profile-form/UserProfileForm";

const UserProfilePage = () => {
  const { currentUser, isLoading: isGetLoading } = useGetMyUser();
  const { isLoading: isUpdateLoading, updateUser } = useUpdateMyUser();

  if (isGetLoading) {
    return <span>Loading...</span>;
  }
  if (!currentUser) {
    return <span className="">Unable to load user profile</span>;
  }

  return (
    <UserProfileForm
      currentUser={currentUser}
      isLoading={isUpdateLoading}
      onSave={updateUser}
    />
  );
};
export default UserProfilePage;
