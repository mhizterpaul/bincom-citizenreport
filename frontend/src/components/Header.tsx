import { Avatar, Box, Typography, styled } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Divider,
} from "@mui/material";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "../store/authSlice";
import { clearUser, User } from "../store/userSlice";
import { useUser } from "../hooks/useUser";
import SettingsIcon from "@mui/icons-material/Settings";
import api from "../api/axios";

const HeaderWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const UserInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const Header = () => {
  const { user, updateUserProfile } = useUser();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        if (response.data.success) {
          setNotificationCount(response.data.data.length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        updateUserProfile({
          ...(user as User),
          image: response.data.data.profileImage,
        });
        toast.success("Profile image updated successfully");
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Failed to update profile image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleClearNotifications = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setNotificationCount(0);
      toast.success("Notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
    handleMenuClose();
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Clear client-side state
      dispatch(logout());
      dispatch(clearUser());
      localStorage.removeItem("token");

      // Redirect to login
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout");
    }
    handleMenuClose();
  };

  return (
    <HeaderWrapper>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
        disabled={isUploading}
      />
      <Avatar
        src={user?.image}
        alt={user?.name}
        sx={{
          width: 48,
          height: 48,
          cursor: isUploading ? "not-allowed" : "pointer",
          opacity: isUploading ? 0.7 : 1,
        }}
        onClick={handleAvatarClick}
      />
      <UserInfo>
        <Typography variant="h6" component="h1">
          {user?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
      </UserInfo>
      <IconButton
        onClick={handleMenuOpen}
        sx={{ marginLeft: "auto" }}
        disabled={isUploading}
      >
        <SettingsIcon color="action" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={handleClearNotifications}
          disabled={notificationCount === 0}
        >
          <ListItemIcon>
            <Badge badgeContent={notificationCount} max={999} color="error">
              {notificationCount > 0 ? (
                <NotificationsActiveIcon color="action" />
              ) : (
                <NotificationsIcon color="action" />
              )}
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="Clear Notifications"
            secondary={
              notificationCount > 0
                ? `${notificationCount} unread`
                : "No notifications"
            }
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
    </HeaderWrapper>
  );
};

export default Header;
