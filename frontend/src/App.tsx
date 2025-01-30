import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layouts from "./layouts/Layouts";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import AddHotel from "./pages/AddHotel";
import { useAppContext } from "./contexts/AppContext";
import MyHotel from "./pages/MyHotel";
import EditHotel from "./pages/EditHotel";
import Search from "./pages/Search";
import Details from "./pages/Details";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import Home from "./pages/Home";

function App() {
  const { isLoggedIn } = useAppContext();
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layouts>
              <Home />
            </Layouts>
          }
        />
        <Route
          path="/search"
          element={
            <Layouts>
              <Search />
            </Layouts>
          }
        />
        <Route
          path="/register"
          element={
            <Layouts>
              <Register />
            </Layouts>
          }
        />
        <Route
          path="/detail/:hotelId"
          element={
            <Layouts>
              <Details />
            </Layouts>
          }
        />
        <Route
          path="/sign-in"
          element={
            <Layouts>
              <SignIn />
            </Layouts>
          }
        />
        {isLoggedIn && (
          <>
            <Route
              path="/hotel/:hotelId/booking"
              element={
                <Layouts>
                  <Booking />
                </Layouts>
              }
            />
            <Route
              path="/add-hotel"
              element={
                <Layouts>
                  <AddHotel />
                </Layouts>
              }
            />
            <Route
              path="/edit-hotel/:hotelId"
              element={
                <Layouts>
                  <EditHotel />
                </Layouts>
              }
            />
            <Route
              path="/my-hotels"
              element={
                <Layouts>
                  <MyHotel />
                </Layouts>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <Layouts>
                  <MyBookings />
                </Layouts>
              }
            />
          </>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
