import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "../store";
import { updateUser, User } from "../store/userSlice";

export const useUser = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.user.user);

  const updateUserProfile = (userData: User) => {
    dispatch(updateUser(userData));
  };

  return {
    user,
    updateUserProfile,
  };
};
