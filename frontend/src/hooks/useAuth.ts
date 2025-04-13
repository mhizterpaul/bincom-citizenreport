import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { login, logout } from "../store/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return {
    isAuthenticated,
    login: (user: any) => dispatch(login(user)),
    logout: () => dispatch(logout()),
  };
};
