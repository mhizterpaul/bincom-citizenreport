import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Categories from "./Categories";
import { Incident } from "./NewComplaints";

const ComplaintCard = styled(Card)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  textTransform: "uppercase",
  fontSize: "0.75rem",
  height: 24,
}));

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "urgent":
      return "error";
    case "pending":
      return "warning";
    case "done":
      return "success";
    default:
      return "default";
  }
};

const Complaints = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const observer = useRef<IntersectionObserver>();

  const lastIncidentRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const calculateLimit = () => {
    const cardHeight = 200;
    const viewportHeight = window.innerHeight;
    const cardsPerView = Math.ceil(viewportHeight / cardHeight);
    return cardsPerView * 2;
  };

  const fetchIncidents = async (resetPage = false) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/incidents`,
        {
          params: {
            page: resetPage ? 1 : page,
            limit: calculateLimit(),
            sortBy: "createdAt",
            sortOrder: "desc",
            categories:
              selectedCategories.length > 0 ? selectedCategories : undefined,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        if (resetPage) {
          setIncidents(response.data.data);
          setPage(1);
        } else {
          setIncidents((prev) => [...prev, ...response.data.data]);
        }
        setHasMore(response.data.data.length === calculateLimit());
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast.error("Failed to fetch incidents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [page]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleApplyFilters = (categories: string[]) => {
    setSelectedCategories(categories);
    fetchIncidents(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "800px", margin: "0 auto" }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">New Complaint</Typography>
        <IconButton onClick={() => navigate("/complaints/create")}>
          <AddIcon />
        </IconButton>
        <IconButton
          onClick={handleFilterClick}
          sx={{ ml: "auto" }}
          color={selectedCategories.length > 0 ? "primary" : "default"}
        >
          <FilterListIcon />
        </IconButton>
      </Box>

      <Categories
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        onApplyFilters={handleApplyFilters}
      />

      <Stack spacing={2}>
        {incidents.map((incident, index) => (
          <ComplaintCard
            key={incident._id}
            ref={index === incidents.length - 1 ? lastIncidentRef : undefined}
          >
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <StatusChip
                  label={incident.status}
                  color={getStatusColor(incident.status)}
                  size="small"
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                {incident.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {incident.description}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={incident.images?.[0]}
                    alt={
                      incident.userId?.firstName
                        ? `${incident.userId.firstName} ${incident.userId.lastName}`
                        : "Anonymous User"
                    }
                  />
                  <Box>
                    <Typography variant="subtitle2">
                      {incident.userId?.firstName
                        ? `${incident.userId.firstName} ${incident.userId.lastName}`
                        : "Anonymous User"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {incident.userId?.organization || "No organization"}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </ComplaintCard>
        ))}
        {loading && (
          <Typography align="center" color="text.secondary">
            Loading more complaints...
          </Typography>
        )}
        {!hasMore && incidents.length > 0 && (
          <Typography align="center" color="text.secondary">
            No more complaints to load
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default Complaints;
