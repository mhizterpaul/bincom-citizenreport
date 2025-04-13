import React, { useEffect, useState } from "react";
import {
  Box,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import api from "../api/axios";
import { toast } from "react-toastify";

interface Category {
  id: string;
  name: string;
}

interface CategoriesProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onApplyFilters: (categories: string[]) => void;
}

const Categories: React.FC<CategoriesProps> = ({
  anchorEl,
  onClose,
  onApplyFilters,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApply = () => {
    onApplyFilters(selectedCategories);
    onClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Filter by Category
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            <List sx={{ maxHeight: 300, overflow: "auto" }}>
              {categories.map((category) => (
                <ListItem
                  key={category.id}
                  dense
                  button
                  onClick={() => handleToggle(category.id)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={selectedCategories.includes(category.id)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
                borderTop: 1,
                borderColor: "divider",
                pt: 2,
              }}
            >
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                variant="contained"
                disabled={selectedCategories.length === 0}
              >
                Apply Filters
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Popover>
  );
};

export default Categories;
