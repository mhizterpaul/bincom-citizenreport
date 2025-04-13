import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  useTheme,
  useMediaQuery,
  Button,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const ComplaintCard = styled(Card)(({ theme }) => ({
  maxWidth: 345,
  margin: "0 auto",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[4],
  },
}));

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  overflow: "hidden",
  padding: theme.spacing(2),
}));

const CarouselContent = styled(Box)({
  display: "flex",
  transition: "transform 0.3s ease-in-out",
  gap: "16px",
});

const ArrowButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const LeftArrow = styled(ArrowButton)({
  left: 0,
});

const RightArrow = styled(ArrowButton)({
  right: 0,
});

export interface Incident {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  location: {
    type: string;
    coordinates: number[];
  };
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  images: string[];
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    organization: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    image?: string;
    organization: string;
  };
  createdAt: string;
  updatedAt: string;
}

const NewComplaints = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchIncidents = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await api.get("/incidents", {
        params: {
          page: page + 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });

      if (response.data.success) {
        setIncidents(response.data.data);
        setTotalPages(Math.ceil(response.data.pagination.total / 10));
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast.error("Failed to fetch incidents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(currentPage);
  }, [currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      handleNext();
    } else {
      handlePrev();
    }
  };

  const handleViewAll = () => {
    navigate("/complaints");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          New Complaints
        </Typography>
        <IconButton onClick={() => navigate("/complaints/create")}>
          <AddIcon />
        </IconButton>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleViewAll}
          sx={{ textTransform: "none" }}
        >
          View All
        </Button>
      </Box>
      <CarouselContainer>
        {!isMobile && (
          <LeftArrow
            onClick={handlePrev}
            disabled={currentPage === 0 || isLoading}
          >
            <ArrowBackIosNewIcon />
          </LeftArrow>
        )}
        <CarouselContent
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const startX = touch.clientX;

            const handleTouchMove = (e: TouchEvent) => {
              const touch = e.touches[0];
              const diff = startX - touch.clientX;

              if (Math.abs(diff) > 50) {
                handleSwipe(diff > 0 ? "left" : "right");
                document.removeEventListener("touchmove", handleTouchMove);
              }
            };

            document.addEventListener("touchmove", handleTouchMove, {
              once: true,
            });
          }}
        >
          {incidents.map((incident) => (
            <ComplaintCard key={incident._id}>
              <CardMedia
                component="img"
                height="140"
                image={incident.images?.[0] || "/placeholder-image.jpg"}
                alt={incident.title}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {incident.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {incident.description}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    color={
                      incident.status === "pending"
                        ? "warning.main"
                        : incident.status === "resolved"
                        ? "success.main"
                        : "error.main"
                    }
                  >
                    {incident.status.charAt(0).toUpperCase() +
                      incident.status.slice(1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                {incident.userId && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Avatar
                      src={incident.userId.image}
                      alt={`${incident.userId.firstName} ${incident.userId.lastName}`}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {`${incident.userId.firstName} ${incident.userId.lastName}`}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </ComplaintCard>
          ))}
        </CarouselContent>
        {!isMobile && (
          <RightArrow
            onClick={handleNext}
            disabled={currentPage === totalPages - 1 || isLoading}
          >
            <ArrowForwardIosIcon />
          </RightArrow>
        )}
      </CarouselContainer>
    </Box>
  );
};

export default NewComplaints;
