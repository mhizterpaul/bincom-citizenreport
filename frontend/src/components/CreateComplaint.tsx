import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createIncident } from "../store/incidentSlice";
import { fetchCategories } from "../store/categorySlice";
import { RootState } from "../store";
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

interface FormValues {
  title: string;
  description: string;
  category: string;
  newCategory: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

const initialValues: FormValues = {
  title: "",
  description: "",
  category: "",
  newCategory: "",
  location: {
    type: "Point",
    coordinates: [0, 0],
  },
};

const CreateComplaint: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state: RootState) => state.categories);

  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};

    if (!values.title) {
      errors.title = "Title is required";
    }

    if (!values.description) {
      errors.description = "Description is required";
    }

    if (!values.category) {
      errors.category = "Category is required";
    }

    if (values.category === "new" && !values.newCategory) {
      errors.newCategory = "New category name is required";
    }

    return errors;
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const incidentFormData = new FormData();
      incidentFormData.append("title", values.title);
      incidentFormData.append("description", values.description);
      incidentFormData.append(
        "category",
        values.category === "new" ? values.newCategory : values.category
      );
      incidentFormData.append("location", JSON.stringify(values.location));
      incidentFormData.append("status", "pending");

      if (images.length > 0) {
        images.forEach((image) => {
          incidentFormData.append("images", image);
        });
      }

      const result = await dispatch(createIncident(incidentFormData)).unwrap();

      if (result) {
        setImages([]);
        setSuccess("Incident reported successfully!");
        toast.success("Incident reported successfully!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      toast.error(
        err.message || "Failed to create incident. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Create New Complaint
        </Typography>
        {categoriesError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {categoriesError}
          </Typography>
        )}
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="title"
                    name="title"
                    label="Title"
                    error={touched.title && !!errors.title}
                    helperText={touched.title && errors.title}
                    required
                    autoComplete="off"
                    aria-label="Complaint Title"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={4}
                    error={touched.description && !!errors.description}
                    helperText={touched.description && errors.description}
                    required
                    autoComplete="off"
                    aria-label="Complaint Description"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="category"
                    name="category"
                    select
                    label="Category"
                    error={touched.category && !!errors.category}
                    helperText={touched.category && errors.category}
                    disabled={categoriesLoading}
                    required
                    aria-label="Complaint Category"
                    SelectProps={{
                      startAdornment: categoriesLoading ? (
                        <CircularProgress size={20} />
                      ) : null,
                      native: false,
                      renderValue: (value: string) => value,
                    }}
                  >
                    <MenuItem value="">
                      <em>Select or enter a category</em>
                    </MenuItem>
                    {Array.isArray(categories) &&
                      categories.map((category) => (
                        <MenuItem key={category._id} value={category.name}>
                          {category.name}
                        </MenuItem>
                      ))}
                    <MenuItem value="new">
                      <em>+ Add New Category</em>
                    </MenuItem>
                  </Field>
                  {values.category === "new" && (
                    <Field
                      as={TextField}
                      fullWidth
                      id="newCategory"
                      name="newCategory"
                      label="New Category Name"
                      error={touched.newCategory && !!errors.newCategory}
                      helperText={touched.newCategory && errors.newCategory}
                      required
                      autoComplete="off"
                      aria-label="New Category Name"
                      sx={{ mt: 2 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AddPhotoAlternateIcon />}
                      aria-label="Add Images"
                    >
                      Add Images
                      <input
                        type="file"
                        hidden
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        aria-label="Image Upload"
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      {images.length} images selected
                    </Typography>
                  </Box>
                  {images.length > 0 && (
                    <Box
                      sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}
                    >
                      {images.map((image, index) => (
                        <Box
                          key={index}
                          sx={{
                            position: "relative",
                            width: 100,
                            height: 100,
                          }}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 0,
                              right: 0,
                              bgcolor: "rgba(0,0,0,0.5)",
                              color: "white",
                            }}
                            onClick={() => handleRemoveImage(index)}
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? <CircularProgress size={20} /> : null
                    }
                    aria-label="Submit Complaint"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
        {success && (
          <Typography variant="body2" color="success" sx={{ mt: 2 }}>
            {success}
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default CreateComplaint;
