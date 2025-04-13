import { Box, Container, styled } from "@mui/material";
import Header from "../components/Header";
import Overview from "../components/Overview";
import NewComplaint from "../components/NewComplaints";

const DashboardWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const Dashboard = () => {
  return (
    <DashboardWrapper>
      <Container maxWidth="lg">
        <Header />
        <Overview />
        <NewComplaint />
      </Container>
    </DashboardWrapper>
  );
};

export default Dashboard;
