import { useEffect, useState } from "react";
import { Box, Typography, LinearProgress, styled } from "@mui/material";
import api from "../api/axios";
import { toast } from "react-toastify";

const OverviewWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  "& > * + *": {
    marginTop: theme.spacing(3),
  },
}));

const ProgressItem = styled(Box)(({ theme }) => ({
  "& > * + *": {
    marginTop: theme.spacing(1),
  },
}));

const ProgressHeader = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

interface CategoryProgress {
  id: string;
  label: string;
  value: number;
  done: number;
  color: string;
}

// Function to generate random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const Overview = () => {
  const [progress, setProgress] = useState<CategoryProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalIncidents, setTotalIncidents] = useState(0);

  useEffect(() => {
    fetchCategoriesWithProgress();
  }, []);

  const fetchCategoriesWithProgress = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const categoriesResponse = await api.get("/categories");

      if (!categoriesResponse.data.success) {
        throw new Error("Failed to fetch categories");
      }

      const categories = categoriesResponse.data.data;
      if (!Array.isArray(categories) || categories.length === 0) {
        throw new Error("No categories found");
      }

      // Fetch incidents stats
      const incidentsResponse = await api.get("/incidents/stats");

      if (!incidentsResponse.data.success) {
        throw new Error("Failed to fetch incidents stats");
      }

      const { stats, total } = incidentsResponse.data.data;

      // Combine categories with their incident counts
      const progressData = categories.map((category: any) => {
        const count = stats[category.name] || 0;
        return {
          id: category._id,
          label: category.name,
          done: count,
          value: total > 0 ? (count / total) * 100 : 0,
          color: getRandomColor(),
        };
      });

      setTotalIncidents(total);
      setProgress(progressData);
    } catch (error: any) {
      console.error("Error fetching progress data:", error);
      toast.error(error.message || "Failed to fetch progress data");
      setProgress([]);
      setTotalIncidents(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <OverviewWrapper>
        <Typography variant="h6" gutterBottom>
          Loading...
        </Typography>
      </OverviewWrapper>
    );
  }

  return (
    <OverviewWrapper>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Overview</Typography>
        <Typography variant="body2" color="text.secondary">
          Month
        </Typography>
      </Box>

      <ProgressSection>
        {progress.map((item) => (
          <ProgressItem key={item.id}>
            <ProgressHeader>
              <Typography variant="body1">{item.label}</Typography>
              <Box
                sx={{
                  backgroundColor: item.color,
                  color: "white",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                }}
              >
                {Math.round(item.value)}%
              </Box>
            </ProgressHeader>
            <LinearProgress
              variant="determinate"
              value={item.value}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${item.color}20`,
                "& .MuiLinearProgress-bar": {
                  backgroundColor: item.color,
                },
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {item.done} Done
            </Typography>
          </ProgressItem>
        ))}
        <Box sx={{ mt: 2, textAlign: "right" }}>
          <Typography variant="caption" color="text.secondary">
            Total Incidents: {totalIncidents}
          </Typography>
        </Box>
      </ProgressSection>
    </OverviewWrapper>
  );
};

export default Overview;
